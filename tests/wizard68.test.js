// ⑥ ⑧ 精靈（v5.9）。預期值由 Opus 用封閉公式手算，外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { decayPlan } from '../js/core/decay.js';
import { drawdownPlan } from '../js/core/drawdown.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

test('decay ⑥ wizard example: chop 20 days ±5%, 100 萬 → index 0.9975^10, 正二 0.99^10', () => {
  const r = decayPlan({ kind: 'chop', days: 20, size: .05, amount: 1000000 });
  close(r.indexTotal, .9975 ** 10 - 1); close(r.leveredTotal, .99 ** 10 - 1); close(r.naive, 2 * (.9975 ** 10 - 1));
  close(r.moneyIndex, 1e6 * .9975 ** 10, 1e-3); close(r.moneyLevered, 1e6 * .99 ** 10, 1e-3);
  close(r.moneyNaive, 1e6 * (1 + 2 * (.9975 ** 10 - 1)), 1e-3); close(r.moneyGap, 1e6 * r.gap, 1e-3);
  assert.equal(Math.round(r.moneyLevered), 904382); assert.equal(Math.round(r.moneyIndex), 975279); assert.equal(Math.round(r.moneyNaive), 950559);
  assert.equal(r.leveredPath.length, 21); assert.equal(r.dailyCost, 0);
});
test('decay ⑥ wizard: trend +10% in 10 days beats ×2; no amount → money null', () => {
  const r = decayPlan({ kind: 'trend', days: 10, size: .1 });
  const g = 1.1 ** .1 - 1;
  close(r.indexTotal, .1); close(r.leveredTotal, (1 + 2 * g) ** 10 - 1); assert.ok(r.gap > 0);
  assert.equal(r.moneyLevered, null); assert.equal(r.moneyGap, null);
});
test('decay ⑥ wizard: 1% yearly cost over 250 flat days ≈ −0.995%', () => {
  const r = decayPlan({ kind: 'trend', days: 250, size: 0, annualCost: .01 });
  close(r.dailyCost, .00004); close(r.leveredTotal, (1 - .00004) ** 250 - 1); close(r.indexTotal, 0);
  assert.throws(() => decayPlan({ kind: 'chop', days: 20, size: .05, annualCost: .2 }), /內扣費用/);
  assert.throws(() => decayPlan({ kind: 'chop', days: 20, size: .05, amount: -1 }), /投入金額/);
});
test('drawdown ⑧ wizard example: 0050 1,000 股 200 → 150, 8% a year', () => {
  const r = drawdownPlan({ mode: 'holding', shares: 1000, buyPrice: 200, nowPrice: 150, annual: .08 });
  close(r.drop, .25); close(r.recovery, 1 / 3); assert.equal(r.base, 200); assert.equal(r.current, 150);
  close(r.loss, 50000); close(r.years, Math.log(4 / 3) / Math.log(1.08)); assert.equal(r.years.toFixed(1), '3.7');
  assert.equal(r.up, 0); assert.equal(r.peakIndex, null); assert.equal(r.table.length, 8); close(r.table[4].gain, 1);
});
test('drawdown ⑧ wizard: holding above cost → drop 0, up 10%, loss negative, no years', () => {
  const r = drawdownPlan({ mode: 'holding', shares: 1000, buyPrice: 100, nowPrice: 110, annual: .08 });
  assert.equal(r.drop, 0); assert.equal(r.recovery, 0); close(r.up, .1); close(r.loss, -10000); assert.equal(r.years, null);
});
test('drawdown ⑧ wizard: peak 18,000 → 15,300 is −15%, needs +17.65%; pct 50% needs 100%', () => {
  const r = drawdownPlan({ mode: 'peak', peak: 18000, now: 15300 });
  close(r.drop, .15); close(r.recovery, 1 / .85 - 1); assert.equal(r.loss, null); assert.equal(r.years, null);
  const p = drawdownPlan({ mode: 'pct', drop: .5, annual: .1 });
  close(p.recovery, 1); assert.equal(p.base, null); close(p.years, Math.log(2) / Math.log(1.1));
  assert.equal(drawdownPlan({ mode: 'pct', drop: .3, annual: NaN }).years, null);
});
test('drawdown ⑧ wizard: series finds 130 → 65 (−50%), now back at the high', () => {
  const r = drawdownPlan({ mode: 'series', series: [100, 120, 90, 130, 65, 140] });
  close(r.drop, .5); assert.equal(r.peakIndex, 3); assert.equal(r.troughIndex, 4); assert.equal(r.base, 130); assert.equal(r.current, 65);
  close(r.curDrop, 0);
  close(drawdownPlan({ mode: 'series', series: [100, 80, 90] }).curDrop, .1);
  assert.throws(() => drawdownPlan({ mode: 'series', series: [100] }), /至少要兩筆/);
  assert.throws(() => drawdownPlan({ mode: 'holding', shares: 0, buyPrice: 1, nowPrice: 1 }), /股數/);
  assert.throws(() => drawdownPlan({ mode: 'pct', drop: 1 }), /跌幅/);
  assert.throws(() => drawdownPlan({ mode: 'pct', drop: .3, annual: -0.1 }), /每年報酬/);
});
