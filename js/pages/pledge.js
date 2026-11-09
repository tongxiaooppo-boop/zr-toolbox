// 工具④ 質押壓力測試（v5 精靈樣板：之後每個工具照這份的結構寫）。
// 結構：toolHeader → wizard（輸入步驟＋結果逐項解說）→「怎麼讀」卡（圖解）→ disclaimer。公式只在 core/pledge.js 的 pledgePlan。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { pledgePlan } from '../core/pledge.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'pledge');
const num = id => parseNum(document.getElementById(id)?.value);
const USE = [
  { value: 'cash', label: '還沒用／留著當現金' },
  { value: 'same', label: '買 0050 這類大盤 ETF' },
  { value: 'lever', label: '買正二（00631L 等）' }
];
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;

const steps = [
  {
    title: '你拿去質押的股票',
    hint: '填你實際押給券商或銀行的那幾檔。代號填好，現價會自動抓最近收盤價。',
    body: s => [holdingsInput({ id: 'hold', rows: s.holdings || [{}] }), tokenBox()],
    read: s => { s.holdings = readHoldings('hold'); holdingSummary(s.holdings); }
  },
  {
    title: '借了多少錢',
    hint: '看質押或借貸帳戶的「借款餘額」。借來的錢拿去做什麼也會影響風險。',
    body: s => [
      numberInput({ id: 'debt', label: '借款總額', plain: '已經借的＋這次打算借的，全部加起來', termId: 'pledge', value: s.debt, suffix: '元' }),
      selectField({ id: 'use', label: '借來的錢拿去做什麼', plain: '拿去買股票，股價下跌時會兩頭虧', options: USE, value: s.use || 'cash' }),
      numberInput({ id: 'rate', label: '借款年利率（選填）', plain: '契約上的年利率，例：2.5；不知道就留白', value: s.rate, suffix: '%' }),
      numberInput({ id: 'days', label: '打算借多久（選填）', plain: '算幾天後的利息，例：365；留白就不算利息', value: s.days, suffix: '天' })],
    read: s => {
      s.debt = num('debt'); s.use = document.getElementById('use').value; s.rate = num('rate'); s.days = num('days');
      if (!(s.debt > 0)) throw new Error('借款總額要大於 0；沒有借款就不會被追繳。');
      if (!Number.isNaN(s.rate) && !(s.rate >= 0 && s.rate <= 100)) throw new Error('年利率填 0–100 之間的數字，例：2.5。');
      if (!Number.isNaN(s.days) && !(Number.isInteger(s.days) && s.days >= 0)) throw new Error('天數要是整數，例：365。');
    }
  },
  {
    title: '契約上的追繳規則',
    hint: '這三個數字寫在質押契約裡。不確定就先用預設值，之後再問券商或銀行。',
    body: s => [
      numberInput({ id: 'call', label: '追繳線', plain: '維持率低於這裡就會被通知補錢；多數券商契約是 130', termId: 'margin-call', value: s.call ?? 130, suffix: '%' }),
      numberInput({ id: 'target', label: '補回目標', plain: '被追繳後要補回到多少，例如 160 或 166', termId: 'maintenance-ratio', value: s.target ?? 160, suffix: '%' }),
      numberInput({ id: 'q', label: '擔保品認列成數', plain: '股票打幾折算維持率；沒打折就是 100', value: s.q ?? 100, suffix: '%' })],
    read: s => {
      s.call = num('call'); s.target = num('target'); s.q = num('q');
      if (!(s.call >= 100)) throw new Error('追繳線至少 100，例：130。');
      if (!(s.target >= s.call)) throw new Error('補回目標不能低於追繳線，例：160。');
      if (!(s.q > 0 && s.q <= 100)) throw new Error('認列成數填 1–100，例：100。');
    }
  }
];

