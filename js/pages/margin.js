// 工具⑤ 融資融券維持率（精靈頁）。公式只在 core/margin.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { marginPlan, shortSummary } from '../core/margin.js';
import { parseNum, fmtMoney, fmtPct, fmtX } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'margin');
const num = id => parseNum(document.getElementById(id)?.value);
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;
const hasLong = s => s.kind !== 'short';
const hasShort = s => s.kind !== 'long';
const pctSigned = n => (n >= 0 ? '+' : '−') + fmtPct(Math.abs(n), 2);

const steps = [
  {
    title: '你用了哪一種',
    hint: '打開券商 App 的「信用庫存」，看你是融資、融券，還是兩種都有。',
    about: '融資是借錢買股票，怕跌；融券是借股票先賣，怕漲。兩種都有時，券商看的是整戶維持率。',
    figure: { src: '../img/margin/step1.webp', alt: '卡通圖：融資和融券，差在哪？融資＝借錢買股票：自己出 40 萬、券商借 60 萬，買 100 萬股票；怕跌，股價跌約 22%，維持率碰到 130%。融券＝借股票先賣掉：賣出 10 萬，另交保證金 9 萬；怕漲，股價漲約 46%，維持率碰到 130%，漲多少虧多少，沒有上限。老師說：兩種都有，券商看的是整戶維持率，不是每一檔各自算。' },
    body: s => [
      withHelp(selectField({ id: 'kind', label: '你的信用交易', termId: 'margin-trading', options: [{ value: 'long', label: '只有融資（借錢買股）' }, { value: 'short', label: '只有融券（借股票先賣）' }, { value: 'both', label: '融資、融券都有' }], value: s.kind || 'long' }),
        { text: ['融資：信用庫存裡寫「融資」的股票。', '融券：信用庫存裡寫「融券」的股票。', '兩種都有：工具會算整戶維持率。'] })],
    read: s => { s.kind = document.getElementById('kind').value; }
  },
  {
    title: '你的信用庫存',
    hint: '照信用庫存填，代號填好現價會自動抓。同一邊有好幾檔就按「＋ 再加一檔」。',
    about: '這一步算出你的股票現在值多少。',
    body: s => [
      ...(hasLong(s) ? [holdingsInput({ id: 'longs', rows: s.longs?.length ? s.longs : [{}], label: '融資買進的股票' })] : []),
      ...(hasShort(s) ? [holdingsInput({ id: 'shorts', rows: s.shorts?.length ? s.shorts : [{}], label: '融券賣出的股票', side: 'short' })] : []),
      tokenBox()],
    read: s => {
      s.longs = hasLong(s) ? readHoldings('longs') : []; s.shorts = hasShort(s) ? readHoldings('shorts') : [];
      if (s.longs.length) holdingSummary(s.longs);
      if (s.shorts.length) shortSummary(s.shorts);
    }
  },
  {
    title: '借了多少、押了多少',
    hint: '成數看下單畫面；金額看對帳單或信用庫存，不知道就留白讓工具用成數算。',
    about: '這一步算出你欠券商多少（融資金額），押了多少（融券保證金）。',
    body: s => [
      ...(hasLong(s) ? [
        withHelp(selectField({ id: 'loanratio', label: '融資成數', termId: 'margin-trading', options: [{ value: '0.6', label: '6 成（一般）' }, { value: '0.5', label: '5 成（個股被調降）' }, { value: '0.4', label: '4 成（個股被調降）' }], value: String(s.loanRatio ?? 0.6) }),
          { text: ['上市、上櫃股票最高 6 成：買 100 萬，自己出 40 萬、借 60 萬。', '股價異常的個股會被調降成 5 成、4 成，下單時券商會顯示。'] }),
        numberInput({ id: 'loan', label: '融資金額合計（選填）', plain: '信用庫存的「融資金額」加總；留白就用成數算', value: s.loan, suffix: '元',
          help: { text: ['券商會把融資金額取整數，用成數算的會跟對帳單差一點。', '有填就用你填的數字。'] } })] : []),
      ...(hasShort(s) ? [
        numberInput({ id: 'deprate', label: '融券保證金成數', termId: 'short-selling', plain: '最低 9 成，填 90', value: s.depRate ?? 90, suffix: '%',
          help: { text: ['融券賣出時另外繳的保證金，占賣出價款的比例。', '最低 9 成；個股可能被提高，以券商顯示為準。'] } }),
        numberInput({ id: 'deposit', label: '保證金合計（選填）', plain: '信用庫存的「保證金」加總；留白就用成數算', value: s.deposit, suffix: '元',
          help: { text: ['有填就用你填的數字。'] } })] : [])],
    read: s => {
      if (hasLong(s)) {
        s.loanRatio = Number(document.getElementById('loanratio').value); s.loan = num('loan');
        if (!Number.isNaN(s.loan) && !(s.loan > 0)) throw new Error('融資金額要大於 0；不知道就留白。');
      }
      if (hasShort(s)) {
        s.depRate = num('deprate'); s.deposit = num('deposit');
        if (!(s.depRate >= 1 && s.depRate <= 200)) throw new Error('保證金成數填 1–200，常見 90。');
        if (!Number.isNaN(s.deposit) && !(s.deposit > 0)) throw new Error('保證金要大於 0；不知道就留白。');
      }
    }
  },
  {
    title: '追繳規則與利息',
    hint: '追繳線、補回目標先用預設值，以券商通知為準。利息選填。',
    about: '這一步決定維持率掉到哪裡會出事、要補回到哪裡。',
    body: s => [
      numberInput({ id: 'call', label: '追繳線', termId: 'margin-call', plain: '整戶維持率低於這裡會收到追繳；常見 130', value: s.call ?? 130, suffix: '%',
        help: { text: ['整戶維持率低於 130% 時，券商會發追繳通知。', '收到通知後通常要在 2 個交易日內補足，沒補足券商可以強制賣出（斷頭）。'] } }),
      numberInput({ id: 'target', label: '補回目標', termId: 'account-ratio', plain: '被追繳後要補回到多少；常見 166', value: s.target ?? 166, suffix: '%',
        help: { text: ['補到整戶維持率回到 166% 以上，追繳才會解除。', '實際要補多少以券商通知為準。'] } }),
      ...(hasLong(s) ? [
        numberInput({ id: 'rate', label: '融資年利率（選填）', plain: '常見 6–7，可以議價；留白不算利息', value: s.rate, suffix: '%',
          help: { text: ['按天計息、賣出時結算。'] } }),
        numberInput({ id: 'days', label: '打算融資幾天（選填）', plain: '例：30；留白不算利息', value: s.days, suffix: '天',
          help: { text: ['用日曆天算，跟年利率一起填才會算利息。'] } })] : [])],
    read: s => {
      s.call = num('call'); s.target = num('target');
      if (hasLong(s)) { s.rate = num('rate'); s.days = num('days'); }
      else { s.rate = NaN; s.days = NaN; }
      if (!(s.call >= 100)) throw new Error('追繳線填 100 以上，常見 130。');
      if (!(s.target >= s.call)) throw new Error('補回目標不能低於追繳線，常見 166。');
      if (!Number.isNaN(s.rate) && !(s.rate >= 0 && s.rate <= 100)) throw new Error('年利率填 0–100，例：6.5。');
      if (!Number.isNaN(s.days) && !(Number.isInteger(s.days) && s.days >= 0)) throw new Error('天數要是整數，例：30。');
    }
  }
];

