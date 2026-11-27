// ㉖ 三桶壓力測試資料更新（Opus 寫，2026-11-26）。資料有新股災或想更新回本日期時跑：
//   node scripts/stress-update.mjs [結束日 YYYY-MM-DD，預設今天]
// 之後要跑：node scripts/gen-precache.mjs && npm.cmd test，再 commit。
//
// 來源：FinMind（匿名）台股日收盤＋除息＋分割；Yahoo chart 端點還原價（adjclose）；FRED DEXTAUS（每 1 美元換多少台幣）。
// 算法與代替品見 js/core/stress.js 檔頭、docs/decision/決策-2026-11-26-三桶壓力測試.md。
//
// 產出 js/data/stress.js：export const STRESS = {
//   asOf, start, source, leverCost, vtWeight（VT 代替品裡 VTI 的權重，用 VT 上市後 250 個交易日每日報酬最小平方配出來）,
//   products: { code: { name, realFrom（真實資料第一天）, proxy（代替品說明，0050 是 null）, gap（重疊期間「真實－代替」最大跌幅差，小數）, gapCrash } },
//   crashes: [{ id, label, from, to, daily（區間內逐日的筆數）, dates（區間內逐日＋區間後每週最後一個交易日，到所有商品都回到區間內最高為止）,
//               series: { code: 淨值陣列（跟 dates 對齊；第一個有值的＝1；還沒有資料是 null；5 位有效數字） } }]
// }
import fs from 'node:fs';
import { STRESS_CRASHES, LAYOUTS, LEVER_COST, twTotalReturn, alignFfill, dailyMix, leveredProxy, spliceProxy, stressPlan } from '../js/core/stress.js';
import { maxDrawdown } from '../js/core/drawdown.js';

const START = '2007-01-01';
const end = process.argv[2] || new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const TW = ['0050', '0056', '00713', '00719B', '00646', '00631L', '00757'];
const US = ['SPY', 'AGG', 'AOM', 'VT', 'VTI', 'VGTSX', 'QQQ', 'SHY'];
const NAMES = { '0050': '元大台灣50', '00713': '元大台灣高息低波', '00719B': '元大美債1-3', '00646': '元大S&P500', '00631L': '元大台灣50正2', AOM: 'iShares 保守配置（AOM）', VT: 'Vanguard 全世界股票（VT）', '00757': '統一FANG+' };
const PROXY_TEXT = {
  '00713': '0056（元大高股息）含息',
  '00719B': 'SHY（美國 1–3 年公債）還原價×匯率',
  '00646': 'SPY（S&P 500）還原價×匯率',
  '00631L': `0050 含息每日 2 倍，每年扣 ${LEVER_COST * 100}% 費用`,
  AOM: '0.4 SPY＋0.6 AGG 每日再平衡，×匯率',
  VT: 'VTI（美國全市場）＋VGTSX（Vanguard 美國以外全市場基金）每日再平衡，×匯率',
  '00757': 'QQQ（Nasdaq-100）還原價×匯率'
};

const timeout = () => ({ signal: AbortSignal.timeout(60e3) });
async function finmind(ds, id) {
  const url = `https://api.finmindtrade.com/api/v4/data?dataset=${ds}&data_id=${id}&start_date=${START}&end_date=${end}`;
  const j = await (await fetch(url, { signal: AbortSignal.timeout(60e3) })).json();
  if (j.status !== 200) throw new Error(`FinMind ${ds} ${id}：${j.status} ${j.msg}`);
  return j.data;
}
async function yahoo(sym) {
  const p1 = Math.floor(Date.parse(START) / 1e3), p2 = Math.floor(Date.parse(end) / 1e3) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?period1=${p1}&period2=${p2}&interval=1d`;
  const j = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(60e3) })).json();
  const r = j.chart?.result?.[0];
  if (!r?.indicators?.adjclose) throw new Error(`Yahoo ${sym}：${JSON.stringify(j.chart?.error)}`);
  const adj = r.indicators.adjclose[0].adjclose, off = r.meta.gmtoffset;
  const out = {};
  r.timestamp.forEach((t, i) => { if (adj[i] > 0) out[new Date((t + off) * 1e3).toISOString().slice(0, 10)] = adj[i]; });
  return out;
}
async function fred() {
  const text = await (await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=${START}&coed=${end}`, timeout())).text();
  const out = {};
  for (const line of text.trim().split('\n').slice(1)) { const [d, v] = line.split(','); if (Number(v) > 0) out[d] = Number(v); }
  if (Object.keys(out).length < 1000) throw new Error('FRED DEXTAUS 資料太少：' + text.slice(0, 200));
  return out;
}

