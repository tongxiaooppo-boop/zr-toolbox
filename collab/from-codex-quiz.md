# 投資屬性測驗完成回報

## 完成項

1. 註冊與殼：在 basics 前加入 riskquiz；依 drawdown 殼新增頁面，替換 title 與頁面 script。
2. 精靈：從 QUESTIONS 產生 10 步單選題，使用 h() 組元素；保留已選值、以數字寫回答案，未選顯示指定錯誤；加入指定範例。
3. 結果：使用 scoreQuiz 與 allocationPlan，依序呈現屬性與封頂原因、三桶配置與比例條／例子卡、正2 四點檢核與六項提醒、RR 說明及隱私提示。比例條略過 0% 區段。
4. 怎麼讀卡與圖解：加入指定兩段說明；手寫三桶 SVG，提供 title、desc、完整 alt、透明背景、深色模式及兩組示意比例，無外部資源或動畫。
5. CSS：僅在檔尾新增本頁 class；單選列可整列點選，最小高度 44px，選中與鍵盤焦點有明顯樣式；比例條與 SVG 配色一致。窄螢幕三卡改單欄，欄位允許文字換行，小字未使用 --accent。390px 實機／瀏覽器視覺驗收留待 Opus smoke。
6. 參考資料：加入任務書指定五筆 references，末尾使用 disclaimer('general')。

## 新增／修改檔案清單

- 新增：tools/riskquiz.html
- 新增：js/pages/riskquiz.js
- 新增：img/riskquiz/buckets.svg
- 新增：collab/from-codex-quiz.md
- 修改：js/data/tools.js（只加一筆工具）
- 修改：css/app.css（只在檔尾新增本頁樣式）
- 修改：sw.js（由 node scripts/gen-precache.mjs 重產）

## PROOF_CMD

依序執行 node scripts/gen-precache.mjs，成功後執行 npm.cmd test（PowerShell 等效於任務書的 &&）。

- tests：170
- pass：170
- fail：0

補充檢查：node --check js/pages/riskquiz.js 與 git diff --check 通過。未新增測試；未執行 npm.cmd run smoke，依任務書交由 Opus 驗收。未 commit，無暫存檔。

## 偏離任務書的地方

無。

## 需要決定的事

無。
