"""The web gate must distinguish network failures, HTTP blocks and stale files."""
import contextlib
import importlib.util
import io
import unittest
import urllib.error
from email.message import Message
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('beta_web', Path(__file__).resolve().parents[1] / 'scripts/verify-beta-web.py')
web = importlib.util.module_from_spec(spec)
spec.loader.exec_module(web)


class Response:
    def __init__(self, data, url):
        self.data, self.url = data, url
        self.headers = {'Content-Type': 'text/html'}
    def __enter__(self): return self
    def __exit__(self, *_): pass
    def read(self): return self.data
    def geturl(self): return self.url


class BetaWeb(unittest.TestCase):
    def run_gate(self, **kwargs):
        output = io.StringIO()
        with patch.object(web, 'FILES', ['index.html']), patch.object(web.urllib.request, 'urlopen', **kwargs), contextlib.redirect_stdout(output):
            result = web.verify('https://example.test')
        return result, output.getvalue()

    def test_exact_content_passes(self):
        result, output = self.run_gate(side_effect=lambda req, **_: Response((web.ROOT/'index.html').read_bytes(), req.full_url))
        self.assertTrue(result)
        self.assertEqual(output, '')

    def test_http_block_includes_status_and_safe_metadata(self):
        headers = Message()
        headers['CF-Ray'] = 'ray-test'
        headers['CF-Mitigated'] = 'challenge'
        headers['Set-Cookie'] = 'must-not-appear'
        error = urllib.error.HTTPError('https://example.test', 403, 'Forbidden', headers, None)
        result, output = self.run_gate(side_effect=error)
        self.assertFalse(result)
        self.assertIn('HTTP 403 Forbidden', output)
        self.assertIn('CF-Ray=ray-test', output)
        self.assertIn('CF-Mitigated=challenge', output)
        self.assertNotIn('must-not-appear', output)

    def test_proxy_error_is_not_mislabelled_cloudflare_http_error(self):
        result, output = self.run_gate(side_effect=urllib.error.URLError('Tunnel connection failed: 403 Forbidden'))
        self.assertFalse(result)
        self.assertIn('error de conexión: Tunnel connection failed', output)
        self.assertNotIn('HTTP 403', output)

    def test_timeout_has_its_own_message(self):
        result, output = self.run_gate(side_effect=TimeoutError())
        self.assertFalse(result)
        self.assertIn('tiempo de espera agotado', output)

    def test_200_login_or_challenge_is_not_success_and_body_is_not_logged(self):
        result, output = self.run_gate(return_value=Response(b'<secret-login-body>', 'https://access.example.test'))
        self.assertFalse(result)
        self.assertIn('contenido distinto', output)
        self.assertIn('hubo redirección', output)
        self.assertNotIn('secret-login-body', output)
