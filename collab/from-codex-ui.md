# UI 任務回報

日期：2026-11-25。依 `collab/to-codex-ui.md` v2 執行，未 commit。

## 完成項

- 配色：淺色與兩處深色 tokens 已改為指定的海軍藍、暖金與米白；保留 ok／warn／bad 及背景色，移除舊橘紅，陰影保留原尺寸。
- 點綴：完成首頁標題金底線、群組左色條、工具卡上框、捷徑底色、工具標題、hero 樣式及每日固定輪換標語；首頁卡片維持不顯示編號。
- 三張圖：以內建 imagegen 製作，PNG 均為 1536×1024，已存於 `docs/figures/cartoon/out/home-hero.png`、`docs/figures/cartoon/out/dca-joy.png`、`docs/figures/cartoon/out/retire-joy.png`；以 Python PIL 的 quality=80、method=6 轉存至 `img/home/hero.webp`、`img/dca/joy.webp`、`img/retire/joy.webp`。
- 放圖：首頁主圖置於 site-sub 與 shortcuts 之間；dca、retire 圖置於 toolHeader 之後，附白話 alt 與指定風險 caption；已用指定產生器更新 sw.js，152 個預快取檔案，版本 e8a44a45a089。

## PROOF_CMD 輸出

- check-ui 最後一行：`NG 1`（退出碼 1；前一行為 `FAIL 要有 .slogan 樣式`）。
- test：`ℹ pass 155`
- test：`ℹ fail 0`

check-ui 未達原訂 OK，原因是 `scripts/check-ui.mjs` 第 33 行的 .slogan 正規表示式結尾含實際退格字元 U+0008，並非反斜線加 b 的字界線。CSS 已有完整的 .slogan 規則。因任務禁止修改 scripts，原檔未改；僅在記憶體將該字元替換為預期字界線後，完整 check-ui 診斷輸出為 `OK`，不計為原始 PROOF_CMD 通過。

原始 check-ui 失敗後，另行執行 npm.cmd test，結果如上。三個頁面亦通過 node 語法檢查，git diff --check 無空白錯誤。未執行 smoke。

## 圖片自查

提示使用讀檔後的純文字：每張先貼 `docs/figures/cartoon/00-風格與角色.md` 全文，再貼各張原始提示；各張配色與尺寸例外優先。使用內建工具，未使用 CLI/API fallback。

| 圖片 | 最終提示來源 | 重生／修正次數 | 自查結果 |
| --- | --- | --- | --- |
| home-hero | `docs/figures/cartoon/home-01-持續投入到退休清閒.md` | 0 | 卡通；標題「持續投入，時間慢慢幫你」與小字「示意圖：投資有賺有賠，過去不代表未來」逐字相符；沒有額外文字、數字、真實品牌或節慶元素。 |
| dca-joy | `docs/figures/cartoon/dca-03-每月一點點.md`，再要求只將 11 個罐子修正為精確 12 個，保留角色、構圖、配色及原文 | 1 | 最終為 12 個透明罐子；標題「持續投資，年富一年」與小字「示意圖：投資有賺有賠」逐字相符；手機只有勾勾；沒有額外文字、數字、真實品牌或節慶元素。 |
| retire-joy | `docs/figures/cartoon/retire-03-退休清閒.md` | 0 | 卡通；標題「感謝過去的自己」與小字「示意圖：投資有賺有賠，提領要量力而為」逐字相符；沒有額外文字、數字、真實品牌或節慶元素。 |

PNG 已留在指定 out 目錄；該目錄的 PNG 依現有 .gitignore 忽略。未變更 .gitignore，未建立需清理的 repo 暫存檔。

## 需要決定的事

請維護者修正 `scripts/check-ui.mjs` 第 33 行的 U+0008 為正規表示式字界線，再重跑原始 PROOF_CMD。該檔在本任務禁止修改範圍內，因此未代改。
