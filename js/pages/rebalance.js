// 工具③ 定期配比再平衡：公式與股數取整只呼叫 core/rebalance.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, betaHoldingsInput, readBetaHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { WIZARD_TEMPLATES, guessBeta, rebalancePlan } from '../core/rebalance.js';
import { parseNum, fmtMoney, fmtPct, fmtX } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'rebalance');
const num = id => parseNum(document.getElementById(id)?.value);
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;
const price = n => `${+n.toFixed(2)} 元`;
const link = (href, text) => h('a', { href }, text);
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const periods = { 1: '每月', 3: '每季', 6: '每半年', 12: '每年' };

function params(s, withDate) {
  return { rows: s.rows.map(r => ({ ...r, weight: (s.weights[r.code] || 0) / 100 })),
    cash: s.cash, cashWeight: (s.cashPct || 0) / 100, contribution: s.contribution || 0,
    unit: s.unit || 1, months: s.months || 6, last: withDate ? s.last || undefined : undefined, asOf: today };
}

const steps = [
  {
    title: '選配置',
    hint: '選一個常見的比例當起點，下一步可以改代號、加減檔數。',
    about: '定期配比只看時間：選好比例和週期，時間到了就用當時的總額照比例配回，中間漲跌都不動。這和 ② 的 50/50 觸發不同，那個看的是漲跌幅。',
    figure: { src: '../img/rebalance/step1.webp', alt: '名字一樣叫 532，內容不一樣。小安問：網路上說的 532，到底是哪一種？股版：原型 50%、正二 30%、現金 20%，約 1.1 倍大盤。債版：正二 50%、美債 30%、現金 20%，約 1 倍大盤。兩者不相等。老師說：別人說 532 先問是哪一種。自訂也可以，但每一份加起來要剛好 100%。' },
    body: s => [withHelp(selectField({ id: 'template', label: '配置', options: Object.entries(WIZARD_TEMPLATES).map(([value, t]) => ({ value, label: t.name })), value: s.template || '532-stock' }),
      { text: ['股版＝原型／正二／現金；債版＝正二／美債／現金。名字一樣、風險不同。', '模板裡的代號只是例子（0050、00631L、00679B），下一步可以換成你實際買的。'] })],
    read: s => {
      s.template = document.getElementById('template').value;
      if (s.rowsFrom !== s.template) {
        const t = WIZARD_TEMPLATES[s.template];
        s.rows = t.rows.map(r => ({ code: r.code, shares: NaN, price: NaN, beta: r.beta }));
        s.weights = Object.fromEntries(t.rows.map(r => [r.code, r.weight * 100]));
        s.cashPct = s.template === 'custom' ? NaN : t.cash * 100;
        s.rowsFrom = s.template;
      }
    }
  },
  {
    title: '你的持股',
    hint: '只填這個策略裡的持股。股數看券商 App 的庫存；還沒買的那檔股數填 0。',
    about: '每一檔記下現在有幾股、現價多少，工具才算得出要買賣幾股。',
    figure: { src: '../img/common/step-holdings.svg', alt: '券商 App 庫存畫面示意：代號 0050 元大台灣50、股數 10,000、成本均價 80.00、現價 100.00。股票代號填 0050，買入股數填 10000（1 張＝1000 股），買入價填 80；現價會自動抓，不用填。' },
    body: s => {
      const holdings = betaHoldingsInput({ id: 'rows', rows: s.rows || [], kind: 'mix' });
      const token = tokenBox();
      holdings.querySelectorAll('.beta-holding').forEach(row => {
        const code = row.querySelector('.b-code');
        if (code.value.trim() && !row.querySelector('.b-price').value.trim()) code.dispatchEvent(new Event('change'));
      });
      return [holdings, token];
    },
    read: s => {
      s.rows = readBetaHoldings('rows').map(r => ({ ...r, shares: Number.isNaN(r.shares) ? 0 : r.shares }));
      rebalancePlan({ rows: s.rows.map(r => ({ ...r, weight: 1 / s.rows.length })), cash: 1, cashWeight: 0 });
    }
  },
  {
    title: '現金與目標比例',
    hint: '現金只算這個策略留的錢，不是全部存款。比例照你自己的規則填，加起來要 100%。',
    about: '每一份要占總額幾 %。總額＝持股市值＋現金＋這次新投入。',
    body: s => {
      const body = h('div', {},
        numberInput({ id: 'cash', label: '策略現金', plain: '這個策略留著的現金', suffix: '元', value: s.cash, help: { text: ['只填這個策略的現金部位（例：放在交割戶、準備配回用的錢）。', '沒有就填 0。'] } }),
        numberInput({ id: 'contribution', label: '這次新投入', plain: '沒有就留白', suffix: '元', value: s.contribution, help: { text: ['這次要另外加進來的錢（例：這半年存下來的）。', '會一起算進總額，照比例分下去。'] } }),
        s.rows.map(({ code }, i) => numberInput({ id: 'w-' + i, label: named(code) + ' 的比例', suffix: '%', value: s.weights?.[code] })),
        numberInput({ id: 'cashPct', label: '現金的比例', suffix: '%', value: s.cashPct }),
        h('p', { class: 'muted', id: 'w-sum' }),
        withHelp(selectField({ id: 'unit', label: '下單方式', options: [{ value: '1', label: '可以買賣零股（算到 1 股）' }, { value: '1000', label: '只用整張（1 張＝1000 股）' }], value: String(s.unit || 1) }),
          { text: ['零股：算到 1 股，最貼近目標比例。', '只用整張：不到 1 張的差額就不動，配完會跟目標差多一點。'] }));
      const updateSum = () => {
        const sum = [...s.rows.map((_, i) => 'w-' + i), 'cashPct'].reduce((a, id) => a + (parseNum(body.querySelector(`#${id}`).value) || 0), 0);
        body.querySelector('#w-sum').textContent = `目前加起來 ${+sum.toFixed(2)}%`;
      };
      updateSum();
      body.addEventListener('input', updateSum);
      return [body];
    },
    read: s => {
      s.cash = num('cash');
      if (Number.isNaN(s.cash)) throw new Error('請填策略現金，沒有就填 0。');
      s.contribution = num('contribution') || 0;
      s.weights = Object.fromEntries(s.rows.map(({ code }, i) => [code, num('w-' + i) || 0]));
      s.cashPct = num('cashPct') || 0;
      s.unit = Number(document.getElementById('unit').value);
      rebalancePlan(params(s, false));
    }
  },
  {
    title: '多久配回一次',
    hint: '不知道上次是哪天就留白，工具照樣算今天配回的股數。',
    about: '週期到了才配回；還沒到就不用動。',
    body: s => [
      selectField({ id: 'months', label: '再平衡週期', termId: 'rebalance', options: Object.entries(periods).map(([value, label]) => ({ value, label })), value: String(s.months || 6) }),
      withHelp(h('div', { class: 'field' }, h('label', { for: 'last' }, '上次配回日（選填）'),
        h('input', { id: 'last', type: 'date', value: s.last || '', max: today })), { text: ['上次照比例配好的那天。', '留白就不算到期日。'] })],
    read: s => { s.months = Number(document.getElementById('months').value); s.last = document.getElementById('last').value || ''; }
  }
];

