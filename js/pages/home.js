// 首頁：3 個常見問題捷徑＋依 GROUPS 分組的工具卡片。清單來自 js/data/tools.js，不在這裡寫死。
import { h, disclaimer } from '../ui/components.js';
import { TOOLS, GROUPS, SHORTCUTS } from '../data/tools.js';

const SLOGANS = ['持續投資', '感謝過去的自己', '日富一日，年富一年', '時間是長期投資人的朋友', '慢慢來，比較快'];

const byId = Object.fromEntries(TOOLS.map(t => [t.id, t]));
const card = t => h('a', { class: 'tool-card' + (t.status === 'ready' ? '' : ' planned'), href: t.href, 'aria-disabled': t.status === 'ready' ? null : 'true' },
  h('strong', {}, t.title),
  h('p', {}, t.oneLine));

document.getElementById('app').append(
  h('h1', { class: 'site-title' }, '正2工具箱與股市學堂'),
  h('p', { class: 'slogan' }, SLOGANS[new Date().getDate() % SLOGANS.length]),
  h('p', { class: 'site-sub' }, '點一張卡片就能算；看不懂的詞，點旁邊的 ⓘ。'),
  h('figure', { class: 'hero' },
    h('img', { src: 'img/home/hero.webp', alt: '年輕的小安持續存入硬幣，沿著樹木成長的小路，走到年老時在樹下悠閒泡茶的生活。', width: 1536, height: 1024 }),
    h('figcaption', {}, '長期、分散、量力而為；投資有賺有賠，過去不代表未來。')),
  h('nav', { class: 'shortcuts', 'aria-label': '常見問題' },
    SHORTCUTS.filter(s => byId[s.toolId].status === 'ready').map(s => h('a', { href: byId[s.toolId].href }, s.label))),
  ...GROUPS.map(g => h('section', { class: 'group' },
    h('h2', { class: 'group-title' }, g.title),
    h('div', { class: 'cards' }, TOOLS.filter(t => t.group === g.id).map(card)))),
  disclaimer('general'));
