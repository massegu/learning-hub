"""Reflow the 15 professional fixtures with LibreOffice and check pagination."""
import argparse
import os
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile


def command(*args):
    return subprocess.check_output(args, text=True)


def check_pdf(file):
    assert '(A4)' in command('pdfinfo', str(file)), file
    pages = command('pdftotext', '-layout', str(file), '-').split('\f')[:-1]
    assert all('GLIAX' in page for page in pages), file
    assert not any(re.search('Level Up|Learning Hub|Learning Lab', page, re.I) for page in pages), file
    if file.stem.endswith('_ficha'):
        assert len(pages) == 16, (file.name, len(pages))
        for number, content in enumerate(pages, 1):
            assert re.search(fr'ACTIVIDAD {number}\b', content), (file.name, number)
            assert f'Respuesta · actividad {number}' in content, (file.name, number)
    else:
        for number in range(1, 17):
            assert re.search(fr'Actividad {number} ·', ''.join(pages)), (file.name, number)
    print(file.name, len(pages), 'páginas A4')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('fixtures', type=Path)
    parser.add_argument('--pdf', type=Path, required=True)
    args = parser.parse_args()
    inputs = sorted(args.fixtures.glob('GLIAX_*_N[123].zip'))
    assert len(inputs) == 15, 'Genera los 15 lotes con GLIAX_DG_EVIDENCE.'
    args.pdf.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=args.fixtures) as work:
        root = Path(work)
        documents = []
        for package in inputs:
            with zipfile.ZipFile(package) as content:
                for name in content.namelist():
                    role = 'solucionario' if '_solucionario_' in name else 'ficha'
                    output = root / f'{package.stem}_{role}.docx'
                    output.write_bytes(content.read(name))
                    documents.append(output)
        subprocess.run([
            os.environ.get('SOFFICE', 'soffice'), '-env:UserInstallation='+(root / 'office').as_uri(),
            '--headless', '--convert-to', 'pdf', '--outdir', str(args.pdf),
            *map(str, documents)
        ], check=True)
    for file in documents:
        check_pdf(args.pdf / (file.stem + '.pdf'))
    print('PASS: 30 documentos abiertos, fichas sin páginas vacías o solo de respuesta')


if __name__ == '__main__':
    main()
