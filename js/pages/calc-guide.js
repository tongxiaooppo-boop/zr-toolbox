import { h, toolHeader, infoChip, figure, disclaimer } from '../ui/components.js';
import { ONLINE_URL, GUIDE_SECTIONS, DIFFERENCES, TOKEN_GUIDE } from '../data/calcGuide.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'calc-guide');
const app = document.getElementById('app');

app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    h('p', {}, '這頁一格一格說明朋友在用的「正二平衡計算器」。看完可以到原頁操作，也可以用工具箱的 ⑪ 算同一件事。'),
    h('a', { class: 'button-link', href: ONLINE_URL, target: '_blank', rel: 'noopener' }, '打開原計算器 ↗'),
    figure({ src: '../img/calc-guide/map.svg', alt: '原計算器四個區塊對應 ⑪：持股對股票市值（各檔加總）、正二 ETF 對正二市值、現金與負債對現金與借款、目標對目標倍數與倍數怎麼算。兩邊都按範例：股票 1,000 萬、現金 200 萬、負債 300 萬、目標 1.4，淨資產 900 萬，需買進正二 NT$ 1,300,000。', caption: '原計算器的每一區，都能在 ⑪ 找到對應的格子。' }),
    h('nav', { class: 'guide-toc' },
      GUIDE_SECTIONS.map(s => h('a', { href: `#${s.id}` }, s.title)),
      h('a', { href: '#differences' }, '和 ⑪ 不一樣的地方'),
      h('a', { href: '#token' }, 'FinMind token 怎麼申請'))),
  ...GUIDE_SECTIONS.map(s => h('section', { class: 'card', id: s.id },
    h('h2', {}, s.title),
    h('p', {}, s.intro),
    s.fields.map(f => h('div', { class: 'field guide-field' },
      h('h3', {}, f.name, f.termId ? infoChip(f.termId) : null),
      h('p', {}, f.what),
      f.tip ? h('p', { class: 'tip' }, f.tip) : null,
      f.toolbox ? h('p', { class: 'map' }, '⑪ 對應：', f.toolbox) : null)))),
  h('section', { class: 'card', id: 'differences' },
    h('h2', {}, '和 ⑪ 不一樣的地方'),
    h('ul', {}, DIFFERENCES.map(d => h('li', {}, d))),
    h('p', {}, h('a', { href: 'exposure.html' }, '打開 ⑪ 我現在等於幾倍大盤'))),
  h('section', { class: 'card', id: 'token' },
    h('div', { class: 'field' },
      h('h2', {}, 'FinMind token 怎麼申請', infoChip('finmind-token'))),
    h('p', {}, TOKEN_GUIDE.why),
    h('p', {}, TOKEN_GUIDE.limit),
    h('ol', {}, TOKEN_GUIDE.steps.map(s => h('li', {}, s))),
    h('h3', {}, '看到錯誤怎麼辦'),
    TOKEN_GUIDE.errors.map(e => h('div', { class: 'guide-field' },
      h('p', {}, h('strong', {}, e.sign)),
      h('p', {}, e.meaning),
      h('p', { class: 'tip' }, e.todo))),
    h('h3', {}, '保密'),
    h('p', {}, TOKEN_GUIDE.privacy)),
  disclaimer('executable'));

if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
