import { h, toolHeader, numberField, selectField, exampleButton, readNumbers, metric, showResult, showError, disclaimer, figure, lineChart } from '../ui/components.js';
import { makeScenario, simulateDaily } from '../core/decay.js';
import { fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'decay');
const result = h('div', { class: 'result', 'aria-live': 'polite' });
const signed = (x, digits = 1) => (Math.round(x * 10 ** (digits + 2)) > 0 ? '+' : '') + fmtPct(x, digits);

function update() {
  const scenario = document.getElementById('scenario').value;
  const label = document.querySelector('label[for=size]');
  label.firstChild.textContent = scenario === 'chop' ? '每日漲跌幅' : '整段大盤漲跌';
  label.nextElementSibling.textContent = scenario === 'chop'
    ? '大盤一天漲這麼多、隔天跌這麼多，例如 5'
    : '整段期間大盤總共漲跌幾 %，例如 10 或 −30';
  const v = readNumbers(['days', 'size']);
  const missing = ['days', 'size'].filter(id => Number.isNaN(v[id])).length;
  if (missing) { showResult(result, h('p', { class: 'muted' }, `填完 ${missing} 格就會算。`)); return; }
  try {
    const r = simulateDaily(makeScenario(scenario, v.days, v.size / 100));
    showResult(result,
      h('div', { class: 'metrics' },
        metric('大盤整段', signed(r.indexTotal)),
        metric('「大盤 × 2」', signed(r.naive)),
        metric('正二實際', signed(r.leveredTotal), r.gap < 0 ? 'bad' : 'ok'),
        metric('差距', signed(r.gap), r.gap < 0 ? 'bad' : 'ok')),
      lineChart({ series: [{ name: '正二', values: r.leveredPath }, { name: '大盤', values: r.indexPath }],
        label: '正二與大盤的淨值走勢，起點為 0%', yFormat: v => signed(v - 1, 0), baseline: 1 }),
      h('p', {}, r.gap < 0
        ? `正二比「大盤 × 2」少了 ${fmtPct(-r.gap)}。來回震盪越多、天數越長，差距通常越大。`
        : `正二比「大盤 × 2」多了 ${fmtPct(r.gap)}。一路同方向時，每天重新槓桿反而會放大結果。`),
      h('p', { class: 'note' }, '理想化計算：沒有扣費用、追蹤誤差和折溢價，實際結果會再差一些。'));
  } catch (e) { showError(result, e.message); }
}

const app = document.getElementById('app');
app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    selectField({ id: 'scenario', label: '行情情境', plain: '同樣的天數，來回震盪和一路漲跌結果差很多', termId: 'volatility-decay',
      options: [{ value: 'chop', label: '來回震盪（一天漲、一天跌）' }, { value: 'trend', label: '單邊趨勢（每天同方向）' }], value: 'chop' }),
    numberField({ id: 'days', label: '天數', plain: '模擬幾個交易日（1–2520）', suffix: '天' }),
    numberField({ id: 'size', label: '每日漲跌幅', plain: '大盤一天漲這麼多、隔天跌這麼多，例如 5', termId: 'daily-2x', suffix: '%' }),
    exampleButton({ scenario: 'chop', days: 20, size: 5 }, update)),
  h('section', { class: 'card' }, h('h2', {}, '結果'), result),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/decay/two-days.svg', alt: '兩天的例子：大盤 100 先漲 10% 到 110 再跌 10% 到 99，正二 100 先漲 20% 到 120 再跌 20% 到 96；大盤共 −1%，整段 ×2 應是 −2%，正二實際 −4%。另一例：連續 10 天每天漲 1%，大盤 +10.5%、整段 ×2 為 +20.9%、正二 +21.9%。', caption: '正二是「每天」2 倍，連續幾天下來不等於整段 2 倍。' }),
    h('p', {}, '正二每天收盤後都會把倍數調回 2 倍，所以它保證的是『每一天』大約 2 倍，不是一個月、一年的 2 倍。'),
    h('p', {}, '來回震盪時，跌下來的那天是用比較大的本金在跌，漲回去的那天是用比較小的本金在漲，一來一回就輸給『整段 × 2』。這就是常聽到的波動耗損。'),
    h('p', {}, '反過來，一路往同一個方向走的時候，正二可能比整段 2 倍還多。所以不能用一個固定的『每年耗損幾 %』來估。')),
  disclaimer('general'));
app.addEventListener('input', update);
app.addEventListener('change', update);
update();
