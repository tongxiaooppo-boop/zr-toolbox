// 產生 sw.js 的預快取清單與版本（整站檔案內容的雜湊）。改了網站任何檔案後執行：node scripts/gen-precache.mjs
// 匯出 precacheList()／siteVersion() 給 tests/pwa.test.js 檢查清單與版本有沒有忘記更新。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT_FILES = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const DIRS = ['css', 'js', 'img', 'tools'];

function walk(dir) {
  return readdirSync(dir).flatMap(n => {
    const p = dir + '/' + n;
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

export function precacheList() {
  return [...ROOT_FILES, ...DIRS.flatMap(walk)].filter(f => !/\.md$/.test(f)).sort();
}

export function siteVersion(list = precacheList()) {
  const h = createHash('sha256');
  for (const f of list) { h.update(f + '\0'); h.update(readFileSync(f)); }
  return h.digest('hex').slice(0, 12);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const list = precacheList(), ver = siteVersion(list);
  const sw = readFileSync('sw.js', 'utf8')
    .replace(/const VERSION = '[^']*';/, `const VERSION = '${ver}';`)
    .replace(/const PRECACHE = \[[^\]]*\];/, `const PRECACHE = ${JSON.stringify(['./', ...list]).replace(/","/g, '",\n  "')};`);
  writeFileSync('sw.js', sw);
  console.log(`sw.js：${list.length} 個檔案，版本 ${ver}`);
}
