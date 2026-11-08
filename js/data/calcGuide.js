// 工具①：原「正二平衡計算器」逐欄教程的文案（Opus 2026-11-08 依線上版 https://tongxiaooppo-boop.github.io/zr-calc/ 撰寫）。
// 頁面只負責排版，不改文字。欄位：
//   GUIDE_SECTIONS[]：{ id, title, intro, fields[] }
//     fields[]：{ name（原頁上的字樣）, what（這格要填什麼）, tip（選填，提醒）, toolbox（選填，在 ⑪ 對應哪一格；null＝⑪ 沒有）, termId（選填，辭典 id） }
//   DIFFERENCES[]：原頁和 ⑪ 算法不同的地方（字串）
//   TOKEN_GUIDE：{ why, limit, steps[], errors[{ sign, meaning, todo }], privacy }
export const ONLINE_URL = 'https://tongxiaooppo-boop.github.io/zr-calc/';

export const GUIDE_SECTIONS = Object.freeze([
  {
    id: 'stocks', title: '1. 持股（不含正二）',
    intro: '一般股票、原型 ETF 都填在這裡，一檔一列，按「＋ 新增一檔」加列。正二不要填在這裡。',
    fields: [
      { name: '代號／名稱', what: '股票代號，例如 0050、2330。', tip: '填代號才能按「更新股價」自動帶價；海外股票、基金這類非台股資產填名稱就好。', toolbox: null },
      { name: '股數', what: '持有幾股；1 張＝1,000 股。', tip: '非台股資產股數填 1。', toolbox: null },
      { name: '現價', what: '一股多少錢。', tip: '按「更新股價」會帶入最近一個交易日的收盤價，不是即時價。非台股資產這格填總金額。', toolbox: null, termId: 'closing-price' },
      { name: 'Beta', what: '這檔跟大盤的連動，預設 1。', tip: '0050 這類大盤 ETF 約 1；不確定就留 1。', toolbox: '「股票的 Beta」（⑪ 只能填一個合計）', termId: 'beta' },
      { name: '目標比重 %（選填）', what: '想讓這檔占多少比重。', tip: '只要有任何一檔填了，就會進入「完整重配」：全部持股連同正二都照比重重新分配，沒填的當 0（會建議全賣）。只想調正二的話，這欄全部留白。', toolbox: null },
      { name: '市值（占總資產）', what: '自動算：股數 × 現價，下面小字是占總資產幾 %。', toolbox: '「股票市值（不含正二）」＝這欄每一檔加起來' }
    ]
  },
  {
    id: 'lever', title: '2. 正二 ETF（最多 3 檔）',
    intro: '00631L、00685L 這類兩倍 ETF 填在這裡，預設已有一列 00685L。',
    fields: [
      { name: '代號', what: '正二的代號。', toolbox: null },
      { name: '股數、現價', what: '跟持股一樣；還沒買就股數留 0。', toolbox: '「正二市值」＝股數 × 現價，多檔加起來' },
      { name: '預估 Beta', what: '預設 2。', tip: '正二是「每天」2 倍，拉長時間會偏離，2 只是估計。', toolbox: '「正二的 Beta」', termId: 'daily-2x' },
      { name: '目標比重 %（選填）', what: '有好幾檔正二時，買賣金額怎麼分。', tip: '都不填就照目前市值比例分；目前都是 0 就平均分。只有一檔正二時不用填。', toolbox: null }
    ]
  },
  {
    id: 'cash-debt', title: '3. 現金與負債',
    intro: '不分帳戶，全部加總填一個數字。',
    fields: [
      { name: '現金合計', what: '帳上隨時能拿來買正二的錢。', toolbox: '「現金」' },
      { name: '負債合計', what: '質押、融資、信貸，所有借來的錢加總。', tip: '有借錢時，「淨資產口徑」和「總資產口徑」會差很多。', toolbox: '「借款」', termId: 'net-assets' }
    ]
  },
  {
    id: 'target', title: '4. 目標',
    intro: '告訴計算器你想要整體等於幾倍大盤。',
    fields: [
      { name: '目標組合 Beta（B）', what: '想要整體等於幾倍大盤，預設 1.4。', tip: '1.4 代表大盤跌 10% 時，你大約跌 14%。', toolbox: '「目標倍數」', termId: 'exposure' },
      { name: '最低保留現金', what: '買完正二至少要留在帳上的現金。', tip: '留白當 0。', toolbox: '「至少留現金」' },
      { name: 'Beta 口徑', what: '倍數的分母用哪一個：淨資產口徑（扣掉負債）或總資產口徑（不扣）。', tip: '有借錢的人建議看淨資產口徑，比較貼近「我自己的錢」漲跌幾 %。', toolbox: '「倍數怎麼算」', termId: 'basis' },
      { name: '允許新增借款（現金不足時）', what: '打勾＝現金不夠時，算出要再借多少；不勾＝只用現有現金。', tip: '打勾只是算出金額，不代表借得到，也不代表安全；要借之前先用 ④ 質押壓力測試看看。', toolbox: '「現金不夠時」' }
    ]
  },
  {
    id: 'buttons', title: '5. 按鈕與 FinMind Token',
    intro: '頁面下方的按鈕和選填欄位。',
    fields: [
      { name: '填入範例', what: '帶入：股票 1,000 萬、現金 200 萬、負債 300 萬、目標 1.4。', tip: '結果應該是正二目標總市值 NT$ 1,300,000、需買進 NT$ 1,300,000。⑪ 的「帶入範例」是同一組數字，可以兩邊對照。', toolbox: '「帶入範例」' },
      { name: '清空', what: '全部欄位歸零，留三列空白持股和一列 00685L。', toolbox: null },
      { name: '更新股價', what: '向 FinMind 抓每檔代號最近一個交易日的收盤價。', tip: '抓不到時現價可以自己填；常見的錯誤看下方「FinMind token 怎麼申請」。', toolbox: null },
      { name: 'FinMind Token（選填）', what: '沒填也能用；填了每小時可查的次數比較多。', tip: '怎麼申請看下方說明。', toolbox: null, termId: 'finmind-token' }
    ]
  },
  {
    id: 'results', title: '6. 結果怎麼看',
    intro: '填完會即時算出兩張卡片。',
    fields: [
      { name: '正二目標總市值', what: '正二應該調到多少錢，以及「需買進」或「需賣出」多少。', toolbox: '「正二要調到」、「要買進／賣出正二」' },
      { name: '標的／目標市值／買賣', what: '每一檔要買賣多少錢，下面小字是大約幾股。', tip: '股數是金額 ÷ 現價，沒扣手續費和稅，下單前自己再算一次零股或整張。', toolbox: null },
      { name: '是否可執行', what: '「可以」只代表現金夠（或你允許借款）。', tip: '可以執行不等於安全，借錢的部分要另外看會不會被追繳。', toolbox: null },
      { name: '平衡前後比較', what: '總資產、淨資產、負債比、槓桿比，以及兩種口徑的 Beta，平衡前和平衡後並排。', tip: '先看你選的那個口徑的 Beta，平衡後應該等於目標 B；不等於就代表目標達不到。', toolbox: '「等於幾倍大盤（淨資產）」、「總資產口徑」、「槓桿比」', termId: 'leverage-ratio' }
    ]
  }
]);

