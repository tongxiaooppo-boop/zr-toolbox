import { h, toolHeader, figure, references, disclaimer } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { LOAN_GROUPS, LOANS, LOAN_MYTHS, LOAN_OPEN, LOAN_REFS, FIGURE_TEXT } from '../data/loans.js';

const tool = TOOLS.find(t => t.id === 'loans');
const sections = [['groups', '先分三類：押什麼借'], ['table', '常見 14 種比一比'], ['others', '比較少見的管道'], ['myths', '新手常見誤解'], ['open', '還查不清楚的地方'], ['tools', '接著算算看']];
const fields = [['who', '誰提供'], ['how', '怎麼借'], ['rate', '利率大約'], ['amount', '額度或成數'], ['term', '期限與還款'], ['call', '會不會追繳或斷頭'], ['worst', '最壞情況'], ['forStock', '能不能買股票'], ['tools', '對應工具']];
const toolLinks = ids => ids.map((id, i) => {
  const { no, title } = TOOLS.find(t => t.id === id);
  return [i ? '、' : '', h('a', { href: id + '.html' }, no + ' ' + title)];
});
const value = (row, key) => key === 'tools' ? toolLinks(row.tools) : row[key];
const main = LOAN_GROUPS.flatMap(g => LOANS.filter(r => r.main && r.group === g.id));

document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先看這張圖'),
    figure({ src: '../img/loans/comic.webp', alt: FIGURE_TEXT.comic, caption: '借錢之前先問：利息多少、會不會被追繳、最壞會怎樣。' }),
    h('p', {}, '借錢投資，賺的時候放大，賠的時候也放大，而且利息每個月都要付。'),
    h('p', {}, '這頁把台灣個人可以借錢的管道全部列出來：怎麼借、利息大約多少、會不會被追繳、最壞會怎樣。這不是借款建議，是讓你借之前先看清楚。')),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'),
    h('ol', {}, sections.map(([id, title]) => h('li', {}, h('a', { href: '#' + id }, title))))),
  h('section', { class: 'card article', id: 'groups' }, h('h2', {}, sections[0][1]),
    figure({ src: '../img/loans/map.webp', alt: FIGURE_TEXT.map, caption: '先分辨押什麼借，再看個別契約的追繳及還款條件。' }),
    LOAN_GROUPS.map(g => [h('h3', {}, g.title), h('p', {}, g.line)]),
    h('p', {}, '不會追繳，不代表不會虧：借來的錢買的股票跌了，虧損一樣是你的，錢一樣要還。')),
  h('section', { class: 'card article', id: 'table' }, h('h2', {}, sections[1][1]),
    h('p', { class: 'muted' }, '表格可以左右滑。'),
    h('div', { class: 'compare-wrap', tabindex: '0', role: 'region', 'aria-label': '常見借款管道比較，可左右捲動' },
      h('table', { class: 'loan-table' }, h('caption', {}, '常見 14 種借款與借股管道比較'),
        h('thead', {}, h('tr', {}, ['管道', ...fields.map(([, title]) => title)].map(t => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, main.map(r => h('tr', {},
          h('th', { scope: 'row' }, r.name, h('small', {}, LOAN_GROUPS.find(g => g.id === r.group).title)),
          fields.map(([key]) => h('td', {}, value(r, key)))))))),
    h('p', { class: 'muted' }, '列出的機構只是查得到公告的例子，不是推薦；利率會變，以各家最新公告為準。')),
  h('section', { class: 'card article', id: 'others' }, h('h2', {}, sections[2][1]),
    LOANS.filter(r => !r.main).map(r => h('details', { class: 'loan-more' },
      h('summary', {}, r.name),
      r.group === 'other' && ['pawn', 'private'].includes(r.id) ? h('small', {}, '（只當最壞例子，不建議）') : null,
      h('dl', {}, fields.map(([key, label]) => [h('dt', {}, label), h('dd', {}, value(r, key))]))))),
  h('section', { class: 'card article', id: 'myths' }, h('h2', {}, sections[3][1]),
    LOAN_MYTHS.map(m => h('p', { class: 'myth' }, h('strong', {}, '常見誤解：'), m.myth, ' ', h('strong', {}, '其實：'), m.fact))),
  h('section', { class: 'card article', id: 'open' }, h('h2', {}, sections[4][1]),
    h('p', {}, '下面這些是研究時查不到、或不同來源說法不一樣的地方，借之前要直接問銀行或券商。'),
    h('ul', {}, LOAN_OPEN.map(t => h('li', {}, t)))),
  h('section', { class: 'card article', id: 'tools' }, h('h2', {}, sections[5][1]),
    [['pledge', '押股票借錢，跌多少會被追繳'], ['margin', '融資融券的維持率與追繳價'], ['lifelev', '房貸、信貸、質押加起來，你其實開了幾倍槓桿']].map(([id, text]) =>
      h('p', {}, toolLinks([id]), '：', text))),
  references(LOAN_REFS), disclaimer('general'));
