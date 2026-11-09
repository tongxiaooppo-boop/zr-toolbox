// 工具⑨ 買賣成本與損益（v5，Opus 寫）。純函式。
// 規則來源（研究 R2-01 證交所 2025 投資指南、R2-02 交易成本工具、R3-04 證交所交易制度）：
//   手續費＝成交金額 × 0.1425% × 折扣，元以下無條件捨去；低於單筆最低手續費時收最低（整股常見 20 元、零股常見 1 元，依券商）
//   證交稅＝賣出成交金額 × 稅率，元以下無條件捨去，買進不收：股票 0.3%、ETF 0.1%、債券 ETF 停徵（至 2026-12-31）、
//           股票現股當沖 0.15%（至 2027-12-31；ETF 當沖仍是 0.1%）
//   升降單位（營業細則第 62 條）：股票 <10 元 0.01、10–<50 0.05、50–<100 0.1、100–<500 0.5、500–<1000 1、≥1000 5；ETF <50 0.01、≥50 0.05
// 單位：discount 是小數（2.8 折＝0.28、不打折＝1）；金額為元。

export const FEE_RATE = 0.001425;
export const TAX_RATE = Object.freeze({ stock: 0.003, etf: 0.001, 'bond-etf': 0, dayTrade: 0.0015 });
export const TAX_UNTIL = Object.freeze({ 'bond-etf': '2026-12-31', dayTrade: '2027-12-31' });
export const KINDS = Object.freeze(['stock', 'etf', 'bond-etf']);

const floorYuan = x => Math.floor(x + 1e-7); // 避免 142.5 被算成 142.4999… 之類的浮點誤差

/** 代號猜商品類型：00 開頭＝ETF，00 開頭且結尾 B＝債券 ETF，其他＝股票（頁面要讓使用者確認） */
export function guessKind(code) {
  if (/^00\d+B$/.test(code)) return 'bond-etf';
  if (/^00/.test(code)) return 'etf';
  return 'stock';
}

/** 整股（1000 的倍數）預設最低手續費 20 元，零股 1 元 */
export function defaultMinFee(shares) { return shares >= 1000 && shares % 1000 === 0 ? 20 : 1; }

export function taxRate(kind, dayTrade = false) {
  if (!KINDS.includes(kind)) throw new Error('請選擇商品類型：股票、ETF 或債券 ETF。');
  return kind === 'stock' && dayTrade ? TAX_RATE.dayTrade : TAX_RATE[kind];
}

export function tickSize(price, kind) {
  if (kind === 'stock') return price < 10 ? 0.01 : price < 50 ? 0.05 : price < 100 ? 0.1 : price < 500 ? 0.5 : price < 1000 ? 1 : 5;
  return price < 50 ? 0.01 : 0.05; // ETF、債券 ETF
}

/** 往上對齊到合法掛單價位 */
export function roundUpToTick(price, kind) {
  const t = tickSize(price, kind);
  return Math.round(Math.ceil(price / t - 1e-9) * t * 100) / 100;
}

export function brokerFee(amount, { discount = 1, minFee = 20 } = {}) {
  if (!(amount > 0)) return 0;
  return Math.max(floorYuan(amount * FEE_RATE * discount), minFee);
}

function sellSide(price, shares, opt, rate) {
  const amount = price * shares;
  const fee = brokerFee(amount, opt), tax = floorYuan(amount * rate);
  return { amount, fee, tax, net: amount - fee - tax };
}

/**
 * @param {{kind:'stock'|'etf'|'bond-etf', dayTrade?:boolean, shares:number, buyPrice:number, sellPrice?:number,
 *          discount?:number, minFee?:number}} p  sellPrice 可省略（只算買進與損益兩平）
 * @returns {{buyAmount, buyFee, buyTotal, rate, sell:null|{amount, fee, tax, net}, totalCost, profit, profitPct,
 *           breakEven, breakEvenTick, feeRate}}
 *   totalCost＝買進手續費＋賣出手續費＋證交稅；profitPct＝profit ÷ buyTotal；
 *   breakEven＝賣出實拿剛好等於買入總成本的理論價；breakEvenTick＝實際掛得出去、而且不虧的最低價位
 */
export function tradeCost(p) {
  const { kind, dayTrade = false, shares, buyPrice, sellPrice, discount = 1, minFee = 20 } = p;
  const rate = taxRate(kind, dayTrade);
  if (!Number.isInteger(shares) || shares <= 0) throw new Error('股數要是正整數（1 張＝1000 股）。');
  if (!(buyPrice > 0)) throw new Error('買入價要大於 0。');
  if (!(discount > 0 && discount <= 1)) throw new Error('折扣填 0.1–10 折，不打折填 10。');
  if (!(minFee >= 0)) throw new Error('最低手續費不能是負的。');
  const opt = { discount, minFee };
  const buyAmount = buyPrice * shares, buyFee = brokerFee(buyAmount, opt), buyTotal = buyAmount + buyFee;
  // 損益兩平：先用比例費率反解；若那個價位的手續費會被最低手續費墊高，改用最低手續費反解
  let breakEven = buyTotal / (shares * (1 - FEE_RATE * discount - rate));
  if (floorYuan(breakEven * shares * FEE_RATE * discount) < minFee) breakEven = (buyTotal + minFee) / (shares * (1 - rate));
  let breakEvenTick = roundUpToTick(breakEven, kind);
  while (sellSide(breakEvenTick, shares, opt, rate).net < buyTotal) breakEvenTick = roundUpToTick(breakEvenTick + tickSize(breakEvenTick, kind) / 2, kind);
  let sell = null, totalCost = buyFee, profit = NaN, profitPct = NaN;
  if (sellPrice != null && !Number.isNaN(sellPrice)) {
    if (!(sellPrice > 0)) throw new Error('賣出價要大於 0。');
    sell = sellSide(sellPrice, shares, opt, rate);
    totalCost = buyFee + sell.fee + sell.tax;
    profit = sell.net - buyTotal;
    profitPct = profit / buyTotal;
  }
  return { buyAmount, buyFee, buyTotal, rate, sell, totalCost, profit, profitPct, breakEven, breakEvenTick,
    feeRate: FEE_RATE * discount };
}
