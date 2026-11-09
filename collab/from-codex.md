## 完成項

- 完成⑯股價估價、⑰股利要怎麼報稅、⑱換匯成本與海外損益：三步精靈、範例、結果解說、比較／損益表、完整圖文替代文字和頁尾「怎麼讀」。計算只呼叫既有 core。
- 估價代號同時查收盤價和比率；可反推每股數字、套用歷史分位數。換匯可依日期查牌告，第三步在兩格均空白時查最新匯率。
- 三份 HTML 沿用 kelly，只替換 title 與頁面 script。
- 六張卡通 PNG 已生成、逐張檢視並確認尺寸，存入指定 out 目錄。
- 已完成指定 PROOF_CMD；未上網查資料、未 commit、未執行 smoke。

## 修改檔案

- js/pages/valuation.js（新增）
- js/pages/divtax.js（新增）
- js/pages/fx.js（新增）
- tools/valuation.html（新增）
- tools/divtax.html（新增）
- tools/fx.html（新增）
- docs/figures/cartoon/out/valuation-comic.png
- docs/figures/cartoon/out/valuation-step3.png
- docs/figures/cartoon/out/divtax-comic.png
- docs/figures/cartoon/out/divtax-step3.png
- docs/figures/cartoon/out/fx-comic.png
- docs/figures/cartoon/out/fx-step1.png
- collab/from-codex.md（覆蓋）

未修改 core、net、ui、data、tests、img、CSS 或其他頁面。

## PROOF_CMD 結果

- npm.cmd test：tests 155 pass 155 fail 0（exit 0）。
- 範例數字：cheap-fair,fair-expensive,fair-expensive 8120 100800 combined 15400 30（exit 0）。
- node --check（三檔）：valuation.js、divtax.js、fx.js 全部 exit 0，無輸出。
- 額外離線驗證：使用暫存 mock DOM 執行三頁的範例結果、三步 body/read，並檢查估價舊回應、代號清空後來源清除、換匯舊回應及手動改值後待回應不覆寫，全部通過。暫存檔已刪除。未跑瀏覽器 smoke，也未實際呼叫 FinMind。

## 生圖（每張重生幾次、有沒有殘留錯字）

使用內建 image_gen，未使用 CLI／API fallback。提示組合為 docs/figures/cartoon/00-風格與角色.md 全文＋to-codex.md 第 5 節對應提示檔全文；估價步驟圖另補「老師不戴眼鏡，其餘文字及構圖保留」的修正提示。

首輪六次呼叫因 PowerShell 回傳文字帶有包裝屬性，提示被序列化成物件字串，產生不符題意的圖片，均未交付。修正後重新生成六張，以下次數將該次重新生成計入：

| 檔名（均存於 docs/figures/cartoon/out/） | 重生次數 | 檢查結果 |
| --- | --- | --- |
| valuation-comic.png | 1 | 1024×1536 PNG，逐項檢查，未發現殘留錯字或數字錯誤 |
| valuation-step3.png | 2 | 1024×1536 PNG；第二次移除老師眼鏡，與同工具四格圖一致；未發現殘留錯字或數字錯誤 |
| divtax-comic.png | 1 | 1024×1536 PNG，逐項檢查，未發現殘留錯字或數字錯誤 |
| divtax-step3.png | 1 | 1024×1536 PNG，逐項檢查，未發現殘留錯字或數字錯誤 |
| fx-comic.png | 1 | 1024×1536 PNG，逐項檢查，未發現殘留錯字或數字錯誤 |
| fx-step1.png | 1 | 1024×1536 PNG，逐項檢查，未發現殘留錯字或數字錯誤 |

## 偏離規格或自行決定的小事

- 換匯變更幣別／即期或現鈔後，清除舊的「現在」匯率，避免沿用不同幣別／種類的數字；第三步重新抓取。
- 換匯查詢期間手動編輯匯率會取消該回應的覆寫資格。
- 換匯範例手續費的負零顯示成「+0」。
- 未追加 CSS；沿用既有 triple、trade-table 等樣式。
- 生圖已授權使用內建功能；未另外連網查證稅務資料，所有年度參數與提醒照既有核心及任務文字呈現。

## 需要 Opus 決定的事

- 依原分工：將六張 PNG 壓縮／轉成 WebP 並搬到 img/valuation、img/divtax、img/fx 的指定名稱；頁面已引用該目標路徑。
- 依原分工：更新 tools.js 的 status，執行 npm.cmd run smoke，確認桌面與手機版面及真實 FinMind 串接。
- 無需改動禁止修改的檔案；沒有其他阻塞事項。
