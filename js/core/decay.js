// 工具⑥：正二每日 2 倍的複利偏離（波動耗損）模擬。
/**
 * @param {number[]} indexReturns 每日指數報酬（0.01＝漲 1%）
 * @param {{leverage?:number, dailyCost?:number}} opt dailyCost＝每日費用率，從槓桿報酬扣除
 * 路徑從 1 開始，長度 n+1；槓桿單日報酬 ≤ −100% 時淨值歸零並停在 0。
 */
export function simulateDaily(indexReturns, { leverage = 2, dailyCost = 0 } = {}) {
  if (!Array.isArray(indexReturns) || indexReturns.length === 0 || indexReturns.length > 2520) throw new Error('請提供 1–2520 天的每日報酬。');
  if (indexReturns.some(r => !Number.isFinite(r) || r <= -1 || r > 1)) throw new Error('每日報酬須介於 −100%（不含）到 +100%。');
  if (!(leverage >= 1 && leverage <= 3) || !(dailyCost >= 0 && dailyCost < 0.01)) throw new Error('槓桿須為 1–3 倍，每日費用率須為 0–1%。');
  const indexPath = [1], leveredPath = [1];
  for (const r of indexReturns) {
    indexPath.push(indexPath.at(-1) * (1 + r));
    const prev = leveredPath.at(-1);
    leveredPath.push(prev === 0 ? 0 : Math.max(0, prev * (1 + leverage * r - dailyCost)));
  }
  const indexTotal = indexPath.at(-1) - 1, leveredTotal = leveredPath.at(-1) - 1, naive = leverage * indexTotal;
  return { indexPath, leveredPath, indexTotal, leveredTotal, naive, gap: leveredTotal - naive };
}
/** 'chop'：+size、−size 交替；'trend'：總報酬 size 平均攤成每日複利 */
export function makeScenario(kind, days, size) {
  if (!Number.isInteger(days) || days < 1 || days > 2520) throw new Error('天數須為 1–2520 的整數。');
  if (kind === 'chop') {
    if (!(size > 0 && size < 0.5)) throw new Error('每日震幅須介於 0–50%。');
    return Array.from({ length: days }, (_, i) => (i % 2 ? -size : size));
  }
  if (kind === 'trend') {
    if (!(size > -1) || !Number.isFinite(size)) throw new Error('總報酬須大於 −100%。');
    return Array(days).fill(Math.pow(1 + size, 1 / days) - 1);
  }
  throw new Error('未知的情境。');
}
