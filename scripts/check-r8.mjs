// 驗收研究任務 R8（股災史＋投資心態）的格式（Opus 寫，Codex 不准改）。用法：node scripts/check-r8.mjs
import { readFileSync, existsSync } from 'node:fs';

let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const seen = new Set();

function table(file, section, cols, min, must, name) {
  if (!existsSync(file)) { fail(`${file} 不存在`); return []; }
  const text = readFileSync(file, 'utf8');
  if (!text.includes(section)) { fail(`${name} 缺段落 ${section}`); return []; }
  const part = text.split(section)[1].split(/\n## /)[0];
  const rs = part.split(/\r?\n/)
    .filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
    .slice(1);
  if (rs.length < min) fail(`${name} 只有 ${rs.length} 列，至少 ${min}`);
  for (const k of must) if (!rs.some(r => r[0].includes(k))) fail(`${name} 缺「${k}」`);
  const firsts = rs.map(r => r[0]);
  if (firsts.length !== new Set(firsts).size) fail(`${name} 第 1 欄有重複`);
  rs.forEach(r => {
    if (r.length !== cols) { fail(`${name}「${r[0]}」有 ${r.length} 欄，應為 ${cols}`); return; }
    if (r.some(c => !c)) fail(`${name}「${r[0]}」有空白欄（查不到寫「待查」）`);
    checkSources(r[cols - 1], `${name}「${r[0]}」`);
  });
  return rs;
}

function checkSources(last, where) {
  if (!/https?:\/\//.test(last)) fail(`${where} 最後一欄沒有原網址`);
  const locals = [...last.matchAll(/來源\/[^\s)\]|]+\.md/g)].map(m => m[0]);
  if (!locals.length) fail(`${where} 最後一欄沒有本機來源檔`);
  for (const l of locals) {
    const f = 'docs/research/' + l;
    if (!existsSync(f)) { fail(`${where} 來源檔不存在：${l}`); continue; }
    if (seen.has(f)) continue; seen.add(f);
    if (!/來源\/R[2-8]-\d\d_/.test(l)) fail(`${l} 檔名要是 R8-NN_發行者：標題.md（沿用 R2–R5 舊檔可）`);
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
}

const F1 = 'docs/research/R8-股災史.md', F2 = 'docs/research/R8-投資心態.md';
const C = table(F1, '## 股災表', 9, 12, ['1929', '1987', '1990', '2000', '2008', '2015', '2020', '2022', '2024', '2025'], 'R8 股災表');
const M = table(F2, '## 心態表', 5, 15, ['損失規避', '處分效應', '從眾', '過度自信', '近因', '定錨', '沉沒成本', '緊急預備金', '分散', '槓桿'], 'R8 心態表');
const K = table(F2, '## 股災時檢查清單', 4, 8, ['槓桿', '追繳', '預備金'], 'R8 檢查清單');

// 不准出現擇時或保證類說法
const BANNED = ['保證回本', '一定會漲', '一定會回來', '抄底', '必定反彈', '穩賺'];
for (const f of [F1, F2]) if (existsSync(f)) {
  const t = readFileSync(f, 'utf8');
  for (const w of BANNED) if (t.includes(w)) fail(`${f} 出現禁用說法「${w}」`);
}

console.log(`R8 股災 ${C.length} 列；心態 ${M.length} 列；檢查清單 ${K.length} 列；本機來源檔 ${seen.size} 個`);
console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
