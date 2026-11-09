// 工具⑭ 幾倍槓桿最划算：計算只呼叫 core/kelly.js。
import { h, toolHeader, disclaimer, figure, lineChart } from '../ui/components.js';
import { wizard, numberInput, explain } from '../ui/wizard.js';
import { kellyPlan } from '../core/kelly.js';
import { parseNum, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'kelly');
const num = id => parseNum(document.getElementById(id)?.value);
const blank = v => v === undefined || v === null || Number.isNaN(v);
const x2 = L => L.toFixed(2) + ' 倍';
const params = s => ({ cagr1x: s.cagrPct / 100, vol: s.volPct / 100, borrowRate: s.borrowPct / 100, cashRate: blank(s.cashPct) ? 0 : s.cashPct / 100, current: s.current });

const steps = [
  {
    title: '大盤的假設',
    hint: '不知道就先用範例：每年 8%、波動 20%，這只是常見的假設，不是預測。',
    about: '凱利倍數只看兩件事：平均每年賺多少、漲跌有多劇烈。兩個都是你猜的，結果對它們非常敏感。',
    figure: { src: '../img/kelly/step1.webp', alt: '平均一樣，波動不一樣。上下兩張小折線圖，起點和終點高度一樣。上圖波動小：線條平緩往右上，能放比較多倍；下圖波動大：線條上下劇烈起伏，最後也到同一個終點，能放的倍數比較少。小安問：平均都賺一樣多，為什麼不能一樣多倍？老師說：波動越大，借錢放大後越容易被大跌拖垮。兩個數字都是你的假設，填保守一點。' },
    body: s => [
      numberInput({ id: 'cagrPct', label: '1 倍每年平均賺多少', plain: '例：全部買 0050 的長期年化報酬', suffix: '%', value: s.cagrPct, help: { text: ['長期年化報酬（含息）。這是對未來的假設，過去的報酬不代表未來。', '填保守一點比較安全。'] } }),
      numberInput({ id: 'volPct', label: '每年波動', termId: 'volatility', plain: '例：20', suffix: '%', value: s.volPct, help: { text: ['一年裡漲跌的典型幅度（標準差）。', '大盤 ETF 常見大約 15%–25%；個股通常更大。'] } })],
    read: s => {
      s.cagrPct = num('cagrPct'); s.volPct = num('volPct');
      if (blank(s.cagrPct) || blank(s.volPct)) throw new Error('請填每年報酬和波動。');
      kellyPlan(params({ ...s, borrowPct: 0, cashPct: 0, current: NaN }));
    }
  },
  {
    title: '利率和你現在的倍數',
    hint: '借錢利率填你實際借得到的（質押、信貸、融資）；現金利率填定存或活存。',
    body: s => [
      numberInput({ id: 'borrowPct', label: '借錢的年利率', plain: '例：質押約 2.5–3', suffix: '%', value: s.borrowPct }),
      numberInput({ id: 'cashPct', label: '現金的年利率（選填）', plain: '留白＝0', suffix: '%', value: s.cashPct }),
      numberInput({ id: 'current', label: '你現在幾倍（選填）', plain: '留白就不比較', suffix: '倍', value: s.current, help: { text: ['不知道自己幾倍，可以先用 ⑬ 人生槓桿體檢或 ⑪ 正二要買多少算。', '例：全部買 0050 是 1 倍；一半 0050、一半正二約 1.5 倍。'] } })],
    read: s => {
      s.borrowPct = num('borrowPct');
      if (blank(s.borrowPct)) throw new Error('請填借錢的年利率。');
      s.cashPct = num('cashPct'); s.current = num('current');
      kellyPlan(params(s));
    }
  }
];

