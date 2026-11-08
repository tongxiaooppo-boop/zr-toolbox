// 【樣板頁】後續每個工具頁照這個結構寫：
//   1. toolHeader  2. 一張 card 放欄位（每個欄位：label＋白話副標＋需要時 ⓘ）＋帶入範例
//   3. 結果區 .result（輸入變動即重算；錯誤用 showError，訊息直接用純函式丟出的中文）
//   4. 結果下方一段「怎麼讀這個結果」白話 5. 最後 disclaimer
// 計算只呼叫 js/core 的純函式，頁面裡不寫公式。
import { h, toolHeader, numberField, exampleButton, readNumbers, metric, showResult, showError, disclaimer } from '../ui/components.js';
import { checkTrigger, split5050 } from '../core/trigger.js';
import { fmtMoney, fmtPct } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'trigger5050');
const FIELDS = ['basePrice', 'nowPrice', 'lever', 'cash'];
const result = h('div', { class: 'result', 'aria-live': 'polite' });

function update() {
  const v = readNumbers(FIELDS);
  if (FIELDS.some(id => Number.isNaN(v[id]))) { showResult(result, h('p', { class: 'muted' }, '填完四格就會算。')); return; }
  try {
    const t = checkTrigger({ basePrice: v.basePrice, nowPrice: v.nowPrice });
    const s = split5050({ lever: v.lever, cash: v.cash });
    const nodes = [h('div', { class: 'metrics' },
      metric('正二相對基準價', fmtPct(t.change), t.hit ? 'warn' : undefined),
      metric('到 ±50% 了嗎？', t.hit ? (t.direction === 'up' ? '漲到了' : '跌到了') : '還沒', t.hit ? 'warn' : 'ok'))];
    if (t.hit) nodes.push(
      h('div', { class: 'metrics' },
        metric(s.leverTrade >= 0 ? '正二要買進' : '正二要賣出', fmtMoney(Math.abs(s.leverTrade))),
        metric('配回後正二、現金各', fmtMoney(s.target))),
      h('p', { class: 'note' }, '配回後把今天的正二價格記成新的基準價。'));
    else nodes.push(h('p', {}, '還沒到，先不用動。'));
    showResult(result, nodes);
  } catch (e) { showError(result, e.message); }
}

const app = document.getElementById('app');
app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    numberField({ id: 'basePrice', label: '基準價', plain: '上次配回各半時的正二價格', termId: 'base-price', suffix: '元' }),
    numberField({ id: 'nowPrice', label: '正二現價', plain: '最近一個交易日收盤價即可', termId: 'daily-2x', suffix: '元' }),
    numberField({ id: 'lever', label: '正二市值', plain: '這個策略裡的正二現在值多少', suffix: '元' }),
    numberField({ id: 'cash', label: '策略現金', plain: '留給這個策略、還沒買股票的錢', termId: 'rebalance', suffix: '元' }),
    exampleButton({ basePrice: 100, nowPrice: 150, lever: 150000, cash: 100000 }, update)),
  h('section', { class: 'card' }, h('h2', {}, '結果'), result),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    h('p', {}, '這是大仁 50/50 的做法：一半正二、一半現金。正二相對基準價漲或跌 50% 時，用當時的總額配回各半；沒到就不動。'),
    h('p', {}, '漲到時會賣掉一些正二收回現金；跌到時會拿現金補正二。跌到時補進去的錢，如果之後繼續跌，一樣會跟著跌。')),
  disclaimer('general'));
app.addEventListener('input', update);
update();
