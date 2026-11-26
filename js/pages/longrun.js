import { h, toolHeader, figure, disclaimer, lineChart } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { LONGRUN } from '../data/longrun.js';
import { fmtMoney, fmtPct } from '../core/format.js';

const L = LONGRUN;
const ALT = '示意折線：從「投入」起點往上到「最高點」，再往下到「現在」。最高點到現在之間的向下箭頭標「回吐」，起點到現在之間標「報酬」。';
const SHORT = { allin: '全押', dajen: '大仁', q5050: '季配', q532: '532', h0050: '0050' };
const md = d => d.slice(5, 7) + '/' + d.slice(8, 10);
const signPct = n => (n >= 0 ? '+' : '−') + fmtPct(Math.abs(n));
const absPct = n => '−' + fmtPct(Math.abs(n));
const wrap = (label, table) => h('div', { class: 'compare-wrap', tabindex: '0', role: 'region', 'aria-label': label }, table);
const th = text => h('th', { scope: 'col' }, text);
const COLS = ['現在', '總報酬', '年化報酬', '最高曾到（日期）', '最大回撤（日期）', '買賣次數'];
const cell = (i, text) => h('td', { 'data-label': COLS[i] }, text);

const S = L.lump.series;
const ids = S.map(s => s.id);
const yearsMeta = L.lump.years;
const yearLabel = year => {
  const y = yearsMeta.find(m => m.year === year);
  // 不滿一年的寫成兩行：年份＋小字起訖，手機窄欄才不會被拆字
  if (y && y.partial && y === yearsMeta[0]) return [String(year), h('small', { class: 'yc-part' }, md(y.from) + ' 起')];
  if (y && y.partial) return [String(year), h('small', { class: 'yc-part' }, '到 ' + md(y.to))];
  return String(year);
};

// 圖用的 x 刻度：每年第一個交易日，只顯示偶數年
const xTicks = [];
L.lump.dates.forEach((d, i) => {
  const yr = Number(d.slice(0, 4));
  const first = i === 0 || yr !== Number(L.lump.dates[i - 1].slice(0, 4));
  if (first && yr % 2 === 0) xTicks.push({ index: i, text: String(yr) });
});

// ---- 上市那天投入 ----
const checked = new Set(ids);
let logScale = true;
const chartHolder = h('div', {});
const chartLabel = '正2 四種做法與 0050 長抱，從上市那天投入 100 萬到現在的每日資產變化（單位：萬元）';
function drawChart() {
  const list = S.map((s, k) => ({ s, k })).filter(({ s }) => checked.has(s.id));
  chartHolder.replaceChildren(lineChart({
    series: list.map(({ s, k }) => ({ name: `${s.name} ${Math.round(s.final / 1e4).toLocaleString('en-US')} 萬`, values: s.values.map(v => v / 1e4), color: k })),
    label: chartLabel, yFormat: v => v.toFixed(0) + ' 萬', baseline: L.startMoney / 1e4, xTicks, log: logScale, height: 280,
  }));
}
const boxes = S.map(s => h('label', {},
  h('input', { type: 'checkbox', checked: true, onchange: e => {
    if (e.target.checked) checked.add(s.id); else checked.delete(s.id);
    if (checked.size === 0) { checked.add(s.id); e.target.checked = true; }
    drawChart();
  } }), h('span', {}, s.name)));
const scaleRadio = (text, isLog) => h('label', {},
  h('input', { type: 'radio', name: 'scale', checked: isLog === logScale, onchange: () => { logScale = isLog; drawChart(); } }),
  h('span', {}, text));
drawChart();

const best = S.reduce((a, s) => (s.ret > a.ret ? s : a));
const five = S.filter(s => ['dajen', 'q5050', 'q532'].includes(s.id));
let closest = [five[0], five[1]];
let gap = Infinity;
for (let i = 0; i < five.length; i++) for (let j = i + 1; j < five.length; j++) {
  const g = Math.abs(five[i].cagr - five[j].cagr);
  if (g < gap) { gap = g; closest = [five[i], five[j]]; }
}

// 每年報酬表：每列最高加粗
const retRow = (head, rets) => {
  const mx = Math.max(...rets);
  return h('tr', {}, h('th', { scope: 'row' }, head), rets.map(r => h('td', {}, r === mx ? h('strong', {}, signPct(r)) : signPct(r))));
};
const legendText = S.map(s => SHORT[s.id] + '＝' + s.name).join('；') + '。';

// ---- 每年年初投入 ----
const get = (y, id) => y.series.find(s => s.id === id);
const winRow = h('tr', {}, h('th', { scope: 'row' }, '贏 0050 的年數'),
  ids.map(id => h('td', {}, id === 'h0050' ? '—'
    : `${L.yearly.filter(y => get(y, id).ret > get(y, 'h0050').ret).length}／${L.yearly.length}`)));
const splitText = Object.entries(L.splits).map(([code, m]) =>
  Object.entries(m).map(([d, n]) => `${code} 在 ${d} 1 拆 ${n}`).join('、')).join('、');

