// 工具⑧：最大回撤與回本所需漲幅。
/** 跌了 d（0.5＝跌 50%）要漲多少才回本：1/(1-d) − 1 */
export function recoveryGain(drawdown) {
  if (!Number.isFinite(drawdown) || drawdown < 0 || drawdown >= 1) throw new Error('跌幅須介於 0% 到未滿 100%。');
  return 1 / (1 - drawdown) - 1;
}
/** 一串淨值（或價格）中，從前高到後低的最大跌幅。沒有下跌時 mdd＝0、兩個索引都是 0。 */
export function maxDrawdown(values) {
  if (!Array.isArray(values) || values.length === 0 || values.some(v => !Number.isFinite(v) || v <= 0)) throw new Error('請提供至少一個大於零的數值。');
  let peak = 0, best = { mdd: 0, peakIndex: 0, troughIndex: 0 };
  values.forEach((v, i) => {
    if (v > values[peak]) peak = i;
    const dd = 1 - v / values[peak];
    if (dd > best.mdd + 1e-12) best = { mdd: dd, peakIndex: peak, troughIndex: i };
  });
  return best;
}
/** 以固定年化報酬 r 回本需幾年：ln(1/(1-d)) / ln(1+r) */
export function yearsToRecover(drawdown, annualReturn) {
  recoveryGain(drawdown);
  if (!(annualReturn > 0) || !Number.isFinite(annualReturn)) throw new Error('年化報酬須大於零。');
  return -Math.log1p(-drawdown) / Math.log1p(annualReturn);
}
