// 工具② 50/50 觸發提醒（v5.6 精靈）。公式只在 core/trigger.js 的 trigger5050Plan；依日期抓價用 net/price.js 的 fetchCloseOn。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { trigger5050Plan } from '../core/trigger.js';
import { fetchCloseOn, fetchEvents, getToken, setToken } from '../net/price.js';
import { normalizeEvents, adjustBasePrice } from '../core/events.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'trigger5050');
const num = id => parseNum(document.getElementById(id)?.value);
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;
const price = n => `${+n.toFixed(2)} 元`;
const link = (href, text) => h('a', { href }, text);

const steps = [
  {
    title: '你的正二',
    hint: '只填這個 50/50 策略裡的那一檔正二。股數和成本均價照券商 App「現在」顯示的填（分割、除權後券商會自動換算）。',
    about: '這一步記下正二現在值多少。現價填好代號會自動抓最近收盤價。',
    figure: { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' },
    body: s => [holdingsInput({ id: 'lever', rows: s.lever || [{}], max: 1, label: '你的正二' }), tokenBox()],
    read: s => { s.lever = readHoldings('lever'); holdingSummary(s.lever); }
  },
  {
    title: '基準價：上次配回時的價格',
    hint: '從沒配回過就用買入價；配回過就填那天的日期，工具會抓那天的收盤價。',
    about: '漲跌一半是跟「基準價」比，不是跟買入價比。每配回一次，基準價就換成那天的價格。',
    figure: { src: '../img/trigger5050/step2.webp', alt: '插圖：基準價＝上次配回各半時的正二價格。小安說我忘了上次是多少錢。三條路：一、從沒配回過，用當初的買入價（券商 App 庫存的成本均價）；二、配回過、記得日期，填那天的日期，工具自動抓那天的收盤價，那天沒開盤就用前一個交易日；三、自己有記下價格，直接填。老師提醒：中間如果有分割（1 股拆成好幾股），舊價格要換算才能比，不然會差很多倍。' },
    body: s => {
      const sourceField = withHelp(selectField({ id: 'from', label: '上次配回是什麼時候', termId: 'base-price', options: [
        { value: 'buy', label: '從沒配回過（用買入價）' },
        { value: 'date', label: '配回過，我記得日期' },
        { value: 'manual', label: '我有記下當時的價格' }
      ], value: s.baseFrom || 'buy' }), { text: ['從沒配回過：基準價就是你當初的買入價。', '配回過：填配回那天的日期，工具抓那天的收盤價當基準價。', '有記下價格：直接在下面填。如果之後有分割或除權息，要填換算後的價格；不確定就改選「我記得日期」讓工具換算。'] });
      const maxDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const date = h('input', { id: 'baseDate', type: 'date', value: s.baseDate || '', max: maxDate });
      const status = h('small', { id: 'date-status', class: 'holding-status', 'aria-live': 'polite' });
      const dateField = withHelp(h('div', { id: 'date-field', class: 'field' },
        h('label', { for: 'baseDate' }, '上次配回的日期'),
        h('small', { class: 'plain-sub' }, '填好會自動抓那天的收盤價'), date, status),
      { text: ['做完配回那天的日期。', '那天沒開盤（假日、颱風假），會用前一個交易日的收盤價。'] });
      const baseField = numberInput({ id: 'basePrice', label: '基準價', termId: 'base-price', plain: '自動帶入，也可以自己改', value: s.basePrice, suffix: '元',
        help: { text: ['之後漲跌幾 % 都跟這個價格比。', '用券商 App 查到的價格也可以直接改在這裡。'] } });
      const from = sourceField.querySelector('select');
      const base = baseField.querySelector('input');
      let seq = 0;
      const lookup = async () => {
        const request = ++seq, requestedDate = date.value;
        if (from.value !== 'date' || !requestedDate) { status.textContent = ''; return; }
        s.baseRaw = NaN; s.baseEvents = [];
        status.textContent = '查詢中…';
        try {
          const r = await fetchCloseOn(s.lever[0].code, requestedDate, { token: getToken() });
          if (request !== seq || from.value !== 'date' || !date.isConnected) return;
          if (r.clearToken) setToken('');
          if (r.ok) {
            status.textContent = `抓到 ${r.date} 的收盤價 ${r.close} 元，查詢之後的股票事件中…`;
            const ev = await fetchEvents(s.lever[0].code, r.date, { token: getToken() });
            if (request !== seq || from.value !== 'date' || !date.isConnected) return;
            if (ev.clearToken) setToken('');
            if (!ev.ok) {
              base.value = '';
              s.baseRaw = NaN; s.baseEvents = [];
              status.textContent = `抓到 ${r.date} 的收盤價 ${r.close} 元，但查不到之後的分割、除權息資料（${ev.message}），沒辦法換算。請改選「從沒配回過」用券商 App 的成本均價，或自己填換算後的價格。`;
              return;
            }
            const list = normalizeEvents(ev.raw);
            const a = adjustBasePrice(r.close, r.date, list);
            base.value = +a.adjusted.toFixed(4);
            s.baseRaw = r.close; s.baseRawDate = r.date; s.baseEvents = a.applied; s.baseAdjusted = +a.adjusted.toFixed(4);
            const fallback = r.date !== requestedDate ? `（${requestedDate} 沒開盤，用前一個交易日）` : '';
            if (a.applied.length === 0) {
              status.replaceChildren(`抓到 ${r.date} 的收盤價 ${r.close} 元；之後沒有分割、除權息。${fallback}`);
            } else {
              status.replaceChildren(`抓到 ${r.date} 的收盤價 ${r.close} 元；之後有 ${a.applied.length} 個股票事件，已換算成現在的基準 ${price(a.adjusted)}：`,
                h('ul', {}, a.applied.map(e => h('li', {}, `${e.date} ${e.note}`))), fallback);
            }
          } else status.textContent = r.message;
        } catch {
          if (request === seq && from.value === 'date' && date.isConnected) status.textContent = '查詢失敗，請稍後再試，或直接手動填基準價。';
        }
      };
      from.addEventListener('change', () => {
        ++seq;
        status.textContent = '';
        dateField.hidden = from.value !== 'date';
        if (from.value !== 'date') { s.baseEvents = []; s.baseRaw = NaN; }
        if (from.value === 'buy') base.value = s.lever[0].buyPrice;
        if (from.value === 'date' && date.value) lookup();
      });
      date.addEventListener('change', lookup);
      base.addEventListener('input', () => { ++seq; status.textContent = ''; s.baseEvents = []; s.baseRaw = NaN; });
      dateField.hidden = from.value !== 'date';
      if (from.value === 'buy') base.value = s.lever[0].buyPrice; // 「用買入價」一律跟第 1 步的買入價同步
      return [sourceField, dateField, baseField];
    },
    read: s => {
      s.baseFrom = document.getElementById('from').value;
      s.baseDate = document.getElementById('baseDate').value;
      s.basePrice = num('basePrice');
      s.baseEvents ??= [];
      if (!(s.basePrice > 0)) throw new Error(s.baseFrom === 'date' ? '基準價還沒抓到：確認日期，或直接手動填基準價。' : '基準價要大於 0。');
    }
  },
  {
    title: '策略現金與門檻',
    hint: '現金只算留給這個策略的錢，不是你全部的存款。',
    about: '配回時用「正二市值＋策略現金」各分一半。門檻是漲跌多少要動，大仁原文用 50%。',
    body: s => [
      numberInput({ id: 'cash', label: '策略現金', termId: 'rebalance', plain: '留給這個策略、還沒買正二的錢，例：100000', value: s.cash, suffix: '元',
        help: { text: ['開始時跟正二各一半的那筆現金，之後配回時進出的錢也算在這裡。', '其他用途的存款不要算進來。'] } }),
      numberInput({ id: 'threshold', label: '觸發門檻（選填）', plain: '漲或跌超過幾 % 就配回；留白＝50', value: s.threshold, suffix: '%',
        help: { text: ['大仁 50/50 原文：正二相對基準價漲或跌 50% 就配回。', '想更常配回可以改小（例：30），可填 10–90。'] } })],
    read: s => {
      s.cash = num('cash'); s.threshold = num('threshold');
      if (!(s.cash >= 0)) throw new Error('策略現金要填 0 以上的數字；沒有就填 0。');
    }
  }
];

function result(s) {
  const L = s.lever[0], t = Number.isNaN(s.threshold) ? 50 : s.threshold;
  const r = trigger5050Plan({ shares: L.shares, nowPrice: L.nowPrice, basePrice: s.basePrice, cash: s.cash, threshold: t / 100 });
  const name = named(L.code);
  const adjustment = s.baseFrom === 'date' && s.baseEvents?.length && s.basePrice === s.baseAdjusted
    ? [explain({ label: '基準價已換算股票事件', value: price(s.basePrice), tone: 'info',
      how: `${s.baseRawDate} 收盤 ${price(s.baseRaw)}` + s.baseEvents.map(e => ` × ${e.after} ÷ ${e.before}（${e.date} ${e.note}）`).join('') + `＝${price(s.basePrice)}。`,
      means: '分割、除權息之後股價會變，不換算就會把它誤當成漲跌。換算後才能跟現價比。',
      todo: s.baseEvents.some(e => e.kind === 'dividend') ? '領到的現金股利，記得加進第 3 步的策略現金。' : null })]
    : [];
  const change = explain({ label: `${name} 相對基準價`, value: (r.change > 0 ? '+' : '') + fmtPct(r.change), tone: r.hit ? 'warn' : 'info',
      how: `現價 ${price(L.nowPrice)} ÷ 基準價 ${price(s.basePrice)} − 1。`,
      means: '漲跌是跟上次配回時比，不是跟買入價比。' });
  const note = h('div', { class: 'note' },
    h('p', {}, '只算這個策略裡的正二和現金；沒算手續費和稅。'),
    h('p', {}, '做法出自大仁「50 正 2 槓桿 ETF 搭配再平衡」：一半正二、一半現金，正二相對基準價漲跌 50% 就配回。'));
  // 疑似分割：漲跌幅不可信，不給「要買賣幾股」，只請使用者先換算基準價（Opus 2026-11-09：實測 00631L 分割前後 375.25→26.3）
  if (r.suspectSplit) return [...adjustment, change, explain({ label: '價格差很多倍', value: '先確認基準價', tone: 'bad',
    how: `現價 ${price(L.nowPrice)} 和基準價 ${price(s.basePrice)} 差 5 倍以上。`,
    means: '中間可能有分割或合併（例：1 股拆成好幾股）。工具抓的是當天的原始價格，沒有換算，所以上面的漲跌幅不能用，也先不算要買賣幾股。',
    todo: ['① 打開券商 App，照現在的股數和成本均價重填第 1 步，第 2 步選「從沒配回過」；', '② 第 2 步選「我記得日期」，工具會自動換算分割和除權息。'] }), note];
  const out = [...adjustment, change,
    explain({ label: '到門檻了嗎', value: r.hit ? (r.direction === 'up' ? '漲到了，要配回' : '跌到了，要配回') : '還沒，不用動', tone: r.hit ? 'warn' : 'ok',
      how: `門檻 ${t}%：漲到 ${price(r.upPrice)}（${price(s.basePrice)} ×（1＋${t}%））或跌到 ${price(r.downPrice)}（${price(s.basePrice)} ×（1−${t}%））才要動。`,
      means: r.hit ? '用現在的總額配回正二、現金各半。' : `價格在 ${price(r.downPrice)}～${price(r.upPrice)} 之間都不用動，下次再來看。` })
  ];
  if (r.hit) out.push(explain({ label: r.tradeShares >= 0 ? '要買進' : '要賣出', value: `${Math.abs(r.tradeShares).toLocaleString('en-US')} 股`, tone: 'warn',
    how: `正二 ${L.shares.toLocaleString('en-US')} 股 × ${price(L.nowPrice)}＝${fmtMoney(r.value)}，加現金 ${fmtMoney(s.cash)}＝${fmtMoney(r.total)}，各一半＝${fmtMoney(r.target)}；（${fmtMoney(r.target)} − ${fmtMoney(r.value)}）÷ ${price(L.nowPrice)}，${r.tradeShares >= 0 ? '無條件捨去' : '四捨五入'}。`,
    means: `約 ${fmtMoney(Math.abs(r.tradeAmount))}。做完後正二約 ${fmtMoney(r.leverAfter)}、現金約 ${fmtMoney(r.cashAfter)}。` + (r.tradeShares >= 0 ? '買進去的錢，如果之後下跌，一樣會跟著跌。' : ''),
    todo: ['下單前用 ', link('cost.html', '⑨ 買賣成本與損益'), ' 算手續費和稅；這裡沒算。'] }));
  out.push(explain({ label: '下次的觸發價', value: `${price(r.nextDown)}／${price(r.nextUp)}`, tone: 'info',
    how: r.hit ? `配回後基準價換成今天的 ${price(r.newBase)}；× (1 ± ${t}%)。` : `基準價還是 ${price(r.newBase)}；× (1 ± ${t}%)。`,
    means: `跌到 ${price(r.nextDown)} 或漲到 ${price(r.nextUp)} 再來配回。`,
    todo: r.hit ? '把今天的日期和價格記下來，下次第 2 步填這個日期就好。' : null }));
  out.push(note);
  return out;
}

const example = { lever: [{ code: '00631L', shares: 5000, buyPrice: 20, nowPrice: 30.5 }], baseFrom: 'buy', baseDate: '', basePrice: 20, cash: 100000, threshold: NaN };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/trigger5050/comic.webp', alt: '四格漫畫：一、一開始正二 5,000 股 × 20 元＝10 萬、現金 10 萬，記下 20 元當基準價。二、20 × 1.5＝30 元漲到要動，20 × 0.5＝10 元跌到也要動，中間不用管。三、漲到 30.5 元：正二 152,500 加現金 100,000＝252,500，各一半 126,250，賣 861 股收回約 26,261 元。四、新基準價 30.5 元，下次漲到 45.75 元或跌到 15.25 元；跌到時反過來拿現金買正二，買進去的錢之後還可能繼續跌。沒算手續費和稅；賣出股數四捨五入。' }),
    figure({ src: '../img/trigger5050/split-5050.svg', alt: '50/50 配回圖解：正二漲到 +50% 時賣出 2.5 萬、跌到 −50% 時買進 2.5 萬，配回後兩邊相等。', caption: '同樣從正二、現金各 10 萬開始，漲到與跌到時各配回一次。' }),
    h('p', {}, '這是大仁 50/50 的做法：一半正二、一半現金。正二相對基準價漲或跌 50% 時，用當時的總額配回各半；沒到就不動。'),
    h('p', {}, '漲到時會賣掉一些正二收回現金；跌到時會拿現金補正二。跌到時補進去的錢，如果之後繼續跌，一樣會跟著跌。'),
    h('p', {}, ['其他槓桿做法（532、質押、目標倍數）的比較，看 ', link('exposure.html', '⑪ 正二要買多少'), ' 頁尾的對照表。'])),
  disclaimer('general'));
