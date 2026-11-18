"""Prepare a manifest-bound SQL package; execute ONLY in a labeled offline sandbox."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile

from .common import (ROOT, SQL_FILES, GuardError, canonical, digest, load_manifest,
                     output_directory, private_json, require, tool_digest, write_private)


def prepare(manifest, output, root=ROOT):
    # Callers also validate; revalidate at the mutation boundary.
    from .common import validate_manifest
    validate_manifest(manifest, root)
    needle = "current_setting('gliax.local_baseline',true) is distinct from 'on'"
    replacement = ("current_setting('gliax.staging_baseline',true) is distinct from 'on'\n"
                   " or current_setting('gliax.staging_project_ref',true) is distinct from '"+manifest['project_ref']+"'")
    files = {}
    for name in SQL_FILES:
        source = (root/'supabase/baselines'/name).read_text()
        require(source.count(needle) == 1, 'Unexpected baseline guard; review source')
        files[name] = source.replace(needle, replacement).encode()
    target = output_directory(output, root)
    for name, data in files.items():
        write_private(target/name, data)
    plan = {'version': 1, 'kind': 'staging-install-package',
            'tool_digest':tool_digest(),
            'manifest_digest': digest(canonical(manifest)), 'source_commit': manifest['source_commit'],
            'sql_sha256': {name: digest(data) for name, data in files.items()},
            'execution': 'OFFLINE_SANDBOX_ONLY', 'historical_migrations': []}
    write_private(target/'plan.json', plan)
    return plan


def verify_package(manifest, package, root=ROOT):
    from .common import validate_manifest
    validate_manifest(manifest, root)
    package = Path(package)
    require(not package.is_symlink() and package.resolve().is_relative_to((root.parent/'work').resolve()), 'Package must remain under sibling work/')
    plan = private_json(package/'plan.json', root)
    require(plan.get('kind') == 'staging-install-package' and plan.get('execution') == 'OFFLINE_SANDBOX_ONLY'
            and plan.get('tool_digest') == tool_digest()
            and plan.get('historical_migrations') == []
            and plan.get('manifest_digest') == digest(canonical(manifest))
            and plan.get('source_commit') == manifest['source_commit'], 'Package/manifest binding mismatch')
    require(set(plan.get('sql_sha256', {})) == set(SQL_FILES), 'Incomplete SQL package')
    files = []
    needle = "current_setting('gliax.local_baseline',true) is distinct from 'on'"
    replacement = ("current_setting('gliax.staging_baseline',true) is distinct from 'on'\n"
                   " or current_setting('gliax.staging_project_ref',true) is distinct from '"+manifest['project_ref']+"'")
    for name in SQL_FILES:
        path = package/name
        require(not path.is_symlink(), 'SQL package symlink refused')
        data = path.read_bytes()
        expected = (root/'supabase/baselines'/name).read_text().replace(needle, replacement).encode()
        require(data == expected and digest(data) == plan['sql_sha256'][name], 'SQL package integrity mismatch')
        files.append(data.decode())
    return files


def docker(arguments, **kwargs):
    # Never inherit a remote Docker context/host or database/CLI credentials.
    require(not os.environ.get('DOCKER_HOST') and not os.environ.get('DOCKER_CONTEXT'), 'Inherited Docker target refused')
    env = {key: os.environ[key] for key in ('PATH', 'LANG', 'LC_ALL') if key in os.environ}
    with tempfile.TemporaryDirectory(prefix='staging-docker-',dir=ROOT.parent/'work') as config:
        return subprocess.run(['docker', '--config', config, '--host', 'unix:///var/run/docker.sock', *arguments],
                              env=env, capture_output=True, check=False, **kwargs)


def attest_sandbox(manifest, container):
    require(container.startswith('gliax-staging-sandbox-') and container.replace('-', '').isalnum(), 'Explicit sandbox container required')
    result = docker(['inspect', '--type', 'container', container])
    require(result.returncode == 0, 'Cannot inspect local sandbox')
    info = json.loads(result.stdout)[0]
    labels = info['Config'].get('Labels') or {}
    require(info['State']['Running'] and info['HostConfig']['NetworkMode'] == 'none'
            and set(info['NetworkSettings']['Networks']) == {'none'}
            and not info['HostConfig'].get('PortBindings'), 'Sandbox must have no network or published ports')
    expected = {'gliax.staging.scope': 'local-test', 'gliax.staging.project_ref': manifest['project_ref'],
                'gliax.staging.api_host': manifest['api_url'].removeprefix('https://'),
                'gliax.staging.db_host': manifest['database']['host']}
    require(all(labels.get(k) == v for k, v in expected.items()), 'Sandbox destination attestation mismatch')
    return info['Id']


def apply_local(manifest, package, container, root=ROOT):
    files = verify_package(manifest, package, root)
    identity_id = attest_sandbox(manifest, container)  # before any database connection or SQL
    identity = docker(['exec', identity_id, 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-Atq',
                       '-v', 'ON_ERROR_STOP=1', '-c',
                       "select current_database()||'|'||current_user||'|'||(inet_server_addr() is null)::text"], text=True)
    require(identity.returncode == 0 and identity.stdout.strip() == 'postgres|postgres|true', 'Database connection identity refused')
    for source in files:
        require(attest_sandbox(manifest, container) == identity_id, 'Sandbox identity changed')
        prefix = ("set gliax.staging_baseline='on';\nset gliax.staging_project_ref='"+manifest['project_ref']+"';\n")
        result = docker(['exec', '-i', identity_id, 'psql', '-X', '-U', 'postgres', '-d', 'postgres',
                         '-Atq', '-v', 'ON_ERROR_STOP=1'], text=True, input=prefix+source)
        require(result.returncode == 0, 'Local sandbox installation failed; no automatic retry')
    return {'status': 'PASSED', 'basis': 'LOCAL_SQL_SANDBOX', 'files_applied': len(files),
            'remote_operations': 0, 'historical_migrations': []}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=['prepare', 'validate', 'apply-local'])
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--package', required=True)
    parser.add_argument('--container')
    args = parser.parse_args()
    try:
        manifest = load_manifest(args.manifest)
        if args.phase == 'prepare':
            prepare(manifest, args.package)
            result = {'status': 'PASSED', 'basis': 'OFFLINE_PACKAGE', 'remote_operations': 0}
        elif args.phase == 'validate':
            verify_package(manifest, args.package)
            result = {'status': 'PASSED', 'basis': 'OFFLINE_INTEGRITY', 'remote_operations': 0}
        else:
            require(args.container is not None, 'Explicit local container required')
            result = apply_local(manifest, args.package, args.container)
        print(json.dumps(result))
    except (GuardError, OSError, ValueError, KeyError):
        parser.exit(2, 'Staging installer refused the operation; check the private inputs and local prerequisites.\n')


if __name__ == '__main__':
    main()
