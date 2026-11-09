// 工具⑬：人生槓桿體檢。v5.10，Opus 定，外包不得改簽名。
// 口徑參考 HAMR 人生槓桿（docs/research/來源/R2-08、O-04）：
//   金融淨資產＝現金＋股票 − 拿去投資的借款（房貸／信貸只扣「拿去投資」的那部分；質押、融資全扣）。
//   市場曝險倍數＝Σ 市值×Beta ÷ 金融淨資產；帳面槓桿＝總資產 ÷ 總淨資產；
//   總曝險槓桿＝(房子＋股票曝險) ÷ 總淨資產（房子當 1 倍，是簡化）；生活費倍數＝金融淨資產 ÷ 一年生活費。
// 不採用 HAMR 的「階段曝險建議」（作者方法），只借會計口徑。
import { guessBeta } from './rebalance.js';

const KINDS = Object.freeze({
  mortgage: { label: '房貸', investAll: false },
  credit: { label: '信貸', investAll: false },
  pledge: { label: '股票質押', investAll: true },
  margin: { label: '融資', investAll: true },
  other: { label: '其他借款', investAll: false }
});
export const DEBT_KINDS = Object.freeze(Object.entries(KINDS).map(([value, k]) => ({ value, label: k.label, investAll: k.investAll })));

/**
 * 本息平均攤還每月要繳多少（年利率 rate、剩 years 年、每月繳一次）。
 * rate＝0 → balance ÷ (12×years)；否則 balance×i ÷ (1 − (1+i)^−n)，i＝rate/12、n＝round(12×years)。
 */
export function loanPayment(balance, rate, years) {
  if (!(Number.isFinite(balance) && balance > 0)) throw new Error('借款餘額要大於 0。');
  if (!(Number.isFinite(rate) && rate >= 0 && rate < 0.3)) throw new Error('利率要在 0% 到 30% 之間。');
  if (!(Number.isFinite(years) && years > 0 && years <= 40)) throw new Error('剩幾年要在 0 到 40 年之間。');
  const n = Math.round(12 * years);
  if (n < 1) throw new Error('剩幾年至少要 1 個月。');
  if (rate === 0) return balance / n;
  const i = rate / 12;
  return balance * i / (1 - (1 + i) ** -n);
}

const fin = v => v !== undefined && v !== null && !Number.isNaN(v);

