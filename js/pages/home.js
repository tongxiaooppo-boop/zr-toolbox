// 首頁：3 個常見問題捷徑＋依 GROUPS 分組的工具卡片。清單來自 js/data/tools.js，不在這裡寫死。
import { h, disclaimer } from '../ui/components.js';
import { TOOLS, GROUPS, ZR_SUBS, SHORTCUTS, PATH } from '../data/tools.js';

const SLOGANS = ['持續投資', '感謝過去的自己', '日富一日，年富一年', '時間是長期投資人的朋友', '慢慢來，比較快'];

const byId = Object.fromEntries(TOOLS.map(t => [t.id, t]));
const card = t => h('a', { class: 'tool-card' + (t.status === 'ready' ? '' : ' planned'), href: t.href, 'aria-disabled': t.status === 'ready' ? null : 'true' },
  h('strong', {}, t.title),
  h('p', {}, t.oneLine));

const toolLinks = ids => {
  const ready = ids.map(id => byId[id]).filter(t => t && t.status === 'ready');
  return ready.length ? ready.map((t, i) => [i ? '、' : '', h('a', { href: t.href }, `${t.no} ${t.title}`)]) : '製作中';
};

// 新手路線：一列按鈕，按一顆展開那一步（同時只開一步，預設全收）
const stepPanel = h('div', { class: 'path-panel', 'aria-live': 'polite' });
const stepBtns = PATH.map(step => h('button', { type: 'button', class: 'secondary', 'aria-pressed': 'false', onclick: () => {
  const open = stepBtns[step.step - 1].getAttribute('aria-pressed') === 'true';
  stepBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
  if (open) { stepPanel.replaceChildren(); return; }
  stepBtns[step.step - 1].setAttribute('aria-pressed', 'true');
  stepPanel.replaceChildren(h('strong', {}, `第 ${step.step} 步 ${step.title}`), h('span', { class: 'muted' }, step.question), h('div', {}, toolLinks(step.ids)));
} }, `第 ${step.step} 步 ${step.title}`));

const cardsOf = pred => h('div', { class: 'cards' }, TOOLS.filter(pred).map(card));
const groupEl = g => {
  const n = TOOLS.filter(t => t.group === g.id).length;
  const body = g.id === 'zr'
    ? [h('nav', { class: 'shortcuts', 'aria-label': '常見問題' },
        SHORTCUTS.filter(s => byId[s.toolId].status === 'ready').map(s => h('a', { href: byId[s.toolId].href }, s.label))),
      ZR_SUBS.map(sub => [h('h3', {}, sub.title), cardsOf(t => t.group === 'zr' && t.sub === sub.id)])]
    : [cardsOf(t => t.group === g.id)];
  return h('details', { class: 'group', id: g.id },
    h('summary', {}, `${g.title}（${n} 個）`, h('small', { class: 'group-line' }, g.line)),
    body);
};

const openFromHash = () => {
  const el = document.getElementById(location.hash.slice(1));
  if (el && el.matches('details.group')) { el.open = true; el.scrollIntoView?.({ block: 'start' }); }
};

document.getElementById('app').append(
  h('h1', { class: 'site-title' }, '股票兩三件事'),
  h('p', { class: 'slogan' }, SLOGANS[new Date().getDate() % SLOGANS.length]),
  h('p', { class: 'site-sub' }, '點一張卡片就能算；看不懂的詞，點旁邊的 ⓘ。'),
  h('figure', { class: 'hero hero-small' },
    h('img', { src: 'img/home/hero.webp', alt: '年輕的小安持續存入硬幣，沿著樹木成長的小路，走到年老時在樹下悠閒泡茶的生活。', width: 1536, height: 1024 }),
    h('figcaption', {}, '長期、分散、量力而為；投資有賺有賠，過去不代表未來。')),
  h('section', { class: 'card path', id: 'path' },
    h('h2', {}, '新手路線：照順序看'),
    h('p', { class: 'muted' }, '不知道從哪開始？按「第 1 步」往下走。'),
    h('div', { class: 'path-steps' }, stepBtns),
    stepPanel),
  h('h2', { class: 'group-title' }, '入門三件事'),
  ...GROUPS.map(groupEl),
  disclaimer('general'));

window.addEventListener('hashchange', openFromHash);
openFromHash();
