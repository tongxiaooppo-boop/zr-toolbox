# 頁面任務：㉗ 投資屬性是什麼（科普頁）

- 版本：2026-11-25 v1。回報寫到 `collab/from-codex-riskprofile.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`。
- **只准新增**：`tools/riskprofile.html`、`js/pages/riskprofile.js`、`collab/from-codex-riskprofile.md`。
- **只准修改**：`js/data/tools.js`（加一筆）、`js/pages/riskquiz.js`（只加一個連結，見第 3 節）、`css/app.css`（只在檔尾加本頁需要的 class）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。
- **不准改**：`js/data/riskprofile.js`（文案與數字由 Opus 定，一個字都不要改；覺得有錯就寫進回報）、`js/core/`、`js/ui/`、`tests/`、`scripts/`、其他頁面。暫存檔放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/data/riskprofile.js`（全檔，文案來源）
- `js/pages/products.js`（科普頁樣板，照它的結構寫）
- `js/ui/components.js` 第 1–20 行（介面註解）
- `tools/products.html`（殼，照抄）

## 1. 註冊與殼

- `js/data/tools.js`：在 `riskquiz` 那筆**後面**加：
  `{ id: 'riskprofile', no: '㉗', group: 'science', title: '投資屬性是什麼', oneLine: '保守、穩健、成長、積極差在哪？各自對應什麼商品、為什麼', href: 'tools/riskprofile.html', gate: 6, status: 'ready', terms: [] }`
- `tools/riskprofile.html`：照抄 `tools/products.html`，title `投資屬性是什麼｜正2工具箱與股市學堂`，script 改 `../js/pages/riskprofile.js`。

## 2. 頁面（`js/pages/riskprofile.js`，用 `h()`，不准 innerHTML）

由上到下：
1. `toolHeader(tool)`
2. 卡片「先講結論」：`INTRO` 兩段；底下一個連結「先做測驗：㉖ 投資屬性測驗」→ `riskquiz.html`。
3. 目錄卡（同 products 的 nav）：商品也有分級／三桶各放什麼／為什麼屬性要對上商品／這頁的限制。
4. 卡片 `id="rr"`：標題 `RR.title`，`RR.lines` 每行一段。
5. 卡片 `id="buckets"`：標題「三桶各放什麼、為什麼」；先放 `figure({ src: '../img/riskquiz/buckets.svg', alt: '三桶資金：保守穩健桶，例子為債券 ETF、定存股、00713、VT；成長桶，例子為 0050、QQQ、SPY；積極桶，例子為主動式 ETF、正2、個股。積極型 20／30／50，穩健型 50／30／20，示意主力桶占一半。', caption: '三桶依保守穩健、成長、積極排列。' })`。接著每個 `BUCKET_GUIDE` 一個 `h3`（title）＋ `p`（who，class `muted`）＋ `p`（why）；每個 item 一個 `details.product`：`summary` 內 `strong` 寫 name、後面接 what；展開後 `dl`：「為什麼放這一桶」→ why、「最壞跌過多少」→ fall。
6. 卡片 `id="match"`：標題「為什麼屬性要對上商品」，`WHY_MATCH` 每行一段。
7. 卡片 `id="limits"`：標題「這頁的限制」，`PROFILE_LIMITS` 每行一段。
8. `references(PROFILE_REFS)`、`disclaimer('general')`。

## 3. 測驗頁加連結

`js/pages/riskquiz.js` 的「怎麼讀」卡，最後一段 `p` 後面加一段：`h('p', {}, '想知道各屬性對應什麼商品、為什麼：', h('a', { href: 'riskprofile.html' }, '㉗ 投資屬性是什麼'))`。其他不要動。

## 4. PROOF_CMD

```
node scripts/gen-precache.mjs && npm.cmd test
```

預期：`tests 170`、`pass 170`、`fail 0`。smoke 由 Opus 跑（預期 pages 26 全過）。

## 5. 回報（欄位固定，不貼程式碼）

完成項（對照第 1–3 節）／新增修改檔案清單／PROOF_CMD 的 tests、pass、fail／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
