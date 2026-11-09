## 完成項

- 完成⑳ ETF 入門、㉑ 借錢投資的管道、㉒ 商品與賺錢方式三個圖文長文頁，沒有計算機。
- R3 全部 37 列各自白話改寫，分成指定六節，包含誤解／其實、限制與工具連結。
- R4 全部 28 列入資料檔，指定 14 列放比較表，其餘 14 列可展開；另收 12 條誤解、17 條待查／矛盾。
- R5 全部 20 種商品、7 種賺錢方式；等級維持 ok／careful／no＝2／9／9。
- 內容只依 R3／R4／R5，未上網或補查數字。三頁具目錄、完整圖片文字 alt、參考資料、免責與工具連結，資料與排版分離，使用 h()。
- 六張 PNG 已生成並目視檢查，均為直式 1024×1536。
- CSS 僅檔尾追加文章專用規則，使用既有 token；sw.js 只透過指定腳本更新。
- 未 commit，未執行 npm.cmd run smoke；工作用暫存腳本已刪除。

## 修改檔案

- js/data/etf101.js
- js/data/loans.js
- js/data/products.js
- js/pages/etf101.js
- js/pages/loans.js
- js/pages/products.js
- tools/etf101.html
- tools/loans.html
- tools/products.html
- css/app.css（僅檔尾追加）
- sw.js（指定腳本產生）
- docs/figures/cartoon/out/etf101-comic.png
- docs/figures/cartoon/out/etf101-map.png
- docs/figures/cartoon/out/loans-comic.png
- docs/figures/cartoon/out/loans-map.png
- docs/figures/cartoon/out/products-comic.png
- docs/figures/cartoon/out/products-map.png
- collab/from-codex.md

## PROOF_CMD 結果

- check-kepu：（原樣貼最後兩行）

  ETF 主題 37；借錢管道 28 列（main 14）；商品 20、賺錢方式 7；百分比 11/39/9；網址 18/27/33

  OK

- gen-precache：sw.js：133 個檔案，版本 fd30e9e4811f
- npm.cmd test：tests 155 pass 155 fail 0
- node --check（三檔）：全部成功，無輸出。
- 指定串接命令完整執行成功，exit code 0。
- 額外驗證：以記憶體 DOM 執行三頁，確認渲染、全部目錄錨點、每頁兩張圖及完整 alt；比較表為表頭加 14 列、借款 details 14 個、商品 details 20 個。
- 額外驗證：一般內容欄位皆不超過 120 字（完整 alt、網址除外）；三份 HTML 對照 fx 樣板，只變更 title 與頁面 script；六張 PNG 標頭均為 1024×1536。
- 初次渲染檢查找出 ETF 各節陣列未展開，已修正並重驗通過；最終驗收沒有 FAIL。

## R3 合併了哪幾列（沒合併寫「無」）

無。37 列全部保留為 37 個主題。

## 生圖（每張重生幾次、有沒有殘留錯字）

使用內建 imagegen，提示均為「00-風格與角色.md 全文＋該圖提示全文」純文字字串，未使用 CLI／API fallback。

- etf101-comic.png：重生 0 次，目視未發現殘留錯字。
- etf101-map.png：重生 0 次，目視未發現殘留錯字。
- loans-comic.png：重生 0 次，目視未發現殘留錯字。
- loans-map.png：重生 0 次，目視未發現殘留錯字。
- products-comic.png：重生 1 次，校正第四格白板「價差」疑似寫成「債差」；保留重生版，目視未發現殘留錯字。
- products-map.png：重生 0 次，目視未發現殘留錯字。

最終六張檔案路徑如上；棄用版本未放入 repo。角色服裝及髮色維持指定方向，但不同圖中老師是否戴眼鏡有細微差異，供 Opus 美術驗收。

## 偏離規格或自行決定的小事

- 各資料檔額外匯出 FIGURE_TEXT，集中放圖片完整文字，避免 loans 頁面程式寫死 alt 裡的百分比。完整 alt 必須長於一般欄位的 120 字限制。
- 比較表增加 caption、欄／列 scope 和可聚焦捲動區；CSS 限文章內比較表、誤解與展開卡。
- 比較表按指定組別排序；ETF 目錄另納入限制區。
- R4 只有本機來源而沒有原始 https 網址的部分，保留白話限制但不補造網址。頁底來源只收各報告提供的原始 https 網址，每頁去重。
- 商品開戶、費稅等長欄位以不超過 120 字摘要；保留必要資格、日期、待查及風險界線，未改分級。

## 需要 Opus 決定的事

- 按原分工將六張 out PNG 轉為 img/etf101、img/loans、img/products 下的 comic.webp／map.webp。頁面已引用指定路徑，仍待轉檔搬入。
- 圖檔整合後由 Opus 將三張首頁卡片從 planned 改 ready，重跑 gen-precache 並執行 smoke。本次未修改 tools.js 或 img/。
- 美術上是否接受老師眼鏡的細微差異，由 Opus 決定；圖片文字與尺寸驗收已完成。
