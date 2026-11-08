// Gate 0 新增的純函式測試。預期值由 Opus 手算／node 驗算，外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNum, fmtMoney, fmtPct, fmtX } from '../js/core/format.js';
import { checkTrigger, split5050 } from '../js/core/trigger.js';
import { TEMPLATES, rebalance } from '../js/core/rebalance.js';
import { pledgeStress, pledgeTable } from '../js/core/pledge.js';
import { exposureNow, betaPlan } from '../js/core/exposure.js';
import { simulateDaily, makeScenario } from '../js/core/decay.js';
import { recoveryGain, maxDrawdown, yearsToRecover } from '../js/core/drawdown.js';
import { finmindAction } from '../js/core/finmind.js';

const close = (a, e, eps = 1e-9) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

test('format: parseNum accepts commas, spaces and full-width digits', () => {
  assert.equal(parseNum('1,234.5'), 1234.5);
  assert.equal(parseNum(' 12 '), 12);
  assert.equal(parseNum('１２３．５'), 123.5);
  assert.ok(Number.isNaN(parseNum('')));
  assert.ok(Number.isNaN(parseNum('abc')));
});
test('format: money, percent and multiple', () => {
  assert.equal(fmtMoney(1234.6), 'NT$ 1,235');
  assert.equal(fmtPct(0.1234), '12.3%');
  assert.equal(fmtX(1.4), '1.40 倍');
  assert.equal(fmtMoney(NaN), '—'); assert.equal(fmtPct(Infinity), '—');
});

test('trigger ②: +50% and −50% hit, −49% does not', () => {
  assert.deepEqual(checkTrigger({ basePrice: 100, nowPrice: 150 }), { change: .5, hit: true, direction: 'up' });
  assert.equal(checkTrigger({ basePrice: 100, nowPrice: 50 }).direction, 'down');
  const r = checkTrigger({ basePrice: 100, nowPrice: 51 });
  assert.equal(r.hit, false); assert.equal(r.direction, null);
  assert.throws(() => checkTrigger({ basePrice: 0, nowPrice: 1 }));
});
test('trigger ②: split back to half and half', () => {
  assert.deepEqual(split5050({ lever: 150000, cash: 100000 }), { total: 250000, target: 125000, leverTrade: -25000, cashAfter: 125000 });
  assert.throws(() => split5050({ lever: 0, cash: 0 }));
});

test('rebalance ③: stock and bond variants share a name but differ in assets and exposure', () => {
  assert.deepEqual(TEMPLATES['442-stock'].assets, ['原型', '正二', '現金']);
  assert.deepEqual(TEMPLATES['442-bond'].assets, ['正二', '美債', '現金']);
  close(rebalance({ template: '442-stock', holdings: [1, 1, 1], months: 6, last: '2026-01-01', asOf: '2026-01-01' }).exposure, 1.2);
  close(rebalance({ template: '442-bond', holdings: [1, 1, 1], months: 6, last: '2026-01-01', asOf: '2026-01-01' }).exposure, .8);
  close(rebalance({ template: '532-bond', holdings: [1, 1, 1], months: 6, last: '2026-01-01', asOf: '2026-01-01' }).exposure, 1);
});
test('rebalance ③: 442 bond version trades back to 40/40/20', () => {
  const r = rebalance({ template: '442-bond', holdings: [280000, 400000, 200000], months: 6, last: '2026-05-08', asOf: '2026-08-01' });
  close(r.total, 880000);
  [352000, 352000, 176000].forEach((v, i) => close(r.targets[i], v));
  [72000, -48000, -24000].forEach((v, i) => close(r.trades[i], v));
  assert.equal(r.ready, false); assert.equal(r.due, '2026-11-08');
});
test('rebalance ③: page example and figure — 532 stock 45/21/20 → 43/25.8/17.2', () => {
  const r = rebalance({ template: '532-stock', holdings: [450000, 210000, 200000], months: 6, last: '2026-05-08', asOf: '2026-11-08' });
  close(r.total, 860000);
  [430000, 258000, 172000].forEach((v, i) => close(r.targets[i], v));
  [-20000, 48000, -28000].forEach((v, i) => close(r.trades[i], v));
  assert.equal(r.ready, true); assert.equal(r.due, '2026-11-08'); close(r.exposure, 1.1);
});
test('rebalance ③: every template weight sums to 1', () => {
  for (const [id, t] of Object.entries(TEMPLATES)) close(t.weights.reduce((a, b) => a + b, 0), 1, 1e-12), assert.ok(t.name, id);
});

