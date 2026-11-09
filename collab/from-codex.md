## 完成項
- ⑪「正二要買多少」改為五步精靈，依 ④ 樣板呈現輸入、逐項結果解說、兩種口徑、調整前後比較、每檔買賣明細與「怎麼讀」。公式只呼叫 core/balance.js。
- 新增 betaHoldingsInput／readBetaHoldings；支援台股自動抓價、海外資產手填、Beta 留白、其他持股全部刪光、正二最多三檔與至少保留一列。
- 修改工具頁 title 與 calc-guide 指定兩處文字。
- 三張直式 1024×1536 PNG 已生成、逐張自查並存入指定 out 目錄。
- 未上網、未 commit、未跑 npm.cmd run smoke；未改核心、測試、資料、CSS 或 img，未留下暫存腳本。

## 新增／修改檔案
- js/ui/wizard.js
- js/pages/exposure.js
- tools/exposure.html
- js/pages/calc-guide.js
- docs/figures/cartoon/out/balance-comic.png
- docs/figures/cartoon/out/balance-step3.png
- docs/figures/cartoon/out/balance-step4.png
- collab/from-codex.md

## PROOF_CMD 結果
- npm.cmd test：tests 116 pass 116 fail 0（exit 0）
- 範例數字：1300000 1300000 700000 true true 65000 1.40 1.05 3400000 false
- node --check：js/pages/exposure.js 與 js/ui/wizard.js 均 exit 0、無輸出。
- git diff --check：通過；僅 Git 的 LF／CRLF 提示。

## 卡通圖
- balance-comic.png：已生成／重生 0 次／自查未見錯字，文字與數字符合提示。
- balance-step3.png：已生成／重生 0 次／自查未見錯字，文字與數字符合提示。
- balance-step4.png：已生成／重生 1 次／初版底部「每天」引號不同，已修正為『每天』；末版自查未見錯字。
- 使用內建 imagegen，提示集為 docs/figures/cartoon/00-風格與角色.md 全文，加上各張 balance-01、balance-02、balance-03 提示全文；步驟 4 修正時另明確指定僅修正底部引號、保留其餘內容。
- 三張 PNG 均已確認尺寸 1024×1536；最終路徑如上。

## 偏離規格或自行決定的小事
- 新元件的 seq 在每次代號 change 時就遞增，也包含清空與非台股名稱，避免舊查價回應覆蓋手填內容；刪列也使未完成查價失效。原 holdingsInput／readHoldings／lotsInput 未改。
- 無其他偏離。

## 需要 Opus 決定的事
- 無新增決策；依原分工，請 Opus 將三張 PNG 轉為 img/exposure/comic.webp、step3.webp、step4.webp，並執行 smoke。這次未轉檔或寫入 img。
