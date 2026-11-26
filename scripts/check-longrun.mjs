// ㉚ 正2 上市以來 頁面驗收（Opus 寫，外包不准改）。用法：node scripts/check-longrun.mjs
import { readFileSync, existsSync } from 'node:fs';
import { TOOLS } from '../js/data/tools.js';

let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const read = p => existsSync(p) ? readFileSync(p, 'utf8') : (fail('缺 ' + p), '');

const html = read('tools/longrun.html');
if (html) {
  if (!html.includes('<title>正2 上市以來，每年變多少｜股票兩三件事</title>')) fail('longrun.html 的 <title> 要是「正2 上市以來，每年變多少｜股票兩三件事」');
  for (const k of ['../js/pages/longrun.js', '../js/pwa.js', '#1f3a68']) if (!html.includes(k)) fail(`longrun.html 要有 ${k}`);
}
const page = read('js/pages/longrun.js');
if (page) {
  for (const k of ["'../data/longrun.js'", 'toolHeader(', 'lineChart(', 'log', "disclaimer('general')", 'figure(', 'yearcheck.html', 'type: \'checkbox\'', 'yc-table', 'yc-stack'])
    if (!page.includes(k)) fail(`js/pages/longrun.js 要用 ${k}`);
  for (const w of ['回測', '保證', '穩賺', '一定會'])
    if (page.includes(w)) fail(`頁面不准出現「${w}」`);
  if (/\d+\.\d+\s*%|\d{1,3},\d{3},\d{3}/.test(page.replace(/0\.1425%|0\.1%/g, ''))) fail('頁面不准寫死報酬率或金額，數字一律從 LONGRUN 算');
  if (/\b(2016|2025)-\d\d-\d\d\b/.test(page)) fail('日期從 LONGRUN.start／asOf／splits 讀，不要寫死');
}
const yc = read('js/pages/yearcheck.js');
if (yc && !yc.includes('longrun.html')) fail('㉘ yearcheck.js 要加一句連到 ㉚ longrun.html');
if (TOOLS.find(t => t.id === 'longrun')?.status !== 'ready') fail("tools.js 的 longrun 要改成 status: 'ready'");
if (!existsSync('img/longrun')) fail('缺 img/longrun/');
console.log(bad ? `check-longrun FAIL ${bad}` : 'check-longrun OK');