// ---- 台股：含息淨值 ----
const twRaw = {};
for (const c of TW) {
  const rows = (await finmind('TaiwanStockPrice', c)).filter(d => d.close > 0).map(d => ({ date: d.date, close: d.close }));
  const dates = rows.map(r => r.date);
  const nextTrading = d => { const x = dates.find(t => t >= d); if (!x) throw new Error(`${c} ${d} 之後沒有交易日`); return x; };
  const splits = {}, dividends = {};
  for (const s of await finmind('TaiwanStockSplitPrice', c)) {
    const r = s.before_price / s.after_price, k = r >= 1 ? Math.round(r) : 1 / Math.round(1 / r);
    if (Math.abs(r / k - 1) > 0.02) throw new Error(`${c} ${s.date} 分割倍數不是整數（${s.before_price}→${s.after_price}），要人工處理。`);
    splits[nextTrading(s.date)] = k;
  }
  const div = await finmind('TaiwanStockDividendResult', c);
  if (div.some(d => !/^(除)?息$/.test(d.stock_or_cache_dividend))) throw new Error(`${c} 有除權（配股），要人工處理，先停止。`);
  for (const d of div) { const t = nextTrading(d.date); dividends[t] = (dividends[t] || 0) + d.stock_and_cache_dividend; }
  for (const d of Object.keys(splits)) if (dividends[d]) throw new Error(`${c} ${d} 同一天分割又除息，要人工處理。`);
  const tr = twTotalReturn(rows, { dividends, splits });
  twRaw[c] = Object.fromEntries(tr.dates.map((d, i) => [d, tr.values[i]]));
  console.log(`${c}：${rows.length} 天，首筆 ${dates[0]}，分割 ${JSON.stringify(splits)}，除息 ${Object.keys(dividends).length} 次`);
}
const master = Object.keys(twRaw['0050']).filter(d => d <= end).sort();

// ---- 美股：還原價×匯率 ----
const fx = alignFfill(master, await fred());
const usd = {}, usdRaw = {};
for (const s of US) { usdRaw[s] = await yahoo(s); usd[s] = alignFfill(master, usdRaw[s]); console.log(`${s}：首筆 ${Object.keys(usdRaw[s]).sort()[0]}`); }
const twd = s => usd[s].map((v, i) => (v == null || fx[i] == null ? null : v * fx[i]));
const tw = c => alignFfill(master, twRaw[c]);

// VT 代替品權重：VT 上市後 250 個美股交易日，美元每日報酬最小平方
const vtDates = Object.keys(usdRaw.VT).sort().slice(0, 251);
const ret = (s, i) => usdRaw[s][vtDates[i]] / usdRaw[s][vtDates[i - 1]] - 1;
let vtWeight = 0, best = Infinity;
for (let w = 0.2; w <= 0.8001; w += 0.01) {
  let e = 0;
  for (let i = 1; i < vtDates.length; i++) {
    if ([ 'VTI', 'VGTSX' ].some(s => !usdRaw[s][vtDates[i]] || !usdRaw[s][vtDates[i - 1]])) continue;
    e += (ret('VT', i) - w * ret('VTI', i) - (1 - w) * ret('VGTSX', i)) ** 2;
  }
  if (e < best) { best = e; vtWeight = Math.round(w * 100) / 100; }
}
console.log(`VT 代替品：VTI ${vtWeight}＋VGTSX ${(1 - vtWeight).toFixed(2)}`);

// ---- 真實＋代替品 ----
const real = {
  '0050': tw('0050'), '00713': tw('00713'), '00719B': tw('00719B'), '00646': tw('00646'), '00631L': tw('00631L'), '00757': tw('00757'),
  AOM: twd('AOM'), VT: twd('VT')
};
const proxy = {
  '00713': tw('0056'), '00719B': twd('SHY'), '00646': twd('SPY'), '00631L': leveredProxy(tw('0050')),
  AOM: dailyMix([twd('SPY'), twd('AGG')], [0.4, 0.6]), VT: dailyMix([twd('VTI'), twd('VGTSX')], [vtWeight, 1 - vtWeight]), '00757': twd('QQQ')
};
const CODES = Object.keys(real);
const full = Object.fromEntries(CODES.map(c => [c, proxy[c] ? spliceProxy(real[c], proxy[c]) : real[c]]));
const realFrom = Object.fromEntries(CODES.map(c => [c, master[real[c].findIndex(v => v != null)]]));

