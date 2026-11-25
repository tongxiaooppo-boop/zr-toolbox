// 工具⑦ 定期定額與年化報酬（v5，Opus 寫；v5.12 加持續投入 accumulatePlan 等，見檔尾）。純函式。固定報酬的「規劃情境」，不是歷史回測，也不預測未來。
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

// ── v5.12 持續投入（Opus 寫，2026-11-25）：⑦ 擴充＝初始資金池＋最多兩段投入＋三情境＋複利科普用數字 ──
// 規則來源：todo2 cal/PRD-cal-v1.3.md 4.6（雙段獨立起訖、初始資金獨立成長池、各段停扣後保守滾存）＋R12 第五節。
//   時間軸＝「從現在起第幾年」（0＝現在），頁面有填現在幾歲就自己加上去顯示年齡；horizon＝算到第幾年（例：退休）。
//   每段：第 start 年開始、第 stop 年停扣（start ≤ 月份 < stop 才扣），投入期用 annualReturn，停扣後到 horizon 用 holdReturn；
//   扣款月的算法、手續費、每年調升（以該段第 1 年為基準）都跟 dcaPlan 一樣；兩段互相獨立，可以重疊。
//   初始資金：initial × (1＋initialReturn)^horizon，不收手續費。
//   實質購買力＝名目 ÷ (1＋inflation)^年。三情境＝所有報酬率（初始、各段投入期、停扣後）一起加 shift。
/**
 * @param {{initial?:number, initialReturn?:number, horizon:number,
 *          stages:{start:number, stop:number, monthly:number, annualReturn:number, holdReturn?:number, stepUp?:number}[],
 *          timing?:'start'|'end', discount?:number, minFee?:number, inflation?:number}} p
 *   initialReturn 預設＝stages[0].annualReturn；holdReturn 預設＝該段 annualReturn；inflation 預設 0；stages 1–2 段
 * @returns {{horizon, initialValue, stageValues:number[], finalValue, principal, contributed, fees, gain, realFinal,
 *           rows:{year, principal, fees, value, real}[]}}
 *   principal＝initial＋contributed；gain＝finalValue − principal − fees；rows：第 1..horizon 年年底，principal 含 initial
 */
export function accumulatePlan(p) {
  const { initial = 0, horizon, stages, timing = 'start', discount = 1, minFee = 1, inflation = 0 } = p;
  if (!Array.isArray(stages) || stages.length < 1 || stages.length > 2) throw new Error('投入要 1 或 2 段。');
  const initialReturn = p.initialReturn ?? stages[0].annualReturn;
  if (!(initial >= 0)) throw new Error('目前持股市值不能是負的，沒有就填 0。');
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 80) throw new Error('要算到第幾年填 1–80 的整數。');
  if (!TIMINGS.includes(timing)) throw new Error('請選擇每月扣款時點：月初或月底。');
  if (!(initialReturn > -1 && initialReturn < 1)) throw new Error('目前持股的假設年報酬填 −99% 到 99% 之間。');
  if (!(inflation >= 0 && inflation < 1)) throw new Error('通膨填 0–99%，不算填 0。');
  stages.forEach((s, i) => {
    const n = `第 ${i + 1} 段`;
    if (!(s.monthly > 0)) throw new Error(`${n}每月投入要大於 0，例：5000。`);
    if (!Number.isInteger(s.start) || !Number.isInteger(s.stop) || s.start < 0 || s.stop <= s.start || s.stop > horizon)
      throw new Error(`${n}開始、停扣要是整數，0 ≤ 開始 < 停扣 ≤ ${horizon}。`);
    for (const r of [s.annualReturn, s.holdReturn ?? s.annualReturn])
      if (!(r > -1 && r < 1)) throw new Error(`${n}假設年報酬填 −99% 到 99% 之間，例：6。`);
    if (!((s.stepUp ?? 0) >= 0 && (s.stepUp ?? 0) <= 1)) throw new Error(`${n}每年調升填 0–100%，不調升填 0。`);
  });
  const st = stages.map(s => ({ ...s, v: 0, m: monthlyRate(s.annualReturn), h: monthlyRate(s.holdReturn ?? s.annualReturn),
    fee: [], amt: [] }));
  let contributed = 0, fees = 0;
  const rows = [];
  for (let y = 0; y < horizon; y++) {
    for (const s of st) {
      if (y >= s.start && y < s.stop) {
        const amount = Math.round(s.monthly * Math.pow(1 + (s.stepUp ?? 0), y - s.start));
        const fee = brokerFee(amount, { discount, minFee });
        for (let k = 0; k < 12; k++) {
          s.v = timing === 'start' ? (s.v + amount) * (1 + s.m) : s.v * (1 + s.m) + amount;
          contributed += amount; fees += fee;
        }
      } else if (y >= s.stop) s.v *= Math.pow(1 + s.h, 12);
    }
    const year = y + 1;
    const value = initial * Math.pow(1 + initialReturn, year) + st.reduce((a, s) => a + s.v, 0);
    rows.push({ year, principal: initial + contributed, fees, value, real: value / Math.pow(1 + inflation, year) });
  }
  const last = rows[rows.length - 1];
  return { horizon, initialValue: initial * Math.pow(1 + initialReturn, horizon), stageValues: st.map(s => s.v),
    finalValue: last.value, principal: last.principal, contributed, fees, gain: last.value - last.principal - fees,
    realFinal: last.real, rows };
}

