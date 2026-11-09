// 工具⑰：股利所得稅，合併計稅還是分開計稅。v5.11，Opus 定，外包不得改簽名。
// 制度（所得稅法第 15 條；R2-01 證交所臺灣投資指南 2025 列兩制度）：
//   合併計稅：股利併入綜合所得總額照級距算稅，再減「股利 × 8.5%」可抵減稅額（每戶上限 8 萬元，抵不完可退）。
//   分開計稅：股利不併入，另外按 28% 單一稅率算，和其他所得算出的稅加總。
//   兩種擇一，取對自己有利的。
// 年度參數（Opus 2026-11-09 查證；新聞轉述財政部 2025-11-27 公告，累進差額用級距自行驗算）：
//   114 年度（2026 年 5 月申報）：免稅額 97,000（70 歲以上 145,500）、標準扣除額 131,000／有配偶 262,000、
//     薪資特別扣除額 218,000、基本生活費 213,000、級距 59／133／266／498 萬。
//   115 年度（2027 年 5 月申報）：免稅額 101,000（151,500）、標準扣除額 136,000／272,000、薪資特別扣除額 227,000、
//     級距 61／138／277／519 萬。基本生活費 115 年度尚未公告（通常 11 月下旬），暫用 114 年度 213,000，provisional 標 true。
// 算法：
//   免稅額＝(人數 − 70 歲以上人數) × 一般 ＋ 70 歲以上人數 × 70 歲以上
//   一般扣除額＝有填列舉且 > 標準 → 列舉；否則標準（有配偶用雙倍那一個）
//   薪資特別扣除額＝每位有薪資的人 min(薪資, 上限) 加總
//   基本生活費差額＝max(0, 基本生活費 × 人數 − (免稅額 ＋ 一般扣除額 ＋ 其他特別扣除額))（薪資特別扣除額不比較）
//   所得淨額＝max(0, 所得總額 − 免稅額 − 一般扣除額 − 薪資特別扣除額 − 其他特別扣除額 − 基本生活費差額)
//   應納稅額＝所得淨額 × 稅率 − 累進差額
// 簡化（頁面要註明）：只算居住者的一個申報戶；不算基本所得額（最低稅負）、二代健保、扣繳稅款與退稅時程；
//   ETF 配息只有「股利所得」部分適用（利息、收益平準金等不是），以基金公司寄的所得明細為準。

export const DIVIDEND_CREDIT_RATE = 0.085;
export const DIVIDEND_CREDIT_CAP = 80000;
export const SEPARATE_RATE = 0.28;
const RATES = [0.05, 0.12, 0.2, 0.3, 0.4];

export const TAX_YEARS = Object.freeze({
  114: Object.freeze({ year: 114, fileIn: 2026, exemption: 97000, exemptionElderly: 145500, standard: 131000, standardMarried: 262000, salaryCap: 218000, basicLiving: 213000, provisional: false, brackets: Object.freeze([590000, 1330000, 2660000, 4980000]) }),
  115: Object.freeze({ year: 115, fileIn: 2027, exemption: 101000, exemptionElderly: 151500, standard: 136000, standardMarried: 272000, salaryCap: 227000, basicLiving: 213000, provisional: true, brackets: Object.freeze([610000, 1380000, 2770000, 5190000]) })
});
export const DEFAULT_TAX_YEAR = 115;

function paramsOf(year) {
  const p = TAX_YEARS[year];
  if (!p) throw new Error(`沒有 ${year} 年度的稅率資料。`);
  return p;
}

/**
 * 累進稅率表一格一格算。
 * @param {number} net 所得淨額（≥ 0）
 * @param {number} year 114｜115
 * @returns {{tax:number, rate:number, diff:number}} rate＝適用的最高稅率（小數）、diff＝累進差額
 */
export function progressiveTax(net, year = DEFAULT_TAX_YEAR) {
  const { brackets } = paramsOf(year);
  if (!(Number.isFinite(net) && net >= 0)) throw new Error('所得淨額要是 0 以上的數字。');
  let i = 0; while (i < brackets.length && net > brackets[i]) i++;
  let diff = 0; for (let k = 1; k <= i; k++) diff += brackets[k - 1] * (RATES[k] - RATES[k - 1]);
  return { tax: net * RATES[i] - diff, rate: RATES[i], diff };
}

const nn = (x, msg) => { const v = x === undefined || x === null || Number.isNaN(x) ? 0 : x; if (!(Number.isFinite(v) && v >= 0)) throw new Error(msg); return v; };

