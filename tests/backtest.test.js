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

// ㉚ 上市以來（v5.14，Opus 定預期值）
const d2 = (date, l, e = 100) => ({ date, px: { '00675L': l, '0050': e } });
const LR = ['allin', 'dajen', 'q5050', 'q532', 'h0050'];

test('backtest v5.14: strategies subset only needs 00675L and 0050; unknown id throws', () => {
  const r = runBacktest({ days: [d2('2016-10-05', 100), d2('2016-10-06', 110)], strategies: LR, fee: 0, tax: 0 });
  assert.deepEqual(r.series.map(s => s.id), LR);
  assert.throws(() => runBacktest({ days: [d2('2016-10-05', 100), d2('2016-10-06', 110)], strategies: ['allin', 'nope'] }), /不認得/);
  assert.throws(() => runBacktest({ days: [d2('2016-10-05', 100), d2('2016-10-06', 110)], strategies: ['allin'], splits: { '0050': { '2016-10-06': 3.9 } } }), /整數/);
});

test('backtest v5.14: split multiplies shares so value is unchanged (with fees)', () => {
  // 1,000,000 ÷ (100 × 1.001425) → 9,985 股，現金 77；分割 1 拆 4 → 39,940 股 × 25 ＋ 77
  const days = [d2('2025-06-17', 100, 100), d2('2025-06-18', 100, 25), d2('2025-06-19', 100, 30)];
  const h = runBacktest({ days, splits: { '0050': { '2025-06-18': 4 } }, strategies: ['h0050'] }).series[0];
  assert.deepEqual(h.values, [998577, 998577, 1198277]);
  assert.match(h.events[0].text, /分割 1 拆 4，股數變成 39,940 股/);
});

test('backtest v5.14: quarterly rebalance every year incl. January; yearly returns and CAGR', () => {
  const days = [d2('2016-10-05', 100), d2('2016-12-30', 120), d2('2017-01-03', 120), d2('2017-12-29', 180), d2('2018-01-02', 90)];
  const r = runBacktest({ days, strategies: ['allin', 'q5050'], fee: 0, tax: 0 });
  assert.deepEqual(r.years.map(y => [y.year, y.from, y.to, y.partial]),
    [[2016, '2016-10-05', '2016-12-30', true], [2017, '2016-12-30', '2017-12-29', false], [2018, '2017-12-29', '2018-01-02', true]]);
  const a = r.series[0];
  assert.deepEqual(a.values, [1e6, 1.2e6, 1.2e6, 1.8e6, 0.9e6]);
  assert.deepEqual(a.years.map(x => +x.toFixed(6)), [0.2, 0.5, -0.5]);
  assert.ok(Math.abs(a.cagr - (Math.pow(0.9, 365.25 / 454) - 1)) < 1e-12); // 454 個日曆天 → −8.127%
  const q = r.series[1];
  assert.deepEqual(q.events.map(e => e.date), ['2017-01-03', '2018-01-02']); // 每年 1 月第一個交易日都配回
});

test('backtest v5.14: reinvest buys back the held fund on dividend day', () => {
  const days = [d2('2016-10-05', 100, 100), d2('2016-10-06', 100, 100), d2('2016-10-07', 100, 200)];
  const dividends = { '0050': { '2016-10-06': 2 } };
  const base = { days, dividends, strategies: ['h0050'], fee: 0, tax: 0 };
  assert.equal(runBacktest({ ...base, reinvest: true }).series[0].final, 2040000); // 10,000＋200 股 × 200
  assert.equal(runBacktest(base).series[0].final, 2020000); // 10,000 股 × 200 ＋ 20,000 現金
});

test('longrun data file (2026-11-25 snapshot): matches Python independent recalculation', async () => {
  const { LONGRUN } = await import('../js/data/longrun.js');
  if (LONGRUN.asOf !== '2026-11-25') return; // 每月更新後數字會變，只驗這一版
  const f = Object.fromEntries(LONGRUN.lump.series.map(s => [s.id, s.final]));
  assert.equal(f.allin, 19881334); assert.equal(f.h0050, 6876535);
  assert.deepEqual(LONGRUN.splits, { '0050': { '2025-06-18': 4 } });
  const y2026 = LONGRUN.yearly.find(y => y.year === 2026).series;
  // 每年初 100 萬的 2026 年＝㉘ 今年那頁（0050 差在配息買回）
  assert.deepEqual(['allin', 'dajen', 'q5050', 'q532'].map(id => y2026.find(s => s.id === id).final), [1331617, 1252181, 1266772, 1336136]);
  assert.ok(Math.abs(LONGRUN.yearly.find(y => y.year === 2020).series[0].ret - 0.6468346) < 1e-6);
});