function result(s) {
  const r = marginPlan({ longs: hasLong(s) ? s.longs : [], shorts: hasShort(s) ? s.shorts : [],
    loanRatio: s.loanRatio, loan: s.loan, depositRate: s.depRate / 100, deposit: s.deposit,
    call: s.call / 100, target: s.target / 100,
    rate: Number.isFinite(s.rate) ? s.rate / 100 : 0, days: Number.isFinite(s.days) ? s.days : 0 });
  const L = r.long, S = r.short;
  const ratioName = s.kind === 'both' ? '整戶維持率' : s.kind === 'long' ? '融資維持率' : '融券維持率';
  const how = s.kind === 'long' ? `融資股票現在值 ${fmtMoney(L.value)} ÷ 融資金額 ${fmtMoney(r.loan)}。`
    : s.kind === 'short' ? `(融券賣出價款 ${fmtMoney(S.proceeds)} ＋ 保證金 ${fmtMoney(r.deposit)}) ÷ 現在買回來要 ${fmtMoney(S.value)}。`
      : `(融資股票市值 ${fmtMoney(L.value)} ＋ 融券賣出價款 ${fmtMoney(S.proceeds)} ＋ 保證金 ${fmtMoney(r.deposit)}) ÷ (融資金額 ${fmtMoney(r.loan)} ＋ 融券股票市值 ${fmtMoney(S.value)})。`;
  const means = r.called ? `低於追繳線 ${s.call}%，會收到追繳通知。`
    : r.belowTarget ? `還沒低於追繳線 ${s.call}%，但已經低於補回目標 ${s.target}%，離追繳不遠。`
      : `高於補回目標 ${s.target}%，目前安全。`;
  const out = [explain({ label: ratioName, value: fmtPct(r.ratio, 2), tone: r.called ? 'bad' : r.belowTarget ? 'warn' : 'ok',
    how, means: means + (s.kind === 'both' ? '券商看的是整戶，不能把每一檔的維持率平均。' : '') })];
  if (r.called) out.push(explain({ label: `補現金（回到 ${s.target}%）`, value: fmtMoney(r.topup), tone: 'bad',
    how: `${s.target}% × ${fmtMoney(r.debt)} − ${fmtMoney(r.collateral)}。補進去的現金加在分子。`,
    todo: '收到追繳通知後，通常要在 2 個交易日內補足；沒補足，券商可以強制賣出（斷頭）。實際金額以券商通知為準。' }));
  if (r.called && r.loan > 0) out.push(explain({ label: '或：償還融資', value: fmtMoney(r.repay), tone: r.repayEnough ? 'warn' : 'bad',
    how: `${fmtMoney(r.debt)} − ${fmtMoney(r.collateral)} ÷ ${s.target}%。還錢讓分母變小。`,
    means: r.repayEnough ? `同樣回到 ${s.target}%，還融資要的錢比補現金少，但融資部位會變小。`
      : `要還的比融資金額 ${fmtMoney(r.loan)} 還多，光還融資補不回去，要補現金或買回融券的股票。` }));
  if (L) out.push(explain({ label: '融資股票再跌多少會被追繳', value: r.longDrop > 0 ? fmtPct(r.longDrop, 2) : '已經低於追繳線',
    tone: r.longDrop > 0.1 ? 'ok' : r.longDrop > 0 ? 'warn' : 'bad',
    how: (r.longDrop > 0 ? `假設融資的股票一起跌${s.kind === 'both' ? '、融券的股票不動' : ''}，維持率碰到 ${s.call}% 的參考價：`
      : `${s.kind === 'both' ? '融券的股票不動時，' : ''}融資的股票要漲回這個價格以上，維持率才回到 ${s.call}%：`) +
      r.perStock.filter(p => p.side === 'long').map(p => `${named(p.code)} ${p.callPrice.toFixed(2)} 元（比買進價 ${pctSigned(p.vsEntry)}）`).join('；') + '。',
    means: '維持率由券商收盤後計算，實際以券商通知為準。融資 6 成時，大約從買進價跌 22% 就碰到 130%。' }));
  if (S) out.push(explain({ label: '融券股票再漲多少會被追繳', value: r.shortRise > 0 ? fmtPct(r.shortRise, 2) : '已經低於追繳線',
    tone: r.shortRise > 0.1 ? 'ok' : r.shortRise > 0 ? 'warn' : 'bad',
    how: (r.shortRise > 0 ? `假設融券的股票一起漲${s.kind === 'both' ? '、融資的股票不動' : ''}，維持率碰到 ${s.call}% 的參考價：`
      : `${s.kind === 'both' ? '融資的股票不動時，' : ''}融券的股票要跌回這個價格以下，維持率才回到 ${s.call}%：`) +
      r.perStock.filter(p => p.side === 'short').map(p => `${named(p.code)} ${p.callPrice.toFixed(2)} 元（比融券賣出價 ${pctSigned(p.vsEntry)}）`).join('；') + '。',
    means: '融券怕漲：股價漲多少就虧多少，沒有上限。' }));
  if (L) out.push(explain({ label: '融資自備款', value: fmtMoney(r.ownCash),
    how: `買進成本 ${fmtMoney(L.cost)} − 融資金額 ${fmtMoney(r.loan)}。槓桿＝成本 ÷ 自備款＝${fmtX(r.leverage)}。`,
    means: `融資部位現在 ${signed(L.gain)}，等於自備款的 ${pctSigned(L.gain / r.ownCash)}。股價每跌 1%，自備款大約虧 ${r.leverage.toFixed(2)}%。` }));
  if (L && r.interest > 0) out.push(explain({ label: '融資利息', value: fmtMoney(r.interest),
    how: `${fmtMoney(r.loan)} × ${s.rate}% × ${s.days} 天 ÷ 365。`, means: '按天計息、賣出時結算；不算進維持率，但會吃掉獲利。' }));
  if (S) out.push(explain({ label: '融券損益', value: signed(S.gain), tone: S.gain >= 0 ? 'ok' : 'bad',
    how: `融券賣出價款 ${fmtMoney(S.proceeds)} − 現在買回來要 ${fmtMoney(S.value)}。`, means: '還沒扣手續費、證交稅和融券手續費（借券費）。' }));
  out.push(h('h3', {}, '一起漲跌時的維持率'),
    h('p', { class: 'tip' }, '假設你所有融資、融券的股票從現價一起漲跌同樣幅度。'),
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, ['漲跌（從現價）', ratioName, '狀態'].map(t => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, r.rows.map(row => h('tr', {},
        h('td', {}, row.move === 0 ? '現在' : (row.move > 0 ? '+' : '−') + Math.round(Math.abs(row.move) * 100) + '%'),
        h('td', {}, fmtPct(row.ratio, 2)),
        h('td', {}, row.called ? '追繳' : row.ratio < s.target / 100 ? '注意' : '安全'))))),
    h('div', { class: 'note' }, [
      '維持率由券商收盤後計算，盤中跌破不一定馬上通知；收到追繳通知後通常 2 個交易日內要補足，以券商為準。',
      '券商會把融資金額、保證金取整數；融券價款實際會先扣手續費、證交稅和借券費。這裡沒算，所以和對帳單會差一點。',
      '除權息前幾個交易日，券商會先用扣掉股利的價格算維持率，維持率可能突然變低。',
      '融資利率依券商，可以議價；融券還有強制回補日（例如股東會前），以券商通知為準。'
    ].map(n => h('p', {}, n))));
  return out;
}

