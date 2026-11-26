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
//   references(items)                       頁底參考資料卡；items＝[{ name, url, note? }]，url 必須 https://
//   figure({ src, alt, caption })           圖解（img/<工具id>/*.svg 或卡通 *.webp）；alt 必填，caption 一句白話；點圖開原圖
//   lineChart({ series, label, yFormat, baseline, height, xTicks })   折線圖（Gate 2 新增）
//       series：[{ name, values:number[] }]，1–4 條（v5.12 由 3 放寬到 4，第 4 條 class s3），values 等長且 ≥ 2；顏色依序 accent／muted／warn／s3
//       xTicks（v5.12，選填）：[{ index, text }] 在圖下方標 x 軸刻度（例：月份）
//       label：給螢幕閱讀器的一句話（必填）；yFormat：y 軸刻度格式函式（預設 String）
//       baseline：一條虛線參考值（例 1＝起點），可省略；height：viewBox 高度，預設 200
//       回傳 <figure class="chart">（內含 svg 與 HTML 圖例），可直接放進 showResult
//   pathNav(id)                             新手路線：「你在第 N 步」＋下一步連結（v5.12，Opus 寫）；id 不在路線上回傳 null
import { TERM_BY_ID } from '../data/glossary.js';
import { pathPlace } from '../data/tools.js';
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

export function references(items) {
  return h('section', { class: 'card refs' },
    h('h2', {}, '參考資料'),
    h('ol', {}, items.map(({ name, url, note }) => {
      if (typeof url !== 'string' || !url.startsWith('https://')) throw new Error('references 需要 https 網址');
      return h('li', {}, h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, name),
        note ? [' ', h('small', {}, note)] : null);
    })));
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
  return h('figure', { class: 'figure' }, h('a', { href: src, target: '_blank', rel: 'noopener', title: '點圖看大圖' }, h('img', { src, alt, loading: 'lazy' })), caption ? h('figcaption', {}, caption) : null);
}

const SVG = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v));
  for (const c of children.flat(Infinity)) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
// series[i].color：選填 0–4，固定顏色（勾選隱藏線時顏色不跳）；沒給就照順序。
// log：true＝等比刻度（數值要都 > 0；格線取最高、最低與幾何中點）。v5.14 起最多 5 條線。
export function lineChart({ series, label, yFormat = String, baseline, height = 200, xTicks, log = false }) {
  if (!label) throw new Error('lineChart 需要 label');
  if (!Array.isArray(series) || series.length < 1 || series.length > 5) throw new Error('lineChart 需要 1–5 條線');
  const n = series[0].values.length;
  if (n < 2 || series.some(x => x.values.length !== n || x.values.some(v => !Number.isFinite(v)))) throw new Error('lineChart 每條線要有等長且有效的數值');
  if (log && series.some(x => x.values.some(v => !(v > 0)))) throw new Error('lineChart 等比刻度的數值要大於 0');
  const f = log ? Math.log : v => v, inv = log ? Math.exp : v => v;
  const all = series.flatMap(x => x.values).concat(baseline ?? []).map(f);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (hi - lo < 1e-12) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const W = 360, L = 56, R = 8, T = 8, B = xTicks?.length ? 22 : 8, iw = W - L - R, ih = height - T - B;
  const x = i => L + iw * i / (n - 1), y = v => T + ih * (hi - f(v)) / (hi - lo);
  let ticks = [hi - pad, (hi + lo) / 2, lo + pad].map(inv);
  if (log) { // 等比刻度：格線取 1、2、5 × 10ⁿ 這種好讀的數，最多 5 條
    const nice = [], a = inv(lo + pad), b = inv(hi - pad);
    for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++) for (const m of [1, 2, 5]) { const v = m * 10 ** e; if (v >= a * 0.999 && v <= b * 1.001) nice.push(v); }
    const tens = nice.filter(v => Number.isInteger(Math.log10(v))); // 太多條就只留 10ⁿ
    const pick = nice.length > 5 ? tens : nice;
    if (pick.length >= 2) ticks = pick;
  }
  const svg = s('svg', { viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': label },
    ticks.map(t => [s('line', { class: 'grid', x1: L, x2: W - R, y1: y(t), y2: y(t) }),
      s('text', { class: 'tick', x: L - 4, y: y(t) + 4, 'text-anchor': 'end' }, yFormat(t))]),
    (xTicks || []).map(t => s('text', { class: 'tick', x: x(t.index), y: height - 6, 'text-anchor': 'middle' }, t.text)),
    baseline != null ? s('line', { class: 'base', x1: L, x2: W - R, y1: y(baseline), y2: y(baseline) }) : null,
    series.map((ser, k) => s('polyline', { class: 'line s' + (ser.color ?? k), fill: 'none',
      points: ser.values.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ') })));
  return h('figure', { class: 'chart' }, svg,
    h('figcaption', { class: 'legend' }, series.map((ser, k) => h('span', { class: 'key s' + (ser.color ?? k) }, ser.name))));
}

const GENERAL = '僅供試算與教學，不構成投資建議。畫面上的預設數字是範例，不是建議值。';
export function disclaimer(kind = 'general') {
  if (kind === 'executable') return h('aside', { class: 'disclaimer' },
    pageFoot(),
    h('p', {}, '「可以執行」只代表資金夠，不代表下跌時撐得住。'),
    h('p', {}, h('a', { href: rootPath() + 'tools/pledge.html' }, '用壓力測試看看跌 10–50% 會怎樣 →')),
    h('p', {}, GENERAL));
  return h('aside', { class: 'disclaimer' }, pageFoot(), h('p', {}, GENERAL));
}

// 頁底導覽（使用者 2026-11-09）：每個工具頁最下面都有「回到頂部」「回工具箱」。首頁不放回工具箱。
function pageFoot() {
  return h('nav', { class: 'page-foot', 'aria-label': '頁底導覽' },
    h('a', { href: '#', onclick: e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, '↑ 回到頂部'),
    rootPath() ? h('a', { href: rootPath() + 'index.html' }, '← 回工具箱') : null);
}

// 首頁在根目錄、工具頁在 tools/，連結用相對路徑才能部署在任何子路徑（GitHub Pages 的 /repo/）。
function rootPath() { return location.pathname.includes('/tools/') ? '../' : ''; }

export function pathNav(id) {
  const at = pathPlace(id);
  if (!at) return null;
  return h('nav', { class: 'card path-nav', 'aria-label': '新手路線' },
    h('h2', {}, '新手路線'),
    h('p', {}, `你在第 ${at.step} 步「${at.title}」：${at.question}`),
    at.next ? h('p', {}, '下一步：', h('a', { href: at.next.href.replace(/^tools\//, '') }, `${at.next.no} ${at.next.title}`), ' →')
      : h('p', {}, '這是目前路線的最後一頁。'),
    h('p', { class: 'muted' }, h('a', { href: '../index.html#path' }, '看完整路線')));
}
