// 新手路線（Opus 定預期值；外包不得改）。決策 docs/decision/決策-2026-11-25-科普梳理.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, PATH, pathPlace } from '../js/data/tools.js';

test('path: 5 steps in order, every id exists, no duplicates', () => {
  assert.deepEqual(PATH.map(p => p.step), [1, 2, 3, 4, 5]);
  const ids = PATH.flatMap(p => p.ids);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(TOOLS.some(t => t.id === id), id);
  assert.deepEqual(ids, ['riskquiz', 'riskprofile', 'basics', 'products', 'etf101', 'dca', 'crash', 'zr101', 'decay', 'recover', 'loans']);
});

test('path: pathPlace gives step and next ready tool, skipping planned ones', () => {
  const rp = TOOLS.find(t => t.id === 'riskprofile');
  const quiz = pathPlace('riskquiz');
  assert.equal(quiz.step, 1); assert.equal(quiz.title, '認識自己');
  assert.equal(quiz.next.id, rp.status === 'ready' ? 'riskprofile' : 'basics'); // ㉗ 做好前跳過
  assert.equal(pathPlace('etf101').next.id, 'dca');    // 第 3 步：⑦ 持續投入（2026-11-25 加）
  const crash = TOOLS.find(t => t.id === 'crash');
  assert.equal(pathPlace('dca').next.id, crash.status === 'ready' ? 'crash' : 'zr101'); // ㉙ 股災與心態（2026-11-25 加）
  assert.equal(pathPlace('crash').step, 3);
  if (crash.status === 'ready') assert.equal(pathPlace('crash').next.id, 'zr101');
  assert.equal(pathPlace('decay').next.id, TOOLS.find(t => t.id === 'recover').status === 'ready' ? 'recover' : 'loans'); // ㉕ 做好前跳過
  assert.equal(pathPlace('loans').step, 5);
  assert.equal(pathPlace('loans').next, null);
  assert.equal(pathPlace('kelly'), null);               // 不在路線上
});
