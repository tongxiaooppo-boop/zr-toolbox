// 工具⑯：股價估價（本益比、本淨比、殖利率）。v5.11，Opus 定，外包不得改簽名。
// 來源：R2-16 證交所（本益比＝收盤價÷近四季 EPS，EPS ≤ 0 不算；淨值比＝收盤價÷最近一季每股淨值；
//   殖利率＝每股股利÷收盤價，證交所的股利含股票股利）、R2-18 合理價（EPS×本益比、股利÷殖利率、淨值×淨值比）。
// 三個價格（便宜／合理／昂貴）的倍數一律由使用者自己填，或用這檔「自己過去幾年」的分位數（historyBands）；
//   不內建任何網站的經驗倍數（研究 R2-18 的判讀）。
// 單位：殖利率一律小數（0.04＝4%）；FinMind 原始資料的 dividend_yield 是百分比數字，只有 ratiosToBase／historyBands 會讀它。

export const METHODS = Object.freeze([
  { key: 'pe', label: '本益比法', base: 'eps', baseLabel: '每股盈餘（EPS）' },
  { key: 'pb', label: '本淨比法', base: 'bvps', baseLabel: '每股淨值' },
  { key: 'yield', label: '殖利率法', base: 'dividend', baseLabel: '每年每股股利' }
]);

export const ZONES = Object.freeze({
  'below-cheap': '便宜價以下',
  'cheap-fair': '便宜價到合理價之間',
  'fair-expensive': '合理價到昂貴價之間',
  'above-expensive': '昂貴價以上'
});

const pos = x => Number.isFinite(x) && x > 0;

/**
 * FinMind TaiwanStockPER 的一列（證交所每日本益比、淨值比、殖利率）換回每股數字。
 * @param {number} price 同一天的收盤價（> 0）
 * @param {{PER:number, PBR:number, dividend_yield:number}} row  PER／PBR 是倍數、dividend_yield 是百分比數字；0 表示沒有
 * @returns {{eps:number|null, bvps:number|null, dividend:number|null}}
 *   eps：PER > 0 才有（PER＝0 代表近四季 EPS ≤ 0 或沒有資料，例：ETF）；bvps：PBR > 0 才有；
 *   dividend：dividend_yield ≥ 0 就有（0＝沒配），缺欄位才 null。dividend 含股票股利（證交所口徑）。
 */
export function ratiosToBase(price, row = {}) {
  if (!pos(price)) throw new Error('現價要大於 0。');
  const y = row.dividend_yield;
  return {
    eps: pos(row.PER) ? price / row.PER : null,
    bvps: pos(row.PBR) ? price / row.PBR : null,
    dividend: Number.isFinite(y) && y >= 0 ? price * y / 100 : null
  };
}

