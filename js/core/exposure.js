// 工具⑪：整體曝險倍數（白話版 Beta）。betaPlan 自 D:\ok\zr-calc\research-model.js 移植，邏輯不改。
// 與線上原計算機的差異（教程要講）：普通持股曝險已超過目標時，線上版把正二設 0 繼續算，這裡回報「達不到」。
import { nonnegative } from './validate.js';

/**
 * 現在的曝險。positions：每個部位的市值與 Beta（正二約 2、一般股票約 1）。
 * @returns {{assets:number, net:number, exposure:number, assetBasis:number, netBasis:number, leverageRatio:number}}
 *   net ≤ 0 時 netBasis、leverageRatio 為 NaN
 */
export function exposureNow({ positions, cash, debt }) {
  if (!Array.isArray(positions)) throw new Error('請提供持股清單。');
  nonnegative([...positions.flatMap(p => [p.value, p.beta]), cash, debt]);
  const assets = positions.reduce((a, p) => a + p.value, 0) + cash;
  if (assets <= 0) throw new Error('總資產須大於零。');
  const net = assets - debt, exposure = positions.reduce((a, p) => a + p.value * p.beta, 0);
  return {
    assets, net, exposure, assetBasis: exposure / assets,
    netBasis: net > 0 ? exposure / net : NaN, leverageRatio: net > 0 ? assets / net : NaN
  };
}

export function betaPlan(p) {
  nonnegative([p.ordinary, p.ordinaryBeta, p.lever, p.leverBeta, p.cash, p.debt, p.target, p.minCash]);
  if (p.leverBeta <= 0) throw new Error('正二估計Beta須大於零。');
  const assets = p.ordinary + p.lever + p.cash, net = assets - p.debt;
  if (net <= 0) throw new Error('淨資產須大於零，才能解讀本頁目標曝險。');
  if (!['net', 'asset'].includes(p.basis)) throw new Error('請選擇曝險分母。');
  const ordinaryExposure = p.ordinary * p.ordinaryBeta;
  const base = p.basis === 'net' ? net : assets;
  let targetLever = (p.target * base - ordinaryExposure) / p.leverBeta;
  if (targetLever < -1e-7) return { possible: false, reason: '固定普通持股的曝險已超過目標；只賣正二也無法達標，必須調整普通持股或改變目標。', assets, net };
  targetLever = Math.max(0, targetLever);
  const available = p.cash - p.minCash;
  let delta = targetLever - p.lever, borrow = 0;
  if (delta > available + 1e-7) {
    if (!p.allowBorrow) return { possible: false, reason: '現金不足且未允許新增借款。', shortage: delta - available, targetLever, assets, net };
    if (p.basis === 'asset') {
      if (p.leverBeta <= p.target) return { possible: false, reason: '在目前持股與最低現金限制下，借款買正二無法達成此總資產口徑目標；不能用無限借款解決。', assets, net };
      targetLever = (p.target * (p.ordinary + p.minCash) - ordinaryExposure) / (p.leverBeta - p.target);
      if (targetLever < 0) return { possible: false, reason: '此借款分支沒有非負解，請調整目標或固定部位。', assets, net };
      delta = targetLever - p.lever;
    }
    borrow = Math.max(0, delta - available);
  }
  const cashAfter = p.cash - delta + borrow, debtAfter = p.debt + borrow;
  const assetsAfter = p.ordinary + targetLever + cashAfter;
  const exposure = ordinaryExposure + targetLever * p.leverBeta;
  const achieved = exposure / (p.basis === 'net' ? assetsAfter - debtAfter : assetsAfter);
  if (Math.abs(achieved - p.target) > 1e-7 || cashAfter + 1e-7 < p.minCash) return { possible: false, reason: '交易後驗算未符合目標或最低現金限制。', assets, net };
  return { possible: true, assets, net, targetLever, delta, borrow, cashAfter, debtAfter, assetsAfter, exposure, achieved };
}
