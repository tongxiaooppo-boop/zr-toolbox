// ⑦ 定期定額與年化報酬。預期值由 Opus 用年金公式手算（不是拿程式自己的輸出），外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { dcaPlan, cagr, monthlyRate } from '../js/core/dca.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

test('dca ⑦ page example: 5,000 a month for 20 years at 6%, paid at the start of each month', () => {
  const r = dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06, timing: 'start', discount: 1, minFee: 1 });
  const m = Math.pow(1.06, 1 / 12) - 1;
  close(r.monthlyRate, m, 1e-15); assert.equal(r.monthlyRate.toFixed(4), '0.0049'); // 不是 0.06 ÷ 12 ＝ 0.005
  close(r.finalValue, 5000 * (Math.pow(1.06, 20) - 1) / m * (1 + m)); assert.equal(Math.round(r.finalValue), 2278229);
  assert.equal(r.months, 240); assert.equal(r.contributed, 1200000); assert.equal(r.principal, 1200000);
  assert.equal(r.fees, 1680); // 5000 × 0.1425% ＝ 7.125 → 7 元 × 240 次
  assert.equal(Math.round(r.gain), 1076549); close(r.gainPct, r.gain / 1201680);
  assert.equal(Math.round(r.lumpValue), 3848563); assert.equal(r.lumpFee, 1710); assert.equal(Math.round(r.lumpGain), 2646853);
  assert.equal((r.naiveCagr * 100).toFixed(2), '3.26'); // 用總本金硬算，看起來只有 3.26%，實際每筆錢都是 6%
  assert.equal(r.rows.length, 20); assert.equal(r.rows[19].contributed, 1200000); close(r.rows[19].value, r.finalValue, 1e-9);
  assert.equal(r.rows[0].amount, 5000); assert.equal(r.rows[0].fees, 84);
});
test('dca ⑦: zero return keeps exactly the money put in, so fees are the only loss', () => {
  const r = dcaPlan({ monthly: 10000, years: 1, annualReturn: 0 });
  assert.equal(r.finalValue, 120000); assert.equal(r.fees, 168); assert.equal(r.gain, -168);
  assert.equal(dcaPlan({ monthly: 10000, years: 1, annualReturn: 0, timing: 'end' }).finalValue, 120000);
  assert.equal(dcaPlan({ monthly: 10000, years: 1, annualReturn: 0, discount: 0.28 }).fees, 36); // 10000 × 0.0399% ＝ 3.99 → 3 元
  assert.equal(dcaPlan({ monthly: 1000, years: 1, annualReturn: 0, minFee: 1 }).fees, 12); // 1.425 → 1 元
});
test('dca ⑦: paying at the end of the month is one month of growth less', () => {
  const s = dcaPlan({ monthly: 3000, years: 10, annualReturn: 0.08, timing: 'start' });
  const e = dcaPlan({ monthly: 3000, years: 10, annualReturn: 0.08, timing: 'end' });
  close(e.finalValue, s.finalValue / (1 + monthlyRate(0.08)));
});
test('dca ⑦: yearly step-up raises each year\'s amount, rounded to yuan', () => {
  const r = dcaPlan({ monthly: 10000, years: 3, annualReturn: 0, stepUp: 0.1 });
  assert.deepEqual(r.rows.map(x => x.amount), [10000, 11000, 12100]);
  assert.equal(r.contributed, 397200); assert.equal(r.fees, 14 * 12 + 15 * 12 + 17 * 12); // 15.675→15、17.2425→17
});
test('dca ⑦: existing holdings grow from month 0 with no fee', () => {
  const r = dcaPlan({ initial: 100000, monthly: 1000, years: 1, annualReturn: 0.12, timing: 'end' });
  const m = Math.pow(1.12, 1 / 12) - 1;
  close(r.finalValue, 100000 * 1.12 + 1000 * 0.12 / m);
  assert.equal(r.principal, 112000); assert.equal(r.fees, 12); assert.equal(r.lumpFee, 17); // 12000 × 0.1425% ＝ 17.1
  close(r.lumpValue, 112000 * 1.12);
});
test('dca ⑦: single-sum CAGR — 100,000 to 150,000 in 3 years is about 14.47% (R2-14 says about 14.5%)', () => {
  assert.equal((cagr(100000, 150000, 3) * 100).toFixed(2), '14.47');
  close(cagr(100, 200, 1), 1); close(cagr(100, 100, 5), 0);
  assert.throws(() => cagr(0, 100, 1), /期初/);
});
test('dca ⑦: bad inputs give a readable message', () => {
  assert.throws(() => dcaPlan({ monthly: 0, years: 10, annualReturn: 0.05 }), /每月投入/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 0, annualReturn: 0.05 }), /年數/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 2.5, annualReturn: 0.05 }), /年數/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 10, annualReturn: 6 }), /年報酬/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 10, annualReturn: 0.05, timing: 'mid' }), /時點/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 10, annualReturn: 0.05, initial: -1 }), /持股市值/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 10, annualReturn: 0.05, stepUp: 2 }), /調升/);
});
test('dca ⑦: stop paying, then let it grow (todo2 conservative roll) — 20 years at 6%, then 10 years at 3%', () => {
  const r = dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06, holdYears: 10, holdReturn: 0.03 });
  assert.equal(Math.round(r.heldValue), 3061749); assert.equal(r.totalYears, 30); // 2,278,228.84 × 1.03^10
  assert.equal(Math.round(r.finalValue), 2278229); assert.equal(r.fees, 1680); assert.equal(r.rows.length, 20);
  const same = dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06, holdYears: 5 });
  close(same.heldValue, same.finalValue * Math.pow(1.06, 5), 1e-6);
  const none = dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06 });
  assert.equal(none.heldValue, none.finalValue); assert.equal(none.totalYears, 20);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06, holdYears: 1.5 }), /停扣/);
  assert.throws(() => dcaPlan({ monthly: 5000, years: 20, annualReturn: 0.06, holdYears: 5, holdReturn: 3 }), /停扣後年報酬/);
});
