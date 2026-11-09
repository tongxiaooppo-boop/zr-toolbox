// ⑯ ⑰ ⑱ 精靈（v5.11）。預期值由 Opus 手算（稅額用級距逐格算、累進差額用「上限 × 稅率差」驗；換匯拆解用恆等式驗），外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { valuationPlan, ratiosToBase, historyBands, percentile } from '../js/core/valuation.js';
import { dividendTaxPlan, progressiveTax, TAX_YEARS } from '../js/core/divtax.js';
import { fxPlan, ratePair } from '../js/core/fx.js';
import { fetchRatios, fetchFxRate } from '../js/net/price.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

// ---------- ⑯ ----------
const EX16 = { price: 580, eps: 32, bvps: 140, dividend: 16, pe: [15, 20, 25], pb: [3, 4, 5], yields: [0.04, 0.03, 0.025] };

test('valuation ⑯ page example: 現價 580、EPS 32、淨值 140、股利 16', () => {
  const r = valuationPlan(EX16);
  assert.deepEqual(r.methods.map(m => m.key), ['pe', 'pb', 'yield']);
  const [pe, pb, y] = r.methods;
  close(pe.current, 18.125); assert.deepEqual(pe.prices, { cheap: 480, fair: 640, expensive: 800 }); assert.equal(pe.zone, 'cheap-fair');
  close(pb.current, 580 / 140); assert.equal(pb.current.toFixed(2), '4.14'); assert.deepEqual(pb.prices, { cheap: 420, fair: 560, expensive: 700 }); assert.equal(pb.zone, 'fair-expensive');
  close(y.current, 16 / 580); assert.equal((y.current * 100).toFixed(2), '2.76');
  close(y.prices.cheap, 400); close(y.prices.fair, 1600 / 3); close(y.prices.expensive, 640); assert.equal(y.zone, 'fair-expensive');
  assert.equal(y.zoneLabel, '合理價到昂貴價之間');
});

test('valuation ⑯: EPS 負的不能用本益比、只填股利、剛好等於合理價、順序錯與全部沒填', () => {
  const r = valuationPlan({ price: 50, eps: -2, pe: [10, 12, 15], dividend: 2, yields: [0.06, 0.05, 0.04] });
  assert.equal(r.methods[0].ok, false); assert.match(r.methods[0].reason, /EPS/);
  assert.equal(r.methods[1].key, 'yield'); close(r.methods[1].prices.fair, 40); assert.equal(r.methods[1].zone, 'fair-expensive');
  assert.equal(valuationPlan({ price: 640, eps: 32, pe: [15, 20, 25] }).methods[0].zone, 'cheap-fair');
  assert.equal(valuationPlan({ price: 100, dividend: 0, yields: [0.06, 0.05, 0.04] }).methods[0].ok, false);
  assert.throws(() => valuationPlan({ price: 100, eps: 5, pe: [20, 15, 25] }), /由小到大/);
  assert.throws(() => valuationPlan({ price: 100, dividend: 5, yields: [0.04, 0.05, 0.06] }), /由大到小/);
  assert.throws(() => valuationPlan({ price: 100, eps: 5 }), /三個/);
  assert.throws(() => valuationPlan({ price: 100, eps: NaN, bvps: null }), /至少要填一個/);
});

test('valuation ⑯: 證交所比率換回每股數字（ETF 沒有本益比）、歷史分位數', () => {
  const b = ratiosToBase(1460, { PER: 24.75, PBR: 8.61, dividend_yield: 1.03 });
  close(b.eps, 1460 / 24.75); close(b.bvps, 1460 / 8.61); close(b.dividend, 15.038);
  assert.deepEqual(ratiosToBase(100, { PER: 0, PBR: 0, dividend_yield: 3 }), { eps: null, bvps: null, dividend: 3 });
  close(percentile([10, 12, 14, 16, 18], 0.25), 12);
  // PER 1..40、PBR 0.1..4.0、殖利率 1%..40%，另加一列全 0（要排除）
  const rows = Array.from({ length: 40 }, (_, i) => ({ date: `d${String(i).padStart(2, '0')}`, PER: i + 1, PBR: (i + 1) / 10, dividend_yield: i + 1 }));
  rows.push({ date: 'd40', PER: 0, PBR: 0, dividend_yield: 0 });
  const h = historyBands(rows);
  close(h.pe[0], 10.75); close(h.pe[1], 20.5); close(h.pe[2], 30.25);
  close(h.pb[1], 2.05); close(h.yields[0], 0.3025); close(h.yields[2], 0.1075);
  assert.deepEqual(h.n, { pe: 40, pb: 40, yields: 40 }); assert.equal(h.from, 'd00'); assert.equal(h.to, 'd40');
  assert.equal(historyBands(rows.slice(0, 10)).pe, null);
});

