// 精靈元件（v5 新增；Opus 定，外包不得改簽名）。每個計算機都是「一步一畫面」：
//   輸入步驟 1…N → 結果（逐項解說）。結果頁可以跳回任一步改參數重算。
// 版面（v5.1，使用者 2026-11-09）：桌面（≥900px）左邊計算機、右邊說明欄；手機說明放在下方（步驟內、格子下）。結果步驟不分欄。
// 介面：
//   wizard({ steps, result, example })      回傳 <div class="wizard-layout">（左 section.card.wizard、右 aside.wizard-help）
//     steps：[{ title, hint, about, figure, body(state) → Node[], read(state) }]
//       hint：一句「去哪裡找這些數字」；about：一句「這一步在做什麼」；figure：{ src, alt, caption } 步驟圖（sol 畫）
//       about＋figure：桌面放右欄上方，手機放步驟內 hint 下面
//       body：用 state 現有的值畫欄位（回上一步時值要還在）
//       read：把畫面上的值寫回 state；不合格就 throw new Error('給使用者看的一句話')
//     result(state) → Node[]：結果步驟的內容（通常是 explain() 一串）；throw 會顯示成錯誤
//     example：完整的 state（範例數字）。第 1 步顯示「帶入範例」，按下直接跳到結果
//   withHelp(fieldEl, help)                 幫任何 .field 加「說明」：help＝{ text: string|string[], img?: { src, alt } }
//     桌面：點進格子或按「說明」→ 說明出現在右欄；手機：按「說明」→ 在格子下方展開／收起
//   numberInput({ id, label, plain, termId, value, suffix, help })   numberField 的精靈版：value 可以是數字（NaN 會留白）
//   holdingsInput({ id, rows, max, label, side })  持股輸入：代號＋買入股數＋買入價＋現價（輸入代號自動抓 FinMind 收盤價），每格內建說明
//     rows：[{ code, shares, buyPrice, nowPrice }]（數字可為 NaN／空），max 預設 5
//     side：'long'（預設）｜'short'（⑤ 融券：欄名改「融券股數」「融券賣出價」，資料仍放 shares、buyPrice）
//           ｜'lot'（v5.4，⑮ 單筆成交：欄名改「股數」「這一筆的成交價」，資料仍放 shares、buyPrice）
//   readHoldings(id) → [{ code, shares, buyPrice, nowPrice }]   只讀畫面，檢查交給 core 的 holdingSummary
//   lotsInput({ id, rows, max, label, first })  同一檔分次買進（v5.4，⑮）：每筆「股數＋買入價」，可「＋再加一筆」、刪掉
//     rows：[{ shares, price }]；max 預設 10；first：第 1 筆的編號（預設 1，⑮ 第 1 筆在持股格裡時傳 2）
//   readLots(id) → [{ shares, price }]       只讀畫面，檢查交給 core
//   betaHoldingsInput({ id, rows, max, label, kind })  ⑪ 持股（v5.5）：每列「代號／名稱＋股數＋現價＋Beta」，沒有買入價
//     kind：'mix'（③ 混合持股：max 預設 10，至少留 1 列；Beta 留白看代號猜）
//     kind：'stock'（其他持股：max 預設 10，可以全部刪光，刪光時顯示「沒有其他持股」一行）｜'lever'（正二：max 預設 3，至少留 1 列）
//     rows：[{ code, shares, price, beta }]（數字可為 NaN／空；beta 空白＝core 預設 stock 1、lever 2）
//     代號是台股代號（normalizeCode 通過）→ 跟 holdingsInput 一樣自動抓收盤價並顯示名稱；不是 → 不抓價，提示「現價自己填」
//   readBetaHoldings(id) → [{ code, shares, price, beta }]   只讀畫面，檢查交給 core 的 checkBalanceRows
//     kind：'life'（v5.10，⑬ 全部持股：max 預設 10，可以全部刪光〔同 'stock' 的空白提示〕；股數副標「1 張＝1000 股」；
//           Beta 留白看代號猜，說明文字同 'mix'）
//   debtsInput({ id, rows, max, label })     ⑬ 借款清單（v5.10）：每筆「種類＋餘額＋每月繳款＋年利率＋剩幾年＋拿去投資多少」
//     rows：[{ kind, balance, monthly, ratePct, years, invest }]（數字可為 NaN／空）；max 預設 8；可以全部刪光
//       （刪光時顯示「沒有借款：直接按「下一步」。」）；「＋ 再加一筆借款」新增一列，種類預設 'mortgage'
//     種類用 core/lifelev.js 的 DEBT_KINDS（value／label）；「拿去投資」的 placeholder 依種類：investAll ? '留白＝全部' : '留白＝0'
//   readDebts(id) → [{ kind, balance, monthly, ratePct, years, invest }]   只讀畫面（ratePct 是百分比數字，頁面自己 ÷100），檢查交給 core
//   tokenBox()                               FinMind token（選填）：存在這台裝置、清除、連到申請教學
//   explain({ label, value, tone, how, means, todo })   結果的一項：大數字＋▸怎麼來的／▸代表什麼／▸要做什麼
import { h, infoChip, metric, figure } from './components.js';
import { parseNum } from '../core/format.js';
import { normalizeCode } from '../core/holdings.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { fetchClose, getToken, setToken } from '../net/price.js';

