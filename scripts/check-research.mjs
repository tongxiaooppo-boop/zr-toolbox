// 驗收研究任務 R1–R3 的格式（Opus 寫，Codex 不准改）。用法：node scripts/check-research.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const SRC = 'D:/ok/zr-calc/資料蒐集/2026-11-08_正二資料庫/來源筆記';
const ids = readdirSync(SRC).filter(f => f.endsWith('.md')).map(f => f.slice(0, 3)).sort();
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };

function rows(file) {
  if (!existsSync(file)) { fail(`${file} 不存在`); return []; }
  return readFileSync(file, 'utf8').split(/\r?\n/)
    .filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
    .slice(1); // 去掉表頭
}

// R1：77 筆分類，第 1 欄 ID、第 2 欄類別
const r1 = rows('docs/research/R1-77筆分類.md');
const r1ids = r1.map(r => r[0]).sort();
const missing = ids.filter(i => !r1ids.includes(i));
const extra = r1ids.filter(i => !ids.includes(i));
if (missing.length) fail(`R1 缺 ID：${missing.join(',')}`);
if (extra.length) fail(`R1 多出或重複：${extra.join(',')}`);
if (r1ids.length !== new Set(r1ids).size) fail('R1 有重複 ID');
const cats = { 計算: 0, 科普: 0, 兩者: 0 };
for (const r of r1) { if (r[1] in cats) cats[r[1]]++; else fail(`R1 ${r[0]} 類別不合法：${r[1]}`); }

// R2、R3：最後一欄要有本機來源檔「來源/xxx.md」與原網址；來源檔要有網址、抓取日期、重點整理、關鍵數字、我的判讀
const seen = new Set();
function urls(file, min, name) {
  const rs = rows(file);
  if (rs.length < min) fail(`${name} 只有 ${rs.length} 列，至少 ${min}`);
  rs.forEach(r => {
    const last = r[r.length - 1];
    if (!/https?:\/\//.test(last)) fail(`${name}「${r[0]}」最後一欄沒有原網址`);
    const locals = [...last.matchAll(/來源\/[^\s)\]|]+\.md/g)].map(m => m[0]);
    if (!locals.length) fail(`${name}「${r[0]}」最後一欄沒有本機來源檔`);
    for (const l of locals) {
      const f = 'docs/research/' + l;
      if (!existsSync(f)) { fail(`${name}「${r[0]}」來源檔不存在：${l}`); continue; }
      if (seen.has(f)) continue; seen.add(f);
      const t = readFileSync(f, 'utf8');
      if (!/網址[:：]\s*https?:\/\//.test(t)) fail(`${l} 沒有「網址：」`);
      if (!/抓取日期[:：]\s*20\d\d-\d\d-\d\d/.test(t)) fail(`${l} 沒有「抓取日期：YYYY-MM-DD」`);
      const body = (t.split('## 重點整理')[1] || '').split('## 關鍵數字')[0].trim();
      if (body.length < 300) fail(`${l} 的「## 重點整理」少於 300 字`);
      if (!/## 關鍵數字/.test(t)) fail(`${l} 沒有「## 關鍵數字」`);
      if (!/## 我的判讀/.test(t)) fail(`${l} 沒有「## 我的判讀」`);
    }
  });
  return rs.length;
}
const n2 = urls('docs/research/R2-常用計算機.md', 25, 'R2');
const n3 = urls('docs/research/R3-ETF常識.md', 20, 'R3');

console.log(`R1 ${r1.length}/${ids.length}（計算 ${cats.計算}、科普 ${cats.科普}、兩者 ${cats.兩者}）；R2 ${n2} 列；R3 ${n3} 列；本機來源檔 ${seen.size} 個`);
console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
