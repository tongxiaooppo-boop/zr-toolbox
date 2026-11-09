// 工具⑱：計算只呼叫 core/fx.js。
import { h, toolHeader, disclaimer, figure, selectField } from '../ui/components.js';
import { wizard, numberInput, explain, withHelp, tokenBox } from '../ui/wizard.js';
import { fxPlan, ratePair, FX_CURRENCIES } from '../core/fx.js';
import { fetchFxRate, getToken, setToken } from '../net/price.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';
const tool = TOOLS.find(t => t.id === 'fx');
const num = id => parseNum(document.getElementById(id)?.value);
const blank = v => v === undefined || v === null || Number.isNaN(v);
const signedMoney = n => (n < 0 ? '−' : '+') + fmtMoney(Math.abs(n));
const signedPct = (x, d = 1) => (x < 0 ? '−' : '+') + fmtPct(Math.abs(x), d);
const params = s => ({ twdIn: s.twdIn, rateIn: { buy: s.inBuy, sell: s.inSell }, feeIn: blank(s.feeIn) ? 0 : s.feeIn, foreignNow: s.foreignNow, rateNow: { buy: s.nowBuy, sell: s.nowSell }, feeOut: blank(s.feeOut) ? 0 : s.feeOut });
const cur = s => FX_CURRENCIES.find(c => c.code === s.currency)?.label || s.currency;
const rate4 = x => (+x.toFixed(4)).toString();
const fx2 = x => (+x.toFixed(2)).toLocaleString('zh-TW');
const requests = new WeakMap();
async function fillRates(currency, kind, date, buyInput, sellInput, status) {
  const seq = (requests.get(status) || 0) + 1;
  requests.set(status, seq);
  status.textContent = '查詢匯率中…';
  try {
    const r = await fetchFxRate(currency, { date, token: getToken() });
    if (requests.get(status) !== seq || !status.isConnected) return;
    if (r.clearToken) setToken('');
    if (!r.ok) { status.textContent = r.message + (r.action === 'show-quota-guide' ? ' 申請方式見下方 token 說明。' : ''); return; }
    const pair = ratePair(r.row, kind);
    if (!pair) { status.textContent = `臺灣銀行 ${r.date} 沒有${kind === 'cash' ? '現鈔' : '即期'}報價，請自己填。`; return; }
    buyInput.value = pair.buy; sellInput.value = pair.sell;
    status.textContent = `臺灣銀行 ${r.date} 牌告${kind === 'cash' ? '（現鈔）' : '（即期）'}：買入 ${pair.buy}、賣出 ${pair.sell}。你的銀行可能不同，可以改。`;
  } catch {
    if (requests.get(status) === seq && status.isConnected) status.textContent = '查詢失敗，請稍後再試，或自己填匯率。';
  }
}
function protectManual(status, inputs) {
  inputs.forEach(input => input.addEventListener('input', () => { requests.set(status, (requests.get(status) || 0) + 1); status.textContent = ''; }));
}
const steps = [
  {
    title: '當初換匯',
    hint: '看銀行 App 的換匯紀錄：付了多少台幣、成交匯率。只記得日期的話，填日期會自動抓那天的牌告匯率。',
    about: '台幣換外幣用「銀行賣出」匯率；同一天的「銀行買入」匯率用來算價差。',
    figure: { src: '../img/fx/step1.webp', alt: '銀行牌告匯率怎麼看。銀行匯率（示意）：美元｜銀行買入 32.9｜銀行賣出 33.0。台幣 → 美元，看『銀行賣出』33.0（比較貴）；美元 → 台幣，看『銀行買入』32.9（比較便宜）。老師說：買入、賣出是站在銀行的角度。小安說：所以換過去馬上換回來，會少一點。即期是外幣帳戶用的；換現鈔的價差通常更大。' },
    body: s => {
      const currencyField = selectField({ id: 'currency', label: '幣別', options: FX_CURRENCIES.map(c => ({ value: c.code, label: c.label + '（' + c.code + '）' })), value: s.currency || 'USD' });
      const kindField = withHelp(selectField({ id: 'kind', label: '換的是', termId: 'fx-spread', options: [{ value: 'spot', label: '即期（存進外幣帳戶、複委託）' }, { value: 'cash', label: '現鈔（領現金）' }], value: s.kind || 'spot' }), { text: ['投資海外股票通常是即期：錢在帳戶裡，不領現金。', '現鈔的價差比較大。'] });
      const max = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const date = h('input', { id: 'dateIn', type: 'date', value: s.dateIn || '', max });
      const status = h('small', { class: 'holding-status', 'aria-live': 'polite' });
      const dateField = withHelp(h('div', { class: 'field' }, h('label', { for: 'dateIn' }, '哪一天換的（選填）'), h('small', { class: 'plain-sub' }, '填了會自動抓臺灣銀行那天的牌告匯率'), date, status), { text: ['沒有營業的日期會用之前最近一個營業日的牌告匯率。', '牌告和實際成交匯率可能不同，可以自己改。'] });
      const sell = numberInput({ id: 'inSell', label: '銀行賣出匯率', termId: 'fx-spread', plain: '台幣換外幣用這個', value: s.inSell, help: { text: ['1 外幣＝多少台幣。換匯紀錄上的成交匯率就是這個。', '有議價或優惠的話填你實際成交的。'] } });
      const buy = numberInput({ id: 'inBuy', label: '銀行買入匯率', plain: '同一天的另一個價格，用來算價差', value: s.inBuy });
      const currency = currencyField.querySelector('select'), kind = kindField.querySelector('select');
      const buyInput = buy.querySelector('input'), sellInput = sell.querySelector('input');
      const lookup = () => {
        requests.set(status, (requests.get(status) || 0) + 1);
        status.textContent = '';
        if (date.value) fillRates(currency.value, kind.value, date.value, buyInput, sellInput, status);
      };
      [currency, kind, date].forEach(input => input.addEventListener('change', lookup));
      protectManual(status, [buyInput, sellInput]);
      return [currencyField, kindField, dateField,
        numberInput({ id: 'twdIn', label: '付出的台幣', plain: '含手續費，總共花了多少', suffix: '元', value: s.twdIn }), sell, buy,
        numberInput({ id: 'feeIn', label: '換匯手續費（選填）', plain: '留白＝0', suffix: '元', value: s.feeIn }), tokenBox()];
    },
    read: s => {
      const currency = document.getElementById('currency').value, kind = document.getElementById('kind').value;
      if (currency !== s.currency || kind !== s.kind) { s.nowBuy = NaN; s.nowSell = NaN; }
      s.currency = currency; s.kind = kind; s.dateIn = document.getElementById('dateIn').value;
      s.twdIn = num('twdIn'); s.inSell = num('inSell'); s.inBuy = num('inBuy'); s.feeIn = num('feeIn');
      if ([s.twdIn, s.inSell, s.inBuy].some(blank)) throw new Error('請填付出的台幣和兩個匯率。');
      fxPlan(params({ ...s, nowBuy: s.inBuy, nowSell: s.inSell, foreignNow: NaN }));
    }
  },
  {
    title: '外幣現在值多少', hint: '看外幣帳戶或複委託 App：股票市值＋剩下的外幣現金。只想知道換匯來回少多少，就留白。',
    about: '外幣的漲跌和匯率的漲跌分開算，最後再合起來看換回台幣賺多少。',
    body: s => [h('p', { class: 'muted' }, '當初換到約 ' + fx2((s.twdIn - (blank(s.feeIn) ? 0 : s.feeIn)) / s.inSell) + ' ' + cur(s) + '。'), numberInput({ id: 'foreignNow', label: '現在外幣總值（選填）', plain: '留白＝跟換到的一樣', suffix: s.currency, value: s.foreignNow })],
    read: s => { s.foreignNow = num('foreignNow'); fxPlan(params({ ...s, nowBuy: s.inBuy, nowSell: s.inSell })); }
  },
  {
    title: '現在換回台幣', hint: '換回台幣用「銀行買入」匯率。已經自動帶入今天的臺灣銀行牌告，可以改成你銀行的。',
    body: s => {
      const status = h('small', { class: 'holding-status', 'aria-live': 'polite' });
      const buy = numberInput({ id: 'nowBuy', label: '銀行買入匯率', plain: '外幣換回台幣用這個', value: s.nowBuy });
      const sell = numberInput({ id: 'nowSell', label: '銀行賣出匯率', plain: '用來算現在的價差', value: s.nowSell });
      const buyInput = buy.querySelector('input'), sellInput = sell.querySelector('input');
      protectManual(status, [buyInput, sellInput]);
      if (blank(s.nowBuy) && blank(s.nowSell)) queueMicrotask(() => { if (status.isConnected) fillRates(s.currency, s.kind, '', buyInput, sellInput, status); });
      return [status, buy, sell, numberInput({ id: 'feeOut', label: '換回手續費（選填）', plain: '留白＝0', suffix: '元', value: s.feeOut })];
    },
    read: s => {
      s.nowBuy = num('nowBuy'); s.nowSell = num('nowSell'); s.feeOut = num('feeOut');
      if ([s.nowBuy, s.nowSell].some(blank)) throw new Error('請填現在的兩個匯率。');
      fxPlan(params(s));
    }
  }
];
function result(s) {
  const r = fxPlan(params(s));
  const rows = [
    ['外幣資產漲跌', r.parts.asset, '外幣多了 ' + fx2(r.foreignNow - r.foreignIn) + ' × 當初中間價 ' + rate4(r.midIn)],
    ['匯率變動', r.parts.fx, '現在外幣 × 中間價 ' + rate4(r.midIn) + ' → ' + rate4(r.midNow) + '（' + signedPct(r.fxRet, 2) + '）'],
    ['換入價差', r.parts.spreadIn, '賣出 ' + s.inSell + ' 比中間價貴 ' + rate4(s.inSell - r.midIn)],
    ['換回價差', r.parts.spreadOut, '買入 ' + s.nowBuy + ' 比中間價便宜 ' + rate4(r.midNow - s.nowBuy)],
    ['手續費', r.parts.fees, '換入＋換回'], ['合計', r.pnl, '＝ 台幣損益'] ];
  const out = [
    explain({ label: '換回台幣', value: fmtMoney(r.twdOut), tone: 'info', how: fx2(r.foreignNow) + ' ' + cur(s) + ' × 銀行買入 ' + s.nowBuy + ' − 手續費 ' + fmtMoney(params(s).feeOut) + ' ＝ ' + fmtMoney(r.twdOut) + '。', means: '當初付出 ' + fmtMoney(s.twdIn) + '。' }),
    explain({ label: '台幣損益', value: signedMoney(r.pnl) + '（' + signedPct(r.ret, 2) + '）', tone: r.pnl >= 0 ? 'ok' : 'bad', how: fmtMoney(r.twdOut) + ' − ' + fmtMoney(s.twdIn) + '。', means: '用外幣看是 ' + signedPct(r.assetRet) + '，換回台幣變成 ' + signedPct(r.ret, 2) + '，差在匯率和價差。' }),
    h('h3', {}, '錢去哪了'),
    h('table', { class: 'trade-table' }, h('thead', {}, h('tr', {}, ['項目', '金額', '怎麼算'].map(x => h('th', { scope: 'col' }, x)))), h('tbody', {}, rows.map(([label, value, how]) => h('tr', {}, h('td', {}, label), h('td', {}, signedMoney(Math.round(value))), h('td', {}, how))))),
    h('p', { class: 'note' }, '中間價＝(銀行買入＋銀行賣出) ÷ 2，用來把匯率的漲跌和銀行的價差分開。'),
    explain({ label: '換完馬上換回會少', value: fmtPct(r.spreadPctIn, 2), tone: 'warn', how: '(賣出 ' + s.inSell + ' − 買入 ' + s.inBuy + ') ÷ 賣出 ' + s.inSell + '。', means: '只換匯、什麼都不做的成本，還沒算手續費。' + (s.kind === 'cash' ? '現鈔的價差比即期大。' : '') })];
  if (r.breakEvenBuy !== null) out.push(explain({ label: '不虧的匯率', value: rate4(r.breakEvenBuy), tone: s.nowBuy >= r.breakEvenBuy ? 'ok' : 'warn', how: '(付出 ' + fmtMoney(s.twdIn) + ' ＋ 換回手續費 ' + fmtMoney(params(s).feeOut) + ') ÷ 現在外幣 ' + fx2(r.foreignNow) + '。', means: '銀行買入匯率要高於這個，換回台幣才不虧；現在是 ' + s.nowBuy + '。' }));
  out.push(h('p', { class: 'note' }, '匯率是臺灣銀行牌告（經 FinMind）或你填的數字，實際以你的銀行成交為準；沒算海外股票的稅（例：美股股利預扣）和券商手續費。'));
  return out;
}
const example = { currency: 'USD', kind: 'spot', dateIn: '', twdIn: 330000, inBuy: 32.9, inSell: 33, feeIn: NaN, foreignNow: 11000, nowBuy: 31.4, nowSell: 31.5, feeOut: NaN };
document.getElementById('app').append(toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/fx/comic.webp', alt: '四格漫畫：一、換美元去投資。小安拿著 330,000 元台幣；銀行賣出 33.0｜銀行買入 32.9；換到 10,000 美元。二、一年後漲了 10%。錢袋變成 11,000 美元，小安說：賺 10% 了！三、換回台幣。銀行賣出 31.5｜銀行買入 31.4；換回 345,400 元。小安問：怎麼只賺 4.7%？四、錢去哪了。股票漲 ＋32,950；美元變便宜 −16,500；換匯價差 −1,050；合計 ＋15,400。匯率是假設的例子，不是預測。' }),
    h('p', {}, '投資海外要換兩次匯：台幣換外幣時用銀行賣出匯率（比較貴），換回台幣時用銀行買入匯率（比較便宜），中間差的就是銀行的價差。'),
    h('p', {}, '外幣資產漲了，換回台幣不一定賺一樣多：外幣變便宜（台幣升值）會吃掉一部分報酬，外幣變貴則會多賺。'),
    h('p', {}, '這裡把台幣損益拆成四塊：資產漲跌、匯率變動、兩次換匯價差、手續費，加起來剛好等於總損益。')), disclaimer('general'));
