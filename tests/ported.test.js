// 自 D:\ok\zr-calc\tests\research.test.cjs 移植的 20 項測試，預期值一字不改。
// 只改呼叫方式：stress→pledgeStress、remedy 'cash'→'collateral'、rebalance 改用 holdings 陣列、模板 '532'→'532-stock'。
import test from 'node:test';
import assert from 'node:assert/strict';
import { pledgeStress as stress } from '../js/core/pledge.js';
import { rebalance, dueDate } from '../js/core/rebalance.js';
import { betaPlan } from '../js/core/exposure.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
const loan = { shares: 10000, pledgePrice: 100, price: 100, collateralQ: 1, debt: 600000, newDebt: 0, credit: 200000, investRatio: .8, purchasePrice: 100, rate: 0, days: 180, call: 1.3, restore: 1.66, safety: 1.66, reserve: 100000, remedy: 'repay', q: 1 };

test('repayment and cash collateral use different equations; both restore the target', () => {
  const r = stress(loan, .3);
  close(r.repay, 600000 - 700000 / 1.66);
  close(r.topup, 296000);
  close(700000 / (600000 - r.repay), 1.66);
  close((700000 + r.topup) / 600000, 1.66);
  close(r.extra, r.repay - 100000);
});
test('10–50% zero-interest verification table', () => {
  const expected = [57832, 118073, 178314, 238555, 298796];
  [.1, .2, .3, .4, .5].forEach((d, i) => assert.equal(Math.ceil(stress(loan, d).needed), expected[i]));
});
test('safety shortfall is distinct from a margin call', () => {
  const r = stress(loan, .1);
  assert.equal(r.called, false); assert.ok(r.needed > 0);
});
test('margin call uses the higher restoration target', () => {
  const r = stress({ ...loan, safety: 1.4, restore: 1.8 }, .3);
  assert.equal(r.called, true); close(r.target, 1.8);
});
test('zero borrowing has no margin call and requires no reserves', () => {
  const r = stress({ ...loan, debt: 0 }, .5);
  assert.equal(r.ratio, Infinity); assert.equal(r.needed, 0); assert.equal(r.extra, 0);
});
test('interest accrues on all modeled borrowing and reduces the no-topup limit', () => {
  const p = { ...loan, debt: 200000, newDebt: 100000, rate: .03 };
  const r = stress(p, .3);
  close(r.stressedDebt, 300000 * (1 + .03 * 180 / 365));
  const limited = stress({ ...p, credit: 1000000 }, .3);
  const maxPlan = stress({ ...p, newDebt: limited.safeNew, credit: 1000000 }, .3);
  close(maxPlan.ratio, p.safety);
});
test('price since pledge and stress from current price compound', () => {
  const r = stress({ ...loan, price: 80 }, .3);
  close(r.sincePledge, -.2); close(r.stressPrice, 56); close(r.stressSincePledge, -.44);
  close(r.referencePrice * loan.shares * loan.collateralQ / r.stressedDebt, loan.call);
});
test('historical pledge price changes reference loss, not current collateral value', () => {
  const a = stress(loan, .3), b = stress({ ...loan, pledgePrice: 120 }, .3);
  close(a.needed, b.needed); assert.notEqual(a.sincePledge, b.sincePledge);
});
test('investment ratio changes new purchase but not original pool maintenance', () => {
  const a = stress({ ...loan, newDebt: 200000, investRatio: .8 }, .3);
  const b = stress({ ...loan, newDebt: 200000, investRatio: .5 }, .3);
  close(a.ratio, b.ratio); close(a.investment, 160000); assert.equal(a.buyShares, 1600);
  close(a.uninvested, 40000); close(a.extra, b.extra);
});
test('credit exceedance and existing safety deficit are explicit', () => {
  assert.equal(stress({ ...loan, newDebt: 300000 }, .3).overCredit, true);
  const r = stress(loan, .5); assert.ok(r.safeRaw < 0); assert.equal(r.safeNew, 0);
});
test('cash recognition discount increases cash collateral requirement', () => {
  const r = stress({ ...loan, remedy: 'collateral', q: .8 }, .3);
  close(r.needed, 296000 / .8);
});
test('invalid finance inputs are rejected', () => {
  for (const bad of [{ q: 0 }, { price: 0 }, { shares: -1 }, { shares: 1.5 }, { safety: 1.2 }, { debt: NaN }, { investRatio: 1.1 }, { rate: 2 }]) assert.throws(() => stress({ ...loan, ...bad }, .3));
  assert.throws(() => stress(loan, .51));
});
test('calendar due date clamps month end and handles leap years', () => {
  assert.equal(dueDate('2026-01-31', 1), '2026-02-28');
  assert.equal(dueDate('2024-01-31', 1), '2024-02-29');
  assert.equal(dueDate('2026-11-08', 3), '2027-02-08');
  assert.throws(() => dueDate('2026-02-31', 1));
});
test('time-only rebalance conserves assets with new funds and fee budget', () => {
  const r = rebalance({ template: '532-stock', holdings: [450000, 210000, 200000], contribution: 10000, fee: 2000, months: 6, last: '2026-05-08', asOf: '2026-11-08' });
  close(r.total, 868000); close(r.targets.reduce((a, b) => a + b, 0), r.total);
  close(r.trades.reduce((a, b) => a + b, 0), 8000); assert.equal(r.ready, true);
  assert.equal(r.due, '2026-11-08'); close(r.exposure, 1.1);
});
const beta = { ordinary: 10000000, ordinaryBeta: 1, lever: 0, leverBeta: 2, cash: 2000000, debt: 3000000, target: 1.4, minCash: 0, basis: 'net', allowBorrow: false };
test('original sample: net equity 9m, buy 1.3m, keep 0.7m', () => {
  const r = betaPlan(beta); assert.equal(r.possible, true); close(r.net, 9000000); close(r.targetLever, 1300000); close(r.cashAfter, 700000); close(r.borrow, 0); close(r.achieved, 1.4);
});
test('asset-basis borrowing requires solving the changed denominator', () => {
  const r = betaPlan({ ...beta, basis: 'asset', allowBorrow: true });
  assert.equal(r.possible, true); close(r.targetLever, 6666666.666666667); close(r.borrow, 4666666.666666667); close(r.achieved, 1.4);
});
test('no borrowing does not silently treat a funding shortage as executable', () => {
  const r = betaPlan({ ...beta, basis: 'asset' }); assert.equal(r.possible, false); close(r.shortage, 1400000);
});
test('ordinary exposure exceeding target returns unreachable instead of clamping', () => {
  assert.equal(betaPlan({ ...beta, target: .5 }).possible, false);
});
test('unreachable asset-basis target and insolvent equity are rejected', () => {
  assert.equal(betaPlan({ ...beta, target: 2, basis: 'asset', allowBorrow: true }).possible, false);
  assert.throws(() => betaPlan({ ...beta, debt: 20000000 }));
});
test('existing leveraged holdings are subtracted from the target and can be sold', () => {
  const r = betaPlan({ ...beta, lever: 3000000, target: 1 });
  assert.equal(r.possible, true); close(r.targetLever, 1000000); close(r.delta, -2000000); close(r.cashAfter, 4000000);
});
