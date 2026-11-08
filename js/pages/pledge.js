import { h, toolHeader, numberField, exampleButton, readNumbers, metric, showResult, showError, disclaimer, figure } from '../ui/components.js';
import { pledgeTable } from '../core/pledge.js';
import { fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'pledge');
const REQUIRED = ['shares', 'price', 'debt', 'call', 'target', 'collateralQ'];
const FIELDS = [...REQUIRED, 'rate', 'days'];
const result = h('div', { class: 'result', 'aria-live': 'polite' });

function update() {
  const v = readNumbers(FIELDS);
  const missing = REQUIRED.filter(id => Number.isNaN(v[id])).length;
  if (missing) { showResult(result, h('p', { class: 'muted' }, `填完 ${missing} 格就會算。`)); return; }
  const { shares, price, debt, call, target, collateralQ } = v;
  const rate = Number.isNaN(v.rate) ? 0 : v.rate;
  const days = Number.isNaN(v.days) ? 0 : v.days;
  try {
    const p = { shares, pledgePrice: price, price, collateralQ: collateralQ / 100, debt, newDebt: 0, credit: 0,
      investRatio: 0, purchasePrice: price, rate: rate / 100, days, call: call / 100,
      restore: target / 100, safety: target / 100, reserve: 0, remedy: 'repay', q: 1 };
    const rows = pledgeTable(p);
    const r0 = rows[0];
    if (debt === 0) { showResult(result, h('p', {}, '沒有借款，就不會被追繳。')); return; }
    showResult(result,
      h('div', { class: 'metrics' },
        metric('目前維持率', fmtPct(r0.nowRatio, 0), r0.called || r0.nowRatio < call / 100 ? 'bad' : 'ok'),
        metric('股價跌破這裡會被追繳', r0.referencePrice.toFixed(2) + ' 元', 'warn'),
        metric('等於從現在跌', fmtPct(r0.callDrop), 'warn')),
      r0.callDrop <= 0 ? h('p', { class: 'note' }, '⚠ 現在的維持率已經低於追繳線。') : [],
      h('table', { class: 'trade-table pledge-table' },
        h('thead', {}, h('tr', {}, ['股價跌', '維持率', `補回 ${target}% 要還款`, '或補擔保品'].map(label => h('th', { scope: 'col' }, label)))),
        h('tbody', {}, rows.map(row => h('tr', { class: row.called ? 'called' : undefined },
          h('td', {}, '−' + fmtPct(row.decline, 0)),
          h('td', {}, fmtPct(row.ratio, 0) + (row.called ? '（追繳）' : '')),
          h('td', {}, row.repay < 0.5 ? '不用' : fmtMoney(row.repay)),
          h('td', {}, row.topup < 0.5 ? '不用' : fmtMoney(row.topup)))))),
      h('p', { class: 'note' }, rate > 0 && days > 0 ? `已把 ${days} 天、年利率 ${rate}% 的利息算進借款。` : '沒有算利息；借越久，利息會讓維持率越來越低。'),
      h('p', { class: 'note' }, '跌幅是質押那檔股票的跌幅，不是大盤；質押 0050 時兩者接近。補擔保要契約接受，各家認列方式不同。'));
  } catch (e) { showError(result, e.message); }
}

const app = document.getElementById('app');
app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    numberField({ id: 'shares', label: '已質押股數', plain: '拿去質押的股票有幾股', termId: 'pledge', suffix: '股' }),
    numberField({ id: 'price', label: '擔保品目前股價', plain: '質押的那檔股票現在一股多少錢', suffix: '元' }),
    numberField({ id: 'debt', label: '借款總額', plain: '已經借的＋這次打算借的，全部加起來', suffix: '元' }),
    numberField({ id: 'call', label: '追繳線', plain: '多數券商契約是 130%，以你的契約為準', termId: 'margin-call', suffix: '%', value: '130' }),
    numberField({ id: 'target', label: '補回目標', plain: '被追繳後要補回到多少，看契約，例如 160 或 166', termId: 'maintenance-ratio', suffix: '%', value: '160' }),
    h('details', { class: 'advanced' }, h('summary', {}, '進階設定（選填）'),
      numberField({ id: 'rate', label: '借款年利率', plain: '填了會把利息算進借款，沒有就留白', suffix: '%' }),
      numberField({ id: 'days', label: '計算期間', plain: '算幾天後的利息，整數天，沒有就留白', suffix: '天' }),
      numberField({ id: 'collateralQ', label: '擔保品認列成數', plain: '券商把股票打幾折算維持率，沒打折就是 100', suffix: '%', value: '100' })),
    exampleButton({ shares: 10000, price: 100, debt: 500000, call: 130, target: 160, rate: '', days: '', collateralQ: 100 }, update)),
  h('section', { class: 'card' }, h('h2', {}, '結果'), result),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/pledge/call-line.svg', alt: '質押 1 萬股、借 50 萬：股價 100 元時擔保品 100 萬、維持率 200%；跌 35% 到 65 元，維持率 130%，碰到追繳線；跌 40% 到 60 元，維持率 120%，被追繳。要補回 160%：拿現金還款 12.5 萬（60 萬 ÷ 37.5 萬），或補擔保品 20 萬（80 萬 ÷ 50 萬）。', caption: '股價跌，維持率跟著掉；同樣補回目標，還款要的錢比補擔保少。' }),
    h('p', {}, '質押就是把股票押給券商借錢。維持率＝擔保品市值 ÷ 借款，股價跌，維持率就往下掉。'),
    h('p', {}, '掉到追繳線（多數券商契約是 130%，以你的契約為準）就會被通知補錢，期限內沒補，券商可以賣掉你的股票。補的時候要補回契約寫的目標，不是剛好補到 130%。'),
    h('p', {}, '借來的錢如果拿去買正二，正二跌得大約是大盤的 2 倍，帳面虧損和追繳可能同時來。先看上面的表，確定最壞那一列的錢你拿得出來。')),
  disclaimer('executable'));
app.addEventListener('input', update);
app.addEventListener('change', update);
update();
