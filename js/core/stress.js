// ㉖ 三桶壓力測試（v5.14，Opus 2026-11-26 定；外包不得改簽名、股災區間、布局、算法）。
// 依據：docs/decision/決策-2026-11-26-三桶壓力測試.md。資料由 scripts/stress-update.mjs 產生 js/data/stress.js。
//
// 算法（全部用台幣、含息）：
//   - 每檔商品一條「台幣含息淨值」：台股＝收盤價，除息日當天把現金股利買回（(收盤＋股利)÷前一日收盤），分割依倍數換算；
//     美股＝Yahoo 還原價（adjclose）× FRED DEXTAUS（每 1 美元換多少台幣）。日曆用台股交易日（0050），美股與匯率取「當天或之前最後一筆」。
//   - 上市前用代替品接起來（spliceProxy）：上市日之前用代替品的每日報酬，之後用真實商品。
//   - 每次股災：在區間第一天（或布局內所有商品都有資料的第一天）照比例買進，之後不再平衡；
//     桶內兩檔（B 布局）也是各半買進後不再平衡。
//   - 最大跌幅只看區間內；回到前高往區間後找（區間內逐日，區間後每週一筆，所以回本日期精確到週）。
//
// 介面：
//   STRESS_CRASHES：8 次 [{ id, label, from, to }]（R8 股災表台、美兩段區間的聯集）
//   LAYOUTS：{ A|B|C: { label, steady|growth|bold: [[code, weight], ...] } }，DEFAULT_LAYOUT＝'B'
//   LEVER_COST：正2 代替品每年扣的費用（小數）
//   LOSS_LIMITS：第 8 題分數 1–5 → 能接受的跌幅（小數）
//   twTotalReturn(rows, { dividends, splits }) → { dates, values }
//   alignFfill(dates, byDate) → (number|null)[]
//   dailyMix(seriesList, weights) / leveredProxy(values, { leverage, annualCost, days }) / spliceProxy(real, proxy) → (number|null)[]
//   drawdownRecovery(dates, values, daily) → { mdd, peakDate, troughDate, recoverDate, months }
//   stressPlan({ data, layout, weights }) → 見函式註解
//   lossCheck({ loss, worst }) → { limit, ok }
import { maxDrawdown } from './drawdown.js';

export const STRESS_CRASHES = Object.freeze([
  { id: '2008', label: '2008 金融海嘯', from: '2007-10-09', to: '2009-03-09' },
  { id: '2011', label: '2011 歐債危機', from: '2011-01-28', to: '2011-12-19' },
  { id: '2015', label: '2015 中國股災', from: '2015-04-27', to: '2015-08-25' },
  { id: '2018', label: '2018 貿易戰', from: '2018-01-23', to: '2018-12-26' },
  { id: '2020', label: '2020 新冠疫情', from: '2020-01-14', to: '2020-03-23' },
  { id: '2022', label: '2022 升息', from: '2022-01-03', to: '2022-10-25' },
  { id: '2024-08', label: '2024 年 8 月日圓套利平倉', from: '2024-07-11', to: '2024-08-05' },
  { id: '2025-04', label: '2025 年 4 月美國關稅', from: '2025-02-19', to: '2025-04-09' }
]);

export const LAYOUTS = Object.freeze({
  A: Object.freeze({ label: '全球', steady: [['AOM', 1]], growth: [['VT', 1]], bold: [['00757', 1]] }),
  B: Object.freeze({ label: '台＋美', steady: [['00713', 0.5], ['00719B', 0.5]], growth: [['0050', 0.5], ['00646', 0.5]], bold: [['00631L', 1]] }),
  C: Object.freeze({ label: '純台股', steady: [['00713', 1]], growth: [['0050', 1]], bold: [['00631L', 1]] })
});
export const DEFAULT_LAYOUT = 'B';
export const BUCKET_KEYS = Object.freeze(['steady', 'growth', 'bold']);
export const LEVER_COST = 0.01;
export const LOSS_LIMITS = Object.freeze([0, 0.1, 0.2, 0.3, 0.5]);

const DAY = 86400e3;
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

/**
 * 台股含息淨值（第一天＝1）。rows：[{ date, close }] 依日期排序、close > 0。
 * dividends：{ 'YYYY-MM-DD': 每股現金股利 }；splits：{ 'YYYY-MM-DD': k }（1 股變 k 股；反分割 k < 1）。
 * 某日報酬＝(收盤＋股利)×k ÷ 前一日收盤。股利或分割日不在 rows 裡 → throw（呼叫端先移到下一個交易日）。
 */
