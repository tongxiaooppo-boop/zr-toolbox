// ② 50/50 觸發精靈（v5.6）＋依日期抓收盤價。預期值由 Opus 手算，外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { trigger5050Plan } from '../js/core/trigger.js';
import { priceUrl, fetchCloseOn } from '../js/net/price.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const ex = { shares: 5000, nowPrice: 30.5, basePrice: 20, cash: 100000 };

test('trigger ② wizard example: +52.5% hits, sell 861 shares, new base 30.5', () => {
  const r = trigger5050Plan(ex);
  close(r.value, 152500); close(r.total, 252500); close(r.change, .525); close(r.target, 126250);
  assert.equal(r.hit, true); assert.equal(r.direction, 'up');
  close(r.upPrice, 30); close(r.downPrice, 10);
  assert.equal(r.tradeShares, -861); close(r.tradeAmount, -26260.5);
  close(r.leverAfter, 126239.5); close(r.cashAfter, 126260.5);
  assert.equal(r.newBase, 30.5); close(r.nextUp, 45.75); close(r.nextDown, 15.25); assert.equal(r.suspectSplit, false);
});
test('trigger ② wizard: not hit → no trade, base unchanged, trigger prices shown', () => {
  const r = trigger5050Plan({ ...ex, nowPrice: 25 });
  close(r.change, .25); assert.equal(r.hit, false); assert.equal(r.tradeShares, 0);
  close(r.cashAfter, 100000); assert.equal(r.newBase, 20); close(r.nextUp, 30); close(r.nextDown, 10); close(r.upPrice, 30); close(r.downPrice, 10);
});
test('trigger ② wizard: −51% hits down, buy rounds down so cash never goes negative', () => {
  const r = trigger5050Plan({ ...ex, nowPrice: 9.8 });
  assert.equal(r.direction, 'down'); close(r.target, 74500);
  assert.equal(r.tradeShares, 2602); close(r.tradeAmount, 25499.6); close(r.cashAfter, 74500.4);
});
test('trigger ② wizard: custom 30% threshold, zero cash, split suspicion, bad input', () => {
  const r = trigger5050Plan({ shares: 1000, nowPrice: 13, basePrice: 10, cash: 0, threshold: .3 });
  assert.equal(r.hit, true); assert.equal(r.tradeShares, -500); close(r.cashAfter, 6500); close(r.upPrice, 13); close(r.downPrice, 7);
  assert.equal(trigger5050Plan({ ...ex, nowPrice: 30, basePrice: 200 }).suspectSplit, true);
  assert.throws(() => trigger5050Plan({ ...ex, threshold: .05 }), /10%–90%/);
  assert.throws(() => trigger5050Plan({ ...ex, shares: 1.5 }), /正整數/);
  assert.throws(() => trigger5050Plan({ ...ex, cash: -1 }), /現金/);
});

const fake = rows => { const calls = []; const fn = async url => { calls.push(url); return { status: 200, json: async () => ({ status: 200, data: rows }) }; }; fn.calls = calls; return fn; };
test('finmind fetch by date: url has end_date; holiday uses the previous trading day', async () => {
  const u = new URL(priceUrl('00631L', '', new Date(2026, 0, 3), '2026-01-03'));
  assert.equal(u.searchParams.get('start_date'), '2025-12-20'); assert.equal(u.searchParams.get('end_date'), '2026-01-03');
  const f = fake([{ date: '2025-12-30', close: 21 }, { date: '2025-12-31', close: 22.5 }]);
  assert.deepEqual(await fetchCloseOn('00631L', '2026-01-03', { fetchFn: f }), { ok: true, close: 22.5, date: '2025-12-31', clearToken: false });
  assert.ok(f.calls[0].includes('end_date=2026-01-03'));
});
test('finmind fetch by date: rows after the date are ignored; empty and bad date', async () => {
  const r = await fetchCloseOn('0050', '2026-11-05', { fetchFn: fake([{ date: '2026-11-05', close: 195 }, { date: '2026-11-06', close: 196.5 }]) });
  assert.equal(r.close, 195);
  const empty = await fetchCloseOn('0050', '2026-11-05', { fetchFn: fake([]) });
  assert.equal(empty.ok, false); assert.match(empty.message, /2026-11-05 前後/);
  assert.equal((await fetchCloseOn('0050', '2026/11/05', { fetchFn: fake([]) })).ok, false);
});
