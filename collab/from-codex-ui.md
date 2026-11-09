# UI v1 完成交接（2026-11-09）

## 第 2 節完成項

1. 做了：卡片與輸入框採 3px 框、6px／4px 圓角，卡片 5px 硬陰影。
2. 做了：主色改成指定橘紅，主要按鈕文字使用 --on-accent 黑色。
3. 做了：每個 explain 是粗框硬陰影卡，以 :has(.metric.<tone>) 決定底色；數字 28px／900，內層 metric 無框無底，result 間距 16px。
4. 做了：info 結果卡與獨立 metric 使用 --info-bg；獨立 metrics 保留網格、數字 20px。
5. 做了：進度方塊高 12px、2px 框，完成／目前填橘紅，目前加小硬陰影。
6. 做了：primary／secondary 有 3px 硬陰影，按下位移 3px 並移除陰影，減少動態模式取消位移。
7. 做了：表格外框 3px，table-wrap 內的表格移除自身框；表頭橘紅黑字、列線 2px，一般表格固定欄寬並可斷行。
8. 做了：首頁工具卡粗框硬陰影，hover／focus 位移 -2px、陰影 7px；planned 保留半透明；分組標題粗字、捷徑 2px 框。
9. 做了：wizard-help／help-card／term-card／step-about 淺藍底、2px 框；help-btn 4px 圓角、2px 框。
10. 做了：holding 使用 2px 框與卡片底；wizard-error 粗框粗字紅底，移除 min-height 並以 :empty 隱藏。
11. 做了：figure 圖片 3px 框、4px 圓角；折線 s0／s1／s2 對應 accent／muted／warn。
12. 做了：指定離線系統字型，標題 900、按鈕與標籤 700，數字 tabular-nums；無新增外部資源。

## 第 4 節完成項

1. 做了：article 長文標題、段落、清單、引言與圖片樣式。
2. 做了：compare-wrap 內部水平捲動、3px 框與硬陰影，表格至少 900px；第一欄 sticky，首格表頭維持橘紅底且提高 z-index。
3. 做了：refs 頁底卡，16px 標題、14px 清單及 muted 備註。
4. 做了：references(items) 以 h() 建立節點，支援選填 note、純文字名稱、安全新視窗連結；非 https:// 開頭拋出指定錯誤。其餘既有函式未改。

## PROOF_CMD 輸出

- check-ui 最後一行：OK
- gen-precache：sw.js：124 個檔案，版本 94899d89a158
- tests 155
- pass 155
- fail 0

額外以記憶體 DOM 替身核對 references 結構、純文字、安全連結屬性、選填備註，以及 http／javascript／null 的拒絕行為，通過。無新增測試檔。

## 自行計算對比值

依 WCAG sRGB 相對亮度公式計算，以下各行依序為淺色／深色；指定 token 數值未修改。

- 一般文字／頁面底色：17.12:1／16.46:1。
- 一般文字／卡片底色：18.88:1／14.51:1。
- muted／卡片底色：9.74:1／9.48:1。
- muted／soft 或 info 底色：8.28:1／5.42:1。
- muted／ok 底色：8.08:1／5.98:1。
- muted／warn 底色：7.55:1／6.52:1。
- muted／bad 底色：7.48:1／9.13:1。
- ok 大數字／ok 底色：6.96:1／6.02:1；淺色依任務指定改用 #0a5a28，深色用 --ok。
- ok 獨立數字／info 底色：7.13:1／5.46:1。
- bad 大數字與錯誤文字／bad 底色：4.52:1／6.76:1。
- bad 獨立數字／info 底色：5.01:1／4.01:1；獨立數字 20px、900，達大字 3:1。
- warn 註記／卡片底色：5.76:1／9.84:1。
- warn 註記／頁面底色：5.22:1／11.16:1。
- 按鈕及表頭黑字／accent 底色：6.09:1／7.36:1。
- info 卡一般文字／info 底色：16.06:1／8.30:1。
- warn 卡一般文字及大數字／warn 底色：14.64:1／9.99:1。
- 原 accent／卡片底色：3.10:1／6.24:1。淺色小字未達 4.5:1，因此連結、編號、map、info-chip 改用 --text；橘紅保留於連結底線、底色、焦點及線圖。
- 圖例文字改為 --muted，色條仍維持 accent／muted／warn，避免淺色橘紅小字對比不足。

## 版面與範圍

- app.css 行數：改前 150 → 改後 183。
- 保留 ≥900px 左右兩欄與 sticky 說明欄，結果頁維持單欄；輸入字級 16px。
- 一般互動元件至少高 44px；help-btn／link-button／info-chip 至少高 32px；焦點框使用指定 3px accent。
- 手機以 minmax(0,...)、可收縮欄位、文字斷行及固定一般表格欄寬防止外溢；只有 compare-wrap 設定水平捲動。
- 僅修改 css/app.css、js/ui/components.js，以及腳本產生的 sw.js；另新增本回報。
- 未連網、未 commit、未跑 smoke；未執行瀏覽器視覺與 390px 實測，依任務由 Opus 跑 smoke 並截圖確認。
- 無產生暫存檔。

## 需要決定的事

無。
