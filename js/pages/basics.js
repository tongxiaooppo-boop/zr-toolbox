import { h, toolHeader, figure, references, disclaimer } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { BASIC_SECTIONS, BASIC_LIMITS, BASIC_REFS, FIGURE_TEXT } from '../data/basics.js';

const links = ids => h('p', { class: 'related' }, '接著算：', ids.map((id, i) => {
  const { no, title } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: id + '.html' }, no + ' ' + title)];
}));
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
    h('p', {}, 'Beta、維持率、殖利率這類計算機會用到的詞，在 ', h('a', { href: 'glossary.html' }, '⑫ 術語辭典'), '。')),
  h('nav', { class: 'card article term-index', 'aria-label': '術語索引' }, h('h2', {}, '48 個詞，點了直接跳過去'),
    BASIC_SECTIONS.map(s => [h('h3', {}, h('a', { href: '#' + s.id }, s.title)),
      h('div', { class: 'shortcuts' }, s.terms.map(t => h('a', { href: '#' + t.id }, t.term)))]),
    h('p', {}, h('a', { href: '#limits' }, '這頁的限制'))),
  h('section', { class: 'card article' }, h('h2', {}, '或輸入關鍵字找'), q, count),
  ...sections.map(s => s.el),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'), BASIC_LIMITS.map(t => h('p', {}, t))),
  references(BASIC_REFS), disclaimer('general'));
q.addEventListener('input', filter);
window.addEventListener('hashchange', focusHash);
filter();
focusHash();
