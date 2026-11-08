// FinMind 回應的處理決策（Gate 3 的頁面照這個走，不自己判斷）。
// 依據（官方 2026-11-08）：無 token 300 次／小時、免費會員 600；超額回 402；
// 短時間大量 4xx 會封 IP 30 分鐘（403）。所以 403 一律停止，不清 token、不重試。
// 400／401 不一定是 token 錯（也可能是參數錯），所以先不帶 token 重試一次；
// 頁面規則：重試回 200 才清掉 token（證明是 token 的問題），重試失敗就保留 token 並停止。
/**
 * @param {{status:number, usedToken:boolean, retried:boolean}} r
 * @returns {{action:'ok'|'show-quota-guide'|'retry-without-token'|'stop', message:string}}
 */
export function finmindAction({ status, usedToken, retried }) {
  if (status === 200) return { action: 'ok', message: '' };
  if (status === 402) return { action: 'show-quota-guide', message: '這個小時的免費查詢次數用完了。可以等一小時，或申請免費會員 token（每小時 600 次）。' };
  if (status === 403) return { action: 'stop', message: '查詢太頻繁被暫時封鎖，約 30 分鐘後再試；這段時間請手動輸入股價。' };
  if ((status === 400 || status === 401) && usedToken && !retried) return { action: 'retry-without-token', message: 'token 可能已失效，改用不帶 token 再查一次；查得到就會清掉舊 token。' };
  return { action: 'stop', message: '查不到股價，請手動輸入。' };
}
