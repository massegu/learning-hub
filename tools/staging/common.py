"""Shared, fail-closed destination validation. This module never opens a socket."""
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
SQL_FILES = ('gliax-local-functional.sql', 'local-privileges.sql', 'local-content-compatibility.sql')


class GuardError(ValueError):
    pass


class RemoteDisabled(GuardError):
    pass


def digest(value):
    return hashlib.sha256(value).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':')).encode()


def tool_digest():
    files=sorted(p for p in Path(__file__).parent.iterdir() if p.suffix in ('.py','.js'))
    return digest(canonical({p.name:digest(p.read_bytes()) for p in files}))


def require(condition, message):
    if not condition:
        raise GuardError(message)


def origin(value):
    require(isinstance(value, str) and not re.search(r'[\s\\%]', value), 'Invalid origin')
    p = urlsplit(value)
    require(p.scheme == 'https' and p.hostname and not p.username and not p.password
            and not p.query and not p.fragment and not p.path and p.port is None, 'Expected canonical HTTPS origin')
    require(bool(re.fullmatch(r'[a-z0-9.-]+', p.hostname)), 'Invalid hostname')
    require(value == 'https://' + p.hostname, 'Noncanonical origin')
    return value


def production_markers(root=ROOT):
    source = (root/'js/config.js').read_text()
    fields = {}
    for name in ('supabaseUrl', 'supabaseKey', 'supportEmail'):
        match = re.search(r'\b' + name + r'\s*:\s*["\']([^"\']+)["\']', source)
        require(match is not None, 'Cannot establish operational denylist')
        fields[name] = match[1]
    match = re.fullmatch(r'https://([a-z]{20})\.supabase\.co', fields['supabaseUrl'])
    require(match is not None, 'Cannot establish operational project identity')
    return fields, match[1]


def private_json(path, root=ROOT):
    path = Path(path)
    require(not path.is_symlink(), 'Private file cannot be a symlink')
    require(not path.resolve().is_relative_to(root.resolve()), 'Private files must remain outside the repository')
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        info = os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid()
                and not (stat.S_IMODE(info.st_mode) & 0o077), 'Private file requires owner-only permissions')
        with os.fdopen(fd, 'r') as f:
            fd = None
            value = json.load(f)
    finally:
        if fd is not None:
            os.close(fd)
    return value


def validate_manifest(value, root=ROOT):
    required = {'schema_version', 'environment', 'project_ref', 'api_url', 'database',
                'web_origin', 'web_path', 'publishable_key', 'billing_enabled', 'qa_emails',
                'production_web_origins', 'source_commit', 'sql_sha256', 'sdk_sha256'}
    require(isinstance(value, dict) and set(value) == required, 'Manifest fields missing or unknown; no credentials allowed')
    require(type(value['schema_version']) is int and value['schema_version'] == 1
            and value['environment'] == 'staging', 'Unsupported manifest')
    ref = value['project_ref']
    require(isinstance(ref, str) and bool(re.fullmatch('[a-z]{20}', ref)), 'Explicit project ID required')
    operational, forbidden = production_markers(root)
    require(ref != forbidden, 'Operational project is forbidden')
    require(value['api_url'] == 'https://' + ref + '.supabase.co', 'Project ID/API URL mismatch')
    origin(value['api_url'])
    db = value['database']
    require(isinstance(db, dict) and set(db) == {'host', 'port', 'name', 'user', 'sslmode'}, 'Explicit database fields required')
    require(db == {'host': 'db.' + ref + '.supabase.co', 'port': 5432, 'name': 'postgres',
                   'user': 'postgres', 'sslmode': 'verify-full'}, 'Database identity mismatch or unsupported connection type')
    require(type(db['port']) is int, 'Invalid database port')
    web = origin(value['web_origin'])
    require(value['web_path'] == '/', 'Only an explicit root-path preview is supported')
    denied = value['production_web_origins']
    require(isinstance(denied, list) and len(denied) > 0 and all(origin(x) for x in denied), 'Operational web origins must be supplied')
    require(web not in denied and web not in (value['api_url'], operational['supabaseUrl']), 'Operational or API web origin forbidden')
    key = value['publishable_key']
    require(isinstance(key, str) and bool(re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]{12,}', key)), 'A publishable key is required')
    require(key != operational['supabaseKey'], 'Operational API key forbidden')
    require(value['billing_enabled'] is False, 'Only the no-billing stage is authorized')
    emails = value['qa_emails']
    require(isinstance(emails, list) and len(emails) == 2
            and all(isinstance(e, str) and re.fullmatch(r'[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+', e) for e in emails)
            and len(set(emails)) == 2, 'Two distinct QA mailboxes required')
    require(isinstance(value['source_commit'], str) and bool(re.fullmatch('[0-9a-f]{40}', value['source_commit'])), 'Full source commit required')
    result = subprocess.run(['git', 'cat-file', '-e', value['source_commit']+'^{commit}'], cwd=root, capture_output=True)
    require(result.returncode == 0, 'Source commit unavailable locally')
    pinned = subprocess.run(['git','show',value['source_commit']+':js/config.js'],cwd=root,capture_output=True)
    require(pinned.returncode == 0 and pinned.stdout == (root/'js/config.js').read_bytes(), 'Operational denylist source differs from pinned release')
    hashes = value['sql_sha256']
    require(isinstance(hashes, dict) and set(hashes) == set(SQL_FILES), 'All three SQL hashes required')
    for name in SQL_FILES:
        data = (root/'supabase/baselines'/name).read_bytes()
        require(hashes[name] == digest(data), 'Baseline hash mismatch')
        released = subprocess.run(['git', 'show', value['source_commit']+':supabase/baselines/'+name], cwd=root, capture_output=True)
        require(released.returncode == 0 and released.stdout == data, 'Baseline differs from pinned source')
    require(isinstance(value['sdk_sha256'], str) and bool(re.fullmatch('[0-9a-f]{64}', value['sdk_sha256'])), 'SDK hash required')
    return value


def load_manifest(path, root=ROOT):
    return validate_manifest(private_json(path, root), root)


def output_directory(path, root=ROOT):
    path = Path(path).absolute()
    require(not (root.parent/'work').is_symlink(), 'Work directory symlink refused')
    for parent in (path,*path.parents):
        require(not parent.is_symlink(), 'Output path symlink refused')
    allowed = (root.parent/'work').resolve()
    require(not path.is_symlink() and path.resolve().is_relative_to(allowed)
            and path.resolve() != allowed, 'Output must be a new directory under sibling work/')
    require(not path.exists(), 'Output exists; refusing overwrite')
    path.mkdir(mode=0o700, parents=True)
    return path


def write_private(path, data):
    data = canonical(data) if not isinstance(data, bytes) else data
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'wb') as f:
        f.write(data)


def remote_operation(*unused, **kwargs):
    raise RemoteDisabled('Remote execution is not implemented or authorized in this release')
