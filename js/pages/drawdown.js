import { h, toolHeader, numberField, infoChip, exampleButton, readNumbers, metric, showResult, showError, disclaimer, figure } from '../ui/components.js';
import { recoveryGain, maxDrawdown, yearsToRecover } from '../core/drawdown.js';
import { parseNum, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'drawdown');
const result = h('div', { class: 'result', 'aria-live': 'polite' });

function seriesField() {
  return h('div', { class: 'field' },
    h('label', { for: 'series' }, '淨值或股價紀錄（選填）', infoChip('drawdown')),
    h('small', { class: 'plain-sub' }, '用逗號或空白隔開，例：100, 120, 90'),
    h('textarea', { id: 'series', rows: 3 }));
}

function update() {
  const v = readNumbers(['drop', 'annual']);
  const hasDrop = document.getElementById('drop').value.trim() !== '';
  const hasAnnual = document.getElementById('annual').value.trim() !== '';
  const text = document.getElementById('series').value.trim();
  if (!hasDrop && !text) {
    showResult(result, h('p', { class: 'muted' }, '填跌幅，或貼一串淨值紀錄，就會算。')); return;
  }
  try {
    const nodes = [];
    if (hasDrop) {
      const d = v.drop / 100;
      const metrics = [metric('回本要漲', fmtPct(recoveryGain(d)), 'warn')];
      if (hasAnnual) metrics.push(metric('每年賺 ' + v.annual + '% 要', '約 ' + yearsToRecover(d, v.annual / 100).toFixed(1) + ' 年'));
      nodes.push(h('div', { class: 'metrics' }, metrics));
    }
    if (text) {
      const values = text.split(/[\s,，、]+/).filter(Boolean).map(parseNum);
      if (values.some(Number.isNaN)) { showError(result, '紀錄裡有不是數字的內容，請只填數字，用逗號或空白隔開。'); return; }
      if (values.length < 2) { showError(result, '紀錄至少要兩筆。'); return; }
      const m = maxDrawdown(values);
      nodes.push(h('h3', {}, '你的紀錄'));
      if (m.mdd === 0) nodes.push(h('p', {}, '這串紀錄沒有從高點往下跌過。'));
      else nodes.push(
        h('div', { class: 'metrics' },
          metric('最大回撤', fmtPct(m.mdd), 'bad'),
          metric('要漲多少才回到前高', fmtPct(recoveryGain(m.mdd)))),
        h('p', {}, `從第 ${m.peakIndex + 1} 筆（${values[m.peakIndex]}）跌到第 ${m.troughIndex + 1} 筆（${values[m.troughIndex]}）。`));
    }
    showResult(result, nodes);
  } catch (e) { showError(result, e.message); }
}

const app = document.getElementById('app');
app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    numberField({ id: 'drop', label: '跌幅', plain: '從高點跌了幾 %，例如 30', termId: 'recovery-gain', suffix: '%' }),
    numberField({ id: 'annual', label: '之後每年賺多少（選填）', plain: '填了會估要幾年回本', suffix: '%' }),
    seriesField(),
    exampleButton({ drop: 50, annual: 10, series: '100, 120, 90, 130, 65, 140' }, update)),
  h('section', { class: 'card' }, h('h2', {}, '結果'), result),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/drawdown/recovery.svg', alt: '100 萬跌 50% 剩 50 萬，要漲 100% 才回到 100 萬。對照：跌 10% 要漲 11.1%、跌 20% 要漲 25%、跌 30% 要漲 42.9%、跌 40% 要漲 66.7%、跌 50% 要漲 100%。跌 50% 後每年賺 10% 約要 7.3 年回本。', caption: '跌得越深，回本要漲的幅度越大，而且不是等比例變大。' }),
    h('p', {}, '跌和漲的基準不一樣：跌是用原本的錢算，漲是用剩下的錢算。100 萬跌 50% 剩 50 萬，50 萬要漲 100% 才回到 100 萬。'),
    h('p', {}, '回撤是從前一個高點往下跌了多少；最大回撤是一段期間裡最深的那一次。貼一串淨值或股價進來，就能找出最大回撤在哪裡。'),
    h('p', {}, '正二的漲跌大約是大盤的 2 倍，回撤也會比較深。考慮要放多少錢之前，先想想自己能不能等到回本。')),
  disclaimer('general'));
app.addEventListener('input', update);
app.addEventListener('change', update);
update();
