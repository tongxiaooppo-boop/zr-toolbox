// 工具⑪ 正二要買多少（v5.5 精靈）。算法照朋友計算機線上版，公式只在 core/balance.js。
import { h, toolHeader, selectField, disclaimer, figure } from '../ui/components.js';
import { wizard, betaHoldingsInput, readBetaHoldings, tokenBox, numberInput, explain, withHelp } from '../ui/wizard.js';
import { balancePlan, checkBalanceRows } from '../core/balance.js';
import { parseNum, fmtMoney, fmtPct, fmtX } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'exposure');
const num = id => parseNum(document.getElementById(id)?.value);
const named = c => STOCK_NAMES[c] ? `${c} ${STOCK_NAMES[c]}` : c;
const BASIS = { net: '淨資產', asset: '總資產' };
const blank = r => r.code === '' && Number.isNaN(r.shares) && Number.isNaN(r.price) && Number.isNaN(r.beta);
const shareText = n => (Number.isFinite(n) ? `約 ${Math.round(n).toLocaleString('en-US')} 股` : '');
const link = (href, text) => h('a', { href }, text);

const steps = [
  {
    title: '其他持股（不含正二）',
    hint: '打開券商 App 的「庫存」，一檔填一列。0050、個股都填這裡，正二下一步再填。',
    about: '這一步算出你手上的股票「跟著大盤漲跌多少錢」（曝險）。沒有其他持股就把列刪掉，直接下一步。',
    body: s => [betaHoldingsInput({ id: 'stocks', kind: 'stock', rows: s.stocks ?? [{}] }), tokenBox()],
    read: s => { const rows = readBetaHoldings('stocks').filter(r => !blank(r)); checkBalanceRows(rows, 'stock'); s.stocks = rows; }
  },
  {
    title: '你的正二',
    hint: '00631L、00685L 這類兩倍 ETF 填這裡。還沒買就股數填 0，代號一樣要填（才抓得到現價、算得出股數）。',
    about: '正二每 1 元市值，大約算 2 元曝險。這一步記下你現在有多少正二。',
    body: s => [betaHoldingsInput({ id: 'levers', kind: 'lever', rows: s.levers ?? [{}] })],
    read: s => {
      const rows = readBetaHoldings('levers').filter(r => !blank(r));
      checkBalanceRows(rows, 'lever');
      rows.forEach((r, i) => { if (!(r.price > 0)) throw new Error(`正二第 ${i + 1} 檔的現價要大於 0（還沒買也要填，才能算要買幾股）。`); });
      s.levers = rows;
    }
  },
  {
    title: '現金與借款',
    hint: '現金看銀行和證券戶的餘額；借款看質押、融資、信貸的「借款餘額」，全部加起來。',
    about: '有借錢時，倍數有兩種算法：扣掉借款（淨資產）和不扣（總資產），差很多。',
    figure: { src: '../img/exposure/step3.webp', alt: '插圖：有借錢時，倍數有兩種算法。股票 1,000 萬、現金 200 萬、借款 300 萬。總資產口徑（不扣借款）：總資產 1,000＋200＝1,200 萬，1,000 萬 ÷ 1,200 萬約 0.83 倍，看起來比大盤還保守。淨資產口徑（扣掉借款）：淨資產 1,200−300＝900 萬，1,000 萬 ÷ 900 萬約 1.11 倍，這才是你自己的錢漲跌幾倍。老師說：借來的錢要還，跌的是你自己的錢，有借錢看淨資產口徑。沒有借錢時，兩種算法一樣。' },
    body: s => [
      numberInput({ id: 'cash', label: '現金', plain: '隨時能拿來買正二的錢，例：2000000', value: s.cash, suffix: '元', help: { text: ['銀行和證券戶裡隨時能動用的錢，全部加起來。', '定存、要繳的保費這類不能動的錢不要算進來，或填在下面「至少要留」。'] } }),
      numberInput({ id: 'debt', label: '借款', termId: 'net-assets', plain: '質押、融資、信貸，所有借來的錢加起來；沒有填 0', value: s.debt, suffix: '元', help: { text: ['看各個借款帳戶的「借款餘額」，全部加起來。', '房貸要不要算看你自己：如果借來的錢有拿去買股票，就要算。'] } }),
      numberInput({ id: 'mincash', label: '買完至少要留多少現金（選填）', plain: '生活預備金、近期要繳的錢；留白當 0', value: s.minCash, suffix: '元', help: { text: ['買正二之後，帳上至少要剩這麼多現金。', '留白就當 0，代表現金可以全部拿去買。'] } })],
    read: s => {
      s.cash = num('cash'); s.debt = num('debt'); s.minCash = num('mincash');
      if (!(s.cash >= 0)) throw new Error('現金要填 0 以上的數字；沒有就填 0。');
      if (!(s.debt >= 0)) throw new Error('借款要填 0 以上的數字；沒有借錢就填 0。');
      if (!Number.isNaN(s.minCash) && !(s.minCash >= 0)) throw new Error('至少要留的現金要填 0 以上的數字；不用就留白。');
    }
  },
  {
    title: '想要整體等於幾倍大盤',
    hint: '不確定要幾倍，先看下面「你現在」是幾倍，再想大盤跌 10% 時你受得了跌幾 %。',
    about: '目標倍數＝大盤漲跌 1%，你的錢大約漲跌幾 %。1.4 倍代表大盤跌 10%，你約跌 14%。',
    figure: { src: '../img/exposure/step4.webp', alt: '插圖：目標倍數＝大盤跌 10%，你跌幾 %。大盤 −10% 時：1 倍你約跌 10%；1.4 倍你約跌 14%；2 倍你約跌 20%。大盤 +10% 時 1.4 倍約漲 14%。老師說：先想清楚跌的時候受不受得了，再決定倍數。粗估；正二的 2 倍是每天 2 倍，放久了會偏離。' },
    body: s => {
      let now = null;
      try { now = balancePlan({ stocks: s.stocks, levers: s.levers, cash: s.cash, debt: s.debt, target: 0, basis: 'asset' }).before; } catch { /* 總資產 ≤ 0 就不顯示 */ }
      return [now ? h('p', { class: 'tip' }, s.debt > 0
        ? now.N <= 0 ? `你現在：借款已經大於或等於總資產，淨資產口徑算不出來；總資產口徑 ${fmtX(now.bA)}。` : `你現在：淨資產口徑 ${fmtX(now.bN)}、總資產口徑 ${fmtX(now.bA)}。`
        : `你現在約等於 ${fmtX(now.bA)}大盤（沒有借錢，兩種算法一樣）。`) : null,
      numberInput({ id: 'target', label: '目標倍數', termId: 'exposure', plain: '想要整體等於幾倍大盤，例：1.4', value: s.target, suffix: '倍', help: { text: ['1 倍＝跟大盤一樣；1.4 倍＝大盤跌 10% 你約跌 14%。', '倍數越高，漲跌都放大；先想跌的時候受不受得了。'] } }),
      withHelp(selectField({ id: 'basis', label: '倍數怎麼算', termId: 'basis', plain: s.debt > 0 ? '你有借錢，建議用淨資產口徑' : '你沒有借錢，兩種算法結果一樣', options: [{ value: 'net', label: '淨資產口徑（扣掉借款）' }, { value: 'asset', label: '總資產口徑（不扣借款）' }], value: s.basis || 'net' }), { text: ['淨資產口徑：分母是扣掉借款後你自己的錢，比較貼近「我的錢漲跌幾 %」。', '總資產口徑：分母不扣借款。有借錢時看起來倍數比較低，但跌的時候虧的是你自己的錢。', '結果頁兩種都會算給你看。'] }),
      withHelp(selectField({ id: 'borrow', label: '現金不夠時', plain: '要不要算出還要借多少', options: [{ value: 'no', label: '不借新的錢（算出還差多少）' }, { value: 'yes', label: '可以再借（算出要借多少）' }], value: s.allowBorrow || 'no' }), { text: ['選「可以再借」只是算出金額，不代表借得到，也不代表安全。', '要借之前，先用 ④ 質押壓力測試看大盤跌多少會被追繳。'] })];
    },
    read: s => {
      s.target = num('target'); s.basis = document.getElementById('basis').value; s.allowBorrow = document.getElementById('borrow').value;
      if (!(s.target >= 0)) throw new Error('目標倍數要填 0 以上的數字，例：1.4。');
    }
  },
  {
    title: '進階：完整重配（選填）',
    hint: '大部分人不用動這一步，直接按「看結果」。',
    about: '預設只調正二、其他持股不動。打開完整重配，會連其他持股一起照比重重新分配，沒填比重的會建議全賣。',
    body: s => [
      withHelp(selectField({ id: 'full', label: '要不要連其他持股一起重配', options: [{ value: 'off', label: '不要，只調正二（預設）' }, { value: 'on', label: '要，全部照比重重新分配' }], value: s.full || 'off' }), { text: ['只調正二：其他持股一股都不動，只算正二要買賣多少。', '完整重配：全部股票（含正二）照下面的比重重新分配；沒填比重的那檔會建議全部賣掉。'] }),
      h('h3', {}, '各檔目標比重（選填）'), h('p', { class: 'tip' }, '比重填相對大小就好，例：60 和 40，不用加起來剛好 100。'),
      ...s.stocks.map((r, i) => numberInput({ id: `ws${i}`, label: `${named(r.code || `持股 ${i + 1}`)} 的比重`, plain: '只有打開完整重配才會用到', value: s.wStocks?.[i], suffix: '%' })),
      ...s.levers.map((r, i) => numberInput({ id: `wl${i}`, label: `${named(r.code || `正二 ${i + 1}`)} 的比重`, plain: s.levers.length > 1 ? '好幾檔正二時，買賣金額照這個比例分；都不填就照現在市值比例分' : '只有一檔正二不用填', value: s.wLevers?.[i], suffix: '%' }))],
    read: s => {
      s.full = document.getElementById('full').value;
      s.wStocks = s.stocks.map((_, i) => num(`ws${i}`)); s.wLevers = s.levers.map((_, i) => num(`wl${i}`));
      const weights = [...s.wStocks, ...s.wLevers];
      if (weights.some(w => !Number.isNaN(w) && w < 0)) throw new Error('比重要填 0 以上的數字；不用就留白。');
      if (s.full === 'on' && !weights.some(w => w > 0)) throw new Error('完整重配要替至少一檔填目標比重；只想調正二就選「不要」。');
    }
  }
];