export function twTotalReturn(rows, { dividends = {}, splits = {} } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('沒有價格資料。');
  const dates = rows.map(r => r.date);
  rows.forEach((r, i) => {
    if (!isDate(r.date) || !(r.close > 0)) throw new Error(`第 ${i + 1} 筆價格不對：${JSON.stringify(r)}`);
    if (i && r.date <= rows[i - 1].date) throw new Error(`日期沒有排序：${r.date}`);
  });
  const set = new Set(dates);
  for (const d of [...Object.keys(dividends), ...Object.keys(splits)]) if (!set.has(d)) throw new Error(`${d} 不是交易日（除息或分割日要先移到交易日）。`);
  const values = [1];
  for (let i = 1; i < rows.length; i++) {
    const d = rows[i].date, k = splits[d] ?? 1, div = dividends[d] ?? 0;
    if (!(k > 0) || !(div >= 0)) throw new Error(`${d} 的分割倍數或股利不對。`);
    values.push(values[i - 1] * (rows[i].close + div) * k / rows[i - 1].close);
  }
  return { dates, values };
}

/** 依 dates 取 byDate（{date: value}）當天或之前最後一筆；第一筆之前是 null。dates 要排序。 */
export function alignFfill(dates, byDate) {
  const keys = Object.keys(byDate).filter(k => Number.isFinite(byDate[k]) && byDate[k] > 0).sort();
  const out = []; let j = -1;
  for (const d of dates) {
    while (j + 1 < keys.length && keys[j + 1] <= d) j++;
    out.push(j < 0 ? null : byDate[keys[j]]);
  }
  return out;
}

const firstIndex = a => a.findIndex(v => v != null);

/** 多條淨值每日再平衡混合（例：AOM 代替品 0.4 SPY＋0.6 AGG）。從全部都有值的那天起＝1，之前 null。 */
export function dailyMix(seriesList, weights) {
  if (seriesList.length !== weights.length || seriesList.length === 0) throw new Error('混合的數量不對。');
  if (Math.abs(weights.reduce((s, w) => s + w, 0) - 1) > 1e-9) throw new Error('混合權重加起來要等於 1。');
  const n = seriesList[0].length, start = Math.max(...seriesList.map(firstIndex));
  if (seriesList.some(s => s.length !== n || firstIndex(s) < 0)) throw new Error('混合的序列長度不一致或沒有資料。');
  const out = Array(n).fill(null); out[start] = 1;
  for (let i = start + 1; i < n; i++) out[i] = out[i - 1] * (1 + weights.reduce((s, w, k) => s + w * (seriesList[k][i] / seriesList[k][i - 1] - 1), 0));
  return out;
}

/** 每日固定倍數的代替品（正2）：每天報酬＝leverage×原報酬 − annualCost÷days。前面 null 照留。 */
export function leveredProxy(values, { leverage = 2, annualCost = LEVER_COST, days = 250 } = {}) {
  const start = firstIndex(values);
  if (start < 0) throw new Error('沒有資料。');
  const out = values.map(() => null); out[start] = 1;
  for (let i = start + 1; i < values.length; i++) out[i] = Math.max(0, out[i - 1] * (1 + leverage * (values[i] / values[i - 1] - 1) - annualCost / days));
  return out;
}

/** 上市前用代替品：real 第一個非 null 之前用 proxy 的每日報酬，之後用 real 的每日報酬；從 proxy（或 real）第一筆起＝1。 */
export function spliceProxy(real, proxy) {
  if (real.length !== proxy.length) throw new Error('真實與代替品長度不一致。');
  const r0 = firstIndex(real), p0 = firstIndex(proxy);
  if (r0 < 0) throw new Error('真實商品沒有資料。');
  const start = p0 >= 0 && p0 < r0 ? p0 : r0;
  const out = real.map(() => null); out[start] = 1;
  for (let i = start + 1; i < real.length; i++) {
    const src = i <= r0 ? proxy : real;
    out[i] = out[i - 1] * src[i] / src[i - 1];
  }
  return out;
}

/**
 * 區間內最大跌幅＋回到前高。values 前 daily 筆是區間內（逐日），之後是區間後（每週）。
 * → { mdd（正數小數）, peakDate, troughDate, recoverDate（沒回到是 null）, months（peakDate→recoverDate，月＝30.4375 天，一位小數；沒回到是 null） }
 */
export function drawdownRecovery(dates, values, daily = values.length) {
  if (dates.length !== values.length || daily < 1 || daily > values.length) throw new Error('日期與數值長度不一致。');
  const { mdd, peakIndex, troughIndex } = maxDrawdown(values.slice(0, daily));
  const peak = values[peakIndex];
  let rec = -1;
  if (mdd > 0) for (let i = troughIndex + 1; i < values.length; i++) if (values[i] >= peak - 1e-12) { rec = i; break; }
  const recoverDate = mdd > 0 ? (rec < 0 ? null : dates[rec]) : dates[peakIndex];
  const months = recoverDate == null ? null : Math.round((Date.parse(recoverDate) - Date.parse(dates[peakIndex])) / DAY / 30.4375 * 10) / 10;
  return { mdd, peakDate: dates[peakIndex], troughDate: dates[troughIndex], recoverDate, months };
}