/**
 * ⑬ 精靈：持股＋現金＋房子＋各項借款＋生活費 → 資產負債、三種槓桿、生活費倍數、現金撐幾個月、大盤大跌時。
 * @param {{
 *   holdings:{code:string, shares:number, price:number, beta?:number}[],
 *   cash:number, realEstate?:number, otherAssets?:number,
 *   debts:{kind:'mortgage'|'credit'|'pledge'|'margin'|'other', balance:number,
 *          monthly?:number, rate?:number, years?:number, invest?:number}[],
 *   monthlyExpense:number, monthlyIncome?:number, stressDrop?:number }} p
 *   holdings 可以是空陣列；每列 shares 正整數、price > 0、beta 留白用 guessBeta（L 2／R −1／B 0／其他 1）。代號不能重複。
 *   cash ≥ 0；realEstate、otherAssets 選填（留白＝0）≥ 0。debts 可以是空陣列。
 *   每筆借款：balance > 0；每月繳款三選一（依序判斷）：
 *     monthly 有填（≥ 0）→ 照填的，payBy＝'filled'；
 *     rate 和 years 都有填 → loanPayment(balance, rate, years)，payBy＝'amortized'；
 *     只有 rate → 只繳利息 balance×rate/12，payBy＝'interest'；都沒填 → 錯誤。
 *     invest：這筆借款有多少拿去投資，0 ≤ invest ≤ balance；留白時質押、融資＝balance，其他＝0。
 *   monthlyExpense > 0（每月生活費，不含還款）；monthlyIncome 選填 ≥ 0；stressDrop 選填（預設 0.3），0 < x < 1。
 * @returns {{
 *   holdings:{code, shares, price, beta, value, exposure, valueAfter}[],
 *   debts:{kind, label, balance, monthly, payBy, invest}[],
 *   stockValue, exposure, assets, debt, net, financialAssets, investDebt, financialNet,
 *   marketLeverage, bookLeverage, totalLeverage, debtRatio,
 *   monthlyDebtPay, monthlyOut, monthlyFree, cashMonths, lifeMultiple, withdrawRate, zeroDrop,
 *   stressDrop, stockAfter, exposureAfter, financialNetAfter, marketLeverageAfter }}
 *   stockValue＝Σ 市值；exposure＝Σ 市值×Beta；assets＝現金＋股票＋房子＋其他資產；debt＝Σ 借款餘額；net＝assets − debt。
 *   financialAssets＝現金＋股票；investDebt＝Σ invest；financialNet＝financialAssets − investDebt。
 *   marketLeverage＝exposure ÷ financialNet（financialNet ≤ 0 → null）。
 *   bookLeverage＝assets ÷ net；totalLeverage＝(realEstate＋exposure) ÷ net（net ≤ 0 → 都是 null）。
 *   debtRatio＝debt ÷ assets（assets＝0 → null）。
 *   monthlyDebtPay＝Σ 每月繳款；monthlyOut＝monthlyExpense＋monthlyDebtPay；monthlyFree＝monthlyIncome − monthlyOut（沒填收入 → null）。
 *   cashMonths＝cash ÷ monthlyOut。lifeMultiple＝financialNet ÷ (12×monthlyExpense)；withdrawRate＝1 ÷ lifeMultiple（lifeMultiple ≤ 0 → null）。
 *   zeroDrop＝financialNet ÷ exposure：大盤跌多少金融淨資產會歸零（直線估算，不算正二的每日複利）；
 *     exposure ≤ 0 或 financialNet ≤ 0 → null；> 1 代表大盤跌光也不會歸零（頁面照實寫）。
 *   大跌情境（大盤跌 stressDrop）：每檔 valueAfter＝max(0, 市值×(1 − Beta×stressDrop))；
 *     stockAfter＝Σ valueAfter；exposureAfter＝Σ valueAfter×Beta；financialNetAfter＝cash＋stockAfter − investDebt；
 *     marketLeverageAfter＝exposureAfter ÷ financialNetAfter（≤ 0 → null）。借款餘額不變。
 */
