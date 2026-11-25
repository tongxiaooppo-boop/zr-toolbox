# UI 任務：喜慶紅金配色＋三張開心插圖（v2 美化）

- 版本：2026-11-25 v1。**R8 研究（`collab/to-codex.md`）做完才做這份**；回報寫到 `collab/from-codex-ui.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`（不要 `npm`，PowerShell 擋 npm.ps1）。
- 只准改：`css/app.css`、`js/pages/home.js`、`js/pages/dca.js`、`js/pages/retire.js`、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）；只准新增：`img/home/hero.webp`、`img/dca/joy.webp`、`img/retire/joy.webp`、`docs/figures/cartoon/out/` 底下三張 PNG；寫 `collab/from-codex-ui.md`。**不准改** `scripts/`、`tests/`、`js/data/`、`js/core/`、其他頁面。暫存檔放本 repo 內，結束前刪掉。

## 目標（一句話）

使用者要讓朋友（持有正2 正在虧損）看了心情好一點、願意長期投資：整站從「橘紅 Neo-brutalism」改成**喜慶紅金**，保留 Neo-brutalism 的粗框與硬陰影（版面、元件結構都不動）。

## 1. 配色 tokens（`css/app.css` 的 `:root`，數值照抄）

淺色（`:root`）：
- `--bg:#fff3e0`（暖杏）、`--card:#fffdf7`、`--text:#111`、`--muted:#4a3b2f`、`--line:#111`
- `--accent:#ffb703`（金）、`--on-accent:#111`
- **新增** `--festive:#d62839`（喜慶紅）、`--on-festive:#fff`
- `--soft:#ffe3d3`、`--info-bg:#ffe3d3`；`--ok`、`--warn`、`--bad` 與三個 `-bg` 維持現值。

深色（`@media (prefers-color-scheme:dark)` 裡的 `:root:not([data-theme="light"])` **和** `:root[data-theme="dark"]` 兩處都要改，數值相同）：
- `--bg:#1f1418`、`--card:#2a1d22`、`--text:#fff5ec`、`--muted:#e0cfc2`、`--line:#fff5ec`
- `--accent:#ffc94d`、`--on-accent:#111`、**新增** `--festive:#ff6b6b`、`--on-festive:#111`
- `--soft:#4a2a2a`、`--info-bg:#4a2a2a`；陰影色跟著 `--line`。

刪掉所有 `#ff5a36`、`#ff7a59`。

## 2. 喜慶點綴（只改 CSS，下列幾處，不要更多）

- `.site-title`：`color:var(--festive)`，底下一條 6px 金色底線（`border-bottom` 或 `box-shadow`，用 `--accent`）。
- `.group-title`：左邊 8px `--festive` 色條＋左內距 10px。
- `a.tool-card`：上框加粗成 8px，顏色 `--festive`（其他三邊維持 `--line`）。
- `.shortcuts a`：底色 `--accent`、字 `--on-accent`。
- `.tool-header h1`：`color:var(--festive)`。
- **新增 `.hero`**：首頁主圖容器，`margin:4px 0 16px`；裡面的 `img` 寬 100%、`border:var(--bw) solid var(--line)`、`border-radius:var(--r)`、`box-shadow:var(--shadow)`；`figcaption` 同 `.figure figcaption`。
- 對比：小字（< 18px）不准用 `--accent` 當文字色（金色在淺底對比不夠）；`--festive` 可當標題文字色。

## 3. 三張插圖

提示檔（每張都要先貼 `docs/figures/cartoon/00-風格與角色.md` 全文，再貼該張；三張都註明了「配色例外、橫式 1536×1024」，照提示，不照 00 檔的藍色）：
- `docs/figures/cartoon/home-01-持續投入到退休清閒.md` → `out/home-hero.png`
- `docs/figures/cartoon/dca-03-每月一點點.md` → `out/dca-joy.png`
- `docs/figures/cartoon/retire-03-退休清閒.md` → `out/retire-joy.png`

生圖注意（踩過的坑）：
- **提示用 Read 讀檔後把純文字原文貼給 imagegen，不要經 PowerShell 變數**（曾經因此生出無關照片）。
- 生完自己看：是卡通；字只有提示允許的那幾行且一字不差；沒有多餘數字、沒有真實品牌。不合就重生該張，**每張最多重生 2 次**，仍不合就留最後一張並在回報寫哪裡不合。
- 轉 WebP：Python PIL，`quality=80, method=6`，存到 `img/home/hero.webp`、`img/dca/joy.webp`、`img/retire/joy.webp`。

## 4. 放圖（照 `js/pages/etf101.js` 的 `figure` 用法，`figure` 從 `../ui/components.js` 匯入）

- `js/pages/home.js`：在 `.site-sub` 之後、`.shortcuts` 之前加
  `h('figure', { class: 'hero' }, h('img', { src: 'img/home/hero.webp', alt: '<照提示內容寫一句白話描述>', width: 1536, height: 1024 }), h('figcaption', {}, '長期、分散、量力而為；投資有賺有賠，過去不代表未來。'))`
  首頁卡片**維持不顯示編號**（不要加回 `class: 'no'`）。
- `js/pages/dca.js`、`js/pages/retire.js`：在 `toolHeader(...)` 的下一個位置放 `figure({ src: '../img/dca/joy.webp' 或 '../img/retire/joy.webp', alt: '<一句描述>', caption: '示意圖：投資有賺有賠。' })`。其餘內容不動。
- 新增圖片後跑 `node scripts/gen-precache.mjs` 更新 `sw.js`。

## PROOF_CMD

```
node scripts/check-ui.mjs && npm.cmd test
```

預期：`check-ui` 最後一行 `OK`；`npm.cmd test` 結尾 `ℹ fail 0`（目前 pass 155）。冒煙測試（無頭 Chrome）由 Opus 跑，**你不要跑 `npm run smoke`**（沙箱會卡住）。

## 回報欄位（`collab/from-codex-ui.md`，不貼程式碼）

- 完成項：配色、點綴、三張圖、放圖各一行
- PROOF_CMD 輸出：check-ui 最後一行、test 的 pass／fail 兩行
- 圖：每張重生次數、自查結果（字是否一字不差）
- 需要決定的事：沒有就寫「無」
