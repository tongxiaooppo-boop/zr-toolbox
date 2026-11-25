// 工具㉕：正2 回本計算機（Opus 定，外包不得改簽名）。依據 docs/research/R7-正二回本計算機.md。
// 模型：大盤（臺灣50指數）為幾何布朗運動，年化波動 sigma；正2 每日 2 倍，每年內扣 fee。
//   ln(正2 倍數) ＝ 2·ln(大盤倍數) − (sigma² ＋ fee)·年數  →  大盤倍數 ＝ √G · exp((sigma² ＋ fee)·年數 ÷ 2)
// 只是假設下的近似：波動固定、報酬連續；不含期貨轉倉、折溢價、0050 配息與費用、交易成本。
import { recoveryGain } from './drawdown.js';

/** 未來波動三檔（大盤年化波動）。使用者也可自填。 */
export const VOL_PRESETS = Object.freeze([
  { id: 'calm', label: '平靜', sigma: 0.15 },
  { id: 'normal', label: '一般', sigma: 0.22 },
  { id: 'wild', label: '劇烈', sigma: 0.30 }
]);
/** 00631L 每年內扣預設：經理費 1.00%＋保管費 0.04%，取整 1.1%（不含期貨轉倉等成本）。 */
export const DEFAULT_FEE = 0.011;
/** 「再跌一段」情境：大盤再跌 20%。 */
export const SHOCK = 0.2;
/** 機率表看的年數。 */
export const PROB_YEARS = Object.freeze([1, 2, 3, 5, 10]);

/** 標準常態累積分布 Φ(x)（Abramowitz–Stegun 26.2.17，誤差 < 7.5e-8）。 */
export function normCdf(x) {
  if (!Number.isFinite(x)) return x > 0 ? 1 : 0;
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const p = 1 - Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI) * poly;
  return x >= 0 ? p : 1 - p;
}

/**
 * 正2 要漲 zrGain（0.6667＝+66.7%），大盤要漲多少。
 * @returns {number} 大盤要漲的幅度：√(1＋zrGain) · exp((sigma²＋fee)·years ÷ 2) − 1。sigma＝0、fee＝0 為最佳情況（單邊平滑上漲）。
 */
export function indexNeed(zrGain, { sigma = 0, years = 0, fee = 0 } = {}) {
  return Math.sqrt(1 + zrGain) * Math.exp((sigma * sigma + fee) * years / 2) - 1;
}

/**
 * 對數價格為「漂移 drift、波動 vol」的布朗運動，years 年內「曾經」漲到 ln 倍數 target 的機率（首次到達）。
 * P ＝ Φ((−b＋νT)/(s√T)) ＋ exp(2νb/s²)·Φ((−b−νT)/(s√T))。target ≤ 0 → 1；vol＝0 → νT ≥ b 為 1，否則 0。
 */
export function hitProb({ target, drift, vol, years }) {
  if (target <= 0) return 1;
  if (!(years > 0)) return 0;
  if (vol === 0) return drift * years >= target - 1e-12 ? 1 : 0;
  const sT = vol * Math.sqrt(years);
  const p = normCdf((-target + drift * years) / sT) + Math.exp(2 * drift * target / (vol * vol)) * normCdf((-target - drift * years) / sT);
  return Math.min(1, Math.max(0, p));
}

/**
 * ㉕ 精靈：
 * @param {{mode:'price'|'pct', cost?:number, now?:number, loss?:number, shares?:number,
 *   sigma:number, years:number, fee?:number, mu?:number, target?:number}} p
 *   price：cost（買入成本）、now（現價）> 0，且 now < cost；pct：loss 0 < loss < 1（0.4＝虧 40%）。
 *   shares：選填正整數（只用在金額；pct 模式不用）。
 *   sigma：未來大盤年化波動 0–1（0＝最佳情況）；years：想看幾年 0–30；fee：每年內扣 0–10%，預設 DEFAULT_FEE。
 *   mu：選填，大盤年化期望報酬 −50%–50%；有填才算機率。留白傳 undefined 或 NaN。
 *   target：選填，攤平後「正2 只要再漲 target 就回本」，0 < target < zrGain；有填才算攤平。
 * @returns {{
 *   loss, zrGain, recoverPrice, invested, lossAmount,
 *   index: { naive, best, vol, full },
 *   stay: { indexBest, indexFull, shockLoss },
 *   avg: null | { target, addRatio, addPct, addShares, addMoney, newCost, indexBest, indexFull, shockLoss },
 *   swap: { indexNeed, shockLoss },
 *   prob: null | { years, stay, avg, swap }
 * }}
 *   zrGain＝recoveryGain(loss)；recoverPrice＝cost（price 模式，否則 null）。
 *   invested＝shares × cost、lossAmount＝shares × (cost − now)（price 模式且有 shares，否則 null）。
 *   index.naive＝zrGain ÷ 2（簡單 ×2 的直覺）；best＝indexNeed 無波動無費用；vol＝只含波動；full＝含波動與費用。
 *   stay：不動。indexBest／indexFull 同 index.best／index.full。
 *   avg：攤平到 target。addRatio＝要加買的股數 ÷ 原股數＝((1＋zrGain) − (1＋target)) ÷ target；
 *     addPct＝加碼金額 ÷ 原投入＝addRatio × (1 − loss)；addShares＝ceil(addRatio × shares)、addMoney＝addShares × now
 *     （price 模式且有 shares，否則 null）；newCost＝now × (1＋target)（price 模式，否則 null）；
 *     indexBest／indexFull＝indexNeed(target, …)。
 *   swap：賣掉正2 全買 0050。0050 沒有槓桿，要漲 indexNeed＝zrGain 才回到原本成本（不含 0050 費用與配息）。
 *   shockLoss：大盤再跌 SHOCK 時，再虧掉「原投入」的比例（單邊平滑下跌近似，不含波動與費用）：
 *     stay＝(1 − loss) × (1 − (1 − SHOCK)²)；avg＝(1 − loss) × (1 ＋ addRatio) × (1 − (1 − SHOCK)²)；swap＝(1 − loss) × SHOCK。
 *   prob（有 mu 時）：years＝PROB_YEARS；各路線在該年數內「曾回到成本」的機率陣列。
 *     stay：drift＝2mu − 2sigma² − fee、vol＝2sigma、target＝ln(1＋zrGain)；avg：同 drift／vol、target＝ln(1＋target)（沒攤平為 null）；
 *     swap：drift＝mu − sigma²÷2、vol＝sigma、target＝ln(1＋zrGain)。
 */
