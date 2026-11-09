// 工具⑲ 退休提領（精靈頁）。公式只在 core/retire.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, numberInput, explain, withHelp } from '../ui/wizard.js';
import { retirePlan } from '../core/retire.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'retire');
const num = id => parseNum(document.getElementById(id)?.value);
const signed = n => (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n));
const fromDca = parseNum(new URLSearchParams(location.search).get('pool') ?? '');

const steps = [
  {
    title: '退休時有多少錢',
    hint: '把退休時預計有的錢加起來：存款、股票、ETF、勞退專戶……。',
    about: '這一步是你要拿來每月領的那筆錢。',
    body: s => [
      h('p', { class: 'tip' }, fromDca > 0 ? `已從定期定額帶入 ${fmtMoney(fromDca)}，可以自己改。` : '還不知道退休時會有多少？先用「定期定額與年化報酬」算，結果頁可以一鍵帶過來。'),
      numberInput({ id: 'pool', label: '退休時的資產', plain: '例：10000000（1,000 萬）', value: s.pool ?? (fromDca > 0 ? Math.round(fromDca) : ''), suffix: '元',
        help: { text: ['股票、ETF 用退休那時預計的市值。', '房子如果不打算賣，不要算進來。'] } })],
    read: s => {
      s.pool = num('pool');
      if (!(s.pool > 0)) throw new Error('退休時的資產要大於 0，例：10000000。');
    }
  },
  {
    title: '要領多久、報酬多少',
    hint: '年數想保守就多填幾年；報酬率是你自己設的假設，不是預測。',
    about: '這一步決定錢要撐多久，以及還沒領的錢怎麼繼續滾。',
    body: s => [
      numberInput({ id: 'years', label: '要領幾年', plain: '例：65 歲退休、領到 90 歲就填 25', value: s.years ?? '', suffix: '年',
        help: { text: ['怕活得比預期久，就多填幾年。'] } }),
      numberInput({ id: 'ret', label: '退休後年報酬', termId: 'compound-interest', plain: '退休後通常放保守一點，例：3.5', value: s.ret ?? '', suffix: '%',
        help: { text: ['這是假設每年都一樣的報酬；真實市場有漲有跌。', '退休後還要每月領錢，通常會多放債券或現金，報酬會比存錢時低。'] } }),
      selectField({ id: 'timing', label: '每月什麼時候領', options: [{ value: 'end', label: '月底領（多滾一個月）' }, { value: 'start', label: '月初領（先拿到錢）' }], value: s.timing || 'end' })],
    read: s => {
      s.years = num('years'); s.ret = num('ret'); s.timing = document.getElementById('timing').value;
      if (!Number.isInteger(s.years) || s.years < 1 || s.years > 60) throw new Error('要領幾年填 1–60 的整數，例：25。');
      if (!(s.ret > -99 && s.ret < 99)) throw new Error('退休後年報酬填 −99 到 99，例：3.5。');
    }
  },
  {
    title: '通膨與留給家人',
    hint: '通膨先用 2%；不打算留錢就填 0。',
    about: '這一步決定每月領的錢要不要跟著物價調高，以及最後要留下多少。',
    figure: { src: '../img/retire/step3.webp', alt: '卡通圖：為什麼每月要越領越多？每月固定領 49,768 元：第 1 年購物籃是滿的，第 25 年少了一截，錢一樣多，買得到的東西越來越少。每月跟著物價調高：第 1 年 39,875 元、第 25 年 65,312 元，購物籃一樣滿，買得到的東西一樣多。老師說：物價每年漲 2%，每月領的錢也要跟著調高。1,000 萬、年報酬 3.5%、領 25 年、最後剛好領完。通膨是你自己設的假設。' },
    body: s => [
      numberInput({ id: 'inflation', label: '通膨率', termId: 'inflation', plain: '每年物價漲幾 %，常用 2；不考慮填 0', value: s.inflation ?? 2, suffix: '%',
        help: { text: ['填 2：每月領的錢每個月調高一點，一年下來多 2%，買得到的東西不變。', '填 0：每月領一樣多，但後面幾年買得到的東西會變少。'] } }),
      numberInput({ id: 'residual', label: '最後要留下多少', plain: '領完時還想剩的錢；不留填 0', value: s.residual ?? 0, suffix: '元',
        help: { text: ['例：想留 200 萬給家人或當醫療預備金。', '留越多，每月能領的越少。'] } })],
    read: s => {
      s.inflation = num('inflation'); s.residual = num('residual');
      if (!(s.inflation >= 0 && s.inflation <= 20)) throw new Error('通膨率填 0–20，例：2；不考慮通膨填 0。');
      if (!(s.residual >= 0)) throw new Error('要留下的錢不能是負的，不留填 0。');
    }
  },
  {
    title: '其他收入與每月花費',
    hint: '勞保年金、租金這類每月固定進帳填在這裡；兩格都是選填。',
    about: '這一步拿來比較：每月能領的錢＋其他收入，夠不夠你想花的。',
    body: s => [
      numberInput({ id: 'other', label: '其他每月固定收入（選填）', plain: '勞保年金、租金……；沒有填 0', value: s.other ?? 0, suffix: '元',
        help: { text: ['勞保年金可以到勞保局網站試算。', '這筆錢這裡不跟著通膨調高。'] } }),
      numberInput({ id: 'target', label: '退休第一年每月想花多少（選填）', plain: '用今天的物價想；留白就不比較', value: s.target, suffix: '元',
        help: { text: ['之後每年照通膨調高。'] } })],
    read: s => {
      s.other = num('other'); if (Number.isNaN(s.other)) s.other = 0; s.target = num('target');
      if (!(s.other >= 0)) throw new Error('其他每月收入不能是負的，沒有填 0。');
      if (!Number.isNaN(s.target) && !(s.target > 0)) throw new Error('每月想花多少要大於 0；不比較就留白。');
    }
  }
];