function result(s) {
  const rate = Number.isNaN(s.rate) || s.rate == null ? 0 : s.rate, days = Number.isNaN(s.days) || s.days == null ? 0 : s.days;
  const r = pledgePlan({ holdings: s.holdings, debt: s.debt, rate: rate / 100, days, call: s.call / 100, target: s.target / 100, collateralQ: s.q / 100, use: s.use });
  const { summary } = r, many = summary.rows.length > 1;
  const debtText = r.interest > 0.5 ? `借款 ${fmtMoney(s.debt)}＋${days} 天利息 ${fmtMoney(r.interest)}` : `借款 ${fmtMoney(s.debt)}`;
  const qText = s.q < 100 ? ` × 認列 ${s.q}%` : '';
  const under = r.callDrop <= 0;
  const out = [
    explain({ label: '擔保品現在值多少', value: fmtMoney(summary.value),
      how: summary.rows.map(x => `${named(x.code)}：${x.shares.toLocaleString('en-US')} 股 × ${x.nowPrice} 元＝${fmtMoney(x.value)}`).join('；') + (many ? '，加起來。' : '。'),
      means: `你買進花了 ${fmtMoney(summary.cost)}，帳面 ${signed(summary.gain)}（${fmtPct(summary.gainPct)}）。` }),
    explain({ label: '目前維持率', value: fmtPct(r.nowRatio, 0), tone: under ? 'bad' : r.nowRatio < s.target / 100 ? 'warn' : 'ok',
      how: `擔保品 ${fmtMoney(summary.value)}${qText} ÷ ${debtText}＝${fmtPct(r.nowRatio, 0)}。`,
      means: `維持率是「擔保品夠不夠還借款」。低於 ${s.call}% 會被追繳，數字越高越安全。`,
      todo: under ? `現在就低於追繳線，要盡快還款或補擔保品，補回 ${s.target}%。` : null }),
    explain({ label: '股價跌破這裡會被追繳', value: under ? '已經低於追繳線' : (many ? '全部同時跌 ' : '跌 ') + fmtPct(r.callDrop), tone: 'warn',
      how: r.perStock.map(p => `${named(p.code)} ${under ? '要回到' : '跌到'} ${p.callPrice.toFixed(2)} 元${under ? '以上' : ''}（比你的買入價${p.vsBuy >= 0 ? '高' : '低'} ${fmtPct(Math.abs(p.vsBuy))}）`).join('；') + '。',
      means: `在這個價位，維持率剛好是 ${s.call}%。` + (many ? '這裡假設每檔一起漲跌一樣多；質押大盤 ETF 時接近事實，個股會差很多。' : ''),
      todo: under ? null : '記下這個價位。股價接近時先準備好現金，不要等通知才找錢。' })
  ];
  if (r.useFactor > 0 && !under) out.push(explain({ label: '借來的錢買的股票也會跟著虧', value: '約 ' + fmtMoney(r.useLossAtCall), tone: 'bad',
    how: `跌到追繳線時擔保品約跌 ${fmtPct(r.callDrop)}，${s.use === 'lever' ? '正二粗估跌 2 倍' : '大盤 ETF 跟著跌 1 倍'}：${fmtMoney(s.debt)} × ${fmtPct(Math.min(1, r.useFactor * r.callDrop))}。`,
    means: '被追繳的同時，借錢買的部位也在虧。要補錢時，往往得在低點賣掉它。',
    todo: '準備一筆不靠股票的現金，至少夠下面表格「最壞那一列」。' }));
  if (r.interest > 0.5) out.push(explain({ label: `${days} 天的利息`, value: fmtMoney(r.interest),
    how: `${fmtMoney(s.debt)} × 年利率 ${rate}% × ${days} ÷ 365。`,
    means: '利息會加進借款，借越久維持率越低；上面的維持率已經算進去了。' }));
  out.push(h('h3', {}, '跌更多會怎樣：被追繳要補多少'),
    h('table', { class: 'trade-table pledge-table' },
      h('thead', {}, h('tr', {}, ['股價跌', '維持率', `補回 ${s.target}% 要還款（元）`, '或補擔保品（元）'].map(t => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, r.rows.map(row => h('tr', { class: row.called ? 'called' : undefined },
        h('td', {}, '−' + fmtPct(row.decline, 0)),
        h('td', {}, fmtPct(row.ratio, 0) + (row.called ? '（追繳）' : '')),
        h('td', {}, row.repay < 0.5 ? '不用' : Math.round(row.repay).toLocaleString('en-US')),
        h('td', {}, row.topup < 0.5 ? '不用' : Math.round(row.topup).toLocaleString('en-US')))))),
    h('p', { class: 'note' }, '還款和補擔保擇一就好。同樣補回目標，拿現金還款要的錢比較少；補擔保要契約接受，各家認列方式不同。'));
  return out;
}

const example = { holdings: [{ code: '0050', shares: 10000, buyPrice: 80, nowPrice: 100 }], debt: 500000, use: 'cash', rate: NaN, days: NaN, call: 130, target: 160, q: 100 };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/pledge/call-line.svg', alt: '質押 1 萬股、借 50 萬：股價 100 元時擔保品 100 萬、維持率 200%；跌 35% 到 65 元，維持率 130%，碰到追繳線；跌 40% 到 60 元，維持率 120%，被追繳。要補回 160%：拿現金還款 12.5 萬（60 萬 ÷ 37.5 萬），或補擔保品 20 萬（80 萬 ÷ 50 萬）。', caption: '股價跌，維持率跟著掉；同樣補回目標，還款要的錢比補擔保少。' }),
    h('p', {}, '質押就是把股票押給券商借錢。維持率＝擔保品市值 ÷ 借款，股價跌，維持率就往下掉。'),
    h('p', {}, '掉到追繳線（多數券商契約是 130%，以你的契約為準）就會被通知補錢，期限內沒補，券商可以賣掉你的股票。補的時候要補回契約寫的目標，不是剛好補到 130%。'),
    h('p', {}, '借來的錢如果拿去買正二，正二跌得大約是大盤的 2 倍，帳面虧損和追繳可能同時來。先看結果的表，確定最壞那一列的錢你拿得出來。')),
  disclaimer('executable'));