document.getElementById('app').append(
  toolHeader(TOOLS.find(t => t.id === 'longrun')),
  h('section', { class: 'card article' }, h('h2', {}, '這頁在算什麼'),
    figure({ src: '../img/yearcheck/giveback.svg', alt: ALT, caption: '最高點不等於賺到的錢；回吐是從最高點掉回來多少。' }),
    h('p', {}, `正2 用 00675L 富邦臺灣加權正2，它從 ${L.start} 上市到現在沒有分割過，可以一路算到 ${L.asOf}（共 ${L.tradingDays} 個交易日）。比較正2 四種做法和 0050 長抱，兩種算法都有：上市那天投入一筆，和每年年初各投入一筆。`),
    h('ul', {},
      h('li', {}, '手續費 0.1425%、ETF 賣出證交稅 0.1% 都算進去。'),
      h('li', {}, '股數取整數。'),
      h('li', {}, '現金不算利息。'),
      h('li', {}, '0050 長抱的配息當天買回 0050；其他做法的配息先放現金，每季配回時一起調。'),
      h('li', {}, `${splitText}，股數已經換算。`)),
    h('p', {}, h('a', { href: '#lump' }, '上市那天投入 100 萬 ↓'), '　', h('a', { href: '#yearly' }, '每年年初投入 100 萬 ↓')),
    h('p', { class: 'muted' }, `每月底更新一次。資料來源：${L.source}`)),
  h('section', { class: 'card', id: 'lump' }, h('h2', {}, '上市那天投入 100 萬，放到現在'),
    h('fieldset', { class: 'choices' }, h('legend', {}, '顯示哪幾種做法'), boxes),
    h('fieldset', { class: 'choices' }, h('legend', {}, '刻度'), scaleRadio('等比刻度（看漲跌幅）', true), scaleRadio('一般刻度（看金額）', false)),
    chartHolder,
    h('p', { class: 'muted' }, '等比刻度下，同樣漲一倍的高度一樣，比較看得出前幾年的起伏。'),
    h('h3', {}, '到現在的成績'),
    wrap('到現在的成績表', h('table', { class: 'yc-table yc-stack' }, h('caption', {}, `${L.start} 投入 100 萬，到 ${L.asOf} 的結果`),
      h('thead', {}, h('tr', {}, ['做法', ...COLS].map(th))),
      h('tbody', {}, S.map(s => h('tr', { class: s === best ? 'yc-best' : null },
        h('th', { scope: 'row' }, s.name),
        cell(0, fmtMoney(s.final)), cell(1, signPct(s.ret)), cell(2, signPct(s.cagr)),
        cell(3, `${fmtMoney(s.peak)}（${s.peakDate}）`), cell(4, `${absPct(s.mdd)}（${s.mddDate}）`),
        cell(5, s.trades === 0 ? '不動' : s.trades)))))),
    h('p', {}, `正2 三種五五類做法裡，年化最接近的兩種是 ${closest[0].name} 和 ${closest[1].name}，只差 ${(gap * 100).toFixed(1)} 個百分點。`),
    h('h3', {}, '每年報酬'),
    wrap('每年報酬表', h('table', { class: 'yc-table yc-month' }, h('caption', {}, '上市那天投入後，各做法每一年的報酬'),
      h('thead', {}, h('tr', {}, th('年'), S.map(s => th(SHORT[s.id])))),
      h('tbody', {}, yearsMeta.map((y, i) => retRow(yearLabel(y.year), S.map(s => s.years[i])))))),
    h('p', { class: 'muted yc-legend' }, legendText)),
  h('section', { class: 'card', id: 'yearly' }, h('h2', {}, '每年年初投入 100 萬，到年底變多少'),
    h('p', {}, `每一年第一個交易日各拿一筆新的 100 萬，照同一種做法放到那年最後一個交易日；每年分開算，大仁的基準每年重新開始。第一年從上市日開始，今年算到 ${L.asOf}。`),
    wrap('每年年初投入的報酬表', h('table', { class: 'yc-table yc-month' }, h('caption', {}, '每年年初投入 100 萬，到年底的報酬'),
      h('thead', {}, h('tr', {}, th('年'), S.map(s => th(SHORT[s.id])))),
      h('tbody', {}, L.yearly.map(y => retRow(yearLabel(y.year), ids.map(id => get(y, id).ret))), winRow))),
    h('p', { class: 'muted yc-legend' }, legendText)),
  h('section', { class: 'card article' }, h('h2', {}, '怎麼讀'),
    h('p', {}, '全押正2 終點最高，但中間最大回撤也最深，要撐得住才拿得到。'),
    h('p', {}, '五五類做法用一半現金換來比較小的回撤，代價是漲多的年份追不上；幾種五五做法彼此差不多，選自己做得到的就好。'),
    h('p', {}, '這十年台股大致是多頭，換一段時間、換起點，排名可能完全不同；過去不代表未來。'),
    h('p', {}, h('a', { href: 'yearcheck.html' }, '只看今年：年初 100 萬，現在變多少 →'))),
  disclaimer('general'));
