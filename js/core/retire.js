// 工具⑲ 退休提領（v5，Opus 寫）。純函式。固定報酬的「規劃情境」，不是預測。
// 公式移植自 D:/ok/todo2/cal（PRD-cal-v1.3 第 4.7 節、FinancialFormulas.calculateRetirementWithdrawal，只讀不改）：
//   成長型年金：月報酬 i＝(1＋年報酬)^(1/12) − 1，月通膨 g＝(1＋通膨)^(1/12) − 1，N＝年數 × 12
//   第 k 個月提領＝首月 × (1＋g)^(k−1)（每月跟著通膨調高，實質購買力不變）
//   預留資產折現＝預留 ÷ (1＋i)^N；可提領現值＝資產池 − 預留資產折現
//   年金係數 A（月底領）＝[1 − ((1＋g)/(1＋i))^N] ÷ (i − g)；i＝g 時＝N ÷ (1＋i)
//     （todo2 在 i＝g 時寫成 可提領現值 ÷ N，少除了 (1＋i)，這裡改正）
//   月初領：A × (1＋i)（每筆早一個月領，少滾一個月）
//   首月提領＝可提領現值 ÷ A；末月提領＝首月 × (1＋g)^(N−1)
//   其他每月固定收入（原 todo2「勞保月退金」改名，選填）不跟著通膨調整
//   4% 法則對照：資產池 × 4% ÷ 12

export const TIMINGS = Object.freeze(['start', 'end']);

const mrate = annual => Math.pow(1 + annual, 1 / 12) - 1;

/** 每月提領 1 元（之後每月 × (1＋g)）的現值 */
export function annuityFactor(i, g, n, timing = 'end') {
  const a = Math.abs(i - g) < 1e-12 ? n / (1 + i) : (1 - Math.pow((1 + g) / (1 + i), n)) / (i - g);
  return timing === 'start' ? a * (1 + i) : a;
}

/**
 * @param {{pool:number, years:number, annualReturn:number, inflation?:number, residual?:number, timing?:'start'|'end',
 *          otherIncome?:number, targetSpend?:number}} p
 *   pool＝退休時的資產（元）；annualReturn、inflation 是小數（3.5%＝0.035）；residual＝領完時要留下的錢（元）
 *   otherIncome＝其他每月固定收入（勞保年金、租金……，不隨通膨）；targetSpend＝退休第一年每月想花多少（選填，NaN＝不算）
 * @returns {{monthlyRate, monthlyGrowth, months, pvResidual, available, factor, firstWithdraw, lastWithdraw,
 *           firstTotal, lastTotal, lastOtherReal, totalWithdrawn, withdrawRate, rule4Monthly,
 *           needWithdraw, needPool, gap, endBalance, rows:{year, withdraw, yearTotal, endBalance}[]}}
 *   firstTotal／lastTotal＝首月／末月提領＋otherIncome
 *   lastOtherReal＝otherIncome 在最後一個月、換回第一個月購買力的價值＝otherIncome ÷ (1＋g)^(N−1)
 *   withdrawRate＝首月提領 × 12 ÷ pool（第一年提領率，跟 4% 比）
 *   needWithdraw＝max(0, targetSpend − otherIncome)；needPool＝needWithdraw × factor＋pvResidual；gap＝firstTotal − targetSpend
 *     （targetSpend 沒填時三個都是 NaN）
 *   rows：每年一列；withdraw＝那一年第一個月提領，yearTotal＝那一年 12 個月提領合計，endBalance＝年底剩下的資產
 *   endBalance＝最後剩下的資產（模擬出來，應該等於 residual）
 */
export function retirePlan(p) {
  const { pool, years, annualReturn, inflation = 0, residual = 0, timing = 'end', otherIncome = 0, targetSpend = NaN } = p;
  if (!(pool > 0)) throw new Error('退休時的資產要大於 0，例：10000000。');
  if (!Number.isInteger(years) || years < 1 || years > 60) throw new Error('要領幾年填 1–60 的整數，例：25。');
  if (!(annualReturn > -1 && annualReturn < 1)) throw new Error('退休後年報酬填 −99% 到 99% 之間，例：3.5。');
  if (!(inflation >= 0 && inflation <= 0.2)) throw new Error('通膨率填 0–20，例：2；不考慮通膨填 0。');
  if (!(residual >= 0)) throw new Error('要留下的錢不能是負的，不留填 0。');
  if (!TIMINGS.includes(timing)) throw new Error('請選擇每月什麼時候領：月初或月底。');
  if (!(otherIncome >= 0)) throw new Error('其他每月收入不能是負的，沒有填 0。');
  if (!(Number.isNaN(targetSpend) || targetSpend > 0)) throw new Error('每月想花多少要大於 0；不算就留白。');
  const i = mrate(annualReturn), g = mrate(inflation), n = years * 12;
  const pvResidual = residual / Math.pow(1 + i, n);
  const available = pool - pvResidual;
  if (!(available > 0)) throw new Error('要留下的錢太多：資產照這個報酬滾到最後也不夠留，請降低要留下的錢。');
  const factor = annuityFactor(i, g, n, timing);
  const firstWithdraw = available / factor;
  const lastWithdraw = firstWithdraw * Math.pow(1 + g, n - 1);

  let bal = pool, w = firstWithdraw, total = 0, yearTotal = 0, yearFirst = 0;
  const rows = [];
  for (let k = 1; k <= n; k++) {
    if (k % 12 === 1) { yearFirst = w; yearTotal = 0; }
    bal = timing === 'start' ? (bal - w) * (1 + i) : bal * (1 + i) - w;
    total += w; yearTotal += w;
    if (k % 12 === 0) rows.push({ year: k / 12, withdraw: yearFirst, yearTotal, endBalance: bal });
    w *= 1 + g;
  }
  const hasTarget = !Number.isNaN(targetSpend);
  const needWithdraw = hasTarget ? Math.max(0, targetSpend - otherIncome) : NaN;
  return { monthlyRate: i, monthlyGrowth: g, months: n, pvResidual, available, factor, firstWithdraw, lastWithdraw,
    firstTotal: firstWithdraw + otherIncome, lastTotal: lastWithdraw + otherIncome,
    lastOtherReal: otherIncome / Math.pow(1 + g, n - 1), totalWithdrawn: total,
    withdrawRate: firstWithdraw * 12 / pool, rule4Monthly: pool * 0.04 / 12,
    needWithdraw, needPool: hasTarget ? needWithdraw * factor + pvResidual : NaN,
    gap: hasTarget ? firstWithdraw + otherIncome - targetSpend : NaN, endBalance: bal, rows };
}
