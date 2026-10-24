"""Compare the stable Cloudflare beta with this checkout, without publishing anything."""
import argparse
import hashlib
import socket
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ['index.html', 'js/app.js', 'js/api.js', 'js/auth-account.js',
         'js/document-library.js', 'js/curriculum.js', 'js/docx.js',
         'js/activity-model.js', 'js/early-content.js', 'js/content-policy.js', 'js/photo-library.js',
         'js/stimulus-art.js', 'js/stimulus-art-png.js',
         'js/privacy-controls.js', 'js/config.js', 'js/v16_7.js', 'js/v16_8.js', 'js/v16_10.js', 'css/styles.css',
         *sorted(p.relative_to(ROOT).as_posix() for p in (ROOT/'assets/documents').glob('*.png')),
         'assets/photos/kitchen-a.png', 'assets/photos/kitchen-b.png',
         'assets/photos/living-a.png', 'assets/photos/living-b.png',
         *[f'assets/photos/{name}-{variant}.png' for name in ['desk','picnic','market','entry'] for variant in ['a','b']],
         *[f'assets/photos/{name}-{variant}.png' for name in ['street','park','bus','factory','nature','city'] for variant in ['a','b']],
         *[f'assets/photos/{name}-{variant}.png' for name in ['cafe','sports'] for variant in ['a','b']],
         'assets/icons/adventure-areas.png', 'assets/icons/learning-areas-3d.png', 'js/early-journey.js', 'js/school-journey.js']


def fingerprint(data):
    return hashlib.sha256(data).hexdigest()[:16]


def http_detail(error):
    # Only selected response metadata: never log bodies, cookies or credentials.
    details = [f'HTTP {error.code} {error.reason}']
    for key in ['Server', 'CF-Ray', 'CF-Mitigated', 'Content-Type']:
        value = error.headers.get(key) if error.headers else None
        if value:
            details.append(f'{key}={value}')
    return ', '.join(details)


def verify(url, attempts=1):
    for attempt in range(attempts):
        failures = []
        for name in FILES:
            path = '' if name == 'index.html' else name
            expected = (ROOT / name).read_bytes()
            target = url.rstrip('/') + '/' + path + '?revision=' + fingerprint(expected)
            try:
                request = urllib.request.Request(target, headers={
                    'Cache-Control': 'no-cache',
                    'User-Agent': 'LearningLab-Beta-Verification/1.0',
                })
                with urllib.request.urlopen(request, timeout=20) as response:
                    actual = response.read()
                    content_type = response.headers.get('Content-Type', 'desconocido')
                    redirected = response.geturl() != target
                if actual != expected:
                    failures.append(f'{name}: contenido distinto '
                                    f'(esperado {fingerprint(expected)}, recibido {fingerprint(actual)}; '
                                    f'{len(actual)} bytes; {content_type}'
                                    f'{"; hubo redirección" if redirected else ""})')
            except urllib.error.HTTPError as error:
                failures.append(f'{name}: {http_detail(error)}')
            except (TimeoutError, socket.timeout):
                failures.append(f'{name}: tiempo de espera agotado (20 s)')
            except urllib.error.URLError as error:
                # reason describes DNS/TLS/proxy failures, rather than implying
                # that Cloudflare itself returned an HTTP failure.
                failures.append(f'{name}: error de conexión: {error.reason}')
        if not failures:
            return True
        print('Comprobación', attempt + 1, ':', '; '.join(failures), flush=True)
        if attempt + 1 < attempts:
            time.sleep(15)
    return False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', required=True)
    parser.add_argument('--attempts', type=int, default=1)
    args = parser.parse_args()
    if not 1 <= args.attempts <= 20:
        parser.error('--attempts debe estar entre 1 y 20')
    if not verify(args.url, args.attempts):
        raise SystemExit('No se ha confirmado la web nueva. Revisa los errores anteriores: '
                         'este paso no determina por sí solo si falló la publicación de Supabase.')
    print('Web comprobada: los archivos publicados coinciden con esta versión.')