// ---------- ⑰ ----------
test('divtax ⑰: 累進稅率表（115 年度級距 61／138／277／519 萬；114 年度 59 萬）', () => {
  assert.equal(TAX_YEARS[115].provisional, true);
  assert.deepEqual(progressiveTax(610000, 115), { tax: 30500, rate: 0.05, diff: 0 });
  const t = progressiveTax(1380000, 115); close(t.tax, 122900); close(t.diff, 42700);
  close(progressiveTax(1380001, 115).diff, 153100);
  close(progressiveTax(2770001, 115).diff, 430100);
  close(progressiveTax(5190001, 115).diff, 949100);
  close(progressiveTax(600000, 114).tax, 600000 * 0.12 - 590000 * 0.07);
});

test('divtax ⑰ page example: 單身、薪資 80 萬、股利 30 萬（115 年度）→ 合併 8,120、分開 100,800', () => {
  const r = dividendTaxPlan({ people: 1, salaries: [800000], dividends: 300000 });
  assert.equal(r.exemption, 101000); assert.equal(r.deduction, 136000); assert.equal(r.deductionKind, 'standard');
  assert.equal(r.salarySpecial, 227000); assert.equal(r.basicLivingDiff, 0);
  assert.equal(r.combined.income, 1100000); assert.equal(r.combined.net, 636000); assert.equal(r.combined.rate, 0.12);
  close(r.combined.taxBefore, 33620); close(r.combined.credit, 25500); assert.equal(r.combined.creditCapped, false); close(r.combined.payable, 8120);
  assert.equal(r.separate.net, 336000); close(r.separate.taxBefore, 16800); close(r.separate.dividendTax, 84000); close(r.separate.payable, 100800);
  assert.equal(r.best, 'combined'); close(r.saving, 92680);
});

test('divtax ⑰: 高薪＋大額股利分開比較划算；抵減上限 8 萬', () => {
  const r = dividendTaxPlan({ people: 1, salaries: [6000000], dividends: 2000000 });
  assert.equal(r.combined.net, 7536000); assert.equal(r.combined.rate, 0.4);
  close(r.combined.credit, 80000); assert.equal(r.combined.creditCapped, true); close(r.combined.payable, 1985300);
  assert.equal(r.separate.net, 5536000); close(r.separate.payable, 1825300);
  assert.equal(r.best, 'separate'); close(r.saving, 160000);
  // 夫妻兩份薪水、股利 200 萬：30% 級距仍是合併划算
  const m = dividendTaxPlan({ married: true, people: 2, salaries: [1500000, 1200000], dividends: 2000000 });
  assert.equal(m.exemption, 202000); assert.equal(m.deduction, 272000); assert.equal(m.salarySpecial, 454000);
  close(m.combined.payable, 621500); close(m.separate.payable, 761300); assert.equal(m.best, 'combined');
});

test('divtax ⑰: 四口之家（114 年度）基本生活費差額 → 合併可退 8,500；70 歲以上、列舉、輸入檢查', () => {
  const r = dividendTaxPlan({ year: 114, married: true, people: 4, salaries: [500000], dividends: 100000 });
  assert.equal(r.exemption, 388000); assert.equal(r.deduction, 262000); assert.equal(r.salarySpecial, 218000);
  assert.equal(r.basicLiving, 852000); assert.equal(r.basicLivingDiff, 202000);
  assert.equal(r.combined.net, 0); close(r.combined.payable, -8500);
  close(r.separate.payable, 28000); assert.equal(r.best, 'combined'); close(r.saving, 36500);
  const e = dividendTaxPlan({ people: 2, elderly: 1, itemized: 200000, dividends: 0 });
  assert.equal(e.exemption, 101000 + 151500); assert.equal(e.deductionKind, 'itemized'); assert.equal(e.deduction, 200000); assert.equal(e.best, 'same');
  assert.throws(() => dividendTaxPlan({ married: true, people: 1, dividends: 1 }), /至少 2 人/);
  assert.throws(() => dividendTaxPlan({ people: 1, salaries: [1, 2], dividends: 1 }), /薪資的人數/);
  assert.throws(() => dividendTaxPlan({ people: 1, dividends: NaN }), /股利所得/);
  assert.throws(() => dividendTaxPlan({ year: 113, people: 1, dividends: 1 }), /113/);
});

