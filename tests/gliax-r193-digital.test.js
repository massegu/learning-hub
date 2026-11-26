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
