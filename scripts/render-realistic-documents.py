"""Render distinct everyday document formats from the canonical, accessible sources."""
import base64
import html
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
documents = json.loads(subprocess.check_output(
    ['node', '-e', 'console.log(JSON.stringify(require("./js/document-library").documents))'], cwd=ROOT))
dimensions = {}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page()
    for key in ['receipt-co-v1', 'boarding-es-v2', 'email-es-v2', 'booking-es-v2', 'orders-es-v2']:
        doc = documents[key]
        receipt = key == 'receipt-co-v1'
        width, height = (650, 1120) if receipt else (1200, doc['height'])
        parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">']

        def rect(x, y, w, h, fill, rx=0, stroke='none'):
            parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}"/>')

        def line(x1, y1, x2, y2, color='#cbd5e1', dashed=False):
            dash = ' stroke-dasharray="8 8"' if dashed else ''
            parts.append(f'<path d="M{x1} {y1}H{x2}" stroke="{color}" stroke-width="2"{dash}/>' if y1 == y2 else f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="2"{dash}/>')

        def text(x, y, value, size=24, color='#203247', bold=False, limit=None, mono=False):
            family = 'DejaVu Sans Mono' if mono else 'DejaVu Sans'
            parts.append(f'<text x="{x}" y="{y}" data-right="{limit or width-24}" font-family="{family}" font-size="{size}" font-weight="{"bold" if bold else "normal"}" fill="{color}">{html.escape(str(value))}</text>')

        def wrap(value, x, y, max_width, size=23, color='#203247', bold=False, spacing=34):
            lines = page.evaluate(r'''({value,size,width,bold})=>{
                const c=document.createElement('canvas').getContext('2d');c.font=(bold?'bold ':'')+size+'px DejaVu Sans';
                const lines=[];let line='';for(const word of value.split(/\s+/)){
                    const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){lines.push(line);line=word;}else line=next;
                }if(line)lines.push(line);return lines;
            }''', {'value': value, 'size': size, 'width': max_width, 'bold': bold})
            for row in lines:
                text(x, y, row, size, color, bold, limit=x+max_width+2)
                y += spacing
            return y

        if receipt:
            rect(0, 0, width, height, '#e8e5de')
            parts.append('<path d="M35 32L50 43L65 32L80 43L95 32L110 43L125 32L140 43L155 32L170 43L185 32L200 43L215 32L230 43L245 32L260 43L275 32L290 43L305 32L320 43L335 32L350 43L365 32L380 43L395 32L410 43L425 32L440 43L455 32L470 43L485 32L500 43L515 32L530 43L545 32L560 43L575 32L590 43L615 32V1085H35Z" fill="#fffdf6"/>')
            text(90, 110, 'TIENDA BARRIO VERDE', 30, bold=True, mono=True)
            text(90, 158, 'RECIBO DE COMPRA', 23, mono=True)
            text(70, 222, 'R-0312    15/10/2026    10:35', 24, mono=True)
            text(70, 266, 'Moneda: pesos colombianos (COP)', 22, mono=True)
            line(65, 300, 585, 300, '#647164', True)
            text(70, 345, 'PRODUCTO', 22, bold=True, mono=True)
            text(352, 345, 'CANT.', 22, bold=True, mono=True)
            text(460, 345, 'IMPORTE', 22, bold=True, mono=True)
            for i, row in enumerate(doc['transcript'][1]['rows'][1:]):
                y = 410+i*62
                text(70, y, row[0], 25, mono=True)
                text(375, y, row[1], 25, mono=True)
                text(470, y, row[2], 25, mono=True)
            line(65, 580, 585, 580, '#647164', True)
            text(70, 642, 'TOTAL', 31, bold=True, mono=True)
            text(440, 642, '19.000', 31, bold=True, mono=True)
            text(70, 710, 'Pagado', 25, mono=True); text(455, 710, '20.000', 25, mono=True)
            text(70, 764, 'Cambio', 25, mono=True); text(470, 764, '1.000', 25, mono=True)
            line(65, 805, 585, 805, '#647164', True)
            text(135, 870, 'Gracias por tu visita.', 24, mono=True)
            # Decorative reference bars, deliberately not a functioning payment code.
            for n in range(65):
                rect(130+n*6, 922, 2+(n%3), 60, '#253126')
            text(195, 1020, 'R-0312', 24, mono=True)
        elif doc['layout'] == 'boarding':
            rect(0, 0, width, height, '#e7edf3')
            rect(28, 28, 1144, 644, '#fff', 24)
            rect(28, 28, 1144, 98, '#143a5a', 22)
            text(65, 88, 'AIRE NORTE', 32, '#fff', True)
            text(718, 88, 'TARJETA DE EMBARQUE', 25, '#fff', True)
            line(885, 144, 885, 640, '#a9bacb', True)
            text(65, 174, 'PASAJERO', 18, '#64748b', True); text(65, 212, 'Alex Ruiz', 29, bold=True)
            text(500, 174, 'VUELO / FECHA', 18, '#64748b', True); text(500, 212, 'AN204 · 24/10/2026', 26)
            text(65, 300, 'MAD', 66, '#143a5a', True); text(520, 300, 'BIO', 66, '#143a5a', True)
            text(65, 342, 'Madrid', 27); text(520, 342, 'Bilbao', 27)
            text(340, 300, '→', 60, '#d77a34')
            for x, label, value in [(65, 'EMBARQUE', '10:00'), (325, 'CIERRE PUERTA', '10:20'), (610, 'SALIDA', '10:35')]:
                text(x, 402, label, 18, '#64748b', True); text(x, 448, value, 38, bold=True)
            rect(925, 158, 200, 110, '#edf4f7', 12)
            text(950, 190, 'PUERTA', 19, '#64748b', True); text(950, 242, 'B12', 43, bold=True)
            text(925, 315, 'ASIENTO', 18, '#64748b', True); text(925, 362, '14A', 39, bold=True)
            text(925, 410, 'GRUPO', 18, '#64748b', True); text(925, 453, '2', 34, bold=True)
            line(65, 480, 840, 480)
            y = wrap('Equipaje incluido: 1 bolsa de 40 × 30 × 20 cm bajo el asiento.', 65, 525, 770, 22)
            y = wrap('Presenta tu documento de identidad y esta tarjeta.', 65, y+9, 770, 22)
            text(65, y+18, 'Llegada: 11:45 · Horarios locales', 22)
            for n in range(30): rect(925+n*6, 505, 2+n%3, 68, '#143a5a')
            text(925, 612, 'AN204 / 14A', 21)
        else:
            rect(0, 0, width, height, '#e7edf4')
            rect(18, 18, 1164, height-36, '#fff', 18)
            rect(18, 18, 1164, 62, '#23354d', 16)
            for x, color in [(48, '#f28c8c'), (74, '#f6ce7c'), (100, '#91c9aa')]:
                parts.append(f'<circle cx="{x}" cy="49" r="7" fill="{color}"/>')
            text(160, 57, {'email':'Correo · Grupo de ciencias', 'booking':'Biblioteca abierta · Reservas', 'orders':'Taller de bicicletas · Pedidos'}[doc['layout']], 22, '#fff')
            rect(18, 80, 220, height-98, '#f2f5fa')
            nav = {'email':['CORREO','Bandeja de entrada','Enviados','Borradores','Archivos'], 'booking':['BIBLIOTECA','Reservar sala','Mis reservas','Ayuda'], 'orders':['TALLER','Pedidos de hoy','Recogidas','Historial']}[doc['layout']]
            for i, label in enumerate(nav):
                if i == 1: rect(30, 160, 196, 48, '#dbe9fa', 9)
                text(43, 128+i*62, label, 16, '#305b86', i in [0, 1], limit=230)
            x = 270
            if doc['layout'] == 'email':
                text(x, 130, 'Cambio de punto de encuentro', 32, bold=True)
                text(x, 177, 'Aula de ciencias <aula@colegio.example>', 22)
                text(x, 214, 'Para: Grupo de ciencias · 22/10/2026, 16:10', 20, '#64748b')
                line(x, 240, 1140, 240)
                y = wrap(doc['transcript'][1]['text'], x, 290, 850, 25, spacing=39)
                y = wrap('Trae una botella de agua y la autorización firmada. Confirma tu asistencia respondiendo a este mensaje antes del viernes 23 a las 18:00.', x, y+20, 850, 25, spacing=39)
                rect(x, y+10, 360, 64, '#eff5fa', 10, '#cbd8e4'); text(x+22, y+50, 'Archivo: autorizacion.pdf', 22)
                y = wrap('Un borrador guardado no cuenta como respuesta enviada.', x, y+115, 850, 21)
                rect(x, y+15, 190, 52, '#2865a0', 10); text(x+25, y+49, 'Responder', 22, '#fff', True)
            else:
                title = 'Reservar una sala' if doc['layout'] == 'booking' else 'Pedidos de hoy'
                text(x, 136, title, 34, bold=True)
                # The source sentence is kept intact; the interface supplies its visual hierarchy.
                text(925, 132, '24/10/2026' if doc['layout'] == 'booking' else '22/10/2026 · 15:00', 18, '#64748b')
                summary = doc['transcript'][0]['text'].split('. ', 1)[1]
                if doc['layout'] == 'orders': summary = summary.split('. ', 1)[1]
                y = wrap(summary, x, 183, 850, 22, spacing=32)+16
                rows = doc['transcript'][1]['rows']; colwidth = 870/len(rows[0])
                for rownum, row in enumerate(rows):
                    rect(x, y-26, 870, 60, '#e8eff7' if rownum == 0 else '#f5f8fc' if rownum%2 else '#fff', 5)
                    for col, value in enumerate(row):
                        text(x+12+col*colwidth, y+10, value, 19, '#203247', rownum == 0, limit=x+(col+1)*colwidth-8)
                    y += 60
                y = wrap(doc['transcript'][2]['text'], x, y+30, 850, 22, spacing=33)
                label = 'Confirmar reserva' if doc['layout'] == 'booking' else 'Solicitar recogida'
                rect(x, y+18, 270, 54, '#2865a0', 9); text(x+20, y+54, label, 23, '#fff', True)
        parts.append('</svg>'); svg = ''.join(parts)
        bounds = page.evaluate('''({svg,height})=>{document.body.innerHTML=svg;return [...document.querySelectorAll('svg text')].map(el=>{const b=el.getBBox();return {text:el.textContent,right:b.x+b.width,limit:Number(el.getAttribute('data-right')),bottom:b.y+b.height}}).filter(x=>x.right>x.limit||x.bottom>height-18)}''', {'svg':svg,'height':height})
        if bounds: raise RuntimeError(f'Clipped document {key}: {bounds}')
        target = ROOT/'assets/documents'/f'{key}.svg'; target.write_text(svg)
        png = page.evaluate('''async svg=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);URL.revokeObjectURL(url);return c.toDataURL('image/png').split(',')[1]}''', svg)
        target.with_suffix('.png').write_bytes(base64.b64decode(png)); dimensions[key] = [width, height]
    browser.close()
section = '// Realistic document dimensions.\n'+''.join(f'documents[{json.dumps(key)}].width={w};documents[{json.dumps(key)}].height={h};\n' for key,(w,h) in dimensions.items())
target = ROOT/'js/document-library.js'; source = target.read_text(); marker = 'const attentionAdvanced={'
if '// Realistic document dimensions.' in source:
    source = source[:source.index('// Realistic document dimensions.')]+source[source.index(marker):]
source = source.replace(marker, section+marker); target.write_text(source)
(ROOT/'supabase/functions/request-learning-content/document-library.js').write_text(source)
print('Rendered', len(dimensions), 'distinct document designs with text bounds checked')
