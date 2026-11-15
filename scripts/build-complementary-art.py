"""Rasterize reviewed, licensed 24px vectors without altering their paths."""
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
choices={'wrench':('lucide','wrench'),'flower':('iconoir','flower'),'headphones':('tabler','headphones')}
svgs={};pngs={}
for key,(library,name) in choices.items():
 source=(ROOT/f'assets/icon-library-review-20261030/{library}/{name}.svg').read_text()
 source=re.search(r'<svg\b[\s\S]*?</svg>',source).group()
 source=source.replace('currentColor','#32646f')
 source=re.sub(r'width="24"','width="64"',source, count=1);source=re.sub(r'height="24"','height="64"',source,count=1)
 source=source.replace('<svg ',f'<svg data-icon-library="{library}" aria-hidden="true" focusable="false" ',1)
 # Nested viewBox contract stays 64 in scene/map renderers, without changing source geometry.
 body=re.sub(r'^<svg[^>]*>|</svg>$','',source)
 attrs=re.search(r'<svg([^>]*)>',source).group(1)
 attrs=re.sub(r'(?<![\w:-])(?:width|height|viewBox|xmlns|data-icon-library|aria-hidden|focusable)="[^"]*"','',attrs)
 svgs[key]=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" data-icon-library="{library}" aria-hidden="true" focusable="false"><g transform="scale(2.6666666667)" {attrs}>{body}</g></svg>'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page()
 for key,svg in svgs.items():
  (Path('/tmp')/('cognitive-'+key+'.svg')).write_text(svg)
  pngs[key]=page.evaluate('''async svg=>{const img=new Image();img.src='data:image/svg+xml;base64,'+btoa(svg);await img.decode();const c=document.createElement('canvas');c.width=128;c.height=128;c.getContext('2d').drawImage(img,0,0,128,128);return c.toDataURL('image/png').split(',')[1]}''',svg)
 browser.close()
(ROOT/'js/complementary-art.js').write_text('// Lucide 0.468.0 ISC, Tabler 3.28.1 MIT, Iconoir 7.11.0 MIT. Original vectors and licenses: assets/icon-library-review-20261030.\n(function(root){"use strict";const svgs='+json.dumps(svgs,separators=(',',':'))+',pngs='+json.dumps(pngs,separators=(',',':'))+';const api={has:key=>Boolean(svgs[key]&&pngs[key]),keys:Object.keys(svgs),svg:key=>svgs[key],png:key=>Uint8Array.from(atob(pngs[key]),c=>c.charCodeAt(0))};root.ComplementaryArt=api;if(typeof module!=="undefined")module.exports=api;})(typeof window==="undefined"?globalThis:window);\n')
print('Built 3 reviewed complementary icons, faithful SVG and PNG')
