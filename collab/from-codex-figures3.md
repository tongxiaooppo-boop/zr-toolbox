# figures3 完成回報

完成張數：4／4。使用內建 imagegen，未使用 CLI/API fallback，未 commit。

| 檔名（PNG → WebP） | 重生次數 | 最終圖中文字與任務第 2 節完全一致 | 最終圖有無綠色 |
| --- | --- | --- | --- |
| docs/figures/cartoon/out/basics-fund.png → img/basics/fund.webp | 1 | 是，含所有冒號與標點，無額外文字或數字 | 無 |
| docs/figures/cartoon/out/basics-sign.png → img/basics/sign.webp | 1 | 是，三個分支均保留全形冒號 | 無 |
| docs/figures/cartoon/out/products-careful.png → img/products/careful.webp | 1 | 是，三個問題與老師對話逐字核對 | 無 |
| docs/figures/cartoon/out/products-no.png → img/products/no.webp | 0 | 是，標題、四警示牌、橫幅與老師對話均完整 | 無 |

四張最終 PNG 皆為直式 1024×1536，已目視確認扁平卡通、小安與老師。重生次數不含首次生成。未採用的版本未放入專案：fund 首版有綠色灌木及額外交易所招牌；sign 首版漏三個冒號；careful 首版多出小安旁的問號。最終版皆已修正。no 的警示三角形含驚嘆號圖示，日曆只有空白格，無額外日期數字。

提示檔：

- docs/figures/cartoon/basics-07-基金與衍生商品三件事.md
- docs/figures/cartoon/basics-08-買正2融資借券各要多做什麼.md
- docs/figures/cartoon/products-03-先弄懂再碰.md
- docs/figures/cartoon/products-04-新手不建議.md

每份提示最前面均完整貼上目前的 00-風格與角色.md，先存檔再讀回，將純文字原文直接送入 imagegen；未經 PowerShell 變數傳遞。三份重生提示已附修正要求。WebP 使用 Python PIL、quality=80、method=6，檔案大小依序為 188750、154630、118294、140684 bytes。

頁面整合：basics.js 新增 fund、TERM_FIGS 與術語插圖位置；products.js 新增 LEVEL_FIGS 與分層插圖位置，內容照任務書。已用修改前內容比對，確認兩個 JS 檔僅有指定插入。sw.js 僅以 node scripts/gen-precache.mjs 重產：202 個檔案，版本 cdb5d5ee4da9。

PROOF_CMD 輸出：

- OK 4 webp 6 places sw
- ℹ tests 218
- ℹ suites 0
- ℹ pass 218
- ℹ fail 0
- ℹ cancelled 0
- ℹ skipped 0
- ℹ todo 0
- ℹ duration_ms 1108.634
- 檢查及 npm.cmd test 結束碼皆為 0。依任務未跑 smoke。

偏離任務書的地方：PROOF_CMD 的 Node 檢查與 npm.cmd test 分兩個指令順序執行，內容與順序相同。另依執行環境規範讀取 imagegen SKILL.md，並在初始階段查詢 AGENTS.md 與列出提示檔目錄；未讀取其他專案檔案內容。未新增暫存檔。

需要決定的事：無。
