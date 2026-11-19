const test=require('node:test'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const families=require('../js/cognitive-families');
const curriculum=require('../js/curriculum');
const junior=require('../supabase/functions/request-learning-content/junior');
const ages=['early','junior','primary','middle','teen'];
const levels=[1,2,3];

test('word choice is available only for the two youngest stages in levels 1 and 2 and requires all valid choices',()=>{
  for(const age of ages)for(const level of levels)for(const domain of ['language','speedReasoning']){
    for(const item of families.pool(age,domain,level,'words')){
      const selection=['early','junior'].includes(age)&&level<3;
      assert.equal(families.wordResponseMode(item),selection?'selection':'written');
      const choices=families.wordChoices(item);
      const correct=choices.filter(word=>families.wordFits(word,item.cognitiveTask));
      if(selection){
        assert.ok(correct.length&&correct.length<choices.length);
        assert.equal(families.gradeWordSelection(item,correct),true);
        assert.equal(families.gradeWordSelection(item,correct.slice(1)),false);
        assert.equal(families.gradeWordSelection(item,[...correct,'respuesta ajena']),false);
      }else assert.deepEqual(choices,[]);
      assert.equal(families.productionStatus(item,item.cognitiveTask.answer[0].toUpperCase()),'correct');
      assert.equal(families.productionStatus(item,'texto sin revisar zz'),'unreviewed');
    }
  }
});

test('transcription progresses across 15 age/level cells and preserves accents and ñ',()=>{
  for(const age of ages)for(const level of levels){
    assert.equal(families.pool(age,'language',level).some(it=>it.cognitiveTask.kind==='falling'),false);
    assert.equal(families.pool(age,'executive',level,'falling').length,0);
    const rounds=families.pool(age,'language',level,'falling');
    assert.equal(rounds.length,4);
    for(const item of rounds){
      assert.ok(families.validate(item));
      const task=item.cognitiveTask;
      assert.equal(task.prompts.length,[4,6,8][level-1]);
      assert.equal(new Set(task.prompts).size,task.prompts.length);
      assert.throws(()=>families.printable(item),/temporal/);
      assert.throws(()=>families.validate({...item,cognitiveTask:{...task,prompts:['otro']}}),/cambiado/);
    }
  }
  assert.ok(families.matchesTranscription('limón',' LIMO\u0301N '));
  assert.equal(families.matchesTranscription('limón','limon'),false);
  assert.equal(families.matchesTranscription('año','ano'),false);
});

test('Edge enables the new selectors only for compatible clients and keeps default delivery',()=>{
  const base={kind:'exercise',profile_id:'primary',domain:'language',count:1,level:2,cognitive_only:true};
  const requests=[
    {...base,client_revision:13,cognitive_family:'falling'},
    {...base,client_revision:14,cognitive_family:'falling'},
    {...base,client_revision:13},
    {...base,client_revision:14,domain:'speedReasoning',cognitive_family:'words'},
    {...base,client_revision:14,domain:'executive',cognitive_family:'falling'}
  ];
  const rows=execFileSync(process.execPath,['tests/edge-worker.js','primary'],{input:requests.map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);
  assert.deepEqual(rows.map(row=>row.status),[409,200,200,200,400]);
  assert.deepEqual(rows.slice(1,4).map(row=>row.data.items[0].cognitiveTask.kind),['falling','words','words']);
  for(const row of rows.slice(1,4))assert.ok(families.validate(row.data.items[0]));
  assert.equal(rows[3].data.items[0].semanticFamily,'cognitive.words_selection');
});

test('level two association exposure and evidence are versioned across five age groups',()=>{
  for(const age of ages)for(const level of levels){
    const rows=curriculum.pool(age,'memory',level).filter(it=>it.mechanic==='memory_association');
    assert.ok(rows.length>0);
    for(const item of rows){
      assert.equal(item.memoryAssociationRevision,2);
      assert.match(item.contentKey,/association-v2-/);
      const shown=item.memoryContent.map(pair=>pair.detail);
      if(level===1)assert.ok(item.opts.some(option=>!shown.includes(option)));
      else assert.ok(item.opts.every(option=>shown.includes(option)));
      if(level===2){
        assert.ok(shown.length<=5);
        assert.ok(item.revealMs/shown.length>=2200);
      }
      const {row,column}=item.answerEvidence;
      assert.equal(item.a,item.stimulus[0].rows[row][column]);
    }
  }
});

test('junior planning supplies dependencies and an unordered response bank',()=>{
  for(const level of levels){
    const rows=junior.pool('executive',level).filter(it=>it.mechanic==='sequence');
    assert.equal(rows.length,6);
    for(const it of rows){
      assert.equal(it.activityRevision,2);
      assert.notDeepEqual(it.answer,it.tokens);
      assert.deepEqual([...it.answer].sort(),[...it.tokens].sort());
      assert.ok(it.stimulus.every(block=>block.type==='text'));
    }
  }
});
