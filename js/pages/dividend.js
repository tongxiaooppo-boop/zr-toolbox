// 工具⑩ 股息與除權息（精靈頁）。公式只在 core/dividend.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { dividendPlan, NHI_MIN } from '../core/dividend.js';
import { guessKind } from '../core/cost.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'dividend');
const num = id => parseNum(document.getElementById(id)?.value);
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));
const shares = n => n.toLocaleString('en-US') + ' 股';

const steps = [
  {
    title: '你持有什麼',
    hint: '填一檔你有的股票或 ETF：代號、股數、買入價。代號填好，現價會自動抓。',
    about: '這一步確定你有幾股、成本多少。股利是按股數發的。',
    figure: { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' },
    body: s => [holdingsInput({ id: 'hold', rows: s.holdings || [{}], max: 1, label: '你的持股' }), tokenBox()],
    read: s => {
      const [x] = readHoldings('hold');
      holdingSummary([x]);
      if (s.holdings?.[0]?.code !== x.code) { s.kind = guessKind(x.code); s.prevClose = x.nowPrice; }
      s.holdings = [x];
    }
  },
  {
    title: '這次發多少股利',
    hint: '照公司（或投信）的股利公告填。公告在券商 App 個股頁的「股利」或公開資訊觀測站。',
    about: '這一步算出你會領多少現金、多幾股。股票股利的「元」要除以面額，才是配股比例。',
    figure: { src: '../img/dividend/step2.webp', alt: '卡通圖：股利公告怎麼看？某檔股票股利公告：現金股利每股 2.4 元，填到每股現金股利；股票股利每股 0.5 元，填到每股股票股利。小安有 1 張（1,000 股）：現金 2.4 元 × 1,000 股＝2,400 元；配股 0.5 元 ÷ 面額 10 元＝5%，1,000 股 × 5%＝50 股。老師說：股票股利的元要除以面額，才是配股比例。多數公司面額 10 元，少數不是，依公告；ETF 通常只配現金。' },
    body: s => [
      withHelp(selectField({ id: 'exdone', label: '除權息日過了嗎', options: [{ value: 'no', label: '還沒，先算算看' }, { value: 'yes', label: '已經過了' }], value: s.exDone || 'no' }),
        { text: ['還沒過：除權息前收盤價就用現價（已自動帶入）。', '已經過了：要自己查除權息前一天的收盤價，結果會告訴你填息了沒。'] }),
      numberInput({ id: 'prevclose', label: '除權息前一天收盤價', termId: 'ex-dividend', plain: '還沒除權息就用現價', value: s.prevClose, suffix: '元',
        help: { text: ['除權息當天的參考價，就是用這個價格扣掉股利算出來的。', '已經除權息過了：在券商 App 的日 K 線找除權息前一天的收盤價。'] } }),
      numberInput({ id: 'cash', label: '每股現金股利', termId: 'dividend-yield', plain: '公告寫「現金股利 2.4 元」就填 2.4', value: s.cash ?? '', suffix: '元',
        help: { text: ['是每 1 股發多少錢，不是你總共領多少。', '沒有發現金就填 0。ETF 的「每單位配息」也填這裡。'] } }),
      numberInput({ id: 'stockdiv', label: '每股股票股利', plain: '公告寫「股票股利 0.5 元」就填 0.5；沒有填 0', value: s.stockDiv ?? 0, suffix: '元',
        help: { text: ['配股比例＝這個數字 ÷ 面額。面額 10 元時，0.5 元＝每 1,000 股配 50 股。', 'ETF 通常只配現金，填 0。'] } }),
      numberInput({ id: 'par', label: '股票面額', plain: '多數公司是 10 元', value: s.par ?? 10, suffix: '元',
        help: { text: ['少數公司面額不是 10 元（例：1 元），公告或公開資訊觀測站查得到。'] } })],
    read: s => {
      s.exDone = document.getElementById('exdone').value;
      s.prevClose = num('prevclose'); s.cash = num('cash'); s.stockDiv = num('stockdiv'); s.par = num('par');
      if (!(s.prevClose > 0)) throw new Error('除權息前收盤價要大於 0，例：50。');
      if (!(s.cash >= 0) || !(s.stockDiv >= 0)) throw new Error('股利不能是負的，沒有就填 0。');
      if (s.cash === 0 && s.stockDiv === 0) throw new Error('現金股利和股票股利至少填一個。');
      if (!(s.par > 0)) throw new Error('面額要大於 0，多數公司是 10 元。');
    }
  },
  {
    title: '健保身分',
    hint: '股利一次領到 2 萬元以上，會先被扣二代健保補充保費。',
    about: '這一步決定要不要扣補充保費。大多數人選「一般」。',
    body: s => [
      withHelp(selectField({ id: 'identity', label: '健保身分', termId: 'nhi-premium', plain: '不確定就選一般',
        options: [{ value: 'general', label: '一般（受僱、自己投保、依附眷屬）' }, { value: 'exempt', label: '符合免扣資格（例：中低收入戶，依健保署規定）' }], value: s.identity || 'general' }),
      { text: ['一般身分：單次股利所得達 20,000 元，全額 × 2.11%，由發股利的公司直接扣。', '以雇主或自營業主身分投保的人另有扣除規則，這裡沒有算，請以健保署為準。'] })],
    read: s => { s.identity = document.getElementById('identity').value; }
  }
];

function result(s) {
  const [x] = s.holdings;
  const after = s.exDone === 'yes';
  const r = dividendPlan({ shares: x.shares, prevClose: s.prevClose, cashPerShare: s.cash, stockPerShare: s.stockDiv, par: s.par,
    buyPrice: x.buyPrice, nowPrice: after ? x.nowPrice : undefined, identity: s.identity });
  const name = STOCK_NAMES[x.code] ? `${x.code} ${STOCK_NAMES[x.code]}` : x.code;
  const refPrice = r.refPrice.toFixed(2);
  const incomeParts = `現金 ${fmtMoney(r.cashTotal)}` + (r.stockIncome > 0 ? ` ＋ 股票股利面額 ${fmtMoney(r.stockIncome)}` : '');
  const premiumHow = s.identity === 'exempt' ? '你選了免扣資格，不扣。'
    : r.income < NHI_MIN ? `這次股利所得 ${fmtMoney(r.income)}（${incomeParts}），未達 20,000 元，不扣。`
    : `${r.stockIncome > 0 ? `（${incomeParts}）` : incomeParts} × 2.11%＝${fmtMoney(r.premium)}（四捨五入）。`;
  const out = [];
  if (s.cash !== 0) out.push(explain({ label: '現金股利', value: fmtMoney(r.cashTotal),
    how: `${name}：每股 ${s.cash} 元 × ${shares(x.shares)}＝${fmtMoney(r.cashTotal)}（元以下捨去）。`,
    means: '發放日以公告為準，匯進你的交割帳戶。' }));
  if (s.stockDiv !== 0) out.push(explain({ label: '配股', value: shares(r.newShares),
    how: `配股比例＝${s.stockDiv} ÷ 面額 ${s.par}＝${fmtPct(r.stockRate, 2)}；${shares(x.shares)} × 配股比例＝${r.newSharesExact.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 股。` + (r.newSharesExact !== r.newShares ? '不足 1 股的部分依公司公告處理（通常折發現金）。' : ''),
    means: `除權後你有 ${shares(r.sharesAfter)}。` }));
  out.push(
    explain({ label: '二代健保補充保費', value: fmtMoney(r.premium), tone: r.premium > 0 ? 'warn' : undefined,
      how: premiumHow, means: '由發股利的公司直接從現金股利扣掉。' }),
    explain({ label: '實領現金', value: fmtMoney(r.netCash), tone: 'ok',
      how: `現金股利 ${fmtMoney(r.cashTotal)} − 補充保費 ${fmtMoney(r.premium)}。`,
      means: '這是會進帳的錢；所得稅另外在報稅時算（見下方注意）。' }),
    explain({ label: '除權息參考價', value: `${refPrice} 元`,
      how: s.stockDiv === 0 ? `${s.prevClose} − ${s.cash}。` : `（${s.prevClose} − ${s.cash}）÷（1 ＋ ${fmtPct(r.stockRate, 2)}）。`,
      means: '除權息當天的開盤參考，不是預測會成交在哪；實際參考價會對齊升降單位，以證交所公告為準。' }),
    explain({ label: '除權息前後總值', value: `${fmtMoney(r.valueBefore)} → ${fmtMoney(r.valueAfter)}`,
      how: `前：${shares(x.shares)} × ${s.prevClose} 元。後：${shares(r.sharesAfter)} × ${refPrice} 元 ＋ 現金股利 ${fmtMoney(r.cashTotal)}。`,
      means: '總值幾乎不變：股利是從股價搬到你口袋，不是多賺的。' + (r.premium > 0 ? `扣掉補充保費 ${fmtMoney(r.premium)}，反而少一點。` : '') }));
  if (s.cash !== 0) out.push(explain({ label: '現金殖利率', value: fmtPct(r.cashYield, 2),
    how: `每股現金股利 ${s.cash} ÷ 除權息前收盤價 ${s.prevClose}。`,
    means: x.buyPrice > 0 ? `用你的買入價 ${x.buyPrice} 元算，成本殖利率是 ${fmtPct(r.costYield, 2)}。比較不同股票要用同一種分母。` : '殖利率高不等於賺得多，還要看股價有沒有漲回來。' }));
  out.push(explain({ label: '填息要漲多少', value: fmtPct(r.fillPct, 2), tone: r.filled === null ? undefined : r.filled ? 'ok' : 'warn',
    how: `從參考價 ${refPrice} 元漲回 ${s.prevClose} 元：${s.prevClose} ÷ ${refPrice} − 1。`,
    means: r.filled === true ? `現價 ${x.nowPrice} 元已回到 ${s.prevClose} 元，已經填息。`
      : r.filled === false ? `現價 ${x.nowPrice} 元，還差 ${(s.prevClose - x.nowPrice).toFixed(2)} 元才填息。`
      : `除權息後股價漲回 ${s.prevClose} 元才叫填息（有配股叫填權），不保證，也沒有期限。` }));
  if (x.buyPrice > 0) out.push(explain({ label: '含息損益', value: signed(r.profitAfter), tone: r.profitAfter >= 0 ? 'ok' : 'bad',
    how: `${shares(r.sharesAfter)} × 參考價 ${refPrice} 元 ＋ 實領現金 ${fmtMoney(r.netCash)} − 買進成本 ${fmtMoney(r.costTotal)}（${shares(x.shares)} × ${x.buyPrice} 元）。`,
    means: `除權息前是 ${signed(r.profitBefore)}，差的就是補充保費。手續費、證交稅沒算，買賣成本請用 ⑨。` }));
  out.push(h('div', { class: 'note' }, [
    '所得稅沒有算：股利所得可選合併計稅（8.5% 可抵減，每戶上限 8 萬元）或分開計稅 28%，要看你全年所得。',
    'ETF 的收益分配不一定全是股利所得，補充保費與所得稅的計算以配息通知為準；這裡用全額估，是上限。',
    '現金增資、減資、分割、匯費等沒有算；實際金額以公司公告與券商入帳為準。'
  ].map(n => h('p', {}, n))));
  return out;
}

const example = { holdings: [{ code: '2412', shares: 10000, buyPrice: 40, nowPrice: 50 }], kind: 'stock',
  exDone: 'no', prevClose: 50, cash: 2.4, stockDiv: 0.5, par: 10, identity: 'general' };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/dividend/comic.webp', alt: '四格漫畫：一、除權息前一天，小安有某檔股票 10,000 股 × 50 元＝500,000 元。二、股利來了：現金股利 2.4 元 × 10,000 股＝24,000 元，股票股利 0.5 元多 500 股，健保補充保費 −612 元。三、除權息當天參考價 45.33 元，10,500 股 × 45.33 元約 476,000 元，加現金 24,000 元還是 500,000 元。四、老師說股價要從 45.33 元漲 10.29% 回到 50 元才叫填權息；股利是從股價搬到你口袋，股價漲回來才算真的賺到。補充保費＝（現金 24,000＋股票股利面額 5,000）× 2.11%。' }),
    h('p', {}, '發股利那天叫除權息：股價先扣掉發出去的股利，所以你的總值幾乎不變。'),
    h('p', {}, '股利要等股價漲回除權息前的價格（填息），才算真的賺到；一直沒漲回來叫貼息，領了股利還是虧。'),
    h('p', {}, '單次股利達 2 萬元會先扣 2.11% 補充保費；殖利率比較要用同一種分母（現價或你的成本）。')),
  disclaimer('general'));
