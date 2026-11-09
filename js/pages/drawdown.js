import { h, toolHeader, selectField, infoChip, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { drawdownPlan } from '../core/drawdown.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'drawdown');
const num = id => parseNum(document.getElementById(id)?.value);
const pct = id => num(id) / 100;
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;
const price = n => `${+n.toFixed(2)} 元`;
const link = (href, text) => h('a', { href }, text);
const signed = (x, digits = 1) => (Math.round(x * 10 ** (digits + 2)) > 0 ? '+' : '') + fmtPct(x, digits);
const holdingFigure = { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' };
const titles = { holding: '你的持股', peak: '最高點和現在', pct: '跌了幾 %', series: '貼上紀錄' };

function parseSeries(text = '') {
  const values = text.trim().split(/[\s,，、]+/).filter(Boolean).map(parseNum);
  if (values.some(Number.isNaN)) throw new Error('紀錄裡有不是數字的內容，請只填數字，用逗號或空白隔開。');
  return values;
}

function params(s) {
  const p = { mode: s.mode, annual: s.annual / 100 };
  if (s.mode === 'holding') {
    const L = s.h[0];
    Object.assign(p, { shares: L.shares, buyPrice: L.buyPrice, nowPrice: L.nowPrice });
  } else if (s.mode === 'peak') Object.assign(p, { peak: s.peak, now: s.now });
  else if (s.mode === 'pct') p.drop = s.drop / 100;
  else if (s.mode === 'series') p.series = parseSeries(s.seriesText);
  return p;
}

function seriesField(s) {
  return h('div', { class: 'field' },
    h('label', { for: 'series' }, '淨值或股價紀錄', infoChip('drawdown')),
    h('small', { class: 'plain-sub' }, '用逗號或空白隔開，例：100, 120, 90'),
    h('textarea', { id: 'series', rows: 3, value: s.seriesText || '' }));
}

const steps = [
  {
    title: '怎麼算跌幅',
    hint: '選你手上有的數字。',
    about: '同一個現價，跟買入價比和跟最高點比，答案不一樣。',
    figure: { src: '../img/drawdown/step1.webp', alt: '跌幅有四種算法，選你手上有的。小安說：我要跟什麼比？1. 跟買入價比 → 我還要漲多少才不虧。2. 跟最高點比 → 我還要漲多少才回到最高。3. 直接填跌幅 → 例：跌 30%。4. 貼一串淨值紀錄 → 找出最深的那一次。折線從買入價上升到最高點，再下降到現在。老師說：同一個現價，跟買入價比和跟最高點比，答案不一樣。' },
    body: s => withHelp(selectField({ id: 'mode', label: '跟什麼比', termId: 'drawdown', options: [
      { value: 'holding', label: '跟我的買入價比（填持股）' },
      { value: 'peak', label: '跟最高點比（填最高和現在）' },
      { value: 'pct', label: '直接填跌幅 %' },
      { value: 'series', label: '貼一串淨值或股價紀錄' }
    ], value: s.mode || 'holding' }), { text: ['跟買入價比：算「還要漲多少才不虧」。', '跟最高點比：算「還要漲多少才回到最高」，淨值、股價、指數都可以。', '貼一串紀錄：找出中間跌最深的那一次（最大回撤）。'] }),
    read: s => {
      s.mode = document.getElementById('mode').value;
      steps[1].title = titles[s.mode];
      steps[1].hint = s.mode === 'holding' ? '只填一檔。股數和成本均價看券商 App 的庫存。' : s.mode === 'peak' ? '淨值、股價、指數都可以，兩格單位要一樣。' : '';
      steps[1].figure = s.mode === 'holding' ? holdingFigure : null;
    }
  },
  {
    title: '你的持股',
    hint: '只填一檔。股數和成本均價看券商 App 的庫存。',
    figure: holdingFigure,
    body: s => {
      if (s.mode === 'holding') return [holdingsInput({ id: 'h', rows: s.h || [{}], max: 1, label: '你的持股' }), tokenBox()];
      if (s.mode === 'peak') return [
        numberInput({ id: 'peak', label: '最高點', plain: '之前最高的那個數字', value: s.peak }),
        numberInput({ id: 'now', label: '現在', plain: '現在的數字', value: s.now })];
      if (s.mode === 'pct') return numberInput({ id: 'drop', label: '跌幅', termId: 'recovery-gain', plain: '從高點跌了幾 %，例：30', suffix: '%', value: s.drop });
      return seriesField(s);
    },
    read: s => {
      if (s.mode === 'holding') { s.h = readHoldings('h'); holdingSummary(s.h); }
      else if (s.mode === 'peak') { s.peak = num('peak'); s.now = num('now'); }
      else if (s.mode === 'pct') s.drop = num('drop');
      else s.seriesText = document.getElementById('series').value;
      drawdownPlan(params(s));
    }
  },
  {
    title: '之後每年賺多少（選填）',
    hint: '留白就不估要幾年。',
    body: s => numberInput({ id: 'annual', label: '之後每年賺多少', plain: '例：大盤長期平均約 8%，這只是假設', suffix: '%', value: s.annual,
      help: { text: ['用固定的年報酬估要幾年回本，真實行情不會這麼平順。', '留白就不估。'] } }),
    read: s => { s.annual = num('annual'); drawdownPlan(params(s)); }
  }
];

function result(s) {
  steps[1].title = titles[s.mode];
  steps[1].hint = s.mode === 'holding' ? '只填一檔。股數和成本均價看券商 App 的庫存。' : s.mode === 'peak' ? '淨值、股價、指數都可以，兩格單位要一樣。' : '';
  steps[1].figure = s.mode === 'holding' ? holdingFigure : null;
  const r = drawdownPlan(params(s));
  const what = { holding: '買入價', peak: '最高點', series: '前高' }[s.mode];
  const number = x => +x.toFixed(2);
  const hasBase = r.base !== null;
  const out = [];
  if (r.drop === 0) {
    out.push(explain({ label: '沒有虧', value: r.up > 0 ? '現在比' + what + '高 ' + fmtPct(r.up) : '剛好回到' + (what || '原本水準'), tone: 'ok',
      means: '不用回本。可以把買入價換成最高點再算一次，看離最高點多遠。' }));
  } else {
    out.push(
      explain({ label: '跌了', value: fmtPct(r.drop), tone: 'bad',
        how: s.mode === 'series' ? `從第 ${r.peakIndex + 1} 筆（${number(r.base)}）跌到第 ${r.troughIndex + 1} 筆（${number(r.current)}），是這串紀錄裡最深的一次。`
          : hasBase ? `(${what} ${number(r.base)} − ${number(r.current)}) ÷ ${number(r.base)}＝${fmtPct(r.drop)}。` : '你填的跌幅。' }),
      explain({ label: '要漲多少才回本', value: fmtPct(r.recovery), tone: 'warn',
        how: `1 ÷ (1 − ${fmtPct(r.drop)}) − 1＝${fmtPct(r.recovery)}。`,
        means: '跌是用原本的錢算，漲是用剩下的錢算，所以要漲的比跌的多。' + (hasBase ? `要從 ${number(r.current)} 漲回 ${number(r.base)}。` : '') }));
    if (s.mode === 'holding') {
      const L = s.h[0];
      out.push(explain({ label: '現在虧', value: fmtMoney(r.loss), tone: 'bad',
        how: `${L.shares.toLocaleString('en-US')} 股 ×（${number(L.buyPrice)} − ${number(L.nowPrice)}）。`,
        means: '還沒賣就只是帳面上的虧損；沒算手續費、稅和股利。' }));
    }
    if (r.years !== null) out.push(explain({ label: '每年賺 ' + s.annual + '% 要', value: '約 ' + r.years.toFixed(1) + ' 年',
      how: `ln(1 + ${fmtPct(r.recovery)}) ÷ ln(1 + ${s.annual}%)。`, means: '假設每年都穩穩賺一樣多；真實行情會有起伏。' }));
  }
  if (s.mode === 'series') out.push(explain({ label: '現在離最高點', value: r.curDrop === 0 ? '在最高點' : '還差 ' + fmtPct(r.curDrop), tone: 'info', how: '1 − 最後一筆 ÷ 全部最高的一筆。' }));
  out.push(
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, '跌了'), h('th', { scope: 'col' }, '要漲'))),
      h('tbody', {}, r.table.map(({ drop, gain }) => h('tr', {}, h('td', {}, fmtPct(drop, 0)), h('td', {}, fmtPct(gain)))))),
    h('p', { class: 'note' }, ['正二的漲跌約是大盤的 2 倍，回撤也比較深，而且來回震盪會再多虧一點，見 ', link('decay.html', '⑥ 正二不是兩倍？'), '。']));
  return out;
}

