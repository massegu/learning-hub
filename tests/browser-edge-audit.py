"""Inspect actual Edge-generator samples with the real browser locale/print gates.
Input comes from EDGE_AUDIT_SAMPLES node tests/edge-audit.js; no live service calls.
Rejections are findings, not weakened assertions or evidence of a passing curriculum.
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page()
    page.route('**/*',lambda route: route.abort())
    for filename in ['stimulus-art','content-policy','activity-model','locale-content']:
        page.add_script_tag(content=(ROOT/'js'/f'{filename}.js').read_text())
    samples=json.loads(Path(sys.argv[1]).read_text())
    result=page.evaluate('''samples => {
      const report={};
      for(const country of ['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr']){
        const row={samples:samples.length,printable:0,rejected:{}};
        for(const sample of samples){
          const profile={age_band:sample.age==='junior'?'primary':sample.age,progress:{ageRoute:sample.age}};
          try{
            const item=LocaleContent.localizeItem(sample.item,country,sample.domain);
            const model=ActivityModel.printable(item,profile);
            LocaleContent.localizeModel(model,country,sample.domain,item);
            ActivityModel.interactiveStimulus(model.stimulus);
            row.printable++;
          }catch(error){row.rejected[error.message]=(row.rejected[error.message]||0)+1;}
        }
        report[country]=row;
      }
      return report;
    }''',samples)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    browser.close()
