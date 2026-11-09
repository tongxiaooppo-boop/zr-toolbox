## 完成項
- 依 dca.js 樣板新增融資融券維持率四步精靈：交易種類、信用庫存、融資與保證金、追繳規則與利息。
- 完成指定驗證訊息、融資／融券／整戶結果解說、七列漲跌情境表、範例與「怎麼讀」頁尾。
- 使用內建 image_gen 生成兩張直式 1024×1536 PNG，已目視核對文字與數字。
- 未上網、未 commit、未跑 smoke；未修改 core、tests、ui、data、css、img，未建立暫存腳本。

## 新增檔案
- tools/margin.html
- js/pages/margin.js
- docs/figures/cartoon/out/margin-comic.png
- docs/figures/cartoon/out/margin-step1.png
- collab/from-codex.md（依指示覆蓋既有回報）

## PROOF_CMD 結果
- npm.cmd test：tests 87 pass 87 fail 0（exit code 0）。
- 範例數字：126.67 236000 142169 780.00 400000 3205 7（exit code 0）。
- node --check：無輸出，exit code 0。

## 卡通圖
- margin-comic.png：已生成／重生 0 次／目視自查未發現錯字或數字錯誤；1024×1536 PNG，已存指定路徑。
- margin-step1.png：已生成／重生 0 次／目視自查未發現錯字或數字錯誤；1024×1536 PNG，已存指定路徑。
- 生圖方式：內建 image_gen，無 CLI/API fallback。每張提示皆為 docs/figures/cartoon/00-風格與角色.md 全文，加上對應 margin-01-融資追繳四格.md／margin-02-融資融券對照.md 全文，未另加創作要求。

## 偏離規格或自行決定的小事
- 無。

## 需要 Opus 決定的事
- 無。後續依原分工由 Opus 將兩張 PNG 轉為 img/margin/comic.webp、img/margin/step1.webp，並執行 smoke。
