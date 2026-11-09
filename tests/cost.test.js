// ⑨ 買賣成本與損益。預期值由 Opus 手算（第 1 組與研究 R2-02 原頁範例一致），外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { tradeCost, brokerFee, taxRate, tickSize, roundUpToTick, guessKind, defaultMinFee } from '../js/core/cost.js';

const close = (a, e, eps = 1e-9) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

test('cost ⑨: 1 lot of a stock at 100, sell at 100 — matches the R2-02 example (584 round trip, break-even 100.587 → 101)', () => {
  const r = tradeCost({ kind: 'stock', shares: 1000, buyPrice: 100, sellPrice: 100, discount: 1, minFee: 20 });
  assert.equal(r.buyAmount, 100000); assert.equal(r.buyFee, 142); assert.equal(r.buyTotal, 100142);
  assert.deepEqual(r.sell, { amount: 100000, fee: 142, tax: 300, net: 99558 });
  assert.equal(r.totalCost, 584); assert.equal(r.profit, -584); close(r.profitPct, -584 / 100142);
  close(r.breakEven, 100142 / 995.575); assert.equal(r.breakEven.toFixed(3), '100.587'); assert.equal(r.breakEvenTick, 101);
});
test('cost ⑨: ETF 0050 with 2.8 discount — minimum fee 20 kicks in, ETF tax 0.1%, ETF tick 0.05', () => {
  const r = tradeCost({ kind: 'etf', shares: 1000, buyPrice: 50, sellPrice: 55, discount: 0.28, minFee: 20 });
  assert.equal(r.buyFee, 20); assert.equal(r.buyTotal, 50020);
  assert.deepEqual(r.sell, { amount: 55000, fee: 21, tax: 55, net: 54924 });
  assert.equal(r.totalCost, 96); assert.equal(r.profit, 4904); close(r.profitPct, 4904 / 50020);
  close(r.breakEven, 50040 / 999); assert.equal(r.breakEvenTick, 50.1);
});
test('cost ⑨: day trade of a stock halves the tax (0.15%); an ETF day trade stays 0.1%', () => {
  const p = { kind: 'stock', shares: 1000, buyPrice: 1000, sellPrice: 1010, discount: 1, minFee: 20 };
  const d = tradeCost({ ...p, dayTrade: true });
  assert.equal(d.buyTotal, 1001425); assert.deepEqual(d.sell, { amount: 1010000, fee: 1439, tax: 1515, net: 1007046 }); assert.equal(d.profit, 5621);
  const n = tradeCost(p);
  assert.equal(n.sell.tax, 3030); assert.equal(n.profit, 4106);
  assert.equal(taxRate('etf', true), 0.001); assert.equal(taxRate('stock', true), 0.0015);
});
test('cost ⑨: odd lot of 50 shares with minimum fee 1 and 6 discount', () => {
  const r = tradeCost({ kind: 'stock', shares: 50, buyPrice: 600, sellPrice: 600, discount: 0.6, minFee: 1 });
  assert.equal(r.buyFee, 25); assert.equal(r.sell.fee, 25); assert.equal(r.sell.tax, 90);
  assert.equal(r.totalCost, 140); assert.equal(r.profit, -140);
  assert.equal(defaultMinFee(50), 1); assert.equal(defaultMinFee(3000), 20); assert.equal(defaultMinFee(3250), 1);
});
test('cost ⑨: without a sell price only the buy side and break-even are computed', () => {
  const r = tradeCost({ kind: 'stock', shares: 1000, buyPrice: 100, discount: 1, minFee: 20 });
  assert.equal(r.sell, null); assert.equal(r.totalCost, 142); assert.ok(Number.isNaN(r.profit)); assert.equal(r.breakEvenTick, 101);
});
test('cost ⑨: fee floors to whole yuan with a minimum; kinds, bond ETF tax-free, guesses', () => {
  assert.equal(brokerFee(100000), 142); assert.equal(brokerFee(5000), 20); assert.equal(brokerFee(0), 0);
  assert.equal(taxRate('bond-etf'), 0); assert.throws(() => taxRate('fund'));
  assert.equal(guessKind('00679B'), 'bond-etf'); assert.equal(guessKind('00631L'), 'etf'); assert.equal(guessKind('0050'), 'etf'); assert.equal(guessKind('2330'), 'stock');
  assert.equal(tradeCost({ kind: 'bond-etf', shares: 1000, buyPrice: 30, sellPrice: 30, discount: 1, minFee: 20 }).sell.tax, 0);
});
test('cost ⑨: tick sizes (exchange rule 62) and rounding up to a valid price', () => {
  assert.deepEqual([9.99, 10, 49.95, 50, 99.9, 100, 499.5, 500, 999, 1000].map(x => tickSize(x, 'stock')), [0.01, 0.05, 0.05, 0.1, 0.1, 0.5, 0.5, 1, 1, 5]);
  assert.deepEqual([49.99, 50].map(x => tickSize(x, 'etf')), [0.01, 0.05]);
  assert.equal(roundUpToTick(100.587, 'stock'), 101); assert.equal(roundUpToTick(45.01, 'stock'), 45.05); assert.equal(roundUpToTick(50.0901, 'etf'), 50.1);
  assert.equal(roundUpToTick(100.5, 'stock'), 100.5);
});
test('cost ⑨: bad inputs give a readable message', () => {
  assert.throws(() => tradeCost({ kind: 'stock', shares: 1.5, buyPrice: 10 }), /股數/);
  assert.throws(() => tradeCost({ kind: 'stock', shares: 1000, buyPrice: 10, discount: 0 }), /折扣/);
  assert.throws(() => tradeCost({ kind: 'stock', shares: 1000, buyPrice: 10, sellPrice: -1 }), /賣出價/);
});
