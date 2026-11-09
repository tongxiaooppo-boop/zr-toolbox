## 完成項
- 工具②整檔改為 v5.6 三步驟精靈，結構依 pledge.js 樣板。
- 基準價支援買入價、日期收盤價與手動輸入；日期抓價附查詢狀態、前交易日提示與過期回應防護。
- 結果顯示相對基準價漲跌、觸發判斷、買賣股數、配回後金額、下次觸發價及疑似分割提醒。
- 保留舊圖與原有說明，加入卡通圖引用、策略比較連結與一般免責聲明。
- 兩張卡通圖均使用內建 imagegen，提示為共用風格全文＋各張提示全文；四格漫畫重生時另加文字完整性要求。

## 新增／修改檔案
- js/pages/trigger5050.js
- docs/figures/cartoon/out/trigger-comic.png
- docs/figures/cartoon/out/trigger-step2.png
- collab/from-codex.md

## PROOF_CMD 結果
- npm.cmd test：tests 122 pass 122 fail 0（exit 0）。
- 範例數字：0.5249999999999999 true -861 -26260.5 126260.5 15.25 45.75 false（exit 0，符合預期）。
- node --check：無輸出，exit 0。
- 額外格式確認：fmtPct(0.525)＝52.5%；頁面加正號後為 +52.5%；fmtMoney(126239.5)＝NT$ 126,240。

## 卡通圖
- trigger-comic.png：已生成，1024×1536 PNG；重生 1 次；目視自查未見錯字，指定數字均正確。已存 docs/figures/cartoon/out/trigger-comic.png。
- trigger-step2.png：已生成，1024×1536 PNG；重生 0 次；目視自查未見明顯錯字，三條路與分割警告完整。已存 docs/figures/cartoon/out/trigger-step2.png。

## 偏離規格或自行決定的小事
- 日期上限依 Asia/Taipei 時區產生。
- 除 seq 防舊回應外，切換來源、手動改基準價、離開步驟也會防止舊查詢覆蓋內容；查詢例外顯示可手動填價的提示。
- 圖中文字有換行、等號寬度與省略號字形排版差異；未見內容或數字錯誤。
- 依指示未上網、未 commit、未執行 smoke；沒有建立一次性腳本或暫存檔。內建生圖工具的原始輸出依工具機制保留在預設 generated_images 目錄，交付圖已複製至指定 repo 路徑。

## 需要 Opus 決定的事
- 請將兩張 PNG 轉成 img/trigger5050/comic.webp 與 step2.webp；本次依指示未改 img/、未轉檔。
- 請執行 smoke，確認精靈桌機／手機版面與實際日期抓價互動；本次僅執行指定 PROOF_CMD 與圖片目視自查。
