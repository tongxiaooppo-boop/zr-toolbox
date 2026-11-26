// ㉖ 三桶壓力測試（Opus 2026-11-26）。合成資料測公式；真實資料的預期值由 Python 獨立重算（不共用 js）核對過：
//   0050 2022 含息 -33.9%、VT 2020 台幣 -33.6%、B 布局 50/30/20 2022 組合 -17.9%。
import test from 'node:test';
import assert from 'node:assert/strict';
import { STRESS_CRASHES, LAYOUTS, LOSS_LIMITS, twTotalReturn, alignFfill, dailyMix, leveredProxy, spliceProxy, drawdownRecovery, stressPlan, lossCheck } from '../js/core/stress.js';
import { STRESS } from '../js/data/stress.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b}`);

test('twTotalReturn：除息買回、分割換算', () => {
  const rows = [{ date: '2024-01-02', close: 100 }, { date: '2024-01-03', close: 98 }, { date: '2024-01-04', close: 25 }, { date: '2024-01-05', close: 26 }];
  const r = twTotalReturn(rows, { dividends: { '2024-01-03': 2 }, splits: { '2024-01-04': 4 } });
  near(r.values[1], 1); // (98＋2)÷100
  near(r.values[2], 25 * 4 / 98); // 分割 1 變 4
  near(r.values[3], r.values[2] * 26 / 25);
  assert.throws(() => twTotalReturn(rows, { dividends: { '2024-01-06': 1 } }), /不是交易日/);
});

test('alignFfill：取當天或之前最後一筆', () => {
  assert.deepEqual(alignFfill(['2024-01-01', '2024-01-02', '2024-01-04'], { '2024-01-02': 5, '2024-01-03': 6 }), [null, 5, 6]);
});

test('dailyMix：每日再平衡；leveredProxy：每日 2 倍扣費用', () => {
  const a = [null, 1, 1.1, 1.21], b = [2, 2, 2, 1];
  const m = dailyMix([a, b], [0.4, 0.6]);
  assert.equal(m[0], null); near(m[1], 1); near(m[2], 1.04); near(m[3], 1.04 * (1 + 0.4 * 0.1 + 0.6 * -0.5));
  const l = leveredProxy([null, 100, 110, 99], { annualCost: 0.25, days: 250 });
  assert.equal(l[0], null); near(l[2], 1 + 0.2 - 0.001); near(l[3], l[2] * (1 - 0.2 - 0.001));
});

test('spliceProxy：上市前用代替品報酬，上市後用真實報酬', () => {
  const s = spliceProxy([null, null, 10, 12], [1, 1.5, 3, 0]);
  assert.deepEqual(s.map(x => Math.round(x * 1000) / 1000), [1, 1.5, 3, 3.6]);
  assert.deepEqual(spliceProxy([5, 10], [null, 1]), [1, 2]);
});

test('drawdownRecovery：區間內最大跌幅、區間後回到前高與月數', () => {
  const dates = ['2020-01-01', '2020-01-02', '2020-01-03', '2020-04-01', '2021-01-01'];
  const r = drawdownRecovery(dates, [1, 1.2, 0.6, 1.1, 1.25], 3);
  near(r.mdd, 0.5); assert.equal(r.peakDate, '2020-01-02'); assert.equal(r.troughDate, '2020-01-03');
  assert.equal(r.recoverDate, '2021-01-01'); assert.equal(r.months, 12);
  const n = drawdownRecovery(dates, [1, 1.2, 0.6, 1.1, 1.19], 3);
  assert.equal(n.recoverDate, null); assert.equal(n.months, null);
  const z = drawdownRecovery(dates.slice(0, 2), [1, 1.1]);
  assert.equal(z.mdd, 0); assert.equal(z.months, 0);
});

const FAKE = {
  products: Object.fromEntries(['0050', '00713', '00719B', '00646', '00631L', 'AOM', 'VT', '00757'].map(c => [c, { realFrom: c === '00713' ? '2020-01-02' : '2000-01-01' }])),
  crashes: [
    { id: '2008', label: 'x', from: '2008-01-01', to: '2008-01-03', daily: 3, dates: ['2008-01-01', '2008-01-02', '2008-01-03', '2008-02-01'],
      series: { '0050': [1, 0.5, 0.5, 1], '00713': [null, 1, 0.5, 2], '00719B': [1, 1, 1, 1], '00646': [1, 1, 1, 1], '00631L': [1, 0.2, 0.2, 1], AOM: [1, 1, 1, 1], VT: [1, 1, 1, 1], '00757': [1, 1, 1, 1] } },
    { id: '2020', label: 'y', from: '2020-01-02', to: '2020-01-03', daily: 2, dates: ['2020-01-02', '2020-01-03', '2020-03-02'],
      series: { '0050': [1, 0.8, 1], '00713': [1, 0.9, 1], '00719B': [1, 1, 1], '00646': [1, 0.6, 1], '00631L': [1, 0.6, 1], AOM: [1, 1, 1], VT: [1, 1, 1], '00757': [1, 1, 1] } }
  ]
};