function result(s) {
  const r = kellyPlan(params(s));
  const by = Object.fromEntries(r.rows.map(x => [x.key, x]));
  const out = [
    explain({ label: '全凱利（長期成長最快）', value: x2(r.full), tone: 'info',
      how: r.full >= 1 ? '先把年化 ' + s.cagrPct + '% 換成每年平均 μ＝ln(1 + ' + s.cagrPct + '%) ＋ ' + s.volPct + '%² ÷ 2 ＝ ' + fmtPct(r.mu, 2) + '；再算（μ − ln(1 + 借錢利率 ' + s.borrowPct + '%)）÷ ' + s.volPct + '%² ＝ ' + r.full.toFixed(2) + ' 倍。' : '報酬扣掉借錢利率後不夠付波動的代價，借錢不划算；最好的倍數在 1 倍以內（多出來的放現金）。',
      means: r.full === 0 ? '報酬比現金利率還低：照這個假設，不投入最好。' : '這個倍數長期年化最高，約 ' + fmtPct(r.maxCagr) + '。' }),
    explain({ label: '半凱利', value: x2(r.half), tone: 'ok', how: '全凱利 ÷ 2。',
      means: '長期年化 ' + fmtPct(by.half.cagr) + '，比全凱利少一點，但腰斬機率從 ' + fmtPct(by.full.halveProb) + ' 降到 ' + fmtPct(by.half.halveProb) + '。四分之一凱利是 ' + x2(r.quarter) + '。' }),
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, ['倍數', '長期年化', '曾經腰斬機率'].map(label => h('th', { scope: 'col' }, label)))),
      h('tbody', {}, r.rows.map(x => h('tr', {}, h('td', {}, ['cash', 'one', 'two'].includes(x.key) ? x.label : x.label + '（' + x2(x.L) + '）'), h('td', {}, fmtPct(x.cagr)), h('td', {}, fmtPct(x.halveProb)))))),
    h('p', { class: 'note' }, '曾經腰斬機率：在這個模型裡，資產曾經跌到起點一半的機率（時間拉到無限長的理論值）。')
  ];
  if (by.current) out.push(explain({ label: '你現在 ' + x2(by.current.L), value: fmtPct(by.current.cagr), tone: r.breakEven !== null && by.current.L >= r.breakEven ? 'bad' : by.current.L > r.full ? 'warn' : 'ok',
    how: '照同樣的假設，' + x2(by.current.L) + '的長期年化。',
    means: by.current.L > r.full ? '已經過了山頂：再加倍數，長期報酬只會變少，腰斬機率（現在 ' + fmtPct(by.current.halveProb) + '）繼續變大。' : '還在山頂左邊：加倍數報酬會增加，但腰斬機率（現在 ' + fmtPct(by.current.halveProb) + '）也會跟著變大。' }));
  if (r.breakEven !== null) out.push(explain({ label: '超過幾倍長期會虧', value: x2(r.breakEven), tone: 'bad', how: '長期年化掉回 0 的倍數。', means: '倍數太高時，波動拖累比多賺的還多，放越久越虧。正二全押是 2 倍。' }));
  out.push(lineChart({ series: [{ name: '長期年化報酬', values: r.curve.map(p => p.cagr) }], label: '倍數 0 到 4 倍的長期年化報酬曲線',
    yFormat: v => { const t = (v * 100).toFixed(0); return (t === '-0' ? '0' : t) + '%'; }, baseline: 0 }),
    h('p', { class: 'note' }, '橫軸：最左邊 0 倍、最右邊 4 倍，每格 0.1 倍。'),
    h('p', { class: 'note' }, '理論模型：每年報酬、波動、利率都固定，每天調回同樣倍數；沒算內扣費用、追蹤誤差、追繳和斷頭。對假設非常敏感：每年 8% 改成 6%（其他不變），全凱利就從 1.69 倍掉到約 1.22 倍。'));
  return out;
}

const example = { cagrPct: 8, volPct: 20, borrowPct: 3, cashPct: 1, current: 1.4 };

document.getElementById('app').append(
  toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/kelly/comic.webp', alt: '四格漫畫：一、倍數越高越好？小安舉著 2 倍牌子問：借錢買越多，賺越多吧？老師說：先看長期的年化報酬。二、長期報酬像一座山。橫軸倍數，曲線標籤：1 倍 8.0%、1.69 倍 9.0%（山頂）、2 倍 8.8%、3.76 倍 0%。老師說：山頂叫凱利倍數。三、過了山頂，風險變大。1.4 倍｜年化 8.8%｜曾經腰斬 22%；2 倍｜年化 8.8%｜曾經腰斬 48%。小安說：報酬一樣，腰斬機率多一倍！四、很多人只用一半。半凱利 0.84 倍｜年化 7.2%｜曾經腰斬 3%。老師說：假設猜不準，少用一點比較安全。假設每年賺 8%、波動 20%、借錢利率 3%；理論值，不是保證。' }),
    h('p', {}, '倍數越高不一定賺越多。每天調回固定倍數時，波動會吃掉複利：倍數太低賺太少、太高被波動拖垮，中間有一個長期成長最快的點，叫凱利倍數。'),
    h('p', {}, '過了凱利倍數，報酬開始變少、風險繼續變大；大約到兩倍凱利，長期報酬就掉回跟現金差不多。'),
    h('p', {}, '報酬和波動都是猜的，猜錯一點凱利倍數就差很多，所以很多人只用一半（半凱利）。這裡也沒算追繳：借錢的人在跌到凱利模型說的谷底之前，可能就先被追繳了。')),
  disclaimer('general'));