export function recoverPlan({ mode, cost, now, loss, shares, sigma, years, fee = DEFAULT_FEE, mu, target }) {
  const pos = (v, msg) => { if (!(Number.isFinite(v) && v > 0)) throw new Error(msg); };
  const given = v => v !== undefined && !Number.isNaN(v);
  let L, recoverPrice = null, invested = null, lossAmount = null, hasShares = false;
  if (mode === 'price') {
    pos(cost, '買入成本要大於 0。'); pos(now, '現價要大於 0。');
    if (now >= cost) throw new Error('現價沒有低於成本，已經回本了。');
    L = 1 - now / cost; recoverPrice = cost;
    if (given(shares)) {
      if (!Number.isInteger(shares) || shares <= 0) throw new Error('股數要是正整數（1 張＝1000 股），不確定就留白。');
      hasShares = true; invested = shares * cost; lossAmount = shares * (cost - now);
    }
  } else if (mode === 'pct') {
    if (!(Number.isFinite(loss) && loss > 0 && loss < 1)) throw new Error('虧損要介於 0% 到未滿 100%。');
    L = loss;
  } else throw new Error('請選擇怎麼輸入虧損。');
  if (!(Number.isFinite(sigma) && sigma >= 0 && sigma <= 1)) throw new Error('波動要在 0%–100% 之間。');
  if (!(Number.isFinite(years) && years >= 0 && years <= 30)) throw new Error('年數要在 0–30 年之間。');
  if (!(Number.isFinite(fee) && fee >= 0 && fee < 0.1)) throw new Error('每年內扣費用要在 0–10% 之間。');
  const hasMu = given(mu);
  if (hasMu && !(Number.isFinite(mu) && mu >= -0.5 && mu <= 0.5)) throw new Error('大盤每年報酬要在 −50%–50% 之間，不確定就留白。');

  const zrGain = recoveryGain(L);
  const opt = { sigma, years, fee };
  const index = { naive: zrGain / 2, best: indexNeed(zrGain), vol: indexNeed(zrGain, { sigma, years }), full: indexNeed(zrGain, opt) };
  const zrShock = 1 - (1 - SHOCK) ** 2;
  const stay = { indexBest: index.best, indexFull: index.full, shockLoss: (1 - L) * zrShock };

  let avg = null;
  if (given(target)) {
    if (!(Number.isFinite(target) && target > 0 && target < zrGain)) throw new Error('攤平後要漲的幅度要大於 0，而且比現在要漲的小。');
    const addRatio = (1 + zrGain - (1 + target)) / target;
    const addShares = mode === 'price' && hasShares ? Math.ceil(addRatio * shares - 1e-9) : null;
    avg = {
      target, addRatio, addPct: addRatio * (1 - L), addShares, addMoney: addShares === null ? null : addShares * now,
      newCost: mode === 'price' ? now * (1 + target) : null,
      indexBest: indexNeed(target), indexFull: indexNeed(target, opt), shockLoss: (1 - L) * (1 + addRatio) * zrShock
    };
  }
  const swap = { indexNeed: zrGain, shockLoss: (1 - L) * SHOCK };

  let prob = null;
  if (hasMu) {
    const zrDrift = 2 * mu - 2 * sigma * sigma - fee;
    const run = (tgt, drift, vol) => PROB_YEARS.map(T => hitProb({ target: Math.log(1 + tgt), drift, vol, years: T }));
    prob = {
      years: PROB_YEARS,
      stay: run(zrGain, zrDrift, 2 * sigma),
      avg: avg ? run(avg.target, zrDrift, 2 * sigma) : null,
      swap: run(zrGain, mu - sigma * sigma / 2, sigma)
    };
  }
  return { loss: L, zrGain, recoverPrice, invested, lossAmount, index, stay, avg, swap, prob };
}
