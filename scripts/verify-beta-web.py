"""Wait for Cloudflare's stable beta alias to serve this checkout's public files."""
import argparse,hashlib,time,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FILES=['index.html','js/app.js','js/api.js','js/auth-account.js','js/document-library.js','js/config.js','css/styles.css']
def verify(url,attempts=1):
    for attempt in range(attempts):
        failures=[]
        for name in FILES:
            path='' if name=='index.html' else name
            try:
                request=urllib.request.Request(url.rstrip('/')+'/'+path+'?revision='+hashlib.sha256((ROOT/name).read_bytes()).hexdigest()[:16],headers={'Cache-Control':'no-cache'})
                with urllib.request.urlopen(request,timeout=20) as response:actual=response.read()
                if actual!=(ROOT/name).read_bytes():failures.append(name+': todavía no coincide')
            except (urllib.error.URLError,TimeoutError):failures.append(name+': todavía no disponible')
        if not failures:return True
        print('Comprobación',attempt+1,':','; '.join(failures),flush=True)
        if attempt+1<attempts:time.sleep(15)
    return False
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--url',required=True);p.add_argument('--attempts',type=int,default=1);args=p.parse_args()
    if not verify(args.url,args.attempts):raise SystemExit('No se ha confirmado la web nueva. Comprueba Cloudflare antes de compartirla.')
    print('Web comprobada: los archivos publicados coinciden con esta versión.')
