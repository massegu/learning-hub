"""Render original, factual document sources locally; no remote assets or fonts."""
import json,subprocess,html
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
documents=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify(require("./js/document-library").documents))'],cwd=ROOT))
colors=['#245d58','#385c82','#735383','#915136','#3b6944']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page()
 for i,(key,doc) in enumerate(documents.items()):
  if 'brief' not in doc:continue
  color=colors[i%len(colors)];parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536"><rect width="1024" height="1536" fill="#faf7ef"/>',f'<rect x="42" y="42" width="940" height="1452" rx="24" fill="white" stroke="{color}" stroke-width="3"/>',f'<path d="M42 66q0-24 24-24h892q24 0 24 24v145H42Z" fill="{color}"/>']
  def text(x,y,value,size=27,fill='#173326',weight='normal'):
   parts.append(f'<text x="{x}" y="{y}" font-family="DejaVu Sans, sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}">{html.escape(value)}</text>')
  text(80,100,doc['kind'].upper(),25,'white','bold');text(80,152,doc['country']+' · Documento de práctica',24,'white')
  y=270
  for j,block in enumerate(doc['transcript']):
   lines=page.evaluate(r'''({text,size,bold})=>{const c=document.createElement('canvas').getContext('2d');c.font=(bold?'bold ':'')+size+'px DejaVu Sans';const lines=[];let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(c.measureText(next).width>840&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}''',{'text':block['text'],'size':46 if j==0 else 44,'bold':j==0})
   if j>0:
    if doc['kind'] in ['Entrada','Menú','Horario','Formulario','Etiqueta']:parts.append(f'<rect x="70" y="{y-30}" width="884" height="{len(lines)*44+25}" rx="8" fill="{["#eff4f0","#f7f4ed"][j%2]}"/>')
    else:parts.append(f'<path d="M80 {y-44}h864" stroke="#d5ded8" stroke-width="2"/>')
   for line in lines:text(90,y,line,46 if j==0 else 44,weight='bold' if j==0 else 'normal');y+=50
   y+=35
  if doc['kind']=='Entrada':parts.append('<path d="M50 1300h924" stroke="#9aaea8" stroke-width="3" stroke-dasharray="12 10"/>')
  if doc['kind']=='Infografía':
   for n,count in enumerate([15,5,4]):
    yy=max(y+25,1050)+n*60;parts.append(f'<rect x="260" y="{yy}" width="{count*36}" height="28" fill="{color}"/>');text(90,yy+25,['Sin fugas','Con fugas','Reparados'][n],20);text(280+count*36,yy+25,str(count),22)
  text(80,1450,'LEARNING LAB · Material original ficticio',20,color);parts.append('</svg>')
  svg=''.join(parts)
  bounds=page.evaluate('''svg=>{document.body.innerHTML=svg;return [...document.querySelectorAll('svg text')].map(el=>{const b=el.getBBox();return {text:el.textContent,right:b.x+b.width,bottom:b.y+b.height}}).filter(x=>x.right>960||x.bottom>1480)}''',svg)
  if bounds:raise RuntimeError(f'Clipped document {key}: {bounds}')
  target=ROOT/'assets/documents'/f'{key}.svg';target.write_text(svg)
  png=page.evaluate('''async svg=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=1024;c.height=1536;c.getContext('2d').drawImage(img,0,0);URL.revokeObjectURL(url);return c.toDataURL('image/png').split(',')[1]}''',svg)
  import base64
  target.with_suffix('.png').write_bytes(base64.b64decode(png))
 browser.close()
print('Rendered',sum('brief' in x for x in documents.values()),'authored SVG/PNG documents')
