// 工具④：質押維持率壓力測試。公式自 D:\ok\zr-calc\research-model.js 的 stress() 移植，
// 只把 remedy 值改名：'repay'＝拿現金還款、'collateral'＝補擔保品（舊名 'cash'）。兩種算法不同，要分開教。
import { nonnegative } from './validate.js';
import { holdingSummary } from './holdings.js';

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
  // nowRatio：不跌、只算到期利息的維持率；callDrop：從目前股價跌多少會低於追繳線（沒借款時為 1）
  const nowRatio = stressedDebt > 0 ? collateral / stressedDebt : Infinity;
  const callDrop = 1 - referencePrice / p.price;
  return {
    collateral, k, nowRatio, callDrop, stressedDebt, stressedCollateral, ratio, called, target, repay, topup, needed,
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

/**
 * ④ 精靈用（v5 新增）：多檔擔保品＋借款 → 壓測表與逐項解說要用的數字。
 * 假設所有擔保品同時跌一樣多（質押 0050 這類大盤 ETF 時接近事實），所以把總市值當成一檔來壓測。
 * @param {{holdings:{code,shares,buyPrice,nowPrice}[], debt:number, rate:number, days:number,
 *          call:number, target:number, collateralQ:number, use:'cash'|'same'|'lever'}} p
 *   rate、call、target、collateralQ 都是小數（3%＝0.03、130%＝1.3）；use＝借來的錢拿去做什麼：
 *   'cash' 留現金、'same' 買同一類大盤 ETF（跟著跌 1 倍）、'lever' 買正二（粗估跟著跌 2 倍）
 * @returns {{summary, rows, collateral, interest, stressedDebt, nowRatio, callDrop,
 *           perStock:{code, nowPrice, callPrice, vsBuy}[], useFactor, useLossAtCall}}
 */
export function pledgePlan(p) {
  const summary = holdingSummary(p.holdings);
  if (!['cash', 'same', 'lever'].includes(p.use)) throw new Error('請選擇借來的錢拿去做什麼。');
  if (!(p.debt > 0)) throw new Error('借款要大於 0；沒有借款就不會被追繳。');
  const v = summary.value;
  const rows = pledgeTable({ shares: 1, pledgePrice: v, price: v, purchasePrice: v, collateralQ: p.collateralQ,
    debt: p.debt, newDebt: 0, credit: 0, investRatio: 0, rate: p.rate, days: p.days, call: p.call,
    restore: p.target, safety: p.target, reserve: 0, remedy: 'repay', q: 1 });
  const r0 = rows[0];
  const perStock = summary.rows.map(r => {
    const callPrice = r.nowPrice * (1 - r0.callDrop);
    return { code: r.code, nowPrice: r.nowPrice, callPrice, vsBuy: callPrice / r.buyPrice - 1 };
  });
  const useFactor = { cash: 0, same: 1, lever: 2 }[p.use];
  return { summary, rows, collateral: r0.collateral, interest: r0.stressedDebt - p.debt, stressedDebt: r0.stressedDebt,
    nowRatio: r0.nowRatio, callDrop: r0.callDrop, perStock, useFactor,
    useLossAtCall: p.debt * Math.min(1, useFactor * Math.max(0, r0.callDrop)) };
}
