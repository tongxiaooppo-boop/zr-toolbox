// ㉕ 正2 回本計算機。預期值由 Opus 用 Python 獨立重算（與 R7 第二、三節表格一致），外包不得改預期值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { recoverPlan, indexNeed, hitProb, normCdf, VOL_PRESETS, DEFAULT_FEE, SHOCK, PROB_YEARS } from '../js/core/recover.js';

const close = (a, e, eps = 1e-9) => assert.ok(Math.abs(a - e) < eps, `${a} != ${e}`);
const closeAll = (a, e, eps) => { assert.equal(a.length, e.length); a.forEach((x, i) => close(x, e[i], eps)); };

test('recover ㉕: constants', () => {
  assert.deepEqual(VOL_PRESETS.map(v => v.sigma), [0.15, 0.22, 0.30]);
  assert.equal(DEFAULT_FEE, 0.011); assert.equal(SHOCK, 0.2); assert.deepEqual(PROB_YEARS, [1, 2, 3, 5, 10]);
});

test('recover ㉕: normCdf matches known values within 1e-7', () => {
  close(normCdf(0), 0.5, 1e-7); close(normCdf(1.96), 0.9750021048517796, 1e-7);
  close(normCdf(-1), 0.15865525393145713, 1e-7); close(normCdf(0.5), 0.691462461274013, 1e-7);
});

test('recover ㉕: R7 §2.2 table — index needed for loss 40/50/60%, sigma 25%', () => {
  const rows = [ // [loss, 正2要漲, 簡單×2, 最佳, σ25% 1年無費用, σ25% 2年無費用, σ25% 2年含1.1%]
    [0.4, 0.6666666666666667, 0.33333333333333337, 0.2909944487358056, 0.33197501160110576, 0.3742564371729815, 0.38945670619242123],
    [0.5, 1, 0.5, 0.41421356237309515, 0.45910551977426217, 0.5054225008726463, 0.5220735613168344],
    [0.6, 1.5, 0.75, 0.5811388300841898, 0.6313295642802068, 0.6831135234044867, 0.7017299749298178]
  ];
  for (const [L, g, naive, best, v1, v2, full2] of rows) {
    const r = recoverPlan({ mode: 'pct', loss: L, sigma: 0.25, years: 2, fee: 0.011 });
    close(r.zrGain, g); close(r.index.naive, naive); close(r.index.best, best); close(r.index.vol, v2); close(r.index.full, full2);
    close(indexNeed(g, { sigma: 0.25, years: 1 }), v1);
    assert.equal(r.recoverPrice, null); assert.equal(r.invested, null); assert.equal(r.avg, null); assert.equal(r.prob, null);
  }
});

test('recover ㉕: price mode with shares — cost 40, now 24, 1000 shares, average down to +30% (R7 §3.1)', () => {
  const r = recoverPlan({ mode: 'price', cost: 40, now: 24, shares: 1000, sigma: 0.22, years: 2, target: 0.3 });
  close(r.loss, 0.4); assert.equal(r.recoverPrice, 40); assert.equal(r.invested, 40000); assert.equal(r.lossAmount, 16000);
  close(r.index.full, 0.3700028387017986); close(r.stay.indexFull, r.index.full);
  const a = r.avg;
  close(a.addRatio, 1.2222222222222223); close(a.addPct, 0.7333333333333334); // 加碼約原投入的 73%
  assert.equal(a.addShares, 1223); assert.equal(a.addMoney, 29352); close(a.newCost, 31.2);
  close(a.indexBest, 0.14017542509913805); close(a.indexFull, 0.20995374576046077);
  close(r.stay.shockLoss, 0.216); close(a.shockLoss, 0.48); close(r.swap.shockLoss, 0.12); // 再跌 20%：不動虧原投入 21.6%、攤平 48%、0050 12%
  close(r.swap.indexNeed, 0.6666666666666667);
});

test('recover ㉕: average-down targets 50% and 20% (R7 §3.1)', () => {
  const r50 = recoverPlan({ mode: 'pct', loss: 0.4, sigma: 0, years: 0, target: 0.5 });
  close(r50.avg.addRatio, 1 / 3); close(r50.avg.addPct, 0.2); close(r50.avg.indexBest, 0.22474487139158894);
  assert.equal(r50.avg.addShares, null); assert.equal(r50.avg.addMoney, null); assert.equal(r50.avg.newCost, null);
  const r20 = recoverPlan({ mode: 'pct', loss: 0.4, sigma: 0, years: 0, target: 0.2 });
  close(r20.avg.addRatio, 2.333333333333334); close(r20.avg.addPct, 1.4); close(r20.avg.indexBest, 0.09544511501033215);
  close(r20.index.full, r20.index.best); // 波動 0、年數 0 就是最佳情況
});

