## 完成項
- 步驟 1：新增 15 筆術語，共 18 筆；保留原有 3 筆原文，只追加指定 related；移除必備詞測試的 todo 參數。
- 步驟 2：完成辭典頁、關鍵字篩選、計數、hash 定位與 2 秒提示樣式。
- 步驟 3：完成定期配比再平衡頁、日期輸入、模板連動名稱、範例、結果表與圖解；計算僅呼叫核心函式。
- 步驟 4：glossary、rebalance 改為 ready，更新 rebalance 的 terms；未 commit。

## 異動檔案
- M css/app.css
- M js/data/glossary.js
- M js/data/tools.js
- M tests/registry.test.js
- ?? js/pages/glossary.js
- ?? js/pages/rebalance.js
- ?? tools/glossary.html
- ?? tools/rebalance.html
- ?? collab/from-codex.md

## PROOF_CMD 輸出
- tests / pass / fail / todo：45 / 45 / 0 / 0。
- smoke：未取得結果。PowerShell 禁止執行 npm.ps1，改用 npm.cmd 執行相同 npm scripts；npm.cmd run smoke 輸出「node scripts/smoke.mjs」後持續無結果，停止後以 npm 離線模式重試仍相同，已中止。未修改或讀取 scripts/smoke.mjs，未新增套件。
- 替代驗證：以現有 Playwright 與本機 Chrome 實測 home、glossary、trigger5050、rebalance，4 頁均載入成功、390px 無水平溢出、page errors 0。此結果不冒充指定 smoke 腳本的輸出。
- git diff --check 通過。

## 手動確認
- glossary #hash 定位：瀏覽器控制服務無法連線，改用本機 headless Chrome 自動化實測。390px 開啟 #margin-call，目標頂端在視窗前 100px 內且含 flash 樣式；大小寫與前後空白篩選、無結果、hash 切換後清空篩選並顯示全部 18 詞均通過。未完成人工目視閃爍確認。
- ③ 換模板 label：本機 Chrome 實測 532-bond 顯示「正二市值／美債市值／現金市值」；帶入範例後恢復「原型市值／正二市值／現金市值」。範例目標 430,000／258,000／172,000 與調整金額 20,000／48,000／28,000 均通過；日期變更會更新尚未到期提示；全頁只有週期欄位一顆 ⓘ。

## 自行決定的小事
- 新增詞的 plain 使用不含其他術語的白話；數字與事實依任務書保留。
- 無效的 hash 編碼直接略過；重複定位同一詞會重設 2 秒提示計時。
- 結果表使用固定欄寬與必要時換行，避免 390px 水平溢出。
- 所有一次性驗證程式均透過 stdin 執行，未在 repo 留下暫存腳本。

## 需要決定的事
- 指定 smoke 腳本啟動後無結果，且任務書禁止讀取該檔，如何完成剩餘驗收？選項：① 授權讀取 scripts/smoke.mjs 診斷；② 由 Opus 在原驗收環境重跑。建議①；目前保留實作及替代瀏覽器驗證結果，尚不能宣告指定 smoke 驗收通過。
