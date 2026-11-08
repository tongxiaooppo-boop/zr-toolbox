import { h, toolHeader, numberField, selectField, exampleButton, readNumbers, metric, showResult, showError, disclaimer, figure } from '../ui/components.js';
import { TEMPLATES, rebalance } from '../core/rebalance.js';
import { fmtMoney, fmtX } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'rebalance');
const FIELDS = ['h0', 'h1', 'h2', 'contribution', 'fee'];
const result = h('div', { class: 'result', 'aria-live': 'polite' });
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const templates = [
  { value: '5050', label: '股版｜50／50（正二 50、現金 50）' },
  { value: '6040', label: '股版｜60／40（正二 60、現金 40）' },
  { value: '532-stock', label: '股版｜532（原型 50、正二 30、現金 20）' },
  { value: '442-stock', label: '股版｜442（原型 40、正二 40、現金 20）' },
  { value: '433-stock', label: '股版｜433（原型 40、正二 30、現金 30）' },
  { value: '532-bond', label: '債版｜532（正二 50、美債 30、現金 20）' },
  { value: '442-bond', label: '債版｜442（正二 40、美債 40、現金 20）' }
];

function dateField({ id, label, plain, value = '' }) {
  return h('div', { class: 'field' },
    h('label', { for: id }, label),
    h('small', { class: 'plain-sub' }, plain),
    h('div', { class: 'input-row' }, h('input', { id, type: 'date', value })));
}

function update() {
  const template = document.getElementById('template').value;
  const assets = TEMPLATES[template].assets;
  assets.forEach((name, i) => {
    document.querySelector(`label[for=h${i}]`).firstChild.textContent = name + '市值';
  });
  const v = readNumbers(FIELDS);
  const last = document.getElementById('last').value;
  const asOf = document.getElementById('asOf').value;
  const missing = ['h0', 'h1', 'h2'].filter(id => Number.isNaN(v[id])).length + Number(!last) + Number(!asOf);
  if (missing) { showResult(result, h('p', { class: 'muted' }, `填完 ${missing} 格就會算。`)); return; }
  try {
    const r = rebalance({ template, holdings: [v.h0, v.h1, v.h2],
      contribution: Number.isNaN(v.contribution) ? 0 : v.contribution,
      fee: Number.isNaN(v.fee) ? 0 : v.fee,
      months: Number(document.getElementById('months').value), last, asOf });
    showResult(result,
      h('div', { class: 'metrics' },
        metric('到期日', r.due),
        metric('到期了嗎？', r.ready ? '到期了，可以配回' : '還沒到期', r.ready ? 'warn' : 'ok')),
      h('div', { class: 'metrics' },
        metric('策略總額', fmtMoney(r.total)),
        metric('近似曝險', '約 ' + fmtX(r.exposure) + '大盤')),
      h('table', { class: 'trade-table' },
        h('thead', {}, h('tr', {}, ['部位', '目標金額', '要做的事'].map(label => h('th', { scope: 'col' }, label)))),
        h('tbody', {}, assets.map((name, i) => {
          const trade = r.trades[i];
          const action = Math.abs(trade) < 0.5 ? '不動' :
            (name === '現金' ? (trade > 0 ? '增加 ' : '用掉 ') : (trade > 0 ? '買進 ' : '賣出 ')) + fmtMoney(Math.abs(trade));
          return h('tr', {}, h('td', {}, name), h('td', {}, fmtMoney(r.targets[i])), h('td', {}, action));
        }))),
      !r.ready ? h('p', { class: 'note' }, '還沒到期，照規則先不用動；上面是「如果今天配回」的金額。') : [],
      h('p', { class: 'note' }, '近似曝險＝原型權重×1＋正二權重×2，美債與現金算 0，是簡化，不是預期報酬。'));
  } catch (e) { showError(result, e.message); }
}

const app = document.getElementById('app');
app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    selectField({ id: 'template', label: '配置模板', plain: '股版和債版名字一樣、內容不同，選之前看清楚', options: templates, value: '532-stock' }),
    selectField({ id: 'months', label: '再平衡週期', plain: '多久配回一次，不看漲跌', termId: 'rebalance',
      options: [{ value: '1', label: '每月' }, { value: '3', label: '每季' }, { value: '6', label: '每半年' }, { value: '12', label: '每年' }], value: '6' }),
    dateField({ id: 'last', label: '上次配回日', plain: '上次照比例配好的日期' }),
    dateField({ id: 'asOf', label: '檢視日', plain: '預設今天', value: today }),
    TEMPLATES['532-stock'].assets.map((name, i) => numberField({ id: `h${i}`, label: name + '市值', plain: '這個策略裡的這一部分現在值多少', suffix: '元' })),
    numberField({ id: 'contribution', label: '這次新投入', plain: '沒有就留白', suffix: '元' }),
    numberField({ id: 'fee', label: '費用預算', plain: '先扣掉手續費、稅的預留金額，沒有就留白', suffix: '元' }),
    exampleButton({ template: '532-stock', months: '6', last: '2026-05-08', asOf: '2026-11-08', h0: 450000, h1: 210000, h2: 200000, contribution: '', fee: '' }, update)),
  h('section', { class: 'card' }, h('h2', {}, '結果'), result),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/rebalance/532-stock.svg', alt: '532 股版範例：到期日原型 45 萬、正二 21 萬、現金 20 萬，合計 86 萬；配回後原型 43 萬、正二 25.8 萬、現金 17.2 萬，原型賣 2 萬、正二買 4.8 萬、現金用掉 2.8 萬。', caption: '不看漲跌，到期就用當時的總額配回原比例。' }),
    h('p', {}, '定期配比只看時間：選好比例和週期，到期那天用當時的總額照比例配回，中間漲跌都不動。這和 ② 的 50/50 觸發不同，那個看的是正二漲跌一半。'),
    h('p', {}, '網路上的 532、442 有兩種：股版是原型／正二／現金，債版是正二／美債／現金。名字一樣、風險不同，別人說 442 時先問是哪一種。'),
    h('p', {}, '算出來的是各部位的目標金額，不是下單股數；實際下單還要看股價、零股、手續費和稅。到期那天休市就順延到下一個交易日。')),
  disclaimer('general'));
app.addEventListener('input', update);
app.addEventListener('change', update);
update();
