## 完成項
- 完成平均成本與攤平三步驟精靈，包含分次買進、費率設定、再買與目標均價試算、逐項結果解說及明細表。
- 兩張卡通 PNG 已生成並逐張目視自查，皆為 1024×1536。
- 未上網瀏覽、未 commit、未跑 smoke，未修改核心、共用元件、資料、樣式或 img。
## 新增檔案
- tools/avgcost.html
- js/pages/avgcost.js
- docs/figures/cartoon/out/avgcost-comic.png
- docs/figures/cartoon/out/avgcost-step1.png
- collab/from-codex.md（覆蓋舊回報）
## PROOF_CMD 結果
- npm.cmd test：tests 101 pass 101 fail 0；結束碼 0。
- 範例數字：95.14 -30978 95.6 87.62 88.1 -31914 350498 1810 145006；結束碼 0，與預期完全一致。
- node --check：無輸出；結束碼 0。
## 卡通圖
- avgcost-comic.png：已生成／重生 0 次／目視自查未見錯字，數字與指定提示相符。
- avgcost-step1.png：已生成／重生 0 次／目視自查未見錯字，數字與指定提示相符。
- 使用內建 imagegen。最終提示：00-風格與角色.md 全文，分別接上 avgcost-01-越跌越買四格.md 全文、avgcost-02-均價要照股數算.md 全文，未另加提示。
- 最終圖片路徑：D:/ok/zr-toolbox/docs/figures/cartoon/out/avgcost-comic.png、D:/ok/zr-toolbox/docs/figures/cartoon/out/avgcost-step1.png。
## 偏離規格或自行決定的小事
- 無。
## 需要 Opus 決定的事
- 無。依原定分工，請 Opus 將兩張 PNG 轉成 img/avgcost/comic.webp、img/avgcost/step1.webp，並執行 smoke；本次未做瀏覽器視覺驗證。
