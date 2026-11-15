"""Render original, factual document sources locally; no remote assets or fonts."""
import json,subprocess,html,argparse,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
documents=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify(require("./js/document-library").documents))'],cwd=ROOT))
parser=argparse.ArgumentParser();parser.add_argument('--only');args=parser.parse_args()
dimensions={}
colors=['#245d58','#385c82','#735383','#915136','#3b6944']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page()
 for i,(key,doc) in enumerate(documents.items()):
  if args.only and key!=args.only:continue
  if doc.get('layout') or doc.get('design') or key=='receipt-co-v1':continue
  color=colors[i%len(colors)];parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536"><rect width="1024" height="1536" fill="#faf7ef"/>',f'<rect x="42" y="42" width="940" height="1452" rx="24" fill="white" stroke="{color}" stroke-width="3"/>',f'<path d="M42 66q0-24 24-24h892q24 0 24 24v145H42Z" fill="{color}"/>']
  def text(x,y,value,size=27,fill='#173326',weight='normal',right=960):
   parts.append(f'<text x="{x}" y="{y}" data-right="{right}" font-family="DejaVu Sans, sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}">{html.escape(value)}</text>')
  text(80,100,doc['kind'].upper(),25,'white','bold');text(80,152,doc['country'],24,'white')
  y=270
  business=key in ['invoice-co-v1','receipt-co-v1','catalogue-co-v1']
  if business:
   def wrapped(value,size=28,width=820,bold=False):
    return page.evaluate(r'''({value,size,width,bold})=>{const c=document.createElement('canvas').getContext('2d');c.font=(bold?'bold ':'')+size+'px DejaVu Sans';let line='';const out=[];for(const word of value.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){out.push(line);line=word;}else line=next;}if(line)out.push(line);return out;}''',{'value':value,'size':size,'width':width,'bold':bold})
   text(80,y,doc['title'],35,weight='bold');y+=55
   # Do not repeat the issuer/type as a subtitle. Present the unique facts as
   # labelled fields, extracted verbatim from the canonical accessible source.
   source=doc['transcript'][0]['text']
   patterns={
    'invoice-co-v1':[('Referencia',r'F-\d+'),('Fecha',r'\d{2}/\d{2}/\d{4}'),('Moneda',r'pesos colombianos \(COP\)')],
    'receipt-co-v1':[('Referencia',r'R-\d+'),('Fecha',r'\d{2}/\d{2}/\d{4}'),('Hora',r'\d{2}:\d{2}'),('Moneda',r'pesos colombianos \(COP\)')],
    'catalogue-co-v1':[('Válido hasta',r'\d{2}/\d{2}/\d{4}'),('Moneda',r'pesos colombianos \(COP\)')],
   }
   fields=[(label,re.search(pattern,source).group(0)) for label,pattern in patterns[key]]
   for n,(label,value) in enumerate(fields):
    col=n%2;row=n//2;x=80+col*444;yy=y+row*100
    parts.append(f'<rect x="{x}" y="{yy-12}" width="420" height="84" rx="10" fill="#f0f5f2"/>')
    text(x+18,yy+14,label.upper(),17,'#53665f',weight='bold',right=x+402)
    text(x+18,yy+48,value,24,weight='normal',right=x+402)
   y+=((len(fields)+1)//2)*100+28
   rows=doc['transcript'][1]['rows'];columns=len(rows[0]);widths={2:[620,244],3:[450,180,234],4:[310,155,225,174]}[columns]
   for rownum,row in enumerate(rows):
    lines=[wrapped(value,25,widths[col]-30,rownum==0) for col,value in enumerate(row)]
    height=max(map(len,lines))*36+26
    parts.append(f'<rect x="80" y="{y-30}" width="864" height="{height}" rx="4" fill="{color if rownum==0 else ("#f0f5f2" if rownum%2 else "#ffffff")}"/>')
    x=80
    for col,values in enumerate(lines):
     for n,line in enumerate(values):
      if rownum>0 and col>0:
       parts.append(f'<text x="{x+widths[col]-18}" y="{y+n*36}" text-anchor="end" font-family="DejaVu Sans, sans-serif" font-size="27" fill="#173326">{html.escape(line)}</text>')
      else:text(x+14,y+n*36,line,25,'white' if rownum==0 else '#173326','bold' if rownum==0 else 'normal',right=x+widths[col]-14)
     x+=widths[col]
    y+=height
   y+=30
   # Keep the authored wording and numbers verbatim, splitting only at sentence
   # boundaries (never thousands separators). Emphasize totals and package offers.
   for sentence in re.split(r'(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])',doc['transcript'][2]['text']):
    lines=wrapped(sentence,30,800);height=len(lines)*42+30
    emphasis=sentence.startswith(('TOTAL:','Paquete'))
    parts.append(f'<rect x="80" y="{y-27}" width="864" height="{height}" rx="10" fill="{color if emphasis else "#f1f4f0"}"/>')
    for line in lines:text(104,y+9,line,30,'white' if emphasis else '#173326','bold' if emphasis else 'normal');y+=42
    y+=44
  if key=='map-cl':
   text(80,270,'CENTRO CULTURAL · Concepción',36,weight='bold')
   text(80,320,'Plano esquemático · sin escala',28)
   parts.append('<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#245d58"/></marker></defs>')
   def room(x,y,w,h,label):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="#eff4f0" stroke="#245d58" stroke-width="3"/>');text(x+20,y+60,label,30,weight='bold')
   room(345,370,330,110,'Biblioteca');room(380,650,260,110,'Patio');room(345,930,330,110,'Entrada')
   room(75,650,210,110,'Taller');room(735,650,210,110,'Música')
   for path in ['M510 930V775','M510 650V495','M380 705H300','M640 705H720']:
    parts.append(f'<path d="{path}" fill="none" stroke="#245d58" stroke-width="4" marker-end="url(#arrow)"/>')
   text(540,570,'Sin escalones',25)
   parts.append('<path d="M295 745h18v-14h18v-14h18" fill="none" stroke="#915136" stroke-width="4"/>')
   text(150,820,'Escalera al taller',24,'#915136')
   text(80,1125,'Desde la entrada, pasa por el patio.',30)
   text(80,1180,'Biblioteca: acceso sin escalones desde el patio.',30)
   text(80,1235,'Taller: a la izquierda, por la escalera.',30)
   text(80,1290,'Sala de música: a la derecha del patio.',30)
   y=1330
  for j,block in enumerate([] if key=='map-cl' or business else doc['transcript']):
   if block['type']=='table':
    columns=len(block['rows'][0]);width=864/columns
    for rownum,row in enumerate(block['rows']):
     cell_lines=[page.evaluate(r'''({text,width,bold})=>{const c=document.createElement('canvas').getContext('2d');c.font=(bold?'bold ':'')+'26px DejaVu Sans';const lines=[];let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(c.measureText(next).width>width&&line){lines.push(line);line=word;}else line=next;}lines.push(line);return lines;}''',{'text':value,'width':width-28,'bold':rownum==0}) for value in row]
     height=max(map(len,cell_lines))*34+24
     for col,lines in enumerate(cell_lines):
      x=80+col*width
      parts.append(f'<rect x="{x}" y="{y-30}" width="{width}" height="{height}" fill="{["#eff4f0","#fff"][rownum%2]}" stroke="#d5ded8"/>')
      for line_num,line in enumerate(lines):text(x+14,y+line_num*34,line,26,weight='bold' if rownum==0 else 'normal')
     y+=height
    y+=35
    continue
   lines=page.evaluate(r'''({text,size,bold})=>{const c=document.createElement('canvas').getContext('2d');c.font=(bold?'bold ':'')+size+'px DejaVu Sans';const lines=[];let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(c.measureText(next).width>840&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}''',{'text':block['text'],'size':46 if j==0 else 44,'bold':j==0})
   if j>0:
    if doc['kind'] in ['Entrada','Menú','Horario','Formulario','Etiqueta']:parts.append(f'<rect x="70" y="{y-30}" width="884" height="{len(lines)*44+25}" rx="8" fill="{["#eff4f0","#f7f4ed"][j%2]}"/>')
    else:parts.append(f'<path d="M80 {y-44}h864" stroke="#d5ded8" stroke-width="2"/>')
   for line in lines:text(90,y,line,46 if j==0 else 44,weight='bold' if j==0 else 'normal');y+=50
   y+=35
  if doc['kind']=='Entrada':
   parts.append(f'<path d="M50 {y}h924" stroke="#9aaea8" stroke-width="3" stroke-dasharray="12 10"/>');y+=35
  if doc['kind']=='Infografía':
   for n,count in enumerate([15,5,4]):
    yy=y+25+n*60;parts.append(f'<rect x="260" y="{yy}" width="{count*36}" height="28" fill="{color}"/>');text(90,yy+25,['Sin fugas','Con fugas','Reparados'][n],20);text(280+count*36,yy+25,str(count),22)
  if doc['kind']=='Infografía':y+=220
  text(80,y+30,'LEARNING LAB',20,color);parts.append('</svg>')
  height=int(y+110);dimensions[key]=height
  svg=''.join(parts).replace('height="1536"',f'height="{height}"').replace('0 0 1024 1536',f'0 0 1024 {height}').replace('height="1452"',f'height="{height-84}"')
  bounds=page.evaluate('''({svg,height})=>{document.body.innerHTML=svg;return [...document.querySelectorAll('svg text')].map(el=>{const b=el.getBBox();return {text:el.textContent,right:b.x+b.width,limit:Number(el.getAttribute('data-right')||960),bottom:b.y+b.height}}).filter(x=>x.right>x.limit||x.bottom>height-50)}''',{'svg':svg,'height':height})
  if bounds:raise RuntimeError(f'Clipped document {key}: {bounds}')
  target=ROOT/'assets/documents'/f'{key}.svg';target.write_text(svg)
  png=page.evaluate('''async svg=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);URL.revokeObjectURL(url);return c.toDataURL('image/png').split(',')[1]}''',svg)
  import base64
  target.with_suffix('.png').write_bytes(base64.b64decode(png))
 browser.close()
# Keep declared image dimensions equal to the generated source in both runtimes.
for filename in ['js/document-library.js','supabase/functions/request-learning-content/document-library.js']:
 target=ROOT/filename;source=target.read_text()
 marker='// Generated document dimensions.'
 old=re.search(r'// Generated document dimensions\.\nconst documentHeights=(.*?);\nfor\(const \[id,height\] of Object.entries\(documentHeights\)\)documents\[id\].height=height;\n',source)
 values=json.loads(old.group(1)) if old else {}
 values.update(dimensions)
 section=marker+'\nconst documentHeights='+json.dumps(values,ensure_ascii=False,sort_keys=True)+';\nfor(const [id,height] of Object.entries(documentHeights))documents[id].height=height;\n'
 if old:source=source[:old.start()]+section+source[old.end():]
 else:source=source.replace('const attentionAdvanced={',section+'const attentionAdvanced={')
 target.write_text(source)
print('Rendered',len(dimensions),'authored SVG/PNG documents')
subprocess.run([sys.executable,str(ROOT/'scripts/render-realistic-documents.py')],check=True)
subprocess.run([sys.executable,str(ROOT/'scripts/render-editorial-documents.py')],check=True)
