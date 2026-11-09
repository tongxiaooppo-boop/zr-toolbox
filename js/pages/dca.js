// 工具⑦ 定期定額與年化報酬（精靈頁）。公式只在 core/dca.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary, CODE_RE } from '../core/holdings.js';
import { dcaPlan } from '../core/dca.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'dca');
const num = id => parseNum(document.getElementById(id)?.value);
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));

const steps = [
  {
    title: '要扣哪一檔',
    hint: '填你要定期定額的股票或 ETF 代號，現價會自動抓。已經有這檔的，股數和買入價也填，會一起算進去。',
    about: '這一步確定要買哪一檔、現在已經有多少。',
    figure: { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' },
    body: s => [
      withHelp(selectField({ id: 'have', label: '這檔你已經有了嗎', options: [{ value: 'no', label: '還沒有，從零開始' }, { value: 'yes', label: '已經有一些' }], value: s.have || 'no' }),
        { text: ['還沒有：只填代號就好，股數、買入價留空。', '已經有：照券商 App 庫存填股數和買入價，現在的市值會當成起始金額一起滾。'] }),
      holdingsInput({ id: 'hold', rows: s.holdings || [{}], max: 1, label: '要扣款的那一檔' }), tokenBox()],
    read: s => {
      s.have = document.getElementById('have').value;
      const [x] = readHoldings('hold');
      if (s.have === 'yes') {
        holdingSummary([x]);
        s.initial = x.shares * x.nowPrice;
      } else {
        if (!CODE_RE.test(x.code)) throw new Error('股票代號格式不對，例：0050、00631L。');
        s.initial = 0;
      }
      s.holdings = [x];
    }
  },
  {
    title: '每月扣多少',
    hint: '填每次扣款金額和券商的手續費設定。不知道就先用預設值。',
    about: '這一步決定每月投入多少、被收多少手續費。',
    body: s => [
      numberInput({ id: 'monthly', label: '每月投入', termId: 'dca', plain: '每個月扣款多少錢', value: s.monthly ?? '', suffix: '元',
        help: { text: ['一個月扣好幾次（例：6、16、26 日），把每次金額加起來填。', '券商通常有最低扣款金額（常見 1,000 元或 3,000 元），依券商。'] } }),
      numberInput({ id: 'stepup', label: '每年調升', plain: '薪水變多想多扣就填；不調填 0', value: s.stepUp ?? 0, suffix: '%',
        help: { text: ['例：填 5，第 2 年每月投入變成 1.05 倍，第 3 年再乘 1.05。'] } }),
      numberInput({ id: 'discount', label: '手續費折扣', termId: 'broker-fee', plain: '2.8 折填 2.8；沒打折填 10', value: s.discount ?? 10, suffix: '折',
        help: { text: ['定期定額的手續費常有專屬優惠，看券商的定期定額說明。'] } }),
      numberInput({ id: 'minfee', label: '每次最低手續費', plain: '定期定額常見 1 元', value: s.minFee ?? 1, suffix: '元',
        help: { text: ['手續費算出來比這個少，就收這個數字。'] } })],
    read: s => {
      s.monthly = num('monthly'); s.stepUp = num('stepup'); s.discount = num('discount'); s.minFee = num('minfee');
      if (!(s.monthly > 0)) throw new Error('每月投入要大於 0，例：5000。');
      if (!(s.stepUp >= 0 && s.stepUp <= 100)) throw new Error('每年調升填 0–100，不調升填 0。');
      if (!(s.discount > 0 && s.discount <= 10)) throw new Error('折扣填 0.1–10，例：2.8；沒打折填 10。');
      if (!(s.minFee >= 0)) throw new Error('最低手續費填 0 以上的數字，例：1。');
    }
  },
  {
    title: '假設報酬與年數',
    hint: '報酬率是你自己設的假設，不是預測。可以試幾個不同的數字比較。',
    about: '這一步決定要滾多久、用多少報酬率算。年報酬會用複利換成每月報酬。',
    figure: { src: '../img/dca/step3.webp', alt: '卡通圖：年報酬 6%，每個月是多少？直接除以 12 得每月 0.5%，一年滾起來約 6.17%，算多了。用複利換算：(1＋6%) 開 12 次方根 − 1，每月約 0.487%，一年滾起來剛好 6%。老師說：每個月賺的錢會繼續滾，所以每月要比 0.5% 少一點。本工具用複利換算；報酬率是你自己設的假設，不是預測。' },
    body: s => [
      numberInput({ id: 'years', label: '投資幾年', plain: '填整數，例：20', value: s.years ?? '', suffix: '年',
        help: { text: ['定期定額適合長期；年數越長，複利的效果越明顯。'] } }),
      numberInput({ id: 'ret', label: '假設年報酬', termId: 'compound-interest', plain: '自己設的假設，例：6', value: s.ret ?? '', suffix: '%',
        help: { text: ['這是假設每年都一樣的報酬，真實市場會有漲有跌，也可能虧損。', 'ETF 的內扣費用已經反映在淨值裡，用歷史報酬當假設時不要再扣一次。'] } }),
      selectField({ id: 'timing', label: '每月什麼時候扣款', options: [{ value: 'start', label: '月初（當月就開始滾）' }, { value: 'end', label: '月底（下個月才開始滾）' }], value: s.timing || 'start' })],
    read: s => {
      s.years = num('years'); s.ret = num('ret');
      s.timing = document.getElementById('timing').value;
      if (!Number.isInteger(s.years) || s.years < 1 || s.years > 60) throw new Error('投資年數填 1–60 的整數，例：20。');
      if (!(s.ret > -99 && s.ret < 99)) throw new Error('假設年報酬填 −99 到 99，例：6。');
    }
  }
];

function result(s) {
  const [x] = s.holdings;
  const r = dcaPlan({ initial: s.initial, monthly: s.monthly, years: s.years, annualReturn: s.ret / 100, timing: s.timing,
    stepUp: s.stepUp / 100, discount: s.discount / 10, minFee: s.minFee });
  const last = r.rows[r.rows.length - 1];
  const name = STOCK_NAMES[x.code] ? `${x.code} ${STOCK_NAMES[x.code]}` : x.code;
  const out = [
    explain({ label: `${s.years} 年後的資產`, value: fmtMoney(r.finalValue),
      how: `${name}：每月 ${s.monthly} 元，共 ${r.months} 次；年報酬 ${s.ret}% 換成每月 ${fmtPct(r.monthlyRate, 3)}（(1＋${s.ret}%) 開 12 次方根 − 1）。` + (s.timing === 'start' ? '月初投入，當月就開始滾。' : '月底投入，下個月才開始滾。'),
      means: '用固定報酬算的情境，不是預測；真實市場有漲有跌，結果可能差很多。' }),
    explain({ label: '投入本金', value: fmtMoney(r.principal),
      how: (s.initial > 0 ? `目前持股市值 ${fmtMoney(s.initial)} ＋ ` : '') + `每月投入合計 ${fmtMoney(r.contributed)}` + (s.stepUp > 0 ? `（每年調升 ${s.stepUp}%，最後一年每月 ${last.amount} 元）` : '') + '。',
      means: '你自己放進去的錢。' }),
    explain({ label: '手續費合計', value: fmtMoney(r.fees),
      how: `第 1 年每次 ${r.rows[0].amount} 元 × 0.1425%${s.discount < 10 ? ` × ${s.discount} 折` : ''}，元以下捨去、最低 ${s.minFee} 元＝${r.rows[0].fees / 12} 元，共扣 ${r.months} 次。`,
      means: '手續費另外付，不從扣款金額裡扣（依券商可能不同）。' }),
    explain({ label: '累積賺到', value: signed(r.gain), tone: r.gain >= 0 ? 'ok' : 'bad',
      how: `${s.years} 年後資產 − 投入本金 − 手續費。`, means: `占你總共付出的 ${fmtPct(r.gainPct, 2)}。` }),
    explain({ label: '如果一開始一次投入', value: fmtMoney(r.lumpValue),
      how: `同樣 ${fmtMoney(r.principal)} 第一天全部投入：${fmtMoney(r.principal)} × (1＋${s.ret}%)^${s.years}；扣一次手續費 ${fmtMoney(r.lumpFee)}，賺 ${signed(r.lumpGain)}。`,
      means: s.ret > 0 ? '報酬為正時，越早投入滾越久，所以一次投入比較多；但前提是錢一開始就在手上，定期定額通常是因為每月才有薪水。'
        : s.ret < 0 ? '報酬為負時，分批投入虧得比較少。' : '報酬為 0 時兩種一樣，只差手續費。' }),
    explain({ label: '年化報酬別算錯', value: fmtPct(s.ret / 100, 2), tone: 'warn',
      how: `在這個情境裡，每一筆錢都是年 ${s.ret}%。如果用『投入本金 ${fmtMoney(r.principal)} → 期末 ${fmtMoney(r.finalValue)}』硬套年化公式，會算出 ${fmtPct(r.naiveCagr, 2)}。`,
      means: '後面投入的錢只放了很短時間，所以硬算會偏低。定期定額要看年化，要用每筆錢的投入日期算（IRR），不要用單筆的年化公式。' })];
  if (x.nowPrice > 0) out.push(explain({ label: '每月約可買', value: `${Math.floor(r.rows[0].amount / x.nowPrice).toLocaleString('en-US')} 股`,
    how: `第 1 年每月 ${r.rows[0].amount} 元 ÷ 現價 ${x.nowPrice} 元，取整數。`,
    means: '台股定期定額通常買零股；每月成交價不同，買到的股數也會變。' }));
  out.push(h('h3', {}, '逐年變化'),
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, ['年', '每月投入（元）', '累計投入（元）', '累計手續費（元）', '年底資產（元）'].map(t => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, r.rows.map(row => h('tr', {},
        h('td', {}, row.year),
        ...[row.amount, s.initial + row.contributed, row.fees, row.value].map(n => h('td', {}, Math.round(n).toLocaleString('en-US'))))))),
    h('div', { class: 'note' }, [
      '這是固定報酬的情境，沒有模擬漲跌的先後順序；同樣平均報酬，先跌後漲和先漲後跌的結果不一樣。',
      '配息如果沒有再投入，期末資產會比這裡少。',
      '扣款日遇到休市會順延；最低扣款金額、手續費以券商為準。',
      '證交稅只在賣出時收，這裡沒有算賣出。'
    ].map(n => h('p', {}, n))));
  return out;
}

const example = { have: 'no', holdings: [{ code: '0050', nowPrice: 50 }], initial: 0,
  monthly: 5000, stepUp: 0, discount: 10, minFee: 1, years: 20, ret: 6, timing: 'start' };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/dca/comic.webp', alt: '四格漫畫：一、小安在券商 App 設定某檔 ETF 每月 6 日扣款 5,000 元。二、20 年總共投入 5,000 元 × 12 個月 × 20 年＝1,200,000 元，手續費共 1,680 元。三、假設每年 6%，20 年後約 2,278,000 元，賺的錢約 1,077,000 元。四、老師說：6% 是假設不是保證；早投入的錢滾得比較久；真實市場有漲有跌，可能賠錢；這是用固定報酬算的情境，不是預測。' }),
    h('p', {}, '定期定額＝每月固定日期、固定金額自動買進，不用挑時間。它不保證賺錢，賺多少還是看你買的東西。'),
    h('p', {}, '複利：賺到的錢繼續放著，下一期連它一起賺。所以時間越長，『賺的錢』占的比例越大。'),
    h('p', {}, '年化報酬只適用一筆錢從頭放到尾；定期定額每筆錢放的時間不同，不能拿總本金直接套。')),
  disclaimer('general'));