function result(s) {
  const r = rebalancePlan(params(s, true));
  const out = [];
  if (r.due) out.push(explain({ label: '到期了嗎？', value: r.ready ? '到期了，可以配回' : '還沒到期', tone: r.ready ? 'warn' : 'ok',
    how: `上次配回 ${s.last} ＋ ${periods[s.months || 6]} ＝ ${r.due}。`,
    means: r.ready ? '照規則今天可以配回。' : '照規則先不用動；下面是「如果今天配回」的股數。',
    todo: r.ready ? '照下面的股數下單，做完把今天的日期記下來，下次第 4 步填這個日期。' : null }));
  out.push(explain({ label: '總額', value: fmtMoney(r.pool), tone: 'info',
    how: `持股市值 ${fmtMoney(r.total - s.cash)} ＋ 現金 ${fmtMoney(s.cash)}` + (s.contribution > 0 ? ` ＋ 新投入 ${fmtMoney(s.contribution)}` : '') + ` ＝ ${fmtMoney(r.pool)}。`, means: '每一份的目標＝總額 × 比例。' }),
    h('table', { class: 'trade-table' },
      h('thead', {}, h('tr', {}, ['部位', '現在占', '目標占', '要做的事', '配完股數'].map(label => h('th', { scope: 'col' }, label)))),
      h('tbody', {}, r.rows.map(row => h('tr', {}, h('td', {}, named(row.code)), h('td', {}, fmtPct(row.nowWeight)), h('td', {}, fmtPct(row.weight)),
        h('td', {}, row.tradeShares === 0 ? '不動' : `${row.tradeShares > 0 ? '買進' : '賣出'} ${Math.abs(row.tradeShares).toLocaleString('en-US')} 股`), h('td', {}, row.sharesAfter.toLocaleString('en-US')))),
      h('tr', {}, h('td', {}, '現金'), h('td', {}, fmtPct(r.cashWeightNow)), h('td', {}, fmtPct(s.cashPct / 100)), h('td', {}, `配完 ${fmtMoney(r.cashAfter)}`), h('td', {}, '—')))));
  r.rows.filter(row => row.tradeShares !== 0).forEach(row => out.push(explain({ label: `${named(row.code)}：${row.tradeShares > 0 ? '買進' : '賣出'}`, value: `${Math.abs(row.tradeShares).toLocaleString('en-US')} 股`, tone: 'warn',
    how: `目標 ${fmtMoney(row.target)}（${fmtMoney(r.pool)} × ${+(row.weight * 100).toFixed(2)}%）− 現在 ${fmtMoney(row.value)}，÷ 現價 ${price(row.price)} ＝ ${((row.target - row.value) / row.price).toFixed(1)} 股 → ${row.tradeShares > 0 ? '買進無條件捨去' : '賣出四捨五入'}` + (s.unit === 1000 ? '，以 1,000 股為單位' : '') + '。',
    means: `約 ${fmtMoney(Math.abs(row.tradeAmount))}。配完 ${row.sharesAfter.toLocaleString('en-US')} 股、約 ${fmtMoney(row.valueAfter)}，占 ${fmtPct(row.weightAfter)}。` })));
  out.push(explain({ label: '配完的現金', value: fmtMoney(r.cashAfter), tone: 'ok',
    how: `現金 ${fmtMoney(s.cash)} ＋ 新投入 ${fmtMoney(s.contribution || 0)} − 買進 ${fmtMoney(r.buyAmount)} ＋ 賣出 ${fmtMoney(r.sellAmount)} ＝ ${fmtMoney(r.cashAfter)}。`,
    means: `目標是 ${fmtMoney(r.cashTarget)}；差一點是因為股數要取整。`, todo: ['下單前用 ', link('cost.html', '⑨ 買賣成本與損益'), ' 算手續費和稅；這裡沒算。'] }),
    explain({ label: '曝險倍數', value: `${fmtX(r.exposureNow)} → ${fmtX(r.exposureAfter)}`, tone: 'info',
      how: '每檔市值 × Beta 加起來 ÷ 總額。用到的 Beta：' + s.rows.map(row => `${row.code} ${Number.isNaN(row.beta) ? guessBeta(row.code) + '（看代號猜）' : row.beta}`).join('、') + '。',
      means: `約等於「總額的幾倍跟著大盤漲跌」；目標比例算出來是 ${fmtX(r.exposureTarget)}。現金當 0，債券 ETF 當 0 是簡化。` }),
    h('p', { class: 'note' }, '沒算手續費、證交稅；到期那天休市就順延到下一個交易日。'));
  return out;
}

