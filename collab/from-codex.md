## 完成項
- ③「定期配比再平衡」改為四步精靈：選配置、你的持股、現金與目標比例、多久配回一次（日期選填）。
- 支援混合多檔持股、模板切換、空白股數當 0、代號自動抓價、比例即時加總、零股／整張，以及逐檔買賣、現金與曝險解說。
- 計算與驗證只呼叫既有 rebalancePlan；未修改 core。
- betaHoldingsInput 新增 kind: 'mix'，stock／lever 的既有行為、欄名與 class 保留。
- 更新③ oneLine、兩張完整圖文 alt 與頁尾「怎麼讀」。
- 兩張卡通圖已生成、目視核對並存入指定位置。

## 修改檔案
- js/pages/rebalance.js
- js/ui/wizard.js
- js/data/tools.js（只修改③ oneLine）
- docs/figures/cartoon/out/rebalance-comic.png
- docs/figures/cartoon/out/rebalance-step1.png
- collab/from-codex.md

## PROOF_CMD 結果
- npm.cmd test：tests 131 pass 131 fail 0（exit 0）
- 範例數字：850000 173,695 170200 1.08 1.10 2026-11-08 true（exit 0）
- node --check（兩檔）：js/pages/rebalance.js、js/ui/wizard.js 均無輸出，exit 0。
- git diff --check：exit 0，無空白錯誤；僅有頁面檔 LF 將轉為 CRLF 的提示。

## 生圖（每張重生幾次、有沒有殘留錯字）
- 使用內建 image_gen；每張提示均為 00-風格與角色.md 全文加該張提示檔全文，未另增文案。
- docs/figures/cartoon/out/rebalance-comic.png：1024×1536 PNG；生成 1 次、重生 0 次，目視未發現殘留錯字或數字差異。
- docs/figures/cartoon/out/rebalance-step1.png：1024×1536 PNG；生成 1 次、重生 0 次，目視未發現殘留錯字或數字差異。
- out 目錄受既有 Git 忽略規則影響，圖片已落地，但 git status 不會列出。

## 偏離規格或自行決定的小事
- 無功能規格偏離；比例加總在 body 尚未插入文件前用根節點 querySelector 計算，確保首次顯示即有數字。
- 依要求未上網查詢、未 commit、未執行 npm.cmd run smoke，未建立暫存檔。
- 未執行瀏覽器 smoke 或實際股價網路查詢；上述驗證為指定測試、範例運算與語法檢查。

## 需要 Opus 決定的事
- 無新增決策事項。請依原分工將兩張 PNG 轉為 img/rebalance/comic.webp、step1.webp，並執行 smoke；頁面已引用這兩個 WebP 路徑。
