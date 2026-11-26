import { h, toolHeader, selectField, figure, pathNav, references, disclaimer } from '../ui/components.js';
import { wizard, numberInput, explain, withHelp } from '../ui/wizard.js';
import { recoverPlan, VOL_PRESETS, DEFAULT_FEE } from '../core/recover.js';
import { parseNum, fmtPct, fmtMoney } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'recover');
const num = id => parseNum(document.getElementById(id)?.value);
const pct = x => fmtPct(x, 1);
const decimal = x => Number(x.toFixed(2));
const link = (href, text) => h('a', { href }, text);

function params(s) {
  return {
    mode: s.mode, cost: s.cost, now: s.now, shares: s.shares, loss: s.loss / 100,
    sigma: s.vol === 'custom' ? s.sigmaCustom / 100 : VOL_PRESETS.find(p => p.id === (s.vol ?? 'normal'))?.sigma,
    years: s.years ?? 2, fee: (s.fee ?? DEFAULT_FEE * 100) / 100,
    target: s.target / 100, mu: s.mu / 100
  };
}

const steps = [
  {
    title: '你虧多少',
    hint: '選你手上有的數字。',
    figure: { src: '../img/recover/comic.webp', alt: '三岔路口：不動等它漲回來、攤平再買一些、換成 0050。', caption: '先算清楚，每條路各要漲多少。' },
    body: s => selectField({ id: 'mode', label: '怎麼填虧損', termId: 'recovery-gain', value: s.mode || 'price', options: [
      { value: 'price', label: '填成本和現價' }, { value: 'pct', label: '直接填虧幾 %' }
    ] }),
    read: s => { s.mode = document.getElementById('mode').value; }
  },
  {
    title: '填入虧損數字',
    body: s => s.mode === 'pct'
      ? numberInput({ id: 'loss', label: '正2 現在虧幾 %', suffix: '%', plain: '例：40', value: s.loss })
      : [numberInput({ id: 'cost', label: '買入成本（均價）', plain: '券商 App 庫存的成本均價', suffix: '元', value: s.cost }),
        numberInput({ id: 'now', label: '現價', suffix: '元', value: s.now }),
        numberInput({ id: 'shares', label: '股數（選填）', plain: '填了才換算金額，1 張＝1000 股', value: s.shares })],
    read: s => {
      if (s.mode === 'pct') s.loss = num('loss');
      else { s.cost = num('cost'); s.now = num('now'); s.shares = num('shares'); }
      recoverPlan(params(s));
    }
  },
  {
    title: '之後的行情（假設）',
    body: s => withHelp(selectField({ id: 'vol', label: '大盤之後震得多大', termId: 'volatility-decay', value: s.vol || 'normal',
      options: [...VOL_PRESETS.map(p => ({ value: p.id, label: `${p.label}（每年波動約 ${decimal(p.sigma * 100)}%）` })), { value: 'custom', label: '自己填' }]
    }), { text: ['臺灣50 指數平常一年的波動大約 15%–25%，股災時會更大。', '波動越大，正2 被耗損吃掉越多。'] }),
    read: s => { s.vol = document.getElementById('vol').value; }
  },
  {
    title: '波動、年數與費用',
    body: s => [
      ...(s.vol === 'custom' ? [numberInput({ id: 'sigmaCustom', label: '每年波動', suffix: '%', value: s.sigmaCustom })] : []),
      numberInput({ id: 'years', label: '想看幾年', suffix: '年', plain: '例：2', value: s.years ?? 2 }),
      numberInput({ id: 'fee', label: '每年內扣費用', suffix: '%', plain: '00631L 經理費 1.00%＋保管費 0.04%；不含期貨轉倉成本', value: s.fee ?? DEFAULT_FEE * 100 })
    ],
    read: s => {
      if (s.vol === 'custom') s.sigmaCustom = num('sigmaCustom');
      s.years = num('years'); s.fee = num('fee');
      recoverPlan(params(s));
    }
  },
  {
    title: '比較攤平與機率（選填）',
    body: s => [
      numberInput({ id: 'target', label: '攤平後只要再漲幾 %', suffix: '%', plain: '留白就不算攤平；要比現在要漲的少', value: s.target }),
      numberInput({ id: 'mu', label: '假設大盤每年平均報酬', suffix: '%', plain: '留白就不算機率；例：8，這只是假設', value: s.mu })
    ],
    read: s => { s.target = num('target'); s.mu = num('mu'); recoverPlan(params(s)); }
  }
];

function table(headers, rows, caption) {
  return h('div', { class: 'recover-table-wrap', tabindex: '0', role: 'region', 'aria-label': caption },
    h('table', { class: 'trade-table recover-table' },
      h('caption', { class: 'recover-caption' }, caption),
      h('thead', {}, h('tr', {}, headers.map(text => h('th', { scope: 'col' }, text)))),
      h('tbody', {}, rows.map(row => h('tr', {}, row.map((text, i) => h(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}, text)))))));
}

