// 工具⑤ 融資融券與整戶維持率（v5，Opus 寫）。純函式。
// 規則來源（研究 R2-06 RSI20 融資融券試算、R2-01 證交所投資指南）：
//   融資維持率＝融資股票市值 ÷ 融資金額；融券維持率＝(融券賣出價款＋保證金) ÷ 融券股票市值
//   整戶維持率＝(Σ融資股票市值＋Σ(融券賣出價款＋保證金)) ÷ (Σ融資金額＋Σ融券股票市值)，不能把各檔百分比平均
//   融資金額＝買進價金 × 融資成數（上市櫃最高 6 成，個股可能調降 5、4 成）；融券保證金＝賣出價款 × 保證金成數（最低 9 成）
//   低於追繳線（常見 130%）收到追繳，要補回補回目標（常見 166%）：
//     補現金（增提擔保）＝目標 × 分母 − 分子；償還融資＝分母 − 分子 ÷ 目標（只能還融資那一塊，超過就還不夠）
//   融資利息＝融資金額 × 年利率 × 天數 ÷ 365（不算進維持率，賣出時結算）
// 簡化（頁面要寫出來）：不算券商把融資金額、保證金取整數；融券價款不扣手續費、證交稅、借券費；不算除權息前的假除權息。
import { CODE_RE, holdingSummary } from './holdings.js';

export const LOAN_RATIOS = Object.freeze([0.6, 0.5, 0.4]);
export const MOVES = Object.freeze([-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3]);

/**
 * 融券那一邊的加總（買入價欄位 buyPrice 在融券代表「融券賣出價」）。
 * @param {{code, shares, buyPrice, nowPrice}[]} list 至少一檔
 * @returns {{rows:{code, shares, sellPrice, nowPrice, proceeds, value, gain}[], proceeds, value, gain}}
 *   proceeds＝賣出價款（賣出價 × 股數）；value＝現在要買回來的錢（現價 × 股數）；gain＝proceeds − value（股價漲就虧）
 */
export function shortSummary(list) {
  if (!Array.isArray(list) || !list.length) throw new Error('請至少填一檔融券的股票。');
  const rows = list.map((x, i) => {
    const n = `融券第 ${i + 1} 檔`;
    if (!CODE_RE.test(x.code ?? '')) throw new Error(`${n}的股票代號格式不對，例：2330。`);
    if (!Number.isInteger(x.shares) || x.shares <= 0) throw new Error(`${n}的股數要是正整數（1 張＝1000 股）。`);
    if (!(x.buyPrice > 0) || !Number.isFinite(x.buyPrice)) throw new Error(`${n}的融券賣出價要大於 0。`);
    if (!(x.nowPrice > 0) || !Number.isFinite(x.nowPrice)) throw new Error(`${n}的現價要大於 0；抓不到股價就手動填。`);
    const proceeds = x.shares * x.buyPrice, value = x.shares * x.nowPrice;
    return { code: x.code, shares: x.shares, sellPrice: x.buyPrice, nowPrice: x.nowPrice, proceeds, value, gain: proceeds - value };
  });
  const proceeds = rows.reduce((a, r) => a + r.proceeds, 0), value = rows.reduce((a, r) => a + r.value, 0);
  return { rows, proceeds, value, gain: proceeds - value };
}

/**
 * @param {{longs?:{code,shares,buyPrice,nowPrice}[], shorts?:{code,shares,buyPrice,nowPrice}[],
 *          loanRatio?:number, loan?:number, depositRate?:number, deposit?:number,
 *          call?:number, target?:number, rate?:number, days?:number, moves?:number[]}} p
 *   longs＝融資買進的股票；shorts＝融券賣出的股票（buyPrice＝融券賣出價）。兩邊至少一邊有股票，沒有的給 [] 或不給。
 *   loanRatio 融資成數（0.6）；loan 融資金額合計（看對帳單，給了就不用成數算；NaN／undefined＝自動算）
 *   depositRate 保證金成數（0.9）；deposit 保證金合計（同上）
 *   call、target、rate 都是小數（130%＝1.3、166%＝1.66、6.5%＝0.065）；days 整數
 * @returns {{long:object|null, short:object|null, loan, ownCash, leverage, deposit,
 *           collateral, debt, ratio, called, belowTarget, longDrop, shortRise, topup, repay, repayEnough,
 *           interest, perStock:{code, side:'long'|'short', nowPrice, callPrice, vsEntry}[], rows:{move, ratio, called}[]}}
 *   long＝holdingSummary(longs)（沒有融資為 null）；short＝shortSummary(shorts)（沒有融券為 null）
 *   ownCash＝融資自備款（成本 − 融資金額）；leverage＝成本 ÷ 自備款（沒有融資為 null）
 *   collateral＝分子（融資市值＋融券價款＋保證金）；debt＝分母（融資金額＋融券市值）；ratio＝collateral ÷ debt
 *   called＝ratio < call；belowTarget＝ratio < target
 *   longDrop＝融券不動、所有融資股票一起跌多少（從現價算）會碰到追繳線；負數＝已經低於；沒有融資為 null
 *   shortRise＝融資不動、所有融券股票一起漲多少會碰到追繳線；負數＝已經低於；沒有融券為 null
 *   topup＝補現金到 target 要多少（≥0）；repay＝只靠償還融資回到 target 要還多少（≥0，沒有融資為 0）
 *   repayEnough＝有融資，且還款不超過融資金額（超過代表光還融資補不回去）
 *   interest＝loan × rate × days ÷ 365
 *   perStock：融資用 longDrop、融券用 shortRise 算的追繳參考價；vsEntry＝追繳參考價 ÷ 買進（或融券賣出）價 − 1
 *   rows：所有股票（融資、融券）一起漲跌 move 時的整戶維持率
 */