function result(s) {
  const input = basis => ({
    stocks: s.stocks.map((r, i) => ({ ...r, weight: s.wStocks?.[i] })), levers: s.levers.map((r, i) => ({ ...r, weight: s.wLevers?.[i] })),
    cash: s.cash, debt: s.debt, minCash: Number.isFinite(s.minCash) ? s.minCash : 0, target: s.target,
    basis, allowBorrow: s.allowBorrow === 'yes', fullRebalance: s.full === 'on' });
  const r = balancePlan(input(s.basis));
  const other = s.basis === 'net' ? 'asset' : 'net';
  let o = null; try { o = balancePlan(input(other)); } catch { /* 淨資產 ≤ 0 */ }
  const bn = BASIS[s.basis], T = s.target, minCash = Number.isFinite(s.minCash) ? s.minCash : 0;
  const formula = p => p.fullMode
    ? `目標 ${T} 倍 × ${BASIS[p === r ? s.basis : other]} ${fmtMoney(p.base)} ÷ 各檔加權 Beta ${p.bw.toFixed(2)}`
    : `（目標 ${T} 倍 × ${BASIS[p === r ? s.basis : other]} ${fmtMoney(p.base)} − 其他持股曝險 ${fmtMoney(p.D)}）÷ 正二 Beta ${p.bw.toFixed(2)}`;
  const b = r.before, a = r.after;
  const table = (heads, rows) => h('table', { class: 'trade-table' }, h('thead', {}, h('tr', {}, heads.map(t => h('th', { scope: 'col' }, t)))), h('tbody', {}, rows.map(cells => h('tr', {}, cells.map(c => h('td', {}, c))))));
  return [
    explain({ label: `${r.label}要調到`, value: fmtMoney(r.X), tone: 'info',
      how: s.basis === 'asset' && r.borrow > 0 && r.bw > T
        ? `借錢會讓總資產一起變大，所以改用（目標 ${T} 倍 ×（其他持股 ${fmtMoney(r.S)}＋至少留 ${fmtMoney(minCash)}）− 其他持股曝險 ${fmtMoney(r.D)}）÷（正二 Beta ${r.bw.toFixed(2)} − 目標 ${T}）。`
        : formula(r) + (r.capped ? '，算出來是負的，所以設成 0' : '') + '。',
      means: r.fullMode ? '全部股票（含正二）合計應該有這麼多市值，每一檔分多少看下面明細。' : r.capped ? '其他持股的曝險已經超過目標，正二最少只能是 0。' : `你的正二（${s.levers.length} 檔合計）應該有這麼多市值。` }),
    explain({ label: Math.abs(r.delta) < 0.5 ? r.label : r.delta > 0 ? '要買進' : '要賣出', value: Math.abs(r.delta) < 0.5 ? '不用動' : fmtMoney(Math.abs(r.delta)),
      how: `要調到 ${fmtMoney(r.X)} − 現在 ${fmtMoney(r.L)}。`,
      means: r.rows.map(x => `${named(x.code)} ${x.trade >= 0 ? '買' : '賣'} ${fmtMoney(Math.abs(x.trade))}${shareText(x.shares) ? `（${shareText(x.shares)}）` : ''}`).join('；') + '。',
      todo: ['股數是金額 ÷ 現價的約略值，沒扣手續費、沒分整張零股；下單前用 ', link('cost.html', '⑨ 買賣成本與損益'), ' 再算一次。'] }),
    explain({ label: '錢夠不夠', value: !r.enough ? '不夠' : r.borrow > 0 ? `要借 ${fmtMoney(r.borrow)}` : '夠', tone: !r.enough ? 'bad' : r.borrow > 0 ? 'warn' : 'ok',
      how: `可以用的現金＝現金 ${fmtMoney(s.cash)} − 至少留 ${fmtMoney(minCash)}＝${fmtMoney(r.available)}；這次要${r.delta >= 0 ? '買' : '賣'} ${fmtMoney(Math.abs(r.delta))}。`,
      means: !r.enough ? `還差 ${fmtMoney(r.shortage)}，最多只能先買 ${fmtMoney(r.canBuy)}。可以降低目標倍數、補錢，或在步驟 4 選「可以再借」。` : r.borrow > 0 ? `現金不夠，要新增借款 ${fmtMoney(r.borrow)}，借款變成 ${fmtMoney(r.debtAfter)}。這只是算出金額，不代表借得到，也不代表安全。` : r.delta < 0 ? `是賣出，賣掉的錢會回到現金，現金變成 ${fmtMoney(r.cashAfter)}。` : `買完現金剩 ${fmtMoney(r.cashAfter)}。`,
      todo: r.borrow > 0 ? ['借之前先用 ', link('pledge.html', '④ 質押壓力測試'), ' 看大盤跌多少會被追繳。'] : null }),
    explain({ label: '有沒有達到目標', value: r.reached ? `達到 ${T} 倍` : !r.enough ? '錢不夠，還沒達到' : `只到 ${fmtX(r.achieved)}`, tone: r.reached ? 'ok' : 'warn',
      how: `調整後曝險 ${fmtMoney(r.after.exposure)} ÷ 調整後${bn} ${fmtMoney(s.basis === 'net' ? r.after.N : r.after.A)}＝${fmtX(r.achieved)}。`,
      means: r.reached ? `大盤跌 10%，你的${bn}大約跌 ${(T * 10).toFixed(1)}%；漲的時候也一樣放大。` : !r.enough ? `下面「調整後」的數字是假設錢夠、買足的情況；實際只能先買 ${fmtMoney(r.canBuy)}。` : r.capped ? `其他持股本身就超過 ${T} 倍，正二賣光也降不下來。要降就要賣一些其他持股（步驟 5 可以打開完整重配）。` : r.borrowCantReach ? `總資產口徑下，目標 ${T} 倍不低於正二的 ${r.bw.toFixed(2)} 倍：借錢買正二，總資產也跟著變大，倍數追不上目標。改用淨資產口徑，或把目標調低。` : '沒有剛好達到目標，看下面的調整前後比較。',
      todo: ['正二的 2 倍是「每天」2 倍，放久了會偏離，這裡的倍數只是估計；看 ', link('decay.html', '⑥ 正二不是兩倍？'), '。'] }),
    explain({ label: `用${BASIS[other]}口徑算`, value: o ? fmtMoney(o.X) : '算不出來', how: o ? formula(o) + '。' : '借款大於或等於總資產，淨資產口徑算不出來。',
      means: s.debt > 0 && o ? `有借錢時兩種差很多：${bn}口徑要調到 ${fmtMoney(r.X)}，${BASIS[other]}口徑要調到 ${fmtMoney(o.X)}${o.enough ? '' : '（現金不夠）'}。聽別人說幾倍之前，先問是哪一種。` : s.debt === 0 ? '你沒有借錢，兩種算法一樣。' : null }),
    h('h3', {}, '調整前後比較'),
    table(['', '調整前', '調整後'], [
      ...[['總資產', 'A', fmtMoney], ['淨資產', 'N', fmtMoney], ['借款', 'debt', fmtMoney], ['負債比', 'debtRatio', fmtPct], ['資產槓桿比', 'lev', fmtX], ['股票市值', 'stocks', fmtMoney], ['股票市值 ÷ 淨資產', 'expNet', fmtPct], ['總資產口徑倍數', 'bA', fmtX], ['淨資產口徑倍數', 'bN', fmtX]].map(([label, key, fmt]) => [label, fmt(b[key]), fmt(a[key])]),
      [`${r.label}市值`, fmtMoney(r.L), fmtMoney(r.X)], ['現金', fmtMoney(b.cash), fmtMoney(a.cash)]]),
    h('h3', {}, '每一檔明細'),
    table(['代號', '現在市值', '調整後', '買賣'], r.rows.map(x => [named(x.code), fmtMoney(x.value), fmtMoney(x.target), [`${x.trade >= 0 ? '買' : '賣'} ${fmtMoney(Math.abs(x.trade))}`, Number.isFinite(x.shares) ? [h('br'), h('small', {}, shareText(x.shares))] : null]])),
    h('div', { class: 'note' },
      h('p', {}, '算法照朋友那格計算機（使用者以手機版 Claude 依計算模板製作，後續小改），同一組輸入算出同樣的數字。'),
      h('p', {}, '沒算手續費、稅和借款利息；股數是約略值。'),
      r.fullMode ? h('p', {}, '完整重配：全部持股（含正二）照比重重新分配，沒填比重的會建議全賣。') : null,
      r.bwDefaulted ? h('p', {}, '各檔 Beta 合起來不是正數，改用 2 計算（跟原頁一樣）。') : null)
  ];
}

