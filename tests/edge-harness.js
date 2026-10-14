// Evaluate the supplied server source offline. No Deno server, imports, SDK or DB.
const fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module');
function loadEdge(filename=require.resolve('../supabase/functions/request-learning-content/index.ts')){
  let seed=73;
  const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const source=fs.readFileSync(filename,'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^await import\("\.\/data\/[^\"]+"\);\r?\n/gm,'');
  const context={Math:math,structuredClone,crypto:globalThis.crypto,console,Response,Request,Date,
    LEARNING_DATA:{},Deno:{serve(handler){context.handler=handler;},env:{get(){throw new Error('Live environment access is prohibited in the offline harness.');}}}};
  vm.createContext(context);
  vm.runInContext(stripTypeScriptTypes(source,{mode:'strip'})+'\n globalThis.edgeAPI={variantExercise,variantMath,variantReading,variantEnglish,geometry:typeof variantGeometry==="function"?variantGeometry:null,matrixLanguage18,matrixAttention18,matrixMemory18,matrixExecutive20,matrixApplied20,matrixReasoning18,matrixLiteracy18,normalizeItem,validateItem,generatedItems,contentSignature,worksheetTask,localizeValue,ensureWorksheetMemoryCoherence,SUBJECTS};',context);
  return {api:context.edgeAPI,context};
}
module.exports=loadEdge;
