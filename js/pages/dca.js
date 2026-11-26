// 工具⑦ 定期定額與持續投入（精靈頁）。公式只在 core/dca.js。
import { h, toolHeader, selectField, disclaimer, figure, pathNav } from '../ui/components.js';
import { wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { holdingSummary, CODE_RE } from '../core/holdings.js';
import { dcaPlan, accumulatePlan, scenarioPlans, growthByDecade, dcaPricePath, sellAtBottom, LESSON_PRICES } from '../core/dca.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'dca');
const num = id => parseNum(document.getElementById(id)?.value);
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));


function params(s) {
  const hr = (Number.isFinite(s.holdRet) ? s.holdRet : s.ret) / 100;
  return { initial: s.initial, initialReturn: s.ret / 100, horizon: s.years + s.holdYears, timing: s.timing,
    discount: s.discount / 10, minFee: s.minFee, inflation: s.inflation / 100,
    stages: [
      { start: 0, stop: s.years, monthly: s.monthly, annualReturn: s.ret / 100, holdReturn: hr, stepUp: s.stepUp / 100 },
      ...(s.stage2 === 'yes' ? [{ start: s.s2start, stop: s.s2stop, monthly: s.s2monthly, annualReturn: s.ret / 100, holdReturn: hr }] : [])
    ] };
}

function table(headers, rows) {
  return h('div', { class: 'dca-table-scroll', tabindex: '0', role: 'region', 'aria-label': headers.join('、') },
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, headers.map(t => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, rows.map(row => h('tr', {}, row.map(t => h('td', {}, t)))))));
}

function stageFields(s) {
  const fields = () => [
    numberInput({ id: 's2start', label: '幾年後開始加', suffix: '年', plain: '從現在算，例：10＝10 年後（第 11 年起）', value: s.s2start }),
    numberInput({ id: 's2stop', label: '加到第幾年停', suffix: '年', plain: '例：20＝扣到第 20 年底，要比上一格大', value: s.s2stop }),
    numberInput({ id: 's2monthly', label: '每月再加多少', suffix: '元', plain: '例：5000', value: s.s2monthly })
  ];
  const extra = h('div', {}, ...(s.stage2 === 'yes' ? fields() : []));
  const select = withHelp(selectField({ id: 'stage2', label: '之後要再加碼嗎', value: s.stage2 || 'no',
    options: [{ value: 'no', label: '不用' }, { value: 'yes', label: '要，之後每月再多扣一筆' }] }),
    { text: ['例如 10 年後加薪了，每月再多扣 5,000 元。', '這筆加碼不跟著每年調升，跟原本那筆用同一個報酬率。'] });
  select.querySelector('select').addEventListener('change', event => {
    if (s.stage2 === 'yes') {
      s.s2start = num('s2start'); s.s2stop = num('s2stop'); s.s2monthly = num('s2monthly');
    }
    s.stage2 = event.target.value;
    extra.replaceChildren(...(s.stage2 === 'yes' ? fields() : []));
  });
  return [select, extra];
}