const show = v => (typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : (v ?? ''));
const WIDE = '(min-width: 900px)';
const desktop = () => typeof matchMedia === 'function' && matchMedia(WIDE).matches;

// ---------- 格子說明 ----------
const HELP = new WeakMap();
function helpCard(help, title) {
  return h('div', { class: 'help-card' },
    title ? h('strong', {}, title) : null,
    help.img ? h('img', { src: help.img.src, alt: help.img.alt, loading: 'lazy' }) : null,
    [help.text].flat().map(t => h('p', {}, t)));
}
function openHelp(field, fromButton) {
  const help = HELP.get(field); if (!help) return;
  const pane = field.closest('.wizard-layout')?.querySelector('.help-field');
  if (desktop() && pane) {
    const title = field.querySelector('label')?.firstChild?.textContent?.trim();
    pane.replaceChildren(helpCard(help, title));
    return;
  }
  if (!fromButton) return; // 手機：點進格子不自動展開，免得畫面一直跳
  const btn = field.querySelector('.help-btn');
  const open = field.querySelector(':scope > .help-card');
  if (open) { open.remove(); btn?.setAttribute('aria-expanded', 'false'); }
  else { field.append(helpCard(help)); btn?.setAttribute('aria-expanded', 'true'); }
}
export function withHelp(field, help) {
  if (!help) return field;
  HELP.set(field, help);
  const btn = h('button', { type: 'button', class: 'help-btn', 'aria-expanded': 'false' }, '說明');
  btn.addEventListener('click', () => openHelp(field, true));
  (field.querySelector('label') || field).append(btn);
  field.addEventListener('focusin', e => { if (e.target !== btn) openHelp(field, false); });
  return field;
}

export function numberInput({ id, label, plain = '', termId, value = '', suffix = '', help }) {
  return withHelp(h('div', { class: 'field' },
    h('label', { for: id }, label, termId ? infoChip(termId) : null),
    plain ? h('small', { class: 'plain-sub' }, plain) : null,
    h('div', { class: 'input-row' },
      h('input', { id, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: show(value) }),
      suffix ? h('span', { class: 'suffix' }, suffix) : null)), help);
}

export function explain({ label, value, tone, how, means, todo }) {
  return h('div', { class: 'explain' },
    metric(label, value, tone),
    how ? h('p', {}, h('b', {}, '▸ 怎麼來的：'), how) : null,
    means ? h('p', {}, h('b', {}, '▸ 代表什麼：'), means) : null,
    todo ? h('p', {}, h('b', {}, '▸ 要做什麼：'), todo) : null);
}

