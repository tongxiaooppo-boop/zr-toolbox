// 工具③：時間制配比再平衡。公式自 D:\ok\zr-calc\research-model.js 移植，模板擴充為股版／債版。
// 股版＝原型／正二／現金；債版＝正二／美債／現金（同名不同配置，網路上兩種都有人叫 442、532）。
// betas 是相對台股大盤的近似曝險：原型 1、正二 2、美債與現金 0（美債 0 是簡化）。
import { nonnegative, dateParts } from './validate.js';

const STOCK = Object.freeze(['原型', '正二', '現金']), BOND = Object.freeze(['正二', '美債', '現金']);
const t = (name, variant, weights) => Object.freeze({
  name, variant, assets: variant === 'stock' ? STOCK : BOND,
  weights: Object.freeze(weights), betas: Object.freeze(variant === 'stock' ? [1, 2, 0] : [2, 0, 0])
});
export const TEMPLATES = Object.freeze({
  '5050': t('50／50', 'stock', [0, .5, .5]),
  '6040': t('60／40', 'stock', [0, .6, .4]),
  '532-stock': t('532 股版', 'stock', [.5, .3, .2]),
  '442-stock': t('442 股版', 'stock', [.4, .4, .2]),
  '433-stock': t('433 股版', 'stock', [.4, .3, .3]),
  '532-bond': t('532 債版', 'bond', [.5, .3, .2]),
  '442-bond': t('442 債版', 'bond', [.4, .4, .2])
});

export function dueDate(last, months) {
  const d = dateParts(last);
  if (![1, 3, 6, 12].includes(months)) throw new Error('請選擇有效的再平衡週期。');
  const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const end = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d.getUTCDate(), end));
  return first.toISOString().slice(0, 10);
}

/**
 * @param {{template:string, holdings:number[], contribution?:number, fee?:number, months:number, last:string, asOf:string}} p
 *   holdings 三個數字，順序＝TEMPLATES[template].assets
 * @returns {{total:number, targets:number[], trades:number[], due:string, ready:boolean, exposure:number}} trades>0＝買進
 */
export function rebalance({ template, holdings, contribution = 0, fee = 0, months, last, asOf }) {
  const tpl = TEMPLATES[template];
  if (!tpl) throw new Error('請選擇配置模板。');
  if (!Array.isArray(holdings) || holdings.length !== 3) throw new Error('請填入三個部位的市值。');
  nonnegative([...holdings, contribution, fee]);
  dateParts(asOf); dateParts(last);
  if (asOf < last) throw new Error('檢視日不能早於上次完成日。');
  const total = holdings.reduce((a, b) => a + b, 0) + contribution - fee;
  if (total <= 0) throw new Error('扣除費用預算後，策略資金須大於零。');
  const targets = tpl.weights.map(w => total * w);
  const due = dueDate(last, months);
  return {
    total, targets, trades: targets.map((v, i) => v - holdings[i]), due, ready: asOf >= due,
    exposure: tpl.weights.reduce((a, w, i) => a + w * tpl.betas[i], 0)
  };
}

// ---------- ③ 精靈（v5.8，Opus 定，外包不得改簽名） ----------
// 任意多檔＋股數取整。模板只是「預設列」：使用者可以改代號、加減檔數，比例自己填。
const r3 = (code, beta, weight) => Object.freeze({ code, beta, weight });
/** 精靈模板：rows＝預設持股列（代號、Beta、目標比例），cash＝現金比例。custom＝全部自己填。 */
export const WIZARD_TEMPLATES = Object.freeze({
  '532-stock': Object.freeze({ name: '532 股版（原型 50、正二 30、現金 20）', rows: [r3('0050', 1, .5), r3('00631L', 2, .3)], cash: .2 }),
  '442-stock': Object.freeze({ name: '442 股版（原型 40、正二 40、現金 20）', rows: [r3('0050', 1, .4), r3('00631L', 2, .4)], cash: .2 }),
  '433-stock': Object.freeze({ name: '433 股版（原型 40、正二 30、現金 30）', rows: [r3('0050', 1, .4), r3('00631L', 2, .3)], cash: .3 }),
  '532-bond': Object.freeze({ name: '532 債版（正二 50、美債 30、現金 20）', rows: [r3('00631L', 2, .5), r3('00679B', 0, .3)], cash: .2 }),
  '442-bond': Object.freeze({ name: '442 債版（正二 40、美債 40、現金 20）', rows: [r3('00631L', 2, .4), r3('00679B', 0, .4)], cash: .2 }),
  '6040': Object.freeze({ name: '60／40（正二 60、現金 40）', rows: [r3('00631L', 2, .6)], cash: .4 }),
  '5050': Object.freeze({ name: '50／50（正二 50、現金 50）', rows: [r3('00631L', 2, .5)], cash: .5 }),
  'custom': Object.freeze({ name: '自訂（檔數、比例全部自己填）', rows: [], cash: 0 })
});

