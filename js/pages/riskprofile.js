import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { INTRO, RR, BUCKET_GUIDE, WHY_MATCH, PROFILE_LIMITS, PROFILE_REFS } from '../data/riskprofile.js';

const tool = TOOLS.find(t => t.id === 'riskprofile');
const sections = [['rr', '商品也有分級'], ['buckets', '三桶各放什麼'], ['match', '為什麼屬性要對上商品'], ['limits', '這頁的限制']];

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先講結論'),
    INTRO.map(text => h('p', {}, text)),
    h('p', {}, h('a', { href: 'riskquiz.html' }, '先做測驗：㉖ 投資屬性測驗'))),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, sections.map(([id, title]) => h('li', {}, h('a', { href: '#' + id }, title))))),
  h('section', { class: 'card article', id: 'rr' }, h('h2', {}, RR.title),
    RR.lines.map(text => h('p', {}, text))),
  h('section', { class: 'card article', id: 'buckets' }, h('h2', {}, '三桶各放什麼、為什麼'),
    figure({ src: '../img/riskquiz/buckets.svg', alt: '三桶資金：保守穩健桶，例子為債券 ETF、定存股、00713、VT；成長桶，例子為 0050、QQQ、SPY；積極桶，例子為主動式 ETF、正2、個股。積極型 20／30／50，穩健型 50／30／20，示意主力桶占一半。', caption: '三桶依保守穩健、成長、積極排列。' }),
    BUCKET_GUIDE.map(bucket => [h('h3', {}, bucket.title), h('p', { class: 'muted' }, bucket.who), h('p', {}, bucket.why),
      bucket.items.map(item => h('details', { class: 'product' },
        h('summary', {}, h('strong', {}, item.name), ' ', item.what),
        h('dl', {}, h('dt', {}, '為什麼放這一桶'), h('dd', {}, item.why), h('dt', {}, '最壞跌過多少'), h('dd', {}, item.fall))))])),
  h('section', { class: 'card article', id: 'match' }, h('h2', {}, '為什麼屬性要對上商品'),
    WHY_MATCH.map(text => h('p', {}, text))),
  h('section', { class: 'card article', id: 'limits' }, h('h2', {}, '這頁的限制'),
    PROFILE_LIMITS.map(text => h('p', {}, text))),
  pathNav('riskprofile'),
  references(PROFILE_REFS), disclaimer('general'));
