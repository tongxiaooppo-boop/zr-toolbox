import { h, toolHeader, termCard, figure, disclaimer } from '../ui/components.js';
import { GLOSSARY } from '../data/glossary.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'glossary');
const q = h('input', { id: 'q', type: 'search', placeholder: '輸入關鍵字，例如 維持率、Beta', autocomplete: 'off', 'aria-label': '篩選術語', class: 'glossary-filter' });
const count = h('p', { class: 'muted', id: 'q-count' });
const items = GLOSSARY.map(t => ({
  el: h('div', { class: 'glossary-item', id: t.id }, termCard(t.id)),
  search: [t.term, ...t.aka, t.plain, t.detail].join('\n').toLowerCase()
}));

function filter() {
  const query = q.value.trim().toLowerCase();
  let found = 0;
  for (const item of items) {
    item.el.hidden = !item.search.includes(query);
    if (!item.el.hidden) found++;
  }
  count.textContent = !found ? '找不到，換個關鍵字試試。' : query ? `找到 ${found} 個` : `共 ${found} 個詞`;
}

const flashTimers = new Map();
function focusHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const item = items.find(item => item.el.id === id);
  if (!item) return;
  q.value = '';
  filter();
  item.el.scrollIntoView({ block: 'start' });
  item.el.classList.add('flash');
  clearTimeout(flashTimers.get(id));
  flashTimers.set(id, setTimeout(() => {
    item.el.classList.remove('flash');
    flashTimers.delete(id);
  }, 2000));
}

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card' }, h('h2', {}, '先看這張圖'),
    figure({ src: '../img/glossary/exposure-basis.svg', alt: '同一個例子算出淨資產、曝險、兩種口徑與資產槓桿：持股 1,000 萬、現金 200 萬、借款 300 萬，淨資產 900 萬，淨資產口徑約 1.11 倍、總資產口徑約 0.83 倍、資產槓桿約 1.33 倍。', caption: '同一個人，換個分母，倍數就不一樣。' }),
    h('p', {}, '下面每個詞都先給一句白話，再補一個數字例子。在其他工具按 ⓘ 也會看到同一張小卡。')),
  h('section', { class: 'card' }, q, count),
  h('section', { class: 'card' }, items.map(item => item.el)),
  disclaimer('general'));
q.addEventListener('input', filter);
window.addEventListener('hashchange', focusHash);
filter();
focusHash();