/**
 * 三桶壓力測試。
 * @param {{ data: object, layout: 'A'|'B'|'C', weights: { steady: number, growth: number, bold: number } }} p
 *   data＝js/data/stress.js 的 STRESS（格式見 scripts/stress-update.mjs 檔頭）；weights 小數、各 ≥ 0、合計 1。
 * @returns {{ layout, label, crashes: Array<{ id, label, from, to, lateStart, proxy,
 *     buckets: { steady|growth|bold: { weight, codes, mdd, proxy } },
 *     portfolio: { mdd, peakDate, troughDate, recoverDate, months } }>,
 *   proxyLayer, realLayer, worst }}
 *   from：實際買進日（布局內有商品還沒資料時往後延，lateStart＝true）；proxy＝這次有用到代替品（權重 0 的桶也算，因為表上會顯示）。
 *   bucket.proxy：這一桶有商品在 from 那天還沒上市。bucket.mdd 是這一桶自己買進後的最大跌幅。
 *   proxyLayer：id '2008' 那一列；realLayer：沒有代替品也沒延後的股災中，組合跌最深的一列（同深取較早）；
 *   worst：兩層裡組合跌較深的那一列（第 8 題拿它比）。
 */
export function stressPlan({ data, layout = DEFAULT_LAYOUT, weights }) {
  const L = LAYOUTS[layout];
  if (!L) throw new Error('布局只能選 A、B、C。');
  const w = BUCKET_KEYS.map(k => weights?.[k]);
  if (w.some(x => !Number.isFinite(x) || x < 0) || Math.abs(w.reduce((s, x) => s + x, 0) - 1) > 1e-6) throw new Error('三桶比例要是 0 以上、加起來 100%。');
  if (!data?.crashes || !data?.products) throw new Error('壓力測試資料不對。');
  const codes = [...new Set(BUCKET_KEYS.flatMap(k => L[k].map(([c]) => c)))];

  const crashes = data.crashes.map(c => {
    for (const code of codes) if (!c.series[code]) throw new Error(`${c.id} 缺 ${code} 的資料。`);
    const start = Math.max(...codes.map(code => firstIndex(c.series[code])));
    if (start < 0 || start >= c.daily) throw new Error(`${c.id} 區間內沒有資料。`);
    const dates = c.dates.slice(start), daily = c.daily - start;
    const from = dates[0];
    const norm = code => { const s = c.series[code]; return s.slice(start).map(v => v / s[start]); };
    const isProxy = code => from < data.products[code].realFrom;
    const bucketPath = k => {
      const parts = L[k].map(([code, x]) => ({ x, v: norm(code) }));
      return dates.map((_, i) => parts.reduce((s, p) => s + p.x * p.v[i], 0));
    };
    const paths = Object.fromEntries(BUCKET_KEYS.map(k => [k, bucketPath(k)]));
    const buckets = Object.fromEntries(BUCKET_KEYS.map((k, i) => [k, {
      weight: w[i], codes: L[k].map(([code]) => code),
      mdd: maxDrawdown(paths[k].slice(0, daily)).mdd,
      proxy: L[k].some(([code]) => isProxy(code))
    }]));
    const total = dates.map((_, i) => BUCKET_KEYS.reduce((s, k, j) => s + w[j] * paths[k][i], 0));
    return { id: c.id, label: c.label, from, to: c.to, lateStart: start > 0, proxy: codes.some(isProxy),
      buckets, portfolio: drawdownRecovery(dates, total, daily) };
  });

  const proxyLayer = crashes.find(c => c.id === '2008') ?? null;
  const real = crashes.filter(c => !c.proxy && !c.lateStart);
  const realLayer = real.reduce((a, c) => (!a || c.portfolio.mdd > a.portfolio.mdd + 1e-12 ? c : a), null);
  const worst = [proxyLayer, realLayer].filter(Boolean).reduce((a, c) => (!a || c.portfolio.mdd > a.portfolio.mdd + 1e-12 ? c : a), null);
  return { layout, label: L.label, crashes, proxyLayer, realLayer, worst };
}

/** 第 8 題（loss＝分數 1–5）能接受的跌幅 vs 歷史最深（worst＝正數小數）。 */
export function lossCheck({ loss, worst }) {
  if (!Number.isInteger(loss) || loss < 1 || loss > 5) throw new Error('第 8 題還沒選。');
  if (!Number.isFinite(worst) || worst < 0) throw new Error('跌幅不對。');
  const limit = LOSS_LIMITS[loss - 1];
  return { limit, ok: worst <= limit + 1e-9 };
}