function lesson() {
  const g = growthByDecade(5000, 0.06, 3);
  const early = accumulatePlan({ horizon: 40, stages: [{ start: 0, stop: 10, monthly: 5000, annualReturn: 0.06 }] });
  const late = accumulatePlan({ horizon: 40, stages: [{ start: 10, stop: 40, monthly: 5000, annualReturn: 0.06 }] });
  const d = dcaPricePath(LESSON_PRICES, 5000), b = sellAtBottom(LESSON_PRICES, 5000, 4);
  const wan = x => (x / 10000).toFixed(1);
  return h('section', { class: 'card' },
    h('h2', {}, '為什麼要持續投入？複利神奇在哪'),
    h('p', { class: 'note' }, '以下數字都是用固定報酬假設算的情境（每月 5,000 元、年報酬 6%），不是預測；真實市場有漲有跌，也可能虧損。'),
    h('h3', {}, '複利後段加速'),
    figure({ src: '../img/dca/decades.svg', alt: g.map(x => `第 ${x.from + 1}–${x.to} 年 賺約 ${wan(x.earned)} 萬`).join('；') + '。每 10 年都投入 60 萬（每月 5,000 元、年報酬 6% 假設）。', caption: '每 10 年都放 60 萬，後面賺得越來越多。' }),
    table(['期間', '這 10 年投入', '這 10 年賺到', '期末資產'], g.map(x => [`第 ${x.from + 1}–${x.to} 年`, fmtMoney(x.put), fmtMoney(x.earned), fmtMoney(x.value)])),
    h('p', {}, `每 10 年都放 60 萬，第 21–30 年賺的（約 ${wan(g[2].earned)} 萬）是第 1–10 年（約 ${wan(g[0].earned)} 萬）的 ${(g[2].earned / g[0].earned).toFixed(1)} 倍：前面賺到的錢也一起在滾，時間越後面滾得越快。`),
    h('h3', {}, '早 10 年 vs 晚 10 年'),
    h('p', {}, `小早現在開始，每月 5,000 元只扣 10 年就停（投入 ${wan(early.contributed)} 萬），之後放著不動。小晚 10 年後才開始，每月 5,000 元連扣 30 年（投入 ${wan(late.contributed)} 萬）。到第 40 年：小早約 ${wan(early.finalValue)} 萬、小晚約 ${wan(late.finalValue)} 萬。小晚多放了 ${wan(late.contributed - early.contributed)} 萬本金，最後只多約 ${wan(late.finalValue - early.finalValue)} 萬。`),
    h('p', {}, '早開始的優勢是「時間」，不是金額。'),
    h('h3', {}, '定期定額不用猜高低點'),
    h('p', {}, `假設每月固定買 5,000 元，價格 12 個月內從 100 跌到 60，再漲回 100（價格：${LESSON_PRICES.join('、')}）。便宜的時候同樣的錢買到比較多股，所以平均成本 ${d.avgCost.toFixed(2)} 元，比這 12 個月的平均價格 ${d.avgPrice.toFixed(2)} 元還低。價格回到 100 時，投入的 ${fmtMoney(d.put)} 變成 ${fmtMoney(d.value)}。`),
    h('h3', {}, '停扣、賣在低點的代價'),
    h('p', {}, `同一段行情，如果第 5 個月跌到 ${b.sold.price} 元時嚇到全部賣掉、之後不再扣：投入 ${fmtMoney(b.sold.put)}，拿回 ${fmtMoney(b.sold.got)}，虧 ${fmtMoney(-b.sold.gain)}，之後漲回來都跟你無關。繼續扣到第 12 個月的人：投入 ${fmtMoney(b.keep.put)}，變成 ${fmtMoney(b.keep.value)}。`),
    h('p', { class: 'note' }, '真實行情不一定會漲回來，也可能跌更久。這裡只想說一件事：在低點賣掉，帳面虧損就變成真的虧損。'));
}

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
        help: { text: ['一個月扣好幾次（例：6、16、26 日），把每次金額加起來填。', '券商通常有最低扣款金額（常見 1,000 元或 3,000 元），實際看你的券商。'] } }),
      numberInput({ id: 'stepup', label: '每年調升', plain: '薪水變多想多扣就填；不調填 0', value: s.stepUp ?? 0, suffix: '%',
        help: { text: ['例：填 5，第 2 年每月投入變成 1.05 倍，第 3 年再乘 1.05。'] } }),
      ...stageFields(s),
      numberInput({ id: 'discount', label: '手續費折扣', termId: 'broker-fee', plain: '2.8 折填 2.8；沒打折填 10', value: s.discount ?? 10, suffix: '折',
        help: { text: ['定期定額的手續費常有專屬優惠，看券商的定期定額說明。'] } }),
      numberInput({ id: 'minfee', label: '每次最低手續費', plain: '定期定額常見 1 元', value: s.minFee ?? 1, suffix: '元',
        help: { text: ['手續費算出來比這個少，就收這個數字。'] } })],
    read: s => {
      s.stage2 = document.getElementById('stage2').value;
      if (s.stage2 === 'yes') {
        s.s2start = num('s2start'); s.s2stop = num('s2stop'); s.s2monthly = num('s2monthly');
        if (!(s.s2monthly > 0)) throw new Error('加碼每月金額要大於 0，例：5000。');
        if (!Number.isInteger(s.s2start) || !Number.isInteger(s.s2stop) || s.s2start < 0 || s.s2stop <= s.s2start) throw new Error('加碼的「幾年後開始」「到第幾年停」要填整數，停的年要比開始的大。');
      }
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
      numberInput({ id: 'age', label: '現在幾歲（選填）', suffix: '歲', plain: '填了，結果會用年齡顯示', value: s.age }),
      numberInput({ id: 'years', label: '第一筆扣幾年', plain: '填整數，例：20', value: s.years ?? '', suffix: '年',
        help: { text: ['定期定額適合長期；年數越長，複利的效果越明顯。'] } }),
      numberInput({ id: 'ret', label: '假設年報酬', termId: 'compound-interest', plain: '自己設的假設，例：6', value: s.ret ?? '', suffix: '%',
        help: { text: ['這是假設每年都一樣的報酬，真實市場會有漲有跌，也可能虧損。', 'ETF 的內扣費用已經反映在淨值裡，用歷史報酬當假設時不要再扣一次。'] } }),
      selectField({ id: 'timing', label: '每月什麼時候扣款', options: [{ value: 'start', label: '月初（當月就開始滾）' }, { value: 'end', label: '月底（下個月才開始滾）' }], value: s.timing || 'start' }),
      numberInput({ id: 'holdyears', label: '停扣後再放幾年（選填）', plain: '例：45 歲停扣、65 歲退休就填 20；不放填 0。也是算到哪一年為止', value: s.holdYears ?? 0, suffix: '年',
        help: { text: ['停止扣款後不賣，讓錢繼續滾到退休。', '這段期間不再扣款，也不收手續費。'] } }),
      numberInput({ id: 'holdret', label: '停扣後年報酬（選填）', plain: '快退休了常放保守一點，例：3；留白＝跟上面一樣', value: s.holdRet, suffix: '%',
        help: { text: ['留白就用上面的假設年報酬。'] } }),
      numberInput({ id: 'inflation', label: '通膨（選填）', suffix: '%', value: s.inflation ?? 2, plain: '把結果換成今天的購買力；不算填 0' })],
    read: s => {
      s.age = num('age'); s.inflation = num('inflation');
      if (Number.isNaN(s.inflation)) s.inflation = 2;
      if (!Number.isNaN(s.age) && (!Number.isInteger(s.age) || s.age < 0)) throw new Error('現在幾歲填 0 以上的整數，或留白。');
      s.years = num('years'); s.ret = num('ret');
      s.timing = document.getElementById('timing').value;
      s.holdYears = num('holdyears'); if (Number.isNaN(s.holdYears)) s.holdYears = 0; s.holdRet = num('holdret');
      if (!Number.isInteger(s.years) || s.years < 1 || s.years > 60) throw new Error('投資年數填 1–60 的整數，例：20。');
      if (!(s.ret > -99 && s.ret < 99)) throw new Error('假設年報酬填 −99 到 99，例：6。');
      if (!Number.isInteger(s.holdYears) || s.holdYears < 0 || s.holdYears > 60) throw new Error('停扣後再放幾年填 0–60 的整數，不放填 0。');
      if (!Number.isNaN(s.holdRet) && !(s.holdRet > -99 && s.holdRet < 99)) throw new Error('停扣後年報酬填 −99 到 99，例：3；跟上面一樣就留白。');
      accumulatePlan(params(s));
    }
  }
];

