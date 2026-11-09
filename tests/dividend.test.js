// ⑩ 股息與除權息。預期值由 Opus 手算，外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { dividendPlan, nhiPremium } from '../js/core/dividend.js';

const close = (a, e, eps = 1e-9) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

test('dividend ⑩ page example: 10,000 shares, close 50, cash 2.4 + stock 0.5 — value unchanged, only the 612 premium is lost', () => {
  const r = dividendPlan({ shares: 10000, prevClose: 50, cashPerShare: 2.4, stockPerShare: 0.5, par: 10, buyPrice: 40, nowPrice: 46 });
  assert.equal(r.cashTotal, 24000); close(r.stockRate, 0.05); assert.equal(r.newShares, 500); assert.equal(r.sharesAfter, 10500);
  assert.equal(r.stockIncome, 5000); assert.equal(r.income, 29000); assert.equal(r.premium, 612); assert.equal(r.netCash, 23388);
  close(r.refPrice, 47.6 / 1.05); assert.equal(r.refPrice.toFixed(2), '45.33');
  assert.equal(r.valueBefore, 500000); close(r.valueAfter, 500000, 1e-6);
  close(r.fillPct, 52.5 / 47.6 - 1); assert.equal((r.fillPct * 100).toFixed(2), '10.29');
  close(r.cashYield, 0.048); close(r.costYield, 0.06);
  assert.equal(r.costTotal, 400000); assert.equal(r.profitBefore, 100000); close(r.profitAfter, 99388, 1e-6);
  assert.equal(r.filled, false);
});
test('dividend ⑩: ETF cash only below 20,000 — no premium; filled when the price is back to the old close', () => {
  const r = dividendPlan({ shares: 5000, prevClose: 36, cashPerShare: 0.866, buyPrice: 35, nowPrice: 36 });
  assert.equal(r.cashTotal, 4330); assert.equal(r.newShares, 0); assert.equal(r.sharesAfter, 5000);
  assert.equal(r.premium, 0); assert.equal(r.netCash, 4330);
  close(r.refPrice, 35.134); close(r.fillPct, 36 / 35.134 - 1); assert.equal(r.filled, true);
  close(r.costYield, 0.866 / 35); close(r.profitAfter, 5000 * 35.134 + 4330 - 175000, 1e-6);
});
test('dividend ⑩: NHI premium — 20,000 is charged in full, 19,999 is not, exempt is 0, capped at 10 million', () => {
  assert.equal(nhiPremium(20000), 422); assert.equal(nhiPremium(19999), 0);
  assert.equal(nhiPremium(50000, 'exempt'), 0); assert.equal(nhiPremium(20000000), 211000);
  assert.throws(() => nhiPremium(30000, 'boss'), /健保身分/);
  assert.equal(dividendPlan({ shares: 10000, prevClose: 50, cashPerShare: 2.4, stockPerShare: 0.5, identity: 'exempt' }).premium, 0);
});
test('dividend ⑩: stock dividend counts whole shares only; non-10 par uses the announced par', () => {
  const r = dividendPlan({ shares: 1234, prevClose: 30, stockPerShare: 0.5 });
  close(r.newSharesExact, 61.7); assert.equal(r.newShares, 61); assert.equal(r.sharesAfter, 1295);
  assert.equal(r.stockIncome, 617); assert.equal(r.cashTotal, 0); close(r.refPrice, 30 / 1.05);
  assert.ok(Number.isNaN(r.profitAfter)); assert.equal(r.filled, null);
  const p1 = dividendPlan({ shares: 1000, prevClose: 20, stockPerShare: 0.1, par: 1 });
  close(p1.stockRate, 0.1); assert.equal(p1.newShares, 100); assert.equal(p1.stockIncome, 100); close(p1.refPrice, 20 / 1.1);
});
test('dividend ⑩: bad inputs give a readable message', () => {
  assert.throws(() => dividendPlan({ shares: 0, prevClose: 50, cashPerShare: 1 }), /股數/);
  assert.throws(() => dividendPlan({ shares: 1000, prevClose: 50 }), /至少填一個/);
  assert.throws(() => dividendPlan({ shares: 1000, prevClose: 50, cashPerShare: 50 }), /單位/);
  assert.throws(() => dividendPlan({ shares: 1000, prevClose: 50, cashPerShare: -1 }), /負/);
  assert.throws(() => dividendPlan({ shares: 1000, prevClose: 50, cashPerShare: 1, par: 0 }), /面額/);
  assert.throws(() => dividendPlan({ shares: 1000, prevClose: 50, cashPerShare: 1, buyPrice: -3 }), /買入價/);
});
