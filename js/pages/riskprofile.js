import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { RESERVE, BUCKETS } from '../core/riskquiz.js';
import { INTRO, RR, BUCKET_GUIDE, WHY_MATCH, PROFILE_LIMITS, PROFILE_REFS } from '../data/riskprofile.js';

const tool = TOOLS.find(t => t.id === 'riskprofile');
const sections = [['rr', '商品也有分級'], ['buckets', '先留保守，再分三桶'], ['match', '為什麼屬性要對上商品'], ['limits', '這頁的限制']];

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先講結論'),
    INTRO.map(text => h('p', {}, text)),
    h('p', {}, h('a', { href: 'riskquiz.html' }, '先做測驗：㉖ 投資屬性測驗'))),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, sections.map(([id, title]) => h('li', {}, h('a', { href: '#' + id }, title))))),
  h('section', { class: 'card article', id: 'rr' }, h('h2', {}, RR.title),
    figure({ src: '../img/riskprofile/rr.webp', alt: 'RR1 到 RR5 的樓梯：貨幣市場、投資等級債、全球已開發國家股票、單一國家股票（例台灣 50）、新興市場股票與正2。', caption: 'RR 只看價格波動，不代表未來會怎樣。' }),
    RR.lines.map(text => h('p', {}, text))),
  h('section', { class: 'card article', id: 'buckets' }, h('h2', {}, '先留保守，再分三桶'),
    figure({ src: '../img/riskquiz/buckets.svg', alt: '先留保守（先留）：定存、貨幣市場基金。剩下分三桶：穩健桶（債券 ETF、股債配置、高股息）、成長桶（0050、0056、S&P 500）、積極桶（正2、主動式 ETF、個股）。積極型 20／30／50，穩健型 50／30／20。', caption: '先留保守的錢，剩下的依穩健、成長、積極分三桶。' }),
    BUCKET_GUIDE.map(bucket => [h('h3', {}, bucket.title), h('p', { class: 'muted' }, bucket.who), h('p', {}, bucket.why),
      h('ul', {}, (bucket.key === 'reserve' ? RESERVE : BUCKETS.find(b => b.key === bucket.key)).examples.map(e => h('li', {}, h('strong', {}, e.name), ' ', e.note)))])),
  h('section', { class: 'card article', id: 'match' }, h('h2', {}, '為什麼屬性要對上商品'),
    figure({ src: '../img/riskprofile/match.webp', alt: '小安穿著太大的鞋（超過自己能承受的商品）在下坡快跌倒，老師說對不上最常見的是跌到最低點時撐不住、賣掉。', caption: '先做測驗，再挑合腳的商品。' }),
    WHY_MATCH.map(text => h('p', {}, text))),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'),
    PROFILE_LIMITS.map(text => h('p', {}, text))),
  pathNav('riskprofile'),
  references(PROFILE_REFS), disclaimer('general'));