// ---------- 精靈 ----------
export function wizard({ steps, result, example }) {
  const total = steps.length + 1;
  let state = {}, at = 0;
  const root = h('section', { class: 'card wizard' });
  const side = h('aside', { class: 'card wizard-help', 'aria-label': '說明' });
  const layout = h('div', { class: 'wizard-layout' }, root, side);

  function placeAbout() {
    const about = layout.querySelector('.step-about'); if (!about) return;
    if (desktop()) side.prepend(about); else root.querySelector('.step-about-slot')?.append(about);
  }
  if (typeof matchMedia === 'function') matchMedia(WIDE).addEventListener?.('change', placeAbout);

  function go(i) { at = i; render(); root.querySelector('.wizard-title')?.focus(); layout.scrollIntoView?.({ block: 'start' }); }
  function next() {
    const err = root.querySelector('.wizard-error');
    try { steps[at].read(state); } catch (e) { err.textContent = e.message; return; }
    go(at + 1);
  }
  function render() {
    const isResult = at === steps.length;
    const step = steps[at];
    const dots = h('ol', { class: 'wizard-dots', 'aria-hidden': 'true' },
      Array.from({ length: total }, (_, i) => h('li', { class: i < at ? 'done' : i === at ? 'now' : undefined })));
    const head = h('h2', { class: 'wizard-title', tabindex: '-1' }, `步驟 ${at + 1}/${total}：`, isResult ? '結果' : step.title);
    let body;
    if (isResult) {
      const box = h('div', { class: 'result', 'aria-live': 'polite' });
      try { box.append(...[result(state)].flat(Infinity).filter(Boolean)); }
      catch (e) { box.classList.add('error'); box.append(h('p', {}, e.message)); }
      body = [box,
        h('div', { class: 'wizard-jump' }, h('small', {}, '改參數重算：'),
          steps.map((s, i) => h('button', { type: 'button', class: 'secondary', onclick: () => go(i) }, `${i + 1}. ${s.title}`))),
        h('div', { class: 'wizard-nav' },
          h('button', { type: 'button', class: 'secondary', onclick: () => go(steps.length - 1) }, '← 上一步'),
          h('button', { type: 'button', class: 'secondary', onclick: () => { state = {}; go(0); } }, '全部清空重來'))];
    } else {
      body = [
        step.hint ? h('p', { class: 'tip' }, step.hint) : null,
        h('div', { class: 'step-about-slot' }),
        at === 0 && example ? h('div', { class: 'example-row' },
          h('button', { type: 'button', class: 'secondary', onclick: () => { state = structuredClone(example); go(steps.length); } }, '帶入範例'),
          h('small', {}, '直接看範例結果；範例數字不是建議值')) : null,
        ...[step.body(state)].flat(Infinity),
        h('p', { class: 'wizard-error', role: 'alert' }),
        h('div', { class: 'wizard-nav' },
          at > 0 ? h('button', { type: 'button', class: 'secondary', onclick: () => { try { step.read(state); } catch { /* 往回不擋 */ } go(at - 1); } }, '← 上一步') : h('span'),
          h('button', { type: 'button', class: 'primary', onclick: next }, at === steps.length - 1 ? '看結果 →' : '下一步 →'))];
    }
    root.replaceChildren(dots, head, ...body.filter(Boolean));
    layout.classList.toggle('wide', isResult);
    side.replaceChildren(h('div', { class: 'help-field' }, h('p', { class: 'muted' }, '點任一格，這裡會說明怎麼填。')));
    if (!isResult && (step.about || step.figure)) {
      root.querySelector('.step-about-slot').append(h('div', { class: 'step-about' },
        step.about ? h('p', {}, step.about) : null, step.figure ? figure(step.figure) : null));
      placeAbout();
    }
  }
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && at < steps.length) { e.preventDefault(); next(); } });
  render();
  return layout;
}