/**
 * ⑰ 精靈：同一個申報戶，合併計稅和分開計稅各要繳多少。
 * @param {{year?:number, married?:boolean, people:number, elderly?:number, salaries?:number[],
 *          otherIncome?:number, dividends:number, itemized?:number, otherSpecial?:number}} p
 *   year：114｜115（預設 DEFAULT_TAX_YEAR）
 *   married：有沒有配偶一起申報（標準扣除額用雙倍）；people：申報戶總人數（本人＋配偶＋受扶養，整數 ≥ 1；有配偶要 ≥ 2）
 *   elderly：其中 70 歲以上幾人（選填，0 ≤ x ≤ people）
 *   salaries：每位有薪資的人一年的薪資收入（選填，最多 people 個，每個 ≥ 0）
 *   otherIncome：其他所得合計（利息、租金…，選填，≥ 0）；dividends：一年的股利所得（≥ 0）
 *   itemized：列舉扣除額合計（選填；比標準大才用）；otherSpecial：薪資以外的特別扣除額合計（選填：身障、教育學費、幼兒、長照、房租…）
 *   選填留白可傳 undefined／null／NaN，當 0。
 * @returns {{year, params, provisional, exemption, deduction, deductionKind:'standard'|'itemized', salarySpecial, otherSpecial,
 *   basicLiving, basicLivingDiff,
 *   combined:{income, net, rate, diff, taxBefore, credit, creditCapped:boolean, payable},
 *   separate:{income, net, rate, diff, taxBefore, dividendTax, payable},
 *   best:'combined'|'separate'|'same', saving}}
 *   payable 可以是負的（合併計稅時抵減稅額大於稅額＝可退稅）。saving＝兩者差額的絕對值。
 */
export function dividendTaxPlan({ year = DEFAULT_TAX_YEAR, married = false, people, elderly, salaries = [], otherIncome, dividends, itemized, otherSpecial }) {
  const P = paramsOf(year);
  if (!(Number.isInteger(people) && people >= 1 && people <= 20)) throw new Error('申報戶人數要是 1 到 20 的整數。');
  if (married && people < 2) throw new Error('有配偶一起申報，人數至少 2 人。');
  const old = nn(elderly, '70 歲以上人數不能是負的。');
  if (!Number.isInteger(old) || old > people) throw new Error('70 歲以上人數要是整數，而且不能比總人數多。');
  const sal = (salaries || []).map(x => (x === undefined || x === null || Number.isNaN(x) ? 0 : x));
  if (sal.length > people) throw new Error('有薪資的人數不能比申報戶人數多。');
  if (sal.some(x => !(Number.isFinite(x) && x >= 0))) throw new Error('薪資不能是負的。');
  const other = nn(otherIncome, '其他所得不能是負的。');
  if (!(Number.isFinite(dividends) && dividends >= 0)) throw new Error('請填一年的股利所得（0 以上）。');
  const item = nn(itemized, '列舉扣除額不能是負的。');
  const special = nn(otherSpecial, '其他特別扣除額不能是負的。');

  const exemption = (people - old) * P.exemption + old * P.exemptionElderly;
  const standard = married ? P.standardMarried : P.standard;
  const deductionKind = item > standard ? 'itemized' : 'standard';
  const deduction = Math.max(item, standard);
  const salarySpecial = sal.reduce((s, x) => s + Math.min(x, P.salaryCap), 0);
  const basicLiving = P.basicLiving * people;
  const basicLivingDiff = Math.max(0, basicLiving - (exemption + deduction + special));
  const minus = exemption + deduction + salarySpecial + special + basicLivingDiff;
  const salaryTotal = sal.reduce((s, x) => s + x, 0);

  const calc = income => { const net = Math.max(0, income - minus); return { income, net, ...progressiveTax(net, year) }; };
  const c = calc(salaryTotal + other + dividends);
  const rawCredit = dividends * DIVIDEND_CREDIT_RATE;
  const credit = Math.min(rawCredit, DIVIDEND_CREDIT_CAP);
  const combined = { income: c.income, net: c.net, rate: c.rate, diff: c.diff, taxBefore: c.tax, credit, creditCapped: rawCredit > DIVIDEND_CREDIT_CAP, payable: c.tax - credit };
  const s = calc(salaryTotal + other);
  const dividendTax = dividends * SEPARATE_RATE;
  const separate = { income: s.income, net: s.net, rate: s.rate, diff: s.diff, taxBefore: s.tax, dividendTax, payable: s.tax + dividendTax };

  const d = combined.payable - separate.payable;
  const best = Math.abs(d) < 0.5 ? 'same' : d < 0 ? 'combined' : 'separate';
  return {
    year, params: P, provisional: P.provisional, exemption, deduction, deductionKind, salarySpecial, otherSpecial: special,
    basicLiving, basicLivingDiff, combined, separate, best, saving: Math.abs(d)
  };
}
