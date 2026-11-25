// ㉖ 投資屬性測驗（Opus 定預期值；外包不得改）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, PROFILES, CAPS, scoreQuiz } from '../js/core/riskquiz.js';

test('riskquiz: 10 questions × 5 options scored 1–5; profiles cover 10–50 without gaps', () => {
  assert.equal(QUESTIONS.length, 10);
  QUESTIONS.forEach((q, i) => {
    assert.equal(q.no, i + 1);
    assert.deepEqual(q.options.map(o => o.score), [1, 2, 3, 4, 5], q.id);
    assert.ok(q.text && q.hint, q.id);
  });
  assert.deepEqual(PROFILES.map(p => [p.key, p.min, p.max, p.rr]),
    [['conservative', 10, 24, 2], ['balanced', 25, 33, 3], ['growth', 34, 38, 4], ['aggressive', 39, 50, 5]]);
  assert.deepEqual(CAPS.map(c => c.key), ['noLoss', 'lowCash', 'age65']);
});

// 人設校準（2026-11-25）：[答案, 總分, 最終型態]
const PERSONAS = {
  '退休 67 歲': [[1, 1, 5, 5, 3, 2, 2, 2, 2, 1], 24, 'conservative'],
  '學生 20 歲新手': [[5, 1, 2, 1, 1, 3, 1, 1, 3, 4], 22, 'conservative'],
  '45 歲上班族買基金': [[3, 4, 4, 3, 3, 3, 3, 2, 3, 2], 30, 'balanced'],
  '55 歲老手怕虧': [[2, 4, 5, 5, 4, 3, 3, 2, 3, 2], 33, 'balanced'],
  '23 歲新手想衝': [[5, 4, 3, 1, 1, 5, 2, 4, 3, 5], 33, 'balanced'],
  '35 歲 0050 定期定額': [[4, 4, 3, 3, 4, 5, 3, 3, 4, 2], 35, 'growth'],
  '28 歲穩定、可虧 20%': [[5, 4, 4, 3, 4, 5, 4, 3, 4, 3], 39, 'aggressive'],
  '30 歲正2 老手': [[5, 4, 4, 4, 5, 5, 4, 5, 5, 4], 45, 'aggressive']
};
for (const [name, [a, total, key]] of Object.entries(PERSONAS)) {
  test(`riskquiz persona: ${name}`, () => {
    const r = scoreQuiz(a);
    assert.equal(r.total, total);
    assert.equal(r.key, key);
    assert.equal(r.profile.key, key);
  });
}

test('riskquiz: boundaries 24/25, 33/34, 38/39', () => {
  const k = a => scoreQuiz(a).key;
  assert.equal(k([2, 2, 2, 2, 2, 2, 2, 2, 4, 4]), 'conservative'); // 24
  assert.equal(k([2, 2, 3, 2, 2, 2, 2, 2, 4, 4]), 'balanced');     // 25
  assert.equal(k([3, 3, 3, 3, 3, 3, 3, 3, 4, 5]), 'balanced');     // 33
  assert.equal(k([3, 3, 3, 3, 3, 3, 3, 3, 5, 5]), 'growth');       // 34
  assert.equal(k([4, 4, 4, 4, 4, 4, 4, 4, 3, 3]), 'growth');       // 38
  assert.equal(k([4, 4, 4, 4, 4, 4, 4, 4, 4, 3]), 'aggressive');   // 39
});

test('riskquiz: caps only listed when they lower the type', () => {
  const freelancer = scoreQuiz([5, 2, 2, 2, 4, 5, 3, 5, 5, 5]); // 38 成長 → 備用金不足 → 穩健
  assert.equal(freelancer.total, 38);
  assert.equal(freelancer.scoreKey, 'growth');
  assert.equal(freelancer.key, 'balanced');
  assert.deepEqual(freelancer.caps.map(c => c.key), ['lowCash']);

  const noLoss = scoreQuiz([5, 4, 4, 3, 4, 5, 4, 1, 4, 3]); // 37 成長 → 不能虧 → 保守
  assert.equal(noLoss.key, 'conservative');
  assert.deepEqual(noLoss.caps.map(c => c.key), ['noLoss']);

  const both = scoreQuiz([5, 4, 2, 3, 4, 5, 4, 1, 4, 3]); // 35 成長，兩條都往下拉 → 取最低
  assert.equal(both.key, 'conservative');
  assert.deepEqual(both.caps.map(c => c.key), ['noLoss', 'lowCash']);

  const senior = scoreQuiz([1, 5, 5, 5, 5, 5, 5, 5, 5, 5]); // 46 積極 → 65 歲 → 成長
  assert.equal(senior.key, 'growth');
  assert.deepEqual(senior.caps.map(c => c.key), ['age65']);

  assert.deepEqual(scoreQuiz(PERSONAS['退休 67 歲'][0]).caps, []);     // 本來就保守，65 歲封頂不列
  assert.deepEqual(scoreQuiz(PERSONAS['學生 20 歲新手'][0]).caps, []); // 本來就保守，不能虧封頂不列
});

test('riskquiz: 正2 fit needs aggressive + income ≥4 + cash ≥4 + halve', () => {
  const fails = a => scoreQuiz(a).zr.checks.filter(c => !c.ok).map(c => c.key);
  assert.equal(scoreQuiz(PERSONAS['30 歲正2 老手'][0]).zr.ok, true);
  assert.deepEqual(fails(PERSONAS['28 歲穩定、可虧 20%'][0]), ['halve']);
  assert.deepEqual(fails([5, 5, 3, 5, 5, 5, 5, 5, 5, 5]), ['cash']);
  assert.deepEqual(fails([5, 2, 2, 2, 4, 5, 3, 5, 5, 5]), ['aggressive', 'income', 'cash']);
  assert.deepEqual(fails(PERSONAS['35 歲 0050 定期定額'][0]), ['aggressive', 'cash', 'halve']);
  assert.equal(scoreQuiz(PERSONAS['30 歲正2 老手'][0]).zr.checks.length, 4);
});

test('riskquiz: errors', () => {
  assert.throws(() => scoreQuiz([1, 2, 3]), /題目數量不對/);
  assert.throws(() => scoreQuiz([5, 4, NaN, 3, 4, 5, 4, 3, 4, 3]), /第 3 題還沒選/);
  assert.throws(() => scoreQuiz([5, 4, 4, 3, 4, 5, 4, 3, 4, 6]), /第 10 題還沒選/);
  assert.throws(() => scoreQuiz([5, 4, 4, 3, 4, 5, 4, 3, 4, undefined]), /第 10 題還沒選/);
});