// ---------- 持股輸入 ----------
// 說明圖在 img/common/（所有精靈共用）；路徑以工具頁 tools/*.html 為準
const HOLDING_HELP = {
  code: { text: ['台股代號是 4–6 碼數字，ETF 有時後面帶英文字母，例：0050、00631L、2330。', '填好後會自動抓最近一個交易日的收盤價，並顯示名稱讓你確認沒打錯。'] },
  shares: { text: ['你手上這檔有幾「股」，不是幾張：1 張＝1000 股，3 張就填 3000。', '零股照實際股數填，例：3 張又 250 股填 3250。'] },
  buy: { img: { src: '../img/common/help-avg-cost.svg', alt: '分兩次買：1 張 100 元、1 張 80 元，共花 18 萬買 2000 股，平均每股 90 元，買入價填 90。' },
    text: ['平均每股花多少錢。分好幾次買的，填券商 App 庫存裡的「成本均價」（也叫平均成本）。', '例：100 元買 1 張、80 元買 1 張 → 填 90。'] },
  now: { text: ['最近一個交易日的收盤價，輸入代號後會自動帶入，也可以自己改。', '抓不到時（沒網路、查詢次數用完）就手動填券商 App 上的價格。'] }
};
// 欄名與說明：long＝一般持股／融資；short＝融券（借股票先賣）
const SIDE = {
  long: { shares: ['買入股數', '看券商 App 的「庫存」；1 張＝1000 股'], buy: ['買入價', '庫存裡的「成本均價」'], help: HOLDING_HELP },
  short: { shares: ['融券股數', '看券商 App 的「信用庫存」；1 張＝1000 股'], buy: ['融券賣出價', '信用庫存裡的「成交均價」'],
    help: { ...HOLDING_HELP,
      shares: { text: ['你融券賣出了幾「股」，不是幾張：1 張＝1000 股。', '看券商 App 的「信用庫存」或「融券庫存」。'] },
      buy: { text: ['融券是借股票先賣掉，這裡填當初賣出的價格。', '分好幾次賣的，填信用庫存裡的「成交均價」。'] } } },
  lot: { shares: ['股數', '這一次買了幾股；1 張＝1000 股'], buy: ['買入價', '這一筆的成交價'],
    help: { ...HOLDING_HELP,
      shares: { text: ['這一次買了幾「股」：1 張＝1000 股，零股照實際股數填。', '看券商 App 的「成交回報」或「對帳單」。'] },
      buy: { text: ['這一次的成交價（每股多少錢），不是庫存裡的成本均價。', '平均成本就是這個工具要幫你算的。'] } } }
};

function holdingRow(r = {}, onRemove, side = 'long') {
  const t = SIDE[side] || SIDE.long;
  const status = h('small', { class: 'holding-status', 'aria-live': 'polite' });
  const name = h('span', { class: 'holding-name' }, STOCK_NAMES[r.code] || '');
  const code = h('input', { class: 'h-code', type: 'text', autocomplete: 'off', autocapitalize: 'characters', placeholder: '例：0050', value: show(r.code), 'aria-label': '股票代號' });
  const shares = h('input', { class: 'h-shares', type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: '例：3000', value: show(r.shares), 'aria-label': t.shares[0] });
  const buy = h('input', { class: 'h-buy', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '例：165.2', value: show(r.buyPrice), 'aria-label': t.buy[0] });
  const now = h('input', { class: 'h-now', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '輸入代號後自動帶入', value: show(r.nowPrice), 'aria-label': '現價' });
  let seq = 0;
  code.addEventListener('change', async () => {
    const c = normalizeCode(code.value);
    name.textContent = STOCK_NAMES[c] || '';
    if (!c) { status.textContent = code.value.trim() ? '代號格式不對，例：0050、00631L。' : ''; return; }
    code.value = c;
    const my = ++seq;
    status.textContent = `查詢 ${c} 最近收盤價…`;
    const r = await fetchClose(c, { token: getToken() });
    if (my !== seq) return; // 使用者已經改了代號
    if (r.ok) {
      now.value = String(r.close);
      status.textContent = `現價 ${r.close}：FinMind ${r.date} 收盤價，可以手動改。`;
      if (r.clearToken) { setToken(''); status.textContent += '（存的 token 已失效，已清除）'; }
    } else status.textContent = r.message + (r.action === 'show-quota-guide' ? ' 申請方式見下方 token 說明。' : '');
  });
  return h('div', { class: 'holding' },
    withHelp(h('div', { class: 'field' }, h('label', {}, '股票代號 ', name), code, status), t.help.code),
    h('div', { class: 'holding-grid' },
      withHelp(h('div', { class: 'field' }, h('label', {}, t.shares[0]), h('small', { class: 'plain-sub' }, t.shares[1]), shares), t.help.shares),
      withHelp(h('div', { class: 'field' }, h('label', {}, `${t.buy[0]}（元）`), h('small', { class: 'plain-sub' }, t.buy[1]), buy), t.help.buy),
      withHelp(h('div', { class: 'field' }, h('label', {}, '現價（元）'), h('small', { class: 'plain-sub' }, '自動抓最近收盤價'), now), t.help.now)),
    onRemove ? h('button', { type: 'button', class: 'link-button', onclick: onRemove }, '刪掉這檔') : null);
}

