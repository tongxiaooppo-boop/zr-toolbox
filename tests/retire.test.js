// ⑲ 退休提領。預期值來源：todo2 FinancialFormulasTest（Python 交叉驗算）＋ Opus 用逐月加總現值獨立算，外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { retirePlan, annuityFactor } from '../js/core/retire.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const r2 = n => Math.round(n * 100) / 100;

test('retire ⑲: todo2 locked value — 10,000,000 / 3.5% / 25 years, no inflation, nothing left → 49,768.29 a month', () => {
  const r = retirePlan({ pool: 10000000, years: 25, annualReturn: 0.035 });
  assert.equal(r2(r.firstWithdraw), 49768.29); close(r.lastWithdraw, r.firstWithdraw);
  assert.equal(r.months, 300); close(r.pvResidual, 0); close(r.available, 10000000);
  close(r.endBalance, 0, 1e-4); assert.equal(r.rows.length, 25); close(r.rows[24].endBalance, 0, 1e-4);
  close(r.totalWithdrawn, r.firstWithdraw * 300, 1e-4);
});
test('retire ⑲ page example: 2% inflation, 15,000 other income, wants 50,000 a month', () => {
  const r = retirePlan({ pool: 10000000, years: 25, annualReturn: 0.035, inflation: 0.02, residual: 0, timing: 'end',
    otherIncome: 15000, targetSpend: 50000 });
  assert.equal(r2(r.firstWithdraw), 39875.32); assert.equal(r2(r.lastWithdraw), 65311.81); // todo2 測試值
  assert.equal(Math.round(r.firstTotal), 54875); assert.equal(Math.round(r.lastTotal), 80312);
  assert.equal(Math.round(r.rule4Monthly), 33333); assert.equal((r.withdrawRate * 100).toFixed(2), '4.79');
  assert.equal(r.needWithdraw, 35000); assert.equal(Math.round(r.needPool), 8777360); assert.equal(Math.round(r.gap), 4875);
  assert.equal(Math.round(r.lastOtherReal), 9158); // 15,000 ÷ (1.02)^(299/12)
  close(r.endBalance, 0, 1e-4);
  assert.equal(Math.round(r.rows[0].withdraw), 39875); assert.equal(Math.round(r.rows[1].withdraw), Math.round(39875.31548931088 * 1.02));
  assert.ok(r.rows[0].yearTotal > 12 * r.rows[0].withdraw);
});
test('retire ⑲: leaving 2,000,000 at the end → 36,500.69 (todo2) and the simulation really ends at 2,000,000', () => {
  const r = retirePlan({ pool: 10000000, years: 25, annualReturn: 0.035, inflation: 0.02, residual: 2000000 });
  assert.equal(r2(r.firstWithdraw), 36500.69); close(r.endBalance, 2000000, 1e-4);
  close(r.pvResidual, 2000000 / Math.pow(1.035, 25), 1e-6);
});
test('retire ⑲: taking money at the start of the month is one month of growth less', () => {
  const e = retirePlan({ pool: 10000000, years: 25, annualReturn: 0.035 });
  const s = retirePlan({ pool: 10000000, years: 25, annualReturn: 0.035, timing: 'start' });
  assert.equal(r2(s.firstWithdraw), 49625.82); close(s.firstWithdraw, e.firstWithdraw / (1 + e.monthlyRate), 1e-9);
  close(s.endBalance, 0, 1e-4);
});
test('retire ⑲: return equal to inflation (todo2 divided by N here; correct is N ÷ (1+i))', () => {
  const r = retirePlan({ pool: 1200000, years: 10, annualReturn: 0.03, inflation: 0.03 });
  assert.equal(r2(r.firstWithdraw), 10024.66); close(r.endBalance, 0, 1e-4);
  const i = Math.pow(1.03, 1 / 12) - 1;
  close(annuityFactor(i, i, 120), 120 / (1 + i), 1e-12); close(annuityFactor(i, i, 120, 'start'), 120, 1e-9);
  // 零報酬、零通膨：就是平均分
  assert.equal(retirePlan({ pool: 1200000, years: 10, annualReturn: 0 }).firstWithdraw, 10000);
});
test('retire ⑲: other income already covers the target → need only the residual', () => {
  const r = retirePlan({ pool: 1000000, years: 10, annualReturn: 0.02, otherIncome: 40000, targetSpend: 30000, residual: 500000 });
  assert.equal(r.needWithdraw, 0); close(r.needPool, r.pvResidual); assert.ok(r.gap > 10000);
  const n = retirePlan({ pool: 1000000, years: 10, annualReturn: 0.02 });
  assert.ok(Number.isNaN(n.needPool) && Number.isNaN(n.gap) && Number.isNaN(n.needWithdraw));
});
test('retire ⑲: bad inputs give a readable message', () => {
  const ok = { pool: 10000000, years: 25, annualReturn: 0.035 };
  assert.throws(() => retirePlan({ ...ok, pool: 0 }), /資產/);
  assert.throws(() => retirePlan({ ...ok, years: 0 }), /幾年/);
  assert.throws(() => retirePlan({ ...ok, years: 2.5 }), /幾年/);
  assert.throws(() => retirePlan({ ...ok, annualReturn: 3.5 }), /年報酬/);
  assert.throws(() => retirePlan({ ...ok, inflation: 0.3 }), /通膨/);
  assert.throws(() => retirePlan({ ...ok, residual: -1 }), /留下/);
  assert.throws(() => retirePlan({ ...ok, residual: 30000000 }), /留下的錢太多/);
  assert.throws(() => retirePlan({ ...ok, timing: 'mid' }), /什麼時候領/);
  assert.throws(() => retirePlan({ ...ok, otherIncome: -1 }), /其他/);
  assert.throws(() => retirePlan({ ...ok, targetSpend: 0 }), /想花/);
});
