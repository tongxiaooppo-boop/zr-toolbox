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
  assert.deepEqual(CAPS.map(c => c.key), ['noLoss', 'lowCash', 'age60']);
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
  '29 歲正2 老手': [[5, 4, 4, 4, 5, 5, 4, 5, 5, 4], 45, 'aggressive']
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

  const senior = scoreQuiz([1, 5, 5, 5, 5, 5, 5, 5, 5, 5]); // 46 積極 → 60 歲 → 成長
  assert.equal(senior.key, 'growth');
  assert.deepEqual(senior.caps.map(c => c.key), ['age60']);

  assert.deepEqual(scoreQuiz(PERSONAS['退休 67 歲'][0]).caps, []);     // 本來就保守，60 歲封頂不列
  assert.deepEqual(scoreQuiz(PERSONAS['學生 20 歲新手'][0]).caps, []); // 本來就保守，不能虧封頂不列
});

test('riskquiz: 正2 fit needs aggressive + income ≥4 + cash ≥4 + halve', () => {
  const fails = a => scoreQuiz(a).zr.checks.filter(c => !c.ok).map(c => c.key);
  assert.equal(scoreQuiz(PERSONAS['29 歲正2 老手'][0]).zr.ok, true);
  assert.deepEqual(fails(PERSONAS['28 歲穩定、可虧 20%'][0]), ['halve']);
  assert.deepEqual(fails([5, 5, 3, 5, 5, 5, 5, 5, 5, 5]), ['cash']);
  assert.deepEqual(fails([5, 2, 2, 2, 4, 5, 3, 5, 5, 5]), ['aggressive', 'income', 'cash']);
  assert.deepEqual(fails(PERSONAS['35 歲 0050 定期定額'][0]), ['aggressive', 'cash', 'halve']);
  assert.equal(scoreQuiz(PERSONAS['29 歲正2 老手'][0]).zr.checks.length, 4);
});

test('riskquiz: errors', () => {
  assert.throws(() => scoreQuiz([1, 2, 3]), /題目數量不對/);
  assert.throws(() => scoreQuiz([5, 4, NaN, 3, 4, 5, 4, 3, 4, 3]), /第 3 題還沒選/);
  assert.throws(() => scoreQuiz([5, 4, 4, 3, 4, 5, 4, 3, 4, 6]), /第 10 題還沒選/);
  assert.throws(() => scoreQuiz([5, 4, 4, 3, 4, 5, 4, 3, 4, undefined]), /第 10 題還沒選/);
});

import { BUCKETS, ALLOC, allocationPlan } from '../js/core/riskquiz.js';

test('allocation: every cell sums to 100; dominant bucket ≥ 50; bold shrinks with age', () => {
  assert.deepEqual(BUCKETS.map(b => b.key), ['safe', 'growth', 'bold']);
  const main = { conservative: 0, balanced: 0, growthHigh: 1, growthLow: 1, aggressive: 2 };
  for (const [row, cells] of Object.entries(ALLOC)) {
    assert.equal(cells.length, 5, row);
    cells.forEach((c, i) => {
      assert.equal(c[0] + c[1] + c[2], 100, `${row}[${i}]`);
      if (row !== 'aggressive' || i === 0) assert.ok(c[main[row]] >= 50, `${row}[${i}] 主力桶`); // 積極型的主力就是積極桶，隨年齡 50→45→40→30→20（使用者 2026-11-25 同意）
      if (i) assert.ok(c[2] <= cells[i - 1][2], `${row}[${i}] 積極桶不增`);
    });
  }
});

