// 首頁：3 個常見問題捷徑＋依 GROUPS 分組的工具卡片。清單來自 js/data/tools.js，不在這裡寫死。
import { h, disclaimer } from '../ui/components.js';
import { TOOLS, GROUPS, SHORTCUTS } from '../data/tools.js';

const byId = Object.fromEntries(TOOLS.map(t => [t.id, t]));
const card = t => h('a', { class: 'tool-card' + (t.status === 'ready' ? '' : ' planned'), href: t.href, 'aria-disabled': t.status === 'ready' ? null : 'true' },
  h('strong', {}, h('span', { class: 'no' }, t.no), t.title),
  h('p', {}, t.oneLine));

document.getElementById('app').append(
  h('h1', { class: 'site-title' }, '正二與股市計算機工具箱'),
  h('p', { class: 'site-sub' }, '點一張卡片就能算；看不懂的詞，點旁邊的 ⓘ。'),
  h('nav', { class: 'shortcuts', 'aria-label': '常見問題' },
    SHORTCUTS.filter(s => byId[s.toolId].status === 'ready').map(s => h('a', { href: byId[s.toolId].href }, s.label))),
  ...GROUPS.map(g => h('section', { class: 'group' },
    h('h2', { class: 'group-title' }, g.title),
    h('div', { class: 'cards' }, TOOLS.filter(t => t.group === g.id).map(card)))),
  disclaimer('general'));
