import { h, toolHeader, figure, disclaimer, lineChart } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
import { BACKTEST } from '../data/backtest2026.js';
import { fmtMoney, fmtPct } from '../core/format.js';

const B = BACKTEST;
const ALT = '示意折線：從「投入」起點往上到「最高點」，再往下到「現在」。最高點到現在之間的向下箭頭標「回吐」，起點到現在之間標「報酬」。';
const mm = d => Number(d.slice(5, 7));
const md = d => d.slice(5, 7) + '/' + d.slice(8, 10);
const signPct = n => (n >= 0 ? '+' : '−') + fmtPct(Math.abs(n));
const absPct = n => '−' + fmtPct(Math.abs(n));
const wrap = (label, table) => h('div', { class: 'compare-wrap', tabindex: '0', role: 'region', 'aria-label': label }, table);
const th = text => h('th', { scope: 'col' }, text);

const zr = B.series.filter(s => s.group === 'zr');
const hold = B.series.filter(s => s.group === 'hold');
const last = B.months.length - 1;
const xTicks = B.months.map((m, i) => ({ index: m.index, text: mm(m.date) + '月', i }))
  .filter(t => [1, 4, 7, 10].includes(mm(B.months[t.i].date)) || t.i === last).map(({ index, text }) => ({ index, text }));

const chartCard = (title, list, label) => h('section', { class: 'card' }, h('h2', {}, title),
  lineChart({ series: list.map(s => ({ name: s.name, values: s.values.map(v => v / 1e4) })), label, yFormat: v => v.toFixed(0) + ' 萬', baseline: 100, xTicks }),
  h('ul', { class: 'yc-rules' }, list.map(s => h('li', {}, h('strong', {}, s.name), '：', s.rule))));

const best = B.series.reduce((a, s) => (s.ret > a.ret ? s : a));
const worst = B.series.reduce((a, s) => (s.giveback < a.giveback ? s : a));
const dividendCount = s => s.events.length;

document.getElementById('app').append(
  toolHeader(TOOLS.find(t => t.id === 'yearcheck')),
  h('section', { class: 'card article' }, h('h2', {}, '這頁在算什麼'),
    figure({ src: '../img/yearcheck/comic.webp', alt: '100 萬分進四個罐子：正2 四種做法、0050、0056、00981A。', caption: '過去不代表未來。' }),
    h('p', {}, `${B.start} 收盤投入 100 萬，照下面 7 種做法放著，算到 ${B.asOf}（共 ${B.tradingDays} 個交易日）。用的是每天真實的收盤價，不是預測。`),
    h('ul', {},
      h('li', {}, '手續費 0.1425%、ETF 賣出證交稅 0.1% 都算進去。'),
      h('li', {}, '股數取整數（可零股）。'),
      h('li', {}, '現金不計利息。'),
      h('li', {}, '配息領現金，不再買回。'),
      h('li', {}, '正2 用 00675L 富邦臺灣加權正2（00631L 今年 3 月分割過，不用）。')),
    h('p', { class: 'muted' }, `每月底更新一次。資料來源：${B.source}`)),
  chartCard('正2 四種做法', zr, `正2 四種做法從年初 100 萬到 ${B.asOf} 的每日資產變化（單位：萬元）`),
  chartCard('長抱比較：0050、0056、00981A', hold, `0050、0056、00981A 長抱從年初 100 萬到 ${B.asOf} 的每日資產變化（單位：萬元）`),
  h('section', { class: 'card' }, h('h2', {}, '到現在的成績'),
    wrap('到現在的成績表，可橫向捲動', h('table', {}, h('caption', {}, `${B.start} 投入 100 萬，到 ${B.asOf} 的結果`),
      h('thead', {}, h('tr', {}, ['做法', '現在', '報酬', '最高曾到（日期）', '從最高回吐', '最大回撤', '領到的股利'].map(th))),
      h('tbody', {}, B.series.map(s => h('tr', { class: s === best ? 'yc-best' : null },
        h('th', { scope: 'row' }, s.name),
        h('td', {}, fmtMoney(s.values.at(-1))), h('td', {}, signPct(s.ret)),
        h('td', {}, `${fmtMoney(s.peak)}（${md(s.peakDate)}）`), h('td', {}, absPct(s.giveback)),
        h('td', {}, absPct(s.mdd)), h('td', {}, s.dividendTotal ? fmtMoney(s.dividendTotal) : '—')))))),
    h('p', {}, `目前最多：${best.name}（${signPct(best.ret)}）。從最高點回吐最多：${worst.name}（${absPct(worst.giveback)}）。`)),
  h('section', { class: 'card' }, h('h2', {}, '每個月底變多少（萬元）'),
    wrap('每個月底資產表，可橫向捲動', h('table', {}, h('caption', {}, '各做法每個月最後一個交易日的資產（萬元）'),
      h('thead', {}, h('tr', {}, th('做法'), B.months.map((m, i) => th(i === last ? md(m.date) : mm(m.date) + '月')))),
      h('tbody', {}, B.series.map(s => h('tr', {}, h('th', { scope: 'row' }, s.name), s.monthly.map(v => h('td', {}, Math.round(v / 1e4))))))))),
  h('section', { class: 'card' }, h('h2', {}, '中間發生了什麼'),
    B.series.map(s => {
      const is56 = s.id === 'h0056';
      const title = s.name + `（${s.events.length} 件）` + (is56 ? `（配息 ${dividendCount(s)} 次，共 ${fmtMoney(s.dividendTotal)}）` : '');
      return h('details', { class: 'yc-details', open: is56 }, h('summary', {}, title),
        s.events.length ? h('ul', {}, s.events.map(e => h('li', {}, `${md(e.date)} ${e.text}`))) : h('p', { class: 'muted' }, '這段期間沒有配回或配息'));
    })),
  h('section', { class: 'card article' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/yearcheck/giveback.svg', alt: ALT, caption: '最高點不等於賺到的錢；回吐是從最高點掉回來多少。' }),
    h('p', {}, '報酬看終點，回吐看過程：同樣賺三成，過程中曾經少掉一半的做法，多數人撐不住。'),
    h('p', {}, '正2 的 2 倍只算單日，震盪時會有耗損；今年 00675L 追蹤加權指數，和 0050 追蹤的台灣 50 也不完全一樣。'),
    h('p', {}, '這只是今年這一段的結果，換一年、換起點，排名可能完全不同；過去不代表未來。')),
  disclaimer('general'));
