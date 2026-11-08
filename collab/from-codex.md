## 完成項
- 步驟 1：新增 tools/calc-guide.html 與 js/pages/calc-guide.js，依指定順序呈現開頭卡、圖解、目錄、逐欄教學、差異、FinMind token 教學與 executable 免責區；支援初始 hash 定位。頁殼保留 manifest、apple-touch-icon 與 pwa.js。CSS 僅在檔尾追加指定樣式，資料文案未修改。
- 步驟 2：僅將 calc-guide 卡片改為 ready，並填入指定的 8 個 terms；其他卡片未修改。未 commit，未執行 smoke。
## 異動檔案
- M collab/from-codex.md（本回報）
- M css/app.css
- M js/data/tools.js
- ?? js/pages/calc-guide.js
- ?? tools/calc-guide.html
## PROOF_CMD 輸出
- npm.cmd test：tests / pass / fail / todo：51 / 51 / 0 / 0。
## 畫面實測
- 區塊數（GUIDE_SECTIONS 卡片數）／欄位說明總數／差異條數／token 步驟數／錯誤條數：6／24／4／4／3。
- 有 ⓘ 的欄位數：8；另有 token 標題 1 顆，全頁共 9 顆。
- 使用記憶體 DOM 執行頁面並核對文案、節點數量、8 個目錄連結、免責區位於最後與初始 #token 定位，全部通過；另比對頁殼僅變更 title 與頁面 script。未進行瀏覽器視覺實測（環境未提供可直接使用的 Playwright 套件）；smoke 依任務書交由 Opus 執行。
## 自行決定的小事
- 無需新增套件或暫存檔；以記憶體 DOM 補查頁面組裝與資料文案。
## 需要決定的事
- 無
