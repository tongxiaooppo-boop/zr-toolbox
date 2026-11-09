// 工具⑩ 股息與除權息（v5，Opus 寫）。純函式。
// 規則來源：
//   參考價（研究 R2-15 證交所「減除股利參考價」，不含現金增資）＝(除權息前收盤價 − 每股現金股利) ÷ (1 ＋ 無償配股率)
//   配股率＝每股股票股利（元）÷ 面額（R2-12；面額多半 10 元，少數公司不是，頁面要讓使用者改）
//   二代健保補充保費（R2-05 健保署，非以雇主或自營業主身分投保）：單次股利所得達 20,000 元，全額 × 2.11%，單次上限 1,000 萬元
//     股利所得＝現金股利＋股票股利（以面額計，即 股數 × 每股股票股利元）。※股票股利計入這條研究原文沒寫，Opus 依健保署規則補，待查證
//   現金殖利率＝每股現金股利 ÷ 除權息前收盤價（R2-12、R2-13）；成本殖利率＝每股現金股利 ÷ 買入價
//   填息：股價回到除權息前收盤價；需要漲幅＝前收盤 ÷ 參考價 − 1（R2-12）
// 金額取整：現金股利元以下捨去、補充保費四捨五入到元；配股不足一股的部分（畸零股）依公司公告處理，這裡只算整股。
// 不處理：現金增資、減資、分割、以雇主身分投保的扣除、所得稅（8.5% 抵減／28% 分開計稅）。

export const NHI_RATE = 0.0211;
export const NHI_MIN = 20000;
export const NHI_CAP = 10000000;
export const IDENTITIES = Object.freeze(['general', 'exempt']);

const floorYuan = x => Math.floor(x + 1e-7);

/** 單次股利所得的補充保費；identity 'exempt'＝免扣（例：第五類、中低收入戶等，依健保署） */
export function nhiPremium(income, identity = 'general') {
  if (!IDENTITIES.includes(identity)) throw new Error('請選擇健保身分：一般，或符合免扣資格。');
  if (identity === 'exempt' || !(income >= NHI_MIN)) return 0;
  return Math.round(Math.min(income, NHI_CAP) * NHI_RATE);
}

/**
 * @param {{shares:number, prevClose:number, cashPerShare?:number, stockPerShare?:number, par?:number,
 *          buyPrice?:number, nowPrice?:number, identity?:'general'|'exempt'}} p
 *   prevClose＝除權息前一天收盤價；cashPerShare／stockPerShare 單位都是「元／股」；buyPrice、nowPrice 可省略
 * @returns {{cashTotal, stockRate, newSharesExact, newShares, sharesAfter, stockIncome, income, premium, netCash,
 *           refPrice, cashYield, costYield, valueBefore, valueAfter, fillPct, filled, costTotal, profitBefore, profitAfter}}
 *   valueAfter＝sharesAfter × refPrice ＋ cashTotal（除權息當下的持股市值＋現金股利，未扣補充保費）
 *   profitBefore＝valueBefore − costTotal；profitAfter＝sharesAfter × refPrice ＋ netCash − costTotal（沒有 buyPrice 時兩者 NaN）
 *   filled：沒有 nowPrice 時 null；有則 nowPrice ≥ prevClose
 */
export function dividendPlan(p) {
  const { shares, prevClose, cashPerShare = 0, stockPerShare = 0, par = 10, buyPrice, nowPrice, identity = 'general' } = p;
  if (!Number.isInteger(shares) || shares <= 0) throw new Error('股數要是正整數（1 張＝1000 股）。');
  if (!(prevClose > 0)) throw new Error('除權息前收盤價要大於 0。');
  if (!(cashPerShare >= 0) || !(stockPerShare >= 0)) throw new Error('股利不能是負的，沒有就填 0。');
  if (cashPerShare === 0 && stockPerShare === 0) throw new Error('現金股利和股票股利至少填一個。');
  if (cashPerShare >= prevClose) throw new Error('每股現金股利不可能大於等於股價，請檢查單位（每股幾元）。');
  if (!(par > 0)) throw new Error('面額要大於 0，多數公司是 10 元。');
  const stockRate = stockPerShare / par;
  const cashTotal = floorYuan(shares * cashPerShare);
  const newSharesExact = shares * stockRate;
  const newShares = floorYuan(newSharesExact);
  const sharesAfter = shares + newShares;
  const stockIncome = floorYuan(shares * stockPerShare);
  const income = cashTotal + stockIncome;
  const premium = nhiPremium(income, identity);
  const netCash = cashTotal - premium;
  const refPrice = (prevClose - cashPerShare) / (1 + stockRate);
  const valueBefore = shares * prevClose;
  const valueAfter = sharesAfter * refPrice + cashTotal;
  let costTotal = NaN, costYield = NaN, profitBefore = NaN, profitAfter = NaN;
  if (buyPrice != null && !Number.isNaN(buyPrice)) {
    if (!(buyPrice > 0)) throw new Error('買入價要大於 0。');
    costTotal = shares * buyPrice;
    costYield = cashPerShare / buyPrice;
    profitBefore = valueBefore - costTotal;
    profitAfter = sharesAfter * refPrice + netCash - costTotal;
  }
  let filled = null;
  if (nowPrice != null && !Number.isNaN(nowPrice)) {
    if (!(nowPrice > 0)) throw new Error('現價要大於 0。');
    filled = nowPrice >= prevClose;
  }
  return { cashTotal, stockRate, newSharesExact, newShares, sharesAfter, stockIncome, income, premium, netCash,
    refPrice, cashYield: cashPerShare / prevClose, costYield, valueBefore, valueAfter,
    fillPct: prevClose / refPrice - 1, filled, costTotal, profitBefore, profitAfter };
}
