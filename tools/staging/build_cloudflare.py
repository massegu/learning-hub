"""Fail-closed Cloudflare Pages build for GLIAX staging only.

Required Cloudflare build environment:
 GLIAX_STAGING_REF, GLIAX_STAGING_PUBLISHABLE_KEY, GLIAX_STAGING_ORIGIN.
Build: npm ci --ignore-scripts --include=dev && python3 tools/staging/build_cloudflare.py
Output: dist-gliax-staging
Never use this builder for production.
"""
import hashlib
import html
import json
import os
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "dist-gliax-staging"
EXPECTED_REF = "wejcfaralctolzxjbcil"
OUTPUT_DIRS = ("js", "css", "assets")
DOCX_SOURCE_URL = "https://unpkg.com/docx@8.5.0/build/index.umd.js"
DOCX_PUBLIC_DIR = "js/vendor/docx-8.5.0"
DOCX_FILES = {
    "build/index.umd.js": "02d568d203c0180af37609bcf5ff6c0919d220f933a88ca896eba0556a08faad",
    "LICENSE": "b5b2364c0c95a26b2a2399d7e706a61acac680be1d5b180b00592ee85830bffb",
}


def check(condition, message):
    if not condition:
        raise RuntimeError(message)


def origin(value):
    parsed = urlsplit(value)
    check(
        parsed.scheme == "https" and bool(parsed.hostname)
        and not parsed.username and not parsed.password
        and not parsed.query and not parsed.fragment
        and parsed.port is None and parsed.path in ("", "/")
        and value == "https://" + parsed.hostname,
        "Invalid canonical HTTPS staging origin",
    )
    return value


def install_docx():
    loader = OUT / "js/docx.js"
    source = loader.read_text(encoding="utf-8")
    check(source.count(DOCX_SOURCE_URL) == 1, "Unexpected DOCX loader URL")
    package = ROOT / "node_modules/docx"
    public_dir = OUT / DOCX_PUBLIC_DIR
    public_dir.mkdir(parents=True)
    for name, expected in DOCX_FILES.items():
        path = package / name
        check(path.is_file(), "DOCX 8.5.0 missing; run npm ci --ignore-scripts --include=dev")
        data = path.read_bytes()
        check(hashlib.sha256(data).hexdigest() == expected, f"DOCX 8.5.0 integrity mismatch: {name}")
        (public_dir / path.name).write_bytes(data)
    loader.write_text(
        source.replace(DOCX_SOURCE_URL, f"/{DOCX_PUBLIC_DIR}/index.umd.js"),
        encoding="utf-8",
    )


