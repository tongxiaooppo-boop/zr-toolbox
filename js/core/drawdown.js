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

const TABLE = Object.freeze([.1, .2, .3, .4, .5, .6, .7, .8]);
/**
 * ⑧ 精靈（v5.9，Opus 定，外包不得改簽名）：四種方式算跌幅 → 回本要漲多少、回本價、虧多少、要幾年。
 * @param {{mode:'holding'|'peak'|'pct'|'series', shares?:number, buyPrice?:number, nowPrice?:number,
 *   peak?:number, now?:number, drop?:number, series?:number[], annual?:number}} p
 *   holding：shares 正整數、buyPrice、nowPrice > 0（跟買入價比）
 *   peak：peak、now > 0（跟最高點比，淨值或價格都可以）
 *   pct：drop 0 ≤ drop < 1
 *   series：至少 2 筆 > 0 的數字（找最大回撤；另算「現在離最高點」curDrop）
 *   annual：之後每年賺多少（0.08＝8%，選填；留白傳 undefined 或 NaN；有填要 > 0）
 * @returns {{ drop, recovery, base, current, up, loss, peakIndex, troughIndex, curDrop, years, table }}
 *   drop＝max(0, 1 − current ÷ base)；recovery＝recoveryGain(drop)；up＝current 高於 base 時的漲幅（否則 0）。
 *   base／current：holding＝買入價／現價；peak＝最高點／現在；series＝最大回撤的前高／谷底；pct＝null／null。
 *   loss：holding＝shares ×（buyPrice − nowPrice），正數＝虧；其他 null。
 *   peakIndex／troughIndex／curDrop：只有 series 有（索引從 0 開始；curDrop＝1 − 最後一筆 ÷ 全部最高），其他 null。
 *   years：annual > 0 且 drop > 0 時 yearsToRecover(drop, annual)，否則 null。
 *   table：跌 10%–80% 各要漲多少 [{drop, gain}]。
 */
export function drawdownPlan({ mode, shares, buyPrice, nowPrice, peak, now, drop, series, annual }) {
  const pos = (v, msg) => { if (!(Number.isFinite(v) && v > 0)) throw new Error(msg); };
  let base = null, current = null, loss = null, peakIndex = null, troughIndex = null, curDrop = null, d;
  if (mode === 'holding') {
    if (!Number.isInteger(shares) || shares <= 0) throw new Error('股數要是正整數（1 張＝1000 股）。');
    pos(buyPrice, '買入價要大於 0。'); pos(nowPrice, '現價要大於 0；抓不到股價就手動填。');
    base = buyPrice; current = nowPrice; loss = shares * (buyPrice - nowPrice);
  } else if (mode === 'peak') {
    pos(peak, '最高點要大於 0。'); pos(now, '現在的數字要大於 0。');
    base = peak; current = now;
  } else if (mode === 'pct') {
    recoveryGain(drop); d = drop;
  } else if (mode === 'series') {
    if (!Array.isArray(series) || series.length < 2) throw new Error('紀錄至少要兩筆。');
    const m = maxDrawdown(series);
    peakIndex = m.peakIndex; troughIndex = m.troughIndex;
    base = series[peakIndex]; current = series[troughIndex];
    curDrop = 1 - series.at(-1) / Math.max(...series);
  } else throw new Error('請選擇怎麼算跌幅。');
  if (d === undefined) d = Math.max(0, 1 - current / base);
  const up = base !== null && current > base ? current / base - 1 : 0;
  const hasAnnual = annual !== undefined && !Number.isNaN(annual);
  if (hasAnnual && !(Number.isFinite(annual) && annual > 0)) throw new Error('每年報酬要大於 0，不確定就留白。');
  return {
    drop: d, recovery: recoveryGain(d), base, current, up, loss, peakIndex, troughIndex, curDrop,
    years: hasAnnual && d > 0 ? yearsToRecover(d, annual) : null,
    table: TABLE.map(x => ({ drop: x, gain: recoveryGain(x) }))
  };
}
