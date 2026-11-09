// 驗收研究任務 R4（個人借錢管道）的格式（Opus 寫，Codex 不准改）。用法：node scripts/check-r4.mjs
import { readFileSync, existsSync } from 'node:fs';

const FILE = 'docs/research/R4-個人借錢管道.md';
const COLS = 11;
const MUST = ['股票質借', '不限用途', '融資', '融券', '借券', '信貸', '增貸', '理財型房貸', '保單', '預借現金', '車'];
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };

if (!existsSync(FILE)) { fail(`${FILE} 不存在`); console.log(`NG ${bad}`); process.exit(1); }
const text = readFileSync(FILE, 'utf8');
const table = (text.split('## 比較表')[1] || '').split(/\n## /)[0];
const rs = table.split(/\r?\n/)
  .filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l))
  .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
  .slice(1);

if (rs.length < 14) fail(`比較表只有 ${rs.length} 列，至少 14`);
for (const k of MUST) if (!rs.some(r => r[0].includes(k))) fail(`比較表缺「${k}」相關管道`);
for (const s of ['## 比較表', '## 新手常見誤解', '## 待查與矛盾']) if (!text.includes(s)) fail(`缺段落 ${s}`);

const seen = new Set();
let pending = 0;
rs.forEach(r => {
  if (r.length !== COLS) { fail(`「${r[0]}」有 ${r.length} 欄，應為 ${COLS}`); return; }
  const rate = r[3];
  if (/待查/.test(rate)) pending++;
  else if (!/%/.test(rate) || !/20\d\d-\d\d(-\d\d)?/.test(rate)) fail(`「${r[0]}」利率欄要有 % 與查詢日期（YYYY-MM-DD），或寫「待查」`);
  for (const i of [6, 7]) if (r[i].length < 8) fail(`「${r[0]}」第 ${i + 1} 欄太短`);
  const last = r[COLS - 1];
  if (!/https?:\/\//.test(last)) fail(`「${r[0]}」最後一欄沒有原網址`);
  const locals = [...last.matchAll(/來源\/[^\s)\]|]+\.md/g)].map(m => m[0]);
  if (!locals.length) fail(`「${r[0]}」最後一欄沒有本機來源檔`);
  for (const l of locals) {
    const f = 'docs/research/' + l;
    if (!existsSync(f)) { fail(`「${r[0]}」來源檔不存在：${l}`); continue; }
    if (seen.has(f)) continue; seen.add(f);
    if (!/來源\/R4-\d\d_/.test(l) && !/來源\/R[23]-\d\d_/.test(l)) fail(`${l} 檔名要是 R4-NN_發行者：標題.md（沿用 R2／R3 舊檔可）`);
    const t = readFileSync(f, 'utf8');
    if (!/網址[:：]\s*https?:\/\//.test(t)) fail(`${l} 沒有「網址：」`);
    if (!/抓取日期[:：]\s*20\d\d-\d\d-\d\d/.test(t)) fail(`${l} 沒有「抓取日期：YYYY-MM-DD」`);
    const body = (t.split('## 重點整理')[1] || '').split('## 關鍵數字')[0].trim();
    if (body.length < 300) fail(`${l} 的「## 重點整理」少於 300 字`);
    const orig = (t.match(/原文[:：]\s*(原文\/\S+\.(md|pdf))/) || [])[1];
    if (!orig) fail(`${l} 沒有「原文：原文/xxx.md 或 .pdf」`);
    else if (!existsSync('docs/research/來源/' + orig)) fail(`${l} 的原文檔不存在：${orig}`);
    else if (orig.endsWith('.md') && readFileSync('docs/research/來源/' + orig, 'utf8').trim().length < 300) fail(`${orig} 原文少於 300 字`);
    if (!/## 關鍵數字/.test(t)) fail(`${l} 沒有「## 關鍵數字」`);
    if (!/## 我的判讀/.test(t)) fail(`${l} 沒有「## 我的判讀」`);
  }
});

console.log(`R4 ${rs.length} 列；利率待查 ${pending}；本機來源檔 ${seen.size} 個`);
console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
