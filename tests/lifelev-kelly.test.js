// ⑬ ⑭ 精靈（v5.10）。預期值由 Opus 手算／另法驗算（房貸月付用逐月攤還餘額歸零驗、凱利用格點搜尋最大值驗），外包不得改。
import test from 'node:test';
import assert from 'node:assert/strict';
import { lifeLeveragePlan, loanPayment } from '../js/core/lifelev.js';
import { kellyPlan, leveredGrowth } from '../js/core/kelly.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);

const EX13 = {
  holdings: [{ code: '0050', shares: 10000, price: 195.5 }, { code: '00631L', shares: 20000, price: 26.3 }],
  cash: 500000, realEstate: 12000000,
  debts: [
    { kind: 'mortgage', balance: 8000000, rate: 0.022, years: 25 },
    { kind: 'credit', balance: 1000000, monthly: 18000, invest: 1000000 }
  ],
  monthlyExpense: 40000, monthlyIncome: 100000
};

test('loanPayment: 800 萬、2.2%、25 年 → 34,692.69；逐月攤還 300 期餘額歸零；0% 直接平均', () => {
  const p = loanPayment(8000000, 0.022, 25);
  close(p, 34692.68804875, 1e-6);
  let b = 8000000; for (let k = 0; k < 300; k++) b = b * (1 + 0.022 / 12) - p;
  close(b, 0, 1e-4);
  close(loanPayment(1200000, 0, 10), 10000);
  assert.throws(() => loanPayment(0, 0.02, 10), /餘額/);
  assert.throws(() => loanPayment(100, 0.02, 50), /剩幾年/);
});

test('lifelev ⑬ page example: 0050＋00631L、房子 1,200 萬、房貸 800 萬、信貸 100 萬全拿去投資', () => {
  const r = lifeLeveragePlan(EX13);
  assert.equal(r.stockValue, 2481000); assert.equal(r.exposure, 3007000);
  assert.equal(r.assets, 14981000); assert.equal(r.debt, 9000000); assert.equal(r.net, 5981000);
  assert.equal(r.financialAssets, 2981000); assert.equal(r.investDebt, 1000000); assert.equal(r.financialNet, 1981000);
  close(r.marketLeverage, 3007000 / 1981000); assert.equal(r.marketLeverage.toFixed(2), '1.52');
  close(r.bookLeverage, 14981000 / 5981000); assert.equal(r.bookLeverage.toFixed(2), '2.50');
  close(r.totalLeverage, 15007000 / 5981000); assert.equal(r.totalLeverage.toFixed(2), '2.51');
  close(r.debtRatio, 9000000 / 14981000);
  assert.equal(r.debts[0].payBy, 'amortized'); close(r.debts[0].monthly, 34692.68804875, 1e-6); assert.equal(r.debts[0].invest, 0);
  assert.equal(r.debts[1].payBy, 'filled'); assert.equal(r.debts[1].label, '信貸');
  close(r.monthlyDebtPay, 52692.68804875, 1e-6); close(r.monthlyOut, 92692.68804875, 1e-6); close(r.monthlyFree, 7307.31195125, 1e-6);
  close(r.cashMonths, 500000 / 92692.68804875); assert.equal(r.cashMonths.toFixed(1), '5.4');
  close(r.lifeMultiple, 1981000 / 480000); assert.equal(r.lifeMultiple.toFixed(1), '4.1'); close(r.withdrawRate, 480000 / 1981000);
  close(r.zeroDrop, 1981000 / 3007000); assert.equal((r.zeroDrop * 100).toFixed(1), '65.9');
  // 大盤跌 30%：0050 1,955,000→1,368,500；00631L 526,000×(1−0.6)＝210,400
  close(r.stressDrop, 0.3); close(r.stockAfter, 1578900, 1e-6); close(r.exposureAfter, 1789300, 1e-6);
  close(r.financialNetAfter, 1078900, 1e-6); close(r.marketLeverageAfter, 1789300 / 1078900); assert.equal(r.marketLeverageAfter.toFixed(2), '1.66');
});

test('lifelev ⑬: 質押／融資 invest 預設全額、只填利率＝只繳利息、Beta 自填與猜測、沒填收入', () => {
  const r = lifeLeveragePlan({
    holdings: [{ code: '00679B', shares: 1000, price: 30 }, { code: 'X', shares: 100, price: 100, beta: 1.5 }],
    cash: 0, debts: [{ kind: 'pledge', balance: 120000, rate: 0.03 }, { kind: 'margin', balance: 6000, monthly: 0 }],
    monthlyExpense: 30000, stressDrop: 0.5
  });
  assert.equal(r.holdings[0].beta, 0); assert.equal(r.holdings[1].beta, 1.5);
  assert.equal(r.exposure, 15000); assert.equal(r.investDebt, 126000);
  assert.equal(r.debts[0].payBy, 'interest'); close(r.debts[0].monthly, 300);
  assert.equal(r.financialNet, 40000 - 126000); assert.equal(r.marketLeverage, null); assert.equal(r.zeroDrop, null);
  assert.equal(r.withdrawRate, null); assert.equal(r.monthlyFree, null);
  assert.equal(r.net, 40000 - 126000); assert.equal(r.bookLeverage, null);
  close(r.stockAfter, 30000 + 2500); // X：10,000×(1−1.5×0.5)
});

