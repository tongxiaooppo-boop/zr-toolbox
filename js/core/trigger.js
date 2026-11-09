// 工具②：大仁 50/50 觸發提醒。正二相對「上次配回時的價格（基準價）」漲跌達門檻就配回各半。
export function checkTrigger({ basePrice, nowPrice, threshold = 0.5 }) {
  if (![basePrice, nowPrice].every(v => Number.isFinite(v) && v > 0)) throw new Error('基準價與現價須大於零。');
  if (!(threshold > 0 && threshold < 1)) throw new Error('門檻須介於 0–100%。');
  const change = nowPrice / basePrice - 1;
  const hit = Math.abs(change) >= threshold - 1e-10;
  return { change, hit, direction: hit ? (change > 0 ? 'up' : 'down') : null };
}
/** 以當前市值配回正二、現金各半。leverTrade > 0 表示買進正二。 */
export function split5050({ lever, cash }) {
  if (![lever, cash].every(v => Number.isFinite(v) && v >= 0)) throw new Error('請填入非負的正二市值與現金。');
  const total = lever + cash;
  if (!Number.isFinite(total)) throw new Error('數字太大，請檢查輸入。');
  if (total <= 0) throw new Error('正二市值加現金須大於零。');
  const target = total / 2;
  return { total, target, leverTrade: target - lever, cashAfter: target };
}

/**
 * ② 精靈（v5.6）：正二股數＋現價＋基準價＋策略現金 → 到了沒、要買賣幾股、下一次的觸發價。
 * @param {{shares:number, nowPrice:number, basePrice:number, cash:number, threshold?:number}} p
 *   threshold 預設 0.5（大仁原文）；可改 0.1–0.9
 * @returns {{value, total, change, hit, direction, upPrice, downPrice, target,
 *   tradeShares, tradeAmount, leverAfter, cashAfter, newBase, nextUp, nextDown, suspectSplit}}
 *   tradeShares > 0＝買進。買進無條件捨去（現金一定夠）、賣出四捨五入；未觸發時 0。不算手續費與稅。
 *   newBase：觸發就換成今天的現價，沒觸發維持原基準價；nextUp／nextDown＝用 newBase 算的下一次觸發價。
 *   suspectSplit：現價／基準價 > 5 或 < 0.2（FinMind 未還原價，中間可能有分割），頁面要提醒。
 */
export function trigger5050Plan({ shares, nowPrice, basePrice, cash, threshold = 0.5 }) {
  if (!Number.isInteger(shares) || shares < 0) throw new Error('正二股數要是 0 或正整數。');
  if (!(threshold >= 0.1 && threshold <= 0.9)) throw new Error('觸發門檻要在 10%–90% 之間。');
  if (!(Number.isFinite(cash) && cash >= 0)) throw new Error('策略現金要是 0 或正數。');
  const t = checkTrigger({ basePrice, nowPrice, threshold });
  const value = shares * nowPrice, total = value + cash;
  if (!(total > 0)) throw new Error('正二市值加現金須大於零。');
  const target = total / 2;
  let tradeShares = 0;
  if (t.hit) {
    const raw = (target - value) / nowPrice;
    tradeShares = raw >= 0 ? Math.floor(raw + 1e-9) : -Math.min(shares, Math.round(-raw));
  }
  const tradeAmount = tradeShares * nowPrice;
  const newBase = t.hit ? nowPrice : basePrice;
  return {
    value, total, change: t.change, hit: t.hit, direction: t.direction,
    upPrice: basePrice * (1 + threshold), downPrice: basePrice * (1 - threshold), target,
    tradeShares, tradeAmount, leverAfter: value + tradeAmount, cashAfter: cash - tradeAmount,
    newBase, nextUp: newBase * (1 + threshold), nextDown: newBase * (1 - threshold),
    suspectSplit: nowPrice / basePrice > 5 || nowPrice / basePrice < 0.2
  };
}
