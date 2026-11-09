// ⑮ 平均成本與攤平。預期值由 Opus 手算（不是拿程式自己的輸出），外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { avgCostPlan, buyLot, lotMinFee } from '../js/core/avgcost.js';

const close = (a, e, eps = 1e-9) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const ex = { kind: 'stock', lots: [{ shares: 1000, price: 100 }, { shares: 1000, price: 90 }], nowPrice: 80, discount: 1, minFeeBoard: 20, minFeeOdd: 1 };

test('avgcost ⑮: R2-11 example — 100 and 90, one lot each → 95.00 without fees, 95.14 with fees', () => {
  const { before: b } = avgCostPlan(ex);
  assert.deepEqual(b.lots.map(l => l.fee), [142, 128]); // 142.5→142、128.25→128，逐筆捨去
  assert.equal(b.shares, 2000); assert.equal(b.amount, 190000); assert.equal(b.fees, 270); assert.equal(b.totalCost, 190270);
  close(b.avgNoFee, 95); close(b.avgWithFee, 95.135); assert.equal(b.avgWithFee.toFixed(2), '95.14');
  close(b.breakEven, 190270 / 1991.15); assert.equal(b.breakEven.toFixed(3), '95.558'); assert.equal(b.breakEvenTick, 95.6); // 50–100 元每檔 0.1
});
test('avgcost ⑮ page example: at 80 now, the loss is real; buying 2 lots more at 80 lowers the average but not the loss', () => {
  const r = avgCostPlan({ ...ex, add: { price: 80, shares: 2000 }, targetAvg: 88 });
  const b = r.before, a = r.after;
  assert.deepEqual(b.sell, { amount: 160000, fee: 228, tax: 480, net: 159292 });
  assert.equal(b.gain, -30978); close(b.gainPct, -30978 / 190270); close(b.needRise, 95.6 / 80 - 1); // 19.5%
  assert.equal(r.addLot.fee, 228); assert.equal(r.addLot.total, 160228);
  assert.equal(a.shares, 4000); assert.equal(a.totalCost, 350498); close(a.avgNoFee, 87.5); close(a.avgWithFee, 87.6245);
  assert.equal(a.breakEven.toFixed(3), '88.014'); assert.equal(a.breakEvenTick, 88.1);
  assert.deepEqual(a.sell, { amount: 320000, fee: 456, tax: 960, net: 318584 });
  assert.equal(a.gain, -31914); close(a.needRise, 88.1 / 80 - 1); // 10.125%：要漲的幅度變小，但虧損多了 936 元費用
  assert.equal(r.target.ok, true); assert.equal(r.target.shares, 1810); // 1809 股 → 88.0011，1810 股 → 87.9989
  assert.equal(r.target.lot.fee, 206); assert.equal(r.target.totalCost, 335276); assert.equal(r.target.totalShares, 3810);
  assert.ok(r.target.avgWithFee <= 88);
});
test('avgcost ⑮: minimum fee is charged on every buy, not once for the total', () => {
  const r = avgCostPlan({ kind: 'stock', lots: [{ shares: 1000, price: 10 }, { shares: 1000, price: 10 }], discount: 1 });
  assert.equal(r.before.fees, 40); // 每筆 14.25→14，不到 20 收 20；合併算只要 28
  close(r.before.avgWithFee, 20040 / 2000);
  assert.equal(r.before.sell, null); assert.ok(Number.isNaN(r.before.gain)); // 沒填現價就不算損益
  assert.equal(lotMinFee(1000), 20); assert.equal(lotMinFee(1500), 1); assert.equal(lotMinFee(250, { minFeeOdd: 5 }), 5);
});
test('avgcost ⑮: ETF odd lots with 2.8 discount — tax 0.1%, tick 0.05', () => {
  const r = avgCostPlan({ kind: 'etf', lots: [{ shares: 100, price: 150 }, { shares: 50, price: 140 }, { shares: 10, price: 150 }], discount: 0.28, minFeeOdd: 1 });
  assert.deepEqual(r.before.lots.map(l => l.fee), [5, 2, 1]); // 5.985→5、2.793→2、0.5985→0 收低消 1
  assert.equal(r.before.totalCost, 23508); close(r.before.avgNoFee, 23500 / 160);
  const two = avgCostPlan({ kind: 'etf', lots: [{ shares: 100, price: 150 }, { shares: 50, price: 140 }], discount: 0.28, minFeeOdd: 1 });
  assert.equal(two.before.breakEven.toFixed(3), '146.919'); assert.equal(two.before.breakEvenTick, 146.95);
  close(buyLot(100, 150, { discount: 0.28 }).total, 15005);
});
test('avgcost ⑮: target average that cannot be reached gives a reason instead of a number', () => {
  const hi = avgCostPlan({ ...ex, add: { price: 80 }, targetAvg: 96 });
  assert.equal(hi.target.ok, false); assert.match(hi.target.message, /低於現在的均價 95\.14/);
  const lo = avgCostPlan({ ...ex, add: { price: 80 }, targetAvg: 80.1 });
  assert.equal(lo.target.ok, false); assert.match(lo.target.message, /到不了/); // 80 × 1.001425 ＝ 80.114
  assert.equal(hi.after, null); assert.equal(hi.addLot, null); // 沒填再買股數就不算「買完之後」
});
test('avgcost ⑮: bad inputs give a readable message', () => {
  assert.throws(() => avgCostPlan({ ...ex, lots: [] }), /至少填一筆/);
  assert.throws(() => avgCostPlan({ ...ex, lots: [{ shares: 1000, price: 100 }, { shares: 0.5, price: 90 }] }), /第 2 筆的股數/);
  assert.throws(() => avgCostPlan({ ...ex, lots: [{ shares: 1000, price: 0 }] }), /第 1 筆的買入價/);
  assert.throws(() => avgCostPlan({ ...ex, kind: 'fund' }), /商品類型/);
  assert.throws(() => avgCostPlan({ ...ex, discount: 0 }), /折扣/);
  assert.throws(() => avgCostPlan({ ...ex, nowPrice: -1 }), /現價/);
  assert.throws(() => avgCostPlan({ ...ex, add: { price: 0 } }), /再買的價格/);
  assert.throws(() => avgCostPlan({ ...ex, add: { price: 80, shares: 1.5 } }), /再買的股數/);
  assert.throws(() => avgCostPlan({ ...ex, targetAvg: 88 }), /先填打算再買的價格/);
});
