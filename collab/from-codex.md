## 完成項
- 新增工具⑲退休提領四步精靈、輸入驗證、逐項結果解說、逐年表格、範例與圖文說明。
- 工具⑦新增停扣後再放年數、停扣後年報酬、期末資產說明，以及帶入退休提領的連結。
- 退休提領可接收網址 pool 參數，預填資產並允許修改。
- 兩張直式 1024×1536 PNG 已生成、檢視並存入指定位置。
- 未上網、未 commit、未執行 npm.cmd run smoke；未修改公式、共用元件、資料、樣式、測試或 img/。

## 新增／修改檔案
- 新增 tools/retire.html
- 新增 js/pages/retire.js
- 修改 js/pages/dca.js
- 新增 docs/figures/cartoon/out/retire-comic.png
- 新增 docs/figures/cartoon/out/retire-step3.png
- 覆蓋 collab/from-codex.md

## PROOF_CMD 結果
- npm.cmd test：tests 95 pass 95 fail 0，結束碼 0。
- 範例數字：39875 65312 54875 4.79 4875 8777360 15466611 25，與預期完全相同。
- node --check：js/pages/retire.js 與 js/pages/dca.js 均無輸出、結束碼 0。
- 補充驗證：以 Node VM 與輕量 DOM／元件替身執行兩頁，確認範例結果可組裝、pool 帶入、零通膨／無其他收入／目標留白的隱藏分支、不足花費提示、停扣後結果與退休帶入連結；全部通過。未執行瀏覽器 smoke，未新增測試或暫存腳本。

## 卡通圖
- retire-comic.png：已生成／重生 1 次／最終自查未發現中文與數字錯字；重生針對標題冒號標點。
- retire-step3.png：已生成／重生 1 次／最終自查未發現中文與數字錯字；重生修正老師戴眼鏡，與四格角色保持一致。
- 使用內建 imagegen，提示為 00-風格與角色.md 全文加各張提示全文；重生分別補強標點、角色一致性要求。最終 PNG 均已複製至上述 repo 路徑。

## 偏離規格或自行決定的小事
- 無。

## 需要 Opus 決定的事
- 無。依既定分工，兩張 PNG 待 Opus 轉成 img/retire/comic.webp、img/retire/step3.webp，並執行 smoke；頁面已使用指定 webp 路徑。