function result(s) {
  const [x] = s.holdings;
  const p = params(s), sc = scenarioPlans(p), r = sc[1].plan, H = p.horizon;
  const hr = Number.isFinite(s.holdRet) ? s.holdRet : s.ret;
  const yearLabel = y => Number.isFinite(s.age) ? `第 ${y} 年（${s.age + y} 歲）` : `第 ${y} 年`;
  const pools = [`第一筆（扣 ${s.years} 年）${fmtMoney(r.stageValues[0])}`];
  if (s.initial > 0) pools.unshift(`目前持股 ${fmtMoney(r.initialValue)}`);
  if (s.stage2 === 'yes') pools.push(`加碼那筆（第 ${s.s2start + 1}–${s.s2stop} 年）${fmtMoney(r.stageValues[1])}`);
  const months = p.stages.reduce((n, stage) => n + (stage.stop - stage.start) * 12, 0);
  const out = [
    explain({ label: `${yearLabel(H)}的資產`, value: fmtMoney(r.finalValue), how: pools.join(' ＋ '),
      means: '用固定報酬算的情境，不是預測；真實市場有漲有跌，結果可能差很多。' + (s.holdYears > 0 ? `停扣後用年報酬 ${hr}% 滾到第 ${H} 年。` : '') }),
    ...(s.inflation > 0 ? [explain({ label: '換成今天的購買力', value: fmtMoney(r.realFinal),
      how: `${fmtMoney(r.finalValue)} ÷ (1＋${s.inflation}%)^${H}`, means: `${H} 年後的錢，大約只買得到今天這麼多東西。` })] : []),
    explain({ label: '投入本金', value: fmtMoney(r.principal),
      how: (s.initial > 0 ? `目前持股市值 ${fmtMoney(s.initial)} ＋ ` : '') + `每月投入合計 ${fmtMoney(r.contributed)}。`, means: '你自己放進去的錢。' }),
    explain({ label: '手續費合計', value: fmtMoney(r.fees),
      how: `每次扣款 × 0.1425%${s.discount < 10 ? ` × ${s.discount} 折` : ''}，元以下捨去、最低 ${s.minFee} 元，共扣 ${months} 次。`,
      means: '手續費另外付，不會從扣款金額裡扣（各家券商做法可能不同）。' }),
    explain({ label: '累積賺到', value: signed(r.gain), tone: r.gain >= 0 ? 'ok' : 'bad',
      how: `${yearLabel(H)}資產 − 投入本金 − 手續費。`, means: `占你總共付出的 ${fmtPct(r.gain / (r.principal + r.fees), 2)}。` }),
    h('h3', {}, '三種情境（報酬率一起 −2／不變／＋2 個百分點）'),
    table(['情境', '投入期年報酬', '停扣後年報酬', `${yearLabel(H)}資產`, '今天的購買力', '累積賺到'], sc.map(x =>
      [x.label, fmtPct(s.ret / 100 + x.shift, 1), fmtPct(hr / 100 + x.shift, 1), fmtMoney(x.plan.finalValue), fmtMoney(x.plan.realFinal), fmtMoney(x.plan.gain)])),
    h('p', { class: 'note' }, '報酬率只差 2 個百分點，幾十年後的結果就差很多；哪個情境都不是預測。')
  ];
  if (s.stage2 === 'no') {
    const single = dcaPlan({ initial: s.initial, monthly: s.monthly, years: s.years, annualReturn: s.ret / 100, timing: s.timing,
      stepUp: s.stepUp / 100, discount: s.discount / 10, minFee: s.minFee, holdYears: s.holdYears, holdReturn: hr / 100 });
    out.push(
      explain({ label: '如果一開始一次投入', value: fmtMoney(single.lumpValue),
        how: `同樣 ${fmtMoney(single.principal)} 第一天全部投入：${fmtMoney(single.principal)} × (1＋${s.ret}%)^${s.years}；扣一次手續費 ${fmtMoney(single.lumpFee)}，賺 ${signed(single.lumpGain)}。`,
        means: s.ret > 0 ? '報酬為正時，越早投入滾越久，所以一次投入比較多；但前提是錢一開始就在手上，定期定額通常是因為每月才有薪水。'
          : s.ret < 0 ? '報酬為負時，分批投入虧得比較少。' : '報酬為 0 時兩種一樣，只差手續費。' }),
      explain({ label: '年化報酬別算錯', value: fmtPct(s.ret / 100, 2), tone: 'warn',
        how: `在這個情境裡，每一筆錢都是年 ${s.ret}%。如果用『投入本金 ${fmtMoney(single.principal)} → 期末 ${fmtMoney(single.finalValue)}』硬套年化公式，會算出 ${fmtPct(single.naiveCagr, 2)}。`,
        means: '後面投入的錢只放了很短時間，所以硬算會偏低。定期定額要看年化，要用每筆錢的投入日期算（IRR），不要用單筆的年化公式。' }));
  }
  if (x.nowPrice > 0) out.push(explain({ label: '每月約可買', value: `${Math.floor(s.monthly / x.nowPrice).toLocaleString('en-US')} 股`,
    how: `第 1 年每月 ${s.monthly} 元 ÷ 現價 ${x.nowPrice} 元，取整數。`,
    means: '台股定期定額通常買零股；每月成交價不同，買到的股數也會變。' }));
  out.push(h('p', { class: 'tip' }, h('a', { href: `retire.html?pool=${Math.round(r.finalValue)}` }, '把這筆錢帶到「退休提領」，算每月能領多少 →')),
    h('h3', {}, '逐年變化'),
    table([Number.isFinite(s.age) ? '年（歲）' : '年', '累計投入（元）', '累計手續費（元）', '年底資產（元）', '今天的購買力（元）'],
      r.rows.map(row => [yearLabel(row.year), ...[row.principal, row.fees, row.value, row.real].map(n => Math.round(n).toLocaleString('en-US'))])),
    h('div', { class: 'note' }, [
      '這是固定報酬的情境，沒有模擬漲跌的先後順序；同樣平均報酬，先跌後漲和先漲後跌的結果不一樣。',
      '配息如果沒有再投入，期末資產會比這裡少。',
      '扣款日遇到休市會往後順延；最低扣款金額和手續費，實際看券商公告。',
      '證交稅只在賣出時收，這裡沒有算賣出。',
      '加碼那筆和第一筆是分開算的：各自扣款、各自停扣，最後加總。'
    ].map(n => h('p', {}, n))));
  return out;
}