const example = { template: '532-stock', rowsFrom: '532-stock',
  rows: [{ code: '0050', shares: 2000, price: 195.5, beta: 1 }, { code: '00631L', shares: 9000, price: 26.3, beta: 2 }],
  weights: { '0050': 50, '00631L': 30 }, cashPct: 20, cash: 172300, contribution: 50000, unit: 1, months: 6, last: '2026-05-08' };

document.getElementById('app').append(
  toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/rebalance/comic.webp', alt: '四格漫畫：一、先定好比例：原型 50%｜正二 30%｜現金 20%，每半年看一次。老師說：這叫 532。中間漲跌都不用管。二、半年到了，先算總額：原型 391,000、正二 236,700、現金 172,300，合計 800,000，＋ 這次新投入 50,000，＝ 850,000。小安問：新存的錢也一起算進去？三、照比例算目標：850,000 × 50%＝425,000；850,000 × 30%＝255,000；850,000 × 20%＝170,000。老師說：每一份要變成多少，先算金額。四、換成股數：原型：(425,000 − 391,000) ÷ 195.5 ＝ 173.9 → 買 173 股；正二：(255,000 − 236,700) ÷ 26.3 ＝ 695.8 → 買 695 股；剩下現金 170,200。小安說：小數點直接捨掉，錢一定夠！買進股數無條件捨去；沒算手續費和稅。' }),
    h('p', {}, '定期配比只看時間：選好比例和週期，到期那天用當時的總額照比例配回，中間漲跌都不動。這和 ② 的 50/50 觸發不同，那個看的是正二漲跌一半。'),
    h('p', {}, '網路上的 532、442 有兩種：股版是原型／正二／現金，債版是正二／美債／現金。名字一樣、風險不同，別人說 442 時先問是哪一種。'),
    h('p', {}, '算出來的是取整後的股數：買進無條件捨去、賣出四捨五入，所以現金一定夠，配完會跟目標差一點點。')),
  disclaimer('general'));
