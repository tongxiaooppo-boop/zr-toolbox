// 工具⑪「正二要買多少」（v5.5）：朋友計算機線上版 https://tongxiaooppo-boop.github.io/zr-calc/ 的 calc()／snap() 純函式移植。
// 出處：使用者以手機版 Claude 依計算模板（docs/research/來源/O-08_原始規格：正二平衡計算器模板.md）製作，後續小改。
// 算法照抄、不改（決策 2026-11-09-朋友計算機收錄）；tests/balance.test.js 直接執行線上版原始碼比對同輸入同輸出。
// 與線上版的差異只有三處，都不改數字：
//   1. 完整重配由 fullRebalance 開關決定（線上版是「一般持股任一檔填了比重」就觸發）；關閉時一般持股的 weight 不用。
//   2. 輸入檢查（線上版把空白和亂填都當 0）：錯誤訊息標明第幾檔，頁面直接顯示。
//   3. 多回傳判讀欄位：enough（錢夠不夠＝線上版「是否可執行」）、reached（有沒有真的達到目標）、capped、borrowCantReach。
//
// balancePlan({ stocks, levers, cash, debt, target, minCash, basis, allowBorrow, fullRebalance })
//   stocks：一般持股（可為空陣列）[{ code, shares, price, beta, weight }]；beta 空白（NaN）＝1
//   levers：正二 1–3 檔，同欄位；beta 空白＝2
//     weight：目標比重「%數字」（例 60），空白／NaN／負數＝0；正二在非完整重配時決定買賣金額怎麼分
//   cash、debt、minCash：元（minCash 空白當 0 由頁面處理）；target：目標 Beta（例 1.4）
//   basis：'net'（淨資產口徑）｜'asset'（總資產口徑）；allowBorrow：現金不足時可新增借款
// 回傳：
//   { fullMode, label('正二'|'股票'), S, D, L, LB, bw, bwDefaulted, base, targetExposure,
//     X, delta, available, canBuy, shortage, borrow, cashAfter, debtAfter,
//     before, after（snap：{A, N, stocks, cash, debt, exposure, debtRatio, lev, expNet, bA, bN}）,
//     rows[{ code, price, value, beta, share(分配比例 0–1), target, trade(+買/−賣), shares(約略股數；現價 0 → NaN) }],
//     achieved（你選的口徑平衡後 Beta）, enough, reached, capped, borrowCantReach, notes[] }
//   notes：'full'｜'capped'｜'borrow'｜'short'（線上版提醒的種類，頁面自己寫文字）
//   enough＝false 時，after 是「假設錢夠買足」的數字（現金可能變負），跟線上版一樣。

const isNum = v => typeof v === 'number' && Number.isFinite(v);

function readRows(list, kind) {
  const name = kind === 'lever' ? '正二' : '持股';
  const defBeta = kind === 'lever' ? 2 : 1;
  return list.map((r, i) => {
    const n = `${kind === 'lever' ? '正二' : '持股'}第 ${i + 1} 檔`;
    const shares = isNum(r.shares) ? r.shares : 0, price = isNum(r.price) ? r.price : 0;
    if (shares < 0) throw new Error(`${n}的股數不能是負的。`);
    if (price < 0) throw new Error(`${n}的現價不能是負的。`);
    if (shares > 0 && !(price > 0)) throw new Error(`${n}的現價要大於 0；抓不到股價就手動填。`);
    if (r.beta != null && !Number.isNaN(r.beta) && !isNum(r.beta)) throw new Error(`${n}的 Beta 要是數字，例：1。`);
    const w = isNum(r.weight) ? Math.max(r.weight, 0) : 0;
    return { code: String(r.code ?? '').trim().toUpperCase() || name, price, v: shares * price,
      b: isNum(r.beta) ? r.beta : defBeta, w };
  });
}

/**
 * 精靈步驟 1、2 用：只檢查持股列（錯誤訊息同 balancePlan），回傳 { value, exposure }（市值合計、Beta 曝險合計）。
 * kind：'stock'（可為空）｜'lever'（1–3 檔）
 */
export function checkBalanceRows(list, kind) {
  if (!Array.isArray(list)) throw new Error('請提供持股清單。');
  if (kind === 'lever' && !list.length) throw new Error('請至少填一檔正二（還沒買就股數填 0）。');
  if (kind === 'lever' && list.length > 3) throw new Error('正二最多 3 檔。');
  const rows = readRows(list, kind);
  return { value: rows.reduce((a, r) => a + r.v, 0), exposure: rows.reduce((a, r) => a + r.v * r.b, 0) };
}

