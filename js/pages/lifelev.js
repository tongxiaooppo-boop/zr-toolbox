// 工具⑬ 人生槓桿體檢：計算只呼叫 core/lifelev.js。
import { h, toolHeader, disclaimer, figure } from '../ui/components.js';
import { wizard, betaHoldingsInput, readBetaHoldings, debtsInput, readDebts, tokenBox, numberInput, explain } from '../ui/wizard.js';
import { lifeLeveragePlan } from '../core/lifelev.js';
import { guessBeta } from '../core/rebalance.js';
import { parseNum, fmtMoney, fmtPct, fmtX } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'lifelev');
const num = id => parseNum(document.getElementById(id)?.value);
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;
const link = (href, text) => h('a', { href }, text);
const blank = v => v === undefined || v === null || Number.isNaN(v);
const signedMoney = n => (n < 0 ? '−' : '+') + fmtMoney(Math.abs(n));

function params(s, over = {}) {
  return { holdings: s.rows || [], cash: s.cash, realEstate: s.realEstate, otherAssets: s.otherAssets,
    debts: (s.debts || []).map(d => ({ kind: d.kind, balance: d.balance, monthly: d.monthly, rate: d.ratePct / 100, years: d.years, invest: d.invest })),
    monthlyExpense: s.monthlyExpense, monthlyIncome: s.monthlyIncome, stressDrop: s.stressPct / 100, ...over };
}