const example = { mode: 'holding', h: [{ code: '0050', shares: 1000, buyPrice: 200, nowPrice: 150 }], annual: 8 };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/drawdown/comic.webp', alt: '四格漫畫：一、買在 200 元。券商 App（示意）：1,000 股｜成本 200｜現價 150。小安說：跌了 50 元，虧 50,000……二、跌了幾 %？(200 − 150) ÷ 200＝25%。小安說：那漲 25% 就回本了吧？三、漲要用剩下的錢算。150 × 1.25＝187.5 → 還沒回本。200 ÷ 150 − 1＝33.3%。老師說：跌是用原本的錢算，漲是用剩下的錢算。四、跌越深，越難回。跌 10% → 漲 11.1%；跌 25% → 漲 33.3%；跌 50% → 漲 100%；跌 80% → 漲 400%。老師說：每年賺 8%，跌 25% 也要約 3.7 年才回本。沒算手續費、稅和股利。' }),
    h('p', {}, '跌和漲的基準不一樣：跌是用原本的錢算，漲是用剩下的錢算。100 萬跌 50% 剩 50 萬，50 萬要漲 100% 才回到 100 萬。'),
    h('p', {}, '回撤是從前一個高點往下跌了多少；最大回撤是一段期間裡最深的那一次。貼一串淨值或股價進來，就能找出最大回撤在哪裡。'),
    h('p', {}, '正二的漲跌大約是大盤的 2 倍，回撤也會比較深。考慮要放多少錢之前，先想想自己能不能等到回本。')),
  disclaimer('general'));
