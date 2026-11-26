# 卡通補圖任務回報

完成張數：14／14。已新增 14 份提示檔、14 張 PNG、14 張 WebP。全部為直式 1024×1536；WebP 依指定使用 Pillow、quality=80、method=6 轉換，大小均超過 20,000 bytes。未修改頁面程式、未把圖片放進頁面、未 commit。

每張：以下檔名的 PNG 均位於 `docs/figures/cartoon/out/`；提示檔均位於 `docs/figures/cartoon/`。文字一致性以最終成圖逐字目視核對，包含標點；換行與字距屬排版。

| 提示檔 | PNG 檔名 | WebP | 重生幾次 | 圖上的字是否跟第 2 節完全一致 |
| --- | --- | --- | ---: | --- |
| crash-01-正2跌得比大盤深.md | crash-zr.png | img/crash/zr.webp | 0 | 是，目視一致 |
| crash-02-跌的時候腦袋想逃.md | crash-mind.png | img/crash/mind.webp | 2 | 是，目視一致；已移除額外的「崩盤」，並修正老師輕拉手腕的動作 |
| crash-03-先檢查再決定.md | crash-check.png | img/crash/check.webp | 0 | 是，目視一致 |
| riskprofile-01-RR等級階梯.md | riskprofile-rr.png | img/riskprofile/rr.webp | 2 | 是，目視一致；已針對長橫線及括號重生修正 |
| riskprofile-02-屬性要對上商品.md | riskprofile-match.png | img/riskprofile/match.webp | 0 | 是，目視一致 |
| loans-03-跌太多會被追繳.md | loans-call.png | img/loans/call.webp | 2 | 是，目視一致；已移除證書額外的「股票」兩字 |
| loans-04-賺賠都放大.md | loans-worst.png | img/loans/worst.webp | 0 | 是，目視一致 |
| etf101-03-費用每天從淨值扣.md | etf101-cost.png | img/etf101/cost.webp | 1 | 是，目視一致；已補回老師對話最後的句號 |
| etf101-04-配息不是多賺.md | etf101-dividend.png | img/etf101/dividend.webp | 0 | 是，目視一致 |
| zr101-03-開始前要知道.md | zr101-risks.png | img/zr101/risks.webp | 0 | 是，目視一致 |
| basics-03-T加2交割.md | basics-settle.png | img/basics/settle.webp | 0 | 是，目視一致 |
| riskquiz-01-10題找出屬性.md | riskquiz-comic.png | img/riskquiz/comic.webp | 0 | 是，目視一致 |
| recover-01-虧了之後三條路.md | recover-comic.png | img/recover/comic.webp | 0 | 是，目視一致 |
| yearcheck-01-年初100萬.md | yearcheck-comic.png | img/yearcheck/comic.webp | 0 | 是，目視一致 |

PROOF_CMD 輸出：`OK 14 webp`。

偏離任務書的地方：內建 imagegen 會先將生成結果存入 `C:\Users\Max\.codex\generated_images\`，無法指定初始儲存位置；已將所有採用的最終 PNG 複製至任務指定的 repo 路徑。工具要求保留原始生成檔，故該工具目錄內原檔仍保留。本 repo 內的暫存腳本已刪除。生圖採用內建 imagegen，提示先存檔、讀回，再以純文字字串傳入；未使用 PowerShell 變數傳遞提示。依執行環境規範另讀取 imagegen 的 SKILL.md；未讀取其他專案原始碼。

需要決定的事：無。