test('stressPlan：延後起點、代替品標記、桶與組合不再平衡、兩層與最深', () => {
  const r = stressPlan({ data: FAKE, layout: 'C', weights: { steady: 0.5, growth: 0.3, bold: 0.2 } });
  const [a, b] = r.crashes;
  assert.equal(a.from, '2008-01-02'); assert.equal(a.lateStart, true); assert.equal(a.proxy, true);
  assert.equal(a.buckets.steady.proxy, true); assert.equal(a.buckets.growth.proxy, false);
  near(a.buckets.steady.mdd, 0.5); near(a.buckets.growth.mdd, 0); near(a.buckets.bold.mdd, 0);
  near(a.portfolio.mdd, 0.25); // 0.5×0.5＋0.3×1＋0.2×1 ＝ 0.75
  assert.equal(b.proxy, false); assert.equal(b.lateStart, false);
  near(b.portfolio.mdd, 1 - (0.5 * 0.9 + 0.3 * 0.8 + 0.2 * 0.6));
  assert.equal(r.proxyLayer.id, '2008'); assert.equal(r.realLayer.id, '2020'); assert.equal(r.worst.id, '2008');
  const B = stressPlan({ data: FAKE, layout: 'B', weights: { steady: 0, growth: 1, bold: 0 } });
  near(B.crashes[1].buckets.growth.mdd, 0.3); // 0050、00646 各半：(0.8＋0.6)÷2
  assert.throws(() => stressPlan({ data: FAKE, layout: 'D', weights: { steady: 1, growth: 0, bold: 0 } }), /布局/);
  assert.throws(() => stressPlan({ data: FAKE, layout: 'B', weights: { steady: 0.5, growth: 0.5, bold: 0.5 } }), /100%/);
});

test('lossCheck：第 8 題對照', () => {
  assert.deepEqual(LOSS_LIMITS, [0, 0.1, 0.2, 0.3, 0.5]);
  assert.deepEqual(lossCheck({ loss: 4, worst: 0.3 }), { limit: 0.3, ok: true });
  assert.deepEqual(lossCheck({ loss: 4, worst: 0.31 }), { limit: 0.3, ok: false });
  assert.throws(() => lossCheck({ loss: 0, worst: 0.1 }), /第 8 題/);
});

test('真實資料：格式與 8 次股災', () => {
  assert.deepEqual(STRESS.crashes.map(c => c.id), STRESS_CRASHES.map(c => c.id));
  for (const c of STRESS.crashes) {
    assert.ok(c.daily >= 15 && c.daily <= c.dates.length, c.id);
    for (const code of Object.keys(STRESS.products)) assert.equal(c.series[code].length, c.dates.length, `${c.id} ${code}`);
  }
  for (const L of Object.keys(LAYOUTS)) for (const k of ['steady', 'growth', 'bold']) for (const [code] of LAYOUTS[L][k]) assert.ok(STRESS.products[code], code);
});

test('真實資料：Python 獨立重算的數字', () => {
  const W = { steady: 0.5, growth: 0.3, bold: 0.2 };
  const C = stressPlan({ data: STRESS, layout: 'C', weights: W });
  const A = stressPlan({ data: STRESS, layout: 'A', weights: W });
  const B = stressPlan({ data: STRESS, layout: 'B', weights: W });
  const at = (r, id) => r.crashes.find(c => c.id === id);
  near(at(C, '2022').buckets.growth.mdd, 0.339, 0.0015);
  near(at(A, '2020').buckets.growth.mdd, 0.336, 0.0015);
  near(at(B, '2022').portfolio.mdd, 0.179, 0.0015);
  near(at(C, '2022').buckets.bold.mdd, 0.513, 0.0015); // 00631L 2022，R8 -51.3%
  // 2008：0056 從 2007-12-26 才有資料，B、C 延後；A 不延後
  assert.equal(at(B, '2008').from, '2007-12-26'); assert.equal(at(B, '2008').lateStart, true);
  assert.equal(at(A, '2008').lateStart, false); assert.equal(at(A, '2008').proxy, true);
  // 2020 起三種布局都是全真實
  for (const r of [A, B, C]) for (const id of ['2020', '2022', '2024-08', '2025-04']) assert.equal(at(r, id).proxy, false, `${r.layout} ${id}`);
  for (const r of [A, B, C]) { assert.equal(r.realLayer.id, '2020'); assert.equal(r.worst.id, '2008'); }
});
