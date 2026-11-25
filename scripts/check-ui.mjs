// 驗收 UI 統一美化（Neo-brutalism；2026-11-25 v2 改喜慶紅金配色）的機械條件（Opus 寫，Codex 不准改）。用法：node scripts/check-ui.mjs
import { readFileSync, readdirSync } from 'node:fs';

const css = readFileSync('css/app.css', 'utf8');
const comp = readFileSync('js/ui/components.js', 'utf8');
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const need = (re, m) => { if (!re.test(css)) fail(m); };

need(/--bg:\s*#fff3e0/i, '淺色 --bg 要是 #fff3e0（暖杏）');
need(/--accent:\s*#ffb703/i, '淺色 --accent 要是 #ffb703（金）');
need(/--festive:\s*#d62839/i, '淺色 --festive 要是 #d62839（喜慶紅）');
need(/--festive:\s*#ff6b6b/i, '深色 --festive 要是 #ff6b6b');
need(/\.hero\b/, '要有 .hero（首頁主圖）樣式');
if (/#ff5a36|#ff7a59/i.test(css)) fail('還留著舊橘紅 accent #ff5a36／#ff7a59');
need(/--shadow:\s*5px 5px 0/, '要有 --shadow: 5px 5px 0 …');
need(/--bw:\s*3px/, '要有 --bw: 3px');
need(/prefers-color-scheme:\s*dark/, '要有深色模式');
need(/:root\[data-theme="?dark"?\]/, '要有 :root[data-theme=dark]');
need(/\.explain:has\(\.metric\.ok\)/, '結果卡要依 tone 填色（.explain:has(.metric.ok)）');
need(/\.explain:has\(\.metric\.info\)/, 'tone info 要有樣式');
need(/\.refs\b/, '要有 .refs（參考資料）樣式');
need(/\.compare-wrap\b/, '要有 .compare-wrap（寬比較表）樣式');
need(/\.article\b/, '要有 .article（科普長文）樣式');
need(/prefers-reduced-motion/, '按鈕位移動畫要尊重 prefers-reduced-motion');
if (/https?:\/\//.test(css)) fail('app.css 不准引用外部網址（含 Google Fonts），離線要能用');
if (/#2563eb|#6ea0ff/i.test(css)) fail('還留著舊藍色 accent');
const home = readFileSync('js/pages/home.js', 'utf8');
if (!home.includes('img/home/hero.webp')) fail('首頁要放 img/home/hero.webp');
if (/class: 'no'/.test(home)) fail('首頁卡片不顯示編號');
for (const [p, f] of [['js/pages/dca.js', 'img/dca/joy.webp'], ['js/pages/retire.js', 'img/retire/joy.webp']]) {
  if (!readFileSync(p, 'utf8').includes(f)) fail(p + ' 要放 ' + f);
}
if (!/export function references\(/.test(comp)) fail('components.js 要有 export function references(');
for (const f of ['index.html', ...readdirSafe()]) {
  const s = readFileSync(f, 'utf8');
  if (/fonts\.googleapis|fonts\.gstatic/.test(s)) fail(`${f} 不准載入 Google Fonts`);
}
function readdirSafe() {
  return readdirSync('tools').filter(f => f.endsWith('.html')).map(f => 'tools/' + f);
}

console.log(bad ? `NG ${bad}` : 'OK');
process.exit(bad ? 1 : 0);
