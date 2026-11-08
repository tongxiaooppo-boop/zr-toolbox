## 完成項
- 步驟 1：新增⑥工具頁與頁面程式，包含情境切換、動態標題與副標、四項結果、折線圖、圖解及指定白話說明。
- 步驟 2：新增⑧工具頁與頁面程式，包含選填年化報酬、淨值紀錄 textarea、回本與最大回撤結果、錯誤提示、圖解及指定白話說明；CSS 僅在檔尾追加。
- 步驟 3：僅將 decay、drawdown 卡片設為 ready，並填入指定 terms。未 commit，未執行 smoke。
## 異動檔案
- M css/app.css
- M js/data/tools.js
- ?? js/pages/decay.js
- ?? js/pages/drawdown.js
- ?? tools/decay.html
- ?? tools/drawdown.html
- M collab/from-codex.md
## PROOF_CMD 輸出
- npm.cmd test：tests 46 / pass 46 / fail 0 / todo 0（exit code 0）。
- git diff --check：通過。
## 範例實測（帶入範例後畫面上的數字）
- 以 Node 記憶體 DOM 執行實際頁面模組並觸發「帶入範例」，核對結果節點文字；未啟動 Chrome，瀏覽器畫面與 smoke 留給 Opus 驗收。
- ⑥：大盤／大盤×2／正二／差距：-2.5%／-4.9%／-9.6%／-4.6%。
- ⑧：回本要漲／年數／最大回撤／前高回本／第幾筆到第幾筆：100.0%／約 7.3 年／50.0%／100.0%／第 4 筆（130）到第 5 筆（65）。
- 同時核對初始缺值提示、情境 change 更新、非整數天數、中文分隔符、無回撤紀錄、非數字紀錄、單筆紀錄、零淨值及無效跌幅／年化輸入，均通過。驗證使用 stdin，未留下暫存檔。
## 自行決定的小事
- 跌幅及年化以原始欄位是否空白判斷有無填寫；填入非數字時交由 core 驗證並原樣顯示 Error.message，避免當成選填空白略過。
- textarea 追加與 input 一致的 focus 外框。
## 需要決定的事
- 無
