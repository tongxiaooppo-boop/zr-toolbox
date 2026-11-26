// 驗收研究任務 R13（三桶商品查證）的格式（Opus 寫，Codex 不准改）。用法：node scripts/check-r13.mjs [--v2]
// --v2（2026-11-26 使用者改分類）：保守＝先留、不算 5/3/2；5/3/2 只分 穩健／成長／積極。建議桶欄不准再寫「保守穩健」。
const V2 = process.argv.includes('--v2');
import { readFileSync, existsSync } from 'node:fs';

let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const F = 'docs/research/R13-三桶商品查證.md';
const COLS = 12; // 代號｜全名｜發行者｜管道｜類型｜RR｜內扣費用｜流動性｜2020 最大跌幅｜2022 最大跌幅｜建議放哪桶｜來源
const MUST = ['定存', '貨幣市場基金', '00719B', '00865B', 'SGOV', 'SHY', '00720B', '股債平衡型基金', 'AOM', 'AOR', '00713', '2412',
  '2886', '5880', '0050', '006208', '0056', '00878', '00646', '00662', 'VT', 'VOO', 'SPY', 'QQQ', '00631L', '00675L', '00663L',
  '00981A', '00891', '00757'];
const BUCKET = V2 ? /^(保守（先留）|穩健|成長|積極|不建議放)/ : /^(保守穩健|成長|積極|不建議放)/;
const PCT = /^(-?\d+(\.\d+)?%|待查|未上市|不適用)/;

function rows(text, section) {
  if (!text.includes(section)) { fail(`缺段落 ${section}`); return []; }
  return text.split(section)[1].split(/\n## /)[0].split(/\r?\n/)
    .filter(l => /^\|/.test(l) && !/^\|\s*:?-/.test(l))
    .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
    .slice(1);
}

if (!existsSync(F)) { console.log(`FAIL ${F} 不存在`); process.exit(1); }
const text = readFileSync(F, 'utf8');
if (!/查證日期[:：]\s*20\d\d-\d\d-\d\d/.test(text)) fail('檔頭缺「查證日期：YYYY-MM-DD」');
if (!/跌幅算法[:：]/.test(text)) fail('檔頭缺「跌幅算法：」（寫明用收盤價、含不含息、期間）');

const rs = rows(text, '## 商品表');
if (rs.length < MUST.length) fail(`商品表只有 ${rs.length} 列，至少 ${MUST.length}`);
const firsts = rs.map(r => r[0]);
if (firsts.length !== new Set(firsts).size) fail('第 1 欄有重複');
for (const k of MUST) if (!firsts.some(f => f.includes(k))) fail(`商品表缺「${k}」`);
for (const r of rs) {
  const w = `「${r[0]}」`;
  if (r.length !== COLS) { fail(`${w} 有 ${r.length} 欄，應為 ${COLS}`); continue; }
  if (r.some(c => !c)) fail(`${w} 有空白欄（查不到寫「待查」，不適用寫「不適用」）`);
  if (!/^(RR[1-5]|待查|不適用)/.test(r[5])) fail(`${w} RR 欄要是 RR1–RR5／待查／不適用：${r[5]}`);
  if (!PCT.test(r[8])) fail(`${w} 2020 跌幅格式不對：${r[8]}`);
  if (!PCT.test(r[9])) fail(`${w} 2022 跌幅格式不對：${r[9]}`);
  if (!BUCKET.test(r[10])) fail(`${w} 建議桶要以 ${V2 ? '保守（先留）／穩健' : '保守穩健'}／成長／積極／不建議放 開頭：${r[10]}`);
  if (!/https:\/\//.test(r[11])) fail(`${w} 來源欄沒有 https 網址`);
}

const ch = rows(text, '## 建議增刪');
for (const r of ch) if (r.length !== 3 || r.some(c => !c)) fail(`建議增刪「${r[0]}」要 3 欄且不留空（商品｜增或刪｜理由）`);
if (V2 && rs.some(r => r[10] && r[10].startsWith('保守穩健'))) fail('v2 不准再用「保守穩健」');
if (V2 && !text.includes('## v2 分類變更')) fail('缺段落 ## v2 分類變更');
if (!text.includes('## 查不到或有疑問')) fail('缺段落 ## 查不到或有疑問（沒有就寫「無」）');

const BANNED = ['保證', '穩賺', '一定會漲', '保本', '無風險'];
for (const b of BANNED) if (text.includes(b) && !text.includes(`「${b}」`)) fail(`出現禁用字「${b}」`);

if (bad) { console.log(`R13 FAIL ${bad} 項`); process.exit(1); }
console.log(`R13${V2 ? ' v2' : ''} OK 商品 ${rs.length} 列；建議增刪 ${ch.length} 列`);