export const SCENARIOS = Object.freeze([
  { key: 'bear', label: '悲觀', sign: -1 }, { key: 'base', label: '中性', sign: 0 }, { key: 'bull', label: '樂觀', sign: 1 }]);

/** 三情境：所有報酬率一起 −shift／0／＋shift（預設 2 個百分點）。回傳 [{key, label, shift, plan}] */
export function scenarioPlans(p, shift = 0.02) {
  if (!(shift >= 0 && shift <= 0.1)) throw new Error('情境差距填 0–10 個百分點。');
  const ir = p.initialReturn ?? p.stages?.[0]?.annualReturn;
  return SCENARIOS.map(({ key, label, sign }) => {
    const d = sign * shift;
    const plan = accumulatePlan({ ...p, initialReturn: ir + d,
      stages: p.stages.map(s => ({ ...s, annualReturn: s.annualReturn + d, holdReturn: (s.holdReturn ?? s.annualReturn) + d })) });
    return { key, label, shift: d, plan };
  });
}

/** 複利後段加速：每月 monthly、年報酬 r、共 decades×10 年（月初扣、不算手續費），每 10 年「資產增加 − 那 10 年投入」 */
export function growthByDecade(monthly = 5000, annualReturn = 0.06, decades = 3) {
  const r = dcaPlan({ monthly, years: decades * 10, annualReturn });
  const ends = [0, ...Array.from({ length: decades }, (_, i) => r.rows[i * 10 + 9].value)];
  return Array.from({ length: decades }, (_, i) => ({ from: i * 10, to: i * 10 + 10, value: ends[i + 1],
    put: monthly * 120, earned: ends[i + 1] - ends[i] - monthly * 120 }));
}

/** 複利科普用的價格序列（12 個月：先跌到 60、再漲回 100）；頁面與測試共用 */
export const LESSON_PRICES = Object.freeze([100, 90, 80, 70, 60, 60, 70, 80, 90, 100, 100, 100]);

/** 定期定額不用猜高低點：每期用同樣金額買（可買零碎股數，教學簡化、不算手續費） */
export function dcaPricePath(prices, amount) {
  if (!Array.isArray(prices) || prices.length < 2 || !prices.every(x => x > 0)) throw new Error('價格至少 2 期，都要大於 0。');
  if (!(amount > 0)) throw new Error('每期金額要大於 0。');
  const shares = prices.reduce((a, x) => a + amount / x, 0), put = amount * prices.length;
  const value = shares * prices[prices.length - 1];
  return { shares, put, avgCost: put / shares, avgPrice: prices.reduce((a, x) => a + x, 0) / prices.length, value, gain: value - put };
}

/** 停扣／賣在低點的代價：一直扣到最後 vs 第 sellAt 期（0 起算）買完當期就全部賣掉、之後不再扣 */
export function sellAtBottom(prices, amount, sellAt) {
  if (!Number.isInteger(sellAt) || sellAt < 0 || sellAt >= prices.length - 1) throw new Error('賣出期數要在最後一期之前。');
  const keep = dcaPricePath(prices, amount);
  const sh = prices.slice(0, sellAt + 1).reduce((a, x) => a + amount / x, 0), put = amount * (sellAt + 1);
  const got = sh * prices[sellAt];
  return { keep, sold: { put, got, gain: got - put, price: prices[sellAt] } };
}
