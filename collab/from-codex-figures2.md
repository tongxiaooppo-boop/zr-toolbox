# figures2 完成回報

完成張數：4／4。新增 4 份提示、4 張 PNG、4 張 WebP；完成 7 處頁面引用。未 commit，未跑 smoke，未使用網路搜尋或網頁抓取。

使用內建 imagegen 生圖。每份提示檔最前面完整貼入共用風格，接著加入禁綠配色覆蓋；存檔後讀取純文字原文交給 imagegen，未透過 PowerShell 變數傳遞提示。最後兩次局部修正也由 imagegen 完成。PNG 全部為 1024×1536，WebP 全部使用 Python PIL、quality=80、method=6。

| 圖 | 提示檔（docs/figures/cartoon/） | PNG（docs/figures/cartoon/out/） | WebP | 重生次數 | 圖中文字與第 2 節完全一致 | 綠色 |
| --- | --- | --- | --- | --- | --- | --- |
| 開戶 | basics-04-開戶要開哪些戶頭.md | basics-market.png | img/basics/market.webp | 2 | 是，逐字目視核對含冒號、對話與手機標籤，僅依版面換行 | 無 |
| 成交順序 | basics-05-誰先成交.md | basics-match.png | img/basics/match.webp | 2 | 是，標題、兩個標籤、老師對話與標點皆一致 | 無 |
| 加權指數 | basics-06-加權指數大公司影響大.md | basics-company.png | img/basics/company.webp | 0 | 是，標題、箱子標籤與老師對話皆一致 | 無 |
| ETF 分割 | etf101-05-ETF分割.md | etf101-split.png | img/etf101/split.webp | 0 | 是，標題、前後標籤、總價值不變與老師對話皆一致 | 無 |

開戶首輪漏了四個框內的冒號；第一次重生修正冒號後，銀行圖案多出美元符號；第二次重生移除該符號，最終圖未留下額外文字或數字。成交圖首輪衣服偏橄欖綠；第一次重生改正配色，第二次重生把胸前牌子改成頭頂舉牌。最終四張皆為小安／老師的卡通插畫。

WebP 大小：market 161,466 bytes、match 153,076 bytes、company 122,684 bytes、split 135,594 bytes。

頁面修改：basics.js 只新增 FIGS 的 market、match、company；etf101.js 只新增 FIGS 的 trade、leveraged、borrow；zr101.js 只在 periodic 陣列第一項前加入再平衡圖。指定 alt／caption 照抄，borrow 沿用 loans.js 第 28 行，periodic 沿用 rebalance.js 第 138 行的 alt。

sw.js 僅以 node scripts/gen-precache.mjs 重產，輸出：sw.js：198 個檔案，版本 06fcf66b1442。

PROOF_CMD 最終輸出：

- OK 4 webp 7 places
- ℹ tests 215
- ℹ suites 0
- ℹ pass 215
- ℹ fail 0
- ℹ cancelled 0
- ℹ skipped 0
- ℹ todo 0
- 結束碼 0

另已通過三個修改頁面的 node --check。重產快取前曾先跑測試，僅快取 VERSION 過期一項失敗；重產後的指定完整驗證已全數通過。

偏離任務書的地方：目前專案實際測試數為 215，與任務書預期 212 不同，未修改 tests。Windows PowerShell 以分行及成功碼判斷取代 PROOF_CMD 中的 &&，執行內容與順序相同。其餘無。未留下 repo 暫存檔。

需要決定的事：無。
