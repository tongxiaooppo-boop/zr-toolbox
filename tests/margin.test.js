// ⑤ 融資融券與整戶維持率。預期值由 Opus 手算（對上研究 R2-06 原頁範例），外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { marginPlan, shortSummary } from '../js/core/margin.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const L = (code, shares, buyPrice, nowPrice) => ({ code, shares, buyPrice, nowPrice });

test('margin ⑤ page example: 6-tenths loan of 600,000, value falls to 760,000 → 126.67%, margin call', () => {
  const r = marginPlan({ longs: [L('2330', 1000, 1000, 760)], loanRatio: 0.6, call: 1.3, target: 1.66, rate: 0.065, days: 30 });
  assert.equal(r.loan, 600000); assert.equal(r.ownCash, 400000); close(r.leverage, 2.5);
  assert.equal(r.collateral, 760000); assert.equal(r.debt, 600000);
  assert.equal((r.ratio * 100).toFixed(2), '126.67'); assert.equal(r.called, true); assert.equal(r.belowTarget, true);
  close(r.topup, 236000); // 600,000 × 166% − 760,000
  assert.equal(Math.round(r.repay), 142169); assert.equal(r.repayEnough, true); // 600,000 − 760,000 ÷ 1.66
  assert.equal(Math.round(r.interest), 3205); // R2-06：600,000 × 6.5% × 30 ÷ 365 ≈ 3,205
  close(r.perStock[0].callPrice, 780); close(r.perStock[0].vsEntry, -0.22); // 6 成：從買進價跌 22% 碰到 130%
  assert.ok(r.longDrop < 0); assert.equal(r.shortRise, null); assert.equal(r.short, null);
  assert.equal(r.long.gain, -240000);
  assert.deepEqual(r.rows.map(x => x.move), [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3]);
  close(r.rows[3].ratio, r.ratio); close(r.rows[5].ratio, 760000 * 1.2 / 600000); assert.equal(r.rows[5].called, false);
});
test('margin ⑤: R2-06 original remedy numbers when the target is exactly 1 ÷ 0.6 (166.67%)', () => {
  const r = marginPlan({ longs: [L('2330', 1000, 1000, 760)], target: 1 / 0.6 });
  close(r.topup, 240000); close(r.repay, 144000); // 原頁：增提現金 240,000、償還融資 144,000
});
test('margin ⑤: starting ratio and drop to the 130% line depend on the loan ratio (6 / 5 / 4 tenths)', () => {
  const at = q => marginPlan({ longs: [L('2317', 1000, 100, 100)], loanRatio: q });
  assert.equal((at(0.6).ratio * 100).toFixed(2), '166.67'); assert.equal(at(0.5).ratio, 2); assert.equal(at(0.4).ratio, 2.5);
  close(at(0.6).longDrop, 0.22); close(at(0.5).longDrop, 0.35); close(at(0.4).longDrop, 0.48); // 1 − 1.3 × 成數
  assert.equal(at(0.6).called, false); assert.equal(at(0.6).belowTarget, false); assert.equal(at(0.6).repay, 0); assert.equal(at(0.6).topup, 0);
});
test('margin ⑤: loan from the statement overrides the loan ratio', () => {
  const r = marginPlan({ longs: [L('2317', 1000, 100, 100)], loan: 59000 });
  assert.equal(r.loan, 59000); assert.equal(r.ownCash, 41000); close(r.ratio, 100000 / 59000);
  assert.throws(() => marginPlan({ longs: [L('2317', 1000, 100, 100)], loan: 100000 }), /融資金額/);
});
test('margin ⑤ short sale: deposit 90% → 190%, about +46% rise hits 130%, cash top-up only', () => {
  const r0 = marginPlan({ shorts: [L('2454', 1000, 100, 100)] });
  assert.equal(r0.deposit, 90000); close(r0.ratio, 1.9); assert.equal(r0.longDrop, null);
  assert.equal((r0.shortRise * 100).toFixed(2), '46.15'); close(r0.perStock[0].callPrice, 190 / 1.3);
  assert.equal(r0.perStock[0].side, 'short'); assert.equal(r0.loan, 0); assert.equal(r0.ownCash, null); assert.equal(r0.interest, 0);
  const r = marginPlan({ shorts: [L('2454', 1000, 100, 150)], target: 1.66 });
  assert.equal(r.called, true); close(r.topup, 59000); // 1.66 × 150,000 − 190,000
  assert.equal(r.repay, 0); assert.equal(r.repayEnough, false); assert.equal(r.short.gain, -50000);
});
test('margin ⑤ whole account: sums numerators and denominators, not an average of each ratio', () => {
  const r = marginPlan({ longs: [L('2317', 1000, 100, 100)], shorts: [L('2454', 1000, 50, 50)] });
  close(r.collateral, 195000); close(r.debt, 110000); close(r.ratio, 195000 / 110000);
  assert.notEqual(r.ratio.toFixed(4), ((5 / 3 + 1.9) / 2).toFixed(4)); // 177.27%，不是 178.33%
  close(r.longDrop, 0.52); close(r.shortRise, 0.8);
  close(r.rows.find(x => x.move === 0.1).ratio, 205000 / 115000);
  // 只靠還融資要還 110,000 − 195,000 ÷ 1.66 < 60,000 → 夠
  assert.equal(r.repay, 0); assert.equal(r.repayEnough, true);
  const bad = marginPlan({ longs: [L('2317', 1000, 100, 100)], shorts: [L('2454', 4000, 50, 80)] });
  // 分子 100,000 + 380,000 = 480,000；分母 60,000 + 320,000 = 380,000 → 126.3%；還款要 380,000 − 480,000 ÷ 1.66 ≈ 90,843 > 60,000
  assert.equal(bad.called, true); assert.equal(Math.round(bad.repay), 90843); assert.equal(bad.repayEnough, false);
});
test('margin ⑤: bad inputs give a readable message', () => {
  assert.throws(() => marginPlan({}), /至少/);
  assert.throws(() => marginPlan({ longs: [L('2317', 1000, 100, 100)], call: 0.9 }), /追繳線/);
  assert.throws(() => marginPlan({ longs: [L('2317', 1000, 100, 100)], target: 1.2 }), /補回目標/);
  assert.throws(() => marginPlan({ longs: [L('2317', 1000, 100, 100)], rate: 6.5 }), /年利率/);
  assert.throws(() => marginPlan({ longs: [L('2317', 1000, 100, 100)], days: 1.5 }), /天數/);
  assert.throws(() => marginPlan({ longs: [L('2317', 1000, 100, 100)], loanRatio: 1 }), /成數/);
  assert.throws(() => shortSummary([L('2454', 1000, 0, 100)]), /融券第 1 檔的融券賣出價/);
  assert.throws(() => marginPlan({ longs: [L('2317', 0, 100, 100)] }), /第 1 檔的股數/);
});
