// ⑪ 正二要買多少。兩種測試：
//   1. 鎖定值：預期數字由 Opus 手算（研究 O 的 A–D 四組＋頁面範例＋決策要求的 B ≥ 2 組），外包不得改預期值。
//   2. 比對：同一組輸入丟給線上版原始碼（tests/fixtures/online-calc.js 用假 DOM 執行）與 balancePlan，格式化後逐欄相等。
import test from 'node:test';
import assert from 'node:assert/strict';
import { balancePlan, checkBalanceRows } from '../js/core/balance.js';
import { runOnline, fmt, pct, x2 } from './fixtures/online-calc.js';

const close = (a, e, eps = 1e-6) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
// 研究 O 的持股：0050 每股 100、00685L 每股 20
const s0050 = shares => ({ code: '0050', shares, price: 100, beta: 1 });
const l685 = shares => ({ code: '00685L', shares, price: 20, beta: 2 });
const A = { stocks: [s0050(100000)], levers: [l685(0)], cash: 2000000, debt: 3000000, target: 1.4, minCash: 0, basis: 'net', allowBorrow: false };

test('balance ⑪ page example (O-A): 10m stock, 2m cash, 3m debt, target 1.4 net → buy 1.3m, 0.7m cash left', () => {
  const r = balancePlan(A);
  close(r.before.A, 12000000); close(r.before.N, 9000000); close(r.D, 10000000); close(r.bw, 2);
  close(r.X, 1300000); close(r.delta, 1300000); close(r.cashAfter, 700000); assert.equal(r.borrow, 0);
  assert.equal(r.enough, true); assert.equal(r.reached, true);
  close(r.before.bN, 10 / 9); close(r.after.bN, 1.4); close(r.after.bA, 1.05);
  close(r.after.debtRatio, .25); close(r.after.lev, 12 / 9); close(r.after.expNet, 11.3 / 9);
  close(r.rows[0].shares, 65000); // 1,300,000 ÷ 20
});
test('balance ⑪ O-B: existing 200k leveraged ETF, no debt, target 1.2 → target 1.92m, buy 1.72m', () => {
  const r = balancePlan({ ...A, stocks: [s0050(60000)], levers: [l685(10000)], debt: 0, target: 1.2 });
  close(r.before.N, 8200000); close(r.X, 1920000); close(r.delta, 1720000); close(r.cashAfter, 280000);
  close(r.after.bN, 1.2); close(r.after.bA, 1.2); assert.equal(r.reached, true);
});
test('balance ⑪ O-C: asset basis with borrowing → 6,666,667 leveraged ETF, borrow 4,666,667, net basis 2.59', () => {
  const r = balancePlan({ ...A, basis: 'asset', allowBorrow: true });
  close(r.X, 20000000 / 3, 1e-4); close(r.borrow, 14000000 / 3, 1e-4); close(r.cashAfter, 0, 1e-4); close(r.debtAfter, 23000000 / 3, 1e-4);
  close(r.after.A, 50000000 / 3, 1e-4); close(r.after.bA, 1.4); close(r.after.bN, 70 / 27);
  assert.equal(r.enough, true); assert.equal(r.reached, true); assert.equal(r.borrowCantReach, false); assert.deepEqual(r.notes, ['borrow']);
});
test('balance ⑪ O-D: stock exposure already above target → leveraged ETF capped at 0, enough money but target not reached', () => {
  const r = balancePlan({ ...A, cash: 0, debt: 0, target: .8 });
  assert.equal(r.X, 0); assert.equal(r.capped, true); assert.equal(r.enough, true); assert.equal(r.reached, false);
  close(r.achieved, 1); assert.deepEqual(r.notes, ['capped']);
});
test('balance ⑪: target ≥ leveraged beta on asset basis — borrowing is computed but cannot reach the target (spec gap)', () => {
  const r = balancePlan({ ...A, stocks: [s0050(100000)], cash: 1000000, debt: 0, target: 2.5, basis: 'asset', allowBorrow: true });
  close(r.X, 8750000); close(r.borrow, 7750000); close(r.cashAfter, 0);
  close(r.after.bA, 27.5 / 18.75); close(r.after.bN, 2.5); // 總資產口徑只到 1.47 倍
  assert.equal(r.enough, true); assert.equal(r.reached, false); assert.equal(r.borrowCantReach, true);
});
test('balance ⑪: not enough cash and borrowing not allowed → shortage 1.1m, after-values assume buying in full', () => {
  const r = balancePlan({ ...A, target: 1.8 });
  close(r.X, 3100000); assert.equal(r.enough, false); assert.equal(r.reached, false);
  close(r.canBuy, 2000000); close(r.shortage, 1100000); close(r.cashAfter, -1100000); assert.deepEqual(r.notes, ['short']);
});
test('balance ⑪: minimum cash reduces what can be spent', () => {
  const r = balancePlan({ ...A, minCash: 1000000 });
  assert.equal(r.enough, false); close(r.canBuy, 1000000); close(r.shortage, 300000);
});
test('balance ⑪: full rebalance 60/40 → stocks target 9m, sell 4.6m of 0050 and buy 3.6m of 00685L', () => {
  const r = balancePlan({ ...A, stocks: [{ ...s0050(100000), weight: 60 }], levers: [{ ...l685(0), weight: 40 }], fullRebalance: true });
  assert.equal(r.fullMode, true); assert.equal(r.label, '股票'); assert.equal(r.D, 0); close(r.bw, 1.4);
  close(r.X, 9000000); close(r.delta, -1000000); close(r.cashAfter, 3000000);
  close(r.rows[0].trade, -4600000); close(r.rows[0].shares, 46000); close(r.rows[1].trade, 3600000); close(r.rows[1].shares, 180000);
  close(r.after.bN, 1.4);
});
test('balance ⑪: stock weights are ignored unless full rebalance is switched on', () => {
  const r = balancePlan({ ...A, stocks: [{ ...s0050(100000), weight: 60 }] });
  assert.equal(r.fullMode, false); close(r.X, 1300000);
});
test('balance ⑪: two leveraged ETFs without weights split by current value; all zero → split evenly', () => {
  const two = [{ code: '00631L', shares: 1000, price: 200, beta: 2 }, l685(10000)];
  const r = balancePlan({ ...A, levers: two });
  close(r.before.N, 9400000); close(r.X, 1580000); close(r.L, 400000); // (1.4 × 9.4m − 10m) ÷ 2
  close(r.rows[0].trade, 590000); close(r.rows[0].shares, 2950); close(r.rows[1].shares, 29500); // 各調到 790k
  const z = balancePlan({ ...A, levers: [{ ...two[0], shares: 0 }, l685(0)] });
  close(z.rows[0].share, .5); close(z.rows[1].target, 650000);
});
test('balance ⑪: input errors name the holding; net basis with net assets ≤ 0 uses the online message', () => {
  assert.throws(() => balancePlan({ ...A, levers: [] }), /至少填一檔正二/);
  assert.throws(() => balancePlan({ ...A, levers: [l685(0), l685(0), l685(0), l685(0)] }), /最多 3 檔/);
  assert.throws(() => balancePlan({ ...A, stocks: [s0050(100000), { code: '2330', shares: 10, price: 0 }] }), /持股第 2 檔的現價/);
  assert.throws(() => balancePlan({ ...A, debt: 20000000 }), /淨資產 ≤ 0，無法用淨資產口徑計算/);
  assert.throws(() => balancePlan({ ...A, fullRebalance: true }), /至少一檔填目標比重/);
});
test('balance ⑪: checkBalanceRows for wizard steps — totals, default beta, empty stocks allowed, levers need 1–3', () => {
  assert.deepEqual(checkBalanceRows([s0050(100000), { code: '2330', shares: 1000, price: 1000, beta: NaN }], 'stock'), { value: 11000000, exposure: 11000000 });
  assert.deepEqual(checkBalanceRows([{ code: '00685L', shares: 1000, price: 20, beta: NaN }], 'lever'), { value: 20000, exposure: 40000 });
  assert.deepEqual(checkBalanceRows([], 'stock'), { value: 0, exposure: 0 });
  assert.throws(() => checkBalanceRows([], 'lever'), /至少填一檔正二/);
  assert.throws(() => checkBalanceRows([{ code: '0050', shares: -1, price: 100 }], 'stock'), /持股第 1 檔的股數不能是負的/);
});

