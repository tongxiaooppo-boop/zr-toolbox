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
