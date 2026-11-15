"""Build the selected, licensed SVG/PNG adapter. Faithful rasterization, no AI redrawing."""
import json,base64,re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];folder=ROOT/'assets/icons/phosphor-2.1.1'
mapping=json.loads((folder/'mapping.json').read_text());svgs={}
for key,name in mapping.items():
 original=(folder/(name+'.svg')).read_text();body=re.sub(r'^<svg[^>]*>|</svg>$','',original)
 svgs[key]='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" data-icon-library="phosphor" aria-hidden="true" focusable="false"><g fill="#6259c9" transform="scale(.25)">'+body+'</g></svg>'
pngs={}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page()
 for key,svg in svgs.items():
  pngs[key]=page.evaluate('''async svg=>{const img=new Image();img.src='data:image/svg+xml;base64,'+btoa(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;canvas.getContext('2d').drawImage(img,0,0,128,128);return canvas.toDataURL('image/png').split(',')[1]}''',svg)
 browser.close()
source="// Phosphor Icons 2.1.1, MIT. See assets/icons/phosphor-2.1.1/LICENSE.\n(function(root){'use strict';\nconst svgs="+json.dumps(svgs,separators=(',',':'))+",pngs="+json.dumps(pngs,separators=(',',':'))+";\nconst api={has:key=>Boolean(svgs[key]&&pngs[key]),keys:Object.keys(svgs),svg:key=>{if(!svgs[key])throw Error('Pictograma Phosphor no disponible.');return svgs[key];},png:key=>{if(!pngs[key])throw Error('PNG Phosphor no disponible.');return Uint8Array.from(atob(pngs[key]),c=>c.charCodeAt(0));}};root.PhosphorArt=api;if(typeof module!=='undefined')module.exports=api;\n})(typeof window==='undefined'?globalThis:window);\n"
(ROOT/'js/phosphor-art.js').write_text(source)
print('Built',len(svgs),'faithful SVG/PNG equivalents')
