import { h, toolHeader, figure, references, disclaimer } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { ETF_SECTIONS, ETF_LIMITS, ETF_REFS, FIGURE_TEXT } from '../data/etf101.js';

const tool = TOOLS.find(t => t.id === 'etf101');
const links = ids => h('p', { class: 'related' }, '接著算：', ids.map((id, i) => {
  const { no, title } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: id + '.html' }, no + ' ' + title)];
}));

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先看這張圖'),
    figure({ src: '../img/etf101/comic.webp', alt: FIGURE_TEXT.comic, caption: '一份 ETF＝一籃子股票的一小份，但還是會跌。' }),
    h('p', {}, 'ETF 是在證券交易所買賣的基金：一份 ETF 裡面裝著一籃子股票或債券，買一份就等於買下整籃的一小份。'),
    h('p', {}, '這頁把新手最常搞錯的地方整理成六節。每一點先講白話，再講常見誤解；正二的部分也在這裡。')),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, ETF_SECTIONS.map(s => h('li', {}, h('a', { href: '#' + s.id }, s.title))),
      h('li', {}, h('a', { href: '#limits' }, '這頁的限制')))),
  ...ETF_SECTIONS.map(s => h('section', { class: 'card article', id: s.id }, h('h2', {}, s.title),
    s.id === 'what' ? figure({ src: '../img/etf101/map.webp', alt: FIGURE_TEXT.map, caption: '先看籃子裡裝什麼，再看它怎麼運作。' }) : null,
    h('p', {}, s.intro),
    s.topics.map(t => [h('h3', {}, t.title), h('p', {}, t.text),
      h('p', { class: 'myth' }, h('strong', {}, '常見誤解：'), t.myth, ' ', h('strong', {}, '其實：'), t.fact),
      t.tools.length ? links(t.tools) : null]),
    s.id === 'borrow' ? h('p', {}, h('a', { href: 'loans.html' }, '㉑ 借錢投資的管道：全部管道一次比 →')) : null)),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'),
    ETF_LIMITS.map(t => h('p', {}, t)),
    h('p', { class: 'muted' }, '列出的機構只是查得到公告的例子，不是推薦；利率會變，以各家最新公告為準。')),
  references(ETF_REFS), disclaimer('general'));
