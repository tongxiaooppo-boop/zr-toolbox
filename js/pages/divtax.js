// 工具⑰：計算只呼叫 core/divtax.js。
import { h, toolHeader, disclaimer, figure, selectField } from '../ui/components.js';
import { wizard, numberInput, explain, withHelp } from '../ui/wizard.js';
import { dividendTaxPlan, TAX_YEARS, DEFAULT_TAX_YEAR, DIVIDEND_CREDIT_CAP } from '../core/divtax.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';
const tool = TOOLS.find(t => t.id === 'divtax');
const num = id => parseNum(document.getElementById(id)?.value);
const blank = v => v === undefined || v === null || Number.isNaN(v);
const link = (href, text) => h('a', { href }, text);
const params = s => ({ year: +s.year, married: s.married === 'yes', people: s.people, elderly: s.elderly, salaries: s.salaries || [], otherIncome: s.otherIncome, dividends: s.dividends, itemized: s.itemized, otherSpecial: s.otherSpecial });
const pay = p => p < 0 ? '可退 ' + fmtMoney(-p) : '要繳 ' + fmtMoney(p);
const steps = [
  {
    title: '申報年度和家裡幾個人',
    hint: '申報戶＝同一份報稅書上的人：本人、一起申報的配偶、扶養的家人。',
    about: '人數決定免稅額和扣除額，扣越多，股利併進來時適用的稅率越低。',
    body: s => [
      withHelp(selectField({ id: 'year', label: '哪一年的所得', options: Object.values(TAX_YEARS).map(p => ({ value: String(p.year), label: p.year + ' 年度所得（' + p.fileIn + ' 年 5 月報稅）' })), value: String(s.year || DEFAULT_TAX_YEAR) }), { text: ['報稅是報「前一年」的所得：2027 年 5 月報的是 115 年度（2026 年）的所得。', '各年度的免稅額、扣除額、稅率級距不同。'] }),
      selectField({ id: 'married', label: '有沒有配偶一起申報', options: [{ value: 'no', label: '沒有（單身或分開申報）' }, { value: 'yes', label: '有，夫妻一起申報' }], value: s.married || 'no' }),
      numberInput({ id: 'people', label: '申報戶總人數', plain: '本人＋配偶＋扶養的家人', suffix: '人', value: s.people }),
      numberInput({ id: 'elderly', label: '其中 70 歲以上（選填）', plain: '留白＝0', suffix: '人', value: s.elderly, help: { text: ['70 歲以上的本人、配偶、扶養的直系尊親屬，免稅額比較高。'] } })],
    read: s => {
      s.year = document.getElementById('year').value; s.married = document.getElementById('married').value;
      s.people = num('people'); s.elderly = num('elderly');
      if (blank(s.people)) throw new Error('請填申報戶總人數。');
      dividendTaxPlan(params({ ...s, salaries: [], dividends: 0 }));
    }
  },
  {
    title: '薪資和其他所得', hint: '看各人的扣繳憑單或國稅局的所得資料；沒有就留白。',
    about: '薪資每個人可以分開扣一筆薪資特別扣除額，所以每人一格。',
    body: s => {
      const out = Array.from({ length: Math.min(s.people, 4) }, (_, i) => numberInput({ id: 'sal' + i,
        label: i === 0 ? '本人薪資' : i === 1 && s.married === 'yes' ? '配偶薪資' : '家人 ' + (s.married === 'yes' ? i - 1 : i) + ' 薪資',
        plain: '一年的薪資總額，沒有就留白', suffix: '元', value: (s.salaries || [])[i],
        help: i === 0 ? { text: ['薪資特別扣除額每人最多 ' + fmtMoney(TAX_YEARS[s.year].salaryCap) + '，不能合併給別人用。'] } : undefined }));
      if (s.people > 4) out.push(h('p', { class: 'muted' }, '超過 4 個人有薪資時，把其他人的薪資加在最後一格（薪資扣除額會少算一些）。'));
      out.push(numberInput({ id: 'otherIncome', label: '其他所得（選填）', plain: '利息、租金、執行業務…合計，留白＝0', suffix: '元', value: s.otherIncome }));
      return out;
    },
    read: s => {
      s.salaries = Array.from({ length: Math.min(s.people, 4) }, (_, i) => num('sal' + i)); s.otherIncome = num('otherIncome');
      dividendTaxPlan(params({ ...s, dividends: 0 }));
    }
  },
  {
    title: '股利和扣除額', hint: '股利看國稅局的所得資料或券商寄的股利憑單，全家加起來。',
    about: '8.5% 抵減每戶最多 8 萬元；股利很多、所得很高時，分開計稅才可能比較省。',
    figure: { src: '../img/divtax/step3.webp', alt: '什麼時候分開計稅比較省？五階樓梯由下到上：5%、12%、20%、30%、40%。5% 到 30% 通常合併比較省；40% 可能分開比較省。8.5% 抵減每戶最多 8 萬元。股利 100 萬 × 8.5% ＝ 85,000 → 只能抵 80,000。小安說：股利越多，抵減越不夠用。老師說：兩種都算一次，選少的那個，報稅系統也會幫你比。' },
    body: s => [
      numberInput({ id: 'dividends', label: '一年的股利所得', termId: 'dividend-tax', plain: '全家加起來', suffix: '元', value: s.dividends, help: { text: ['現金股利加股票股利；股票股利按面額算（每股配 1 元股票股利、持有 1 張＝1,000 元）。', 'ETF 配息只有「股利」那一部分算這裡，利息、收益平準金不是；以基金公司寄的所得明細為準。'] } }),
      numberInput({ id: 'itemized', label: '列舉扣除額（選填）', plain: '保險費、醫藥費、房貸利息、捐款…合計；留白＝用標準扣除額', suffix: '元', value: s.itemized }),
      numberInput({ id: 'otherSpecial', label: '其他特別扣除額（選填）', plain: '身障、教育學費、幼兒、長照、房租…合計，薪資的不用填', suffix: '元', value: s.otherSpecial })],
    read: s => {
      s.dividends = num('dividends'); s.itemized = num('itemized'); s.otherSpecial = num('otherSpecial');
      if (blank(s.dividends)) throw new Error('請填一年的股利所得，沒有就填 0。');
      dividendTaxPlan(params(s));
    }
  }
];
function result(s) {
  const r = dividendTaxPlan(params(s)), c = r.combined, p = r.separate;
  const minus = r.exemption + r.deduction + r.salarySpecial + r.otherSpecial + r.basicLivingDiff;
  const elderly = blank(s.elderly) ? 0 : s.elderly;
  const out = [
    explain({ label: '建議', value: { combined: '合併計稅', separate: '分開計稅', same: '兩種一樣' }[r.best], tone: 'ok', how: '合併計稅' + pay(c.payable) + '；分開計稅' + pay(p.payable) + '。', means: r.best === 'same' ? '兩種算法繳的一樣。' : '選這個少繳 ' + fmtMoney(r.saving) + '。報稅時系統也會幫你比，選少的那個。' }),
    explain({ label: '兩種都先扣掉', value: fmtMoney(minus), tone: 'info', how: '免稅額 ' + fmtMoney(r.exemption) + '（' + s.people + ' 人' + (elderly > 0 ? '，其中 70 歲以上 ' + elderly + ' 人' : '') + '）＋ ' + (r.deductionKind === 'itemized' ? '列舉' : '標準') + '扣除額 ' + fmtMoney(r.deduction) + ' ＋ 薪資特別扣除額 ' + fmtMoney(r.salarySpecial) + ' ＋ 其他特別扣除額 ' + fmtMoney(r.otherSpecial) + ' ＋ 基本生活費差額 ' + fmtMoney(r.basicLivingDiff) + '。', means: r.basicLivingDiff > 0 ? '基本生活費 ' + fmtMoney(r.basicLiving) + '（每人 ' + fmtMoney(r.params.basicLiving) + ' × ' + s.people + ' 人）比免稅額加扣除額還多，差額也可以扣。' : '兩種算法扣的一樣，差別只在股利怎麼算。' }),
    explain({ label: '合併計稅', value: pay(c.payable), tone: r.best === 'combined' ? 'ok' : 'info', how: '所得總額 ' + fmtMoney(c.income) + '（含股利 ' + fmtMoney(s.dividends) + '）− ' + fmtMoney(minus) + ' ＝ 所得淨額 ' + fmtMoney(c.net) + '；× ' + fmtPct(c.rate, 0) + ' − 累進差額 ' + fmtMoney(c.diff) + ' ＝ ' + fmtMoney(c.taxBefore) + '；減股利抵減 ' + fmtMoney(c.credit) + '（股利 × 8.5%' + (c.creditCapped ? '，超過上限只能抵 ' + fmtMoney(DIVIDEND_CREDIT_CAP) : '') + '）。', means: c.payable < 0 ? '抵減比稅還多，差額可以退稅。' : '股利跟其他所得一起照級距算，你最高那一級是 ' + fmtPct(c.rate, 0) + '。' }),
    explain({ label: '分開計稅', value: pay(p.payable), tone: r.best === 'separate' ? 'ok' : 'info', how: '不含股利的所得總額 ' + fmtMoney(p.income) + ' − ' + fmtMoney(minus) + ' ＝ 所得淨額 ' + fmtMoney(p.net) + '；× ' + fmtPct(p.rate, 0) + ' − 累進差額 ' + fmtMoney(p.diff) + ' ＝ ' + fmtMoney(p.taxBefore) + '；股利 ' + fmtMoney(s.dividends) + ' × 28% ＝ ' + fmtMoney(p.dividendTax) + '；合計 ' + fmtMoney(p.payable) + '。', means: '股利不管多少都是 28%；所得級距到 40% 的人比較可能划算。' })];
  if (r.provisional) out.push(h('p', { class: 'note' }, r.year + ' 年度的基本生活費財政部還沒公告（通常 11 月下旬），先用每人 ' + fmtMoney(r.params.basicLiving) + ' 估；只影響家裡人多、收入低的情況。'));
  out.push(h('p', { class: 'note' }, '只算一個申報戶的綜合所得稅；沒算最低稅負制、已經被扣繳的稅、二代健保補充保費。實際以報稅系統試算為準。'), h('p', { class: 'todo' }, ['股利的二代健保補充保費，看 ', link('dividend.html', '⑩ 股息與除權息'), '。']));
  return out;
}
const example = { year: '115', married: 'no', people: 1, elderly: NaN, salaries: [800000], otherIncome: NaN, dividends: 300000, itemized: NaN, otherSpecial: NaN };
document.getElementById('app').append(toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/divtax/comic.webp', alt: '四格漫畫：一、股利也要報稅。小安拿著一年股利 30 萬的單子問：股利也要繳稅？老師說：有兩種算法，選繳比較少的。二、合併計稅。薪資 80 萬 ＋ 股利 30 萬 一起算；稅 33,620 − 股利 × 8.5% 25,500；＝ 8,120。三、分開計稅。薪資自己算 16,800；股利 × 28% ＝ 84,000；＝ 100,800。四、這次合併比較省。小安說：差了 92,680 元！老師說：所得很高、股利很多的人，分開才可能比較省。115 年度、單身、標準扣除額的例子；實際以報稅系統試算為準。' }),
    h('p', {}, '股利要報綜合所得稅，有兩種算法擇一：合併計稅是把股利加進所得照級距算，再減股利的 8.5%（每戶最多 8 萬，抵不完可以退）；分開計稅是股利單獨按 28% 算。'),
    h('p', {}, '大多數人合併比較省：級距 5%、12%、20% 的人，減掉 8.5% 之後股利的稅率遠低於 28%，甚至可以退稅。所得到 40% 級距、股利又多的人，分開才可能比較省。'),
    h('p', {}, '這裡用的是財政部公告的免稅額、扣除額和級距；每年會依物價調整，報稅時以報稅系統為準。')), disclaimer('general'));
