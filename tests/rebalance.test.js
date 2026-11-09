// ③ 定期配比精靈（v5.8）：多檔＋股數取整。預期值由 Opus 手算，外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { rebalancePlan, guessBeta, WIZARD_TEMPLATES } from '../js/core/rebalance.js';
import { STOCK_NAMES } from '../js/data/stocks.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const ex = {
  rows: [{ code: '0050', shares: 2000, price: 195.5, beta: 1, weight: .5 }, { code: '00631L', shares: 9000, price: 26.3, beta: 2, weight: .3 }],
  cash: 172300, cashWeight: .2, contribution: 50000, unit: 1, months: 6, last: '2026-05-08', asOf: '2026-11-09'
};

test('rebalance ③ wizard example: 532 stock, 80 萬＋新投入 5 萬 → buy 173 股 0050、695 股 00631L, cash 170,200', () => {
  const r = rebalancePlan(ex);
  close(r.total, 800000); close(r.pool, 850000); close(r.cashTarget, 170000);
  const [a, b] = r.rows;
  close(a.value, 391000); close(a.target, 425000); assert.equal(a.tradeShares, 173); close(a.tradeAmount, 33821.5);
  assert.equal(a.sharesAfter, 2173); close(a.valueAfter, 424821.5);
  close(b.value, 236700); close(b.target, 255000); assert.equal(b.tradeShares, 695); close(b.tradeAmount, 18278.5);
  assert.equal(b.sharesAfter, 9695); close(b.valueAfter, 254978.5);
  close(r.cashAfter, 170200); close(r.buyAmount, 52100); close(r.sellAmount, 0);
  close(a.nowWeight, .48875); close(b.nowWeight, .295875); close(r.cashWeightNow, .215375); close(r.maxDrift, .015375);
  close(r.exposureNow, 1.0805); close(r.exposureTarget, 1.1); close(r.exposureAfter, 934778.5 / 850000);
  assert.equal(r.due, '2026-11-08'); assert.equal(r.ready, true);
});
test('rebalance ③ wizard: 正二漲到 40 → 零股賣 2,075 股；只用整張 → 0050 不買、00631L 賣 2 張', () => {
  const base = { ...ex, contribution: 0, last: undefined, rows: [ex.rows[0], { ...ex.rows[1], price: 40 }] };
  const r = rebalancePlan(base);
  close(r.total, 923300); assert.equal(r.rows[0].tradeShares, 361); close(r.rows[0].tradeAmount, 70575.5);
  assert.equal(r.rows[1].tradeShares, -2075); close(r.rows[1].tradeAmount, -83000);
  close(r.cashAfter, 184724.5); close(r.buyAmount, 70575.5); close(r.sellAmount, 83000);
  assert.equal(r.due, null); assert.equal(r.ready, null);
  const lot = rebalancePlan({ ...base, unit: 1000 });
  assert.equal(lot.rows[0].tradeShares, 0); assert.equal(lot.rows[1].tradeShares, -2000); close(lot.cashAfter, 252300);
});
test('rebalance ③ wizard: rounding never leaves cash negative (cash weight 0 → cut the biggest buy)', () => {
  const r = rebalancePlan({ rows: [{ code: '2330', shares: 7, price: 100, weight: .7 }, { code: '0056', shares: 0, price: 1, weight: .3 }], cash: 0, cashWeight: 0 });
  assert.equal(r.rows[0].tradeShares, -2); assert.equal(r.rows[1].tradeShares, 200); close(r.cashAfter, 0);
});
test('rebalance ③ wizard: bond version builds a new 0-share position; beta guessed from code; lots never oversell', () => {
  const r = rebalancePlan({ rows: [{ code: '00631L', shares: 10000, price: 25, weight: .5 }, { code: '00679B', shares: 0, price: 28.5, weight: .3 }], cash: 250000, cashWeight: .2 });
  assert.equal(r.rows[0].beta, 2); assert.equal(r.rows[1].beta, 0);
  assert.equal(r.rows[0].tradeShares, 0); assert.equal(r.rows[1].tradeShares, 5263); close(r.rows[1].tradeAmount, 149995.5);
  close(r.cashAfter, 100004.5); close(r.exposureNow, 1); close(r.exposureTarget, 1);
  assert.equal(guessBeta('00632R'), -1); assert.equal(guessBeta('2330'), 1); assert.equal(guessBeta('00679B'), 0);
  const odd = rebalancePlan({ rows: [{ code: '0056', shares: 1800, price: 40, weight: 0 }], cash: 0, cashWeight: 1, unit: 1000 });
  assert.equal(odd.rows[0].tradeShares, -1000); close(odd.cashAfter, 40000);
});
test('rebalance ③ wizard: bad input messages', () => {
  assert.throws(() => rebalancePlan({ ...ex, cashWeight: .1 }), /加起來要是 100%，現在是 90%/);
  assert.throws(() => rebalancePlan({ ...ex, rows: [ex.rows[0], { ...ex.rows[1], code: '0050' }] }), /0050 重複了/);
  assert.throws(() => rebalancePlan({ ...ex, rows: [{ ...ex.rows[0], shares: 1.5 }, ex.rows[1]] }), /第 1 檔的股數/);
  assert.throws(() => rebalancePlan({ ...ex, rows: [] }), /至少填一檔/);
  assert.throws(() => rebalancePlan({ ...ex, asOf: '2026-01-01' }), /不能早於上次配回日/);
});
test('rebalance ③ wizard templates: weights sum to 1 and every code has a name', () => {
  for (const [id, t] of Object.entries(WIZARD_TEMPLATES)) {
    if (id === 'custom') { assert.equal(t.rows.length, 0); continue; }
    close(t.rows.reduce((a, r) => a + r.weight, 0) + t.cash, 1, 1e-9);
    for (const r of t.rows) assert.ok(STOCK_NAMES[r.code], r.code);
  }
});
