// 工具⑱：換匯成本與海外投資的台幣損益。v5.11，Opus 定，外包不得改簽名。
// 來源：R2-17 臺北富邦換匯試算（台幣換外幣用「銀行賣出」匯率、外幣換回台幣用「銀行買入」匯率，兩者差距就是成本）。
// 匯率一律是「1 外幣＝多少台幣」。FinMind TaiwanExchangeRate（臺灣銀行牌告）每列有 spot_buy／spot_sell（即期）、
//   cash_buy／cash_sell（現鈔）；沒有報價時是 0 或負數。
// 損益拆解（恆等式，四項加費用剛好等於總損益；mid＝(買入＋賣出)÷2）：
//   資產漲跌＝(現在外幣 − 換到的外幣) × 當初 mid
//   匯率變動＝現在外幣 × (現在 mid − 當初 mid)
//   換入價差＝−換到的外幣 × (當初賣出 − 當初 mid)
//   換回價差＝−現在外幣 × (現在 mid − 現在買入)
//   手續費  ＝−(換入手續費 ＋ 換回手續費)

export const FX_CURRENCIES = Object.freeze([
  { code: 'USD', label: '美元' }, { code: 'JPY', label: '日圓' }, { code: 'EUR', label: '歐元' },
  { code: 'CNY', label: '人民幣' }, { code: 'HKD', label: '港幣' }, { code: 'GBP', label: '英鎊' },
  { code: 'AUD', label: '澳幣' }, { code: 'CAD', label: '加拿大幣' }, { code: 'SGD', label: '新加坡幣' }
]);

const pos = x => Number.isFinite(x) && x > 0;

/**
 * FinMind 一列 → 一組匯率。
 * @param {{spot_buy:number, spot_sell:number, cash_buy:number, cash_sell:number}} row
 * @param {'spot'|'cash'} kind 即期（外幣帳戶、複委託常用）｜現鈔（換現金）
 * @returns {{buy:number, sell:number}|null} 沒報價（≤ 0）或 buy > sell 就 null
 */
export function ratePair(row = {}, kind = 'spot') {
  const buy = row[kind + '_buy'], sell = row[kind + '_sell'];
  return pos(buy) && pos(sell) && buy <= sell ? { buy, sell } : null;
}

function checkPair(r, name) {
  if (!(r && pos(r.buy) && pos(r.sell))) throw new Error(`請填${name}的銀行買入、賣出匯率。`);
  if (r.buy > r.sell) throw new Error(`${name}的銀行買入匯率不會比賣出高，請確認有沒有填反。`);
}

/**
 * ⑱ 精靈：台幣換外幣 → （外幣資產漲跌）→ 換回台幣。
 * @param {{twdIn:number, rateIn:{buy:number, sell:number}, feeIn?:number,
 *          foreignNow?:number, rateNow:{buy:number, sell:number}, feeOut?:number}} p
 *   twdIn：當初總共付出的台幣（含換入手續費，> 0）
 *   rateIn：當初的銀行買入／賣出匯率；換入用 sell
 *   feeIn／feeOut：換入／換回的台幣手續費（選填，預設 0，≥ 0；feeIn 要小於 twdIn）
 *   foreignNow：現在外幣總值（股票市值＋剩下的外幣現金）。留白（undefined／null／NaN）＝跟換到的一樣（只算換匯來回）
 *   rateNow：現在的銀行買入／賣出匯率；換回用 buy
 * @returns {{foreignIn, foreignNow, midIn, midNow, spreadPctIn, spreadPctNow, twdOut, pnl, ret,
 *   assetRet, fxRet, parts:{asset, fx, spreadIn, spreadOut, fees}, breakEvenBuy}}
 *   foreignIn＝(twdIn − feeIn) ÷ rateIn.sell
 *   spreadPctIn／spreadPctNow：(賣出 − 買入) ÷ 賣出，＝換完馬上換回會少掉的比例（不含手續費）
 *   twdOut＝foreignNow × rateNow.buy − feeOut；pnl＝twdOut − twdIn；ret＝pnl ÷ twdIn
 *   assetRet＝foreignNow ÷ foreignIn − 1（用外幣算的報酬）；fxRet＝midNow ÷ midIn − 1（匯率中間價變動）
 *   parts 見檔頭，加總＝pnl；breakEvenBuy＝(twdIn ＋ feeOut) ÷ foreignNow（銀行買入匯率至少要這麼高才不虧）
 */
export function fxPlan({ twdIn, rateIn, feeIn = 0, foreignNow, rateNow, feeOut = 0 }) {
  if (!pos(twdIn)) throw new Error('換匯的台幣金額要大於 0。');
  checkPair(rateIn, '當初');
  checkPair(rateNow, '現在');
  const fin = Number.isFinite(feeIn) ? feeIn : 0, fout = Number.isFinite(feeOut) ? feeOut : 0;
  if (fin < 0 || fout < 0) throw new Error('手續費不能是負的。');
  if (fin >= twdIn) throw new Error('換入手續費要小於台幣金額。');
  const foreignIn = (twdIn - fin) / rateIn.sell;
  const blank = foreignNow === undefined || foreignNow === null || Number.isNaN(foreignNow);
  const fNow = blank ? foreignIn : foreignNow;
  if (!(Number.isFinite(fNow) && fNow >= 0)) throw new Error('現在外幣總值不能是負的。');
  const midIn = (rateIn.buy + rateIn.sell) / 2, midNow = (rateNow.buy + rateNow.sell) / 2;
  const twdOut = fNow * rateNow.buy - fout;
  const pnl = twdOut - twdIn;
  const parts = {
    asset: (fNow - foreignIn) * midIn,
    fx: fNow * (midNow - midIn),
    spreadIn: -foreignIn * (rateIn.sell - midIn),
    spreadOut: -fNow * (midNow - rateNow.buy),
    fees: -(fin + fout)
  };
  return {
    foreignIn, foreignNow: fNow, midIn, midNow,
    spreadPctIn: (rateIn.sell - rateIn.buy) / rateIn.sell,
    spreadPctNow: (rateNow.sell - rateNow.buy) / rateNow.sell,
    twdOut, pnl, ret: pnl / twdIn,
    assetRet: fNow / foreignIn - 1, fxRet: midNow / midIn - 1,
    parts, breakEvenBuy: fNow > 0 ? (twdIn + fout) / fNow : null
  };
}
