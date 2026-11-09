// 用假 DOM 執行朋友計算機線上版的 calc()（原始碼 zr-calc-online.src.txt，逐字複製），把輸出 HTML 拆回數字字串。
// runOnline(input) 的 input 與 core balancePlan 相同欄位；數字照線上版的 fmt／pct／x2 格式化後回傳字串，比對時 core 端用同一組格式化函式。
import { readFileSync } from 'node:fs';

const SRC = readFileSync(new URL('./zr-calc-online.src.txt', import.meta.url), 'utf8');
const str = v => (v == null || Number.isNaN(v) ? '' : String(v));

function fakeRow(r, defBeta) {
  const f = { '.n': { value: str(r.code) }, '.s': { value: str(r.shares) }, '.p': { value: str(r.price) },
    '.b': { value: r.beta == null || Number.isNaN(r.beta) ? defBeta : String(r.beta) }, '.w': { value: str(r.weight) }, '.mv': { innerHTML: '' } };
  return { querySelector: sel => f[sel] };
}

export const fmt = n => Math.round(n).toLocaleString('zh-TW');
export const pct = n => (isFinite(n) ? (n * 100).toFixed(1) + '%' : '—');
export const x2 = n => (isFinite(n) ? n.toFixed(2) : '—');

export function runOnline({ stocks = [], levers, cash, debt, target, minCash = 0, basis = 'net', allowBorrow = false }) {
  const el = { cash: { value: str(cash) }, debt: { value: str(debt) }, B: { value: str(target) }, minCash: { value: str(minCash) },
    basis: { value: basis }, borrow: { checked: !!allowBorrow }, out: { innerHTML: '' } };
  const rows = stocks.map(r => fakeRow(r, '1')), levs = levers.map(r => fakeRow(r, '2'));
  const document = {
    getElementById: id => el[id],
    querySelectorAll: sel => (sel === '#rows .item' ? rows : sel === '#levRows .item' ? levs : [])
  };
  const calc = new Function('document', `${SRC}\nreturn calc;`)(document);
  calc();
  return parse(el.out.innerHTML);
}

function parse(html) {
  if (html.includes('card err')) return { error: html.replace(/<[^>]+>/g, '') };
  const m = (re, i = 1) => { const r = html.match(re); if (!r) throw new Error('線上版輸出找不到 ' + re); return r[i]; };
  const hero = html.match(/目前 NT\$ ([-\d,]+)　→　(需買進|需賣出) <b>NT\$ ([-\d,]+)<\/b>/);
  const detailTable = html.split('<table>')[1];
  const detail = [...detailTable.matchAll(/<tr><td>([^<]*)<\/td><td>([-\d,]+)<\/td><td>(買|賣) ([-\d,]+)(?:<br><small[^>]*>約 ([-\d,]+) 股<\/small>)?<\/td><\/tr>/g)]
    .map(r => ({ code: r[1], target: r[2], side: r[3], amount: r[4], shares: r[5] ?? null }));
  const pair = name => { const r = html.match(new RegExp(`<tr><td>${name}</td><td>([^<]*)</td><td>([^<]*)</td></tr>`)); return r ? [r[1], r[2]] : null; };
  return {
    label: m(/<div class="sub">(正二|股票)目標總市值/),
    X: m(/<div class="big">NT\$ ([-\d,]+)<\/div>/),
    L: hero[1], action: hero[2], delta: hero[3],
    detail,
    D: html.match(/非正二 Beta 曝險額 D<\/td><td>([-\d,]+)/)?.[1] ?? null,
    targetExposure: m(/目標 Beta 曝險額<\/td><td>([-\d,]+)/),
    bw: m(/加權 Beta<\/td><td>([^<]+)/),
    cashAfter: m(/平衡後現金<\/td><td>([-\d,]+)/),
    ok: m(/<span class="tag (ok|bad)">/) === 'ok',
    notes: [...html.matchAll(/<p class="note">(.*?)<\/p>/g)].map(r => r[1]),
    compare: Object.fromEntries(['總資產', '淨資產', '負債比', '資產槓桿比', '股票市值曝險', '股票曝險／淨資產', '資產口徑 Beta', '淨資產口徑 Beta', '現金']
      .map(k => [k, pair(k)]))
  };
}
