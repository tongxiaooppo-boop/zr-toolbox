// ㉘ 回測資料更新（每月底由使用者要求後執行，不自動排程）：
//   node scripts/backtest-update.mjs [結束日 YYYY-MM-DD，預設今天]
// 抓 FinMind（匿名）四檔日收盤、除息、分割 → 有分割就停（要人工處理）→ runBacktest → 寫 js/data/backtest2026.js
// 之後要跑：node scripts/gen-precache.mjs && npm.cmd test，再 commit。
import fs from 'node:fs';
import { runBacktest } from '../js/core/backtest.js';

const START = '2026-01-01';
const CODES = ['00675L', '0050', '0056', '00981A'];
const end = process.argv[2] || new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const api = (ds, id) => `https://api.finmindtrade.com/api/v4/data?dataset=${ds}&data_id=${id}&start_date=${START}&end_date=${end}`;

async function get(ds, id) {
  const r = await fetch(api(ds, id));
  const j = await r.json();
  if (j.status !== 200) throw new Error(`FinMind ${ds} ${id}：${j.status} ${j.msg}`);
  return j.data;
}

const px = {}, dividends = {};
for (const c of CODES) {
  const splits = await get('TaiwanStockSplitPrice', c);
  if (splits.length) throw new Error(`${c} 在 ${splits.map(s => s.date).join('、')} 有分割，回測需要人工處理（換算股數），先停止。`);
  px[c] = Object.fromEntries((await get('TaiwanStockPrice', c)).map(d => [d.date, d.close]));
  const div = await get('TaiwanStockDividendResult', c);
  if (div.some(d => d.stock_or_cache_dividend !== '息')) throw new Error(`${c} 有除權（配股），回測需要人工處理，先停止。`);
  dividends[c] = Object.fromEntries(div.map(d => [d.date, d.stock_and_cache_dividend]));
}
const dates = Object.keys(px[CODES[0]]).filter(d => CODES.every(c => px[c][d] > 0)).sort();
const days = dates.map(date => ({ date, px: Object.fromEntries(CODES.map(c => [c, px[c][date]])) }));
const r = runBacktest({ days, dividends });

const data = {
  asOf: dates.at(-1), start: dates[0], tradingDays: dates.length, startMoney: 1e6,
  source: 'FinMind TaiwanStockPrice／TaiwanStockDividendResult／TaiwanStockSplitPrice（日收盤）',
  prices: Object.fromEntries(CODES.map(c => [c, { first: px[c][dates[0]], last: px[c][dates.at(-1)],
    high: Math.max(...dates.map(d => px[c][d])), highDate: dates.reduce((a, d) => px[c][d] > px[c][a] ? d : a) }])),
  dividends, ...r
};
fs.writeFileSync(new URL('../js/data/backtest2026.js', import.meta.url),
  `// 自動產生：node scripts/backtest-update.mjs（${new Date().toISOString().slice(0, 10)} 執行）。不要手改。\nexport const BACKTEST = ${JSON.stringify(data)};\n`);
console.log(`更新到 ${data.asOf}，${data.tradingDays} 個交易日`);
for (const s of r.series) console.log(`${s.name.padEnd(12)} ${s.final.toLocaleString().padStart(10)}  ${(s.ret * 100).toFixed(1)}%  最高 ${s.peak.toLocaleString()}（${s.peakDate}）  回吐 ${(s.giveback * 100).toFixed(1)}%  股利 ${s.dividendTotal.toLocaleString()}`);
