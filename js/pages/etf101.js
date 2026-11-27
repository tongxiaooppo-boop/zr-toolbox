import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { ETF_SECTIONS, ETF_LIMITS, ETF_REFS, FIGURE_TEXT } from '../data/etf101.js';

const tool = TOOLS.find(t => t.id === 'etf101');
const FIGS = {
  trade: { src: '../img/etf101/split.webp', alt: '分割前披薩切少少幾片，分割後同樣大小切很多小片，總價值不變。', caption: '不是賺了，也不是賠了，只是切得比較細。' },
  leveraged: { src: '../img/decay/two-days.svg', alt: '兩天一漲一跌，大盤和正二各自剩多少（取自 ⑥ 正二不是兩倍）。', caption: '每天 2 倍，不等於整段 2 倍。' },
  borrow: { src: '../img/loans/call.webp', alt: '三格漫畫：股價下跌、跌破追繳線要補錢、沒補股票會被賣掉（斷頭）。', caption: '押股票借錢，要先知道追繳線在哪。' },
  cost: { src: '../img/etf101/cost.webp', alt: 'ETF 籃子底下的水龍頭滴出硬幣，寫著經理費、保管費（內扣）。', caption: '不會另外寄帳單，淨值已經扣過了。' },
  dividend: { src: '../img/etf101/dividend.webp', alt: '除息前籃子滿滿，除息後籃子少一點、手上多一袋硬幣。', caption: '領到現金，基金的價值也少了同樣的金額。' }
};
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
    FIGS[s.id] ? figure(FIGS[s.id]) : null,
    h('p', {}, s.intro),
    s.topics.map(t => [h('h3', {}, t.title), h('p', {}, t.text),
      h('p', { class: 'myth' }, h('strong', {}, '常見誤解：'), t.myth, ' ', h('strong', {}, '其實：'), t.fact),
      t.tools.length ? links(t.tools) : null]),
    s.id === 'leveraged' ? h('p', {}, h('a', { href: 'zr101.html' }, '㉔ 正二教學：從頭帶你走一遍 →')) : null,
    s.id === 'borrow' ? h('p', {}, h('a', { href: 'loans.html' }, '㉑ 借錢投資的管道：全部管道一次比 →')) : null)),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'),
    ETF_LIMITS.map(t => h('p', {}, t)),
    h('p', { class: 'muted' }, '列出的機構只是查得到公告的例子，不是推薦；利率會變，看各家最新公告。')),
  pathNav('etf101'),
  references(ETF_REFS), disclaimer('general'));
