// 驗收科普第二批（㉓ 股票基本術語、㉔ 正二教學）的機械條件（Opus 寫，Codex 不准改）。
// 用法：node scripts/check-kepu2.mjs
// 檢查：資料檔欄位與筆數、R5 術語 48 個全收、大仁 50/50 與定期配比數字一字不差、
//       百分比與網址都出自研究報告、頁面用了規定的元件與圖、卡通 PNG 已產生。
import { readFileSync, existsSync } from 'node:fs';
import { TOOLS } from '../js/data/tools.js';

let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const toolIds = new Set(TOOLS.map(t => t.id));
const norm = s => s.replace(/[，,\s]/g, '').replace(/％/g, '%');
const str = (v, where) => { if (typeof v !== 'string' || !v.trim()) fail(`${where} 要是非空字串`); };
const tools = (list, where) => {
  if (!Array.isArray(list)) { fail(`${where}.tools 要是陣列（沒有就 []）`); return; }
  for (const id of list) if (!toolIds.has(id)) fail(`${where}.tools：${id} 不是 tools.js 的 id`);
};
const refs = (list, where) => {
  if (!Array.isArray(list) || list.length < 3) { fail(`${where} 至少 3 筆參考資料`); return; }
  list.forEach((r, i) => { str(r.name, `${where}[${i}].name`); if (!/^https:\/\//.test(r.url || '')) fail(`${where}[${i}].url 要 https://`); });
};
const same = (a, b, where) => { if (JSON.stringify(a) !== JSON.stringify(b)) fail(`${where} 要是 ${JSON.stringify(b)}，現在是 ${JSON.stringify(a)}`); };

async function load(path) {
  if (!existsSync(path)) { fail(`缺 ${path}`); return null; }
  return import('../' + path);
}
function traceable(dataPath, researchPaths) {
  if (!existsSync(dataPath)) return;
  const src = readFileSync(dataPath, 'utf8');
  const research = norm(researchPaths.map(p => readFileSync(p, 'utf8')).join('\n'));
  const pcts = new Set((src.match(/\d[\d,]*(?:\.\d+)?\s*[%％]/g) || []).map(norm));
  for (const p of pcts) if (!research.includes(p)) fail(`${dataPath}：數字 ${p} 在研究報告找不到`);
  const urls = new Set(src.match(/https:\/\/[^\s'"`）)]+/g) || []);
  for (const u of urls) if (!research.includes(norm(u))) fail(`${dataPath}：網址 ${u} 不在研究報告裡`);
  if (/http:\/\//.test(src)) fail(`${dataPath}：網址要用 https://`);
  if (/保證獲利|穩賺|穩定獲利/.test(src)) fail(`${dataPath}：不准出現「保證獲利」「穩賺」這類字`);
  return { pcts: pcts.size, urls: urls.size };
}

// ㉓ 股票基本術語：R5 術語表第一欄全部要出現（名稱一字不差）
const R5 = readFileSync('docs/research/R5-基本術語.md', 'utf8');
const r5Terms = [...R5.matchAll(/^\| ([^|]+?) \|/gm)].map(m => m[1]).filter(t => t !== '術語');
const BASIC_IDS = ['market', 'order', 'match', 'settle', 'company', 'fund'];
const basics = await load('js/data/basics.js');
let basicCount = 0;
if (basics) {
  same((basics.BASIC_SECTIONS || []).map(s => s.id), BASIC_IDS, 'BASIC_SECTIONS 的 id 順序');
  const names = [];
  for (const [i, s] of (basics.BASIC_SECTIONS || []).entries()) {
    str(s.title, `BASIC_SECTIONS[${i}].title`); str(s.intro, `BASIC_SECTIONS[${i}].intro`);
    for (const [j, t] of (s.terms || []).entries()) {
      const w = `BASIC_SECTIONS[${i}].terms[${j}]`;
      for (const k of ['id', 'term', 'plain', 'example', 'myth', 'fact']) str(t[k], `${w}.${k}`);
      if (typeof t.id === 'string' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) fail(`${w}.id 要英文小寫連字號`);
      tools(t.tools, w);
      names.push(t.term); basicCount++;
    }
  }
  const all = (basics.BASIC_SECTIONS || []).flatMap(s => s.terms || []);
  if (new Set(all.map(t => t.id)).size !== all.length) fail('術語 id 重複');
  if (r5Terms.length !== 48) fail(`R5 術語表讀到 ${r5Terms.length} 列，應為 48（研究檔被改了？）`);
  for (const t of r5Terms) if (!names.includes(t)) fail(`缺術語「${t}」（term 要和 R5 第一欄一字不差）`);
  for (const t of names) if (!r5Terms.includes(t)) fail(`多出 R5 沒有的術語「${t}」`);
  refs(basics.BASIC_REFS, 'BASIC_REFS');
  if (!Array.isArray(basics.BASIC_LIMITS) || !basics.BASIC_LIMITS.length) fail('BASIC_LIMITS 至少 1 句');
}

// ㉔ 正二教學
const ZR_IDS = ['what', 'daily', 'ways', 'dajen', 'risks', 'start'];
const zr = await load('js/data/zr101.js');
if (zr) {
  same((zr.ZR_SECTIONS || []).map(s => s.id), ZR_IDS, 'ZR_SECTIONS 的 id 順序');
  for (const [i, s] of (zr.ZR_SECTIONS || []).entries()) {
    str(s.title, `ZR_SECTIONS[${i}].title`); str(s.intro, `ZR_SECTIONS[${i}].intro`);
    if (!Array.isArray(s.blocks)) fail(`ZR_SECTIONS[${i}].blocks 要是陣列`);
    for (const [j, b] of (s.blocks || []).entries()) { str(b.title, `ZR_SECTIONS[${i}].blocks[${j}].title`); str(b.text, `ZR_SECTIONS[${i}].blocks[${j}].text`); tools(b.tools, `ZR_SECTIONS[${i}].blocks[${j}]`); }
  }
  const W = zr.ZR_WAYS || [];
  same(W.map(w => w.id), ['hold', 'dajen', 'periodic', 'target', 'borrow'], 'ZR_WAYS 的 id');
  same(W.map(w => w.tools), [['decay', 'drawdown'], ['trigger5050'], ['rebalance'], ['exposure'], ['pledge', 'margin', 'lifelev', 'kelly', 'loans']], 'ZR_WAYS 的 tools');
  W.forEach((w, i) => { str(w.name, `ZR_WAYS[${i}].name`); str(w.how, `ZR_WAYS[${i}].how`); });
  same((zr.ZR_MIXES || []).map(m => [m.name, m.after, m.total, m.target, m.action]), [
    ['60/40', '0／42／40', '82', '0／49.2／32.8', '買正二 7.2'],
    ['532', '42.5／21／20', '83.5', '41.75／25.05／16.7', '賣原型 0.75、買正二 4.05'],
    ['442', '34／28／20', '82', '32.8／32.8／16.4', '賣原型 1.2、買正二 4.8'],
    ['433', '34／21／30', '85', '34／25.5／25.5', '原型不動、買正二 4.5']
  ], 'ZR_MIXES（R6 第 2 節表格，一字不差）');
  const D = zr.DAJEN || {};
  same(D.period, '2014/10/31–2022/05/26', 'DAJEN.period');
  same(D.dates, ['2017/06/03', '2019/10/22', '2020/11/09', '2021/01/19'], 'DAJEN.dates');
  same(D.result5050, '255.3 萬（+155.37%）', 'DAJEN.result5050');
  same(D.result0050, '237.5 萬（+137.58%）', 'DAJEN.result0050');
  str(D.start, 'DAJEN.start'); str(D.rule, 'DAJEN.rule');
  if (!Array.isArray(D.limits) || D.limits.length < 4) fail('DAJEN.limits 至少 4 條（R6 第 3 節全部）');
  else if (!D.limits.some(t => t.includes('99.5') && t.includes('99.9'))) fail('DAJEN.limits 要寫出 99.5 萬與 99.9 萬不一致');
  same(D.source?.url, 'https://letf.com.tw/50正2槓桿etf搭配再平衡，輕鬆打敗0050/', 'DAJEN.source.url');
  const S = zr.ZR_STEPS || [];
  same(S.map(s => s.tools), [['etf101'], ['decay'], ['drawdown'], ['trigger5050', 'rebalance', 'exposure'], ['loans', 'pledge', 'lifelev', 'kelly']], 'ZR_STEPS 的 tools（R6 第 5 節順序）');
  S.forEach((s, i) => str(s.text, `ZR_STEPS[${i}].text`));
  refs(zr.ZR_REFS, 'ZR_REFS');
  if (!Array.isArray(zr.ZR_LIMITS) || !zr.ZR_LIMITS.length) fail('ZR_LIMITS 至少 1 句');
}

const t1 = traceable('js/data/basics.js', ['docs/research/R5-基本術語.md']);
const t2 = traceable('js/data/zr101.js', ['docs/research/R3-ETF常識.md', 'docs/research/R6-正二教學素材.md']);

// 頁面與 html
for (const id of ['basics', 'zr101']) {
  const page = `js/pages/${id}.js`, html = `tools/${id}.html`;
  if (!existsSync(page)) { fail(`缺 ${page}`); continue; }
  const s = readFileSync(page, 'utf8');
  for (const fn of ['references', 'figure', 'disclaimer', 'toolHeader']) if (!new RegExp('\\b' + fn + '\\b').test(s)) fail(`${page} 沒用 ${fn}`);
  if (/innerHTML|insertAdjacentHTML|outerHTML/.test(s)) fail(`${page} 不准用 innerHTML`);
  for (const f of ['comic', 'map']) if (!s.includes(`../img/${id}/${f}.webp`)) fail(`${page} 要放 ../img/${id}/${f}.webp`);
  if (!/class:\s*'[^']*\barticle\b/.test(s)) fail(`${page} 要用 .article`);
  if (/\d+(?:\.\d+)?\s*%/.test(s)) fail(`${page} 頁面程式不准寫死百分比數字，數字放資料檔`);
  if (id === 'basics' && !/type:\s*'search'/.test(s)) fail(`${page} 要有篩選框（type: 'search'）`);
  if (id === 'zr101') {
    if (!/compare-wrap/.test(s)) fail(`${page} 定期配比表要包在 .compare-wrap`);
    if (!s.includes('原作者回測，工具箱未重算')) fail(`${page} 大仁那節要標「原作者回測，工具箱未重算」`);
  }
  if (!existsSync(html)) fail(`缺 ${html}`);
  else { const x = readFileSync(html, 'utf8'); if (!x.includes(`../js/pages/${id}.js`) || !x.includes('../js/pwa.js')) fail(`${html} 要載入 ../js/pages/${id}.js 和 ../js/pwa.js`); }
  for (const f of ['comic', 'map']) if (!existsSync(`docs/figures/cartoon/out/${id}-${f}.png`)) fail(`缺卡通圖 docs/figures/cartoon/out/${id}-${f}.png`);
}
const etfPage = readFileSync('js/pages/etf101.js', 'utf8');
if (!etfPage.includes("'zr101.html'")) fail('js/pages/etf101.js 的 leveraged 節要加 ㉔ 正二教學連結');

console.log(`基本術語 ${basicCount}（R5 ${r5Terms.length}）；正二教學 ${zr?.ZR_SECTIONS?.length ?? 0} 節、做法 ${zr?.ZR_WAYS?.length ?? 0}、配比 ${zr?.ZR_MIXES?.length ?? 0}、路線 ${zr?.ZR_STEPS?.length ?? 0}；百分比 ${[t1, t2].map(t => t?.pcts ?? 0).join('/')}；網址 ${[t1, t2].map(t => t?.urls ?? 0).join('/')}`);
console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
