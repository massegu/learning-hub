"""Deploy this repository's content function through the official Management API.
No database/schema, Stripe, Auth settings or JWT-verification changes are performed.
"""
import argparse, hashlib, json, os, re, sys, urllib.error, urllib.request, uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FUNCTION='request-learning-content'

def sources():
    folder=ROOT/'supabase/functions'/FUNCTION
    files=sorted(p for p in folder.rglob('*') if p.is_file() and p.suffix in ('.js','.ts'))
    names={p.relative_to(folder).as_posix() for p in files}
    if 'index.ts' not in names:raise ValueError('Falta el archivo principal de la función.')
    for name in names:
        for match in re.finditer(r'''(?:import\s*\(\s*|from\s*)["'](\.[^"']+)["']''',(folder/name).read_text()):
            local=((folder/name).parent/match[1]).resolve()
            if local not in files:raise ValueError('Falta un módulo local: '+match[1])
    return folder,files

def multipart(folder,files):
    boundary='----LearningHub'+uuid.uuid4().hex;parts=[]
    def add(name,data,filename=None,kind='application/json'):
        disposition=f'Content-Disposition: form-data; name="{name}"'+(f'; filename="{filename}"' if filename else '')
        parts.append((f'--{boundary}\r\n{disposition}\r\nContent-Type: {kind}\r\n\r\n').encode()+data+b'\r\n')
    add('metadata',json.dumps({'entrypoint_path':'index.ts','verify_jwt':True,'name':FUNCTION}).encode())
    for p in files:add('file',p.read_bytes(),p.relative_to(folder).as_posix(),'application/typescript' if p.suffix=='.ts' else 'application/javascript')
    return b''.join(parts)+f'--{boundary}--\r\n'.encode(),f'multipart/form-data; boundary={boundary}'

class Management:
    def __init__(self,project,token):
        if not re.fullmatch('[a-z]{20}',project):raise ValueError('SUPABASE_PROJECT_REF debe ser el identificador de 20 letras del proyecto.')
        if not token:raise ValueError('Falta SUPABASE_ACCESS_TOKEN. Añádelo a los secretos de GitHub Actions o de tu entorno local.')
        self.project=project;self.token=token
    def request(self,suffix,method='GET',data=None,kind=None):
        headers={'Authorization':'Bearer '+self.token}
        if kind:headers['Content-Type']=kind
        request=urllib.request.Request('https://api.supabase.com/v1/projects/'+self.project+'/functions'+suffix,data=data,headers=headers,method=method)
        try:
            with urllib.request.urlopen(request,timeout=120) as response:
                raw=response.read()
                return json.loads(raw) if 'json' in response.headers.get('Content-Type','') else raw
        except urllib.error.HTTPError as error:
            if error.code==401:raise RuntimeError('Supabase rechazó el token: puede haber caducado o haberse revocado. La versión anterior sigue disponible.') from None
            if error.code==403:raise RuntimeError('El token necesita Edge Functions read-write para este proyecto.') from None
            detail=error.read().decode(errors='replace').replace(self.token,'[secreto]')[:1500]
            raise RuntimeError(f'Supabase HTTP {error.code}: {detail}') from None

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--check',action='store_true',help='Compila en Supabase sin sustituir la versión publicada.')
    mode.add_argument('--deploy',action='store_true',help='Guarda copia y publica, conservando la verificación JWT.')
    mode.add_argument('--access-check',action='store_true',help='Comprueba solo el acceso y la versión publicada.')
    mode.add_argument('--restore',type=Path,help='Restaura una copia .eszip de esta misma función y proyecto.')
    parser.add_argument('--project-ref',default=os.environ.get('SUPABASE_PROJECT_REF',''))
    parser.add_argument('--backup-dir',type=Path,default=ROOT/'.release-backup')
    args=parser.parse_args();api=Management(args.project_ref,os.environ.get('SUPABASE_ACCESS_TOKEN',''))
    configured=re.search(r"supabaseUrl:\s*[\"']https://([a-z]{20})\.supabase\.co[\"']",(ROOT/'js/config.js').read_text())
    if not configured or configured[1]!=args.project_ref:raise ValueError('El proyecto de publicación no coincide con el Supabase de js/config.js. Revisa ambos antes de publicar.')
    current=api.request('/'+FUNCTION)
    if args.access_check:
        print(json.dumps({'access':'ok','function':FUNCTION,'version':current['version'],'status':current['status']}));return
    if args.restore:
        metadata=json.loads(args.restore.with_suffix('.json').read_text())
        if metadata.get('_project_ref')!=args.project_ref or metadata.get('slug')!=FUNCTION:raise ValueError('La copia no corresponde a este proyecto y función.')
        raw=args.restore.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=metadata.get('_backup_sha256'):raise ValueError('La copia no coincide con su huella de integridad.')
        result=api.request('/'+FUNCTION+'?verify_jwt=true','PATCH',raw,'application/vnd.denoland.eszip')
    else:
        folder,files=sources();body,kind=multipart(folder,files)
        result=api.request('/deploy?slug='+FUNCTION+'&bundleOnly=true','POST',body,kind)
        after_check=api.request('/'+FUNCTION)
        if after_check['version']!=current['version']:raise RuntimeError('Cambió la versión remota durante la comprobación. Revisa los despliegues antes de continuar.')
        if args.check:
            print(json.dumps({'compile':'ok','source_files':len(files),'published_version_unchanged':current['version']}));return
        args.backup_dir.mkdir(mode=0o700,parents=True,exist_ok=True)
        backup=api.request('/'+FUNCTION+'/body');current['_project_ref']=args.project_ref
        current['_backup_sha256']=hashlib.sha256(backup).hexdigest()
        stem=args.backup_dir/(FUNCTION+'-v'+str(current['version']))
        for suffix,data in [('.eszip',backup),('.json',json.dumps(current,indent=2).encode())]:
            fd=os.open(str(stem)+suffix,os.O_CREAT|os.O_WRONLY|os.O_TRUNC,0o600)
            with os.fdopen(fd,'wb') as f:f.write(data)
        result=api.request('/deploy?slug='+FUNCTION,'POST',body,kind)
    published=api.request('/'+FUNCTION)
    if published.get('status')!='ACTIVE' or published.get('verify_jwt') is not True or published.get('ezbr_sha256')!=result.get('ezbr_sha256'):
        raise RuntimeError('No se pudo confirmar la publicación. La web no debe promoverse; revisa el registro y la copia guardada.')
    print(json.dumps({'deploy':'ok','function':FUNCTION,'version':published['version'],'verify_jwt':True}))

if __name__=='__main__':
    try:main()
    except (ValueError,RuntimeError,urllib.error.URLError) as error:
        print('ERROR:',str(error),file=sys.stderr);sys.exit(1)
