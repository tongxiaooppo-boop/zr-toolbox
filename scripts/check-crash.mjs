// 驗收 ㉙ 股災與心態頁的機械條件（Opus 寫，外包不准改）。用法：node scripts/check-crash.mjs
// 檢查：資料檔欄位與筆數、名稱照 R8 順序、數字都出自 R8、正2 欄不寫價格、1990 低點不寫日期、
// 禁用字、工具 id 存在、頁面用規定元件、tools.js 已 ready。
import { readFileSync, existsSync } from 'node:fs';
import { TOOLS } from '../js/data/tools.js';

let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const ids = new Set(TOOLS.map(t => t.id));
const norm = s => s.replace(/[，,\s]/g, '').replace(/％/g, '%');
const str = (v, w) => { if (typeof v !== 'string' || !v.trim()) fail(`${w} 要是非空字串`); };
const R8 = ['docs/research/R8-股災史.md', 'docs/research/R8-投資心態.md'];
const r8text = R8.map(p => readFileSync(p, 'utf8')).join('\n');
const research = norm(r8text);

// R8 表格第 1 欄（照順序）
function firstCol(file, section) {
  const part = readFileSync(file, 'utf8').split(section)[1].split(/\n## /)[0];
  return part.split(/\r?\n/).filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .map(l => l.split('|')[1].trim()).slice(1);
}
const crashNames = firstCol(R8[0], '## 股災表');
const mindNames = firstCol(R8[1], '## 心態表');
const checkNames = firstCol(R8[1], '## 股災時檢查清單');

const dataPath = 'js/data/crash.js';
if (!existsSync(dataPath)) { console.log(`FAIL 缺 ${dataPath}\ncheck-crash FAIL 1`); process.exit(1); }
const d = await import('../' + dataPath);
const src = readFileSync(dataPath, 'utf8');

const strs = (a, w, min) => { if (!Array.isArray(a) || a.length < min) fail(`${w} 至少 ${min} 段`); else a.forEach((s, i) => str(s, `${w}[${i}]`)); };
const toolList = (a, w) => { if (!Array.isArray(a)) fail(`${w}.tools 要是陣列（沒有就 []）`); else for (const id of a) if (!ids.has(id)) fail(`${w}.tools：${id} 不是 tools.js 的 id`); };

strs(d.CRASH_INTRO, 'CRASH_INTRO', 2);
strs(d.ZR_LESSON, 'ZR_LESSON', 2);
strs(d.CRASH_LIMITS, 'CRASH_LIMITS', 3);

// 股災表：12 列，名稱與順序照 R8
const C = d.CRASHES || [];
if (JSON.stringify(C.map(c => c.name)) !== JSON.stringify(crashNames)) fail(`CRASHES 名稱／順序要照 R8 股災表：${crashNames.join('、')}`);
C.forEach((c, i) => {
  const w = `CRASHES[${i}]（${c.name}）`;
  for (const k of ['name', 'period', 'tw', 'us', 'recover', 'zr', 'cause', 'lesson']) str(c[k], `${w}.${k}`);
  for (const k of ['twPct', 'zrPct']) {
    const v = c[k];
    if (v !== null && !(typeof v === 'number' && v > 0 && v < 100)) fail(`${w}.${k} 要是正數跌幅（例 58.3）或 null`);
    const text = k === 'twPct' ? c.tw : c.zr;
    if (typeof v === 'number' && !norm(text || '').includes(String(v) + '%')) fail(`${w}.${k}=${v} 要和文字欄的跌幅一致`);
  }
  // 正2 欄只寫跌幅％、日期、時間長度，不寫價格（00631L 價格是分割前原價）
  const zrLeft = (c.zr || '').replace(/\d{4}-\d{2}-\d{2}/g, '').replace(/\d+(?:\.\d+)?\s*[%％]/g, '');
  if (/\d+\.\d+/.test(zrLeft)) fail(`${w}.zr 不准寫價格（只寫跌幅％）：${c.zr}`);
});
const c1990 = C.find(c => /1990/.test(c.name));
if (c1990 && /1990-(0[3-9]|1[0-2])-\d{2}/.test(c1990.period + c1990.tw)) fail('1990 低點日期 R8 查不到，不准寫到「日」（寫「1990 年內最低收盤」）');
const c2022 = C.find(c => /2022/.test(c.name));
if (c2022 && !/2022-01-04/.test(c2022.period)) fail('2022 台股高點日期是 2022-01-04（Opus 已用 FinMind 核對）');
if (!C.some(c => typeof c.zrPct === 'number')) fail('至少要有一列 zrPct（長條圖用）');

// 心態表 16、檢查清單 10，名稱照 R8
const M = d.MINDSET || [];
if (JSON.stringify(M.map(m => m.name)) !== JSON.stringify(mindNames)) fail(`MINDSET 名稱／順序要照 R8 心態表：${mindNames.join('、')}`);
M.forEach((m, i) => { const w = `MINDSET[${i}]`; for (const k of ['name', 'what', 'example', 'action']) str(m[k], `${w}.${k}`); toolList(m.tools, w); });
const K = d.CHECKLIST || [];
if (JSON.stringify(K.map(k => k.item)) !== JSON.stringify(checkNames)) fail(`CHECKLIST item 名稱／順序要照 R8 檢查清單：${checkNames.join('、')}`);
K.forEach((k, i) => { const w = `CHECKLIST[${i}]`; for (const f of ['item', 'why']) str(k[f], `${w}.${f}`); toolList(k.tools, w); });
const kTools = new Set(K.flatMap(k => k.tools || []));
for (const id of ['exposure', 'lifelev', 'pledge', 'margin', 'decay', 'drawdown', 'avgcost', 'cost', 'loans']) if (!kTools.has(id)) fail(`CHECKLIST 要連到 ${id}（R8 對應工具欄有列）`);

// 參考資料
const refs = d.CRASH_REFS;
if (!Array.isArray(refs) || refs.length < 8) fail('CRASH_REFS 至少 8 筆');
else refs.forEach((r, i) => { str(r.name, `CRASH_REFS[${i}].name`); if (!/^https:\/\//.test(r.url || '')) fail(`CRASH_REFS[${i}].url 要 https://`); });

// 數字溯源：百分比、帶小數的點數、「約 N 年 M 個月」都要出自 R8；網址也是
const nums = new Set([...(src.match(/\d[\d,]*(?:\.\d+)?\s*[%％]/g) || []), ...(src.match(/\d[\d,]*\.\d+/g) || [])].map(norm));
for (const n of nums) if (!research.includes(n)) fail(`數字 ${n} 在 R8 找不到`);
for (const m of src.match(/約\s*\d+\s*年\s*\d+\s*個月/g) || []) if (!research.includes(norm(m))) fail(`「${m}」在 R8 找不到`);
for (const u of new Set(src.match(/https:\/\/[^\s'"`）)]+/g) || [])) if (!research.includes(norm(u))) fail(`網址 ${u} 不在 R8`);

// 禁用字（不給擇時／買賣建議、不保證回本、不用「回測」）
const pagePath = 'js/pages/crash.js';
const page = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
for (const bad of ['回測', '保證獲利', '穩賺', '一定會漲回', '一定會回來', '逢低加碼', '抄底', '危機入市', '跌就是買點'])
  if ((src + page).includes(bad)) fail(`不准出現「${bad}」`);

// 頁面
const html = existsSync('tools/crash.html') ? readFileSync('tools/crash.html', 'utf8') : '';
if (!html) fail('缺 tools/crash.html');
else {
  if (!html.includes('<title>股災與心態｜')) fail('crash.html 的 <title> 要是「股災與心態｜…」');
  if (!html.includes('../js/pages/crash.js')) fail('crash.html 要載入 ../js/pages/crash.js');
}
if (!page) fail(`缺 ${pagePath}`);
else {
  for (const k of ['toolHeader(', "pathNav('crash')", 'references(', "disclaimer('general')", "'../data/crash.js'"]) if (!page.includes(k)) fail(`${pagePath} 要用 ${k}`);
  for (const k of ['recover.html', 'drawdown.html', 'decay.html']) if (!page.includes(k) && !src.includes(k)) fail(`頁面要連到 ${k}`);
  if (/\d+\.\d+\s*%/.test(page)) fail(`${pagePath} 不准寫死數字，數字放資料檔`);
}
if (TOOLS.find(t => t.id === 'crash')?.status !== 'ready') fail("tools.js 的 crash 要改成 status: 'ready'");

finish();
function finish() {
  console.log(bad ? `check-crash FAIL ${bad}` : `check-crash OK（股災 ${C.length}、心態 ${M.length}、檢查清單 ${K.length}、數字 ${nums.size}、參考 ${refs.length}）`);
  process.exit(bad ? 1 : 0);
}
