// 共用 UI 元件。每個工具頁只用這裡的元件組畫面，不自己寫 innerHTML（避免 XSS 與樣式分歧）。
// 介面（Gate 0 定死，外包不得改簽名；需要新元件先停下回報）：
//   h(tag, attrs, ...children)              建元素；字串子節點一律當純文字
//   toolHeader({ no, title, oneLine })      頁首＋回首頁連結
//   numberField({ id, label, plain, termId, value, suffix })   數字欄位＋白話副標＋ⓘ
//   selectField({ id, label, plain, termId, options, value }) 下拉選單
//   infoChip(termId)                        ⓘ 按鈕；點了在欄位下方展開術語小卡（一個 .field 最多一顆）
//   termCard(termId)                        術語小卡（辭典頁也用）
//   exampleButton(values, onFill)           「帶入範例」鈕；values＝{ 欄位id: 值 }
//   readNumbers(ids)                        讀欄位 → { id: number|NaN }
//   showResult(box, ...nodes) / showError(box, message)
//   metric(label, value, tone)              結果數字塊；tone: 'ok'|'bad'|'warn'|undefined
//   disclaimer(kind)                        固定免責區；kind: 'general' | 'executable'
//   figure({ src, alt, caption })           圖解（img/<工具id>/*.svg）；alt 必填，caption 一句白話
//   lineChart({ series, label, yFormat, baseline, height })   折線圖（Gate 2 新增）
//       series：[{ name, values:number[] }]，1–3 條，values 等長且 ≥ 2；顏色依序 accent／muted／warn
//       label：給螢幕閱讀器的一句話（必填）；yFormat：y 軸刻度格式函式（預設 String）
//       baseline：一條虛線參考值（例 1＝起點），可省略；height：viewBox 高度，預設 200
//       回傳 <figure class="chart">（內含 svg 與 HTML 圖例），可直接放進 showResult
import { TERM_BY_ID } from '../data/glossary.js';
import { parseNum } from '../core/format.js';

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) { if (typeof v === 'function') el.addEventListener(k.slice(2), v); continue; } // on* 只收函式
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

export function toolHeader({ no, title, oneLine }) {
  return h('header', { class: 'tool-header' },
    h('a', { class: 'back', href: '../index.html' }, '← 工具箱'),
    h('h1', {}, h('span', { class: 'no' }, no), ' ', title),
    h('p', { class: 'one-line' }, oneLine));
}

export function termCard(termId) {
  const t = TERM_BY_ID[termId];
  if (!t) throw new Error('未知術語：' + termId);
  return h('div', { class: 'term-card', id: 'term-' + t.id },
    h('strong', {}, t.term), t.aka.length ? h('span', { class: 'aka' }, '（', t.aka.join('、'), '）') : null,
    h('p', { class: 'plain' }, t.plain),
    h('p', {}, t.detail),
    h('p', { class: 'example' }, t.example),
    t.related.length ? h('p', { class: 'related' }, '相關：',
      t.related.map((id, i) => [i ? '、' : '', h('a', { href: rootPath() + 'tools/glossary.html#' + id }, TERM_BY_ID[id].term)])) : null);
}

export function infoChip(termId) {
  const t = TERM_BY_ID[termId];
  if (!t) throw new Error('未知術語：' + termId);
  const btn = h('button', { type: 'button', class: 'info-chip', 'aria-expanded': 'false', 'aria-label': t.term + '是什麼？' }, 'ⓘ');
  btn.addEventListener('click', () => {
    const host = btn.closest('.field') || btn.parentElement;
    const open = host.querySelector(':scope > .term-card');
    if (open) { open.remove(); btn.setAttribute('aria-expanded', 'false'); }
    else { host.append(termCard(termId)); btn.setAttribute('aria-expanded', 'true'); }
  });
  return btn;
}

export function numberField({ id, label, plain = '', termId, value = '', suffix = '' }) {
  return h('div', { class: 'field' },
    h('label', { for: id }, label, termId ? infoChip(termId) : null),
    plain ? h('small', { class: 'plain-sub' }, plain) : null,
    h('div', { class: 'input-row' },
      h('input', { id, type: 'text', inputmode: 'decimal', autocomplete: 'off', value }),
      suffix ? h('span', { class: 'suffix' }, suffix) : null));
}

