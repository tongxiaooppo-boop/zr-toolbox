## 完成項
- ⑥、⑧ 整檔改成三步驟精靈，沿用 ② 的 steps／explain／example／怎麼讀結構。
- ⑥ 支援震盪／同方向、金額換算、選填內扣費用、原本折線圖及逐項解說。
- ⑧ 支援持股／最高點／跌幅／紀錄四種方式，含驗證、回本報酬、帳面虧損、選填回本年數、無虧損分支與對照表。
- 保留兩頁原有三段「怎麼讀」文字，更新漫畫與步驟插圖引用及完整文字 alt。
- 四張 PNG 已生成、目視校對並存入指定目錄，皆為 1024×1536。

## 修改檔案
- js/pages/decay.js
- js/pages/drawdown.js
- docs/figures/cartoon/out/decay-comic.png
- docs/figures/cartoon/out/decay-step1.png
- docs/figures/cartoon/out/drawdown-comic.png
- docs/figures/cartoon/out/drawdown-step1.png
- collab/from-codex.md

## PROOF_CMD 結果
- npm.cmd test：tests 138 pass 138 fail 0
- 範例數字：975279 950559 904382 -46177 0.25 0.3333 50000 3.7
- node --check（兩檔）：皆成功，無輸出。
- 額外以記憶體內元件替身檢查頁面接線、兩頁範例、⑥ 同方向／空白必填、⑧ 四種輸入／空白年報酬／已獲利／零跌幅／非數字紀錄，通過。這不是瀏覽器 smoke。
- git diff --check：無空白錯誤，僅 Git 的 LF→CRLF 提示。

## 生圖（每張重生幾次、有沒有殘留錯字）
- 使用內建 image_gen，未使用 CLI 或網路查詢。
- 提示集：每張均使用 docs/figures/cartoon/00-風格與角色.md 全文，加上 to-codex.md 第 3 節對應提示檔全文。
- decay-comic.png：重生 1 次。初版多加總標題，重生補充「只包含四格及最底小字，禁止增加文字和數字」。最終目視未見殘留錯字或數字錯誤。
- decay-step1.png：重生 0 次。目視未見指定文字或數字錯誤；生成器另加角色名牌「小安」「老師」。
- drawdown-comic.png：重生 1 次。初版第三格老師對話多出 %，重生補充第三格對話必須逐字相同、不可增加符號。最終目視未見殘留錯字或數字錯誤。
- drawdown-step1.png：重生 0 次。目視未見殘留錯字或數字錯誤。
- 最終檔案皆在上列 docs/figures/cartoon/out/ 路徑；未轉檔或搬到 img/。

## 偏離規格或自行決定的小事
- pct 模式填 0 時沒有買入價／最高點名稱，無虧損結果使用「剛好回到原本水準」，避免顯示 undefined。
- 第二步標題／提示／插圖隨第一步選擇更新；範例結果也同步這些資訊，避免從範例跳回第二步時沿用上一種模式的標題。
- ⑥ 未加入沒有用途的 named／price 及 STOCK_NAMES 匯入；依指定 import 清單保留所需輔助。
- 生圖的換行、字距與部分標點字形由生成器排版；decay-step1 另有上述角色名牌。
- 未改核心公式或其他禁止修改檔案，未 commit，未執行 smoke，未留下暫存檔。

## 需要 Opus 決定的事
- 四張 PNG 請依原分工轉成 WebP，搬到 img/decay/、img/drawdown/ 對應位置，並執行 smoke。頁面已引用這四個 WebP 路徑。
- docs/figures/cartoon/out/ 的 PNG 未出現在一般 git status 輸出中，交接時請確認四張實體檔一併收取。
