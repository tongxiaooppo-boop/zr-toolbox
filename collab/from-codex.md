## 完成項
- 新增工具⑦「定期定額與年化報酬」精靈頁，依 dividend.js 樣板完成三步驟、欄位說明與指定驗證訊息。
- 結果呼叫既有 dcaPlan，包含七項說明（每月約可買依現價條件顯示）、逐年表格、四條注意事項與「怎麼讀」卡片。
- 逐年表格累計投入包含起始持股市值；頁面引用指定 WebP 路徑，未轉檔、未寫入 img/。
- 已生成並目視自查兩張直式 1024×1536 PNG。
- 未上網、未 commit、未執行 npm.cmd run smoke；未修改核心公式、tests/、js/ui/、js/data/、css/、img/。
## 新增檔案
- tools/dca.html
- js/pages/dca.js
- docs/figures/cartoon/out/dca-comic.png
- docs/figures/cartoon/out/dca-step3.png
- collab/from-codex.md（覆蓋交接回報）
## PROOF_CMD 結果
- npm.cmd test：tests 80 pass 80 fail 0，exit code 0。
- 範例數字：2278229 1200000 1680 1076549 3848563 3.26 20，exit code 0，與預期完全相同。
- node --check：無輸出，exit code 0。
## 卡通圖
- dca-comic.png：已生成／重生 0 次／自查無錯字，四格標題、對話、金額與底註均符合提示；PNG 尺寸 1024×1536。
- dca-step3.png：已生成／重生 0 次／自查無錯字，兩組各 12 個方塊與百分比、公式、標籤及底註均符合提示；PNG 尺寸 1024×1536。
- 使用內建 image_gen，未使用 CLI。完整提示分別為 00-風格與角色.md 全文＋dca-01-每月存五千四格.md 全文、00-風格與角色.md 全文＋dca-02-月報酬不是除以12.md 全文，未另改文案。
- 兩張 PNG 已存入上列 repo 路徑；git status --short 未列出 PNG（輸出目錄為忽略檔案），實體檔案已確認存在且尺寸正確。
## 偏離規格或自行決定的小事
- 初次 PowerShell 讀取任務檔因預設編碼顯示亂碼，隨即以 UTF-8 重讀。
- 讀檔時誤讀 js/core/holdings.js 全文，超過允許的第 1–5 行；未修改該檔。
- 為使用內建生圖，另讀 imagegen/SKILL.md；未讀其他未授權的專案內容。曾列出專案根目錄名稱與搜尋 AGENTS.md（未找到）。
- 無其他實作規格偏離；未留下暫存檔或一次性腳本。
## 需要 Opus 決定的事
- 無待決策事項。依原定分工，請將兩張 PNG 轉為 img/dca/comic.webp、img/dca/step3.webp，並執行 smoke 測試。
