// ㉘ 年初 100 萬現在變多少（Opus 定預期值；外包不得改）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGIES, runBacktest } from '../js/core/backtest.js';
import { BACKTEST } from '../js/data/backtest2026.js';

const day = (date, l, e = 100, h = 50, a = 20) => ({ date, px: { '00675L': l, '0050': e, '0056': h, '00981A': a } });

test('backtest: 7 strategies, zr group has 4 (chart ≤ 4 lines), hold group has 3', () => {
  assert.equal(STRATEGIES.length, 7);
  assert.equal(STRATEGIES.filter(s => s.group === 'zr').length, 4);
  assert.equal(STRATEGIES.filter(s => s.group === 'hold').length, 3);
});

test('backtest: 大仁 triggers at +50% and resets base; no fees case is exact', () => {
  const days = [day('2026-01-02', 100), day('2026-01-05', 149), day('2026-01-06', 150), day('2026-01-07', 200)];
  const r = runBacktest({ days, fee: 0, tax: 0 });
  const dj = r.series.find(s => s.id === 'dajen');
  assert.deepEqual(dj.values, [1e6, 1245000, 1250000, 1458350]); // 5000 股＋50 萬；150 元觸發 → 目標 625,000：賣 833 股剩 4167 股、現金 624,950；200 元時 833,400＋624,950
  assert.equal(dj.events.length, 1);
  assert.match(dj.events[0].text, /漲 50\.0%.*新基準 150 元/);
  const all = r.series.find(s => s.id === 'allin');
  assert.equal(all.final, 2e6); assert.equal(all.peak, 2e6); assert.equal(all.giveback, 0);
});

test('backtest: quarterly rebalance on first April day; dividends credited as cash', () => {
  const days = [day('2026-03-30', 100), day('2026-03-31', 100), day('2026-04-01', 200), day('2026-04-02', 200)];
  const r = runBacktest({ days, dividends: { '0050': { '2026-03-31': 2 } }, fee: 0, tax: 0 });
  const q = r.series.find(s => s.id === 'q5050');
  assert.equal(q.events.length, 1); assert.match(q.events[0].text, /每季配回：正2賣 1,250 股/);
  assert.deepEqual(q.values.slice(-1), [1500000]);
  const h = r.series.find(s => s.id === 'h0050');
  assert.equal(h.dividendTotal, 20000); assert.equal(h.final, 1020000); // 10000 股 × 2 元
  assert.deepEqual(r.months.map(m => m.date), ['2026-03-31', '2026-04-02']);
});

test('backtest: errors', () => {
  assert.throws(() => runBacktest({ days: [day('2026-01-02', 100)] }), /至少要有 2 個交易日/);
  assert.throws(() => runBacktest({ days: [day('2026-01-02', 100), { date: '2026-01-05', px: { '00675L': 1 } }] }), /缺 0050/);
});

test('backtest data file (2026-11-25 snapshot): finals match Opus hand calculation', () => {
  const f = Object.fromEntries(BACKTEST.series.map(s => [s.id, s.final]));
  if (BACKTEST.asOf !== '2026-11-25') return; // 每月更新後數字會變，只驗這一版
  assert.deepEqual([f.allin, f.dajen, f.q5050, f.q532], [1331617, 1252181, 1266772, 1336136]);
  assert.equal(BACKTEST.series.find(s => s.id === 'h0056').dividendTotal, 133178);
});
