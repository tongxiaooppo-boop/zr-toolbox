// 冒煙測試：起靜態伺服器＋無頭 Chrome，檢查首頁與每個 status:'ready' 的工具頁。
// 每頁檢查：無 JS 例外；至少一張圖解且都載入成功；有「帶入範例」鈕的頁面按下後 .result 有內容且不是錯誤；main 最後一個元素是 .disclaimer。
// 用法：npm run smoke（需要本機 Chrome 或 Edge；暫存 profile 放在 .smoke/，已 gitignore）
import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../js/data/tools.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[\\/]+/, '');
  try { const body = await readFile(join(ROOT, path || 'index.html')); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const exe = BROWSERS.find(existsSync);
if (!exe) { console.error('找不到 Chrome／Edge'); process.exit(2); }
const profile = join(ROOT, '.smoke');
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(exe, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

let ws, id = 0; const pending = {}, errors = [];
for (let i = 0; i < 40 && !ws; i++) {
  try { const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const page = tabs.find(t => t.type === 'page'); if (page) ws = new WebSocket(page.webSocketDebuggerUrl); }
  catch { await sleep(250); }
}
await new Promise(r => ws.onopen = r);
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m);
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result?.value;
await send('Runtime.enable'); await send('Page.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

const results = [];
async function check(name, url, fn) {
  errors.length = 0;
  await send('Page.navigate', { url: base + url }); await sleep(1200);
  const problems = await fn();
  if (errors.length) problems.push('JS 例外：' + errors.join(' | '));
  const scroll = await ev('document.documentElement.scrollWidth > window.innerWidth');
  if (scroll) problems.push('手機寬度出現水平捲動');
  results.push({ name, ok: problems.length === 0, problems });
}
await check('home', 'index.html', async () => {
  const p = [], cards = await ev('document.querySelectorAll(".tool-card").length');
  if (cards !== TOOLS.length) p.push(`卡片 ${cards} 張，應為 ${TOOLS.length}`);
  return p;
});
for (const t of TOOLS.filter(t => t.status === 'ready')) await check(t.id, t.href, async () => {
  const p = [];
  if (!await ev('document.querySelector("main > :last-child")?.classList.contains("disclaimer")')) p.push('main 最後一個元素不是 .disclaimer');
  await ev('Promise.all([...document.querySelectorAll(".figure img")].map(i => (i.loading = "eager", i.decode().catch(() => {}))))'); await sleep(300);
  const figs = await ev('[...document.querySelectorAll(".figure img")].map(i => i.naturalWidth > 0)');
  if (!figs.length) p.push('沒有圖解（.figure）');
  else if (figs.includes(false)) p.push('有圖解載入失敗');
  if (await ev('!!document.querySelector(".example-row button")')) {
    await ev('document.querySelector(".example-row button").click()'); await sleep(300);
    const text = await ev('document.querySelector(".result")?.innerText.trim()');
    if (!text) p.push('帶入範例後 .result 沒有內容');
    if (await ev('document.querySelector(".result")?.classList.contains("error")')) p.push('帶入範例後出現錯誤：' + text);
  }
  return p;
});

ws.close(); chrome.kill(); server.close();
await sleep(500); await rm(profile, { recursive: true, force: true }).catch(() => {});
for (const r of results) console.log(`${r.ok ? '✔' : '✖'} smoke ${r.name}${r.ok ? '' : '：' + r.problems.join('；')}`);
const failed = results.filter(r => !r.ok).length;
console.log(`smoke pages ${results.length} pass ${results.length - failed} fail ${failed}`);
process.exit(failed ? 1 : 0);