// ---- 每次股災 ----
const weekOf = d => Math.floor((Date.parse(d) / 86400e3 + 3) / 7);
const sig = v => (v == null ? null : Number(v.toPrecision(5)));
const crashes = STRESS_CRASHES.map(cr => {
  const idx = master.map((d, i) => (d >= cr.from && d <= cr.to ? i : -1)).filter(i => i >= 0);
  if (!idx.length) throw new Error(`${cr.id} 區間內沒有交易日`);
  const winMax = Object.fromEntries(CODES.map(c => [c, Math.max(...idx.map(i => full[c][i]).filter(v => v != null))]));
  let last = idx.at(-1);
  for (let i = last + 1; i < master.length; i++) {
    if (i < master.length - 1 && weekOf(master[i + 1]) === weekOf(master[i])) continue;
    idx.push(i);
    if (CODES.every(c => full[c][i] >= winMax[c])) break;
  }
  const series = Object.fromEntries(CODES.map(c => {
    const v = idx.map(i => full[c][i]), b = v.find(x => x != null);
    return [c, v.map(x => (x == null ? null : sig(x / b)))];
  }));
  return { id: cr.id, label: cr.label, from: cr.from, to: cr.to, daily: master.filter(d => d >= cr.from && d <= cr.to).length, dates: idx.map(i => master[i]), series };
});

// ---- 代替品誤差：真實資料涵蓋整個區間的股災，真實 vs 代替品的區間最大跌幅差 ----
const products = {};
for (const c of CODES) {
  let gap = null, gapCrash = null;
  if (proxy[c]) for (const cr of STRESS_CRASHES) {
    if (cr.from < realFrom[c]) continue;
    const ii = master.map((d, i) => (d >= cr.from && d <= cr.to ? i : -1)).filter(i => i >= 0);
    const g = Math.abs(maxDrawdown(ii.map(i => real[c][i])).mdd - maxDrawdown(ii.map(i => proxy[c][i])).mdd);
    if (gap == null || g > gap) { gap = Math.round(g * 1000) / 1000; gapCrash = cr.id; }
  }
  products[c] = { name: NAMES[c], realFrom: realFrom[c], proxy: PROXY_TEXT[c] ?? null, gap, gapCrash };
}

const data = { asOf: master.at(-1), start: master[0], leverCost: LEVER_COST, vtWeight,
  source: 'FinMind（台股收盤、除息、分割）、Yahoo Finance 還原價、FRED DEXTAUS 匯率', products, crashes };
fs.writeFileSync(new URL('../js/data/stress.js', import.meta.url),
  `// 自動產生：node scripts/stress-update.mjs（${new Date().toISOString().slice(0, 10)} 執行）。不要手改。格式見 scripts/stress-update.mjs 檔頭。\nexport const STRESS = ${JSON.stringify(data)};\n`);

const pct = x => (x == null ? '  -  ' : (-x * 100).toFixed(1).padStart(6));
console.log(`\n資料到 ${data.asOf}；檔案 ${(fs.statSync(new URL('../js/data/stress.js', import.meta.url)).size / 1024).toFixed(0)} KB`);
for (const c of CODES) console.log(`${c.padEnd(7)} 真實自 ${products[c].realFrom}  代替誤差 ${products[c].gap == null ? '-' : (products[c].gap * 100).toFixed(1) + ' 點（' + products[c].gapCrash + '）'}`);
for (const L of Object.keys(LAYOUTS)) {
  const r = stressPlan({ data, layout: L, weights: { steady: 0.5, growth: 0.3, bold: 0.2 } });
  console.log(`\n布局 ${L}（穩健型 50/30/20）  桶：穩／成／積  組合  回前高（月）`);
  for (const c of r.crashes) console.log(`${c.id.padEnd(8)} ${c.from} ${['steady', 'growth', 'bold'].map(k => pct(c.buckets[k].mdd) + (c.buckets[k].proxy ? '*' : ' ')).join('')}  ${pct(c.portfolio.mdd)}  ${c.portfolio.months ?? '未回'}${c.lateStart ? '  延後起點' : ''}`);
  console.log(`2008 層 ${pct(r.proxyLayer.portfolio.mdd)}；全真實最深 ${r.realLayer.id} ${pct(r.realLayer.portfolio.mdd)}`);
}