export function marginPlan(p) {
  const { longs = [], shorts = [], loanRatio = 0.6, depositRate = 0.9, call = 1.3, target = 1.66, rate = 0, days = 0, moves = MOVES } = p;
  if (!longs.length && !shorts.length) throw new Error('融資或融券至少要填一檔。');
  if (!(call >= 1)) throw new Error('追繳線要至少 100%，常見 130。');
  if (!(target >= call)) throw new Error('補回目標不能低於追繳線，常見 166。');
  if (!(rate >= 0 && rate <= 1)) throw new Error('融資年利率填 0–100，例：6.5。');
  if (!(Number.isInteger(days) && days >= 0 && days <= 36500)) throw new Error('持有天數填 0 以上的整數，例：30。');
  const long = longs.length ? holdingSummary(longs) : null;
  const short = shorts.length ? shortSummary(shorts) : null;
  let loan = 0, ownCash = null, leverage = null, deposit = 0;
  if (long) {
    if (Number.isFinite(p.loan)) {
      if (!(p.loan > 0 && p.loan < long.cost)) throw new Error('融資金額要大於 0、小於買進成本。');
      loan = p.loan;
    } else {
      if (!(loanRatio > 0 && loanRatio < 1)) throw new Error('融資成數要介於 0 和 10 成之間，常見 6 成。');
      loan = long.cost * loanRatio;
    }
    ownCash = long.cost - loan; leverage = long.cost / ownCash;
  }
  if (short) {
    if (Number.isFinite(p.deposit)) {
      if (!(p.deposit > 0)) throw new Error('保證金要大於 0。');
      deposit = p.deposit;
    } else {
      if (!(depositRate > 0 && depositRate <= 2)) throw new Error('保證金成數填 1–20 成，常見 9 成。');
      deposit = short.proceeds * depositRate;
    }
  }
  const A = long ? long.value : 0, L = loan;
  const S = short ? short.proceeds + deposit : 0, B = short ? short.value : 0;
  const collateral = A + S, debt = L + B, ratio = collateral / debt;
  const longDrop = long ? 1 - (call * debt - S) / A : null;
  const shortRise = short ? ((collateral / call) - L) / B - 1 : null;
  const repayRaw = debt - collateral / target;
  const perStock = [
    ...(long ? long.rows.map(r => { const callPrice = r.nowPrice * (1 - longDrop); return { code: r.code, side: 'long', nowPrice: r.nowPrice, callPrice, vsEntry: callPrice / r.buyPrice - 1 }; }) : []),
    ...(short ? short.rows.map(r => { const callPrice = r.nowPrice * (1 + shortRise); return { code: r.code, side: 'short', nowPrice: r.nowPrice, callPrice, vsEntry: callPrice / r.sellPrice - 1 }; }) : [])];
  const rows = moves.map(m => { const q = (A * (1 + m) + S) / (L + B * (1 + m)); return { move: m, ratio: q, called: q < call }; });
  return { long, short, loan, ownCash, leverage, deposit, collateral, debt, ratio, called: ratio < call, belowTarget: ratio < target,
    longDrop, shortRise, topup: Math.max(0, target * debt - collateral), repay: L > 0 ? Math.max(0, repayRaw) : 0,
    repayEnough: L > 0 && repayRaw <= L, interest: L * rate * days / 365, perStock, rows };
}
