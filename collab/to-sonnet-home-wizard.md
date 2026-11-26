# Sonnet 任務 A：首頁縮短（4 區收合）＋計算機「一頁看完」模式

- 版本：2026-11-26 v1（框架 commit e0c9dd4）。直接在 `D:\ok\zr-toolbox` 主目錄工作。**不要 commit、不要 stash／reset／checkout**；另一個 Sonnet（任務 B）同時在改其他檔。
- **只准修改**：`js/pages/home.js`、`js/ui/wizard.js`（只實作，不改檔頭規格與既有 export 簽名）、`scripts/smoke.mjs`、`css/app.css`（**只准在檔尾追加**，不改既有規則）。
- **不准改**：`js/data/`、`js/core/`、`tests/`、其他頁面、`sw.js`（最後由 Opus 重產）。暫存檔放 `D:\ok\zr-toolbox\.tmp-a\`，結束前刪掉。
- 不確定就停下回報，不要摸索其他檔案。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/home.js`（全檔，37 行）
- `js/data/tools.js` 第 1–20 行（`GROUPS`、`ZR_SUBS`）與檔尾 `SHORTCUTS`、`PATH`（約第 44–70 行）
- `js/ui/wizard.js` 第 1–20 行（**兩種型態的規格**）與第 100–175 行（`wizard()` 現行實作）
- `js/ui/components.js` 第 1–25 行（`h()`、`figure()` 介面）
- `scripts/smoke.mjs`（全檔，81 行）
- `css/app.css` 第 130–170 行（wizard 樣式）

## 1. 首頁（`js/pages/home.js`）

站名已改「股票兩三件事」（Opus 做好），不用再改。由上到下：

1. `h1.site-title`、`p.slogan`、`p.site-sub` 照舊。
2. 主圖 `figure.hero` 加 class `hero-small`（CSS 限制高度，手機不占第一屏，見第 4 節）。
3. **新手路線**：一列 5 顆按鈕（`第 1 步 認識自己` …），按一顆在下方展開該步的 question 與連結（同時只開一步；預設全收）。用 `<details>` 或按鈕＋`hidden` 皆可，不能用 innerHTML。連結內容規則照現行（只列 ready 的工具，沒有就「製作中」）。
4. **入門三件事**：`h2`「入門三件事」，底下 `GROUPS` 前 3 區（self、science、calc）；接著 `GROUPS` 第 4 區 zr。
5. 每區是 `<details class="group" id="<group.id>">`：`<summary>` 寫「`title`（N 個）」＋下一行小字 `line`；內容是卡片 `.cards`（卡片樣式照舊 `card()`）。**預設全部收合**。
6. zr 區內依 `ZR_SUBS` 分小標 `h3`（入門／做法／加槓桿），每個小標下放 `sub` 相符的卡片；三個常見問題捷徑（`SHORTCUTS`）移到 zr 區最上面。
7. 網址帶 `#self`／`#science`／`#calc`／`#zr` 時，自動打開那一區並捲過去（`hashchange` 也要處理）。
8. `disclaimer('general')` 照舊放最後。

## 2. 計算機兩種型態（`js/ui/wizard.js`）

**照檔頭第 1–20 行「兩種型態」規格實作**，`wizard({ steps, result, example })` 簽名不變，各頁不改。重點：

- 切換鈕 `.wizard-mode` 兩顆：「一步一步」「一頁看完」，`aria-pressed`；記在 `localStorage['zr-wizard-mode']`，讀寫都 try/catch，預設 `'steps'`。
- `'page'` 模式：每步一個 `fieldset.wizard-part[data-step]`；頂端「帶入範例」直接顯示結果；底部「算結果」依序 read，第一個錯的步驟顯示 `.wizard-error` 並 `scrollIntoView`；成功在下方 `.result` 顯示 `result(state)`。
- select／radio／checkbox 的 change → read 全部（錯誤不擋）→ 重畫該步後面的步驟。數字欄不重畫（避免游標跳走）。
- 「帶入範例」鈕兩種模式都放在 `.example-row` 裡（冒煙測試靠它）。
- `'steps'` 模式行為一點都不能變。

## 3. 冒煙測試（`scripts/smoke.mjs`）

- 首頁：卡片總數檢查照舊；另外檢查 `details.group` 有 4 個、全部預設收合；開 `index.html#calc` 後 `#calc` 是打開的。
- 每個有 `.wizard-mode` 的頁：現有「一步一步」帶入範例檢查照舊；**再**點「一頁看完」→ 點 `.example-row button` → `.result` 有內容且不是 `.error`；檢查完把 localStorage 清回 `'steps'`。
- 輸出格式照舊（`smoke pages N pass N fail 0`）。

## 4. CSS（`css/app.css` 檔尾追加）

`.hero-small img` 手機最高約 180px、`object-fit: cover`；`.path-steps` 按鈕一列可換行；`details.group > summary` 像卡片標題（大字、可點、有展開箭頭）；`.wizard-mode` 兩顆按鈕並排、被選的用既有主色；`.wizard-part` 之間有分隔。沿用既有色票變數，不新增顏色。手機 390px 不能水平捲動。

## 5. PROOF_CMD

```
cd /d/ok/zr-toolbox && node --test 2>&1 | grep -E "^ℹ (pass|fail)|^✖" ; node scripts/smoke.mjs | tail -3
```

預期：tests 只有 1 個 fail＝`pwa: sw precaches…`（Opus 最後重產 sw.js，**不要去修**），其餘全過；smoke 最後一行 `smoke pages 29 pass 29 fail 0`（任務 B 同時在改其他頁，若別頁失敗原因跟你無關，照實寫進回報）。

## 6. 回報（直接回在對話，欄位固定，不貼程式碼）

完成項（對照第 1–4 節）／修改檔案清單／tests pass、fail（列 fail 名稱）／smoke 輸出最後一行與失敗頁／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
