# 任務 UI v1：全站統一改成 Neo-brutalism（粗框硬陰影）＋科普用的三個樣式

- 版本：2026-11-09 v1（框架 v5.11）。**R5 做完才做這份**；回報寫 `collab/from-codex-ui.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑並截圖）。暫存檔只准放本 repo 內，結束前刪掉。
- 風格使用者已拍板（第 5 套），不要自己發明新風格。

## 0. 要讀的檔案（只准讀這些）

- `docs/ui/style-5-neo-brutalism.html`（**樣板**，第 11–39 行是風格本體，第 41–109 行是基礎版面）、`docs/ui/style-5-390.png`、`docs/ui/style-5-1280.png`
- `css/app.css`（全部，150 行）
- `js/ui/components.js`（全部）、`js/ui/wizard.js` 第 1–160 行（看結構與 class 名稱，**不要改**）
- `js/pages/home.js`、`index.html`、`tools/cost.html`（看首頁與一個工具頁的外框）

## 1. 要改的檔案

1. `css/app.css`：主要工作，**整份重寫**（保留所有現有 class 的功能，只換外觀）。
2. `js/ui/components.js`：只准**新增**一個函式 `references(items)`（見第 4 節），並在檔頭介面說明加一行；其他函式一個字都不准改。
3. 跑 `node scripts/gen-precache.mjs` 更新 `sw.js`（只准用腳本改，不准手改）。

不准改：`js/core/`、`js/pages/`、`js/ui/wizard.js`、`tests/`、`scripts/`、所有 `.html`、`img/`。真的覺得非改不可，停下寫進回報。

## 2. 現在醜在哪（Opus 對照樣板列的，全部要改掉）

1. 卡片、輸入框、按鈕都是 1px 淺灰框＋12px 大圓角，沒有層次 → 改 3px 黑框、6px 小圓角、`5px 5px 0` 硬陰影。
2. 主色是藍色 `#2563eb`（沿用舊計算機）→ 改橘紅 `#ff5a36`，按鈕文字黑色。
3. 結果 `.explain` 只有一條細線分隔、`.metric` 是淺藍小方塊，數字太小 → 每個 `.explain` 是一張粗框卡，大數字 28px 粗體，**依 tone 填底色**（見第 3 節）。
4. tone `info` 目前沒有任何樣式 → 補上（藍色資訊卡）。
5. 精靈進度點 `.wizard-dots` 是 6px 細條 → 12px 高、2px 黑框方塊，完成／目前填橘紅，目前那格加小硬陰影。
6. 按鈕沒有按下回饋 → `.primary`、`.secondary` 都有 3px 硬陰影，`:active` 位移 3px、陰影消失（`prefers-reduced-motion: reduce` 時不位移）。
7. 表格（`table`、`.trade-table`、`.pledge-table`）是細灰線 → 外框 3px（包在 `.table-wrap` 時框在 wrap 上；沒有 wrap 的 table 自己加框），表頭橘紅底黑字，列線 2px。
8. 首頁卡片 `.tool-card` 太平 → 同 `.card` 的粗框硬陰影；hover／focus 時位移 −2px、陰影變 7px；`.planned` 維持半透明。分組標題 `.group-title` 改粗黑字。捷徑 `.shortcuts a` 改成 2px 黑框小按鈕。
9. 說明欄 `.wizard-help`、`.help-card`、`.term-card`、`.step-about` → 淺藍 `--soft` 底＋2px 黑框。`.help-btn` 改 2px 黑框方角（4px）淺藍底。
10. 持股框 `.holding` → 2px 黑框、白底；`.wizard-error` → 3px 黑框粗體、紅底，**`min-height` 拿掉，空的時候不能佔位也不能顯示框**（用 `.wizard-error:empty{display:none}`）。
11. 圖 `.figure img` → 3px 黑框、4px 圓角。折線圖 `.chart` 顏色跟著新 token（s0＝accent、s1＝muted、s2＝warn）。
12. 字型：**不准用 Google Fonts 或任何外部字型**（App 要離線可用）。用系統字：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif`。標題 900、按鈕與標籤 700。數字 `font-variant-numeric: tabular-nums`。

## 3. Token（照抄，不准改數值）

```css
:root{--bg:#fff4c9;--card:#fff;--text:#111;--muted:#444;--line:#111;--accent:#ff5a36;--on-accent:#111;
  --ok:#0a7a35;--warn:#a84a00;--bad:#c00;--soft:#d9f0ff;--input:#fff;
  --ok-bg:#c7f5d3;--warn-bg:#ffe08a;--bad-bg:#ffd9d4;--info-bg:#d9f0ff;
  --r:6px;--r-in:4px;--bw:3px;--shadow:5px 5px 0 #111;--shadow-sm:3px 3px 0 #111;color-scheme:light}
/* 深色：兩處都要（跟系統、以及之後手動切換用） */
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){ …深色值… }}
:root[data-theme="dark"]{ …深色值… }
/* 深色值 */
--bg:#17141f;--card:#22202c;--text:#f5f2ff;--muted:#c9c4dd;--line:#f5f2ff;--accent:#ff7a59;--on-accent:#111;
--ok:#5ee08b;--warn:#ffc04d;--bad:#ff8a80;--soft:#2f4a66;--input:#17141f;
--ok-bg:#1f4a2e;--warn-bg:#4a3a12;--bad-bg:#3d1a1a;--info-bg:#2f4a66;
--shadow:5px 5px 0 #f5f2ff;--shadow-sm:3px 3px 0 #f5f2ff;color-scheme:dark
```

結果卡填色（`.explain` 裡第一個子元素是 `.metric.<tone>`，用 `:has()` 判斷，**不准改 JS**）：

| tone | 卡片底色 | 大數字顏色 |
|---|---|---|
| 無 | `--card` | `--text` |
| `info` | `--info-bg` | `--text` |
| `ok` | `--ok-bg` | `--ok`（淺色模式用 `#0a5a28` 確保在綠底上夠清楚） |
| `warn` | `--warn-bg` | `--text` |
| `bad` | `--bad-bg` | `--bad` |

