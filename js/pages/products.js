import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { LEVELS, PRODUCTS, WAYS, PRODUCT_LIMITS, PRODUCT_REFS, FIGURE_TEXT } from '../data/products.js';

const tool = TOOLS.find(t => t.id === 'products');
const sections = [['ways', '錢是怎麼賺來的'], ['levels', '新手從哪裡開始'], ['limits', '這頁的限制']];
const LEVEL_FIGS = {
  careful: { src: '../img/products/careful.webp', alt: '買之前先答三題：它怎麼運作？交割和費用怎麼算？最壞會虧多少？答不出來，就先別買。', caption: '答不出來，就先別買。' },
  no: { src: '../img/products/no.webp', alt: '四個警示牌：有到期日、有槓桿、要借錢、規則很複雜；有些虧損會比保證金還多。', caption: '看到這些先停下來。' }
};
const links = ids => h('p', { class: 'related' }, '接著算：', ids.map((id, i) => {
  const { no, title } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: id + '.html' }, no + ' ' + title)];
}));

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先看這張圖'),
    figure({ src: '../img/products/comic.webp', alt: FIGURE_TEXT.comic, caption: '每種賺法都有對應的虧法。' }),
    h('p', {}, '同樣是『投資』，賺錢的方式不一樣，虧錢的方式也不一樣。'),
    h('p', {}, '這頁先講錢從哪裡來（價差、股利、利息……），再把個人買得到的商品照難度分三層：每一種都講清楚怎麼買、怎麼賺、最壞會怎樣。')),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, sections.map(([id, title]) => h('li', {}, h('a', { href: '#' + id }, title))))),
  h('section', { class: 'card article', id: 'ways' }, h('h2', {}, sections[0][1]),
    WAYS.map(w => [h('h3', {}, w.name), h('p', {}, w.plain), h('p', { class: 'muted' }, '哪些商品有：', w.products, ' 要注意：', w.cost)])),
  h('section', { class: 'card article', id: 'levels' }, h('h2', {}, sections[1][1]),
    figure({ src: '../img/products/map.webp', alt: FIGURE_TEXT.map, caption: '按複雜度和最壞損失分層，不是主管機關評等。' }),
    LEVELS.map(level => [h('h3', {}, level.title), LEVEL_FIGS[level.id] ? figure(LEVEL_FIGS[level.id]) : null, h('p', {}, level.line),
      PRODUCTS.filter(p => p.level === level.id).map(p => h('details', { class: 'product' },
        h('summary', {}, h('strong', {}, p.name), ' ', p.plain),
        h('dl', {}, [['how', '怎麼買'], ['earn', '怎麼賺'], ['lose', '怎麼虧（最壞）'], ['cost', '成本與稅']].map(([key, title]) => [h('dt', {}, title), h('dd', {}, p[key])])),
        p.tools.length ? links(p.tools) : null))])),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, sections[2][1]),
    PRODUCT_LIMITS.map(t => h('p', {}, t)),
    h('p', { class: 'muted' }, '列出的機構只是查得到公告的例子，不是推薦；利率會變，看各家最新公告。')),
  pathNav('products'),
  references(PRODUCT_REFS), disclaimer('general'));
