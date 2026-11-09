// 工具⑮ 平均成本與攤平（v5.4，Opus 寫）。純函式。
// 規則來源（研究 R2-11 台股主力獵手：平均成本；費用與稅沿用 ⑨ core/cost.js）：
//   每筆買進：股款＝價格 × 股數；手續費逐筆算（股款 × 0.1425% × 折扣，元以下捨去，低於低消收低消），不能合併後只收一次低消
//   低消：股數是 1000 的倍數＝整股（預設 20 元），其他＝零股（預設 1 元）；1500 股這種混合單視為零股（實際下單會拆兩筆，頁面註明）
//   總成本＝Σ股款＋Σ手續費；均價（含費）＝總成本 ÷ 總股數；均價（不含費）＝Σ股款 ÷ 總股數
//   R2-11 範例：100 元、90 元各 1 張 → 不含費 95.00、含費 95.14
//   損益兩平：全部一次賣出、扣賣出手續費與證交稅後剛好拿回總成本（⑨ breakEvenPrice），掛單往上對齊升降單位
//   現價損益：全部按現價賣出實拿 − 總成本（含賣出費稅，跟券商「預估損益」同口徑）
//   攤平到目標均價：在價格 P 再買 q 股，使 (總成本＋P×q＋手續費(q)) ÷ (股數＋q) ≤ 目標，取最小整數 q
// 不處理：賣掉一部分後的均價、現金股利是否減成本（各券商口徑不同，R2-11），頁面註明。
import { brokerFee, taxRate, breakEvenPrice, sellProceeds, FEE_RATE } from './cost.js';

export const lotMinFee = (shares, { minFeeBoard = 20, minFeeOdd = 1 } = {}) => (shares % 1000 === 0 ? minFeeBoard : minFeeOdd);

/** 一筆買進 → { shares, price, amount, fee, total, minFee } */
export function buyLot(shares, price, opt) {
  const minFee = lotMinFee(shares, opt);
  const amount = price * shares, fee = brokerFee(amount, { discount: opt.discount, minFee });
  return { shares, price, amount, fee, total: amount + fee, minFee };
}

function summarize(lots, p) {
  const shares = lots.reduce((a, l) => a + l.shares, 0);
  const amount = lots.reduce((a, l) => a + l.amount, 0);
  const fees = lots.reduce((a, l) => a + l.fee, 0);
  const totalCost = amount + fees;
  const sellOpt = { discount: p.discount, minFee: lotMinFee(shares, p) };
  const { breakEven, breakEvenTick } = breakEvenPrice(totalCost, shares, p.kind, p.rate, sellOpt);
  let sell = null, gain = NaN, gainPct = NaN, needRise = NaN;
  if (p.nowPrice > 0) {
    sell = sellProceeds(p.nowPrice, shares, p.rate, sellOpt);
    gain = sell.net - totalCost; gainPct = gain / totalCost; needRise = breakEvenTick / p.nowPrice - 1;
  }
  return { lots, shares, amount, fees, totalCost, avgNoFee: amount / shares, avgWithFee: totalCost / shares,
    breakEven, breakEvenTick, sell, gain, gainPct, needRise };
}

/**
 * @param {{kind:'stock'|'etf'|'bond-etf', lots:{shares:number, price:number}[], nowPrice?:number, discount?:number,
 *          minFeeBoard?:number, minFeeOdd?:number, add?:{price:number, shares?:number}|null, targetAvg?:number}} p
 *   lots＝已經買的每一筆（至少 1 筆）；add＝打算再買（price 必填、shares 選填）；targetAvg＝想把含費均價降到多少（選填，要有 add.price）
 *   discount 是小數（2.8 折＝0.28）；nowPrice 選填（沒有就不算現價損益）
 * @returns {{rate, feeRate, before:Summary, addLot:Lot|null, after:Summary|null, target:null|TargetOk|TargetNo}}
 *   Summary＝{ lots:Lot[], shares, amount, fees, totalCost, avgNoFee, avgWithFee, breakEven, breakEvenTick,
 *              sell:null|{amount, fee, tax, net}, gain, gainPct, needRise }（needRise＝breakEvenTick ÷ nowPrice − 1）
 *   Lot＝{ shares, price, amount, fee, total, minFee }
 *   TargetOk＝{ ok:true, shares, lot:Lot, avgWithFee, totalCost, totalShares }；TargetNo＝{ ok:false, message }
 */
