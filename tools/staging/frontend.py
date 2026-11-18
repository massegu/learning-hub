"""Build a separate staging web artifact offline. Never changes beta configuration."""
import argparse
import html
import json
from pathlib import Path
import re
import shutil
import subprocess

from .common import (ROOT, GuardError, canonical, digest, load_manifest, output_directory,
                     production_markers, require, tool_digest, validate_manifest, write_private)


def scan_artifact(directory, manifest, root=ROOT):
    operational, ref = production_markers(root)
    markers = [ref, *operational.values()]
    files = {}
    for path in Path(directory).rglob('*'):
        require(not path.is_symlink(), 'Artifact symlink refused')
        if not path.is_file():
            continue
        data = path.read_bytes()
        require(not any(value.encode().lower() in data.lower() for value in markers if value), 'Operational value found in artifact')
        if path.suffix.lower() in ('.js','.html','.css','.json'):
            text = data.decode('utf-8')
            require(not re.search(r'\bsb_secret_[A-Za-z0-9_-]+|-----BEGIN .*PRIVATE KEY-----', text), 'Secret-shaped artifact value')
            for host in re.findall(r'https?://([a-z0-9.-]+\.supabase\.co)', text, re.I):
                require(host.lower() == manifest['project_ref']+'.supabase.co', 'Unapproved API/Auth/Edge destination')
            require(not re.search(r'https?://(?:api|checkout|billing)\.stripe\.com', text, re.I), 'Payment connection in artifact')
        files[path.relative_to(directory).as_posix()] = digest(data)
    return files


def build(manifest, sdk, output, root=ROOT):
    validate_manifest(manifest, root)
    clean = subprocess.run(['git','diff','--quiet',manifest['source_commit'],'--','index.html','js','css','assets'],cwd=root)
    require(clean.returncode == 0, 'Web source differs from the pinned release')
    extra = subprocess.run(['git','ls-files','--others','--','index.html','js','css','assets'],cwd=root,capture_output=True)
    require(extra.returncode == 0 and not extra.stdout, 'Untracked web source refused')
    sdk = Path(sdk)
    require(sdk.is_file() and not sdk.is_symlink() and digest(sdk.read_bytes()) == manifest['sdk_sha256'], 'SDK integrity mismatch')
    license_path = sdk.parent.parent.parent/'LICENSE'
    require(license_path.is_file(), 'Pinned SDK license missing')
    config = (root/'js/config.js').read_text()
    match = re.search(r'window\.LH_CONFIG\s*=\s*\{.*?\};',config,re.S)
    require(match is not None and len(re.findall(r'window\.LH_CONFIG\s*=',config)) == 1, 'Unexpected web configuration format')
    staged = {'supabaseUrl':manifest['api_url'],'supabaseKey':manifest['publishable_key'],
              'supportEmail':'','stripeMode':'test','staging':True,'billingEnabled':False}
    config = config[:match.start()]+'window.LH_CONFIG = Object.freeze('+json.dumps(staged)+');'+config[match.end():]
    api = (root/'js/api.js').read_text()
    start, end = api.find('  async function openBilling(action){'), api.find('  API.requestContent=')
    require(start >= 0 and end > start and api.count('  async function openBilling(action){') == 1, 'Unexpected billing API format')
    api = (api[:start]+"  const billingDisabled=async()=>{throw new Error('GLIAX STAGING: pagos desactivados');};\n"
           "  API.openStripeCheckout=billingDisabled;\n  API.openBillingPortal=billingDisabled;\n"+api[end:])
    target = output_directory(output,root)
    try:
        for directory in ['js','css','assets']:
            source = root/directory
            require(not source.is_symlink(), 'Source symlink refused')
            for path in source.rglob('*'):
                require(not path.is_symlink(), 'Source symlink refused')
                require(not any(part.startswith('.') for part in path.relative_to(root).parts), 'Hidden source file refused')
            shutil.copytree(source,target/directory)
        shutil.copyfile(root/'index.html',target/'index.html')
        (target/'js/config.js').write_text(config)
        (target/'js/api.js').write_text(api)
        vendor = target/'js/vendor'; vendor.mkdir(exist_ok=True)
        shutil.copyfile(sdk,vendor/'supabase.js')
        shutil.copyfile(license_path,vendor/'LICENSE.supabase-js')
        guard = (Path(__file__).parent/'browser_guard.js').read_text()
        require(guard.count('__STAGING_POLICY__') == 1, 'Unexpected guard template')
        (target/'js/staging-guard.js').write_text(guard.replace('__STAGING_POLICY__',json.dumps({'apiOrigin':manifest['api_url'],'webOrigin':manifest['web_origin']})))
        csp = ("default-src 'self'; connect-src 'self' "+manifest['api_url']+"; "
               "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; "
               "img-src 'self' data: blob:; font-src 'self' data:; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'")
        for path in target.rglob('*.html'):
            source = path.read_text()
            injected = '<meta http-equiv="Content-Security-Policy" content="'+html.escape(csp,quote=True)+'"><script src="/js/staging-guard.js"></script>'
            if re.search(r'<head(?:\s[^>]*)?>',source,re.I):
                source = re.sub(r'<head(?:\s[^>]*)?>',lambda m:m[0]+injected,source,count=1,flags=re.I)
            else:
                # Authored documents validly omit the optional head tag. Open it
                # before their existing metadata; HTML parsing closes it at body.
                require(re.search(r'<html(?:\s[^>]*)?>',source,re.I) is not None, 'HTML entry has no document element')
                source = re.sub(r'<html(?:\s[^>]*)?>',lambda m:m[0]+'<head>'+injected,source,count=1,flags=re.I)
            source = source.replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2','/js/vendor/supabase.js')
            source = re.sub(r'<title>', '<title>GLIAX STAGING / TEST — ',source,count=1,flags=re.I)
            path.write_text(source)
        files = scan_artifact(target,manifest,root)
        write_private(target/'staging-artifact.json', {'kind':'staging-web-artifact','manifest_digest':digest(canonical(manifest)),
                      'tool_digest':tool_digest(),
                      'source_commit':manifest['source_commit'],'billing_enabled':False,'sha256':files})
        scan_artifact(target,manifest,root)
    except Exception:
        shutil.rmtree(target)
        raise
    return {'status':'PASSED','basis':'OFFLINE_WEB_BUILD','files':len(files),'remote_operations':0}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest',required=True)
    parser.add_argument('--sdk',required=True)
    parser.add_argument('--output',required=True)
    args=parser.parse_args()
    try:
        print(json.dumps(build(load_manifest(args.manifest),args.sdk,args.output)))
    except (GuardError,OSError,ValueError):
        parser.exit(2,'Staging artifact refused; inspect private inputs and pinned assets.\n')


if __name__=='__main__':
    main()
