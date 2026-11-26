// 驗收研究任務 R14（三桶壓力測試）的報告格式（Opus 寫，研究者不准改）。用法：node scripts/check-r14.mjs <報告檔>
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
if (!file || !existsSync(file)) { console.log('FAIL 報告檔不存在：' + file); process.exit(1); }
const text = readFileSync(file, 'utf8');

const HEADS = ['## 一、結論', '## 二、別人怎麼做', '## 三、三種布局的代表組合', '## 四、每次股災的跌幅', '## 五、起點年份比較', '## 六、資料來源', '## 七、待查與不確定', '## 參考資料'];
let last = -1;
for (const hd of HEADS) {
  const i = text.indexOf('\n' + hd);
  if (i < 0) fail('缺標題 ' + hd);
  else if (i < last) fail('標題順序不對：' + hd);
  else last = i;
}
const section = hd => {
  const i = text.indexOf('\n' + hd);
  if (i < 0) return '';
  return text.slice(i + hd.length + 1).split(/\n## /)[0];
};

const concl = section(HEADS[0]);
if (!/建議起點[:：]\s*(19|20)\d\d/.test(concl)) fail('結論缺「建議起點：YYYY」');
if (!/建議布局[:：]/.test(concl)) fail('結論缺「建議布局：」');
if (concl.trim().split(/\r?\n/).filter(l => l.trim()).length > 8) fail('結論太長（非空白行最多 8 行）');

const MIN = { 1: 5, 2: 9, 3: 7, 4: 3, 5: 3 };
for (const [k, min] of Object.entries(MIN)) {
  const hd = HEADS[k], part = section(hd);
  // 以分隔列找表頭：分隔列的上一列是表頭
  const lines = part.split(/\r?\n/);
  const heads = new Set(lines.map((l, i) => (/^\|\s*:?-/.test(l) ? lines[i - 1] : null)).filter(Boolean));
  const data = lines.filter(l => /^\|/.test(l) && !/^\|\s*:?-/.test(l) && !heads.has(l)).map(l => l.split('|').slice(1, -1).map(c => c.trim()));
  if (data.length < min) fail(`${hd} 表格只有 ${data.length} 列資料，至少 ${min}`);
  data.forEach(r => {
    if (r.some(c => !c)) fail(`${hd}「${r[0]}」有空白格（查不到寫「待查」）`);
    if (!/https?:\/\//.test(r[r.length - 1])) fail(`${hd}「${r[0]}」最後一欄沒有來源網址`);
  });
}

const refs = new Set([...section(HEADS[7]).matchAll(/https?:\/\/[^\s)\]|>]+/g)].map(m => m[0]));
if (refs.size < 15) fail(`參考資料只有 ${refs.size} 個不同網址，至少 15`);
if (!/【一手】/.test(text) || !/【推論】/.test(text)) fail('沒有用【一手】／【二手】／【推論】標示數字');

console.log(bad ? `check-r14 FAIL（${bad} 項）` : 'check-r14 OK');
process.exit(bad ? 1 : 0);
