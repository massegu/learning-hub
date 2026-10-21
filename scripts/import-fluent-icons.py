"""Embed the reviewed, vendored Microsoft SVG subset. No network/runtime dependency."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'assets/icons/fluent-emoji-flat.json').read_text())
drawings={}
for key,icon in source['icons'].items():
 body=icon['body']
 if re.search(r'<(?:script|foreignObject|image)\b|(?:href|on\w+)\s*=',body,re.I):raise ValueError('Unsafe SVG: '+key)
 for name in re.findall(r'\bid="([^"]+)"',body):
  renamed='fluent-'+key+'-'+name
  body=body.replace('id="'+name+'"','id="'+renamed+'"').replace('url(#'+name+')','url(#'+renamed+')')
 drawings[key]='<g data-art-set="fluent-emoji-flat" transform="scale(2)">'+body+'</g>'
start='  // BEGIN vendored Fluent Emoji Flat (Microsoft, MIT).\n'
end='  // END vendored Fluent Emoji Flat.\n'
section=start+'  Object.assign(drawings,'+json.dumps(drawings,ensure_ascii=False,separators=(',',':'))+');\n'+end
path=ROOT/'js/stimulus-art.js';text=path.read_text()
if start in text:text=text[:text.index(start)]+section+text[text.index(end)+len(end):]
else:text=text.replace('  const aliases=',section+'  const aliases=')
path.write_text(text)
print('Embedded',len(drawings),'reviewed SVG illustrations')
