// 精靈元件（v5 新增；Opus 定，外包不得改簽名）。每個計算機都是「一步一畫面」：
//   輸入步驟 1…N → 結果（逐項解說）。結果頁可以跳回任一步改參數重算。
// 介面：
//   wizard({ steps, result, example })      回傳 <section class="card wizard">
//     steps：[{ title, hint, body(state) → Node[], read(state) }]
//       body：用 state 現有的值畫欄位（回上一步時值要還在）
//       read：把畫面上的值寫回 state；不合格就 throw new Error('給使用者看的一句話')
//     result(state) → Node[]：結果步驟的內容（通常是 explain() 一串）；throw 會顯示成錯誤
//     example：完整的 state（範例數字）。第 1 步顯示「帶入範例」，按下直接跳到結果
//   holdingsInput({ id, rows, max, label })  持股輸入：代號＋買入股數＋買入價＋現價（輸入代號自動抓 FinMind 收盤價）
//     rows：[{ code, shares, buyPrice, nowPrice }]（數字可為 NaN／空），max 預設 5
//   readHoldings(id) → [{ code, shares, buyPrice, nowPrice }]   只讀畫面，檢查交給 core 的 holdingSummary
//   tokenBox()                               FinMind token（選填）：存在這台裝置、清除、連到申請教學
//   explain({ label, value, tone, how, means, todo })   結果的一項：大數字＋▸怎麼來的／▸代表什麼／▸要做什麼
//   numberInput({ id, label, plain, termId, value, suffix })   numberField 的精靈版：value 可以是數字（NaN 會留白）
import { h, infoChip, metric } from './components.js';
import { parseNum } from '../core/format.js';
import { normalizeCode } from '../core/holdings.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { fetchClose, getToken, setToken } from '../net/price.js';

const show = v => (typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : (v ?? ''));

export function numberInput({ id, label, plain = '', termId, value = '', suffix = '' }) {
  return h('div', { class: 'field' },
    h('label', { for: id }, label, termId ? infoChip(termId) : null),
    plain ? h('small', { class: 'plain-sub' }, plain) : null,
    h('div', { class: 'input-row' },
      h('input', { id, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: show(value) }),
      suffix ? h('span', { class: 'suffix' }, suffix) : null));
}

export function explain({ label, value, tone, how, means, todo }) {
  return h('div', { class: 'explain' },
    metric(label, value, tone),
    how ? h('p', {}, h('b', {}, '▸ 怎麼來的：'), how) : null,
    means ? h('p', {}, h('b', {}, '▸ 代表什麼：'), means) : null,
    todo ? h('p', {}, h('b', {}, '▸ 要做什麼：'), todo) : null);
}

export function wizard({ steps, result, example }) {
  const total = steps.length + 1;
  let state = {}, at = 0;
  const root = h('section', { class: 'card wizard' });

  function go(i) { at = i; render(); root.querySelector('.wizard-title')?.focus(); root.scrollIntoView?.({ block: 'start' }); }
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
  }
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && at < steps.length) { e.preventDefault(); next(); } });
  render();
  return root;
}

// ---------- 持股輸入 ----------
function holdingRow(r = {}, onRemove) {
  const status = h('small', { class: 'holding-status', 'aria-live': 'polite' });
  const name = h('span', { class: 'holding-name' }, STOCK_NAMES[r.code] || '');
  const code = h('input', { class: 'h-code', type: 'text', autocomplete: 'off', autocapitalize: 'characters', placeholder: '例：0050', value: show(r.code), 'aria-label': '股票代號' });
  const shares = h('input', { class: 'h-shares', type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: '例：3000', value: show(r.shares), 'aria-label': '買入股數' });
  const buy = h('input', { class: 'h-buy', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '例：165.2', value: show(r.buyPrice), 'aria-label': '買入價' });
  const now = h('input', { class: 'h-now', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '輸入代號後自動帶入', value: show(r.nowPrice), 'aria-label': '現價' });
  let seq = 0;
  code.addEventListener('change', async () => {
    const c = normalizeCode(code.value);
    name.textContent = STOCK_NAMES[c] || '';
    if (!c) { status.textContent = code.value.trim() ? '代號格式不對，例：0050、00631L。' : ''; return; }
    code.value = c;
    const my = ++seq;
    status.textContent = `查詢 ${c} 最近收盤價…`;
    const token = getToken();
    const r = await fetchClose(c, { token });
    if (my !== seq) return; // 使用者已經改了代號
    if (r.ok) {
      now.value = String(r.close);
      status.textContent = `現價 ${r.close}：FinMind ${r.date} 收盤價，可以手動改。`;
      if (r.clearToken) { setToken(''); status.textContent += '（存的 token 已失效，已清除）'; }
    } else status.textContent = r.message + (r.action === 'show-quota-guide' ? ' 申請方式見下方 token 說明。' : '');
  });
  return h('div', { class: 'holding' },
    h('div', { class: 'field' }, h('label', {}, '股票代號 ', name), code, status),
    h('div', { class: 'holding-grid' },
      h('div', { class: 'field' }, h('label', {}, '買入股數'), h('small', { class: 'plain-sub' }, '看券商 App 的「庫存」；1 張＝1000 股'), shares),
      h('div', { class: 'field' }, h('label', {}, '買入價（元）'), h('small', { class: 'plain-sub' }, '庫存裡的「成本均價」'), buy),
      h('div', { class: 'field' }, h('label', {}, '現價（元）'), h('small', { class: 'plain-sub' }, '自動抓最近收盤價'), now)),
    onRemove ? h('button', { type: 'button', class: 'link-button', onclick: onRemove }, '刪掉這檔') : null);
}

export function holdingsInput({ id, rows = [{}], max = 5, label = '你的持股' }) {
  const list = h('div', { class: 'holding-list' });
  const add = h('button', { type: 'button', class: 'secondary' }, '＋ 再加一檔');
  const box = h('div', { id, class: 'holdings' }, h('h3', {}, label), list, add);
  const refresh = () => {
    const items = [...list.children];
    items.forEach(el => el.querySelector('.link-button')?.toggleAttribute('hidden', items.length === 1));
    add.hidden = items.length >= max;
  };
  const append = r => { const row = holdingRow(r, () => { row.remove(); refresh(); }); list.append(row); refresh(); };
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