const example = { stocks: [{ code: '0050', shares: 100000, price: 100, beta: 1 }], levers: [{ code: '00685L', shares: 0, price: 20, beta: 2 }],
  cash: 2000000, debt: 3000000, minCash: NaN, target: 1.4, basis: 'net', allowBorrow: 'no', full: 'off', wStocks: [NaN], wLevers: [NaN] };

document.getElementById('app').append(
  toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/exposure/comic.webp', alt: '四格漫畫：一、小安有股票 1,000 萬、現金 200 萬、借款 300 萬，淨資產 1,000＋200−300＝900 萬，1,000 萬 ÷ 900 萬約 1.11 倍。二、想要 1.4 倍：1.4 × 900 萬＝1,260 萬，減 1,000 萬還差 260 萬曝險；曝險就是跟著大盤漲跌的金額。三、正二 1 元算 2 元曝險：260 萬 ÷ 2＝買 130 萬正二，現金 200 萬剩 70 萬，不用借錢。四、1.4 倍代表大盤跌 10%，淨資產約跌 14%；正二是每天 2 倍，放久了會偏離，這只是估計，錢夠不等於安全。沒算手續費、稅和利息；正二每股 20 元時約 65,000 股。' }),
    h('p', {}, '曝險倍數回答的是：大盤漲跌 1%，你的錢大約漲跌幾 %。正二每 1 元市值大約算 2 元曝險，所以用正二調倍數，比全部買 0050 省現金。'),
    h('p', {}, '「錢夠」跟「達到目標」是兩件事：其他持股本身就超過目標時，錢夠也降不下來；用總資產口徑借錢買正二，有時借了也追不上目標。結果頁會分開寫。'),
    h('p', {}, '正二的 2 倍是「每天」2 倍，拉長時間會偏離（波動耗損），這裡的倍數只是估計。'),
    h('h3', {}, '網路上其他槓桿做法，在工具箱哪裡算'),
    h('table', { class: 'trade-table' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, '做法'), h('th', { scope: 'col' }, '在哪裡算'))),
      h('tbody', {}, [
        ['大仁 50/50：正二、現金各半，漲跌一半就配回', link('trigger5050.html', '② 50/50 觸發提醒')],
        ['532／442／433 百分比配置（HAMR 指數爆擊流）', link('rebalance.html', '③ 定期配比再平衡')],
        ['質押借錢買正二', link('pledge.html', '④ 質押壓力測試')],
        ['人生槓桿（HAMR）', link('lifelev.html', '⑬ 人生槓桿體檢')],
        ['凱利公式：幾倍槓桿最划算', link('kelly.html', '⑭ 幾倍槓桿最划算')],
        ['計算Pro 的 Beta 看板', '不連結：它的補現金公式算錯（研究時的例子：建議補 144 萬，補完只到 0.98 倍；要到目標其實要 360 萬）']
      ].map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, b))))),
    h('p', {}, '同類工具只找到 HAMR 指數爆擊流的曝險計算機，但它是輸入三類百分比，不是從目標倍數反推正二要買多少。')),
  disclaimer('executable'));
