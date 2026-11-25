// 白話化改寫的護欄（Opus 寫，外包不准改）。用法：node scripts/check-plain.mjs js/data/loans.js [更多檔]
// 跟 git HEAD 版比：匯出名稱、物件鍵、陣列長度、非字串值都要一樣；每個字串裡的數字（多重集合）與網址要一樣；
// 鍵名是 id／url／href／tools／src 的值不准改。只准改字串的說法。
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, basename } from 'node:path';

const files = process.argv.slice(2);
if (!files.length) { console.log('用法：node scripts/check-plain.mjs <js/data/檔案>...'); process.exit(1); }
let bad = 0;
const fail = m => { if (bad < 60) console.log('FAIL ' + m); bad++; };
const nums = s => (s.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(n => n.replace(/,/g, '')).sort().join(' ');
const urls = s => (s.match(/https?:\/\/[^\s'"`）)]+/g) || []).sort().join(' ');
const FIXED = new Set(['id', 'url', 'href', 'tools', 'src', 'step', 'no', 'term', 'aka', 'related']);
const fixedTop = k => k === 'FIGURE_TEXT' || k.endsWith('_REFS'); // 圖上文字要和圖一致；參考資料名稱照原站
const BANNED = ['回測', '保證獲利', '穩賺', '親～', '寶寶', '😀'];

function walk(a, b, path, fixed) {
  if (typeof a === 'string') {
    if (typeof b !== 'string') return fail(`${path} 型別變了`);
    if (fixed && a !== b) return fail(`${path} 不准改（${a} → ${b}）`);
    if (nums(a) !== nums(b)) fail(`${path} 數字變了：「${nums(a)}」→「${nums(b)}」`);
    if (urls(a) !== urls(b)) fail(`${path} 網址變了`);
    for (const w of BANNED) if (b.includes(w) && !a.includes(w)) fail(`${path} 出現「${w}」`);
    if (/[\u{1F300}-\u{1FAFF}]/u.test(b)) fail(`${path} 不准用 emoji`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return fail(`${path} 陣列長度變了（${a.length} → ${b?.length}）`);
    return a.forEach((x, i) => walk(x, b[i], `${path}[${i}]`, fixed));
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return fail(`${path} 型別變了`);
    const ka = Object.keys(a).join(','), kb = Object.keys(b).join(',');
    if (ka !== kb) return fail(`${path} 鍵變了：${ka} → ${kb}`);
    for (const k of Object.keys(a)) walk(a[k], b[k], `${path}.${k}`, fixed || FIXED.has(k));
    return;
  }
  if (a !== b && !(Number.isNaN(a) && Number.isNaN(b))) fail(`${path} 值變了（${a} → ${b}）`);
}

const tmp = resolve('collab/tmp-plain-check-' + process.pid);
mkdirSync(tmp, { recursive: true });
let changed = 0;
try {
  for (const f of files) {
    const old = execFileSync('git', ['show', `HEAD:${f}`], { encoding: 'utf8' });
    const oldPath = resolve(tmp, basename(f, '.js') + '.old.mjs');
    writeFileSync(oldPath, old);
    const A = await import(pathToFileURL(oldPath).href);
    const B = await import(pathToFileURL(resolve(f)).href + '?t=' + Date.now());
    if (Object.keys(A).join(',') !== Object.keys(B).join(',')) fail(`${f} 匯出名稱變了`);
    for (const k of Object.keys(A)) walk(A[k], B[k], `${basename(f)}:${k}`, fixedTop(k));
    const strs = o => typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(strs) : [];
    const sa = strs(A), sb = strs(B);
    changed += sa.filter((s, i) => s !== sb[i]).length;
  }
} finally { rmSync(tmp, { recursive: true, force: true }); }
console.log(bad ? `check-plain FAIL ${bad}` : `check-plain OK（${files.length} 檔，改寫 ${changed} 段）`);
process.exit(bad ? 1 : 0);
