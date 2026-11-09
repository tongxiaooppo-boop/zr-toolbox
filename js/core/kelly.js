// 工具⑭：幾倍槓桿最划算（凱利）。v5.10，Opus 定，外包不得改簽名。
// 模型：大盤是幾何布朗運動、每天重新調整到固定倍數 L（就是正二這類每日槓桿 ETF 的理想化）。
//   輸入的「每年賺多少」是 1 倍的年化（幾何）報酬 g，換成連續算術漂移 μ＝ln(1+g)＋σ²/2。
//   L 倍的長期年化（對數）成長：
//     L ≤ 1（多出來的是現金，賺 cashRate）： ln(1+cashRate)   ＋ L(μ − ln(1+cashRate))   − L²σ²/2
//     L > 1（借錢的部分付 borrowRate）：     ln(1+borrowRate) ＋ L(μ − ln(1+borrowRate)) − L²σ²/2
//   兩段在 L＝1 接起來，都是 μ − σ²/2＝ln(1+g)。年化報酬＝e^成長 − 1。
//   凱利倍數＝讓長期成長最大的 L：借錢段 (μ − rb)/σ² ≥ 1 就取它；否則現金段 (μ − rc)/σ²，再夾在 [0, 1]。
//   腰斬機率（理論，時間無限長）：成長 ν > 0 時 0.5^(2ν ÷ (Lσ)²)；ν ≤ 0 時 1；L＝0 時 0。
// 簡化（頁面要註明）：報酬是常態且每年一樣、沒有內扣費用與追蹤誤差、借款利率固定、不會被追繳；
//   對「每年賺多少」「波動」兩個假設非常敏感。

const MAX_L = 5;

function check({ cagr1x, vol, borrowRate, cashRate = 0 }) {
  if (!(Number.isFinite(cagr1x) && cagr1x > -0.5 && cagr1x < 0.5)) throw new Error('大盤每年賺多少要在 −50% 到 50% 之間。');
  if (!(Number.isFinite(vol) && vol >= 0.01 && vol <= 1)) throw new Error('每年波動要在 1% 到 100% 之間。');
  if (!(Number.isFinite(borrowRate) && borrowRate >= 0 && borrowRate < 0.3)) throw new Error('借錢利率要在 0% 到 30% 之間。');
  if (!(Number.isFinite(cashRate) && cashRate >= 0 && cashRate <= borrowRate)) throw new Error('現金利率要在 0% 到借錢利率之間。');
}

/**
 * L 倍的長期年化報酬（模型見檔頭）。
 * @param {{cagr1x:number, vol:number, borrowRate:number, cashRate?:number}} a  都是小數（0.08＝8%）
 * @param {number} L 0 ≤ L ≤ 5
 * @returns {{L:number, growth:number, cagr:number, halveProb:number}}  growth 是連續（對數）成長率
 */
export function leveredGrowth(a, L) {
  check(a);
  if (!(Number.isFinite(L) && L >= 0 && L <= MAX_L)) throw new Error(`倍數要在 0 到 ${MAX_L} 之間。`);
  const s2 = a.vol * a.vol;
  const mu = Math.log1p(a.cagr1x) + s2 / 2;
  const r = Math.log1p(L > 1 ? a.borrowRate : (a.cashRate ?? 0));
  const growth = r + L * (mu - r) - L * L * s2 / 2;
  const halveProb = L === 0 ? 0 : growth > 0 ? 0.5 ** (2 * growth / (L * L * s2)) : 1;
  return { L, growth, cagr: Math.expm1(growth), halveProb };
}

/**
 * ⑭ 精靈：給大盤的假設 → 凱利倍數（全／半／四分之一）、常見倍數對照、長期年化對倍數的曲線。
 * @param {{cagr1x:number, vol:number, borrowRate:number, cashRate?:number, current?:number}} p
 *   cagr1x：1 倍（例 0050）每年平均賺多少，年化，−0.5 < x < 0.5
 *   vol：每年波動（標準差），0.01–1
 *   borrowRate：借錢的年利率 0 ≤ x < 0.3；cashRate：現金年利率（選填，預設 0），0 ≤ x ≤ borrowRate
 *   current：你現在幾倍（選填，0–5；留白傳 undefined 或 NaN）
 * @returns {{
 *   mu, full, half, quarter, maxCagr, breakEven,
 *   rows:{key:string, label:string, L:number, cagr:number, halveProb:number}[],
 *   curve:{L:number, cagr:number}[] }}
 *   full／half／quarter：凱利倍數與它的一半、四分之一（四捨五入前的原值，最多 5）。
 *   maxCagr：full 倍的年化報酬。
 *   breakEven：L > full 那一側，長期年化掉回 0 的倍數（超過就長期會虧）；超過 5 倍或不存在＝null。
 *   rows 依序：'cash' 0 倍、'one' 1 倍、'two' 2 倍、'quarter'、'half'、'full'，有填 current 再加 'current'（label 見程式）。
 *   curve：L＝0, 0.1, …, 4（41 點）。
 */
export function kellyPlan({ cagr1x, vol, borrowRate, cashRate = 0, current }) {
  const a = { cagr1x, vol, borrowRate, cashRate };
  check(a);
  const s2 = vol * vol;
  const mu = Math.log1p(cagr1x) + s2 / 2;
  const kb = (mu - Math.log1p(borrowRate)) / s2;
  const kc = (mu - Math.log1p(cashRate)) / s2;
  const full = Math.min(MAX_L, kb >= 1 ? kb : Math.max(0, Math.min(1, kc)));
  const g = L => leveredGrowth(a, L);

  // 成長＝0 的根（在 full 右邊）：先試借錢段，再試現金段。
  let breakEven = null;
  const root = r => { const b = mu - r; return (b + Math.sqrt(b * b + 2 * s2 * r)) / s2; };
  const rB = root(Math.log1p(borrowRate));
  if (rB > 1 && rB > full) breakEven = rB;
  else { const rC = root(Math.log1p(cashRate)); if (rC <= 1 && rC > full) breakEven = rC; }
  if (breakEven !== null && breakEven > MAX_L) breakEven = null;

  const row = (key, label, L) => ({ key, label, ...g(L) });
  const rows = [
    row('cash', '全部放現金（0 倍）', 0),
    row('one', '1 倍（例：全部買 0050）', 1),
    row('two', '2 倍（例：全部買正二）', 2),
    row('quarter', '四分之一凱利', full / 4),
    row('half', '半凱利', full / 2),
    row('full', '全凱利', full)
  ];
  if (current !== undefined && !Number.isNaN(current)) {
    if (!(Number.isFinite(current) && current >= 0 && current <= MAX_L)) throw new Error(`你現在的倍數要在 0 到 ${MAX_L} 之間。`);
    rows.push(row('current', '你現在', current));
  }
  const curve = Array.from({ length: 41 }, (_, i) => ({ L: i / 10, cagr: g(i / 10).cagr }));
  return { mu, full, half: full / 2, quarter: full / 4, maxCagr: g(full).cagr, breakEven, rows, curve };
}
