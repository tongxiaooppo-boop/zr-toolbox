// 工具⑮ 平均成本與攤平；公式只呼叫 core/avgcost.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, lotsInput, readLots, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary } from '../core/holdings.js';
import { avgCostPlan } from '../core/avgcost.js';
import { guessKind, tickSize, TAX_UNTIL } from '../core/cost.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'avgcost');
const num = id => parseNum(document.getElementById(id)?.value);
const yuan = n => Math.round(n).toLocaleString('en-US') + ' 元';
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));
const p2 = n => n.toFixed(2) + ' 元';
const sh = n => n.toLocaleString('en-US') + ' 股';
const KIND = [
  { value: 'stock', label: '股票（證交稅 0.3%）' },
  { value: 'etf', label: 'ETF，含 0050、正二（證交稅 0.1%）' },
  { value: 'bond-etf', label: '債券 ETF（證交稅停徵）' }
];
const KIND_NAME = { stock: '股票', etf: 'ETF', 'bond-etf': '債券 ETF' };

const steps = [
  {
    title: '你買了哪些',
    hint: '打開券商 App 的「成交回報」或「對帳單」，每一次買進填一筆。代號填好，現價會自動抓。',
    about: '這一步算出平均每股花了多少錢。分次買的價格要照股數加權，不是直接平均。',
    figure: { src: '../img/avgcost/step1.webp', alt: '插圖：平均成本，要照股數算。對帳單兩筆：100 元 × 1,000 股、90 元 × 3,000 股。直接平均（錯）：(100＋90)÷2＝95 元，沒管每次買了幾股。照股數加權（對）：100×1,000＝100,000，90×3,000＝270,000，370,000÷4,000 股＝92.5 元，買比較多的那次影響比較大。老師說：每一次成交填一筆，工具會幫你加上每筆的手續費。這張圖沒算手續費。' },
    body: s => [
      holdingsInput({ id: 'hold', rows: [s.first || {}], max: 1, label: '第 1 筆買進', side: 'lot' }),
      lotsInput({ id: 'lots', rows: s.more ?? [{}], first: 2, label: '之後每一次買進（只買過一次就按「刪掉這筆」）' }),
      tokenBox()
    ],
    read: s => {
      const [x] = readHoldings('hold');
      holdingSummary([x]);
      const more = readLots('lots').filter(l => !(Number.isNaN(l.shares) && Number.isNaN(l.price)));
      avgCostPlan({ kind: guessKind(x.code), lots: [{ shares: x.shares, price: x.buyPrice }, ...more] });
      if (s.first?.code !== x.code) { s.kind = guessKind(x.code); s.addPrice = x.nowPrice; }
      s.first = x; s.more = more;
    }
  },
  {
    title: '商品類型與券商費率',
    hint: '商品類型已經依代號猜好，請確認。折扣和最低手續費看券商 App 的「手續費設定」或開戶時的說明。',
    about: '這一步決定每一筆被收多少手續費，以及全部賣掉時的證交稅。',
    body: s => [
      withHelp(selectField({ id: 'kind', label: '商品類型', termId: 'transaction-tax', plain: '影響賣出時的證交稅', options: KIND, value: s.kind || 'stock' }),
        { text: ['代號 00 開頭的多半是 ETF（例：0050、00631L），00 開頭又以 B 結尾的是債券 ETF（例：00679B），其他是股票。', '已經幫你依代號猜好；不確定就看券商 App 上的商品名稱。'] }),
      numberInput({ id: 'discount', label: '券商手續費折扣', termId: 'broker-fee', plain: '2.8 折就填 2.8；沒打折填 10', value: s.discount ?? 10, suffix: '折',
        help: { text: ['券商說「手續費 2.8 折」就填 2.8，等於 0.1425% × 0.28 ＝ 0.0399%。', '有些券商是先收全額、月底才退回折扣（退佣）；想看當下實付就填 10。'] } }),
      numberInput({ id: 'minboard', label: '整股最低手續費', plain: '1000 股的倍數，常見 20 元', value: s.minFeeBoard ?? 20, suffix: '元',
        help: { text: ['這一筆的手續費算出來比這個少，就收這個數字。', '你的券商不同就改掉。'] } }),
      numberInput({ id: 'minodd', label: '零股最低手續費', plain: '不滿 1000 股的倍數，常見 1 元', value: s.minFeeOdd ?? 1, suffix: '元',
        help: { text: ['零股交易的最低收費，各券商不同，常見 1 元。', '像 1500 股這種，實際下單會拆成 1 張＋500 股兩筆；這裡整筆當零股算。'] } })
    ],
    read: s => {
      s.kind = document.getElementById('kind').value;
      s.discount = num('discount'); s.minFeeBoard = num('minboard'); s.minFeeOdd = num('minodd');
      if (!(s.discount > 0 && s.discount <= 10)) throw new Error('折扣填 0.1–10，例：2.8；沒打折填 10。');
      if (!(s.minFeeBoard >= 0) || !(s.minFeeOdd >= 0)) throw new Error('最低手續費填 0 以上的數字，例：20。');
    }
  },
  {
    title: '打算再買（選填）',
    hint: '想知道再買會怎樣才填。只想看現在的平均成本，股數和目標均價都留白，直接看結果。',
    about: '這一步試算「再買一筆」之後的平均成本，或想攤平到某個價格要再買多少股。',
    body: s => [
      numberInput({ id: 'addprice', label: '打算再買的價格', termId: 'averaging-down', plain: '預設是現價，可以改成你想掛的價格', value: s.addPrice, suffix: '元',
        help: { text: ['跌了再買叫攤平，漲了再買叫加碼；兩種都可以算。'] } }),
      numberInput({ id: 'addshares', label: '打算再買幾股（選填）', plain: '例：2000（2 張）；不試算就留白', value: s.addShares, suffix: '股',
        help: { text: ['填了會算出再買之後的平均成本、回本要漲多少。'] } }),
      numberInput({ id: 'target', label: '想把平均成本降到多少（選填）', termId: 'average-cost', plain: '例：88；不試算就留白', value: s.target, suffix: '元',
        help: { text: ['會算出用上面的價格要再買幾股，平均成本（含手續費）才會降到這裡。', '目標要低於現在的均價、又要高於再買的價格，不然算不出來。'] } })
    ],
    read: s => {
      s.addPrice = num('addprice'); s.addShares = num('addshares'); s.target = num('target');
      const hasShares = !Number.isNaN(s.addShares), hasTarget = !Number.isNaN(s.target);
      if (hasShares || hasTarget) {
        if (!(s.addPrice > 0)) throw new Error('打算再買的價格要大於 0，例：80。');
        if (hasShares && !(Number.isInteger(s.addShares) && s.addShares > 0)) throw new Error('打算再買的股數要是正整數，例：2000；不試算就留白。');
        if (hasTarget && !(s.target > 0)) throw new Error('目標均價要大於 0，例：88；不試算就留白。');
      }
    }
  }
];