// ---------- 與線上版同輸入同輸出 ----------
function same(input) {
  const o = runOnline(input);
  const r = balancePlan({ ...input, fullRebalance: (input.stocks ?? []).some(s => s.weight > 0) });
  const tag = JSON.stringify(input);
  assert.equal(o.label, r.label, tag); assert.equal(o.X, fmt(r.X), tag); assert.equal(o.L, fmt(r.L), tag);
  assert.equal(o.action, r.delta >= 0 ? '需買進' : '需賣出', tag); assert.equal(o.delta, fmt(Math.abs(r.delta)), tag);
  assert.equal(o.D, r.fullMode ? null : fmt(r.D), tag); assert.equal(o.targetExposure, fmt(r.targetExposure), tag);
  assert.equal(o.bw, x2(r.bw), tag); assert.equal(o.cashAfter, fmt(r.cashAfter), tag); assert.equal(o.ok, r.enough, tag);
  assert.deepEqual(o.detail, r.rows.map(x => ({ code: x.code, target: fmt(x.target), side: x.trade >= 0 ? '買' : '賣', amount: fmt(Math.abs(x.trade)),
    shares: Number.isFinite(x.shares) ? fmt(x.shares) : null })), tag);
  const b = r.before, a = r.after;
  assert.deepEqual(o.compare, {
    '總資產': [fmt(b.A), fmt(a.A)], '淨資產': [fmt(b.N), fmt(a.N)], '負債比': [pct(b.debtRatio), pct(a.debtRatio)],
    '資產槓桿比': [x2(b.lev), x2(a.lev)], '股票市值曝險': [fmt(b.stocks), fmt(a.stocks)], '股票曝險／淨資產': [pct(b.expNet), pct(a.expNet)],
    '資產口徑 Beta': [x2(b.bA), x2(a.bA)], '淨資產口徑 Beta': [x2(b.bN), x2(a.bN)], '現金': [fmt(b.cash), fmt(a.cash)]
  }, tag);
  const kinds = { full: '完整重配模式', capped: '正二目標設為 0', borrow: '需新增借款', short: '現金不足（' };
  assert.deepEqual(o.notes.map(t => Object.keys(kinds).find(k => t.includes(kinds[k]))), r.notes, tag);
}

