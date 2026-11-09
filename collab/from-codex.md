## 完成項
- 完成 ⑬「人生槓桿體檢」四步精靈、結果逐項解說、範例及「怎麼讀」；計算只呼叫既有 core。
- 完成 ⑭「幾倍槓桿最划算」兩步精靈、凱利對照表、年化曲線、範例及「怎麼讀」；計算只呼叫既有 core。
- betaHoldingsInput 加入 kind:'life'；新增 debtsInput、readDebts，支援刪光、筆數上限、重新編號及依借款種類更新投資金額 placeholder。
- 完成兩個 HTML 入口，只替換模板的 title 和頁面 script 路徑。
- 完成四張 PNG；頁面引用指定 WebP 路徑，等待 Opus 轉檔搬入。

## 修改檔案
- js/ui/wizard.js
- js/pages/lifelev.js（新增）
- js/pages/kelly.js（新增）
- tools/lifelev.html（新增）
- tools/kelly.html（新增）
- docs/figures/cartoon/out/lifelev-comic.png（新增）
- docs/figures/cartoon/out/lifelev-step3.png（新增）
- docs/figures/cartoon/out/kelly-comic.png（新增）
- docs/figures/cartoon/out/kelly-step1.png（新增）
- collab/from-codex.md（覆蓋）

## PROOF_CMD 結果
- npm.cmd test：tests 145 pass 145 fail 0。
- 範例數字：1981000 1.52 7307 1.66 1.69 3.76 7（與指定輸出一致）。
- node --check（三檔）：js/pages/lifelev.js、js/pages/kelly.js、js/ui/wizard.js 均 exit 0，無輸出。
- git diff --check：通過，無輸出。
- 額外以暫存 Node 驗證器載入頁面，替代 DOM／呈現元件，檢查範例結果、必填欄位錯誤、選填收入／倍數、無持股／零資產及全凱利為零情境，全部通過。兩個 HTML 與模板逐字比較，確認只有 title 和頁面 script 不同。驗證器已刪除，未修改 tests/。
- 未跑瀏覽器視覺／互動測試；未跑 npm.cmd run smoke，留給 Opus。

## 生圖（每張重生幾次、有沒有殘留錯字）
- 使用內建 imagegen；每張最終提示均為「docs/figures/cartoon/00-風格與角色.md 全文＋對應提示檔全文」，未改寫提示內容。
- lifelev-comic.png：對應 lifelev-01-人生槓桿體檢四格.md；重生 0 次；目視未見殘留錯字或數字錯誤。
- lifelev-step3.png：對應 lifelev-02-借的錢拿去哪.md；重生 0 次；目視未見殘留錯字。
- kelly-comic.png：對應 kelly-01-幾倍最划算四格.md；重生 0 次；目視未見殘留錯字或數字錯誤。
- kelly-step1.png：對應 kelly-02-報酬和波動.md；重生 0 次；目視未見殘留錯字。
- 四張均存於 docs/figures/cartoon/out/，PNG、1024×1536。目錄被 Git 忽略，一般 git status 不會列出，實體檔案已交付。

## 偏離規格或自行決定的小事
- 未追加 CSS，沿用既有 holding-grid、field、trade-table 樣式。
- wizard.js 僅新增必要的 DEBT_KINDS import、擴充 betaHoldingsInput 與於檔尾新增借款元件；未變更檔頭註解及其他函式。
- 圖中老師的眼鏡有些微外觀差異：兩張步驟圖戴眼鏡、兩張四格圖未戴眼鏡；主要角色髮色與服裝仍一致。未因非文字差異重生。
- 遵守不上網、不 commit、不改 core／data／tests／img；暫存檔皆已刪除。

## 需要 Opus 決定的事
- 將四張 PNG 轉成 WebP 並搬入 img/lifelev/comic.webp、img/lifelev/step3.webp、img/kelly/comic.webp、img/kelly/step1.webp。
- 依原分工更新 tools.js 的 status，並跑 smoke／瀏覽器檢查。
- 若要求跨圖老師外觀完全一致，可再處理眼鏡差異；目前文字、數字已檢查通過。