function result(s) {
  const want = Number.isFinite(s.addShares) || Number.isFinite(s.target);
  const lots = [{ shares: s.first.shares, price: s.first.buyPrice }, ...s.more];
  const r = avgCostPlan({ kind: s.kind, lots, nowPrice: s.first.nowPrice, discount: s.discount / 10,
    minFeeBoard: s.minFeeBoard, minFeeOdd: s.minFeeOdd,
    add: want ? { price: s.addPrice, shares: s.addShares } : null, targetAvg: want ? s.target : undefined });
  const b = r.before, a = r.after, now = s.first.nowPrice;
  const name = STOCK_NAMES[s.first.code] ? `${s.first.code} ${STOCK_NAMES[s.first.code]}` : s.first.code;
  const out = [
    explain({ label: '平均成本（含手續費）', value: p2(b.avgWithFee),
      how: `${name}：` + b.lots.map((l, i) => `第 ${i + 1} 筆 ${l.price} 元 × ${sh(l.shares)}＝${yuan(l.amount)}，手續費 ${l.fee} 元`).join('；') + `。合計 ${yuan(b.totalCost)} ÷ ${sh(b.shares)}。`,
      means: `不含手續費是 ${p2(b.avgNoFee)}。券商 App 的「成本均價」有的含手續費、有的不含，對不上時先看是哪一種。` }),
    explain({ label: '現在賺賠', value: `${signed(b.gain)}（${fmtPct(b.gainPct, 2)}）`, tone: b.gain >= 0 ? 'ok' : 'bad',
      how: `全部按現價 ${now} 元賣出：${yuan(b.sell.amount)} − 手續費 ${b.sell.fee} 元 − 證交稅 ${b.sell.tax} 元＝${yuan(b.sell.net)}；再減總成本 ${yuan(b.totalCost)}。`,
      means: '跟券商的「預估損益」一樣，已經扣掉賣出的費用和稅。' }),
    explain({ label: '至少要賣在這裡才不虧', value: `${b.breakEvenTick} 元`, tone: 'warn',
      how: `理論上賣 ${b.breakEven.toFixed(3)} 元剛好拿回總成本；${KIND_NAME[s.kind]}在這個價位每檔跳 ${tickSize(b.breakEven, s.kind)} 元，往上取到 ${b.breakEvenTick} 元。`,
      means: b.needRise > 0 ? `比現價還要漲 ${fmtPct(b.needRise, 2)}。` : '現價已經比這裡高，現在全部賣掉就有賺。' })
  ];
  if (a) out.push(
    explain({ label: '再買之後的平均成本', value: p2(a.avgWithFee),
      how: `原本總成本 ${yuan(b.totalCost)} ＋ 這次 ${s.addPrice} 元 × ${sh(r.addLot.shares)}＝${yuan(r.addLot.amount)}、手續費 ${r.addLot.fee} 元，合計 ${yuan(a.totalCost)} ÷ ${sh(a.shares)}。`,
      means: a.avgWithFee < b.avgWithFee ? `平均成本從 ${p2(b.avgWithFee)} 降到 ${p2(a.avgWithFee)}。` : `再買的價格比平均成本高（加碼），平均成本從 ${p2(b.avgWithFee)} 變成 ${p2(a.avgWithFee)}。` }),
    explain({ label: '回本要漲多少', value: a.needRise > 0 ? fmtPct(a.needRise, 2) : '現價已經高於不虧價',
      how: `再買之後至少要賣 ${a.breakEvenTick} 元才不虧（理論 ${a.breakEven.toFixed(3)} 元），÷ 現價 ${now} 元 − 1。`,
      means: b.needRise > 0 ? `再買前要漲 ${fmtPct(b.needRise, 2)}。` : '再買前：現價已經高於不虧價。' }),
    explain({ label: '再買之後賺賠', value: `${signed(a.gain)}（${fmtPct(a.gainPct, 2)}）`, tone: a.gain >= 0 ? 'ok' : 'bad',
      how: `全部按現價 ${now} 元賣出實拿 ${yuan(a.sell.net)} − 總成本 ${yuan(a.totalCost)}。`,
      means: `再買前是 ${signed(b.gain)}。` + (b.gain < 0 ? '攤平讓平均成本變低，但已經虧的錢不會消失。' : '') }),
    explain({ label: '投入的錢', value: fmtMoney(a.totalCost), tone: 'warn',
      how: `原本 ${yuan(b.totalCost)} ＋ 這次 ${yuan(r.addLot.total)}。`,
      means: `是原本的 ${(a.totalCost / b.totalCost).toFixed(2)} 倍。這一檔再跌 10%，帳面要多虧約 ${fmtMoney(a.sell.amount * 0.1)}。`,
      todo: '再買之前先問自己：如果現在手上沒有這檔，還會用這個價格買嗎？' })
  );
  if (r.target) {
    const t = r.target;
    out.push(explain(t.ok ? { label: `攤平到 ${s.target} 元要再買`, value: sh(t.shares), tone: 'info',
      how: `用 ${s.addPrice} 元買 ${sh(t.shares)}：${yuan(t.lot.amount)}＋手續費 ${t.lot.fee} 元＝${yuan(t.lot.total)}。(${yuan(b.totalCost)}＋${yuan(t.lot.total)}) ÷ ${sh(t.totalShares)}＝${t.avgWithFee.toFixed(2)} 元。`,
      means: `約 ${(t.shares / 1000).toFixed(2)} 張，要再拿出 ${fmtMoney(t.lot.total)}；少買 1 股，平均成本就會高於 ${s.target} 元。`
    } : { label: `攤平到 ${s.target} 元要再買`, value: '算不出來', tone: 'warn', means: t.message }));
  }
  const integer = n => Math.round(n).toLocaleString('en-US');
  const row = (l, label) => h('tr', {}, [label, integer(l.shares), l.price, integer(l.amount), integer(l.fee), integer(l.total)].map(v => h('td', {}, String(v))));
  out.push(h('h3', {}, '每一筆明細'),
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, ['筆', '股數', '買入價（元）', '股款（元）', '手續費（元）', '合計（元）'].map(v => h('th', {}, v)))),
      h('tbody', {}, b.lots.map((l, i) => row(l, i + 1)), r.addLot ? row(r.addLot, '再買') : [])));
  const notes = [
    '每一筆買進的手續費分開算，各有最低收費；不是 1000 股倍數的整筆當零股算。',
    '賣掉一部分、領現金股利或配股之後，各家券商 App 的成本均價調整方式不同，這裡沒有算。',
    '損益和不虧價都假設一次全部賣出，已扣賣出手續費和證交稅。'
  ];
  if (s.kind === 'bond-etf') notes.push(`債券 ETF 證交稅停徵到 ${TAX_UNTIL['bond-etf']}，之後可能恢復課徵。`);
  if (s.discount < 10) notes.push('如果你的券商是月底退佣，當下會先收全額手續費，退回的錢晚點才入帳。');
  out.push(h('div', { class: 'note' }, notes.map(n => h('p', {}, n))));
  return out;
}

