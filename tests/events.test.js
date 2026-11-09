// v5.7 股票事件（分割、反分割、除權息、減資）。預期值用 FinMind 實際資料（2026-11-09 查）手算，外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { trigger5050Plan } from '../js/core/trigger.js';
import { normalizeEvents, adjustBasePrice } from '../js/core/events.js';
import { fetchEvents } from '../js/net/price.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const SPLIT_00631L = { date: '2026-03-31', stock_id: '00631L', type: '', before_price: 443.15, after_price: 20.14 };

test('events: 00631L split 2026-03-31 (443.15→20.14, ~1:22) turns base 375.25 into 17.05; now 26.3 = +54.2% hit', () => {
  const ev = normalizeEvents({ split: [SPLIT_00631L] });
  assert.equal(ev[0].kind, 'split'); assert.equal(ev[0].note, '分割（約 1 股拆成 22 股）');
  const a = adjustBasePrice(375.25, '2026-01-02', ev);
  close(a.adjusted, 375.25 * 20.14 / 443.15); close(a.adjusted, 17.0541, 1e-4); assert.equal(a.applied.length, 1);
  const r = trigger5050Plan({ shares: 1000, nowPrice: 26.3, basePrice: a.adjusted, cash: 50000 });
  close(r.change, .54215, 1e-5); assert.equal(r.hit, true); assert.equal(r.suspectSplit, false);
});
test('events: only events after the base date; dividend, reduction and reverse split; sorted; bad rows skipped', () => {
  const ev = normalizeEvents({
    dividend: [{ date: '2025-07-21', before_price: 51.45, after_price: 51.09, stock_and_cache_dividend: 0.36, stock_or_cache_dividend: '息' }, { date: 'x', before_price: 0, after_price: 1 }],
    split: [{ date: '2025-06-18', type: '分割', before_price: 188.65, after_price: 47.16 }, { date: '2025-09-01', before_price: 10, after_price: 50 }],
    reduction: [{ date: '2022-10-11', ClosingPriceonTheLastTradingDay: 14.7, PostReductionReferencePrice: 15.87, ReasonforCapitalReduction: 'Cash refund' }]
  });
  assert.deepEqual(ev.map(e => e.kind), ['reduction', 'split', 'dividend', 'reverse-split']);
  assert.equal(ev[0].note, '減資（退還現金）'); assert.equal(ev[1].note, '分割（約 1 股拆成 4 股）');
  assert.equal(ev[2].note, '除息（0.36 元）'); assert.equal(ev[3].note, '反分割（約 5 股併成 1 股）');
  const a = adjustBasePrice(190, '2025-06-18', ev); // 分割當天的收盤已是分割後價格 → 不算分割
  assert.deepEqual(a.applied.map(e => e.kind), ['dividend', 'reverse-split']);
  close(a.adjusted, 190 * (51.09 / 51.45) * 5);
  close(adjustBasePrice(20, '2026-01-01', ev).factor, 1);
  assert.throws(() => adjustBasePrice(0, '2026-01-01', ev)); assert.throws(() => adjustBasePrice(1, '2026/01/01', ev));
});
test('finmind events: three datasets with start_date; any failure fails the whole lookup', async () => {
  const calls = [];
  const f = async url => {
    calls.push(url); const ds = new URL(url).searchParams.get('dataset');
    return { status: 200, json: async () => ({ status: 200, data: ds === 'TaiwanStockSplitPrice' ? [SPLIT_00631L] : [] }) };
  };
  const r = await fetchEvents('00631L', '2026-01-02', { fetchFn: f });
  assert.equal(r.ok, true); assert.equal(r.raw.split.length, 1); assert.deepEqual(r.raw.dividend, []);
  assert.deepEqual(calls.map(u => new URL(u).searchParams.get('dataset')), ['TaiwanStockSplitPrice', 'TaiwanStockDividendResult', 'TaiwanStockCapitalReductionReferencePrice']);
  assert.ok(calls.every(u => u.includes('start_date=2026-01-02') && !u.includes('token=')));
  let n = 0;
  const g = async () => { n++; const st = n === 2 ? 402 : 200; return { status: st, json: async () => ({ status: st, data: [] }) }; };
  const bad = await fetchEvents('00631L', '2026-01-02', { fetchFn: g });
  assert.equal(bad.ok, false); assert.equal(bad.action, 'show-quota-guide');
});