/** 線上版 snap()；多回傳 debt、exposure */
export function balanceSnap(stocks, cash, debt, bexp) {
  const A = stocks + cash, N = A - debt;
  return {
    A, N, stocks, cash, debt, exposure: bexp,
    debtRatio: A > 0 ? debt / A : NaN,
    lev: N > 0 ? A / N : NaN,
    expNet: N > 0 ? stocks / N : NaN,
    bA: A > 0 ? bexp / A : NaN,
    bN: N > 0 ? bexp / N : NaN
  };
}

export function balancePlan({ stocks = [], levers, cash, debt, target, minCash = 0, basis = 'net', allowBorrow = false, fullRebalance = false }) {
  if (!Array.isArray(stocks)) throw new Error('請提供持股清單。');
  if (!Array.isArray(levers) || !levers.length) throw new Error('請至少填一檔正二（還沒買就股數填 0）。');
  if (levers.length > 3) throw new Error('正二最多 3 檔。');
  for (const [v, msg] of [[cash, '現金'], [debt, '借款'], [minCash, '最低保留現金']])
    if (!isNum(v) || v < 0) throw new Error(`${msg}要填 0 以上的數字。`);
  if (!isNum(target) || target < 0) throw new Error('目標倍數要填 0 以上的數字，例：1.4。');
  if (!['net', 'asset'].includes(basis)) throw new Error('請選擇倍數的算法（淨資產或總資產）。');

  const ord = readRows(stocks, 'stock'), levs = readRows(levers, 'lever');
  const fullMode = !!fullRebalance;
  if (fullMode && !ord.concat(levs).some(r => r.w > 0)) throw new Error('完整重配要替至少一檔填目標比重；只想調正二就把「完整重配」關掉。');

  // ---- 以下照抄線上版 calc() ----
  const adj = fullMode ? ord.concat(levs) : levs;
  const S = fullMode ? 0 : ord.reduce((a, o) => a + o.v, 0);
  const D = fullMode ? 0 : ord.reduce((a, o) => a + o.v * o.b, 0);
  const label = fullMode ? '股票' : '正二';
  const L = adj.reduce((a, l) => a + l.v, 0);
  const LB = adj.reduce((a, l) => a + l.v * l.b, 0);
  const wsum = adj.reduce((a, l) => a + l.w, 0);
  adj.forEach(l => { l.tw = wsum > 0 ? l.w / wsum : (L > 0 ? l.v / L : 1 / adj.length); });
  let bw = adj.reduce((a, l) => a + l.tw * l.b, 0), bwDefaulted = false;
  if (!(bw > 0)) { bw = 2; bwDefaulted = true; }

  const B = target;
  const before = balanceSnap(S + L, cash, debt, D + LB);
  const { A, N } = before;
  if (basis === 'net' && N <= 0) throw new Error('淨資產 ≤ 0，無法用淨資產口徑計算，請檢查輸入。');
  if (basis === 'asset' && A <= 0) throw new Error('總資產 ≤ 0，請檢查輸入。');

  const notes = [];
  if (fullMode) notes.push('full');
  const base = basis === 'net' ? N : A;
  let X = (B * base - D) / bw, capped = false;
  if (X < 0) { X = 0; capped = true; notes.push('capped'); }

  let delta = X - L;
  const available = cash - minCash;
  let borrow = 0, enough = true;
  if (delta > available) {
    if (allowBorrow) {
      if (basis === 'asset' && bw > B) {
        const X1 = (B * (A - L - available) - D) / (bw - B);
        if (X1 > X) { X = X1; delta = X - L; }
      }
      borrow = delta - available;
      notes.push('borrow');
    } else {
      enough = false;
      notes.push('short');
    }
  }
  const cashAfter = cash - delta + borrow, debtAfter = debt + borrow;
  const after = balanceSnap(S + X, cashAfter, debtAfter, D + X * bw);
  // ---- 照抄結束 ----

  const rows = adj.map(l => {
    const t = X * l.tw, trade = t - l.v;
    return { code: l.code, price: l.price, value: l.v, beta: l.b, share: l.tw, target: t, trade, shares: l.price > 0 ? Math.abs(trade) / l.price : NaN };
  });
  const achieved = basis === 'net' ? after.bN : after.bA;
  const reached = enough && isNum(achieved) && Math.abs(achieved - B) < 1e-6;
  return {
    fullMode, label, S, D, L, LB, bw, bwDefaulted, base, targetExposure: B * base,
    X, delta, available, canBuy: Math.max(available, 0), shortage: enough ? 0 : delta - available,
    borrow, cashAfter, debtAfter, before, after, rows, achieved, enough, reached, capped,
    borrowCantReach: basis === 'asset' && borrow > 0 && !reached, notes
  };
}
