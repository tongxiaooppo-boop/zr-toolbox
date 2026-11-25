// ㉘ 今年正2 做法回測（v5.12，Opus 寫；使用者 2026-11-25）。純函式：不碰網路，資料由 scripts/backtest-update.mjs 抓好傳進來。
// 介面：
//   STRATEGIES：7 種做法 [{ id, name, group:'zr'|'hold', rule }]（group 決定畫在哪張圖）
//   runBacktest({ days, dividends, start=1e6, fee=0.001425, tax=0.001 })
//     days：[{ date:'YYYY-MM-DD', px:{ '00675L', '0050', '0056', '00981A' } }]（日收盤，日期遞增、四檔都要有）
//     dividends：{ code: { date: 每股現金股利 } }（除息日當天把「持有股數×股利」加進現金，不再投入）
//     → { dates, months:[{ index, date }]（每月最後交易日）, series:[{ id, name, group, rule, values[], final, ret,
//          peak, peakDate, giveback, mdd, mddDate, monthly[], events:[{ date, text }], dividendTotal }] }
//   規則：第一天收盤價投入；股數取整數；買進付手續費、賣出付手續費＋證交稅（ETF 0.1%）；現金不計利息。
//     大仁 50/50：正2 收盤價比基準漲跌 ≥50% 時配回五五，基準改成當天收盤價。
//     每季配回：4、7、10 月的第一個交易日收盤配回目標比例（532：先調 0050 再調正2）。
export const LEVER = '00675L';

export const STRATEGIES = Object.freeze([
  { id: 'allin', name: '正2 全押長抱', group: 'zr', rule: '100% 正2，不動。', target: { [LEVER]: 1 } },
  { id: 'dajen', name: '大仁 50/50 觸發', group: 'zr', rule: '正2、現金各半；正2 價格比基準漲或跌 50% 才配回五五。', target: { [LEVER]: 0.5 } },
  { id: 'q5050', name: '50/50 每季配回', group: 'zr', rule: '正2、現金各半；每季第一個交易日配回五五。', target: { [LEVER]: 0.5 } },
  { id: 'q532', name: '532 股版每季', group: 'zr', rule: '0050 50%、正2 30%、現金 20%；每季第一個交易日配回。', target: { '0050': 0.5, [LEVER]: 0.3 } },
  { id: 'h0050', name: '0050 長抱', group: 'hold', rule: '100% 0050，配息領現金。', target: { '0050': 1 } },
  { id: 'h0056', name: '0056 長抱', group: 'hold', rule: '100% 0056（高股息），配息領現金。', target: { '0056': 1 } },
  { id: 'h00981A', name: '00981A 長抱', group: 'hold', rule: '100% 00981A（主動式），配息領現金。', target: { '00981A': 1 } }
]);

const NAMES = { [LEVER]: '正2', '0050': '0050', '0056': '0056', '00981A': '00981A' };

export function runBacktest({ days, dividends = {}, start = 1e6, fee = 0.001425, tax = 0.001 }) {
  if (!Array.isArray(days) || days.length < 2) throw new Error('至少要有 2 個交易日。');
  for (const d of days) for (const c of Object.keys(NAMES)) {
    if (!(d.px?.[c] > 0)) throw new Error(`${d.date} 缺 ${c} 收盤價。`);
  }
  const dates = days.map(d => d.date);
  const quarterStarts = new Set(['04', '07', '10'].map(m => dates.find(x => x.slice(5, 7) === m)).filter(Boolean));
  const months = [];
  dates.forEach((x, i) => { if (i === dates.length - 1 || dates[i + 1].slice(0, 7) !== x.slice(0, 7)) months.push({ index: i, date: x }); });

  const series = STRATEGIES.map(st => {
    const pos = { cash: start }, events = [];
    let dividendTotal = 0, base = days[0].px[LEVER];
    const value = d => pos.cash + Object.keys(pos).filter(k => k !== 'cash').reduce((s, k) => s + pos[k] * d.px[k], 0);
    const toTarget = (d, code, amount) => {
      const price = d.px[code], now = (pos[code] || 0) * price;
      if (amount < now) {
        const sh = Math.floor((now - amount) / price); if (!sh) return 0;
        pos[code] -= sh; pos.cash += Math.round(sh * price * (1 - fee - tax)); return -sh;
      }
      const sh = Math.floor(Math.min(amount - now, pos.cash) / (price * (1 + fee))); if (!sh) return 0;
      pos[code] = (pos[code] || 0) + sh; pos.cash -= Math.round(sh * price * (1 + fee)); return sh;
    };
    const rebalance = d => {
      const total = value(d);
      return Object.entries(st.target).map(([code, w]) => [code, toTarget(d, code, total * w)]);
    };
    const tradeText = list => list.filter(([, sh]) => sh).map(([c, sh]) => `${NAMES[c]}${sh > 0 ? '買' : '賣'} ${Math.abs(sh).toLocaleString()} 股`).join('、') || '不用調整';
    const values = days.map((d, i) => {
      if (i === 0) rebalance(d);
      else {
        for (const [code, byDate] of Object.entries(dividends)) {
          const per = byDate[d.date];
          if (per && pos[code]) {
            const got = Math.round(pos[code] * per);
            pos.cash += got; dividendTotal += got;
            events.push({ date: d.date, text: `${NAMES[code]} 配息每股 ${per} 元，領 ${got.toLocaleString()} 元` });
          }
        }
        if (st.id === 'dajen') {
          const ch = d.px[LEVER] / base - 1;
          if (Math.abs(ch) >= 0.5) {
            const t = tradeText(rebalance(d));
            events.push({ date: d.date, text: `正2 ${d.px[LEVER]} 元，比基準 ${base} 元${ch > 0 ? '漲' : '跌'} ${(Math.abs(ch) * 100).toFixed(1)}%，觸發配回：${t}；新基準 ${d.px[LEVER]} 元` });
            base = d.px[LEVER];
          }
        }
        if ((st.id === 'q5050' || st.id === 'q532') && quarterStarts.has(d.date)) {
          events.push({ date: d.date, text: `每季配回：${tradeText(rebalance(d))}` });
        }
      }
      return Math.round(value(d));
    });
    let peak = -Infinity, peakIdx = 0, mdd = 0, mddIdx = 0, run = -Infinity;
    values.forEach((v, i) => {
      if (v > peak) { peak = v; peakIdx = i; }
      run = Math.max(run, v);
      if (v / run - 1 < mdd) { mdd = v / run - 1; mddIdx = i; }
    });
    const final = values.at(-1);
    return { id: st.id, name: st.name, group: st.group, rule: st.rule, values, final, ret: final / start - 1,
      peak, peakDate: dates[peakIdx], giveback: final / peak - 1, mdd, mddDate: dates[mddIdx],
      monthly: months.map(m => values[m.index]), events, dividendTotal };
  });
  return { dates, months, series };
}
