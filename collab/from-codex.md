## 完成項
- 步驟 1 改為提示使用券商 App 現在的股數與成本均價。
- 日期抓價後查詢股票事件，透過 normalizeEvents、adjustBasePrice 換算並帶入四位小數基準價，列出事件與非交易日提示。
- 每次 await 後保留 seq、來源與節點連線檢查；兩次查詢回傳 clearToken 時皆清除 token。
- 事件查詢失敗時清空基準價與換算紀錄；切換為 buy／manual 或手動改價時清除換算紀錄。
- 結果在相對基準價之前顯示事件換算依據，有除權息事件時提示將現金股利加入策略現金。
- 更新手動價格說明及疑似分割的兩條處理路徑，仍不顯示疑似分割的買賣股數。
- example 未修改；既有範例測試通過，維持 +52.5%、賣 861 股、下次 15.25／45.75。

## 修改檔案
- js/pages/trigger5050.js
- collab/from-codex.md

## PROOF_CMD 結果
- npm.cmd test：tests 125 pass 125 fail 0（exit code 0）
- 換算數字：分割（約 1 股拆成 22 股） 17.0541 0.5421（exit code 0）
- node --check：無輸出，通過（exit code 0）
- git diff --check：通過。

## 偏離規格或自行決定的小事
- 開始有效日期查詢時先清除舊的 baseRaw／baseEvents，避免查詢期間或失敗後仍宣稱舊價格已換算；收盤價查詢失敗仍保留 basePrice。
- 未上網、未 commit、未執行 smoke，未建立暫存檔。

## 需要 Opus 決定的事
- 無；smoke 依指示留給 Opus 執行。
