import { h, toolHeader, figure, references, disclaimer } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { ZR_SECTIONS, ZR_WAYS, ZR_MIXES, DAJEN, ZR_STEPS, ZR_LIMITS, ZR_REFS, FIGURE_TEXT, ZR_PERIODIC } from '../data/zr101.js';

const links = ids => h('p', { class: 'related' }, '接著算：', ids.map((id, i) => {
  const { no, title } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: id + '.html' }, no + ' ' + title)];
}));
const periodic = () => [
  h('h4', {}, '大仁 50/50 怎麼配回'), ZR_PERIODIC.examples.map(text => h('p', {}, text)),
  h('h4', {}, '四種定期配比'), h('p', {}, ZR_PERIODIC.weights), h('p', {}, ZR_PERIODIC.multiples),
  h('p', {}, ZR_PERIODIC.assumption),
  h('div', { class: 'compare-wrap', tabindex: '0', role: 'region', 'aria-label': '定期配比情境比較，可橫向捲動' },
    h('table', {}, h('caption', {}, '定期配比的假設例子'),
      h('thead', {}, h('tr', {}, ['配置', '變動後 原型／正二／現金（萬）', '合計（萬）', '配回目標（萬）', '要做的事（萬）'].map(label => h('th', { scope: 'col' }, label)))),
      h('tbody', {}, ZR_MIXES.map(m => h('tr', {}, h('th', { scope: 'row' }, m.name), [m.after, m.total, m.target, m.action].map(value => h('td', {}, value)))))))
];
const dajen = () => [
  h('dl', {}, [['期間', DAJEN.period], ['起始', DAJEN.start], ['規則', DAJEN.rule], ['配回日期', DAJEN.dates.join('、')], ['50/50 期末', DAJEN.result5050], ['0050 期末', DAJEN.result0050]].map(([label, value]) => [h('dt', {}, label), h('dd', {}, value)])),
  h('h3', {}, '這份結果的限制'), h('ul', {}, DAJEN.limits.map(text => h('li', {}, text))),
  h('p', {}, h('a', { href: DAJEN.source.url, target: '_blank', rel: 'noopener noreferrer' }, DAJEN.source.name), '；',
    h('a', { href: 'trigger5050.html' }, '② 50/50 觸發提醒：算你自己的 →'))
];
document.getElementById('app').append(
  toolHeader(TOOLS.find(t => t.id === 'zr101')),
  h('section', { class: 'card article' }, h('h2', {}, '先看這張圖'),
    figure({ src: '../img/zr101/comic.webp', alt: FIGURE_TEXT.comic, caption: '先懂每天 2 倍，再選做法；要借錢之前先算追繳。' }),
    h('p', {}, '正二（例如 00631L）是每天追求大盤 2 倍漲跌的 ETF：漲的時候放大，跌的時候也放大。'),
    h('p', {}, '這頁從頭講一遍：正二是什麼、為什麼放久了不是整段 2 倍、常見的幾種用法，以及一份常被引用的 50/50 回測結果。每一節都接到可以算你自己數字的工具。')),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, ZR_SECTIONS.map(s => h('li', {}, h('a', { href: '#' + s.id }, s.title))), h('li', {}, h('a', { href: '#limits' }, '這頁的限制')))),
  ...ZR_SECTIONS.map(s => h('section', { class: 'card article', id: s.id }, h('h2', {}, s.title),
    s.id === 'dajen' ? h('p', { class: 'muted' }, h('strong', {}, '原作者回測，工具箱未重算')) : null,
    s.id === 'ways' ? figure({ src: '../img/zr101/map.webp', alt: FIGURE_TEXT.map, caption: '先看資金如何分配，再看何時配回與借款風險。' }) : null,
    h('p', {}, s.intro),
    s.blocks.map(b => [h('h3', {}, b.title), h('p', {}, b.text), b.tools.length ? links(b.tools) : null]),
    s.id === 'ways' ? ZR_WAYS.map(w => [h('h3', {}, w.name), h('p', {}, w.how), links(w.tools), w.id === 'periodic' ? periodic() : null]) : null,
    s.id === 'dajen' ? dajen() : null,
    s.id === 'start' ? h('ol', {}, ZR_STEPS.map(step => h('li', {}, step.text, links(step.tools)))) : null)),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'), ZR_LIMITS.map(text => h('p', {}, text))),
  references(ZR_REFS), disclaimer('general'));
