## 完成項
- 完成工具⑩「股息與除權息」頁面，依 cost.js 樣板實作三步精靈、欄位說明與驗證、九項條件式結果、範例與「怎麼讀」。
- 計算呼叫既有 dividendPlan，未修改核心公式或其他受限制檔案。
- 以內建 imagegen 生圖功能生成兩張直式 1024×1536 PNG，已目視檢查中文、數字與公式。
- 未上網、未 commit、未執行 smoke；未產生一次性腳本或暫存檔。

## 新增檔案
- tools/dividend.html
- js/pages/dividend.js
- docs/figures/cartoon/out/dividend-comic.png
- docs/figures/cartoon/out/dividend-step2.png
- collab/from-codex.md（覆蓋原回報）

## PROOF_CMD 結果
- npm.cmd test：tests 73 pass 73 fail 0，exit code 0。
- 範例數字：24000 500 612 23388 45.33 500000 10.29 99388，exit code 0。
- node --check：無輸出，exit code 0。

## 卡通圖
- dividend-comic.png：已生成／重生 0 次／目視自查中文與數字未見錯字，數值包含 24,000、500 股、−612、45.33、476,000、500,000、10.29%、5,000、2.11%。
- dividend-step2.png：已生成／重生 1 次／初稿將『』畫成「」，重生後已修正；最後一張中文與數字未見錯字，數值包含 2.4、0.5、1,000、2,400、10、5%、50。
- 生成方式：內建 imagegen，非 CLI；每次提示均包含 docs/figures/cartoon/00-風格與角色.md 全文，加上該張 dividend-01-領股利四格.md 或 dividend-02-股利公告怎麼看.md 全文。公告插圖重生時另加逐字校正引號的要求。

## 偏離規格或自行決定的小事
- 現金股利的「怎麼來的」開頭加入代號與 STOCK_NAMES 名稱，沿用 cost.js 辨識持股的做法。
- 配股計算中的精確股數顯示千分位與固定小數二位。
- 未進行瀏覽器 smoke，依任務交由 Opus 執行。

## 需要 Opus 決定的事
- 依任務將兩張 PNG 轉為 img/dividend/comic.webp、img/dividend/step2.webp；本次未寫入 img/，頁面已使用這兩個預定路徑。
- 更新 js/data/tools.js 的 dividend status，並執行瀏覽器 smoke 與頁面目視檢查。