export function holdingsInput({ id, rows = [{}], max = 5, label = '你的持股', side = 'long' }) {
  const list = h('div', { class: 'holding-list' });
  const add = h('button', { type: 'button', class: 'secondary' }, '＋ 再加一檔');
  const box = h('div', { id, class: 'holdings' }, h('h3', {}, label), list, add);
  const refresh = () => {
    const items = [...list.children];
    items.forEach(el => el.querySelector('.link-button')?.toggleAttribute('hidden', items.length === 1));
    add.hidden = items.length >= max;
  };
  const append = r => { const row = holdingRow(r, () => { row.remove(); refresh(); }, side); list.append(row); refresh(); };
  (rows.length ? rows : [{}]).forEach(append);
  add.addEventListener('click', () => { append({}); list.lastElementChild.querySelector('.h-code').focus(); });
  return box;
}

export function readHoldings(id) {
  return [...document.querySelectorAll(`#${id} .holding`)].map(el => ({
    code: normalizeCode(el.querySelector('.h-code').value) || el.querySelector('.h-code').value.trim(),
    shares: parseNum(el.querySelector('.h-shares').value),
    buyPrice: parseNum(el.querySelector('.h-buy').value),
    nowPrice: parseNum(el.querySelector('.h-now').value)
  }));
}

