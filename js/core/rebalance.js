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
