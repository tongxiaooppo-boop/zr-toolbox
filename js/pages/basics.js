import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { BASIC_SECTIONS, BASIC_LIMITS, BASIC_REFS, FIGURE_TEXT } from '../data/basics.js';

const links = ids => h('p', { class: 'related' }, '接著算：', ids.map((id, i) => {
  const { no, title } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: id + '.html' }, no + ' ' + title)];
}));
const FIGS = {
  market: { src: '../img/basics/market.webp', alt: '買台股：證券戶用來下單、交割銀行戶買股扣款賣股入帳、集保帳戶存股票，箭頭相連。買海外股票：在同一家券商另外申請複委託戶，要簽風險預告和稅務文件。', caption: '買台股開三個戶頭；買美股要再開複委託。' },
  match: { src: '../img/basics/match.webp', alt: '排隊買股票：價格優先，出價高的排前面；時間優先，價格一樣先來的排前面。', caption: '想買到，價格要夠；價格一樣，就看誰先掛。' },
  company: { src: '../img/basics/company.webp', alt: '天平：一邊是市值大的公司，一邊是好幾家市值小的公司，大公司那邊比較重。', caption: '大盤漲跌，主要看大公司。' },
  settle: { src: '../img/basics/settle.webp', alt: '時間線：T 日成交、T+1、T+2 上午 10 點前交割帳戶要有錢；錢不夠＝違約交割。', caption: '成交後第 2 個營業日扣款。' }
};
const q = h('input', { type: 'search', placeholder: '輸入關鍵字，例如 交割、漲跌停', class: 'glossary-filter', 'aria-label': '篩選術語' });
const count = h('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
const sections = BASIC_SECTIONS.map(s => {
  const items = s.terms.map(t => ({
    search: [t.term, t.plain, t.example].join('\n').toLowerCase(),
    el: h('div', { class: 'basic-item', id: t.id }, h('h3', {}, t.term),
      h('p', {}, t.plain), h('p', { class: 'muted' }, t.example),
      h('p', { class: 'myth' }, h('strong', {}, '常見誤解：'), t.myth, ' ', h('strong', {}, '其實：'), t.fact),
      t.tools.length ? links(t.tools) : null)
  }));
  return { items, el: h('section', { class: 'card article', id: s.id }, h('h2', {}, s.title),
    s.id === 'order' ? figure({ src: '../img/basics/map.webp', alt: FIGURE_TEXT.map, caption: '送出前，先核對委託單上的四件事。' }) : null,
    FIGS[s.id] ? figure(FIGS[s.id]) : null,
    h('p', {}, s.intro), items.map(item => item.el)) };
});
function filter() {
  const query = q.value.trim().toLowerCase();
  let found = 0;
  for (const section of sections) {
    for (const item of section.items) {
      item.el.hidden = !item.search.includes(query);
      if (!item.el.hidden) found++;
    }
    section.el.hidden = section.items.every(item => item.el.hidden);
  }
  count.textContent = `符合 ${found} 個`;
}
const flashTimers = new Map();
function focusHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const item = sections.flatMap(s => s.items).find(item => item.el.id === id);
  const section = sections.find(s => s.el.id === id);
  if (!item && !section) return;
  q.value = '';
  filter();
  const el = item ? item.el : section.el;
  el.scrollIntoView({ block: 'start' });
  if (!item) return;
  el.classList.add('flash');
  clearTimeout(flashTimers.get(id));
  flashTimers.set(id, setTimeout(() => {
    el.classList.remove('flash');
    flashTimers.delete(id);
  }, 2000));
}
document.getElementById('app').append(
  toolHeader(TOOLS.find(t => t.id === 'basics')),
  h('section', { class: 'card article' }, h('h2', {}, '先看這張圖'),
    figure({ src: '../img/basics/comic.webp', alt: FIGURE_TEXT.comic, caption: '送出委託、成交、交割、進集保，是四件不同的事。' }),
    h('p', {}, '這頁收的是下單前最基本的詞：上市櫃、集保、交割、委託單、漲跌停、T+2……每個詞先講白話，再舉例、講常見誤解。'),
    h('p', {}, '這裡收下單、交割這類基本用詞；Beta、維持率、曝險這類正2 與槓桿用詞在 ', h('a', { href: 'glossary.html' }, '⑫ 術語辭典'), '。')),
  h('nav', { class: 'card article term-index', 'aria-label': '術語索引' }, h('h2', {}, '48 個詞，點了直接跳過去'),
    BASIC_SECTIONS.map(s => [h('h3', {}, h('a', { href: '#' + s.id }, s.title)),
      h('div', { class: 'shortcuts' }, s.terms.map(t => h('a', { href: '#' + t.id }, t.term)))]),
    h('p', {}, h('a', { href: '#limits' }, '這頁的限制'))),
  h('section', { class: 'card article' }, h('h2', {}, '或輸入關鍵字找'), q, count),
  ...sections.map(s => s.el),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'), BASIC_LIMITS.map(t => h('p', {}, t))),
  pathNav('basics'),
  references(BASIC_REFS), disclaimer('general'));
q.addEventListener('input', filter);
window.addEventListener('hashchange', focusHash);
filter();
focusHash();
