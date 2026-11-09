// 驗收科普第一批（⑳ ETF 入門、㉑ 借錢投資的管道、㉒ 商品與賺錢方式）的機械條件（Opus 寫，Codex 不准改）。
// 用法：node scripts/check-kepu.mjs
// 檢查：資料檔欄位齊全與筆數、百分比數字都能在研究報告找到、網址都在研究報告裡、頁面用了規定的元件與圖、卡通 PNG 已產生。
import { readFileSync, existsSync } from 'node:fs';
import { TOOLS } from '../js/data/tools.js';

let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const toolIds = new Set(TOOLS.map(t => t.id));
const norm = s => s.replace(/[，,\s]/g, '').replace(/％/g, '%');
const str = (v, where) => { if (typeof v !== 'string' || !v.trim()) fail(`${where} 要是非空字串`); };

async function load(path) {
  if (!existsSync(path)) { fail(`缺 ${path}`); return null; }
  return import('../' + path);
}

// 百分比數字與網址都要出自研究報告（避免憑印象寫數字、或引用沒查過的網站）
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

function refs(list, where) {
  if (!Array.isArray(list) || list.length < 3) { fail(`${where} 至少 3 筆參考資料`); return; }
  list.forEach((r, i) => { str(r.name, `${where}[${i}].name`); if (!/^https:\/\//.test(r.url || '')) fail(`${where}[${i}].url 要 https://`); });
}
function sources(list, where) {
  if (!Array.isArray(list) || !list.length) { fail(`${where}.sources 至少 1 筆`); return; }
  list.forEach((r, i) => { str(r.name, `${where}.sources[${i}].name`); if (!/^https:\/\//.test(r.url || '')) fail(`${where}.sources[${i}].url 要 https://`); });
}
function tools(list, where) {
  if (!Array.isArray(list)) { fail(`${where}.tools 要是陣列（沒有就 []）`); return; }
  for (const id of list) if (!toolIds.has(id)) fail(`${where}.tools：${id} 不是 tools.js 的 id`);
}

// ⑳ ETF 入門
const etf = await load('js/data/etf101.js');
let etfTopics = 0;
if (etf) {
  if (!Array.isArray(etf.ETF_SECTIONS) || etf.ETF_SECTIONS.length < 5) fail('ETF_SECTIONS 至少 5 節');
  for (const [i, s] of (etf.ETF_SECTIONS || []).entries()) {
    str(s.id, `ETF_SECTIONS[${i}].id`); str(s.title, `ETF_SECTIONS[${i}].title`); str(s.intro, `ETF_SECTIONS[${i}].intro`);
    for (const [j, t] of (s.topics || []).entries()) {
      const w = `ETF_SECTIONS[${i}].topics[${j}]`;
      for (const k of ['title', 'text', 'myth', 'fact']) str(t[k], `${w}.${k}`);
      tools(t.tools, w);
      etfTopics++;
    }
  }
  if (etfTopics < 34) fail(`ETF 主題 ${etfTopics} 個，至少 34（R3 共 37 列，最多合併 3 個）`);
  refs(etf.ETF_REFS, 'ETF_REFS');
}

// ㉑ 借錢投資的管道
const loans = await load('js/data/loans.js');
const LOAN_FIELDS = ['id', 'name', 'group', 'who', 'how', 'rate', 'amount', 'term', 'call', 'worst', 'forStock'];
if (loans) {
  const groups = new Set((loans.LOAN_GROUPS || []).map(g => g.id));
  for (const g of ['stock', 'asset', 'none', 'other']) if (!groups.has(g)) fail(`LOAN_GROUPS 缺 ${g}`);
  for (const [i, g] of (loans.LOAN_GROUPS || []).entries()) { str(g.title, `LOAN_GROUPS[${i}].title`); str(g.line, `LOAN_GROUPS[${i}].line`); }
  const rows = loans.LOANS || [];
  if (rows.length < 28) fail(`LOANS ${rows.length} 列，R4 有 28 列要全收`);
  if (rows.filter(r => r.main === true).length !== 14) fail('LOANS 裡 main:true 要剛好 14 列（任務書第 3 節的清單）');
  if (new Set(rows.map(r => r.id)).size !== rows.length) fail('LOANS id 重複');
  for (const r of rows) {
    const w = `LOANS ${r.id || r.name}`;
    for (const k of LOAN_FIELDS) str(r[k], `${w}.${k}`);
    if (!groups.has(r.group)) fail(`${w}.group ${r.group} 不在 LOAN_GROUPS`);
    tools(r.tools, w); sources(r.sources, w);
  }
  if ((loans.LOAN_MYTHS || []).length < 12) fail('LOAN_MYTHS 至少 12 條（R4 新手常見誤解全收）');
  for (const [i, m] of (loans.LOAN_MYTHS || []).entries()) { str(m.myth, `LOAN_MYTHS[${i}].myth`); str(m.fact, `LOAN_MYTHS[${i}].fact`); }
  if ((loans.LOAN_OPEN || []).length < 1) fail('LOAN_OPEN 至少 1 條（R4 待查與矛盾，白話）');
  refs(loans.LOAN_REFS, 'LOAN_REFS');
}

// ㉒ 商品與賺錢方式
const prod = await load('js/data/products.js');
const PROD_FIELDS = ['id', 'name', 'plain', 'how', 'earn', 'lose', 'cost', 'level'];
if (prod) {
  const levels = (prod.LEVELS || []).map(l => l.id).join(',');
  if (levels !== 'ok,careful,no') fail('LEVELS 要依序 ok、careful、no');
  for (const [i, l] of (prod.LEVELS || []).entries()) { str(l.title, `LEVELS[${i}].title`); str(l.line, `LEVELS[${i}].line`); }
  const rows = prod.PRODUCTS || [];
  if (rows.length !== 20) fail(`PRODUCTS ${rows.length} 列，要 20 列（R5 商品表全收）`);
  const count = lv => rows.filter(r => r.level === lv).length;
  if (count('ok') !== 2 || count('careful') !== 9 || count('no') !== 9) fail(`PRODUCTS 等級數 ok/careful/no＝${count('ok')}/${count('careful')}/${count('no')}，要照 R5「適合新手嗎」＝2/9/9`);
  for (const r of rows) { const w = `PRODUCTS ${r.id || r.name}`; for (const k of PROD_FIELDS) str(r[k], `${w}.${k}`); tools(r.tools, w); sources(r.sources, w); }
  if ((prod.WAYS || []).length !== 7) fail('WAYS 要 7 種（R5 獲利方式全收）');
  for (const [i, x] of (prod.WAYS || []).entries()) for (const k of ['name', 'plain', 'products', 'cost']) str(x[k], `WAYS[${i}].${k}`);
  refs(prod.PRODUCT_REFS, 'PRODUCT_REFS');
}

const t1 = traceable('js/data/etf101.js', ['docs/research/R3-ETF常識.md']);
const t2 = traceable('js/data/loans.js', ['docs/research/R4-個人借錢管道.md']);
const t3 = traceable('js/data/products.js', ['docs/research/R5-商品與獲利方式.md']);

// 頁面與 html
for (const id of ['etf101', 'loans', 'products']) {
  const page = `js/pages/${id}.js`, html = `tools/${id}.html`;
  if (!existsSync(page)) { fail(`缺 ${page}`); continue; }
  const s = readFileSync(page, 'utf8');
  for (const fn of ['references', 'figure', 'disclaimer', 'toolHeader']) if (!new RegExp('\\b' + fn + '\\b').test(s)) fail(`${page} 沒用 ${fn}`);
  if (/innerHTML|insertAdjacentHTML|outerHTML/.test(s)) fail(`${page} 不准用 innerHTML`);
  if (!s.includes(`../img/${id}/comic.webp`)) fail(`${page} 要放 ../img/${id}/comic.webp`);
  if (!s.includes(`../img/${id}/map.webp`)) fail(`${page} 要放 ../img/${id}/map.webp`);
  if (!/class:\s*'[^']*\barticle\b/.test(s)) fail(`${page} 要用 .article`);
  if (id === 'loans' && !/compare-wrap/.test(s)) fail(`${page} 比較表要包在 .compare-wrap`);
  if (/\d+(?:\.\d+)?\s*%/.test(s)) fail(`${page} 頁面程式不准寫死百分比數字，數字放資料檔`);
  if (!existsSync(html)) fail(`缺 ${html}`);
  else { const x = readFileSync(html, 'utf8'); if (!x.includes(`../js/pages/${id}.js`) || !x.includes('../js/pwa.js')) fail(`${html} 要載入 ../js/pages/${id}.js 和 ../js/pwa.js`); }
  for (const f of ['comic', 'map']) if (!existsSync(`docs/figures/cartoon/out/${id}-${f}.png`)) fail(`缺卡通圖 docs/figures/cartoon/out/${id}-${f}.png`);
}

console.log(`ETF 主題 ${etfTopics}；借錢管道 ${loans?.LOANS?.length ?? 0} 列（main ${loans?.LOANS?.filter(r => r.main).length ?? 0}）；商品 ${prod?.PRODUCTS?.length ?? 0}、賺錢方式 ${prod?.WAYS?.length ?? 0}；百分比 ${[t1, t2, t3].map(t => t?.pcts ?? 0).join('/')}；網址 ${[t1, t2, t3].map(t => t?.urls ?? 0).join('/')}`);
console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