/** Beta 留白時的猜測：代號結尾 L（槓桿）2、R（反向）−1、B（債券 ETF）0，其他 1。頁面要告訴使用者這是猜的。 */
export function guessBeta(code) {
  const c = String(code ?? '');
  return /L$/.test(c) ? 2 : /R$/.test(c) ? -1 : /B$/.test(c) ? 0 : 1;
}

/**
 * ③ 精靈：多檔持股＋現金＋新投入 → 照目標比例配回，每檔要買賣幾股（取整）、剩多少現金、曝險倍數。
 * @param {{rows:{code:string, shares:number, price:number, beta?:number, weight:number}[],
 *   cash:number, cashWeight:number, contribution?:number, unit?:1|1000,
 *   months?:1|3|6|12, last?:string, asOf?:string}} p
 *   rows 至少 1 檔；shares 0 或正整數（0＝還沒買、這次要建倉）；price > 0；beta 留白（NaN／undefined）用 guessBeta。
 *   weight、cashWeight 是 0–1 的小數，加總要等於 1（誤差 0.0001 內）。代號不能重複。
 *   unit：1＝可以買賣零股（預設）、1000＝只用整張。
 *   last 有填才算到期：due＝dueDate(last, months)、ready＝asOf ≥ due；沒填 due＝null、ready＝null。
 * @returns {{
 *   rows:{code, shares, price, beta, weight, value, nowWeight, target, tradeShares, tradeAmount, sharesAfter, valueAfter, weightAfter}[],
 *   total, pool, cashTarget, cashAfter, cashWeightNow, cashWeightAfter,
 *   buyAmount, sellAmount, exposureNow, exposureTarget, exposureAfter, maxDrift, due, ready }}
 *   total＝持股市值＋現金（新投入前）；pool＝total＋contribution（配回用的總額）；target＝pool×weight。
 *   取整規則：買進無條件捨去、賣出四捨五入（單位＝unit；整張時賣出不超過持有的整張數）。
 *   取整後現金若變負（只有現金比例很低才會發生），從買進金額最大的那檔少買幾單位，直到現金 ≥ 0。
 *   tradeShares > 0＝買進；tradeAmount＝tradeShares×price。cashAfter＝cash＋contribution－Σ tradeAmount。
 *   nowWeight＝value÷total；weightAfter＝valueAfter÷pool；maxDrift＝max |nowWeight−weight|（含現金）。
 *   exposureNow＝Σ value×beta ÷ total；exposureTarget＝Σ weight×beta；exposureAfter＝Σ valueAfter×beta ÷ pool。不算手續費與稅。
 */