function result(s) {
  const r = retirePlan({ pool: s.pool, years: s.years, annualReturn: s.ret / 100, inflation: s.inflation / 100,
    residual: s.residual, timing: s.timing, otherIncome: s.other, targetSpend: s.target });
  const out = [
    explain({ label: '每月可領（第 1 個月）', value: fmtMoney(r.firstWithdraw), tone: 'ok',
      how: `資產 ${fmtMoney(s.pool)}` + (s.residual > 0 ? `，扣掉要留下的 ${fmtMoney(s.residual)} 折現到今天 ${fmtMoney(r.pvResidual)}` : '') + `；年報酬 ${s.ret}% 換成每月 ${fmtPct(r.monthlyRate, 3)}，領 ${s.years} 年共 ${r.months} 個月` + (s.inflation > 0 ? `，每月照通膨 ${s.inflation}% 調高` : '') + '。' + (s.timing === 'start' ? '月初領，少滾一個月。' : '月底領。'),
      means: (s.inflation > 0 ? '之後每個月調高一點，買得到的東西一樣多。' : '每月都一樣多。') + (s.residual > 0 ? `領完時剛好剩 ${fmtMoney(s.residual)}。` : '領完時剛好用完。') })];
  if (s.inflation > 0) out.push(explain({ label: '最後一個月可領', value: fmtMoney(r.lastWithdraw),
    how: `第 1 個月 ${fmtMoney(r.firstWithdraw)} × (1＋每月 ${fmtPct(r.monthlyGrowth, 3)})^${r.months - 1}。`,
    means: '金額變大，但換回第 1 年的物價，買得到的東西一樣多。' }));
  if (s.other > 0) out.push(explain({ label: '每月總收入', value: fmtMoney(r.firstTotal),
    how: `第 1 個月可領 ${fmtMoney(r.firstWithdraw)} ＋ 其他固定收入 ${fmtMoney(s.other)}。最後一個月是 ${fmtMoney(r.lastTotal)}。`,
    means: s.inflation > 0 ? `其他收入這裡不跟著通膨調高：${fmtMoney(s.other)} 到最後一個月，只等於第 1 年的 ${fmtMoney(r.lastOtherReal)}。` : '沒有算通膨。' }));
  out.push(explain({ label: '第一年提領率', value: fmtPct(r.withdrawRate, 2), tone: r.withdrawRate > 0.04 ? 'warn' : 'ok',
    how: `第 1 個月可領 ${fmtMoney(r.firstWithdraw)} × 12 ÷ 資產 ${fmtMoney(s.pool)}。4% 法則第一年每月約 ${fmtMoney(r.rule4Monthly)}。`,
    means: (r.withdrawRate > 0.04 ? '比 4% 高：真實報酬比你假設的低、或剛退休就遇到大跌，錢可能提早用完。' : '沒超過 4%，比較保守。') + '4% 法則來自美國的歷史資料，是經驗法則，不是保證。' }));
  if (!Number.isNaN(s.target)) out.push(explain({ label: '想花的錢夠不夠', value: signed(r.gap), tone: r.gap >= 0 ? 'ok' : 'bad',
    how: `第 1 個月總收入 ${fmtMoney(r.firstTotal)} − 想花 ${fmtMoney(s.target)}。`,
    means: r.gap < 0 ? `每月不夠 ${fmtMoney(-r.gap)}。要剛好夠，退休時要有 ${fmtMoney(r.needPool)}，還差 ${fmtMoney(r.needPool - s.pool)}。` : `夠用，每月多 ${fmtMoney(r.gap)}。要剛好夠，退休時有 ${fmtMoney(r.needPool)} 就可以。`,
    todo: r.gap < 0 ? '可以多存一點、晚幾年退休、少領幾年，或降低每月花費，改參數重算看看。' : undefined }));
  out.push(explain({ label: '總共領出', value: fmtMoney(r.totalWithdrawn),
    how: `${r.months} 個月的提領加起來。`,
    means: r.totalWithdrawn > s.pool ? '比退休時的資產多，因為還沒領的錢會繼續滾。' : '比退休時的資產少，因為報酬是負的或要留下一筆錢。' }),
    h('h3', {}, '逐年變化'),
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, ['年', '那年每月領（第 1 個月，元）', '那年共領（元）', '年底剩下（元）'].map(t => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, r.rows.map(row => h('tr', {},
        h('td', {}, row.year),
        ...[row.withdraw, row.yearTotal, row.endBalance].map(n => h('td', {}, Math.round(n).toLocaleString('en-US'))))))),
    h('div', { class: 'note' }, [
      '這是固定報酬的情境；剛退休就遇到大跌，同樣平均報酬，錢會比這裡更早用完。',
      '其他每月收入這裡不跟著通膨調高；勞保年金實際有調整機制但不固定，這裡沒有模擬。',
      '沒算稅、健保費，也沒算醫療、長照這類一次性的大筆支出。',
      '每月賣股票、ETF 換現金時，還有手續費和證交稅，可以用「買賣成本與損益」算。'
    ].map(n => h('p', {}, n))));
  return out;
}

const example = { pool: 10000000, years: 25, ret: 3.5, timing: 'end', inflation: 2, residual: 0, other: 15000, target: 50000 };

document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/retire/comic.webp', alt: '四格漫畫：一、小安抱著 1,000 萬的錢袋，問退休後每個月能領多少。二、不管物價：年報酬 3.5%、領 25 年、最後剛好領完，每月約 49,768 元。三、物價每年漲 2%：第 1 年每月 39,875 元、第 25 年每月 65,312 元，每月跟著物價調高；老師說一開始領少一點，換來每年買得到的東西一樣多。四、4% 法則每月約 33,333 元；老師的白板寫報酬是假設不是保證、剛退休就大跌要領少一點；這是規劃情境，不是預測。' }),
    h('p', {}, '退休提領＝把退休時的錢分成很多個月領，還沒領的錢繼續放著滾。'),
    h('p', {}, '物價會漲，所以每月領的錢要跟著調高，買得到的東西才不會變少。'),
    h('p', {}, '4% 法則：第一年領資產的 4%，之後照通膨調高。它是經驗法則，不是保證。')),
  disclaimer('general'));
