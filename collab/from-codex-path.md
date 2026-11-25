# 科普梳理與投資屬性頁完成回報

## 完成項（A、B 逐條）

- A1：㉗ `riskprofile` 狀態由 `planned` 改成 `ready`，新增 HTML 殼，標題與模組路徑依任務書設定。
- A2：用 `h()` 完成投資屬性科普頁，依序包含頁首、結論與測驗連結、目錄、RR 分級、三桶圖與商品展開說明、屬性對應商品、限制、路線導覽、參考資料及免責聲明。文案與數字直接取自既有資料檔，未修改。
- A3：在測驗頁「怎麼讀」卡末新增通往㉗的連結。
- B1：首頁 hero 後、捷徑前新增新手路線，依 PATH 顯示步驟、問題與 ready 工具連結；沒有 ready 工具的步驟顯示「製作中」。其他首頁內容保留。
- B2：riskquiz、riskprofile、basics、products、etf101、zr101、decay、loans 共 8 頁加入 pathNav，放在參考資料前；decay 沒有參考資料，放在免責聲明前。
- B3：兩個辭典的頁首說明區各新增任務書指定的互連段落。basics 原有的辭典連結段落依「只加一段」要求保留。
- B4：僅在 CSS 檔尾新增路線樣式，步驟保留間距，問題獨立一行，連結可換行，導覽沿用 card 外觀且標題較小；未使用 accent 作為小字文字色。
- sw.js 已由指定腳本重產。未 commit。

## 新增修改檔案清單

新增：

- `tools/riskprofile.html`
- `js/pages/riskprofile.js`
- `collab/from-codex-path.md`（A、B 合併回報，未另建 from-codex-riskprofile.md）

修改：

- `js/data/tools.js`（僅 riskprofile 的 status）
- `js/pages/home.js`
- `js/pages/riskquiz.js`
- `js/pages/basics.js`
- `js/pages/products.js`
- `js/pages/etf101.js`
- `js/pages/zr101.js`
- `js/pages/decay.js`
- `js/pages/loans.js`
- `js/pages/glossary.js`
- `css/app.css`（僅檔尾追加）
- `sw.js`（腳本重產）

另建立空資料夾 `img/riskprofile/`，原因見下方。

## PROOF_CMD 的 tests、pass、fail

- 執行：`node scripts/gen-precache.mjs` 成功後執行 `npm.cmd test`（PowerShell 以成功條件銜接，等同任務書的 &&）。
- 最終結果：tests 172、pass 172、fail 0。
- precache：159 個檔案，版本 `3c15cf7ae84d`。
- 額外檢查：10 個新增或修改頁面腳本全部通過 node --check；確認 8 頁都有對應 pathNav 呼叫；git diff --check 通過。
- smoke 依任務書由 Opus 執行，本輪未執行瀏覽器 smoke，亦未實測 390px 的水平捲動；CSS 已設定窄螢幕換行，仍請於該輪確認。

## 偏離任務書的地方

- 額外建立空資料夾 `img/riskprofile/`。首次測試為 tests 172、pass 171、fail 1，唯一失敗是 registry 檢查要求每個 ready 工具有自己的圖片資料夾。依任務書仍共用 `img/riskquiz/buckets.svg`，未新增圖片或修改測試；建立空資料夾後全數通過。

## 需要決定的事

- 空資料夾不會被 Git 追蹤；目前工作區測試全過，但新的 Git checkout 不會保留 `img/riskprofile/`。後續需決定是否授權新增該目錄的佔位檔，或調整 registry 規則以接受共用圖片。本輪未越過檔案白名單新增佔位檔，也未修改 tests。
