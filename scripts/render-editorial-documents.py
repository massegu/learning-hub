"""Render the remaining sources as receipts, notices, interfaces and everyday print.
Canonical facts and accessible transcripts stay in document-library.js.
"""
import base64, html, json, re, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
docs=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify(require("./js/document-library").documents))'],cwd=ROOT))
sizes={'invoice-co-v1':(1000,1000),'catalogue-co-v1':(1000,1040),'brochure-co-v1':(1000,900),'poster-mx':(1000,950),'ticket-es':(1200,590),'menu-ar':(900,1000),'notice-cl':(1000,830),'transport-co':(1200,740),'infographic-cr':(1100,920),'post-pa':(1000,920),'label-mx':(850,1060),'form-es':(1100,960),'schedule-ar':(1200,800),'advert-co':(1000,880),'instructions-cr':(1100,920),'news-pa':(1200,980)}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page()
 for key,(w,h) in sizes.items():
  doc=docs[key];blocks=doc['transcript'];parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'];ink='#243947';accent='#286577'
  def rect(x,y,width,height,fill,rx=0,stroke='none'):
   parts.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{rx}" fill="{fill}" stroke="{stroke}"/>')
  def line(x,y,x2,y2,color='#c8d3d6',dash=''):
   parts.append(f'<path d="M{x} {y}L{x2} {y2}" stroke="{color}" stroke-width="2" stroke-dasharray="{dash}"/>')
  def txt(x,y,value,size=26,bold=False,color=None,right=None,font='DejaVu Sans'):
   parts.append(f'<text x="{x}" y="{y}" data-right="{right or w-38}" font-family="{font}" font-size="{size}" font-weight="{"bold" if bold else "normal"}" fill="{color or ink}">{html.escape(str(value))}</text>')
  def wrap(value,width,size=26,bold=False):
   return page.evaluate(r'''({value,width,size,bold})=>{const c=document.createElement('canvas').getContext('2d');c.font=(bold?'bold ':'')+size+'px DejaVu Sans';let line='';const out=[];for(const word of value.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){out.push(line);line=word;}else line=next;}if(line)out.push(line);return out;}''',{'value':value,'width':width,'size':size,'bold':bold})
  def para(value,x,y,width,size=26,bold=False,color=None,gap=None):
   for row in wrap(value,width,size,bold):txt(x,y,row,size,bold,color,x+width+2);y+=gap or size*1.5
   return y
  def table(rows,x,y,width):
   columns=len(rows[0]);cw=width/columns
   for n,row in enumerate(rows):
    lines=[wrap(v,cw-26,22,n==0) for v in row];rh=max(map(len,lines))*33+22
    rect(x,y-27,width,rh,'#e4eef1' if n==0 else '#f3f6f6' if n%2 else '#fff',4)
    for c,values in enumerate(lines):
     for k,value in enumerate(values):txt(x+c*cw+13,y+8+k*33,value,22,n==0,right=x+(c+1)*cw-10)
    y+=rh
   return y
  def source(start,x,y,width,size=27):
   for block in blocks[start:]:
    if block['type']=='table':y=table(block['rows'],x,y+18,width)+25
    else:y=para(block['text'],x,y,width,size)+25
   return y
  rect(0,0,w,h,'#f6f3ec');rect(22,22,w-44,h-44,'#fff',16)
  if key=='invoice-co-v1':
   rect(22,22,12,h-44,'#304e64');txt(70,95,'Papelería Norte',39,True);txt(700,85,'FACTURA',26,True);txt(700,132,'F-1048',28)
   txt(70,180,'Fecha: 14/10/2026',25);txt(70,225,'Moneda: pesos colombianos (COP)',25)
   line(70,260,930,260);y=table(blocks[1]['rows'],70,322,860)
   for sentence in re.split(r'(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])',blocks[2]['text']):
    y+=53;y=para(sentence,450,y,460,28,sentence.startswith('TOTAL'))
  elif key=='catalogue-co-v1':
   txt(65,85,'Papelería Norte',36,True);txt(65,125,'CATÁLOGO ESCOLAR',22,True)
   txt(65,170,'Moneda: pesos colombianos (COP)',23);txt(590,125,'Válido hasta el 31/10/2026.',22);y=195
   for n,(label,price) in enumerate(blocks[1]['rows'][1:]):
    x=65+(n%2)*450;yy=y+35+(n//2)*240;rect(x,yy,420,210,['#edf3fa','#edf5ed','#fff4dc','#f6eef6'][n],18)
    if n==0:rect(x+28,yy+28,70,88,'#426a93',5);line(x+40,yy+32,x+40,yy+112,'#fff')
    elif n==1:parts.append(f'<path d="M{x+28} {yy+57}h35l12 14h45v55H{x+28}Z" fill="#7d9c75"/>')
    elif n==2:parts.append(f'<path d="M{x+35} {yy+100}l57-57 13 13-57 57-21 8Z" fill="#e0ab43" stroke="#374f57" stroke-width="3"/>')
    else:rect(x+26,yy+55,120,55,'#ac799a',12);line(x+35,yy+65,x+136,yy+65,'#fff')
    para(label,x+175,yy+65,220,24,True);txt(x+175,yy+125,price+' COP',27,True,right=x+410)
   source(2,65,y+560,860,27)
  elif key in ['brochure-co-v1','poster-mx']:
   rect(22,22,w-44,195,'#2d5362' if key=='brochure-co-v1' else '#853f37',16)
   y=para(blocks[0]['text'],65,82,865,36,True,'#fff')
   if key=='poster-mx':
    parts.append('<circle cx="495" cy="365" r="102" fill="#f1d6a6"/><circle cx="495" cy="365" r="55" fill="#853f37"/>')
    for x,yy in [(445,310),(550,310),(445,420),(550,420)]:parts.append(f'<circle cx="{x}" cy="{yy}" r="17" fill="#fff8e8"/>')
    source(1,70,555,850,34)
   else:
    # A drawing workshop leaflet uses a pencil motif and a compact information list.
    parts.append('<path d="M875 225l25 25-40 40-30 8 8-30Z" fill="#e6b95b" stroke="#385761" stroke-width="4"/>')
    table(blocks[1]['rows'],65,340,870)
  elif key=='ticket-es':
   rect(22,22,w-44,110,'#2d5668',15);para(blocks[0]['text'],65,88,1010,37,True,'#fff')
   line(850,155,850,h-55,dash='8 8');para(blocks[1]['text'],65,220,730,32,True)
   para(blocks[2]['text'],65,335,730,27)
   txt(895,210,'11:00',43,True);txt(895,260,'ACCESO',20)
   for n in range(29):rect(895+n*7,307,2+n%3,110,'#243947')
   txt(895,465,'UNA VISITA',21,True)
  elif key=='menu-ar':
   rect(22,22,w-44,h-44,'#fffaf0',16);rect(52,50,w-104,7,'#725843')
   txt(75,125,'CAFÉ DEL PATIO',43,True,'#654b38');txt(75,175,'Rosario',26);txt(75,225,'Precios en pesos argentinos (ARS)',23)
   line(75,260,825,260,'#cdb795','4 6')
   for n,(label,price) in enumerate([('Sándwich de queso','2.400 ARS'),('Ensalada','3.200 ARS'),('Agua','900 ARS')]):
    yy=340+n*100;txt(75,yy,label,31);txt(640,yy,price,30,True);line(75,yy+30,825,yy+30,'#d4c7ad','2 7')
   rect(60,610,780,135,'#f3e8d4',14);txt(85,652,'COMBO',20,True);txt(85,704,'Sándwich + agua',30,True);txt(640,704,'3.000 ARS',30,True)
   para(blocks[3]['text'],75,825,750,25)
  elif key=='notice-cl':
   rect(22,22,w-44,h-44,'#f4f0d7',10)
   parts.append('<circle cx="500" cy="57" r="16" fill="#b35943"/>')
   y=para(blocks[0]['text'],75,136,850,34,True)
   line(75,y+20,925,y+20,'#c8bc93');source(1,75,y+100,850,32)
  elif key=='transport-co':
   rect(22,22,w-44,145,'#194c67',16);para(blocks[0]['text'],65,86,1050,31,True,'#fff')
   y=para(blocks[1]['text'],65,220,1060,29)
   line(190,375,1010,375,'#40839a')
   for x,label,time in [(190,'Centro','16:20'),(600,'Biblioteca','16:50'),(1010,'Terminal','17:10')]:
    parts.append(f'<circle cx="{x}" cy="375" r="15" fill="#fff" stroke="#40839a" stroke-width="6"/>');txt(x-70,430,label,26,True,right=x+150);txt(x-50,477,time,30)
   txt(65,330,'Línea A',26,True);para(blocks[3]['text'],65,592,1060,27)
  elif key=='infographic-cr':
   y=para(blocks[0]['text'],65,85,960,33,True)
   y=para(blocks[1]['text'],65,y+30,960,28)
   for n in range(20):rect(65+n*47,y+20,38,55,'#6f9a86' if n<15 else '#d8984f',5)
   txt(65,y+125,'15 sin fugas',24,True);txt(680,y+125,'5 con fugas',24,True)
   y=para(blocks[2]['text'],65,y+215,960,28)
   for n in range(5):rect(65+n*125,y+20,105,55,'#6299af' if n<4 else '#d8984f',5)
   txt(65,y+125,'4 reparados · 1 pendiente',24,True)
   para(blocks[3]['text'],65,y+220,960,24)
  elif key=='post-pa':
   rect(22,22,w-44,h-44,'#f4f7fa',16);rect(55,60,w-110,h-130,'#fff',16,'#d6dfe5')
   parts.append('<circle cx="110" cy="118" r="30" fill="#61917c"/>');txt(96,127,'R',27,True,'#fff')
   y=para(blocks[0]['text'],162,109,750,26,True)
   y=para(blocks[1]['text'],85,y+70,820,34,True)
   y=para(blocks[2]['text'],85,y+30,820,28)
   line(85,y+20,915,y+20);para(blocks[3]['text'],85,y+82,820,26)
   txt(85,h-110,'♡     Comentar     Compartir',24,color='#6a7e8d')
  elif key=='label-mx':
   rect(22,22,w-44,h-44,'#e6e9d7',24);rect(55,55,w-110,h-110,'#fffdf2',24)
   parts.append('<path d="M565 230c-80 80-90 155-75 230m-6-90 80-40m-73-4-45-65m51 14 60-50" fill="none" stroke="#98a278" stroke-width="14"/>')
   y=para(blocks[0]['text'],90,150,650,43,True,'#5b6543')
   y=para(blocks[1]['text'],90,475,650,29)
   line(90,y+15,760,y+15,'#aaa98a');y=para(blocks[2]['text'],90,y+75,650,28,True)
   para(blocks[3]['text'],90,y+60,650,27)
  elif key=='form-es':
   rect(22,22,w-44,105,'#305871',16);para(blocks[0]['text'],65,87,970,31,True,'#fff')
   y=para(blocks[1]['text'],65,183,970,25)
   for n,(label,value) in enumerate([('Nombre','Alex Ruiz'),('Fecha de recogida','26/10/2026'),('Fecha de devolución','sin completar'),('Firma','Alex Ruiz')]):
    yy=y+65+n*110;txt(65,yy,label.upper(),18,True,color='#697f8b');txt(65,yy+43,value,29);line(65,yy+60,1010,yy+60)
   para(blocks[3]['text'],65,y+555,970,25)
  elif key=='schedule-ar':
   y=para(blocks[0]['text'],65,92,1070,31,True)
   for x,label in [(310,'10:00'),(500,'10:30'),(690,'11:00'),(880,'11:30'),(1070,'12:00')]:txt(x-30,215,label,20,color='#667e8a');line(x,235,x,605,'#dde4ea')
   for n,(label,start,duration,color) in enumerate([('Fotografía',0,60,'#dcebdd'),('Música',30,60,'#e7dded'),('Dibujo',75,60,'#f4e4c9')]):
    yy=265+n*110;txt(65,yy+30,label,24,True);x=310+start*(19/3);rect(x,yy,380,62,color,10);para(blocks[n+1]['text'],x+12,yy+25,355,18)
   para(blocks[4]['text'],65,695,1060,25)
  elif key=='advert-co':
   rect(22,22,w-44,85,'#183950',16);para(blocks[0]['text'],60,69,875,24,True,'#fff')
   rect(22,107,w-44,340,'#245d72');para(blocks[2]['text'],65,200,865,43,True,'#fff');para(blocks[1]['text'],65,335,865,32,True,'#f5dca1')
   txt(65,525,'CONDICIONES DEL PLAN',19,True,color='#617b89');para(blocks[3]['text'],65,585,865,29)
  elif key=='instructions-cr':
   rect(22,22,220,h-44,'#e9f0f5',16);txt(50,100,'RADIO',30,True);txt(50,148,'ESCOLAR',24,True)
   for n,label in enumerate(['Mis archivos','Entregas','Ayuda']):txt(50,260+n*65,label,20)
   y=para(blocks[0]['text'],280,100,740,31,True)
   for n,b in enumerate(blocks[1:]):
    yy=y+50+n*145;rect(280,yy-30,745,120,'#f1f6f8',12);para(b['text'],305,yy+8,695,26)
  elif key=='news-pa':
   line(55,50,1145,50,ink);y=para(blocks[0]['text'],60,110,1080,33,True);line(55,y+30,1145,y+30,ink)
   for n,b in enumerate(blocks[1:3]):
    x=65+n*565;txt(x,265,'FUENTE '+('A' if n==0 else 'B'),19,True,color='#71838d');para(b['text'],x,325,495,29)
   line(600,245,600,650);rect(60,700,1080,165,'#f2eee4',10);para(blocks[3]['text'],90,755,1020,28,True)
  txt(55,h-35,doc['country'],17,color='#687d85')
  parts.append('</svg>');svg=''.join(parts)
  bounds=page.evaluate('''({svg,height})=>{document.body.innerHTML=svg;return [...document.querySelectorAll('svg text')].map(el=>{const b=el.getBBox();return {text:el.textContent,right:b.x+b.width,limit:Number(el.getAttribute('data-right')),bottom:b.y+b.height}}).filter(x=>x.right>x.limit+1||x.bottom>height-15)}''',{'svg':svg,'height':h})
  if bounds:raise RuntimeError(f'Clipped {key}: {bounds}')
  target=ROOT/'assets/documents'/f'{key}.svg';target.write_text(svg)
  png=page.evaluate('''async svg=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const i=new Image();i.src=url;await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);URL.revokeObjectURL(url);return c.toDataURL('image/png').split(',')[1]}''',svg)
  target.with_suffix('.png').write_bytes(base64.b64decode(png))
 browser.close()
marker='// Editorial document dimensions.'
section=marker+'\n'+''.join(f'documents[{json.dumps(k)}].width={w};documents[{json.dumps(k)}].height={h};documents[{json.dumps(k)}].design="editorial";\n' for k,(w,h) in sizes.items())
target=ROOT/'js/document-library.js';s=target.read_text()
if marker in s:s=re.sub(r'// Editorial document dimensions\.\n(?:documents\[[^\n]+\n)*',section,s)
else:s=s.replace('const attentionAdvanced={',section+'const attentionAdvanced={')
target.write_text(s);(ROOT/'supabase/functions/request-learning-content/document-library.js').write_text(s)
print('Rendered',len(sizes),'everyday document layouts with checked text bounds')
