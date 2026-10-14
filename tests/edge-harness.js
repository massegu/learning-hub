// Evaluate the supplied server source offline. No Deno server, imports, SDK or DB.
const fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module');
function loadEdge(filename=require.resolve('../supabase/functions/request-learning-content/index.ts')){
  let seed=73;
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  let source=fs.readFileSync(filename,'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^await import\("\.\/data\/[^\"]+"\);\r?\n/gm,'');
  const context={Math:math,structuredClone,crypto:globalThis.crypto,console,Response,Request,Date,
    LEARNING_DATA:{},Deno:{serve(handler){context.handler=handler;},env:{get(){throw new Error('Live environment access is prohibited in the offline harness.');}}}};
  vm.createContext(context);
  if(source.includes('await import("./junior.js")')) vm.runInContext(fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/junior.js'),'utf8'),context);
  if(source.includes('await import("./primary-content.js")')) vm.runInContext(fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/primary-content.js'),'utf8'),context);
  source=source.replace(/^await import\("\.\/primary-content\.js"\);\r?\n/gm,'');
  source=source.replace(/^await import\("\.\/junior\.js"\);\r?\n/gm,'');
  vm.runInContext(stripTypeScriptTypes(source,{mode:'strip'})+'\n globalThis.edgeAPI={junior:globalThis.JuniorContent||null,primary:globalThis.PrimaryContent||null,variantExercise,variantMath,variantReading,variantEnglish,geometry:typeof variantGeometry==="function"?variantGeometry:null,matrixLanguage18,matrixAttention18,matrixMemory18,matrixExecutive20,matrixApplied20,matrixReasoning18,matrixLiteracy18,normalizeItem,validateItem,generatedItems,contentSignature,worksheetTask,localizeValue,ensureWorksheetMemoryCoherence,SUBJECTS};',context);
  return {api:context.edgeAPI,context};
}
module.exports=loadEdge;