function result(s) {
  const p = params(s);
  const r = recoverPlan(p);
  const range = route => `約 ${pct(route.indexBest)}～${pct(route.indexFull)}`;
  const shock = route => pct(route.shockLoss) + (r.invested !== null ? `（${fmtMoney(r.invested * route.shockLoss)}）` : '');
  const routes = [['不動', range(r.stay), '0', shock(r.stay)]];
  if (r.avg) {
    const a = r.avg;
    routes.push(['攤平', range(a), `原投入的 ${pct(a.addPct)}` + (a.addShares !== null
      ? `（約 ${a.addShares} 股、${fmtMoney(a.addMoney)}，新成本 ${decimal(a.newCost)} 元）` : ''), shock(a)]);
  }
  routes.push(['換成 0050', `約 ${pct(r.swap.indexNeed)}`, '0（賣正2 的錢全買 0050）', shock(r.swap)]);
  const out = [
    explain({ label: '正2 自己要漲', value: pct(r.zrGain), tone: 'warn', how: `1 ÷ (1 − ${pct(r.loss)}) − 1`,
      means: (s.mode === 'price' ? `要從 ${s.now} 元漲回 ${s.cost} 元。` : '') + (r.lossAmount !== null ? `現在帳面虧 ${fmtMoney(r.lossAmount)}。` : '') }),
    explain({ label: '大盤（臺灣50）要漲多少', value: `約 ${pct(r.index.full)}`, tone: 'info',
      how: `波動 ${pct(p.sigma)}、${p.years} 年、每年內扣 ${pct(p.fee)}：√(1＋正2 要漲) × e^((波動²＋費用) × 年數 ÷ 2) − 1。`,
      means: '大盤每天穩穩上漲時，複利幫忙，要漲的比『除以 2』還少；震得越大、拖得越久，要漲的越多。' }),
    table(['算法', '大盤要漲'], [
      ['直覺：除以 2', `約 ${pct(r.index.naive)}`], ['最好情況：每天穩穩上漲', `約 ${pct(r.index.best)}`],
      ['加上震盪耗損', `約 ${pct(r.index.vol)}`], ['再加內扣費用', `約 ${pct(r.index.full)}`]
    ], '四種算法比較'),
    h('h3', {}, '三條路並排（只是算術，不是建議）'),
    table(['做法', '大盤要漲', '要再拿出的錢', '大盤再跌 20%，再虧原投入的'], routes, '三條路的回本與再跌情境'),
    h('p', { class: 'note' }, '攤平：要漲的變少，但放進去的錢變多，大盤再跌時虧得更多。換成 0050：沒有槓桿耗損，但大盤要漲更多才回到原本成本，而且賣出時虧損就確定了。再跌 20% 是用每天穩穩下跌估的，震盪時正2 會虧更多。')
  ];
  if (r.prob) {
    const rows = [['不動', ...r.prob.stay.map(x => fmtPct(x, 0))]];
    if (r.prob.avg !== null) rows.push(['攤平', ...r.prob.avg.map(x => fmtPct(x, 0))]);
    rows.push(['換成 0050', ...r.prob.swap.map(x => fmtPct(x, 0))]);
    out.push(h('h3', {}, `假設大盤每年平均 ${s.mu}%：幾年內『曾經回到成本』的機率`),
      table(['做法', ...r.prob.years.map(y => `${y} 年內`)], rows, '假設行情下曾經回本的機率'),
      h('p', { class: 'note' }, '這是用你填的平均報酬和波動算出來的機率，換個假設答案會差很多；不代表你一定能回本。不顯示『平均幾年回本』，因為波動讓有人很快回本、有人一直回不來。'));
  }
  out.push(h('p', { class: 'note' }, '想看正2 為什麼不是 2 倍：', link('decay.html', '⑥ 正二不是兩倍？'), '；一般股票跌多少要漲多少：', link('drawdown.html', '⑧ 跌多少要漲多少才回本'), '；平均成本細算（含手續費）：', link('avgcost.html', '⑮ 平均成本與攤平'), '。'));
  return out;
}

const example = { mode: 'price', cost: 40, now: 24, shares: 1000, vol: 'normal', years: 2, fee: 1.1, target: 30, mu: 8 };

document.getElementById('app').append(
  toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/recover/need.svg', alt: '橫條圖：正2 自己要漲 66.7%；直覺：除以 2，33.3%；每天穩穩上漲，29.1%；震盪 25%、2 年、含費用，38.9%。', caption: '正2 虧 40%，大盤要漲多少？看假設。' }),
    h('p', {}, '正2 每天追大盤的 2 倍。虧 40% 的正2 自己要漲 66.7% 才回本，但大盤不用漲 66.7%，也不剛好是 66.7% ÷ 2＝33.3%。'),
    h('p', {}, '大盤每天穩穩上漲時，正2 的漲幅會比 2 倍還多（複利），大盤約漲 29.1% 就夠。大盤上下震盪時，正2 會被耗損吃掉一點：一年波動 25%、拖 2 年、加上每年 1.1% 內扣，大盤要漲約 38.9%。'),
    h('p', {}, '這裡是從現在往後算：過去的耗損已經反映在現價，不用再算一次。'),
    h('p', {}, '公式假設波動固定、漲跌連續；真實市場會突然大跌（例如 2020 年 3 月），數字參考就好。『大盤』指臺灣50 指數，0050 會配息，價格漲幅會比指數略少。')),
  pathNav('recover'),
  references([
    { name: '元大投信 00631L 基本資料', url: 'https://www.yuantaetfs.com/product/detail/00631L/Basic_information' },
    { name: '臺灣證券交易所《槓桿型及反向型 ETF 介紹》', url: 'https://www.twse.com.tw/downloads/zh/ETF/etfnews01.pdf' },
    { name: 'Pocket 理財教室：股價漲回原點，槓桿 ETF 卻還在虧錢', url: 'https://www.pocket.tw/school/articles/5255/' },
    { name: 'FINRA Regulatory Notice 09-31（槓桿與反向 ETF）', url: 'https://www.finra.org/rules-guidance/notices/09-31' }
  ]), disclaimer('general'));