export function rebalancePlan({ rows, cash, cashWeight, contribution = 0, unit = 1, months, last, asOf }) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('請至少填一檔股票。');
  if (![1, 1000].includes(unit)) throw new Error('下單單位只能選零股或整張。');
  if (!(Number.isFinite(cash) && cash >= 0)) throw new Error('策略現金要是 0 或正數。');
  if (!(Number.isFinite(contribution) && contribution >= 0)) throw new Error('新投入要是 0 或正數。');
  const seen = new Set();
  const list = rows.map((r, i) => {
    const n = `第 ${i + 1} 檔`;
    if (!r.code) throw new Error(`${n}沒有填代號。`);
    if (seen.has(r.code)) throw new Error(`${r.code} 重複了，同一檔請合併成一列。`);
    seen.add(r.code);
    if (!Number.isInteger(r.shares) || r.shares < 0) throw new Error(`${n}的股數要是 0 或正整數（1 張＝1000 股）。`);
    if (!(Number.isFinite(r.price) && r.price > 0)) throw new Error(`${n}的現價要大於 0；抓不到股價就手動填。`);
    if (!(Number.isFinite(r.weight) && r.weight >= 0 && r.weight <= 1)) throw new Error(`${n}的目標比例要在 0–100% 之間。`);
    const beta = Number.isFinite(r.beta) ? r.beta : guessBeta(r.code);
    return { code: r.code, shares: r.shares, price: r.price, beta, weight: r.weight, value: r.shares * r.price };
  });
  if (!(Number.isFinite(cashWeight) && cashWeight >= 0 && cashWeight <= 1)) throw new Error('現金的目標比例要在 0–100% 之間。');
  const sumW = list.reduce((a, r) => a + r.weight, 0) + cashWeight;
  if (Math.abs(sumW - 1) > 1e-4) throw new Error(`目標比例加起來要是 100%，現在是 ${+(sumW * 100).toFixed(2)}%。`);
  const total = list.reduce((a, r) => a + r.value, 0) + cash, pool = total + contribution;
  if (!(pool > 0)) throw new Error('持股市值加現金要大於零。');

  for (const r of list) {
    r.target = pool * r.weight;
    const raw = (r.target - r.value) / r.price / unit;
    r.tradeShares = raw >= 0 ? Math.floor(raw + 1e-9) * unit
      : -Math.min(Math.floor(r.shares / unit), Math.round(-raw)) * unit;
  }
  const cashLeft = () => cash + contribution - list.reduce((a, r) => a + r.tradeShares * r.price, 0);
  let cashAfter = cashLeft();
  while (cashAfter < -1e-9) {
    const top = list.filter(r => r.tradeShares > 0).sort((a, b) => b.tradeShares * b.price - a.tradeShares * a.price)[0];
    if (!top) break;
    const cut = Math.min(top.tradeShares / unit, Math.ceil(-cashAfter / (top.price * unit) - 1e-9));
    top.tradeShares -= cut * unit;
    cashAfter = cashLeft();
  }
  let buyAmount = 0, sellAmount = 0, expNow = 0, expAfter = 0, maxDrift = Math.abs((total > 0 ? cash / total : 0) - cashWeight);
  const out = list.map(r => {
    const tradeAmount = r.tradeShares * r.price, sharesAfter = r.shares + r.tradeShares, valueAfter = sharesAfter * r.price;
    if (tradeAmount > 0) buyAmount += tradeAmount; else sellAmount -= tradeAmount;
    const nowWeight = total > 0 ? r.value / total : 0;
    maxDrift = Math.max(maxDrift, Math.abs(nowWeight - r.weight));
    expNow += r.value * r.beta; expAfter += valueAfter * r.beta;
    return { code: r.code, shares: r.shares, price: r.price, beta: r.beta, weight: r.weight, value: r.value, nowWeight,
      target: r.target, tradeShares: r.tradeShares, tradeAmount, sharesAfter, valueAfter, weightAfter: valueAfter / pool };
  });
  let due = null, ready = null;
  if (last) {
    dateParts(last); dateParts(asOf);
    if (asOf < last) throw new Error('今天不能早於上次配回日。');
    due = dueDate(last, months); ready = asOf >= due;
  }
  return {
    rows: out, total, pool, cashTarget: pool * cashWeight, cashAfter,
    cashWeightNow: total > 0 ? cash / total : 0, cashWeightAfter: cashAfter / pool,
    buyAmount, sellAmount,
    exposureNow: total > 0 ? expNow / total : 0, exposureTarget: list.reduce((a, r) => a + r.weight * r.beta, 0) ,
    exposureAfter: expAfter / pool, maxDrift, due, ready
  };
}
