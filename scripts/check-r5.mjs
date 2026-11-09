// 驗收研究任務 R5（個人可交易商品與獲利方式＋新手基本術語）的格式（Opus 寫，Codex 不准改）。用法：node scripts/check-r5.mjs
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
    if (!/來源\/R[2-5]-\d\d_/.test(l)) fail(`${l} 檔名要是 R5-NN_發行者：標題.md（沿用 R2–R4 舊檔可）`);
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

const P = table('docs/research/R5-商品與獲利方式.md', '## 商品表', 9, 16,
  ['股票', '零股', '興櫃', 'ETF', 'ETN', '權證', '期貨', '選擇權', '可轉債', '債券', '基金', '複委託', 'TDR', 'REIT', '借券出借', '當沖'], 'R5 商品表');
P.forEach(r => { if (!/^(是|小心|不建議)/.test(r[6])) fail(`R5 商品表「${r[0]}」第 7 欄要以 是／小心／不建議 開頭`); });
const W = table('docs/research/R5-商品與獲利方式.md', '## 獲利方式', 5, 6, ['價差', '股利', '利息'], 'R5 獲利方式');

const OLD = ['手續費', '證交稅', '除權息', '殖利率', '融資', '融券', '本益比', '本淨比', '每股盈餘', '收盤價', '升降單位', '定期定額', '複利'];
const T = table('docs/research/R5-基本術語.md', '## 術語表', 5, 40,
  ['上市', '上櫃', '集保', '交割', '委託', '限價', '市價', '漲跌停', '成交量', '市值', '加權指數', 'T+2', '違約交割', '股東會', '面額', '盤後'], 'R5 術語');
T.forEach(r => { if (OLD.includes(r[0])) fail(`R5 術語「${r[0]}」辭典已有，不要重收`); });

console.log(`R5 商品 ${P.length} 列；獲利方式 ${W.length} 列；術語 ${T.length} 列；本機來源檔 ${seen.size} 個`);
console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