const example = { have: 'no', holdings: [{ code: '0050', nowPrice: 50 }], initial: 0,
  monthly: 5000, stepUp: 0, stage2: 'yes', s2start: 10, s2stop: 20, s2monthly: 5000,
  discount: 10, minFee: 1, age: 30, years: 20, ret: 6, timing: 'start', holdYears: 10, holdRet: 4, inflation: 2 };

document.getElementById('app').append(
  toolHeader(tool),
  figure({ src: '../img/dca/joy.webp', alt: '小安拿著顯示勾勾的手機比讚，一排存錢罐裡的硬幣逐漸增加，旁邊長出小盆栽。', caption: '示意圖：投資有賺有賠。' }),
  lesson(),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/dca/comic.webp', alt: '四格漫畫：一、小安在券商 App 設定某檔 ETF 每月 6 日扣款 5,000 元。二、20 年總共投入 5,000 元 × 12 個月 × 20 年＝1,200,000 元，手續費共 1,680 元。三、假設每年 6%，20 年後約 2,278,000 元，賺的錢約 1,077,000 元。四、老師說：6% 是假設不是保證；早投入的錢滾得比較久；真實市場有漲有跌，可能賠錢；這是用固定報酬算的情境，不是預測。' }),
    h('p', {}, '定期定額＝每月固定日期、固定金額，自動幫你買進，你不用挑時間。它不保證賺錢，賺多少還是看你買的東西。'),
    h('p', {}, '複利就是賺到的錢繼續放著，下一期連它一起賺。所以放越久，「賺的錢」占的比例越大。'),
    h('p', {}, '年化報酬只適用一筆錢從頭放到尾。定期定額每筆錢放的時間不同，不能拿總本金直接套。')),
  pathNav('dca'),
  disclaimer('general'));
