import { h, toolHeader, numberField, selectField, exampleButton, readNumbers, metric, showResult, showError, disclaimer, figure } from '../ui/components.js';
import { exposureNow, betaPlan } from '../core/exposure.js';
import { fmtMoney, fmtX } from '../core/format.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'exposure');
const REQUIRED = ['ordinary', 'lever', 'cash', 'debt', 'ordinaryBeta', 'leverBeta'];
const FIELDS = [...REQUIRED, 'target', 'minCash'];
const result = h('div', { class: 'result', 'aria-live': 'polite' });

function update() {
  const v = readNumbers(FIELDS);
  const missing = REQUIRED.filter(id => Number.isNaN(v[id])).length;
  if (missing) { showResult(result, h('p', { class: 'muted' }, `填完 ${missing} 格就會算。`)); return; }
  const { ordinary, ordinaryBeta, lever, leverBeta, cash, debt, target } = v;
  const basis = document.getElementById('basis').value;
  const allowBorrow = document.getElementById('allowBorrow').value;
  try {
    const now = exposureNow({ positions: [{ value: ordinary, beta: ordinaryBeta }, { value: lever, beta: leverBeta }], cash, debt });
    const nodes = [h('div', { class: 'metrics' },
      metric('淨資產', fmtMoney(now.net)),
      metric('等於幾倍大盤（淨資產）', fmtX(now.netBasis)),
      metric('總資產口徑', fmtX(now.assetBasis)),
      metric('槓桿比（總資產÷淨資產）', fmtX(now.leverageRatio)))];
    if (now.net <= 0) nodes.push(h('p', { class: 'note' }, '⚠ 借款已經大於或等於總資產，淨資產口徑算不出來。'));
    if (!Number.isNaN(target) && now.net > 0) {
      const r = betaPlan({ ordinary, ordinaryBeta, lever, leverBeta, cash, debt, target,
        minCash: Number.isNaN(v.minCash) ? 0 : v.minCash, basis, allowBorrow: allowBorrow === 'yes' });
      nodes.push(h('h3', {}, `調到 ${target} 倍`));
      if (!r.possible) {
        nodes.push(h('p', { class: 'note' }, '⚠ ' + r.reason));
        if (r.shortage) nodes.push(h('p', {}, `還差 ${fmtMoney(r.shortage)}。`));
      } else {
        nodes.push(h('div', { class: 'metrics' },
          metric('正二要調到', fmtMoney(r.targetLever)),
          Math.abs(r.delta) < 0.5 ? metric('正二', '不用動') : metric(r.delta > 0 ? '要買進正二' : '要賣出正二', fmtMoney(Math.abs(r.delta))),
          metric('要新增借款', fmtMoney(r.borrow), r.borrow > 0 ? 'warn' : undefined)),
        h('p', {}, `交易後：現金 ${fmtMoney(r.cashAfter)}、借款 ${fmtMoney(r.debtAfter)}，等於 ${fmtX(r.achieved)}大盤。`));
        if (r.borrow > 0) nodes.push(h('p', { class: 'note' }, '要借錢才能達標：先用 ', h('a', { href: 'pledge.html' }, '④ 質押壓力測試'), ' 看跌下來會不會被追繳。'));
      }
    }
    nodes.push(h('p', { class: 'note' }, '沒算手續費、稅和利息；算出來是金額，不是股數。'));
    showResult(result, nodes);
  } catch (e) { showError(result, e.message); }
}

const app = document.getElementById('app');
app.append(
  toolHeader(tool),
  h('section', { class: 'card' },
    h('h3', {}, '現在的部位'),
    numberField({ id: 'ordinary', label: '股票市值（不含正二）', plain: '原型 ETF、個股等一般股票合計', termId: 'exposure', suffix: '元' }),
    numberField({ id: 'lever', label: '正二市值', plain: '00631L 這類兩倍 ETF 合計，沒有就填 0', termId: 'daily-2x', suffix: '元' }),
    numberField({ id: 'cash', label: '現金', plain: '帳上隨時能用的錢', suffix: '元' }),
    numberField({ id: 'debt', label: '借款', plain: '質押、融資、信貸，所有借來的錢，沒有就填 0', termId: 'net-assets', suffix: '元' }),
    h('h3', {}, '想調到幾倍（選填）'),
    numberField({ id: 'target', label: '目標倍數', plain: '想要等於幾倍大盤，例如 1.4', suffix: '倍' }),
    selectField({ id: 'basis', label: '倍數怎麼算', plain: '有借錢時兩種差很多', termId: 'basis', options: [{ value: 'net', label: '淨資產口徑（扣掉借款）' }, { value: 'asset', label: '總資產口徑（不扣借款）' }], value: 'net' }),
    selectField({ id: 'allowBorrow', label: '現金不夠時', plain: '要不要再借錢買', options: [{ value: 'no', label: '不借新的錢' }, { value: 'yes', label: '可以再借' }], value: 'no' }),
    numberField({ id: 'minCash', label: '至少留現金', plain: '買完至少要留多少現金，沒有就留白', suffix: '元' }),
    h('details', { class: 'advanced' }, h('summary', {}, '進階設定（選填）'),
      numberField({ id: 'ordinaryBeta', label: '股票的 Beta', plain: '跟大盤的連動，0050 約 1', termId: 'beta', value: '1' }),
      numberField({ id: 'leverBeta', label: '正二的 Beta', plain: '約 2，期間越長偏離越多', value: '2' })),
    exampleButton({ ordinary: 10000000, lever: 0, cash: 2000000, debt: 3000000, target: 1.4, basis: 'net', allowBorrow: 'no', minCash: '', ordinaryBeta: 1, leverBeta: 2 }, update)),
  h('section', { class: 'card' }, h('h2', {}, '結果'), result),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/exposure/buy-to-1.4.svg', alt: '股票 1,000 萬、現金 200 萬、借款 300 萬，淨資產 900 萬，曝險 1,000 萬，約 1.11 倍。拿 130 萬現金買正二後，正二 130 萬乘 2 等於 260 萬曝險，曝險變 1,260 萬，淨資產仍是 900 萬，等於 1.4 倍。', caption: '總資產沒變，倍數變高：多出來的曝險來自正二的 2 倍。' }),
    h('p', {}, '曝險倍數回答的是：大盤漲跌 1%，我的淨資產大約漲跌幾 %。1 倍就是跟大盤一樣；1.4 倍代表大盤跌 10% 時，你大約跌 14%。'),
    h('p', {}, '分母有兩種：淨資產（扣掉借款）和總資產（不扣）。有借錢時兩者差很多，聽別人說幾倍之前，先問是哪一種。'),
    h('p', {}, '正二的 2 倍是『每天』2 倍，拉長時間會偏離，所以這裡的 Beta 只是估計。原本那格正二平衡計算器用的是同一套公式。')),
  disclaimer('executable'));
app.addEventListener('input', update);
app.addEventListener('change', update);
update();
