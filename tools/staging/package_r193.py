"""Package the tracked R19.3 Edge and validated local Pages build for Staging."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from build_cloudflare import EXPECTED_REF, OUT, ROOT, build

FUNCTION = "request-learning-content"
EDGE = ROOT / "supabase/functions" / FUNCTION


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_zip(output, label, entries):
    archive = output / (label + ".zip")
    manifest = output / (label + ".files.sha256")
    names = sorted(entries)
    manifest.write_text("".join(f"{sha(entries[name])}  {name}\n" for name in names), encoding="utf-8")
    with ZipFile(archive, "w") as bundle:
        for name in names:
            info = ZipInfo(name)
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, entries[name], compress_type=ZIP_DEFLATED, compresslevel=9)
    with ZipFile(archive) as bundle:
        if bundle.namelist() != names or bundle.testzip() or any(bundle.read(name) != entries[name] for name in names):
            raise RuntimeError("Archive verification failed")
    return {"file":archive.name, "sha256":sha(archive.read_bytes()), "bytes":archive.stat().st_size,
            "files":len(names), "fileManifest":manifest.name, "fileManifestSha256":sha(manifest.read_bytes())}


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    output = args.output.resolve()
    if git("status", "--porcelain"):
        raise SystemExit("Package from a clean commit")
    if output == OUT or OUT in output.parents:
        raise SystemExit("Output must be separate from the Pages build")
    if git("ls-files", "--others", "--ignored", "--exclude-standard", "--", "assets", "css", "js"):
        raise SystemExit("Ignored files found inside the web source")
    output.mkdir(parents=True, exist_ok=True)
    build()

    pages = {p.relative_to(OUT).as_posix():p.read_bytes() for p in OUT.rglob("*") if p.is_file()}
    cfg = json.JSONDecoder().raw_decode(pages["js/config.js"].decode().split("Object.freeze(", 1)[1])[0]
    if (cfg["supabaseUrl"] != f"https://{EXPECTED_REF}.supabase.co" or
            not cfg["supabaseKey"].startswith("sb_publishable_") or cfg["billingEnabled"] is not False or cfg["r193Longitudinal"] is not True or
            json.loads(pages["r193-longitudinal.json"]) != {"enabled":False}):
        raise SystemExit("Pages settings do not match the Staging candidate")
    if max(map(len, pages.values())) >= 25 * 1024 * 1024:
        raise SystemExit("A Pages file exceeds the upload limit")

    edge = {}
    for item in git("ls-files", "-z", "--", EDGE.relative_to(ROOT).as_posix()).split(b"\0"):
        if item and Path(item.decode()).suffix in (".js", ".ts"):
            path = ROOT / item.decode()
            edge[path.relative_to(EDGE).as_posix()] = path.read_bytes()
    if len(edge) != 28 or "math-sequencing.js" not in edge or b"math_problem_version" not in edge["index.ts"]:
        raise SystemExit("Unexpected Edge source inventory or contract")
    edge["metadata.json"] = (json.dumps({"entrypoint_path":"index.ts","verify_jwt":True,"name":FUNCTION}) + "\n").encode()

    result = {
        "sourceCommit":git("rev-parse", "HEAD").decode().strip(),
        "stagingProject":EXPECTED_REF, "pagesProject":"gliax-staging",
        "function":FUNCTION, "verifyJwt":True, "longitudinalEnabled":False,
        "artifacts":[write_zip(output, "GLIAX-R19.3-Pages-Staging", pages),
                     write_zip(output, "GLIAX-R19.3-Edge-Staging", edge)],
    }
    (output / "MANIFIESTO-R19.3.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
