import { h, toolHeader, selectField, disclaimer, figure, lineChart } from '../ui/components.js';
import { wizard, numberInput, explain, withHelp } from '../ui/wizard.js';
import { decayPlan } from '../core/decay.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'decay');
const num = id => parseNum(document.getElementById(id)?.value);
const pct = id => num(id) / 100;
const link = (href, text) => h('a', { href }, text);
const signed = (x, digits = 1) => { const n = Math.round(x * 10 ** (digits + 2)); return (n > 0 ? '+' : '') + fmtPct(n === 0 ? 0 : x, digits); };

function params(s) {
  return { kind: s.kind, days: s.days, size: s.size / 100,
    amount: Number.isNaN(s.amount) || s.amount == null ? 0 : s.amount,
    annualCost: Number.isNaN(s.annualCost) || s.annualCost == null ? 0 : s.annualCost / 100 };
}

const steps = [
  {
    title: '選行情',
    hint: '先選一種行情，下一步再填天數和幅度。',
    about: '正二是『每天』大約 2 倍，不是一整段 2 倍。行情來回震盪或一路同方向，結果差很多。',
    figure: { src: '../img/decay/step1.webp', alt: '同樣的天數，行情不同結果差很多。來回震盪：漲 5%、跌 5%、漲 5%、跌 5%……正二比整段 2 倍少。一路同方向：每天都漲 1%，正二可能比整段 2 倍多。老師說：真實行情是兩種混在一起，先各試一次看看差多少。' },
    body: s => withHelp(selectField({ id: 'kind', label: '行情', termId: 'volatility-decay', options: [
      { value: 'chop', label: '來回震盪（一天漲、一天跌）' },
      { value: 'trend', label: '一路同方向（每天漲跌一樣多）' }
    ], value: s.kind || 'chop' }), { text: ['來回震盪：大盤一天漲、隔天跌同樣的 %，最後幾乎回到原點。', '一路同方向：把整段漲跌平均分到每一天。'] }),
    read: s => {
      s.kind = document.getElementById('kind').value;
      steps[1].hint = s.kind === 'chop' ? '例：20 天、每天漲跌 5%。' : '例：10 天、整段大盤漲 10%；跌就填負數，例 −30。';
    }
  },
  {
    title: '大盤怎麼走',
    hint: '例：20 天、每天漲跌 5%。',
    about: '一年大約 250 個交易日。',
    body: s => {
      const chop = s.kind === 'chop';
      return [numberInput({ id: 'days', label: '天數', plain: '模擬幾個交易日（1–2520）', suffix: '天', value: s.days }),
        numberInput({ id: 'size', label: chop ? '每天漲跌幅' : '整段大盤漲跌', termId: 'daily-2x', plain: chop ? '大盤一天漲這麼多、隔天跌這麼多' : '整段期間大盤總共漲跌幾 %', suffix: '%', value: s.size })];
    },
    read: s => {
      s.days = num('days'); s.size = num('size');
      if (!document.getElementById('days').value.trim() || !document.getElementById('size').value.trim()) throw new Error('請填天數和幅度。');
      decayPlan({ kind: s.kind, days: s.days, size: pct('size') });
    }
  },
  {
    title: '你的錢（選填）',
    hint: '兩格都可以留白。填了金額，結果會換算成錢。',
    body: s => [
      numberInput({ id: 'amount', label: '投入金額', plain: '留白就只看 %', suffix: '元', value: s.amount }),
      numberInput({ id: 'annualCost', label: '每年內扣費用', plain: '留白當 0；正二大約 1% 上下', suffix: '%', value: s.annualCost,
        help: { text: ['正二每天從淨值扣的經理費、保管費等，一年合計大約 1% 上下，詳細看投信網站的公開說明書。', '這裡平均攤到每天（÷ 250）。'] } })],
    read: s => { s.amount = num('amount'); s.annualCost = num('annualCost'); decayPlan(params(s)); }
  }
];

