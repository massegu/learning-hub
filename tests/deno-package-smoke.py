"""Native Deno load/HTTP smoke with the real SDK and all local data modules.
The inaccessible JSR ambient-type import is explicitly mapped to an empty local
DIAGNOSTIC placeholder. This does not establish official JSR resolution/type parity.
No Supabase credentials or outbound runtime access are granted.
"""
import json,os,selectors,subprocess,tempfile,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='learning-hub-native-') as temp:
    folder=Path(temp)
    ambient=folder/'diagnostic-types.d.ts';ambient.write_text('export {};\n')
    imports=folder/'imports.json';imports.write_text(json.dumps({'imports':{'jsr:@supabase/functions-js/edge-runtime.d.ts':ambient.as_uri()}}))
    entry=folder/'entry.ts';entry.write_text('''const serve=Deno.serve;
(Deno as any).serve=(handler:any)=>serve({hostname:'127.0.0.1',port:0,onListen({port}){
  const data=(globalThis as any).LEARNING_DATA;
  const total=Object.values(data).reduce((sum:number,band:any)=>sum+band.subjects.reduce((n:number,key:string)=>n+(Array.isArray(band[key])?band[key].length:Object.values(band[key]).reduce((v:number,bank:any)=>v+bank.length,0)),0),0);
  console.log(JSON.stringify({port,bands:Object.keys(data),total,authored:['JuniorContent','PrimaryContent','MiddleContent','TeenReview'].filter(key=>typeof (globalThis as any)[key]?.generate==='function')}));
}},handler);
await import('''+json.dumps((ROOT/'supabase/functions/request-learning-content/index.ts').as_uri())+''');
''')
    binary=os.environ.get('EDGE_DENO_BINARY','deno')
    subprocess.run([binary,'check','--cached-only','--node-modules-dir=none','--no-lock',f'--import-map={imports}',str(ROOT/'supabase/functions/request-learning-content/index.ts')],cwd=ROOT,check=True,timeout=30)
    command=[binary,'run','--no-check','--cached-only','--node-modules-dir=none','--no-lock','--allow-net=127.0.0.1',f'--import-map={imports}',str(entry)]
    with tempfile.TemporaryFile(mode='w+t') as errors:
        process=subprocess.Popen(command,cwd=ROOT,stdout=subprocess.PIPE,stderr=errors,text=True)
        try:
            selector=selectors.DefaultSelector();selector.register(process.stdout,selectors.EVENT_READ)
            if not selector.select(timeout=30):raise AssertionError('Native startup did not complete in 30 seconds.')
            line=process.stdout.readline()
            if not line:
                errors.seek(0);raise AssertionError(errors.read())
            ready=json.loads(line);assert ready['bands']==['primary','middle','teen'],ready;assert ready['total']==1080,ready;assert ready['authored']==['JuniorContent','PrimaryContent','MiddleContent','TeenReview'],ready
            origin=f'http://127.0.0.1:{ready["port"]}'
            for method,status in [('OPTIONS',200),('GET',405),('POST',401)]:
                request=urllib.request.Request(origin,method=method,data=b'{}' if method=='POST' else None)
                try:response=urllib.request.urlopen(request,timeout=5)
                except urllib.error.HTTPError as error:response=error
                with response:
                    assert response.status==status,(method,response.status)
                    assert response.headers['Access-Control-Allow-Origin']=='*'
                    body=response.read().decode()
                    if method=='POST':assert json.loads(body)['error']=='Authentication required'
            print('PASS: diagnostic Deno type check passes; native Deno loads the real SDK, nine local modules and 1080 legacy items; OPTIONS 200, GET 405, unauthenticated POST 401.')
            print('LIMIT: JSR ambient types substituted locally; no credentials, production calls or full deployment validation.')
        finally:
            process.terminate()
            try:process.wait(timeout=10)
            except subprocess.TimeoutExpired:process.kill();process.wait(timeout=5)