const pdf = { shares: 10000, pledgePrice: 100, price: 100, collateralQ: 1, debt: 500000, newDebt: 0, credit: 0, investRatio: 0, purchasePrice: 100, rate: 0, days: 0, call: 1.3, restore: 1.6, safety: 1.6, reserve: 0, remedy: 'repay', q: 1 };
test('pledge ④: PDF example −30% back to 160% needs 62,500 cash repayment or 100,000 collateral', () => {
  const r = pledgeStress(pdf, .3);
  close(r.ratio, 1.4); assert.equal(r.called, false);
  close(r.repay, 62500); close(r.topup, 100000);
  close(pledgeStress({ ...pdf, remedy: 'collateral' }, .3).needed, 100000);
});
test('pledge ④: table covers 10–50% and marks margin calls from −40%', () => {
  const rows = pledgeTable(pdf);
  assert.deepEqual(rows.map(r => r.decline), [.1, .2, .3, .4, .5]);
  assert.deepEqual(rows.map(r => r.called), [false, false, false, true, true]);
  assert.throws(() => pledgeStress({ ...pdf, remedy: 'cash' }, .3));
});
test('pledge ④ page example: 200% now, call below NT$65 (−35%), repay/collateral per row', () => {
  const rows = pledgeTable(pdf);
  close(rows[0].nowRatio, 2); close(rows[0].referencePrice, 65); close(rows[0].callDrop, .35);
  assert.deepEqual(rows.map(r => Math.round(r.ratio * 100)), [180, 160, 140, 120, 100]);
  assert.deepEqual(rows.map(r => Math.round(r.repay)), [0, 0, 62500, 125000, 187500]);
  assert.deepEqual(rows.map(r => Math.round(r.topup)), [0, 0, 100000, 200000, 300000]);
  const free = pledgeStress({ ...pdf, debt: 0 }, .1);
  assert.equal(free.nowRatio, Infinity); assert.equal(free.called, false); close(free.callDrop, 1);
});

test('exposure ⑪: current exposure on both bases', () => {
  const r = exposureNow({ positions: [{ value: 10000000, beta: 1 }], cash: 2000000, debt: 3000000 });
  close(r.assets, 12000000); close(r.net, 9000000); close(r.exposure, 10000000);
  close(r.assetBasis, 10 / 12); close(r.netBasis, 10 / 9); close(r.leverageRatio, 12 / 9);
});
test('exposure ⑪: after buying 1.3m leveraged ETF the net basis is 1.4', () => {
  const r = exposureNow({ positions: [{ value: 10000000, beta: 1 }, { value: 1300000, beta: 2 }], cash: 700000, debt: 3000000 });
  close(r.netBasis, 1.4);
  assert.ok(Number.isNaN(exposureNow({ positions: [{ value: 1, beta: 1 }], cash: 0, debt: 2 }).netBasis));
});
test('exposure ⑪ page example: 1.11x now, buy 1.3m to reach 1.4x net, 0.7m cash left', () => {
  const now = exposureNow({ positions: [{ value: 10000000, beta: 1 }, { value: 0, beta: 2 }], cash: 2000000, debt: 3000000 });
  assert.equal(now.netBasis.toFixed(2), '1.11'); assert.equal(now.assetBasis.toFixed(2), '0.83'); assert.equal(now.leverageRatio.toFixed(2), '1.33');
  const r = betaPlan({ ordinary: 10000000, ordinaryBeta: 1, lever: 0, leverBeta: 2, cash: 2000000, debt: 3000000, target: 1.4, minCash: 0, basis: 'net', allowBorrow: false });
  assert.equal(r.possible, true); close(r.delta, 1300000); close(r.borrow, 0); close(r.cashAfter, 700000); close(r.debtAfter, 3000000); close(r.achieved, 1.4);
  const short = betaPlan({ ordinary: 10000000, ordinaryBeta: 1, lever: 0, leverBeta: 2, cash: 2000000, debt: 3000000, target: 2, minCash: 0, basis: 'net', allowBorrow: false });
  assert.equal(short.possible, false); close(short.shortage, 2000000);
});