export function lifeLeveragePlan({ holdings, cash, realEstate, otherAssets, debts, monthlyExpense, monthlyIncome, stressDrop }) {
  if (!Array.isArray(holdings)) throw new Error('持股資料有誤。');
  if (!Array.isArray(debts)) throw new Error('借款資料有誤。');
  const seen = new Set();
  const hs = holdings.map(r => {
    const name = r.code || '這一檔';
    if (r.code) { if (seen.has(r.code)) throw new Error(`代號 ${r.code} 重複了，同一檔請合併成一列。`); seen.add(r.code); }
    if (!Number.isInteger(r.shares) || r.shares <= 0) throw new Error(`${name} 的股數要是正整數（1 張＝1000 股）。`);
    if (!(Number.isFinite(r.price) && r.price > 0)) throw new Error(`${name} 的現價要大於 0；抓不到股價就手動填。`);
    const beta = fin(r.beta) ? r.beta : guessBeta(r.code);
    if (!Number.isFinite(beta) || beta < -3 || beta > 3) throw new Error(`${name} 的 Beta 要在 −3 到 3 之間。`);
    const value = r.shares * r.price;
    return { code: r.code, shares: r.shares, price: r.price, beta, value, exposure: value * beta };
  });
  const nonNeg = (v, msg) => { const x = fin(v) ? v : 0; if (!(Number.isFinite(x) && x >= 0)) throw new Error(msg); return x; };
  if (!(Number.isFinite(cash) && cash >= 0)) throw new Error('現金要填 0 或正數。');
  const house = nonNeg(realEstate, '房子市價要填 0 或正數。');
  const other = nonNeg(otherAssets, '其他資產要填 0 或正數。');
  if (!(Number.isFinite(monthlyExpense) && monthlyExpense > 0)) throw new Error('每月生活費要大於 0。');
  if (fin(monthlyIncome) && !(Number.isFinite(monthlyIncome) && monthlyIncome >= 0)) throw new Error('每月收入要填 0 或正數。');
  const drop = fin(stressDrop) ? stressDrop : 0.3;
  if (!(Number.isFinite(drop) && drop > 0 && drop < 1)) throw new Error('大跌情境要在 0% 到 100% 之間（不含）。');

  const ds = debts.map((d, i) => {
    const k = KINDS[d.kind];
    if (!k) throw new Error(`第 ${i + 1} 筆借款的種類有誤。`);
    const name = `第 ${i + 1} 筆借款（${k.label}）`;
    if (!(Number.isFinite(d.balance) && d.balance > 0)) throw new Error(`${name}的餘額要大於 0。`);
    let monthly, payBy;
    if (fin(d.monthly)) {
      if (!(Number.isFinite(d.monthly) && d.monthly >= 0)) throw new Error(`${name}的每月繳款要填 0 或正數。`);
      monthly = d.monthly; payBy = 'filled';
    } else if (fin(d.rate) && fin(d.years)) {
      monthly = loanPayment(d.balance, d.rate, d.years); payBy = 'amortized';
    } else if (fin(d.rate)) {
      if (!(Number.isFinite(d.rate) && d.rate >= 0 && d.rate < 0.3)) throw new Error(`${name}的利率要在 0% 到 30% 之間。`);
      monthly = d.balance * d.rate / 12; payBy = 'interest';
    } else throw new Error(`${name}：請填每月要繳多少，或填利率（和剩幾年）讓工具幫你算。`);
    const invest = fin(d.invest) ? d.invest : (k.investAll ? d.balance : 0);
    if (!(Number.isFinite(invest) && invest >= 0 && invest <= d.balance + 1e-9)) throw new Error(`${name}拿去投資的金額要在 0 到餘額之間。`);
    return { kind: d.kind, label: k.label, balance: d.balance, monthly, payBy, invest };
  });

  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
  const stockValue = sum(hs, r => r.value);
  const exposure = sum(hs, r => r.exposure);
  const assets = cash + stockValue + house + other;
  const debt = sum(ds, d => d.balance);
  const net = assets - debt;
  const financialAssets = cash + stockValue;
  const investDebt = sum(ds, d => d.invest);
  const financialNet = financialAssets - investDebt;
  const monthlyDebtPay = sum(ds, d => d.monthly);
  const monthlyOut = monthlyExpense + monthlyDebtPay;
  const lifeMultiple = financialNet / (12 * monthlyExpense);

  for (const r of hs) r.valueAfter = Math.max(0, r.value * (1 - r.beta * drop));
  const stockAfter = sum(hs, r => r.valueAfter);
  const exposureAfter = sum(hs, r => r.valueAfter * r.beta);
  const financialNetAfter = cash + stockAfter - investDebt;

  return {
    holdings: hs, debts: ds,
    stockValue, exposure, assets, debt, net, financialAssets, investDebt, financialNet,
    marketLeverage: financialNet > 0 ? exposure / financialNet : null,
    bookLeverage: net > 0 ? assets / net : null,
    totalLeverage: net > 0 ? (house + exposure) / net : null,
    debtRatio: assets > 0 ? debt / assets : null,
    monthlyDebtPay, monthlyOut,
    monthlyFree: fin(monthlyIncome) ? monthlyIncome - monthlyOut : null,
    cashMonths: cash / monthlyOut,
    lifeMultiple, withdrawRate: lifeMultiple > 0 ? 1 / lifeMultiple : null,
    zeroDrop: exposure > 0 && financialNet > 0 ? financialNet / exposure : null,
    stressDrop: drop, stockAfter, exposureAfter, financialNetAfter,
    marketLeverageAfter: financialNetAfter > 0 ? exposureAfter / financialNetAfter : null
  };
}