`.explain` 內 `.metric` 不要再有自己的底色與框（卡片本身就是框）；`.metric small` 14px `--muted`、`.metric strong` 28px 900。`.explain p` 14px。`.ex-grid` 不存在，結果卡直接在 `.result` 裡堆疊，間距 16px（`.result{display:grid;gap:16px}`，`.result.error` 例外照舊）。單獨用的 `.metrics`／`.metric`（不在 `.explain` 裡）保持網格，每格同 info 卡樣式但小一號（數字 20px）。

## 4. 科普要用的三個新樣式＋一個元件（現在沒有頁面用，先做好）

- `.article`：科普長文容器。`h2` 20px 900、上方 24px 間距；`h3` 17px；段落 16px 行高 1.75；`ul/ol` 左縮 1.2em；`blockquote` 左邊 4px accent 粗線＋`--soft` 底；`img` 同 `.figure img`。
- `.compare-wrap`：寬比較表外框（R4 會有 11 欄 × 28 列）。`overflow-x:auto`、3px 框、硬陰影；裡面的 `table` 用 `table-layout:auto`、`min-width:900px`、儲存格 `text-align:left`、`vertical-align:top`、14px；**第一欄 sticky**（`position:sticky;left:0;background:var(--card)`，表頭第一格同時 sticky 且 z-index 較高）；表頭橘紅。這是全站唯一允許水平捲動的地方（捲的是 wrap，不是整頁）。
- `.refs`：頁底「參考資料」卡。`h2` 16px；`ol` 14px；每個連結後面接 `--muted` 小字說明。
- `components.js` 新增：

```js
// references(items)  頁底參考資料卡；items＝[{ name, url, note? }]，url 必須 https://；note 一句（例「做法出自」「數字查自 2026-11-09」）
// 回傳 <section class="card refs"><h2>參考資料</h2><ol><li><a href=url target=_blank rel="noopener noreferrer">name</a> <small>note</small></li>…</ol></section>
export function references(items) { … }
```
用 `h()` 組，不准 innerHTML；url 不是 `https://` 開頭就 `throw new Error('references 需要 https 網址')`。

## 5. 版面不能壞

- 390px 寬不能出現整頁水平捲動（`.compare-wrap` 內部捲動除外）；`input` 字級至少 16px（iOS 才不會自動放大）。
- 桌面 ≥900px 的左右兩欄（`.wizard-layout`）、說明欄 sticky 保持現狀。
- 所有可點元件最小高度 44px（`.help-btn`、`.link-button`、`.info-chip` 除外，但點擊區至少 32px）。
- 焦點框：`outline:3px solid var(--accent);outline-offset:2px`。
- 對比：淺深兩色模式的文字與底色對比 ≥ 4.5:1（大數字 ≥ 3:1）；你調整任何顏色前先算過，回報列出你改了哪幾組、算出的比值。

## PROOF_CMD

```
node scripts/check-ui.mjs && node scripts/gen-precache.mjs && npm.cmd test
```

預期：第一行 `OK`；`sw.js：124 個檔案，版本 xxxxxxxxxxxx`；最後 `tests 155`、`pass 155`、`fail 0`。

## 回報欄位（`collab/from-codex-ui.md`，不貼程式碼）

- 完成項：第 2 節 12 點、第 4 節 4 項，各一行（做了／沒做＋原因）
- PROOF_CMD 輸出：check-ui 最後一行、gen-precache 一行、tests／pass／fail 三行
- 自己算的對比值：每組一行
- app.css 行數（改前 150 → 改後 n）
- 需要決定的事：沒有就寫「無」