/** 線性內插分位數（和試算表 PERCENTILE.INC 相同）。sorted 要先由小到大排好、至少 1 個。 */
export function percentile(sorted, q) {
  if (!sorted.length) throw new Error('沒有資料。');
  const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/**
 * 用這檔股票自己的歷史本益比／淨值比／殖利率，算出便宜／合理／昂貴的倍數（25／50／75 分位數）。
 * @param {{date:string, PER:number, PBR:number, dividend_yield:number}[]} rows FinMind TaiwanStockPER 原始列
 * @param {{minPoints?:number}} opt 有效資料少於 minPoints（預設 20）筆的方法回 null
 * @returns {{pe:number[]|null, pb:number[]|null, yields:number[]|null, n:{pe:number, pb:number, yields:number}, from:string, to:string}}
 *   pe／pb：[25 分位, 50 分位, 75 分位]（便宜→昂貴，越來越大）；只用 > 0 的值。
 *   yields：[75 分位, 50 分位, 25 分位]（便宜→昂貴，越來越小），已換成小數；只用 > 0 的值。
 *   from／to：rows 第一筆和最後一筆的 date（沒有資料是空字串）。
 */
export function historyBands(rows = [], { minPoints = 20 } = {}) {
  const pick = f => rows.map(f).filter(pos).sort((a, b) => a - b);
  const per = pick(r => r.PER), pbr = pick(r => r.PBR), dy = pick(r => r.dividend_yield / 100);
  const band = (v, qs) => v.length >= minPoints ? qs.map(q => percentile(v, q)) : null;
  return {
    pe: band(per, [0.25, 0.5, 0.75]),
    pb: band(pbr, [0.25, 0.5, 0.75]),
    yields: band(dy, [0.75, 0.5, 0.25]),
    n: { pe: per.length, pb: pbr.length, yields: dy.length },
    from: rows[0]?.date ?? '', to: rows[rows.length - 1]?.date ?? ''
  };
}

function zoneOf(price, [cheap, fair, expensive]) {
  if (price <= cheap) return 'below-cheap';
  if (price <= fair) return 'cheap-fair';
  if (price <= expensive) return 'fair-expensive';
  return 'above-expensive';
}

/**
 * ⑯ 精靈：三種方法各算便宜／合理／昂貴價，現價落在哪一區。
 * @param {{price:number, eps?:number, bvps?:number, dividend?:number, pe?:number[], pb?:number[], yields?:number[]}} p
 *   price：現價（> 0）
 *   eps：近四季（或你自己預估的）每股盈餘，可以 ≤ 0；bvps：每股淨值；dividend：每年每股股利（≥ 0）
 *   pe／pb：三個倍數 [便宜, 合理, 昂貴]，要 > 0 且由小到大
 *   yields：三個殖利率小數 [便宜, 合理, 昂貴]，要 > 0 且由大到小（殖利率越高，價格越便宜）
 *   某方法的每股數字（eps／bvps／dividend）沒填（undefined、null、NaN）＝這個方法不算；填了但倍數沒填三個 → 丟錯。
 * @returns {{price:number, methods:{key, label, baseLabel, ok:boolean, reason?:string, base:number,
 *   current?:number, multiples?:number[], prices?:{cheap:number, fair:number, expensive:number}, zone?:string, zoneLabel?:string}[]}}
 *   methods 依 METHODS 順序，只放有填每股數字的方法；全部沒填 → 丟錯。
 *   current：pe／pb 是現在倍數（price÷eps、price÷bvps），yield 是現在殖利率（dividend÷price，小數）。
 *   ok:false 的情況：pe 方法 eps ≤ 0（reason「EPS 是 0 或負的，本益比法不能用。」）、
 *     pb 方法 bvps ≤ 0（「每股淨值是 0 或負的，本淨比法不能用。」）、yield 方法 dividend＝0（「沒有配股利，殖利率法不能用。」）。
 *   zone：'below-cheap'｜'cheap-fair'｜'fair-expensive'｜'above-expensive'（剛好等於某個價格算在較便宜那一區）。
 */
export function valuationPlan({ price, eps, bvps, dividend, pe, pb, yields }) {
  if (!pos(price)) throw new Error('現價要大於 0。');
  const filled = v => v !== undefined && v !== null && !Number.isNaN(v);
  const input = { pe: [eps, pe], pb: [bvps, pb], yield: [dividend, yields] };
  const methods = [];
  for (const m of METHODS) {
    const [base, mult] = input[m.key];
    if (!filled(base)) continue;
    if (!Number.isFinite(base)) throw new Error(`${m.baseLabel}不是數字。`);
    const out = { key: m.key, label: m.label, baseLabel: m.baseLabel, base };
    if (m.key === 'yield' && base < 0) throw new Error('每股股利不能是負的。');
    if (!(Array.isArray(mult) && mult.length === 3 && mult.every(pos))) {
      throw new Error(m.key === 'yield' ? '殖利率法要填三個大於 0 的殖利率（便宜、合理、昂貴）。' : `${m.label}要填三個大於 0 的倍數（便宜、合理、昂貴）。`);
    }
    const [a, b, c] = mult;
    if (m.key === 'yield' ? !(a > b && b > c) : !(a < b && b < c)) {
      throw new Error(m.key === 'yield' ? '殖利率要由大到小：便宜價用最高的殖利率，昂貴價用最低的。' : `${m.label}的倍數要由小到大：便宜 < 合理 < 昂貴。`);
    }
    out.multiples = [a, b, c];
    if (m.key === 'pe' && base <= 0) { methods.push({ ...out, ok: false, reason: 'EPS 是 0 或負的，本益比法不能用。' }); continue; }
    if (m.key === 'pb' && base <= 0) { methods.push({ ...out, ok: false, reason: '每股淨值是 0 或負的，本淨比法不能用。' }); continue; }
    if (m.key === 'yield' && base === 0) { methods.push({ ...out, ok: false, reason: '沒有配股利，殖利率法不能用。' }); continue; }
    const at = k => (m.key === 'yield' ? base / k : base * k);
    const prices = { cheap: at(a), fair: at(b), expensive: at(c) };
    const zone = zoneOf(price, [prices.cheap, prices.fair, prices.expensive]);
    methods.push({ ...out, ok: true, current: m.key === 'yield' ? base / price : price / base, prices, zone, zoneLabel: ZONES[zone] });
  }
  if (!methods.length) throw new Error('EPS、每股淨值、每股股利至少要填一個。');
  return { price, methods };
}