const example = { first: { code: '2317', shares: 1000, buyPrice: 100, nowPrice: 80 }, more: [{ shares: 1000, price: 90 }],
  kind: 'stock', discount: 10, minFeeBoard: 20, minFeeOdd: 1, addPrice: 80, addShares: 2000, target: 88 };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/avgcost/comic.webp', alt: '四格漫畫：一、小安分兩次買同一檔股票：100 元買 1 張、90 元買 1 張，股款 190,000 元加手續費 270 元，共 190,270 元。二、老師說平均成本＝總花費 ÷ 總股數：190,270 ÷ 2,000 股約 95.14 元，每一筆的手續費都要算進去。三、跌到 80 元，小安再買 2 張攤平：平均成本 95.14 變 87.62 元，回本要漲 19.5% 變 10.1%。四、老師說虧的錢沒有消失：帳面虧損約 3.1 萬變約 3.2 萬，投入的錢約 19 萬變約 35 萬；先問如果手上沒有這檔，現在還會買嗎。手續費 0.1425%、不打折、最低 20 元；虧損已扣賣出手續費與證交稅 0.3%。' }),
    h('p', {}, '平均成本＝總花費 ÷ 總股數。分好幾次買，要照每次的股數加權，不是把價格直接平均。'),
    h('p', {}, '攤平：跌了再買，平均成本變低、回本要漲的幅度變小；但投入的錢變多，再跌會虧更多。'),
    h('p', {}, '「至少要賣在這裡才不虧」比平均成本高一點，因為賣出還要付手續費和證交稅。')),
  disclaimer('general'));
