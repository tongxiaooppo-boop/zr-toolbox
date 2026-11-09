// 工具⑦ 定期定額與年化報酬（v5，Opus 寫）。純函式。固定報酬的「規劃情境」，不是歷史回測，也不預測未來。
// 規則來源（研究 R2-04 台灣試算工具、R2-14 年化報酬）：
//   月報酬＝(1＋年報酬)^(1/12) − 1（不是年報酬 ÷ 12）
//   期初投入：月底資產＝(上月底資產＋本月投入) × (1＋月報酬)；期末投入：上月底資產 × (1＋月報酬)＋本月投入
//   每年調升：第 N 年每期金額＝第 1 年金額 × (1＋調升比例)^(N−1)，四捨五入到元
//   手續費另外付（不從扣款金額扣），用 ⑨ 的 brokerFee：金額 × 0.1425% × 折扣，元以下捨去，低於低消收低消
//   累積報酬＝期末資產 − 投入本金 − 手續費
//   停扣後再滾（v5.3，todo2 投資累積「停止投入後保守滾存」）：停扣時資產 × (1＋停扣後年報酬)^停扣年數，不再收手續費
//   CAGR＝(期末 ÷ 期初)^(1/年數) − 1，只適用一筆錢從頭放到尾；定期定額每筆錢放的時間不同，用「總本金→期末」硬算會低估
import { brokerFee } from './cost.js';

export const TIMINGS = Object.freeze(['start', 'end']);

export function monthlyRate(annual) { return Math.pow(1 + annual, 1 / 12) - 1; }

/** 單筆年化報酬 */
export function cagr(start, end, years) {
  if (!(start > 0) || !(end >= 0) || !(years > 0)) throw new Error('期初金額、年數要大於 0，期末金額不能是負的。');
  return Math.pow(end / start, 1 / years) - 1;
}

/**
 * @param {{initial?:number, monthly:number, years:number, annualReturn:number, timing?:'start'|'end', stepUp?:number,
 *          discount?:number, minFee?:number, holdYears?:number, holdReturn?:number}} p
 *   holdYears＝停扣後再放幾年（0＝不放，整數 0–60）；holdReturn＝停扣後的年報酬（小數，預設＝annualReturn）
 *   initial＝第 0 個月已經有的市值（不收手續費）；annualReturn、stepUp、discount 都是小數（6%＝0.06、2.8 折＝0.28）
 * @returns {{monthlyRate, months, principal, contributed, fees, finalValue, gain, gainPct, lumpValue, lumpFee, lumpGain,
 *           naiveCagr, heldValue, totalYears, rows:{year, amount, contributed, fees, value}[]}}
 *   principal＝initial＋contributed（contributed＝每月投入合計）；gainPct＝gain ÷ (principal＋fees)
 *   lump*：同樣的總額（principal）第 0 個月一次投入、放滿 years 年；lumpFee＝contributed 一次買進的手續費（initial 不收）
 *   naiveCagr＝(finalValue ÷ principal)^(1/years) − 1（錯誤示範用：看起來比 annualReturn 低）
 *   rows：每年年底一列；amount＝那一年每期金額（只有扣款期，不含停扣後）
 *   heldValue＝finalValue × (1＋holdReturn)^holdYears；totalYears＝years＋holdYears（holdYears＝0 時 heldValue＝finalValue）
 */
export function dcaPlan(p) {
  const { initial = 0, monthly, years, annualReturn, timing = 'start', stepUp = 0, discount = 1, minFee = 1,
    holdYears = 0, holdReturn = annualReturn } = p;
  if (!(initial >= 0)) throw new Error('目前持股市值不能是負的，沒有就填 0。');
  if (!(monthly > 0)) throw new Error('每月投入要大於 0，例：5000。');
  if (!Number.isInteger(years) || years < 1 || years > 60) throw new Error('投資年數填 1–60 的整數。');
  if (!(annualReturn > -1 && annualReturn < 1)) throw new Error('假設年報酬填 −99% 到 99% 之間，例：6。');
  if (!TIMINGS.includes(timing)) throw new Error('請選擇每月扣款時點：月初或月底。');
  if (!(stepUp >= 0 && stepUp <= 1)) throw new Error('每年調升填 0–100%，不調升填 0。');
  if (!Number.isInteger(holdYears) || holdYears < 0 || holdYears > 60) throw new Error('停扣後再放幾年填 0–60 的整數，不放填 0。');
  if (!(holdReturn > -1 && holdReturn < 1)) throw new Error('停扣後年報酬填 −99% 到 99% 之間，例：3。');
  const m = monthlyRate(annualReturn);
  let value = initial, contributed = 0, fees = 0;
  const rows = [];
  for (let y = 1; y <= years; y++) {
    const amount = Math.round(monthly * Math.pow(1 + stepUp, y - 1));
    const fee = brokerFee(amount, { discount, minFee });
    for (let k = 0; k < 12; k++) {
      value = timing === 'start' ? (value + amount) * (1 + m) : value * (1 + m) + amount;
      contributed += amount; fees += fee;
    }
    rows.push({ year: y, amount, contributed, fees, value });
  }
  const principal = initial + contributed;
  const gain = value - principal - fees;
  const lumpValue = principal * Math.pow(1 + annualReturn, years);
  const lumpFee = brokerFee(contributed, { discount, minFee });
  return { monthlyRate: m, months: years * 12, principal, contributed, fees, finalValue: value, gain,
    gainPct: gain / (principal + fees), lumpValue, lumpFee, lumpGain: lumpValue - principal - lumpFee,
    naiveCagr: Math.pow(value / principal, 1 / years) - 1,
    heldValue: value * Math.pow(1 + holdReturn, holdYears), totalYears: years + holdYears, rows };
}