// ---------- Beta 持股（v5.5） ----------
export function betaHoldingsInput({ id, rows = [{}], kind = 'stock', max = kind === 'lever' ? 3 : 10, label = kind === 'mix' ? '這個策略裡的持股' : kind === 'lever' ? '你的正二' : '其他持股（不含正二）' }) {
  const lever = kind === 'lever', mix = kind === 'mix';
  const list = h('div', { class: 'holding-list' });
  const add = h('button', { type: 'button', class: 'secondary' }, '＋ 再加一檔');
  const box = h('div', { id, class: 'holdings' }, h('h3', {}, label), list, add);
  const refresh = () => {
    const items = [...list.querySelectorAll('.beta-holding')];
    items.forEach(el => el.querySelector('.link-button').toggleAttribute('hidden', (lever || mix) && items.length === 1));
    list.querySelector('.beta-empty')?.remove();
    if (!items.length) list.append(h('p', { class: 'muted beta-empty' }, '沒有其他持股：直接按「下一步」。'));
    add.hidden = items.length >= max;
  };
  const append = (r = {}) => {
    const status = h('small', { class: 'holding-status', 'aria-live': 'polite' });
    const name = h('span', { class: 'holding-name' }, STOCK_NAMES[r.code] || '');
    const code = h('input', { class: 'b-code', type: 'text', autocomplete: 'off', autocapitalize: 'characters', placeholder: lever ? '例：00631L' : '例：0050', value: show(r.code), 'aria-label': '代號／名稱' });
    const input = (key, placeholder, aria) => h('input', { class: `b-${key}`, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder, value: show(r[key]), 'aria-label': aria });
    const shares = input('shares', '例：3000', '股數');
    const price = input('price', '輸入代號後自動帶入', '現價（元）');
    const beta = input('beta', mix ? '' : lever ? '2' : '1', 'Beta');
    let seq = 0;
    code.addEventListener('change', async () => {
      const my = ++seq, c = normalizeCode(code.value);
      name.textContent = STOCK_NAMES[c] || '';
      if (!c) { status.textContent = code.value.trim() ? '不是台股代號：不會自動抓價，現價請自己填（海外股票、基金：股數填 1、現價填總金額）。' : ''; return; }
      code.value = c;
      status.textContent = `查詢 ${c} 最近收盤價…`;
      const result = await fetchClose(c, { token: getToken() });
      if (my !== seq) return;
      if (result.ok) {
        price.value = String(result.close);
        status.textContent = `現價 ${result.close}：FinMind ${result.date} 收盤價，可以手動改。`;
        if (result.clearToken) { setToken(''); status.textContent += '（存的 token 已失效，已清除）'; }
      } else status.textContent = result.message + (result.action === 'show-quota-guide' ? ' 申請方式見下方 token 說明。' : '');
    });
    const field = (title, plain, el, text, chip) => withHelp(h('div', { class: 'field' }, h('label', {}, title, chip ? infoChip(chip) : null), h('small', { class: 'plain-sub' }, plain), el), { text });
    const row = h('div', { class: 'holding beta-holding' },
      withHelp(h('div', { class: 'field' }, h('label', {}, '代號／名稱 ', name), code, status), { text: lever
        ? ['正二的代號，例：00631L、00685L。最多 3 檔。', '填好會自動抓最近收盤價。']
        : ['填台股代號會自動抓最近收盤價，例：0050、2330。', '海外股票、基金這類不是台股的資產，填名稱就好，股數填 1、現價填總金額。'] }),
      h('div', { class: 'holding-grid' },
        field('股數', (lever || mix) ? '還沒買就填 0' : '1 張＝1000 股', shares, mix ? ['手上有幾「股」：1 張＝1000 股，零股照實際股數填。', '還沒買的就填 0，工具會算出要買多少。'] : lever ? ['手上有幾股：1 張＝1000 股。', '還沒買就填 0，工具會算出要買多少。'] : ['手上有幾「股」：1 張＝1000 股，零股照實際股數填。', '已經賣光的就按「刪掉這檔」。']),
        field('現價（元）', '填好代號自動抓', price, ['最近一個交易日的收盤價，填好代號會自動帶入，可以自己改。', '抓不到時（沒網路、查詢次數用完）就手動填券商 App 上的價格。']),
        field('Beta', mix ? '留白＝看代號猜' : lever ? '留白＝2' : '不確定就留白＝1', beta, mix ? ['這檔跟大盤一起漲跌的程度。留白會看代號猜：結尾 L（正二）當 2、R（反向）當 −1、B（債券 ETF）當 0，其他當 1。', '正二是「每天」約 2 倍，放久了會偏離。'] : lever ? ['正二每天約等於 2 倍大盤，留白就當 2。', '注意是「每天」2 倍，放久了會偏離。'] : ['這檔跟大盤一起漲跌的程度：0050 這類大盤 ETF 約 1，不確定就留白（當 1）。', '個股的 Beta 是估計值，會隨時間改變。'], lever ? 'daily-2x' : 'beta')),
      h('button', { type: 'button', class: 'link-button', onclick: () => { ++seq; row.remove(); refresh(); } }, '刪掉這檔'));
    list.append(row); refresh();
  };
  ((lever || mix) && !rows.length ? [{}] : rows).forEach(append);
  refresh();
  add.addEventListener('click', () => { append({}); list.lastElementChild.querySelector('.b-code').focus(); });
  return box;
}