export const DIFFERENCES = Object.freeze([
  '原頁可以填好幾檔持股、最多 3 檔正二；⑪ 只收加總後的一個數字，結果一樣，只是少了每一檔的明細。',
  '原頁的「目標比重」會進入完整重配（連持股一起賣買）；⑪ 沒有這個模式，只調正二。',
  '一般持股的曝險已經超過目標時，原頁把正二設成 0 並加一行提醒，照樣顯示結果；⑪ 直接說「達不到」，請你調整持股或目標。',
  '選「總資產口徑」又允許借款、而正二 Beta 不高於目標時，原頁仍會算出借款金額，但借完其實達不到目標（要看平衡後的資產口徑 Beta 才會發現）；⑪ 直接說不可行。'
]);

export const TOKEN_GUIDE = Object.freeze({
  why: '原頁的「更新股價」是向 FinMind（免費的台股資料服務）抓收盤價。沒填 token 也能用，但可查的次數比較少；一次查很多檔、或同一個網路很多人在用，就可能被擋。',
  limit: '註冊免費會員拿到 token 後，每小時可以查 600 次，個人用綽綽有餘。',
  steps: [
    '到 FinMind 官網 finmindtrade.com，用 Email 註冊免費會員。',
    '收驗證信，點信裡的連結完成驗證。',
    '登入後到「使用者資訊」頁，複製 API Token（一長串英數字；網站改版時位置可能不同）。',
    '回到原計算器，貼進「FinMind Token」欄，再按一次「更新股價」。'
  ],
  errors: [
    { sign: '失敗訊息有「Requests reach the upper limit」（FinMind 回 402）', meaning: '這個小時的查詢次數用完了。', todo: '照上面步驟申請免費 token；急著用就先自己填現價。' },
    { sign: '有填 token 卻一直失敗，訊息提到 token 或認證', meaning: 'token 可能貼錯、多了空白，或已經失效。', todo: '把 token 欄清空再按一次「更新股價」；清空後成功，就是 token 有問題，重新複製一次。' },
    { sign: '一直失敗、訊息提到 403 或被封鎖', meaning: '可能短時間查太多次，被暫時擋下（常見約 30 分鐘）。', todo: '先不要一直重按，越按越久；等一陣子再試，或自己填現價。' }
  ],
  privacy: 'token 像密碼：原計算器只把它存在這支手機的瀏覽器裡，也只會送給 FinMind。不要貼到其他網站、不要傳給別人；換手機或清除瀏覽資料後要重新貼一次。'
});
