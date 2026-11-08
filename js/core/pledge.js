// 工具④：質押維持率壓力測試。公式自 D:\ok\zr-calc\research-model.js 的 stress() 移植，
// 只把 remedy 值改名：'repay'＝拿現金還款、'collateral'＝補擔保品（舊名 'cash'）。兩種算法不同，要分開教。
import { nonnegative } from './validate.js';

/**
 * @param p {shares, pledgePrice, price, collateralQ, debt, newDebt, credit, investRatio, purchasePrice,
 *           rate, days, call, restore, safety, reserve, remedy:'repay'|'collateral', q}
 * @param decline 0.1–0.5
 */
export function pledgeStress(p, decline) {
  nonnegative([p.shares, p.pledgePrice, p.price, p.collateralQ, p.debt, p.newDebt, p.credit, p.rate, p.days, p.call, p.restore, p.safety, p.reserve, p.q, p.investRatio, p.purchasePrice]);
  if (p.shares <= 0 || !Number.isInteger(p.shares) || p.price <= 0 || p.pledgePrice <= 0 || p.purchasePrice <= 0) throw new Error('股數須為正整數，質押、目前與正二成交價格須大於零。');
  if (p.collateralQ <= 0 || p.collateralQ > 1 || p.q <= 0 || p.q > 1 || p.investRatio > 1) throw new Error('認列係數須大於0且不超過100%，投入比例為0–100%。');
  if (p.call < 1 || p.restore < p.call || p.safety < p.call) throw new Error('追繳線須至少100%，回補線及安全線不得低於追繳線。');
  if (!Number.isFinite(decline) || decline < .1 || decline > .5) throw new Error('壓力跌幅須介於10–50%。');
  if (p.days > 36500 || !Number.isInteger(p.days) || p.rate > 1) throw new Error('期間須為0–36500的整數日，年利率須為0–100%。');
  if (!['repay', 'collateral'].includes(p.remedy)) throw new Error('請選擇補救方式。');
  const collateral = p.shares * p.price * p.collateralQ;
  const k = p.rate * p.days / 365;
  const stressedDebt = (p.debt + p.newDebt) * (1 + k);
  const stressedCollateral = collateral * (1 - decline);
  const ratio = stressedDebt > 0 ? stressedCollateral / stressedDebt : Infinity;
  const called = ratio < p.call;
  const target = called ? Math.max(p.safety, p.restore) : p.safety;
  const repay = Math.max(0, stressedDebt - stressedCollateral / target);
  const topup = Math.max(0, target * stressedDebt - stressedCollateral) / p.q;
  const needed = p.remedy === 'collateral' ? topup : repay;
  const safeRaw = stressedCollateral / (p.safety * (1 + k)) - p.debt;
  const investment = p.newDebt * p.investRatio;
  const referencePrice = p.call * stressedDebt / (p.shares * p.collateralQ);
  return {
    collateral, k, stressedDebt, stressedCollateral, ratio, called, target, repay, topup, needed,
    extra: Math.max(0, needed - p.reserve), safeRaw, safeNew: Math.max(0, Math.min(p.credit, safeRaw)),
    overCredit: p.newDebt > p.credit, investment, uninvested: p.newDebt - investment,
    buyShares: Math.floor(investment / p.purchasePrice), referencePrice,
    stressPrice: p.price * (1 - decline), sincePledge: p.price / p.pledgePrice - 1,
    stressSincePledge: p.price * (1 - decline) / p.pledgePrice - 1
  };
}

/** 一次算多個跌幅（預設 10–50%），頁面畫表用 */
export function pledgeTable(p, declines = [.1, .2, .3, .4, .5]) {
  return declines.map(d => ({ decline: d, ...pledgeStress(p, d) }));
}
