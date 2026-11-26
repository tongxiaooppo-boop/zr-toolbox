import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { CRASH_INTRO, CRASHES, ZR_LESSON, MINDSET, CHECKLIST, CRASH_LIMITS, CRASH_REFS } from '../data/crash.js';

const tool = TOOLS.find(t => t.id === 'crash');
const sections = [['history', '台股跌過幾次大的'], ['zr', '正2 跌得比大盤深'], ['mind', '跌的時候腦袋會怎樣'], ['check', '跌的時候先檢查這 10 件事'], ['limits', '這頁的限制']];
const fields = [['period', '期間'], ['tw', '台股跌幅'], ['us', '美股跌幅'], ['recover', '台股多久回前高'], ['zr', '正2 當時'], ['cause', '起因'], ['lesson', '教訓']];

const toolLinks = ids => ids.map((id, i) => {
  const { no, title, href } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: href.replace(/^tools\//, '') }, no + ' ' + title)];
});
const bar = (label, pct, cls) => h('div', { class: 'crash-bar' },
  h('span', { class: 'crash-bar-label' }, label),
  h('span', { class: 'crash-bar-track' }, h('span', { class: 'crash-bar-fill ' + cls, style: `width:${pct}%` })),
  h('span', { class: 'crash-bar-val' }, '−' + pct + '%'));
const barRows = CRASHES.filter(c => c.twPct != null && c.zrPct != null);

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先講結論'), CRASH_INTRO.map(text => h('p', {}, text))),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, sections.map(([id, title]) => h('li', {}, h('a', { href: '#' + id }, title))))),
  h('section', { class: 'card article', id: 'history' }, h('h2', {}, '台股跌過幾次大的'),
    figure({ src: '../img/crash/curve.svg', alt: '示意曲線：大盤和正2 從同一個高點一起下跌，正2 跌得更深，之後兩條線慢慢回升，正2 回到前高比較慢。', caption: '示意圖，不是實際走勢。' }),
    h('p', { class: 'muted' }, '電腦上表格可以左右滑，手機上每次股災是一張卡。跌幅是從高點收盤算到低點收盤，用當時的名目價格。'),
    h('div', { class: 'compare-wrap', tabindex: '0', role: 'region', 'aria-label': '歷次股災比較，可左右捲動' },
      h('table', { class: 'card-table' }, h('caption', {}, '歷次股災：台股、美股、正2 的跌幅與恢復時間'),
        h('thead', {}, h('tr', {}, ['事件', ...fields.map(([, title]) => title)].map(t => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, CRASHES.map(c => h('tr', {},
          h('th', { scope: 'row' }, c.name),
          fields.map(([key, title]) => h('td', { 'data-label': title }, c[key])))))))),
  h('section', { class: 'card article', id: 'zr' }, h('h2', {}, '正2 跌得比大盤深'),
    figure({ src: '../img/crash/zr.webp', alt: '大盤和正2 兩條溜滑梯，正2 那條更陡更深；老師說正2 每天追 2 倍，連跌時跌更深，回來也要更久。', caption: '先確定自己撐得住，再決定放多少。' }),
    h('p', { class: 'muted' }, '下面只放台股和正2 兩邊都有資料的幾次。條越長，跌得越多。'),
    barRows.map(c => h('div', { class: 'crash-group' }, h('h3', {}, c.name),
      bar('台股', c.twPct, 'tw'), bar('正2', c.zrPct, 'zr'))),
    ZR_LESSON.map(text => h('p', {}, text)),
    h('p', {}, h('a', { href: 'drawdown.html' }, '⑧ 跌多少要漲多少才回本'), '、', h('a', { href: 'decay.html' }, '⑥ 正二不是兩倍'), '、', h('a', { href: 'recover.html' }, '㉕ 正2 虧了，要漲多少才回本'))),
  h('section', { class: 'card article', id: 'mind' }, h('h2', {}, '跌的時候腦袋會怎樣'),
    figure({ src: '../img/crash/mind.webp', alt: '三格漫畫：新聞一直喊崩盤、好想全部賣掉、老師拉住說照當初的計畫做。', caption: '想逃很正常，先停一下。' }),
    MINDSET.map(m => h('details', { class: 'product' },
      h('summary', {}, h('strong', {}, m.name), ' ', m.what),
      h('dl', {}, h('dt', {}, '股災時常見的樣子'), h('dd', {}, m.example),
        h('dt', {}, '可以怎麼做'), h('dd', {}, m.action),
        m.tools.length ? [h('dt', {}, '相關工具'), h('dd', {}, toolLinks(m.tools))] : null)))),
  h('section', { class: 'card article', id: 'check' }, h('h2', {}, '跌的時候先檢查這 10 件事'),
    figure({ src: '../img/crash/check.webp', alt: '小安拿清單檢查：整體幾倍槓桿、會不會被追繳、生活費夠撐幾個月、這筆錢幾年內會用到。', caption: '這 4 件先看，其他在下面清單。' }),
    h('ol', {}, CHECKLIST.map(k => h('li', {}, h('strong', {}, k.item), '：', k.why,
      k.tools.length ? [' （', toolLinks(k.tools), '）'] : null)))),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'),
    CRASH_LIMITS.map(text => h('p', {}, text))),
  pathNav('crash'),
  references(CRASH_REFS), disclaimer('general'));