const steps = [
  {
    title: '你的持股',
    hint: '填你全部的股票和 ETF，不只一個策略。股數看券商 App 的庫存；沒有股票就全部刪掉。',
    about: '每檔市值 × Beta 加起來，就是你整體跟著大盤漲跌的金額（曝險）。',
    figure: { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' },
    body: s => {
      const holdings = betaHoldingsInput({ id: 'rows', rows: s.rows || [{}], kind: 'life' });
      const token = tokenBox();
      holdings.querySelectorAll('.beta-holding').forEach(row => {
        const code = row.querySelector('.b-code');
        if (code.value.trim() && !row.querySelector('.b-price').value.trim()) code.dispatchEvent(new Event('change'));
      });
      return [holdings, token];
    },
    read: s => { s.rows = readBetaHoldings('rows'); lifeLeveragePlan(params(s, { cash: 0, debts: [], monthlyExpense: 1 })); }
  },
  {
    title: '現金和房子',
    hint: '現金含活存、定存；房子填現在大概能賣多少，沒有就留白。',
    about: '總資產＝現金＋股票＋房子＋其他。房子和其他資產不算進金融淨資產。',
    body: s => [
      numberInput({ id: 'cash', label: '現金', plain: '活存＋定存＋證券戶交割款，沒有填 0', suffix: '元', value: s.cash }),
      numberInput({ id: 'realEstate', label: '房子市價（選填）', plain: '實價登錄或估價，留白＝0', suffix: '元', value: s.realEstate, help: { text: '自住、出租都算。房子的漲跌在這裡當作 1 倍，是簡化。' } }),
      numberInput({ id: 'otherAssets', label: '其他資產（選填）', plain: '車子、保單價值準備金…留白＝0', suffix: '元', value: s.otherAssets })],
    read: s => {
      s.cash = num('cash');
      if (blank(s.cash)) throw new Error('請填現金，沒有就填 0。');
      s.realEstate = num('realEstate'); s.otherAssets = num('otherAssets');
      lifeLeveragePlan(params(s, { debts: [], monthlyExpense: 1 }));
    }
  },
  {
    title: '你的借款',
    hint: '每筆借款一列；看銀行、券商 App 的剩餘本金和每月扣款。沒有借款就全部刪掉。',
    about: '拿去買股票的借款要從金融淨資產扣掉；拿去買房子的不扣，但每月還款照算。',
    figure: { src: '../img/lifelev/step3.webp', alt: '同樣是借錢，算法不一樣。小安問：房貸也要算進股票的槓桿嗎？拿去買股票：信貸、股票質押、融資，從金融淨資產扣掉。拿去買房子：房貸，不扣金融淨資產，每月還款照算。房貸增貸拿去買股票的那一部分 → 算左邊。老師說：每筆借款都填『拿去投資多少』。質押、融資留白就當全部。' },
    body: s => [debtsInput({ id: 'debts', rows: s.debts || [] })],
    read: s => { s.debts = readDebts('debts'); lifeLeveragePlan(params(s, { monthlyExpense: 1 })); }
  },
  {
    title: '生活費和收入',
    hint: '生活費不含還款（還款上一步填過了）。收入填每月實拿。',
    body: s => [
      numberInput({ id: 'monthlyExpense', label: '每月生活費', plain: '吃住交通保險…不含還款', suffix: '元', value: s.monthlyExpense }),
      numberInput({ id: 'monthlyIncome', label: '每月收入（選填）', plain: '薪水等實拿，留白就不算結餘', suffix: '元', value: s.monthlyIncome }),
      numberInput({ id: 'stressPct', label: '大跌情境（選填）', plain: '大盤跌幾 %，留白＝30', suffix: '%', value: s.stressPct })],
    read: s => { s.monthlyExpense = num('monthlyExpense'); s.monthlyIncome = num('monthlyIncome'); s.stressPct = num('stressPct'); lifeLeveragePlan(params(s)); }
  }
];

function result(s) {
  const r = lifeLeveragePlan(params(s));
  const out = [
    explain({ label: '金融淨資產', value: fmtMoney(r.financialNet), tone: r.financialNet > 0 ? 'info' : 'bad',
      how: `現金 ${fmtMoney(s.cash)} ＋ 股票 ${fmtMoney(r.stockValue)} − 拿去投資的借款 ${fmtMoney(r.investDebt)} ＝ ${fmtMoney(r.financialNet)}。`,
      means: '能拿來投資、會跟著市場漲跌的自己的錢。房子不算；房貸買房不扣。' }),
    explain({ label: '市場曝險倍數', value: r.marketLeverage === null ? '算不出來' : fmtX(r.marketLeverage), tone: r.marketLeverage === null || r.marketLeverage > 2 ? 'bad' : r.marketLeverage > 1 ? 'warn' : 'ok',
      how: '每檔市值 × Beta：' + (r.holdings.map((row, i) => `${named(row.code)} ${fmtMoney(row.value)} × ${blank(s.rows[i].beta) ? guessBeta(row.code) + '（看代號猜）' : row.beta}`).join(' ＋ ') || '沒有持股') + ` ＝ ${fmtMoney(r.exposure)}；÷ 金融淨資產 ${fmtMoney(r.financialNet)}。`,
      means: r.marketLeverage === null ? '金融淨資產是 0 或負的：借來投資的錢比現金加股票還多。' : `大盤漲跌 1%，你的金融淨資產大約漲跌 ${r.marketLeverage.toFixed(2)}%。`,
      todo: ['想調整倍數，看 ', link('exposure.html', '⑪ 正二要買多少'), '。'] }),
    explain({ label: '帳面槓桿', value: r.bookLeverage === null ? '總淨資產是負的' : fmtX(r.bookLeverage), tone: r.bookLeverage === null ? 'bad' : 'info',
      how: `總資產 ${fmtMoney(r.assets)} ÷ 總淨資產 ${fmtMoney(r.net)}。`,
      means: `把房子、房貸都算進來，總共借了多少錢來撐資產。總淨資產＝總資產 ${fmtMoney(r.assets)} − 全部借款 ${fmtMoney(r.debt)}。` }),
    explain({ label: '總曝險槓桿', value: r.totalLeverage === null ? '總淨資產是負的' : fmtX(r.totalLeverage), tone: r.totalLeverage === null ? 'bad' : 'info',
      how: `（房子 ${fmtMoney(blank(s.realEstate) ? 0 : s.realEstate)} ＋ 股票曝險 ${fmtMoney(r.exposure)}）÷ 總淨資產 ${fmtMoney(r.net)}。`,
      means: '房價和股市一起跌時，總淨資產會放大幾倍受傷。房子當 1 倍是簡化。' }),
    explain({ label: r.monthlyFree === null ? '每月要付' : '每月結餘', value: r.monthlyFree === null ? fmtMoney(r.monthlyOut) : signedMoney(r.monthlyFree), tone: r.monthlyFree === null ? 'info' : r.monthlyFree < 0 ? 'bad' : 'ok',
      how: (r.monthlyFree === null ? '' : `收入 ${fmtMoney(s.monthlyIncome)} − `) + `生活費 ${fmtMoney(s.monthlyExpense)}` + r.debts.map((d, i) => (r.monthlyFree === null ? ' ＋ ' : ' − ') + `${d.label} ${fmtMoney(d.monthly)}` + (d.payBy === 'amortized' ? `（用年利率 ${s.debts[i].ratePct}%、${s.debts[i].years} 年本息攤還算的）` : d.payBy === 'interest' ? `（只繳利息：餘額 × ${s.debts[i].ratePct}% ÷ 12）` : '')).join('') + (r.monthlyFree === null && r.debts.length ? ` ＝ ${fmtMoney(r.monthlyOut)}。` : '。'),
      means: r.monthlyFree !== null && r.monthlyFree < 0 ? '每月入不敷出，要動用存款或賣股票。' : `每月花在生活和還款的錢共 ${fmtMoney(r.monthlyOut)}。` }),
    explain({ label: '現金撐幾個月', value: r.cashMonths.toFixed(1) + ' 個月', tone: r.cashMonths < 3 ? 'bad' : r.cashMonths < 6 ? 'warn' : 'ok',
      how: `現金 ${fmtMoney(s.cash)} ÷ 每月要付 ${fmtMoney(r.monthlyOut)}。`, means: '收入突然停了，不賣股票能撐多久。大跌時常常也是最不想賣的時候。' }),
    explain({ label: '生活費倍數', value: r.lifeMultiple > 0 ? r.lifeMultiple.toFixed(1) + ' 倍' : '0 倍', tone: 'info',
      how: `金融淨資產 ${fmtMoney(r.financialNet)} ÷ 一年生活費 ${fmtMoney(12 * s.monthlyExpense)}。`,
      means: r.withdrawRate ? '相當於每年領 ' + fmtPct(r.withdrawRate) + '。對照：4% 法則約 25 倍。' : '金融淨資產不是正的。', todo: ['退休要存多少，看 ', link('retire.html', '⑲ 退休提領'), '。'] })
  ];
  if (r.exposure > 0) out.push(explain({ label: '大盤跌多少會歸零', value: r.zeroDrop === null ? '已經是負的' : r.zeroDrop > 1 ? '大盤跌光也不會' : fmtPct(r.zeroDrop), tone: r.zeroDrop === null || r.zeroDrop < 0.5 ? 'bad' : r.zeroDrop > 1 ? 'ok' : 'warn',
    how: `金融淨資產 ${fmtMoney(r.financialNet)} ÷ 股票曝險 ${fmtMoney(r.exposure)}。`, means: '直線估算：正二每天重新 2 倍，真的大跌時結果會不太一樣。' }));
  const todo = [];
  if (r.debts.some(d => d.kind === 'pledge')) todo.push('有股票質押，追繳線看 ', link('pledge.html', '④ 質押壓力測試'), '。');
  if (r.debts.some(d => d.kind === 'margin')) todo.push('有融資，追繳線看 ', link('margin.html', '⑤ 融資融券維持率'), '。');
  out.push(explain({ label: '大盤跌 ' + fmtPct(r.stressDrop, 0) + ' 後', value: fmtMoney(r.financialNetAfter), tone: r.financialNetAfter <= 0 ? 'bad' : 'warn',
    how: (r.holdings.length ? r.holdings.map(row => `${named(row.code)} ${fmtMoney(row.value)} → ${fmtMoney(row.valueAfter)}`).join('；') : '沒有持股，股票不受影響') + `。金融淨資產 ${fmtMoney(r.financialNet)} → ${fmtMoney(r.financialNetAfter)}；借款不會跟著變少。`,
    means: r.marketLeverageAfter === null ? '金融淨資產變成 0 或負的。' : '曝險倍數 ' + fmtX(r.marketLeverage) + ' → ' + fmtX(r.marketLeverageAfter) + '：越跌倍數越高。', todo: todo.length ? todo : null }),
    h('p', { class: 'note' }, '只做體檢、不給建議倍數。Beta 是估計值、房子當 1 倍；沒算稅、手續費、利率變動。'));
  return out;
}

const example = { rows: [{ code: '0050', shares: 10000, price: 195.5, beta: NaN }, { code: '00631L', shares: 20000, price: 26.3, beta: NaN }],
  cash: 500000, realEstate: 12000000, otherAssets: NaN,
  debts: [{ kind: 'mortgage', balance: 8000000, monthly: NaN, ratePct: 2.2, years: 25, invest: NaN },
    { kind: 'credit', balance: 1000000, monthly: 18000, ratePct: NaN, years: NaN, invest: 1000000 }],
  monthlyExpense: 40000, monthlyIncome: 100000, stressPct: NaN };

document.getElementById('app').append(
  toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/lifelev/comic.webp', alt: '四格漫畫：一、先列家當。有的：股票 2,481,000、現金 500,000、房子 12,000,000；欠的：房貸 8,000,000、信貸 1,000,000（拿去買股票）。老師說：有的、欠的，全部寫下來。二、金融淨資產：現金 500,000 ＋ 股票 2,481,000 − 信貸 1,000,000 ＝ 1,981,000。老師說：房貸拿去買房子，這裡不扣；信貸拿去買股票，要扣。三、市場曝險倍數：原型 1,955,000 × 1 ＋ 正二 526,000 × 2 ＝ 3,007,000；3,007,000 ÷ 1,981,000 ＝ 1.52 倍。小安說：我以為自己只有 1 倍多一點…。四、大盤跌 30% 會怎樣：金融淨資產 1,981,000 → 1,078,900；曝險倍數 1.52 倍 → 1.66 倍。小安說：越跌倍數越高！老師說：房貸、信貸還是每個月要繳。直線估算；沒算手續費和稅。' }),
    h('p', {}, '同樣買了正二，有人只用閒錢、有人背著房貸和信貸。這個工具把家裡有的、欠的全部列出來，看你真正開了幾倍槓桿。'),
    h('p', {}, '三種倍數分母不同：市場曝險倍數看金融淨資產（只扣拿去投資的借款）；帳面槓桿、總曝險槓桿看總淨資產（扣全部借款、房子也算）。不要拿不同分母的數字互相比。'),
    h('p', {}, '大跌時股票變少、借款不變，所以越跌倍數越高。現金撐幾個月，決定你大跌時要不要被迫賣股票。')),
  disclaimer('general'));