export function selectField({ id, label, plain = '', termId, options, value }) {
  const sel = h('select', { id }, options.map(o => h('option', { value: o.value }, o.label)));
  if (value != null) sel.value = value;
  return h('div', { class: 'field' },
    h('label', { for: id }, label, termId ? infoChip(termId) : null),
    plain ? h('small', { class: 'plain-sub' }, plain) : null, sel);
}

export function exampleButton(values, onFill) {
  return h('div', { class: 'example-row' },
    h('button', { type: 'button', class: 'secondary', onclick: () => {
      for (const [id, v] of Object.entries(values)) { const el = document.getElementById(id); if (el) el.value = String(v); }
      onFill?.();
    } }, '帶入範例'),
    h('small', {}, '範例數字，不是建議值'));
}

export function readNumbers(ids) {
  return Object.fromEntries(ids.map(id => [id, parseNum(document.getElementById(id)?.value)]));
}

export function metric(label, value, tone) {
  return h('div', { class: 'metric' + (tone ? ' ' + tone : '') }, h('small', {}, label), h('strong', {}, value));
}

export function showResult(box, ...nodes) { box.replaceChildren(...nodes.flat(Infinity));box.classList.remove('error'); }
export function showError(box, message) { box.replaceChildren(h('p', {}, message)); box.classList.add('error'); }

export function figure({ src, alt, caption }) {
  if (!alt) throw new Error('figure 需要 alt');
  return h('figure', { class: 'figure' }, h('img', { src, alt, loading: 'lazy' }), caption ? h('figcaption', {}, caption) : null);
}

const SVG = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v));
  for (const c of children.flat(Infinity)) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
export function lineChart({ series, label, yFormat = String, baseline, height = 200 }) {
  if (!label) throw new Error('lineChart 需要 label');
  if (!Array.isArray(series) || series.length < 1 || series.length > 3) throw new Error('lineChart 需要 1–3 條線');
  const n = series[0].values.length;
  if (n < 2 || series.some(x => x.values.length !== n || x.values.some(v => !Number.isFinite(v)))) throw new Error('lineChart 每條線要有等長且有效的數值');
  const all = series.flatMap(x => x.values).concat(baseline ?? []);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (hi - lo < 1e-12) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const W = 360, L = 56, R = 8, T = 8, B = 8, iw = W - L - R, ih = height - T - B;
  const x = i => L + iw * i / (n - 1), y = v => T + ih * (hi - v) / (hi - lo);
  const ticks = [hi - pad, (hi + lo) / 2, lo + pad];
  const svg = s('svg', { viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': label },
    ticks.map(t => [s('line', { class: 'grid', x1: L, x2: W - R, y1: y(t), y2: y(t) }),
      s('text', { class: 'tick', x: L - 4, y: y(t) + 4, 'text-anchor': 'end' }, yFormat(t))]),
    baseline != null ? s('line', { class: 'base', x1: L, x2: W - R, y1: y(baseline), y2: y(baseline) }) : null,
    series.map((ser, k) => s('polyline', { class: 'line s' + k, fill: 'none',
      points: ser.values.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ') })));
  return h('figure', { class: 'chart' }, svg,
    h('figcaption', { class: 'legend' }, series.map((ser, k) => h('span', { class: 'key s' + k }, ser.name))));
}

const GENERAL = '僅供試算與教學，不構成投資建議。畫面上的預設數字是範例，不是建議值。';
export function disclaimer(kind = 'general') {
  if (kind === 'executable') return h('aside', { class: 'disclaimer' },
    h('p', {}, '「可以執行」只代表資金夠，不代表下跌時撐得住。'),
    h('p', {}, h('a', { href: rootPath() + 'tools/pledge.html' }, '用壓力測試看看跌 10–50% 會怎樣 →')),
    h('p', {}, GENERAL));
  return h('aside', { class: 'disclaimer' }, h('p', {}, GENERAL));
}

// 首頁在根目錄、工具頁在 tools/，連結用相對路徑才能部署在任何子路徑（GitHub Pages 的 /repo/）。
function rootPath() { return location.pathname.includes('/tools/') ? '../' : ''; }
