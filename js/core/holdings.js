// 持股輸入（精靈第一步共用）：代號＋買入股數＋買入價＋現價 → 成本、市值、損益。純函式，不碰 DOM、不碰網路。（v5 新增）

/** 台股代號：4–8 碼英數（0050、00631L、2330），與原計算機相同 */
export const CODE_RE = /^[0-9A-Z]{4,8}$/;

/** ' ００６３１ｌ ' → '00631L'（去空白、全形轉半形、轉大寫）；不合格式回傳 '' */
export function normalizeCode(text) {
  const s = String(text ?? '').trim().replace(/[０-９Ａ-Ｚａ-ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).toUpperCase();
  return CODE_RE.test(s) ? s : '';
}

/**
 * @param {{code:string, shares:number, buyPrice:number, nowPrice:number}[]} list 至少一檔
 * @returns {{rows:{code,shares,buyPrice,nowPrice,cost,value,gain,gainPct}[], cost, value, gain, gainPct}}
 * 錯誤訊息寫明是第幾檔，頁面直接顯示。
 */
export function holdingSummary(list) {
  if (!Array.isArray(list) || !list.length) throw new Error('請至少填一檔股票。');
  const rows = list.map((h, i) => {
    const n = `第 ${i + 1} 檔`;
    if (!CODE_RE.test(h.code ?? '')) throw new Error(`${n}的股票代號格式不對，例：0050、00631L。`);
    if (!Number.isInteger(h.shares) || h.shares <= 0) throw new Error(`${n}的股數要是正整數（1 張＝1000 股）。`);
    if (!(h.buyPrice > 0) || !Number.isFinite(h.buyPrice)) throw new Error(`${n}的買入價要大於 0。`);
    if (!(h.nowPrice > 0) || !Number.isFinite(h.nowPrice)) throw new Error(`${n}的現價要大於 0；抓不到股價就手動填。`);
    const cost = h.shares * h.buyPrice, value = h.shares * h.nowPrice;
    return { code: h.code, shares: h.shares, buyPrice: h.buyPrice, nowPrice: h.nowPrice, cost, value, gain: value - cost, gainPct: value / cost - 1 };
  });
  const cost = rows.reduce((a, r) => a + r.cost, 0), value = rows.reduce((a, r) => a + r.value, 0);
  return { rows, cost, value, gain: value - cost, gainPct: value / cost - 1 };
}