test('lifelev ⑬: 沒有持股、沒有借款也能算；錯誤訊息', () => {
  const r = lifeLeveragePlan({ holdings: [], cash: 600000, debts: [], monthlyExpense: 50000 });
  assert.equal(r.exposure, 0); assert.equal(r.marketLeverage, 0); assert.equal(r.zeroDrop, null);
  close(r.cashMonths, 12); close(r.lifeMultiple, 1); close(r.bookLeverage, 1);
  assert.throws(() => lifeLeveragePlan({ ...EX13, debts: [{ kind: 'credit', balance: 100 }] }), /請填每月要繳多少/);
  assert.throws(() => lifeLeveragePlan({ ...EX13, debts: [{ kind: 'credit', balance: 100, monthly: 1, invest: 200 }] }), /拿去投資/);
  assert.throws(() => lifeLeveragePlan({ ...EX13, monthlyExpense: 0 }), /生活費/);
  assert.throws(() => lifeLeveragePlan({ ...EX13, holdings: [EX13.holdings[0], EX13.holdings[0]] }), /重複/);
});

const EX14 = { cagr1x: 0.08, vol: 0.2, borrowRate: 0.03, cashRate: 0.01 };

test('kelly ⑭ page example: 每年 8%、波動 20%、借錢 3%、現金 1% → 全凱利 1.685 倍', () => {
  const r = kellyPlan({ ...EX14, current: 1.4 });
  const mu = Math.log(1.08) + 0.02;
  close(r.mu, mu); close(r.full, (mu - Math.log(1.03)) / 0.04); assert.equal(r.full.toFixed(2), '1.69');
  close(r.half, r.full / 2); close(r.quarter, r.full / 4);
  // 格點搜尋（步長 1e-5）得 argmax 1.68506、年化 9.0185%
  close(r.full, 1.68506, 1e-4); close(r.maxCagr, 0.0901846383, 1e-8);
  close(r.breakEven, 3.762880253, 1e-6);
  const by = Object.fromEntries(r.rows.map(x => [x.key, x]));
  assert.deepEqual(r.rows.map(x => x.key), ['cash', 'one', 'two', 'quarter', 'half', 'full', 'current']);
  close(by.cash.cagr, 0.01); assert.equal(by.cash.halveProb, 0);
  close(by.one.cagr, 0.08); close(by.one.halveProb, 0.069442, 1e-6);
  close(by.two.cagr, 0.088024, 1e-6); close(by.two.halveProb, 0.481450, 1e-6);
  close(by.half.cagr, 0.071503, 1e-6); close(by.half.halveProb, 0.034326, 1e-6);
  close(by.quarter.cagr, 0.043996, 1e-6);
  close(by.full.halveProb, 0.348563, 1e-6);
  close(by.current.cagr, 0.088414, 1e-6); close(by.current.halveProb, 0.223559, 1e-6);
  assert.equal(r.curve.length, 41); close(r.curve[10].cagr, 0.08); close(r.curve[20].cagr, by.two.cagr);
});

test('kelly ⑭: 報酬不夠付利息 → 凱利在 1 倍以內（現金段）；夾在 0', () => {
  const r = kellyPlan({ cagr1x: 0.03, vol: 0.2, borrowRate: 0.05, cashRate: 0.01 });
  const mu = Math.log(1.03) + 0.02;
  close(r.full, (mu - Math.log(1.01)) / 0.04); assert.ok(r.full < 1);
  const g0 = kellyPlan({ cagr1x: -0.1, vol: 0.2, borrowRate: 0.03 });
  assert.equal(g0.full, 0); assert.equal(g0.rows.length, 6);
  // 成長 ≤ 0 時腰斬機率 1
  assert.equal(leveredGrowth({ cagr1x: 0.08, vol: 0.2, borrowRate: 0.03 }, 4).halveProb, 1);
});

test('kelly ⑭: 輸入檢查', () => {
  assert.throws(() => kellyPlan({ ...EX14, vol: 0 }), /波動/);
  assert.throws(() => kellyPlan({ ...EX14, cashRate: 0.05 }), /現金利率/);
  assert.throws(() => kellyPlan({ ...EX14, current: 6 }), /現在的倍數/);
  assert.equal(kellyPlan({ ...EX14, current: NaN }).rows.length, 6);
});
