// 資料清單一致性：卡片連結存在、術語都有定義、辭典欄位齊全。
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TOOLS, SHORTCUTS, GROUPS } from '../js/data/tools.js';
import { GLOSSARY, TERM_BY_ID } from '../js/data/glossary.js';
import { GUIDE_SECTIONS, DIFFERENCES, TOKEN_GUIDE, ONLINE_URL } from '../js/data/calcGuide.js';

const root = fileURLToPath(new URL('..', import.meta.url));

test('tools: ids unique and every ready tool has its html and page script', () => {
  assert.equal(new Set(TOOLS.map(t => t.id)).size, TOOLS.length);
  for (const t of TOOLS) assert.ok(GROUPS.some(g => g.id === t.group), `${t.id} group`);
  for (const t of TOOLS.filter(t => t.status === 'ready')) {
    assert.ok(existsSync(root + t.href), t.href);
    assert.ok(existsSync(root + 'js/pages/' + t.id + '.js'), t.id);
    assert.ok(existsSync(root + 'img/' + t.id), `${t.id} 缺圖解資料夾 img/${t.id}/`);
  }
});
test('tools: every term used by a tool exists in the glossary', () => {
  for (const t of TOOLS) for (const id of t.terms) assert.ok(TERM_BY_ID[id], `${t.id} → ${id}`);
  for (const s of SHORTCUTS) assert.ok(TOOLS.some(t => t.id === s.toolId), s.toolId);
});
test('glossary: entries complete, plain line ≤ 40 chars, related ids exist', () => {
  assert.equal(new Set(GLOSSARY.map(t => t.id)).size, GLOSSARY.length);
  for (const t of GLOSSARY) {
    assert.match(t.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, t.id);
    for (const k of ['term', 'plain', 'detail', 'example']) assert.ok(typeof t[k] === 'string' && t[k].length > 0, `${t.id}.${k}`);
    assert.ok([...t.plain].length <= 40, `${t.id}.plain 超過 40 字`);
    assert.ok(t.example.startsWith('例：'), `${t.id}.example 要以「例：」開頭`);
    assert.ok(Array.isArray(t.aka) && Array.isArray(t.related));
    for (const r of t.related) assert.ok(TERM_BY_ID[r], `${t.id} related → ${r}`);
  }
});
// Gate 1 驗收：辭典必須收齊這些詞。Gate 1 完成時把 todo 拿掉。
const REQUIRED = ['beta', 'exposure', 'net-assets', 'basis', 'leverage-ratio', 'rebalance', 'daily-2x', 'base-price',
  'volatility-decay', 'tracking-error', 'premium-discount', 'maintenance-ratio', 'margin-call', 'pledge',
  'drawdown', 'recovery-gain', 'closing-price', 'finmind-token'];
test('glossary: required terms for v1 are present', () => {
  for (const id of REQUIRED) assert.ok(TERM_BY_ID[id], id);
});

test('calc guide ①: every online field documented, terms exist, token guide complete', () => {
  const names = GUIDE_SECTIONS.flatMap(s => s.fields.map(f => f.name));
  for (const n of ['代號／名稱', '股數', '現價', 'Beta', '目標比重 %（選填）', '現金合計', '負債合計', '目標組合 Beta（B）',
    '最低保留現金', 'Beta 口徑', '允許新增借款（現金不足時）', '填入範例', '清空', '更新股價', 'FinMind Token（選填）']) assert.ok(names.includes(n), n);
  for (const s of GUIDE_SECTIONS) { assert.ok(s.id && s.title && s.intro, s.id); for (const f of s.fields) { assert.ok(f.what, f.name); if (f.termId) assert.ok(TERM_BY_ID[f.termId], f.termId); } }
  assert.equal(DIFFERENCES.length, 4);
  assert.equal(TOKEN_GUIDE.steps.length, 4); assert.equal(TOKEN_GUIDE.errors.length, 3);
  assert.ok(ONLINE_URL.startsWith('https://'));
});