const example = { kind: 'long', longs: [{ code: '2330', shares: 1000, buyPrice: 1000, nowPrice: 760 }], shorts: [],
  loanRatio: 0.6, loan: NaN, depRate: 90, deposit: NaN, call: 130, target: 166, rate: 6.5, days: 30 };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/margin/comic.webp', alt: '四格漫畫：一、小安融資買某檔股票 100 萬，自己出 40 萬、券商借 60 萬。二、老師說維持率＝股票市值 ÷ 融資金額，100 萬 ÷ 60 萬約 166.67%，越高越安全。三、股價跌 24%，76 萬 ÷ 60 萬約 126.67%，跌破 130%，收到追繳通知，2 個交易日內要補錢。四、補回 166% 有兩種做法：補現金 23.6 萬，或還融資約 14.2 萬；老師說沒在期限內補足，券商可以強制賣出（斷頭）。融資 6 成、追繳線 130%、補回 166% 是常見數字，以券商通知為準。' }),
    h('p', {}, '融資＝跟券商借錢買股票，上市櫃最高借 6 成。融券＝跟券商借股票先賣，要另繳 9 成保證金。'),
    h('p', {}, '融資怕跌、融券怕漲。維持率跌破 130% 會被追繳，要補回 166% 左右。'),
    h('p', {}, '補現金讓分子變大，還融資讓分母變小；同樣補回目標，還融資要的錢比較少。')),
  disclaimer('general'));
