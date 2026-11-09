// 工具⑨ 買賣成本與損益（v5 精靈，結構照 js/pages/pledge.js）。公式只在 core/cost.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { tradeCost, guessKind, defaultMinFee, tickSize, TAX_UNTIL } from '../core/cost.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'cost');
const num = id => parseNum(document.getElementById(id)?.value);
const yuan = n => Math.round(n).toLocaleString('en-US') + ' 元';
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));
const KIND = [
  { value: 'stock', label: '股票（證交稅 0.3%）' },
  { value: 'etf', label: 'ETF，含 0050、正二（證交稅 0.1%）' },
  { value: 'bond-etf', label: '債券 ETF（證交稅停徵）' }
];
const KIND_NAME = { stock: '股票', etf: 'ETF', 'bond-etf': '債券 ETF' };
const DAY = [{ value: 'no', label: '不是，買賣不同天' }, { value: 'yes', label: '是，同一天買進又賣出（現股當沖）' }];

const steps = [
  {
    title: '你買了什麼',
    hint: '填一筆交易：哪一檔、買幾股、買在多少。代號填好，現價會自動抓。',
    about: '這一步算出「買進花了多少」。打開券商 App 的庫存或成交回報，照下圖找數字。',
    figure: { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' },
    body: s => [holdingsInput({ id: 'hold', rows: s.holdings || [{}], max: 1, label: '這筆交易' }), tokenBox()],
    read: s => {
      const [x] = readHoldings('hold');
      holdingSummary([x]);
      // 換了代號或股數，才重新猜商品類型、低消、預設賣價；沒換就保留使用者改過的值
      if (s.holdings?.[0]?.code !== x.code) { s.kind = guessKind(x.code); s.sellPrice = x.nowPrice; }
      if (s.holdings?.[0]?.shares !== x.shares) s.minFee = defaultMinFee(x.shares);
      s.holdings = [x];
    }
  },
  {
    title: '商品類型與券商費率',
    hint: '商品類型已經依代號猜好，請確認。折扣和最低手續費看券商 App 的「手續費設定」或開戶時的說明。',
    about: '這一步決定「被收多少費用」。手續費給券商、買賣都收；證交稅給政府、只有賣出收。',
    figure: { src: '../img/cost/step2.webp', alt: '卡通圖：一買一賣，錢被誰收走？左邊手續費給券商，買賣都收，成交金額 × 0.1425% × 折扣，2.8 折就是 0.0399%，最低收費整股常見 20 元、零股常見 1 元。右邊證交稅給政府，只有賣出才收：股票 0.3%、ETF 0.1%、股票當沖 0.15%，債券 ETF 停徵到 2026 年底。老師說：折扣只打在手續費，證交稅不會打折。' },
    body: s => [
      withHelp(selectField({ id: 'kind', label: '商品類型', termId: 'transaction-tax', plain: '影響賣出時的證交稅', options: KIND, value: s.kind || 'stock' }),
        { text: ['代號 00 開頭的多半是 ETF（例：0050、00631L），00 開頭又以 B 結尾的是債券 ETF（例：00679B），其他是股票。', '已經幫你依代號猜好；不確定就看券商 App 上的商品名稱。'] }),
      withHelp(selectField({ id: 'day', label: '是不是當沖', plain: '同一天買進又賣出', options: DAY, value: s.dayTrade || 'no' }),
        { text: ['現股當沖＝同一個交易日先買後賣（或先賣後買）同一檔。', '股票當沖的證交稅減半為 0.15%（到 2027-12-31）；ETF 當沖還是 0.1%。'] }),
      numberInput({ id: 'discount', label: '券商手續費折扣', termId: 'broker-fee', plain: '2.8 折就填 2.8；沒打折填 10', value: s.discount ?? 10, suffix: '折',
        help: { text: ['券商說「手續費 2.8 折」就填 2.8，等於 0.1425% × 0.28 ＝ 0.0399%。', '有些券商是先收全額、月底才退回折扣（退佣）；想看當下實付就填 10。'] } }),
      numberInput({ id: 'minfee', label: '單筆最低手續費', plain: '整股常見 20 元，零股常見 1 元', value: s.minFee ?? 20, suffix: '元',
        help: { text: ['手續費算出來比這個少，就收這個數字。', '已經依股數預填：整張填 20、零股填 1。你的券商不同就改掉。'] } })],
    read: s => {
      s.kind = document.getElementById('kind').value; s.dayTrade = document.getElementById('day').value;
      s.discount = num('discount'); s.minFee = num('minfee');
      if (!(s.discount > 0 && s.discount <= 10)) throw new Error('折扣填 0.1–10，例：2.8；沒打折填 10。');
      if (!(s.minFee >= 0)) throw new Error('最低手續費填 0 以上的數字，例：20。');
    }
  },
  {
    title: '打算賣在多少',
    hint: '想試算賣出的價格。預設是現價，可以改成你想掛的價格。',
    about: '這一步算出「賣掉實拿多少、賺賠多少」，以及至少要賣在多少才不虧。',
    figure: { src: '../img/cost/step3-break-even.svg', alt: '數線：100 元買 1 張股票。原價 100 元賣出虧 584 元；掛 100.5 元還虧 86 元；理論不虧價 100.587 元；實際要掛 101 元，賺 412 元。100–500 元的股票每檔跳 0.5 元，100.587 掛不出去，要往上取到 101。' },
    body: s => [
      numberInput({ id: 'sell', label: '賣出價', termId: 'break-even-price', plain: '每股想賣多少錢', value: s.sellPrice, suffix: '元',
        help: { text: ['想賣的每股價格。還沒想好就用預設的現價，結果會同時告訴你「賣多少才不虧」。', '實際掛單要符合升降單位，例：100–500 元的股票只能掛 0.5 元一跳。'] } })],
    read: s => {
      s.sellPrice = num('sell');
      if (!(s.sellPrice > 0)) throw new Error('賣出價要大於 0，例：105。');
    }
  }
];

function result(s) {
  const [x] = s.holdings;
  const dayTrade = s.dayTrade === 'yes';
  const r = tradeCost({ kind: s.kind, dayTrade, shares: x.shares, buyPrice: x.buyPrice, sellPrice: s.sellPrice, discount: s.discount / 10, minFee: s.minFee });
  const name = STOCK_NAMES[x.code] ? `${x.code} ${STOCK_NAMES[x.code]}` : x.code;
  const feeHow = (amount, fee) => {
    const raw = Math.floor(amount * r.feeRate + 1e-7);
    return `${yuan(amount)} × 0.1425%${s.discount < 10 ? ` × ${s.discount} 折` : ''}＝${raw} 元` + (raw < s.minFee ? `，不到最低手續費，收 ${s.minFee} 元` : '（元以下捨去）');
  };
  const sell = r.sell;
  const out = [
    explain({ label: '買入總成本', value: fmtMoney(r.buyTotal),
      how: `${name}：${x.buyPrice} 元 × ${x.shares.toLocaleString('en-US')} 股＝${yuan(r.buyAmount)}；手續費 ${feeHow(r.buyAmount, r.buyFee)}。`,
      means: '買進時實際從帳戶付出去的錢（成交後第 2 個營業日扣款）。' }),
    explain({ label: '賣出實拿', value: fmtMoney(sell.net),
      how: `${s.sellPrice} 元 × ${x.shares.toLocaleString('en-US')} 股＝${yuan(sell.amount)}；扣手續費 ${feeHow(sell.amount, sell.fee)}；扣證交稅 ${yuan(sell.amount)} × ${fmtPct(r.rate, r.rate === 0.0015 ? 2 : 1)}＝${yuan(sell.tax)}。`,
      means: '扣完費用，真正回到帳戶的錢（成交後第 2 個營業日入帳）。' }),
    explain({ label: '這筆交易賺賠', value: `${signed(r.profit)}（${fmtPct(r.profitPct, 2)}）`, tone: r.profit >= 0 ? 'ok' : 'bad',
      how: `賣出實拿 ${fmtMoney(sell.net)} − 買入總成本 ${fmtMoney(r.buyTotal)}。報酬率用買入總成本當分母。`,
      means: r.profit >= 0 ? '扣掉所有費用後真正賺到的錢。' : (s.sellPrice >= x.buyPrice ? '賣價沒比買價低，還是虧：一買一賣的費用吃掉了價差。' : '賣價比買價低，加上費用，虧得比價差多。') }),
    explain({ label: '一買一賣總費用', value: fmtMoney(r.totalCost),
      how: `買進手續費 ${r.buyFee} ＋ 賣出手續費 ${sell.fee} ＋ 證交稅 ${sell.tax}。`,
      means: `占買進金額 ${fmtPct(r.totalCost / r.buyAmount, 3)}。進出越頻繁，這筆錢累積越多。` }),
    explain({ label: '至少要賣在這裡才不虧', value: `${r.breakEvenTick} 元`, tone: 'warn',
      how: `理論上賣 ${r.breakEven.toFixed(3)} 元剛好不賺不賠；${KIND_NAME[s.kind]}在這個價位每檔跳 ${tickSize(r.breakEven, s.kind)} 元，往上取到掛得出去的 ${r.breakEvenTick} 元。`,
      means: `比買入價高 ${fmtPct(r.breakEvenTick / x.buyPrice - 1, 2)}。`,
      todo: `想不虧，賣單至少掛 ${r.breakEvenTick} 元。` })
  ];
  const notes = [];
  if (s.kind === 'bond-etf') notes.push(`債券 ETF 證交稅停徵到 ${TAX_UNTIL['bond-etf']}，之後可能恢復課徵。`);
  if (dayTrade && s.kind === 'stock') notes.push(`股票現股當沖證交稅 0.15% 是減半優惠，到 ${TAX_UNTIL.dayTrade}。`);
  if (dayTrade && s.kind !== 'stock') notes.push('ETF 當沖沒有減半，證交稅還是 0.1%。');
  if (s.discount < 10) notes.push('如果你的券商是月底退佣，當下會先收全額手續費，退回的錢晚點才入帳。');
  notes.push('股利、借券費、融資利息沒有算進來；實際金額以券商對帳單為準。');
  out.push(h('div', { class: 'note' }, notes.map(n => h('p', {}, n))));
  return out;
}

const example = { holdings: [{ code: '2317', shares: 1000, buyPrice: 100, nowPrice: 100 }], kind: 'stock', dayTrade: 'no', discount: 10, minFee: 20, sellPrice: 100 };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/cost/comic.webp', alt: '四格漫畫：一、小安用 100 元買 1 張（1,000 股）某檔股票，股票錢 100,000 元加手續費 142 元，共付 100,142 元。二、原價賣出 100,000 元，扣手續費 142 元、證交稅 300 元，實拿 99,558 元。三、不漲不跌，一買一賣少了 584 元（142＋142＋300）。四、老師說理論不虧價是 100.587 元，100 到 500 元的股票每檔跳 0.5 元，所以要賣 101 元以上才不虧。手續費以 0.1425%、不打折、最低 20 元計，股票證交稅 0.3%。' }),
    h('p', {}, '每買一次、賣一次都要付手續費給券商；賣出時還要繳證交稅給政府。所以股價不漲不跌，一買一賣也會虧。'),
    h('p', {}, '手續費有最低收費（整股常見 20 元），零股或小額交易時，費用占的比例會變高。證交稅不會打折：股票 0.3%、ETF 0.1%。'),
    h('p', {}, '「損益兩平價」告訴你至少要賣在多少才不虧。掛單價格要對齊升降單位，所以要往上取到掛得出去的價位。')),
  disclaimer('general'));
