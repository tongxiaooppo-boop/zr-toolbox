// v5 精靈框架：持股、④ 精靈、FinMind 抓價（注入假 fetch，不連網路）。預期值由 Opus 手算，外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCode, holdingSummary } from '../js/core/holdings.js';
import { pledgePlan } from '../js/core/pledge.js';
import { priceUrl, fetchClose } from '../js/net/price.js';

const close = (a, e, eps = 1e-9) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

test('holdings: normalizeCode handles full-width, case and spaces', () => {
  assert.equal(normalizeCode(' ００６３１ｌ '), '00631L');
  assert.equal(normalizeCode('0050'), '0050');
  assert.equal(normalizeCode('台積電'), '');
  assert.equal(normalizeCode('12'), '');
});
test('holdings: summary of two positions, and row-numbered errors', () => {
  const s = holdingSummary([{ code: '0050', shares: 3000, buyPrice: 150, nowPrice: 200 }, { code: '00631L', shares: 1000, buyPrice: 250, nowPrice: 200 }]);
  close(s.cost, 700000); close(s.value, 800000); close(s.gain, 100000); close(s.gainPct, 1 / 7);
  close(s.rows[1].gain, -50000); close(s.rows[1].gainPct, -.2);
  assert.throws(() => holdingSummary([{ code: '0050', shares: 1.5, buyPrice: 1, nowPrice: 1 }]), /第 1 檔的股數/);
  assert.throws(() => holdingSummary([{ code: '0050', shares: 1, buyPrice: 1, nowPrice: 1 }, { code: '0050', shares: 1, buyPrice: 1, nowPrice: NaN }]), /第 2 檔的現價/);
  assert.throws(() => holdingSummary([]));
});

const ex = { holdings: [{ code: '0050', shares: 10000, buyPrice: 80, nowPrice: 100 }], debt: 500000, rate: 0, days: 0, call: 1.3, target: 1.6, collateralQ: 1, use: 'cash' };
test('pledge ④ wizard example: same numbers as the figure (200%, call at 65, −35%)', () => {
  const r = pledgePlan(ex);
  close(r.summary.value, 1000000); close(r.summary.gain, 200000); close(r.summary.gainPct, .25);
  close(r.nowRatio, 2); close(r.callDrop, .35); close(r.interest, 0);
  close(r.perStock[0].callPrice, 65); close(r.perStock[0].vsBuy, -.1875);
  assert.deepEqual(r.rows.map(x => Math.round(x.repay)), [0, 0, 62500, 125000, 187500]);
  assert.deepEqual(r.rows.map(x => Math.round(x.topup)), [0, 0, 100000, 200000, 300000]);
  assert.equal(r.useFactor, 0); close(r.useLossAtCall, 0);
});
test('pledge ④ wizard: two holdings fall together; borrowed money in 2x ETF loses ~2× the call drop', () => {
  const r = pledgePlan({ ...ex, holdings: [{ code: '0050', shares: 1000, buyPrice: 100, nowPrice: 100 }, { code: '006208', shares: 2000, buyPrice: 40, nowPrice: 50 }], debt: 100000, use: 'lever' });
  close(r.summary.value, 200000); close(r.nowRatio, 2); close(r.callDrop, .35);
  close(r.perStock[0].callPrice, 65); close(r.perStock[1].callPrice, 32.5); close(r.perStock[1].vsBuy, 32.5 / 40 - 1);
  assert.equal(r.useFactor, 2); close(r.useLossAtCall, 70000);
});
test('pledge ④ wizard: one year of 3% interest lowers the ratio; zero debt is rejected', () => {
  const r = pledgePlan({ ...ex, rate: .03, days: 365 });
  close(r.interest, 15000); close(r.stressedDebt, 515000); close(r.nowRatio, 1000000 / 515000);
  close(r.perStock[0].callPrice, 1.3 * 515000 / 10000);
  assert.throws(() => pledgePlan({ ...ex, debt: 0 }), /借款要大於 0/);
  assert.throws(() => pledgePlan({ ...ex, use: 'x' }));
});

const today = new Date(2026, 10, 9);
const fake = replies => { const calls = []; const fn = async url => { calls.push(url); const [http, body] = replies.shift(); return { status: http, json: async () => body }; }; fn.calls = calls; return fn; };
test('finmind fetch: url has dataset, code, 14-day start and token only when given', () => {
  const u = new URL(priceUrl('0050', '', today));
  assert.equal(u.searchParams.get('dataset'), 'TaiwanStockPrice'); assert.equal(u.searchParams.get('data_id'), '0050');
  assert.equal(u.searchParams.get('start_date'), '2026-10-26'); assert.equal(u.searchParams.has('token'), false);
  assert.equal(new URL(priceUrl('0050', 'abc', today)).searchParams.get('token'), 'abc');
});
test('finmind fetch: 200 returns the last close', async () => {
  const f = fake([[200, { status: 200, data: [{ date: '2026-11-05', close: 195 }, { date: '2026-11-06', close: 196.5 }] }]]);
  assert.deepEqual(await fetchClose('0050', { fetchFn: f, today }), { ok: true, close: 196.5, date: '2026-11-06', clearToken: false });
});
test('finmind fetch: bad token → retry without token → ok and clear token', async () => {
  const f = fake([[401, { status: 401, msg: 'token error' }], [200, { status: 200, data: [{ date: '2026-11-06', close: 196.5 }] }]]);
  const r = await fetchClose('0050', { token: 'old', fetchFn: f, today });
  assert.equal(r.ok, true); assert.equal(r.clearToken, true);
  assert.ok(f.calls[0].includes('token=old')); assert.ok(!f.calls[1].includes('token='));
});
test('finmind fetch: 402 quota, 403 stop (no retry), network error, empty data', async () => {
  assert.equal((await fetchClose('0050', { fetchFn: fake([[402, { status: 402 }]]), today })).action, 'show-quota-guide');
  const f403 = fake([[403, { status: 403 }]]);
  const r403 = await fetchClose('0050', { token: 't', fetchFn: f403, today });
  assert.equal(r403.action, 'stop'); assert.equal(f403.calls.length, 1);
  assert.equal((await fetchClose('0050', { fetchFn: async () => { throw new TypeError('offline'); }, today })).ok, false);
  const empty = await fetchClose('9999', { fetchFn: fake([[200, { status: 200, data: [] }]]), today });
  assert.equal(empty.ok, false); assert.match(empty.message, /查無 9999/);
});