test('allocation: lookups by type, age (Q1 score) and loss (Q8 score)', () => {
  const pick = p => [p.safe, p.growth, p.bold];
  assert.deepEqual(pick(allocationPlan({ key: 'aggressive', age: 5, loss: 5 })), [20, 30, 50]);   // 5/3/2 原型
  assert.deepEqual(pick(allocationPlan({ key: 'aggressive', age: 1, loss: 5 })), [50, 30, 20]);
  assert.deepEqual(pick(allocationPlan({ key: 'balanced', age: 4, loss: 3 })), [50, 30, 20]);
  assert.deepEqual(pick(allocationPlan({ key: 'conservative', age: 3, loss: 1 })), [80, 20, 0]);
  assert.deepEqual(pick(allocationPlan({ key: 'growth', age: 5, loss: 4 })), [20, 50, 30]);
  assert.deepEqual(pick(allocationPlan({ key: 'growth', age: 5, loss: 3 })), [30, 50, 20]);
  assert.deepEqual(pick(allocationPlan({ key: 'growth', age: 2, loss: 5 })), [40, 50, 10]);
  const p = allocationPlan({ key: 'growth', age: 3, loss: 2 });
  assert.equal(p.band, '40–49 歲'); assert.equal(p.row, 'growthLow');
  assert.throws(() => allocationPlan({ key: 'x', age: 3, loss: 3 }), /型態不對/);
  assert.throws(() => allocationPlan({ key: 'growth', age: 0, loss: 3 }), /第 1 題/);
  assert.throws(() => allocationPlan({ key: 'growth', age: 3, loss: NaN }), /第 8 題/);
});

import { LOSS_LIMITS, SCENARIOS, comparePortfolio } from '../js/core/riskquiz.js';

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-3, `${msg}: ${a} ≠ ${b}`);

test('compare: 過熱例 10/20/40/30 萬 vs 穩健型 50/30/20、可承受 20%（R12 2.4 驗算）', () => {
  const r = comparePortfolio({ safe: 100000, growth: 200000, lever: 400000, stock: 300000, loss: 3,
    plan: { safe: 50, growth: 30, bold: 20 } });
  assert.equal(r.total, 1000000);
  near(r.now.bold, 0.7, 'now.bold'); near(r.diff.safe, -0.4, 'diff.safe'); near(r.diff.bold, 0.5, 'diff.bold');
  near(r.exposure, 1.3, 'exposure'); assert.equal(r.borrowed, true); assert.equal(r.limit, 0.2);
  const [a, b, c] = r.scenarios;
  near(a.loss, -0.6463, '2008'); near(b.loss, -0.3708, '2020'); near(c.loss, -0.3524, '2022');
  near(a.amount, -646300, '2008 金額'); near(a.times, 3.2315, '2008 倍數'); near(b.times, 1.854, '2020 倍數');
  assert.deepEqual(r.scenarios.map(s => [s.over, s.approx]), [[true, true], [true, false], [true, true]]);
});

test('compare: 照建議配、不放正2 → 曝險 ≤ 1、approx 不標', () => {
  const r = comparePortfolio({ safe: 50, growth: 30, lever: 0, stock: 20, loss: 3, plan: { safe: 50, growth: 30, bold: 20 } });
  near(r.exposure, 0.5, 'exposure'); assert.equal(r.borrowed, false);
  near(r.diff.safe, 0, 'diff'); near(r.scenarios[0].loss, -0.3715, '2008'); // .5×-.163＋.3×-.58＋.2×-.58
  assert.equal(r.scenarios.some(s => s.approx), false);
});

test('compare: 第 8 題選不能虧 → times 為 null；錯誤輸入', () => {
  const plan = { safe: 80, growth: 20, bold: 0 };
  const r = comparePortfolio({ safe: 1, growth: 0, lever: 0, stock: 0, loss: 1, plan });
  assert.equal(r.limit, 0); assert.equal(r.scenarios[0].times, null); assert.equal(r.scenarios[0].over, true);
  assert.deepEqual(LOSS_LIMITS, [0, 0.1, 0.2, 0.3, 0.5]); assert.equal(SCENARIOS.length, 3);
  assert.throws(() => comparePortfolio({ safe: 0, growth: 0, lever: 0, stock: 0, loss: 3, plan }), /至少要有一格/);
  assert.throws(() => comparePortfolio({ safe: -1, growth: 5, lever: 0, stock: 0, loss: 3, plan }), /保守穩健/);
  assert.throws(() => comparePortfolio({ safe: 1, growth: NaN, lever: 0, stock: 0, loss: 3, plan }), /成長/);
  assert.throws(() => comparePortfolio({ safe: 1, growth: 0, lever: 0, stock: 0, loss: 0, plan }), /第 8 題/);
  assert.throws(() => comparePortfolio({ safe: 1, growth: 0, lever: 0, stock: 0, loss: 3 }), /先完成測驗/);
});