test('recover ㉕: probabilities — loss 40%, mu 8%, sigma 22%, fee 1.1% (R7 §3.3 + swap/avg)', () => {
  const r = recoverPlan({ mode: 'pct', loss: 0.4, sigma: 0.22, years: 2, mu: 0.08, target: 0.3 });
  assert.deepEqual(r.prob.years, [1, 2, 3, 5, 10]);
  closeAll(r.prob.stay, [0.2807943740760243, 0.4694215574535293, 0.5720555849402972, 0.6847810696286827, 0.804771218197376], 1e-6);
  closeAll(r.prob.avg, [0.5898498660491426, 0.7198135238116949, 0.7803216280135943, 0.8420249293037582, 0.9040222446701234], 1e-6);
  closeAll(r.prob.swap, [0.03555511455450974, 0.17350011359274436, 0.3056579229363935, 0.49469542541194483, 0.729112867416761], 1e-6);
  const noAvg = recoverPlan({ mode: 'pct', loss: 0.4, sigma: 0.22, years: 2, mu: 0.08 });
  assert.equal(noAvg.prob.avg, null);
});

test('recover ㉕: R7 §3.3 table rows (2/5/10 years, rounded to 0.1%)', () => {
  const rows = [[0.4, 0.06, [42.5, 62.3, 73.6]], [0.5, 0.06, [27.7, 50.2, 64.5]], [0.5, 0.08, [31.7, 57.2, 72.9]], [0.5, 0.1, [36.0, 64.0, 80.3]], [0.6, 0.08, [17.9, 44.2, 63.5]]];
  for (const [L, mu, exp] of rows) {
    const p = recoverPlan({ mode: 'pct', loss: L, sigma: 0.22, years: 1, mu }).prob.stay;
    assert.deepEqual([p[1], p[3], p[4]].map(x => Math.round(x * 1000) / 10), exp, `loss ${L} mu ${mu}`);
  }
});

test('recover ㉕: hitProb edge cases', () => {
  assert.equal(hitProb({ target: 0, drift: 0.05, vol: 0.2, years: 1 }), 1);
  assert.equal(hitProb({ target: 0.1, drift: 0.05, vol: 0.2, years: 0 }), 0);
  assert.equal(hitProb({ target: 0.1, drift: 0.05, vol: 0, years: 2 }), 1);  // 0.05×2 ≥ 0.1
  assert.equal(hitProb({ target: 0.1, drift: 0.05, vol: 0, years: 1 }), 0);
  assert.equal(hitProb({ target: 0.1, drift: -0.05, vol: 0, years: 10 }), 0);
});

test('recover ㉕: blank optional fields (NaN) are ignored', () => {
  const r = recoverPlan({ mode: 'price', cost: 40, now: 24, shares: NaN, sigma: 0.22, years: 2, mu: NaN, target: NaN });
  assert.equal(r.invested, null); assert.equal(r.lossAmount, null); assert.equal(r.avg, null); assert.equal(r.prob, null);
  close(r.index.full, 0.3700028387017986);
});

test('recover ㉕: invalid inputs throw', () => {
  const base = { sigma: 0.22, years: 2 };
  assert.throws(() => recoverPlan({ ...base, mode: 'price', cost: 20, now: 24 }), /已經回本/);
  assert.throws(() => recoverPlan({ ...base, mode: 'price', cost: 40, now: 0 }), /現價/);
  assert.throws(() => recoverPlan({ ...base, mode: 'price', cost: 40, now: 24, shares: 1.5 }), /股數/);
  assert.throws(() => recoverPlan({ ...base, mode: 'pct', loss: 1 }), /虧損/);
  assert.throws(() => recoverPlan({ ...base, mode: 'pct', loss: 0 }), /虧損/);
  assert.throws(() => recoverPlan({ ...base, mode: 'x', loss: 0.4 }), /請選擇/);
  assert.throws(() => recoverPlan({ mode: 'pct', loss: 0.4, sigma: 1.2, years: 2 }), /波動/);
  assert.throws(() => recoverPlan({ mode: 'pct', loss: 0.4, sigma: 0.2, years: 31 }), /年數/);
  assert.throws(() => recoverPlan({ ...base, mode: 'pct', loss: 0.4, fee: 0.2 }), /內扣/);
  assert.throws(() => recoverPlan({ ...base, mode: 'pct', loss: 0.4, mu: 0.8 }), /每年報酬/);
  assert.throws(() => recoverPlan({ ...base, mode: 'pct', loss: 0.4, target: 0.7 }), /攤平/);  // 要漲 66.7%，目標不能更大
  assert.throws(() => recoverPlan({ ...base, mode: 'pct', loss: 0.4, target: 0 }), /攤平/);
});
