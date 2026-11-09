// 股票事件（v5.7，使用者 2026-11-09：「有股票事件要帶入」）：分割、反分割、除權息、減資 → 把舊價格換算成現在的股價基準。
// 純函式，不碰網路；原始資料由 net/price.js 的 fetchEvents 從 FinMind 抓（TaiwanStockSplitPrice／TaiwanStockDividendResult／TaiwanStockCapitalReductionReferencePrice）。
// 換算方式＝還原股價：每個事件的係數＝事件後參考價 ÷ 事件前收盤價；舊價格 × 之後所有事件係數的乘積。

const ok = n => Number.isFinite(n) && n > 0;
const DIV = { 息: '除息', 權: '除權', 權息: '除權息' };

/**
 * @param {{split?:object[], dividend?:object[], reduction?:object[]}} raw FinMind 原始列
 * @returns {{date:string, kind:'split'|'reverse-split'|'dividend'|'reduction', before:number, after:number, factor:number, note:string}[]}
 *   依日期排序；價格不合理的列略過
 */
export function normalizeEvents({ split = [], dividend = [], reduction = [] } = {}) {
  const out = [];
  for (const r of split) {
    if (!ok(r.before_price) || !ok(r.after_price)) continue;
    const isSplit = r.after_price < r.before_price;
    const n = isSplit ? r.before_price / r.after_price : r.after_price / r.before_price;
    out.push({ date: r.date, kind: isSplit ? 'split' : 'reverse-split', before: r.before_price, after: r.after_price, factor: r.after_price / r.before_price,
      note: isSplit ? `分割（約 1 股拆成 ${Math.round(n)} 股）` : `反分割（約 ${Math.round(n)} 股併成 1 股）` });
  }
  for (const r of dividend) {
    if (!ok(r.before_price) || !ok(r.after_price)) continue;
    const label = DIV[r.stock_or_cache_dividend] || '除權息';
    out.push({ date: r.date, kind: 'dividend', before: r.before_price, after: r.after_price, factor: r.after_price / r.before_price,
      note: Number.isFinite(r.stock_and_cache_dividend) ? `${label}（${r.stock_and_cache_dividend} 元）` : label });
  }
  for (const r of reduction) {
    const before = r.ClosingPriceonTheLastTradingDay, after = r.PostReductionReferencePrice;
    if (!ok(before) || !ok(after)) continue;
    out.push({ date: r.date, kind: 'reduction', before, after, factor: after / before,
      note: r.ReasonforCapitalReduction === 'Cash refund' ? '減資（退還現金）' : '減資' });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * 把 baseDate 那天的價格換算成現在的基準。只用 baseDate「之後」的事件（事件日＝除權息／恢復交易日，當天收盤已是事件後價格）。
 * @param {number} basePrice baseDate 的收盤價（未還原）
 * @param {string} baseDate 'YYYY-MM-DD'
 * @param {ReturnType<typeof normalizeEvents>} events
 * @returns {{adjusted:number, factor:number, applied:object[]}}
 */
export function adjustBasePrice(basePrice, baseDate, events = []) {
  if (!ok(basePrice)) throw new Error('基準價要大於 0。');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(baseDate ?? '')) throw new Error('日期格式不對。');
  const applied = events.filter(e => e.date > baseDate);
  const factor = applied.reduce((a, e) => a * e.factor, 1);
  return { adjusted: basePrice * factor, factor, applied };
}
