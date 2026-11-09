// FinMind token 申請教學的文案（原放在 ① 朋友那格計算機教學頁；2026-11-09 ① 移除後獨立成 tools/token.html）。
// 頁面只負責排版，不改文字。TOKEN_GUIDE：{ why, limit, steps[], errors[{ sign, meaning, todo }], privacy }
export const TOKEN_GUIDE = Object.freeze({
  why: '工具箱填股票代號時，會向 FinMind（免費的台股資料服務）抓收盤價。沒填 token 也能用（每小時 300 次），但一次查很多檔、或同一個網路很多人在用，就可能被擋。',
  limit: '註冊免費會員拿到 token 後，每小時可以查 600 次，個人用綽綽有餘。',
  steps: [
    '到 FinMind 官網 finmindtrade.com，用 Email 註冊免費會員。',
    '收驗證信，點信裡的連結完成驗證。',
    '登入後到「使用者資訊」頁，複製 API Token（一長串英數字；網站改版時位置可能不同）。',
    '回到工具箱任一個計算機，打開「FinMind token（選填）」，貼上後按「存起來」，再重新填一次代號。'
  ],
  errors: [
    { sign: '失敗訊息有「Requests reach the upper limit」（FinMind 回 402）', meaning: '這個小時的查詢次數用完了。', todo: '照上面步驟申請免費 token；急著用就先自己填現價。' },
    { sign: '有填 token 卻一直失敗，訊息提到 token 或認證', meaning: 'token 可能貼錯、多了空白，或已經失效。', todo: '按「清除」再填一次代號；清除後成功，就是 token 有問題，重新複製一次。' },
    { sign: '一直失敗、訊息提到 403 或被封鎖', meaning: '可能短時間查太多次，被暫時擋下（常見約 30 分鐘）。', todo: '先不要一直重試，越試越久；等一陣子再試，或自己填現價。' }
  ],
  privacy: 'token 像密碼：工具箱只把它存在這台裝置的瀏覽器裡，也只會送給 FinMind。不要貼到其他網站、不要傳給別人；換手機或清除瀏覽資料後要重新貼一次。'
});
