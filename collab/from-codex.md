## 完成項

- 完成㉓股票基本術語：六節、48 個術語，白話解釋、例子、誤解與澄清、工具連結、來源與限制。
- 完成關鍵字篩選、符合筆數、無結果時隱藏整節、網址 #id 跳轉與清除篩選。
- 完成㉔正二教學：六節、五種用法、兩個獨立配回例子、四種配比表、原作者回測及四項限制、五步工具路線。
- ETF 入門的 leveraged 節只追加指定的正二教學連結。
- 四張直式 1024×1536 PNG 已生成並逐張目視校對；頁面引用指定的未來 WebP 路徑，alt 收錄提示的全部指定文字。
- 未上網、未 commit、未跑 smoke；暫存建置與 DOM 驗證檔已刪除。

## 修改檔案

- 新增 js/data/basics.js、js/data/zr101.js。
- 新增 js/pages/basics.js、js/pages/zr101.js。
- 新增 tools/basics.html、tools/zr101.html；由 ETF HTML 樣板只替換 title 與頁面 script。
- 修改 js/pages/etf101.js：只增加指定一行。
- css/app.css：只在檔尾追加術語分隔、段落定位與表格樣式，使用既有色彩 token。
- sw.js：只由 scripts/gen-precache.mjs 更新。
- docs/figures/cartoon/out/basics-comic.png。
- docs/figures/cartoon/out/basics-map.png。
- docs/figures/cartoon/out/zr101-comic.png。
- docs/figures/cartoon/out/zr101-map.png。
- collab/from-codex.md。

## PROOF_CMD 結果

- check-kepu2：
  ```text
  基本術語 48（R5 48）；正二教學 6 節、做法 5、配比 4、路線 5；百分比 1/14；網址 15/10
  OK
  ```
- gen-precache：sw.js：145 個檔案，版本 f1b34096ada2。
- npm.cmd test：tests 155 pass 155 fail 0。
- node --check（三檔）：basics.js、zr101.js、etf101.js 均成功、無輸出。
- 額外 DOM 檢查：48 詞初始顯示、關鍵字搜尋、零結果、整節隱藏、hash 清除篩選與定位、無效編碼 hash、正二頁組裝全部通過；術語 plain/example/myth/fact 各欄均不超過 120 字。

## 生圖（每張重生幾次、有沒有殘留錯字）

- 使用內建 imagegen；每次提示均為「00-風格與角色.md 全文＋該張提示全文」的純文字字串。
- basics-comic.png：重生 0 次；未見殘留錯字。
- basics-map.png：重生 0 次；未見殘留錯字。
- zr101-comic.png：重生 1 次，修正『每一天』的引號並統一老師外觀；最後一張未見殘留錯字。
- zr101-map.png：重生 1 次，移除圖示內自行增加的百分比數字；最後一張未見殘留錯字。
- 後兩張重生提示只補充上述校對要求；最終檔案位於前節列出的四個 PNG 路徑。
- 圖中有少量裝飾性重複標籤，指定的教學文字與數字均已目視核對。

## 偏離規格或自行決定的小事

- 正二資料增加 ZR_PERIODIC，存放配回例子、權重順序、簡化倍數與假設說明，避免頁面程式寫死百分比。
- 篩選也會在點目錄跳到被隱藏的章節時清空，確保章節能顯示；無結果顯示「符合 0 個」。
- 比較表加入 caption、欄列標題與可鍵盤捲動容器；符合筆數使用 live status。
- R5 前三列的「常見誤解」原本用否定句陳述正確事實，改寫為真正的誤解，再以 fact 澄清，避免標示相反。
- 目前僅完成程式、資料、DOM 驗證與圖檔目視檢查；實際瀏覽器 smoke 按交接留給 Opus。

## 需要 Opus 決定的事

- 將四張 PNG 轉 WebP 並搬至 img/basics/comic.webp、img/basics/map.webp、img/zr101/comic.webp、img/zr101/map.webp；本次依規格未改 img/，轉檔前頁面圖片尚無目標資產。
- 確認圖片後，將 tools.js 的 basics、zr101 由 planned 改為 ready，並跑 smoke；本次未修改登記狀態。
- 圖片輸出目錄目前不出現在一般 git status；若要將 PNG 納入版本，請依專案的圖片管理方式處理。
