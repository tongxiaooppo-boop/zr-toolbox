// 頁面文案白話化的護欄（Opus 寫，外包不准改）。用法：node scripts/check-plain-pages.mjs js/pages/cost.js [更多檔]
// 跟 git HEAD 版比：
//  1. 程式骨架（字串以外的所有程式碼，去掉註解與空白）必須一模一樣。
//  2. 字串個數一樣；每個字串裡的英文識別字、數字（去千分位）、算式符號 % + − - × ÷ < > = ＝ 的多重集合一樣。
//  3. 沒有中文的字串、以及 alt／src／href／id／class／className／type／value／key／termId 後面的字串，不准改。
//  4. 不准出現禁用字、emoji。
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) { console.log('用法：node scripts/check-plain-pages.mjs <js/pages/檔案>...'); process.exit(1); }
let bad = 0;
const fail = m => { if (bad < 80) console.log('FAIL ' + m); bad++; };
const BANNED = ['回測', '保證獲利', '穩賺', '親～', '寶寶'];
const FIXED_KEY = /(?:^|[{,(\s])(alt|src|href|id|class|className|type|value|key|termId)\s*:\s*$/;
const CJK = /[㐀-鿿]/;

// 把原始碼拆成 { skel: 程式骨架, strs: [{ text, fixed }] }。樣板字串的每一段文字各算一個字串，${…} 內當程式碼。
function split(src) {
  let i = 0, skel = '';
  const strs = [];
  const prevSig = () => { const t = skel.replace(/\s+$/, ''); return t; };
  const regexOK = () => {
    const t = prevSig();
    if (!t) return true;
    if (/[(,=:[!&|?{};+\-*%<>~^]$/.test(t)) return true;
    return /\b(return|typeof|case|in|of|delete|void|throw|new)$/.test(t);
  };
  const push = (text, fixedByKey) => {
    strs.push({ text, fixed: fixedByKey || !CJK.test(text) });
    skel += 'S';
  };
  function code(stopAtBrace) {
    let depth = 0;
    while (i < src.length) {
      const c = src[i], d = src[i + 1];
      if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
      if (c === '\'' || c === '"') {
        const key = FIXED_KEY.test(skel);
        let j = i + 1, t = '';
        while (src[j] !== c) { if (src[j] === '\\') { t += src[j] + src[j + 1]; j += 2; } else t += src[j++]; }
        i = j + 1; push(t, key); continue;
      }
      if (c === '`') { i++; template(FIXED_KEY.test(skel)); continue; }
      if (c === '/' && regexOK()) {
        let j = i + 1, cls = false;
        while (j < src.length) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false;
          else if (src[j] === '/' && !cls) break;
          j++;
        }
        j++; while (/[a-z]/.test(src[j])) j++;
        skel += src.slice(i, j); i = j; continue;
      }
      if (stopAtBrace) {
        if (c === '{') depth++;
        if (c === '}') { if (depth === 0) { i++; return; } depth--; }
      }
      skel += c; i++;
    }
  }
  function template(key) {
    let t = '';
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') { t += c + src[i + 1]; i += 2; continue; }
      if (c === '`') { i++; push(t, key); return; }
      if (c === '$' && src[i + 1] === '{') { push(t, key); t = ''; i += 2; skel += '${'; code(true); skel += '}'; continue; }
      t += c; i++;
    }
  }
  code(false);
  return { skel: skel.replace(/\s+/g, ''), strs };
}

const sig = s => {
  const words = (s.match(/[A-Za-z_][A-Za-z0-9_-]*/g) || []);
  const nums = (s.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(n => n.replace(/,/g, ''));
  const ops = (s.match(/[%+−\-×÷<>=＝]/g) || []);
  return [...words, ...nums, ...ops].sort().join(' ');
};

let changed = 0, total = 0;
for (const arg of files) {
  const [f, alt] = arg.split('='); // 自我測試用：路徑=替代檔
  const A = split(execFileSync('git', ['show', `HEAD:${f}`], { encoding: 'utf8' }));
  const B = split(readFileSync(alt || f, 'utf8'));
  if (A.skel !== B.skel) {
    let k = 0; while (A.skel[k] === B.skel[k]) k++;
    fail(`${f} 程式骨架變了，第一個不同處：「${A.skel.slice(Math.max(0, k - 40), k + 40)}」→「${B.skel.slice(Math.max(0, k - 40), k + 40)}」`);
    continue;
  }
  if (A.strs.length !== B.strs.length) { fail(`${f} 字串個數變了（${A.strs.length} → ${B.strs.length}）`); continue; }
  A.strs.forEach((a, n) => {
    const b = B.strs[n].text;
    total++;
    if (a.text === b) return;
    changed++;
    const at = `${f} 第 ${n + 1} 個字串「${a.text.slice(0, 30)}」`;
    if (a.fixed) return fail(`${at} 不准改`);
    if (sig(a.text) !== sig(b)) fail(`${at} 英數字／數字／算式符號變了：「${sig(a.text)}」→「${sig(b)}」`);
    for (const w of BANNED) if (b.includes(w) && !a.text.includes(w)) fail(`${at} 出現「${w}」`);
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(b)) fail(`${at} 不准用 emoji`);
  });
}
console.log(bad ? `check-plain-pages FAIL ${bad}` : `check-plain-pages OK（${files.length} 檔，字串 ${total} 個，改寫 ${changed} 個）`);
