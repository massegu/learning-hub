// Evaluate the real local Edge modules offline; only SDK/env/server/DB are mocked.
const fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module'),path=require('node:path');
function loadEdge(filename=require.resolve('../supabase/functions/request-learning-content/index.ts')){
  let seed=73;
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  let source=fs.readFileSync(filename,'utf8').replace(/^import .*;\r?\n/gm,'');
  const context={Math:math,structuredClone,crypto:globalThis.crypto,console,Response,Request,Date,
    LEARNING_DATA:{},Deno:{serve(handler){context.handler=handler;},env:{get(){throw new Error('Live environment access is prohibited in the offline harness.');}}}};
  vm.createContext(context);
  vm.runInContext('globalThis.window=globalThis;',context);
  const functionRoot=path.dirname(require.resolve('../supabase/functions/request-learning-content/index.ts'));
  const loadedImports=[];
  for(const match of source.matchAll(/^await import\("(\.\/[^"]+)"\);\r?\n/gm)){
    const filename=path.resolve(functionRoot,match[1]);
    vm.runInContext(fs.readFileSync(filename,'utf8'),context,{filename});
    loadedImports.push(match[1]);
  }
  source=source.replace(/^await import\("\.\/[^"]+"\);\r?\n/gm,'');
  vm.runInContext(stripTypeScriptTypes(source,{mode:'strip'})+'\n globalThis.edgeAPI={junior:globalThis.JuniorContent||null,primary:globalThis.PrimaryContent||null,middle:globalThis.MiddleContent||null,variantExercise,variantMath,variantReading,variantEnglish,geometry:typeof variantGeometry==="function"?variantGeometry:null,matrixLanguage18,matrixAttention18,matrixMemory18,matrixExecutive20,matrixApplied20,matrixReasoning18,matrixLiteracy18,normalizeItem,validateItem,generatedItems,contentSignature,worksheetTask,localizeValue,regionalCandidate,matrixSocial18,ensureWorksheetMemoryCoherence,SUBJECTS,academicPool};',context);
  return {api:context.edgeAPI,context,loadedImports};
}
module.exports=loadEdge;
