"""Local editorial review: real app + real Edge handler; fake account and database.
Run with Python 3 and Node >=22.13. No production credentials or service calls.
"""
import functools
import http.server
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import threading
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
from browser_support import SDK

def prepare():
    node = shutil.which('node')
    if not node:
        raise RuntimeError('Instala Node.js 24 LTS, cierra la terminal y vuelve a ejecutar este comando.')
    version = subprocess.check_output([node, '--version'], text=True).strip()
    parts = tuple(map(int, version.lstrip('v').split('.')[:2]))
    if parts < (22, 13):
        raise RuntimeError('Se necesita Node.js 22.13 o posterior. Instala Node.js 24 LTS.')
    libraries = [ROOT/'node_modules/docx/build/index.umd.js', ROOT/'node_modules/jszip/dist/jszip.min.js']
    if not all(p.exists() for p in libraries):
        npm = shutil.which('npm.cmd' if sys.platform == 'win32' else 'npm')
        if not npm:
            raise RuntimeError('No se encuentra npm. Reinstala Node.js 24 LTS.')
        print('Instalando las bibliotecas locales para las fichas...', flush=True)
        subprocess.run([npm, 'ci', '--ignore-scripts'], cwd=ROOT, check=True)
    return node

class ReviewServer(http.server.ThreadingHTTPServer):
    def __init__(self, address, node):
        self.workers = {}
        self.worker_lock = threading.Lock()
        self.node = node
        super().__init__(address, functools.partial(Handler, directory=str(ROOT)))

    def content(self, body):
        route = body.get('profile_id')
        if route not in ['early', 'junior', 'primary', 'middle', 'teen']:
            return {'status':400, 'data':{'error':'Elige uno de los cinco perfiles de prueba.'}}
        with self.worker_lock:
            if route not in self.workers:
                self.workers[route] = subprocess.Popen([self.node, 'tests/edge-worker.js', route], cwd=ROOT,
                    stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding='utf-8')
            worker = self.workers[route]
            worker.stdin.write(json.dumps(body)+'\n')
            worker.stdin.flush()
            result = worker.stdout.readline()
            if not result:
                raise RuntimeError('La función local se ha detenido. Revisa la terminal.')
            return json.loads(result)

    def server_close(self):
        for worker in self.workers.values():
            worker.terminate()
            worker.wait(timeout=5)
        super().server_close()

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send(self, data, kind='text/html; charset=utf-8', status=200):
        if isinstance(data, str):
            data = data.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ['/', '/index.html']:
            html = (ROOT/'index.html').read_text(encoding='utf-8')
            html = html.replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', '/__review/sdk.js')
            html = html.replace('https://unpkg.com/docx@8.5.0/build/index.umd.js', '/__review/docx.js')
            html = html.replace('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', '/__review/jszip.js')
            html = html.replace('<body>', '<body><div role="status" style="padding:12px;background:#ffedb8;color:#263954;text-align:center">PRUEBA LOCAL · Contenido de esta rama · Perfiles ficticios · Sin conexión a Supabase</div>')
            html = html.replace('</head>', '<style>#subscribeBtn,#billingPortalBtn,#signOutBtn,.profile-actions{display:none!important}</style></head>')
            return self.send(html)
        if path == '/__review/sdk.js':
            sdk = SDK.replace('const count=body.questions||body.count||1;', '''const reply=await (await fetch('/__review/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json();
              if(reply.status!==200)return {error:{message:reply.data.error}};
              return {data:reply.data,error:null};
              const count=body.questions||body.count||1;''')
            return self.send(sdk, 'application/javascript; charset=utf-8')
        libraries = {'/__review/docx.js':'node_modules/docx/build/index.umd.js', '/__review/jszip.js':'node_modules/jszip/dist/jszip.min.js'}
        if path in libraries:
            return self.send((ROOT/libraries[path]).read_bytes(), 'application/javascript')
        # Only static app assets. No repository metadata, credentials or test files.
        target = (ROOT/path.lstrip('/')).resolve()
        if not target.is_relative_to(ROOT) or not re.match(r'^/(?:js|css|assets|data)/', path) or not target.is_file() or target.suffix not in ['.js','.css','.png','.svg','.jpg','.webp','.woff','.woff2']:
            return self.send('No encontrado', 'text/plain', 404)
        return self.send(target.read_bytes(), self.guess_type(str(target))+'; charset=utf-8')

    def do_POST(self):
        if self.path != '/__review/content':
            return self.send('{}', 'application/json', 404)
        if self.headers.get('Origin') not in [None, f'http://{self.headers.get("Host")}']:
            return self.send('{}', 'application/json', 403)
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length < 65536:
                return self.send('{}', 'application/json', 400)
            body = json.loads(self.rfile.read(length))
            result = self.server.content(body)
            self.send(json.dumps(result), 'application/json')
        except Exception as error:
            self.send(json.dumps({'status':500,'data':{'error':str(error)}}), 'application/json')

if __name__ == '__main__':
    try:
        node = prepare()
        with ReviewServer(('127.0.0.1', 8001), node) as server:
            print('Prueba local lista. Escribe http://localhost:8001 en tu navegador.', flush=True)
            print('Elige Sol (6–7), Alex (8–10), Luis (10–12), Clara (13–15) o Nora (16–18).', flush=True)
            print('No uses tu cuenta real. Para cerrar: Ctrl+C. Reiniciar borra el historial del servidor de prueba.', flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except Exception as error:
        print(f'No se pudo iniciar: {error}', file=sys.stderr)
        sys.exit(1)
