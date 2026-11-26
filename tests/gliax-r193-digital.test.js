'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {createRotation} = require('../js/gliax-r193-digital');

test('the automatic rotation advances after delivery only and keeps slots separate', () => {
  const screens = ['message', 'search', 'app'];
  const rotation = createRotation();
  const first = rotation.peek('primary:communication:1', screens);
  assert.equal(first.format, 'message');
  assert.deepEqual(rotation.peek('primary:communication:1', screens), first);
  rotation.confirm(first);
  const second = rotation.peek('primary:communication:1', screens);
  assert.equal(second.format, 'search');
  assert.equal(rotation.peek('primary:communication:2', screens).format, 'message');
  rotation.confirm(second);
  assert.equal(rotation.peek('primary:communication:1', screens).format, 'app');
  rotation.clear();
  rotation.confirm(first);
  assert.equal(rotation.peek('primary:communication:1', screens).format, 'message');
  assert.equal(rotation.peek('early:attention:1', []), null);
});

test('presentation is selected per operation and forced only when the task needs it', () => {
  const rotation = createRotation();
  const lookup = {type:'standard', simulation:{format:'search',operation:'verify_source'}};
  assert.equal(rotation.present('teen:communication:2', lookup), 'interactive');
  assert.equal(rotation.present('teen:communication:2', lookup), 'static');
  assert.equal(rotation.present('primary:communication:2', lookup), 'interactive');
  const timing = {type:'memoryReveal', simulation:{format:'message',operation:'recall'}};
  const planning = {type:'order', simulation:{format:'app',operation:'sequence_dependencies'}};
  assert.equal(rotation.present('m', timing), 'static');
  assert.equal(rotation.present('m', planning), 'interactive');
  assert.equal(rotation.present('m', planning), 'interactive');
});

test('new screen cases have exact versioned sources and occupy their authored slots only', () => {
  const catalogue = require('../js/communication-content');
  const model = require('../js/activity-model');
  const collected = [];
  for (const age of ['early','junior','primary','middle','teen']) {
    for (const level of [1,2,3]) {
      const options = catalogue.transversalPool(age,level,'communication',null,20);
      const prior = catalogue.transversalPool(age,level,'communication',null,19);
      assert.deepEqual(options.filter(item=>!item.id.startsWith('digital-v3:')), prior);
      for (const item of options.filter(entry=>entry.id.startsWith('digital-v3:'))) {
        model.forDelivery(item,{age_band:age},'communication');
        assert.equal(new Set(item.opts).size,3);
        assert.ok(item.opts.includes(item.a));
        assert.ok(item.why);
        assert.throws(()=>catalogue.validateTransversal({...item,a:item.opts[1]}));
        collected.push(item);
      }
    }
  }
  assert.equal(collected.length,8);
  assert.equal(new Set(collected.map(item=>item.primaryConstruct)).size,8);
  assert.deepEqual([...new Set(collected.map(item=>item.simulation.format))].sort(), ['booking','files','form','mail']);
});