export function readBetaHoldings(id) {
  return [...document.querySelectorAll(`#${id} .beta-holding`)].map(el => {
    const v = el.querySelector('.b-code').value;
    return { code: normalizeCode(v) || v.trim(), shares: parseNum(el.querySelector('.b-shares').value), price: parseNum(el.querySelector('.b-price').value), beta: parseNum(el.querySelector('.b-beta').value) };
  });
}

export function tokenBox() {
  const input = h('input', { type: 'password', autocomplete: 'off', placeholder: '貼上 FinMind token', value: getToken(), 'aria-label': 'FinMind token' });
  const msg = h('small', { class: 'plain-sub', 'aria-live': 'polite' });
  const up = location.pathname.includes('/tools/') ? '' : 'tools/';
  return h('details', { class: 'advanced token-box' }, h('summary', {}, 'FinMind token（選填）'),
    h('p', { class: 'tip' }, '不填也能抓股價（每小時 300 次）；常常用完再申請免費 token（每小時 600 次）。token 只存在這台裝置的瀏覽器，只送給 FinMind。'),
    input,
    h('div', { class: 'wizard-nav' },
      h('button', { type: 'button', class: 'secondary', onclick: () => { msg.textContent = setToken(input.value.trim()) ? (input.value.trim() ? '已存在這台裝置。' : '已清除。') : '這個瀏覽器不允許儲存（例如私密模式），每次要重貼。'; } }, '存起來'),
      h('button', { type: 'button', class: 'secondary', onclick: () => { input.value = ''; setToken(''); msg.textContent = '已清除。'; } }, '清除')),
    msg,
    h('p', {}, h('a', { href: up + 'calc-guide.html#token' }, 'token 怎麼申請？')));
}

// ---------- 分次買進（v5.4） ----------
const LOT_HELP = {
  shares: { text: ['這一次買了幾「股」：1 張＝1000 股，零股照實際股數填。', '看券商 App 的「成交回報」或「對帳單」，一筆成交填一列。'] },
  price: { text: ['這一次的成交價（每股多少錢），不是庫存裡的成本均價。', '同一天分好幾筆成交，手續費是分開收的，最好也分開填。'] }
};
function lotRow(r = {}, onRemove) {
  const shares = h('input', { class: 'l-shares', type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: '例：1000', value: show(r.shares), 'aria-label': '股數' });
  const price = h('input', { class: 'l-price', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '例：90', value: show(r.price), 'aria-label': '買入價' });
  return h('div', { class: 'holding lot' },
    h('strong', { class: 'lot-no' }),
    h('div', { class: 'holding-grid' },
      withHelp(h('div', { class: 'field' }, h('label', {}, '股數'), h('small', { class: 'plain-sub' }, '1 張＝1000 股'), shares), LOT_HELP.shares),
      withHelp(h('div', { class: 'field' }, h('label', {}, '買入價（元）'), h('small', { class: 'plain-sub' }, '這一筆的成交價'), price), LOT_HELP.price)),
    h('button', { type: 'button', class: 'link-button', onclick: onRemove }, '刪掉這筆'));
}
export function lotsInput({ id, rows = [{}], max = 10, label = '之後每一次買進', first = 1 }) {
  const list = h('div', { class: 'holding-list' });
  const add = h('button', { type: 'button', class: 'secondary' }, '＋ 再加一筆');
  const box = h('div', { id, class: 'holdings lots' }, h('h3', {}, label), list, add);
  const refresh = () => {
    [...list.children].forEach((el, i) => { el.querySelector('.lot-no').textContent = `第 ${i + first} 筆`; });
    add.hidden = list.children.length >= max;
  };
  const append = r => { const row = lotRow(r, () => { row.remove(); refresh(); }); list.append(row); refresh(); };
  rows.forEach(append);
  add.addEventListener('click', () => { append({}); list.lastElementChild.querySelector('.l-shares').focus(); });
  return box;
}
export function readLots(id) {
  return [...document.querySelectorAll(`#${id} .lot`)].map(el => ({
    shares: parseNum(el.querySelector('.l-shares').value),
    price: parseNum(el.querySelector('.l-price').value)
  }));
}
