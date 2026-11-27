// ㉚ 正2 上市以來資料更新（Opus 寫，2026-11-26）。每月底跟 ㉘ 一起跑：
//   node scripts/longrun-update.mjs [結束日 YYYY-MM-DD，預設今天]
// 抓 FinMind（匿名）00675L、0050 日收盤、除息、分割 → 兩種算法 → 寫 js/data/longrun.js
//   lump：00675L 上市第一天投入 100 萬，放到現在（每年報酬、年化、每日資產）
//   yearly：每年第一個交易日各投入一筆新的 100 萬，算到該年最後一個交易日（各年獨立，大仁基準每年重設）
// 規則同 ㉘（js/core/backtest.js），另外：0050 長抱配息當天買回 0050（reinvest）；分割依 FinMind 前後價換算整數倍。
// 之後要跑：node scripts/gen-precache.mjs && npm.cmd test，再 commit。
import fs from 'node:fs';
import { runBacktest, LEVER } from '../js/core/backtest.js';

const START = '2016-10-05'; // 00675L 上市日
const CODES = [LEVER, '0050'];
export const LONGRUN_STRATEGIES = ['allin', 'dajen', 'q5050', 'q532', 'h0050'];
const end = process.argv[2] || new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const api = (ds, id) => `https://api.finmindtrade.com/api/v4/data?dataset=${ds}&data_id=${id}&start_date=${START}&end_date=${end}`;

async function get(ds, id) {
  const j = await (await fetch(api(ds, id))).json();
  if (j.status !== 200) throw new Error(`FinMind ${ds} ${id}：${j.status} ${j.msg}`);
  return j.data;
}

const px = {}, dividends = {}, splits = {};
for (const c of CODES) {
  px[c] = Object.fromEntries((await get('TaiwanStockPrice', c)).filter(d => d.close > 0).map(d => [d.date, d.close]));
  const sp = await get('TaiwanStockSplitPrice', c);
  for (const s of sp) {
    const k = Math.round(s.before_price / s.after_price);
    if (Math.abs(s.before_price / s.after_price - k) > 0.02 * k) throw new Error(`${c} ${s.date} 分割倍數不是整數（${s.before_price}→${s.after_price}），要人工處理。`);
    (splits[c] ||= {})[s.date] = k;
  }
  const div = await get('TaiwanStockDividendResult', c);
  if (div.some(d => d.stock_or_cache_dividend !== '息')) throw new Error(`${c} 有除權（配股），要人工處理，先停止。`);
  dividends[c] = Object.fromEntries(div.map(d => [d.date, d.stock_and_cache_dividend]));
}
const dates = Object.keys(px[LEVER]).filter(d => CODES.every(c => px[c][d] > 0)).sort();
// 分割日若剛好沒有共同交易日，移到下一個共同交易日（股數換算要在價格變之前做）
for (const [c, byDate] of Object.entries(splits)) for (const d of Object.keys(byDate)) {
  if (dates.includes(d)) continue;
  const next = dates.find(x => x > d);
  if (!next) throw new Error(`${c} ${d} 分割後沒有交易日`);
  byDate[next] = byDate[d]; delete byDate[d];
}
const days = dates.map(date => ({ date, px: Object.fromEntries(CODES.map(c => [c, px[c][date]])) }));
const opts = { dividends, splits, strategies: LONGRUN_STRATEGIES, reinvest: true };

const L = runBacktest({ days, ...opts });
const lump = {
  dates: L.dates, months: L.months, years: L.years,
  series: L.series.map(s => ({ id: s.id, name: s.name, rule: s.rule, values: s.values, final: s.final, ret: s.ret, cagr: s.cagr,
    peak: s.peak, peakDate: s.peakDate, giveback: s.giveback, mdd: s.mdd, mddDate: s.mddDate, years: s.years,
    dividendTotal: s.dividendTotal, trades: s.orders }))
};
const yearly = [...new Set(dates.map(d => d.slice(0, 4)))].map(y => {
  const slice = days.filter(d => d.date.startsWith(y));
  const r = runBacktest({ days: slice, ...opts });
  return { year: Number(y), from: slice[0].date, to: slice.at(-1).date,
    series: r.series.map(s => ({ id: s.id, final: s.final, ret: s.ret, mdd: s.mdd, peak: s.peak, peakDate: s.peakDate })) };
});

const data = { asOf: dates.at(-1), start: dates[0], tradingDays: dates.length, startMoney: 1e6, splits,
  source: 'FinMind TaiwanStockPrice／TaiwanStockDividendResult／TaiwanStockSplitPrice（日收盤）', lump, yearly };
fs.writeFileSync(new URL('../js/data/longrun.js', import.meta.url),
  `// 自動產生：node scripts/longrun-update.mjs（${new Date().toISOString().slice(0, 10)} 執行）。不要手改。\nexport const LONGRUN = ${JSON.stringify(data)};\n`);
console.log(`上市以來：${data.start} ~ ${data.asOf}，${data.tradingDays} 個交易日；分割 ${JSON.stringify(splits)}`);
for (const s of lump.series) console.log(`${s.name.padEnd(12)} ${s.final.toLocaleString().padStart(12)}  總 ${(s.ret * 100).toFixed(1)}%  年化 ${(s.cagr * 100).toFixed(2)}%  最大回撤 ${(s.mdd * 100).toFixed(1)}%  交易 ${s.trades}`);
console.log('每年初 100 萬（年底報酬%）：');
for (const y of yearly) console.log(y.year, y.series.map(s => `${s.id} ${(s.ret * 100).toFixed(1)}`).join('  '));