// ---------- ⑱ ----------
const EX18 = { twdIn: 330000, rateIn: { buy: 32.9, sell: 33 }, foreignNow: 11000, rateNow: { buy: 31.4, sell: 31.5 } };

test('fx ⑱ page example: 33 萬換 1 萬美元、漲到 11,000、匯率 33→31.5', () => {
  const r = fxPlan(EX18);
  close(r.foreignIn, 10000); close(r.twdOut, 345400); close(r.pnl, 15400); close(r.ret, 15400 / 330000); assert.equal((r.ret * 100).toFixed(2), '4.67');
  close(r.assetRet, 0.1); close(r.fxRet, 31.45 / 32.95 - 1); assert.equal((r.fxRet * 100).toFixed(2), '-4.55');
  close(r.parts.asset, 32950); close(r.parts.fx, -16500); close(r.parts.spreadIn, -500); close(r.parts.spreadOut, -550); close(r.parts.fees, 0);
  close(Object.values(r.parts).reduce((s, x) => s + x, 0), r.pnl);
  close(r.spreadPctIn, 0.1 / 33); close(r.breakEvenBuy, 30);
});

test('fx ⑱: 只換匯來回（外幣留白）＋手續費、牌告列轉匯率、輸入檢查', () => {
  const r = fxPlan({ twdIn: 33000, rateIn: { buy: 32.9, sell: 33 }, feeIn: 100, foreignNow: NaN, rateNow: { buy: 32.9, sell: 33 }, feeOut: 100 });
  close(r.foreignIn, 32900 / 33); close(r.foreignNow, r.foreignIn); close(r.assetRet, 0); close(r.fxRet, 0);
  close(r.pnl, -(32900 / 33) * 0.1 - 200); close(Object.values(r.parts).reduce((s, x) => s + x, 0), r.pnl);
  assert.deepEqual(ratePair({ spot_buy: 32.72, spot_sell: 32.82, cash_buy: -1, cash_sell: 33 }), { buy: 32.72, sell: 32.82 });
  assert.equal(ratePair({ spot_buy: 32.72, spot_sell: 32.82, cash_buy: -1, cash_sell: 33 }, 'cash'), null);
  assert.throws(() => fxPlan({ ...EX18, rateIn: { buy: 33, sell: 32.9 } }), /填反/);
  assert.throws(() => fxPlan({ ...EX18, rateNow: { buy: NaN, sell: 31.5 } }), /現在/);
  assert.throws(() => fxPlan({ ...EX18, feeIn: 330000 }), /手續費/);
});

// ---------- net（假 fetch） ----------
const fake = data => async () => ({ status: 200, json: async () => ({ status: 200, data }) });

test('net ⑯⑱: fetchRatios 回最後一列、空資料要使用者自己填；fetchFxRate 取 date 以前最近一天', async () => {
  const r = await fetchRatios('2330', { fetchFn: fake([{ date: '2026-11-05', PER: 25.96 }, { date: '2026-11-06', PER: 24.75 }]) });
  assert.equal(r.ok, true); assert.equal(r.last.PER, 24.75); assert.equal(r.rows.length, 2);
  const e = await fetchRatios('0050', { fetchFn: fake([]) });
  assert.equal(e.ok, false); assert.match(e.message, /自己填/);
  const f = await fetchFxRate('USD', { date: '2026-11-08', fetchFn: fake([{ date: '2026-11-05', spot_buy: 32.83 }, { date: '2026-11-06', spot_buy: 32.72 }]) });
  assert.equal(f.ok, true); assert.equal(f.date, '2026-11-06'); assert.equal(f.row.spot_buy, 32.72);
  assert.equal((await fetchFxRate('USD', { date: '2026/11/08', fetchFn: fake([]) })).ok, false);
});