function result(s) {
  steps[1].hint = s.kind === 'chop' ? '例：20 天、每天漲跌 5%。' : '例：10 天、整段大盤漲 10%；跌就填負數，例 −30。';
  const r = decayPlan(params(s)), m = r.amount > 0, chop = s.kind === 'chop';
  return [
    explain({ label: '大盤整段', value: signed(r.indexTotal) + (m ? '（' + fmtMoney(r.moneyIndex) + '）' : ''), tone: 'info',
      how: chop ? `每天 ×(1 + ${s.size}%)、隔天 ×(1 − ${s.size}%)，共 ${s.days} 天。` : `整段 ${signed(s.size / 100)} 平均攤成每天一樣的漲跌，共 ${s.days} 天。` }),
    explain({ label: '以為的「整段 × 2」', value: signed(r.naive) + (m ? '（' + fmtMoney(r.moneyNaive) + '）' : ''),
      how: `大盤整段 ${signed(r.indexTotal)} × 2。`, means: '很多人以為正二就是這樣，但正二不是這樣算的。' }),
    explain({ label: '正二實際', value: signed(r.leveredTotal) + (m ? '（' + fmtMoney(r.moneyLevered) + '）' : ''), tone: r.gap < 0 ? 'bad' : 'ok',
      how: '每天都用前一天的淨值 ×(1 + 2 × 大盤當天漲跌' + (r.dailyCost > 0 ? ' − 每天費用 ' + (r.dailyCost * 100).toFixed(4) + '%' : '') + ')，一天一天乘上去。' }),
    explain({ label: '差距', value: signed(r.gap) + (m ? '（' + (r.moneyGap < 0 ? '少 ' : '多 ') + fmtMoney(Math.abs(r.moneyGap)) + '）' : ''), tone: r.gap < 0 ? 'bad' : 'ok',
      how: '正二實際 − 以為的整段 × 2。', means: r.gap < 0 ? '來回震盪越多、天數越長，差距通常越大。這就是常聽到的波動耗損。' : '一路同方向時，每天重新變 2 倍反而會放大結果。',
      todo: ['想知道正二要買多少，看 ', link('exposure.html', '⑪ 正二要買多少'), '。'] }),
    lineChart({ series: [{ name: '正二', values: r.leveredPath }, { name: '大盤', values: r.indexPath }],
      label: '正二與大盤的淨值走勢，起點為 0%', yFormat: v => signed(v - 1, 0), baseline: 1 }),
    h('p', { class: 'note' }, '理想化計算：' + (r.dailyCost > 0 ? '' : '沒扣內扣費用、') + '沒算追蹤誤差和折溢價，實際結果會再差一些。')
  ];
}

const example = { kind: 'chop', days: 20, size: 5, amount: 1000000, annualCost: NaN };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/decay/comic.webp', alt: '四格漫畫：一、漲 10%、再跌 10%。大盤：100 → 110 → 99。正二：100 → 120 → 96。小安說：大盤才少 1，正二怎麼少 4？二、每天重新變 2 倍。第 2 天正二用 120 在跌：120 × 20%＝24。跌下來的那天本金比較大。老師說：正二保證的是『每一天』大約 2 倍。三、來回震盪 20 天（每天 ±5%），放 100 萬。大盤 975,279；以為（整段 × 2）950,559；正二實際 904,382。小安說：比以為的還少 4 萬多！四、一路漲時反而多。連續 10 天每天漲 1%；大盤 +10.5%；整段 × 2＝+20.9%；正二 +21.9%。老師說：所以不能用一個固定的『每年耗損幾 %』來估。理想化計算：沒算內扣費用、追蹤誤差和折溢價。' }),
    h('p', {}, '正二每天收盤後都會把倍數調回 2 倍，所以它保證的是『每一天』大約 2 倍，不是一個月、一年的 2 倍。'),
    h('p', {}, '來回震盪時，跌下來的那天是用比較大的本金在跌，漲回去的那天是用比較小的本金在漲，一來一回就輸給『整段 × 2』。這就是常聽到的波動耗損。'),
    h('p', {}, '反過來，一路往同一個方向走的時候，正二可能比整段 2 倍還多。所以不能用一個固定的『每年耗損幾 %』來估。')),
  disclaimer('general'));