test('balance ⑪ matches the online calc(): research O cases A–D and the page example', () => {
  same(A);
  same({ ...A, stocks: [s0050(60000)], levers: [l685(10000)], debt: 0, target: 1.2 });
  same({ ...A, basis: 'asset', allowBorrow: true });
  same({ ...A, cash: 0, debt: 0, target: .8 });
});
test('balance ⑪ matches the online calc(): shortage, minimum cash, borrowing on net basis, target ≥ 2 on asset basis', () => {
  same({ ...A, target: 1.8 });
  same({ ...A, minCash: 1000000 });
  same({ ...A, target: 1.8, allowBorrow: true });
  same({ ...A, cash: 1000000, debt: 0, target: 2.5, basis: 'asset', allowBorrow: true });
  same({ ...A, cash: 1000000, debt: 0, target: 2.5, basis: 'asset', allowBorrow: false });
  same({ ...A, levers: [l685(200000)], target: 1.1 }); // 要賣正二
});
test('balance ⑪ matches the online calc(): full rebalance, multiple leveraged ETFs with and without weights, default betas, no stocks', () => {
  same({ ...A, stocks: [{ ...s0050(100000), weight: 60 }], levers: [{ ...l685(0), weight: 40 }] });
  same({ ...A, stocks: [{ ...s0050(100000), weight: 50 }, { code: '2330', shares: 1000, price: 1000, beta: 1.2 }], levers: [l685(5000)] });
  const two = [{ code: '00631L', shares: 1000, price: 200, beta: 2 }, l685(10000)];
  same({ ...A, levers: two });
  same({ ...A, levers: [{ ...two[0], weight: 70 }, { ...l685(10000), weight: 30 }], basis: 'asset' });
  same({ ...A, levers: [{ ...two[0], shares: 0 }, l685(0), { code: '00663L', shares: 0, price: 50, beta: 2 }] });
  same({ ...A, stocks: [{ code: '0050', shares: 100000, price: 100, beta: NaN }], levers: [{ code: '00685L', shares: 0, price: 20, beta: NaN }] });
  same({ ...A, stocks: [], cash: 5000000, debt: 0, target: 1 });
  same({ ...A, stocks: [{ code: '00632R', shares: 100000, price: 10, beta: -1 }, s0050(50000)], target: 1.2 });
});
