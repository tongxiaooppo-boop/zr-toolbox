// ⑦ v5.12 持續投入＋複利科普。預期值由 Opus 用 Python 獨立逐月重算（不是拿程式自己的輸出），外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { accumulatePlan, scenarioPlans, growthByDecade, dcaPricePath, sellAtBottom, dcaPlan, LESSON_PRICES } from '../js/core/dca.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
// 頁面範例：目前持股 10 萬；第 1 段 第 0–20 年每月 5,000；第 2 段 第 10–20 年每月追加 5,000；投入期 6%、停扣後 4%；算到第 30 年；通膨 2%
const EX = { initial: 100000, initialReturn: 0.06, horizon: 30, inflation: 0.02, stages: [
  { start: 0, stop: 20, monthly: 5000, annualReturn: 0.06, holdReturn: 0.04 },
  { start: 10, stop: 20, monthly: 5000, annualReturn: 0.06, holdReturn: 0.04 }] };

test('accumulate ⑦ page example: two stages plus existing holdings', () => {
  const r = accumulatePlan(EX);
  assert.equal(Math.round(r.finalValue), 5155039);
  assert.equal(Math.round(r.stageValues[0]), 3372335); assert.equal(Math.round(r.stageValues[1]), 1208355);
  assert.equal(Math.round(r.initialValue), 574349); // 100,000 × 1.06^30
  assert.equal(r.contributed, 1800000); assert.equal(r.principal, 1900000); assert.equal(r.fees, 2520); // 7 元 × 360 次
  assert.equal(Math.round(r.gain), 5155039 - 1900000 - 2520);
  assert.equal(Math.round(r.realFinal), 2845947);
  assert.equal(r.rows.length, 30); assert.equal(r.rows[9].principal, 100000 + 600000); assert.equal(r.rows[19].principal, 1900000);
  close(r.rows[29].value, r.finalValue, 1e-9);
});

test('accumulate ⑦: one stage from year 0 equals dcaPlan', () => {
  const r = accumulatePlan({ horizon: 20, stages: [{ start: 0, stop: 20, monthly: 5000, annualReturn: 0.06 }] });
  assert.equal(Math.round(r.finalValue), 2278229);
  const d = dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06, stepUp: 0.03, timing: 'end' });
  const a = accumulatePlan({ horizon: 20, timing: 'end', stages: [{ start: 0, stop: 20, monthly: 5000, annualReturn: 0.06, stepUp: 0.03 }] });
  close(a.finalValue, d.finalValue, 1e-6); assert.equal(a.fees, d.fees); assert.equal(a.contributed, d.contributed);
});

test('accumulate ⑦: three scenarios shift every return by 2 points', () => {
  const s = scenarioPlans(EX);
  assert.deepEqual(s.map(x => x.label), ['悲觀', '中性', '樂觀']);
  assert.deepEqual(s.map(x => Math.round(x.plan.finalValue)), [3446239, 5155039, 7757253]);
  close(s[0].shift, -0.02, 1e-12);
});

test('compound lesson: early 10 years beats late 30 years (5,000 a month, 6%, look at year 40)', () => {
  const early = accumulatePlan({ horizon: 40, stages: [{ start: 0, stop: 10, monthly: 5000, annualReturn: 0.06 }] });
  const late = accumulatePlan({ horizon: 40, stages: [{ start: 10, stop: 40, monthly: 5000, annualReturn: 0.06 }] });
  assert.equal(early.contributed, 600000); assert.equal(Math.round(early.finalValue), 4688535);
  assert.equal(late.contributed, 1800000); assert.equal(Math.round(late.finalValue), 4896282);
});

test('compound lesson: later decades earn more (5,000 a month, 6%, 30 years)', () => {
  const g = growthByDecade(5000, 0.06, 3);
  assert.deepEqual(g.map(x => Math.round(x.earned)), [216321, 861907, 2018053]);
  assert.deepEqual(g.map(x => Math.round(x.value)), [816321, 2278229, 4896282]);
  assert.equal(g[2].put, 600000);
});

const PRICES = [100, 90, 80, 70, 60, 60, 70, 80, 90, 100, 100, 100];
test('compound lesson: LESSON_PRICES is the 12-month dip-and-recover path', () => assert.deepEqual([...LESSON_PRICES], PRICES));
test('compound lesson: same amount each month buys more when cheap', () => {
  const r = dcaPricePath(PRICES, 5000);
  assert.equal(r.put, 60000); assert.equal(r.avgCost.toFixed(2), '80.47'); assert.equal(r.avgPrice.toFixed(2), '83.33');
  assert.equal(Math.round(r.value), 74563); assert.equal(Math.round(r.gain), 14563);
});

test('compound lesson: selling at the bottom locks the loss', () => {
  const r = sellAtBottom(PRICES, 5000, 4);
  assert.equal(r.sold.put, 25000); assert.equal(Math.round(r.sold.got), 19369); assert.equal(Math.round(r.sold.gain), -5631);
  assert.equal(r.sold.price, 60); assert.equal(Math.round(r.keep.value), 74563);
});

test('accumulate ⑦: bad inputs give a readable message', () => {
  const st = [{ start: 0, stop: 10, monthly: 5000, annualReturn: 0.06 }];
  assert.throws(() => accumulatePlan({ horizon: 10, stages: [] }), /1 或 2 段/);
  assert.throws(() => accumulatePlan({ horizon: 10, stages: [...st, ...st, ...st] }), /1 或 2 段/);
  assert.throws(() => accumulatePlan({ horizon: 5, stages: st }), /停扣/);
  assert.throws(() => accumulatePlan({ horizon: 10, stages: [{ ...st[0], start: 10 }] }), /開始/);
  assert.throws(() => accumulatePlan({ horizon: 10, stages: [{ ...st[0], monthly: 0 }] }), /第 1 段每月投入/);
  assert.throws(() => accumulatePlan({ horizon: 10, stages: [st[0], { ...st[0], holdReturn: 4 }] }), /第 2 段假設年報酬/);
  assert.throws(() => accumulatePlan({ horizon: 0, stages: st }), /第幾年/);
  assert.throws(() => accumulatePlan({ horizon: 10, stages: st, initial: -1 }), /持股市值/);
  assert.throws(() => accumulatePlan({ horizon: 10, stages: st, inflation: -0.01 }), /通膨/);
  assert.throws(() => sellAtBottom(PRICES, 5000, 11), /賣出/);
});