test('decay ⑥: +10% then −10% loses 1% on index but 4% on 2x', () => {
  const r = simulateDaily([.1, -.1]);
  close(r.indexTotal, -.01); close(r.leveredTotal, -.04); close(r.naive, -.02); close(r.gap, -.02);
  assert.equal(r.indexPath.length, 3);
});
test('decay ⑥: steady uptrend beats naive 2x', () => {
  const r = simulateDaily(makeScenario('trend', 10, Math.pow(1.01, 10) - 1));
  close(r.indexTotal, 0.10462212541120453); close(r.leveredTotal, 0.21899441999475733);
  assert.ok(r.gap > 0);
});
test('decay ⑥: index −50% in 10 steady days does not zero the 2x fund', () => {
  const r = simulateDaily(makeScenario('trend', 10, -.5));
  close(r.indexTotal, -.5); close(r.leveredTotal, -0.7625840953668666, 1e-9);
  assert.ok(r.leveredPath.at(-1) > 0);
});
test('decay ⑥: choppy market, single −60% day floors at zero, daily cost', () => {
  const chop = simulateDaily(makeScenario('chop', 20, .05));
  close(chop.indexTotal, -0.02472061682143356); close(chop.leveredTotal, -0.09561792499119426);
  assert.deepEqual(simulateDaily([-.6]).leveredPath, [1, 0]);
  close(simulateDaily([0, 0], { dailyCost: .001 }).leveredPath.at(-1), .998001);
});

test('drawdown ⑧: recovery gain', () => {
  close(recoveryGain(.5), 1); close(recoveryGain(.2), .25); close(recoveryGain(.1), 1 / 9); close(recoveryGain(0), 0);
  for (const bad of [1, -.1, NaN]) assert.throws(() => recoveryGain(bad));
});
test('drawdown ⑧: max drawdown finds the deepest peak-to-trough', () => {
  assert.deepEqual(maxDrawdown([100, 120, 90, 130, 65, 140]), { mdd: .5, peakIndex: 3, troughIndex: 4 });
  assert.deepEqual(maxDrawdown([100, 110, 120]), { mdd: 0, peakIndex: 0, troughIndex: 0 });
});
test('drawdown ⑧: years to recover 50% at 10% a year', () => {
  close(yearsToRecover(.5, .1), 7.272540897341713);
});

test('figures ⑥⑧: numbers printed on decay and drawdown figures', () => {
  close(simulateDaily(makeScenario('trend', 10, Math.pow(1.01, 10) - 1)).naive, 0.20924425082240905);
  close(recoveryGain(.3), 3 / 7); close(recoveryGain(.4), 2 / 3);
  assert.equal(yearsToRecover(.5, .1).toFixed(1), '7.3');
});
test('edge: huge or infinite inputs are rejected instead of producing Infinity', () => {
  assert.ok(Number.isNaN(parseNum('9'.repeat(400))));
  assert.equal(fmtPct(1e308), '—');
  assert.throws(() => checkTrigger({ basePrice: Infinity, nowPrice: 1 }));
  assert.throws(() => split5050({ lever: 1e308, cash: 1e308 }));
  assert.throws(() => simulateDaily([.5, 1.5]));
  assert.deepEqual(simulateDaily([-.6, .9]).leveredPath, [1, 0, 0]);
  assert.throws(() => maxDrawdown([1, Infinity]));
  close(yearsToRecover(.5, 1e-12), Math.log(2) / 1e-12, 1);
});
test('finmind: 402 shows quota guide, 403 stops, bad token retries once without it (token cleared only if retry succeeds)', () => {
  assert.equal(finmindAction({ status: 200, usedToken: false, retried: false }).action, 'ok');
  assert.equal(finmindAction({ status: 402, usedToken: true, retried: false }).action, 'show-quota-guide');
  assert.equal(finmindAction({ status: 403, usedToken: true, retried: false }).action, 'stop');
  assert.equal(finmindAction({ status: 400, usedToken: true, retried: false }).action, 'retry-without-token');
  assert.equal(finmindAction({ status: 401, usedToken: true, retried: false }).action, 'retry-without-token');
  assert.equal(finmindAction({ status: 400, usedToken: true, retried: true }).action, 'stop');
  assert.equal(finmindAction({ status: 400, usedToken: false, retried: false }).action, 'stop');
  assert.equal(finmindAction({ status: 500, usedToken: false, retried: false }).action, 'stop');
});
