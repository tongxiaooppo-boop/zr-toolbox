# 頁面任務：科普梳理（新手路線）＋ ㉗ 投資屬性是什麼

- 版本：2026-11-25 v1。回報寫到 `collab/from-codex-path.md`（一份就好，涵蓋 A、B 兩部分）。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`。
- 依據：`docs/decision/決策-2026-11-25-科普梳理.md`（不用讀，要做的都寫在下面）。

## A. ㉗ 投資屬性是什麼

照 `collab/to-codex-riskprofile.md` 第 0–3 節做（那份的「只准新增／修改／不准改」同樣適用），另外在 ㉗ 頁 `references(...)` 前面加 `pathNav('riskprofile')`。

## B. 新手路線

Opus 已做好（**不准改**）：`js/data/tools.js` 的 `PATH`、`pathPlace`；`js/ui/components.js` 的 `pathNav(id)`；`tests/path.test.js`；`js/data/etf101.js`（正2、借錢兩節已精簡）；`js/data/products.js`、`js/data/riskprofile.js` 的說明句。

**只准修改**（B 部分）：`js/pages/home.js`、下列 8 個頁面檔（只加一行 `pathNav`）、`js/pages/glossary.js`、`js/pages/basics.js`（只加一段連結）、`css/app.css`（檔尾）、`sw.js`（只能重產）。

要讀的檔案：`js/data/tools.js` 檔尾 `PATH` 一段、`js/ui/components.js` 檔尾 `pathNav`、`js/pages/home.js`。

1. **首頁路線**（`js/pages/home.js`）：在 hero `figure` 後面、`shortcuts` 前面加 `section.card.path#path`：
   - `h2`「新手路線：照順序看」，下面一句 `p.muted`「不知道從哪開始？從第 1 步往下走。」
   - `ol`，每個 `PATH` 一個 `li`：`strong`「第 N 步 ${title}」＋ `span.muted` question ＋ 該步的工具連結（只列 `status === 'ready'` 的，格式 `${no} ${title}`，用「、」隔開）；該步沒有 ready 的工具就顯示「製作中」。
   - 其他首頁內容不動（站名改版是另一輪）。
2. **每頁加 `pathNav`**：`riskquiz`、`basics`、`products`、`etf101`、`zr101`、`decay`、`loans` 七頁（加上 A 的 `riskprofile` 共 8 頁），在 `references(...)` 前面加 `pathNav('<id>')`（沒有 references 的頁就放在 `disclaimer` 前面）。從 `../ui/components.js` import。
3. **兩個辭典互連**：
   - `js/pages/glossary.js` 頁首說明區加一段：`h('p', {}, '這裡收正2、槓桿、質押這類進階用詞；下單、交割這類基本用詞在 ', h('a', { href: 'basics.html' }, '㉓ 股票基本術語'), '。')`
   - `js/pages/basics.js` 頁首說明區加一段：`h('p', {}, '這裡收下單、交割這類基本用詞；Beta、維持率、曝險這類正2 與槓桿用詞在 ', h('a', { href: 'glossary.html' }, '⑫ 術語辭典'), '。')`
4. **CSS**：`.path ol`（步驟之間留白、手機不擠）、`.path-nav`（跟一般 card 同風格，`h2` 小一號）。390px 不得水平捲動；小字不用 `--accent` 當文字色。

## PROOF_CMD

```
node scripts/gen-precache.mjs && npm.cmd test
```

預期：`tests 172`、`pass 172`、`fail 0`。smoke 由 Opus 跑（預期 pages 26 全過）。

## 回報（`collab/from-codex-path.md`，欄位固定，不貼程式碼）

完成項（A、B 逐條）／新增修改檔案清單／PROOF_CMD 的 tests、pass、fail／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
