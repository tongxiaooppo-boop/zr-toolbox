// PWA：每頁都掛 manifest 與 pwa.js；sw 預快取的檔案都存在；manifest 圖示存在。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { precacheList, siteVersion } from '../scripts/gen-precache.mjs';

const pages = ['index.html', ...readdirSync('tools').filter(f => f.endsWith('.html')).map(f => 'tools/' + f)];
test('pwa: every page links the manifest and loads pwa.js', () => {
  for (const p of pages) {
    const s = readFileSync(p, 'utf8'), up = p.startsWith('tools/') ? '../' : '';
    assert.ok(s.includes(`<link rel="manifest" href="${up}manifest.webmanifest">`), p + ' manifest');
    assert.ok(s.includes(`<script type="module" src="${up}js/pwa.js"></script>`), p + ' pwa.js');
  }
});
test('pwa: sw precaches the whole site and VERSION is current (run node scripts/gen-precache.mjs)', () => {
  const sw = readFileSync('sw.js', 'utf8');
  const list = JSON.parse(sw.match(/const PRECACHE = (\[[^\]]*\])/)[1]);
  assert.deepEqual(list, ['./', ...precacheList()], 'PRECACHE 和網站檔案不一致');
  assert.equal(sw.match(/const VERSION = '([^']*)'/)[1], siteVersion(), 'VERSION 過期');
  for (const f of ['index.html', 'tools/cost.html', 'js/core/cost.js', 'css/app.css']) assert.ok(list.includes(f), f);
  for (const i of JSON.parse(readFileSync('manifest.webmanifest', 'utf8')).icons) assert.ok(existsSync(i.src), i.src);
});
