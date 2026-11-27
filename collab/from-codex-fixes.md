# 頁面層 8 項修正回報

日期：2026-11-27。未 commit。

## 完成項

- F1：完成。一次投入比較值補上停扣後的複利期間，說明與收益同步調整；停扣後年數為 0 時維持原樣。
- F2：完成。holdingRow 在檢查代號格式前遞增查詢序號；兩處現價欄位手動輸入都會使舊查詢失效。
- F3：完成。積極型說明與配置查表說明依任務書原文替換。
- F4：完成。取整說明依原文替換，提醒另留手續費與證交稅。
- F5：完成。兩處總淨資產文案均改為「總淨資產是 0 或負的」。
- F6：完成。融資、融券及質押改用 r.called 判斷追繳；融資 longDrop >= 1 時顯示指定安全文案與說明，不顯示參考價。
- F7：完成。series 且 mdd 為 0 時顯示「這串紀錄沒有跌過」與指定 how，其他模式維持原樣。
- F8：完成。共用 TIMEOUT 改成 timeout()，FRED 每次請求建立新的逾時訊號；未執行 stress-update.mjs。

## PROOF_CMD 輸出

```text
OK 8 fixes
ℹ tests 215
ℹ suites 0
ℹ pass 215
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

F1–F8 每項修改完成後皆執行一次 npm.cmd test，八次均為 215 項通過、0 失敗。每次測試前僅以 node scripts/gen-precache.mjs 重產 sw.js，以同步資源版本。最後執行 PROOF_CMD 等效檢查及完整測試；九個修改的 JavaScript 檔案另通過 node --check 與 git diff --check。依指示未跑 smoke。

初始基線為 214 項、213 通過、1 失敗，失敗原因為 precache VERSION 過期；重產後通過。並行作業期間測試總數增為 215，故與任務書預期的 214 不同。本工作階段未修改 core、data、tests、css，也未改動另一工作階段的檔案；sw.js 由產生器按當時工作目錄內容更新。

## 偏離任務書的地方

- 使用者已確認 figures2 由另一工作階段處理，並指示「這邊只做 fixes」，因此未在此工作階段先完成補圖。
- PROOF_CMD 為適應 Windows PowerShell，將 && 改為依前一指令結束碼執行測試，F5 檢查的單引號改用 String.fromCharCode(39) 表達；檢查條件不變。
- 測試總數為 215，原因如上。其餘修正無偏離，無網路搜尋或網頁抓取，無新增暫存檔。

## 需要決定的事

無。