def build():
    # Remove stale output first; a failed build cannot leave a usable old artifact.
    if OUT.exists():
        check(not OUT.is_symlink(), "Output symlink refused")
        shutil.rmtree(OUT)

    ref = os.environ.get("GLIAX_STAGING_REF", "")
    key = os.environ.get("GLIAX_STAGING_PUBLISHABLE_KEY", "")
    web_origin = os.environ.get("GLIAX_STAGING_ORIGIN", "")
    check(ref == EXPECTED_REF, "Wrong staging project ID")
    check(bool(re.fullmatch(r"sb_publishable_[A-Za-z0-9_-]{12,}", key)), "Missing/invalid public staging key")
    web_origin = origin(web_origin)
    check(web_origin == "https://gliax-staging.pages.dev", "Unexpected staging Pages hostname")
    api_origin = f"https://{ref}.supabase.co"

    source_config = (ROOT / "js/config.js").read_text(encoding="utf-8")
    def marker(field):
        match = re.search(r"\b" + field + r"\s*:\s*[\"']([^\"']+)[\"']", source_config)
        check(match is not None, "Cannot establish production denylist")
        return match.group(1)

    prod_url, prod_key, prod_email = [marker(name) for name in ("supabaseUrl", "supabaseKey", "supportEmail")]
    check(prod_url != api_origin and prod_key != key, "Production/staging identity collision")
    check(source_config.count("window.LH_CONFIG =") == 1, "Unexpected source configuration")

    # Only distribute the static web, never repository SQL, tools, test fixtures or secrets.
    for directory in OUTPUT_DIRS:
        source = ROOT / directory
        check(source.is_dir() and not source.is_symlink(), "Missing/symlink web source")
        for item in source.rglob("*"):
            check(not item.is_symlink(), "Symlink found in web source")
        shutil.copytree(source, OUT / directory)
    shutil.copy2(ROOT / "index.html", OUT / "index.html")
    install_docx()

    staged_config = {
        "supabaseUrl": api_origin,
        "supabaseKey": key,
        "stripeMode": "test",
        "supportEmail": "",
        "staging": True,
        "billingEnabled": False,
        "r193Longitudinal": True,
    }
    patched_config = re.sub(
        r"window\.LH_CONFIG\s*=\s*\{.*?\};",
        "window.LH_CONFIG = Object.freeze(" + json.dumps(staged_config, separators=(",", ":")) + ");",
        source_config,
        count=1,
        flags=re.S,
    )
    (OUT / "js/config.js").write_text(patched_config, encoding="utf-8")

    api_path = OUT / "js/api.js"
    api = api_path.read_text(encoding="utf-8")
    start, end = api.find("  async function openBilling(action){"), api.find("  API.requestContent=")
    check(start >= 0 and end > start and api.count("  async function openBilling(action){") == 1,
          "Billing API changed; refusing to publish")
    api = (api[:start] +
           "  const billingDisabled=async()=>{throw new Error('GLIAX STAGING: pagos desactivados');};\n"
           "  API.openStripeCheckout=billingDisabled;\n"
           "  API.openBillingPortal=billingDisabled;\n" + api[end:])
    api_path.write_text(api, encoding="utf-8")

    guard = (ROOT / "tools/staging/browser_guard.js").read_text(encoding="utf-8")
    check(guard.count("__STAGING_POLICY__") == 1, "Unexpected browser guard")
    policy = {"apiOrigin": api_origin, "webOrigin": web_origin}
    (OUT / "js/staging-guard.js").write_text(
        guard.replace("__STAGING_POLICY__", json.dumps(policy)), encoding="utf-8"
    )

    csp = (
        "default-src 'self'; connect-src 'self' " + api_origin +
        "; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
        "font-src 'self' data:; object-src 'none'; frame-src 'none'; "
        "base-uri 'none'; form-action 'self'"
    )
    for page in OUT.rglob("*.html"):
        text = page.read_text(encoding="utf-8")
        injection = (
            '<meta http-equiv="Content-Security-Policy" content="' + html.escape(csp, quote=True) + '">'
            '<script src="/js/staging-guard.js"></script>'
        )
        if re.search(r"<head(?:\s[^>]*)?>", text, flags=re.I):
            text = re.sub(r"<head(?:\s[^>]*)?>", lambda m: m.group() + injection, text, count=1, flags=re.I)
        else:
            # HTML permits an omitted <head>; insert an explicit one immediately after <html>.
            check(re.search(r"<html(?:\s[^>]*)?>", text, flags=re.I) is not None,
                  "HTML document without html element; refusing to publish")
            text = re.sub(r"<html(?:\s[^>]*)?>",
                          lambda m: m.group() + "<head>" + injection,
                          text, count=1, flags=re.I)
        text = re.sub(r"<title>", "<title>GLIAX STAGING / TEST - ", text, count=1, flags=re.I)
        page.write_text(text, encoding="utf-8")

    (OUT / "r193-longitudinal.json").write_text('{"enabled":false}\n', encoding="utf-8")
    (OUT / "_headers").write_text(
        "/*\n  Content-Security-Policy: " + csp + "\n"
        "  X-Content-Type-Options: nosniff\n"
        "  Referrer-Policy: no-referrer\n"
        "  X-Robots-Tag: noindex, nofollow\n"
        "/r193-longitudinal.json\n  Cache-Control: no-store\n",
        encoding="utf-8"
    )

    forbidden = [prod_url, prod_key, prod_email]
    files = list(OUT.rglob("*"))
    check(any(p.name == "index.html" for p in files), "Missing entrypoint")
    for file in files:
        check(not file.is_symlink(), "Artifact symlink refused")
        if not file.is_file():
            continue
        data = file.read_bytes()
        check(not any(value.encode() in data for value in forbidden if value),
              "Production configuration leaked into staging artifact")
        if file.suffix.lower() in (".js", ".json", ".html", ".css"):
            text = data.decode("utf-8")
            check(not re.search(r"sb_secret_[A-Za-z0-9_-]+|-----BEGIN .*PRIVATE KEY-----", text),
                  "Potential secret in staging artifact")
            hosts = re.findall(r"https?://([a-z0-9.-]+\.supabase\.co)", text, flags=re.I)
            check(all(host == ref + ".supabase.co" for host in hosts),
                  "Foreign Supabase host in staging artifact")
    print(json.dumps({"status": "PASS", "environment": "staging", "files": len(files),
                      "output": "dist-gliax-staging", "payments": "disabled"}))


if __name__ == "__main__":
    try:
        build()
    except Exception as exc:
        if OUT.exists() and not OUT.is_symlink():
            shutil.rmtree(OUT)
        print("STAGING BUILD REFUSED: " + str(exc), file=sys.stderr)
        sys.exit(1)