export function avgCostPlan(p) {
  const { kind, lots, nowPrice, discount = 1, minFeeBoard = 20, minFeeOdd = 1, add = null, targetAvg } = p;
  const rate = taxRate(kind);
  if (!Array.isArray(lots) || !lots.length) throw new Error('請至少填一筆買進。');
  if (!(discount > 0 && discount <= 1)) throw new Error('折扣填 0.1–10 折，不打折填 10。');
  if (!(minFeeBoard >= 0) || !(minFeeOdd >= 0)) throw new Error('最低手續費不能是負的。');
  if (nowPrice != null && !Number.isNaN(nowPrice) && !(nowPrice > 0)) throw new Error('現價要大於 0；抓不到股價就手動填。');
  const opt = { discount, minFeeBoard, minFeeOdd };
  const rows = lots.map((l, i) => {
    if (!Number.isInteger(l.shares) || l.shares <= 0) throw new Error(`第 ${i + 1} 筆的股數要是正整數（1 張＝1000 股）。`);
    if (!(l.price > 0) || !Number.isFinite(l.price)) throw new Error(`第 ${i + 1} 筆的買入價要大於 0。`);
    return buyLot(l.shares, l.price, opt);
  });
  const ctx = { kind, rate, discount, minFeeBoard, minFeeOdd, nowPrice };
  const before = summarize(rows, ctx);

  let addLot = null, after = null, target = null;
  if (add) {
    if (!(add.price > 0) || !Number.isFinite(add.price)) throw new Error('打算再買的價格要大於 0。');
    if (add.shares != null && !Number.isNaN(add.shares)) {
      if (!Number.isInteger(add.shares) || add.shares <= 0) throw new Error('打算再買的股數要是正整數；不打算就留白。');
      addLot = buyLot(add.shares, add.price, opt);
      after = summarize([...rows, addLot], ctx);
    }
    if (targetAvg != null && !Number.isNaN(targetAvg)) target = toTarget(before, add.price, targetAvg, opt);
  } else if (targetAvg != null && !Number.isNaN(targetAvg)) throw new Error('要算攤平到目標均價，先填打算再買的價格。');
  return { rate, feeRate: FEE_RATE * discount, before, addLot, after, target };
}

const fmt2 = x => (Math.round(x * 100) / 100).toFixed(2);

function toTarget(before, price, target, opt) {
  if (!(target > 0)) return { ok: false, message: '目標均價要大於 0。' };
  if (target >= before.avgWithFee) return { ok: false, message: `目標均價要低於現在的均價 ${fmt2(before.avgWithFee)} 元；已經比目標低，不用再買。` };
  const unit = price * (1 + FEE_RATE * opt.discount); // 再買每股的實際成本（不計低消）
  if (target <= unit) return { ok: false, message: `目標均價要高於再買的價格 ${price} 元（加手續費約 ${fmt2(unit)} 元）；買再多也只會越來越接近、到不了。` };
  // 比例費率下的解：(C＋unit×q) ÷ (S＋q) ＝ target → q ＝ (C − target×S) ÷ (target − unit)；手續費捨去與低消會差幾股，往下退再逐股往上找
  const approx = (before.totalCost - target * before.shares) / (target - unit);
  if (approx > 1e8) return { ok: false, message: '要買的股數太多（超過 1 億股），請把目標均價設高一點。' };
  const fits = q => { const l = buyLot(q, price, opt); return (before.totalCost + l.total) / (before.shares + q) <= target + 1e-12 ? l : null; };
  let q = Math.max(1, Math.floor(approx) - 50), lot;
  while (!(lot = fits(q))) q++;
  while (q > 1 && fits(q - 1)) { q--; lot = fits(q); }
  const totalCost = before.totalCost + lot.total, totalShares = before.shares + q;
  return { ok: true, shares: q, lot, totalCost, totalShares, avgWithFee: totalCost / totalShares };
}
