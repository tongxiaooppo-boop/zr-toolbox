# 頁面任務：㉖ 測驗結果加「三桶壓力測試」

- 版本：2026-11-26 v1。回報寫到 `collab/from-codex-stress.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`（不要 `npm`）。
- **只准修改**：`js/pages/riskquiz.js`、`css/app.css`（只在檔尾加本功能需要的新 class）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。新增只准 `collab/from-codex-stress.md`。
- **不准改**：`js/core/`（尤其 `stress.js`、`riskquiz.js`）、`js/data/`（`stress.js` 是腳本產生的）、`js/ui/`、`tests/`、`scripts/`、其他頁面。覺得 core 或資料有問題就停下，寫進回報。暫存檔放本 repo 內，結束前刪掉。
- 不要用網路搜尋、網頁抓取。

## 0. 要讀的檔案（只准讀這些）

- `js/core/stress.js`（全檔，約 190 行；介面在檔頭與 `stressPlan` 的註解）
- `js/pages/riskquiz.js`（全檔，88 行，要改的頁）
- `js/pages/dca.js` 第 24–29 行（`table()` 樣板：`card-table`，手機自動變卡片）
- `js/ui/wizard.js` 第 1–40 行（`explain` 介面）、`js/ui/components.js` 第 1–26 行
- `js/core/format.js`（`fmtPct`）
- **不要讀** `js/data/stress.js`（200 KB 的數字）；格式看 `scripts/stress-update.mjs` 第 1–15 行。

## 1. 放在哪

`js/pages/riskquiz.js` 的 `result(s)`：在「例子只是舉例、沒有排序，不是推薦買哪一檔。」那一段**後面**、「如果你要放正2」**前面**，插入一個 `stressSection(p, s.a[7])`（`p`＝`allocationPlan` 的結果）。資料用靜態 import：`import { STRESS } from '../data/stress.js';`、`import { LAYOUTS, DEFAULT_LAYOUT, stressPlan, lossCheck } from '../core/stress.js';`、`fmtPct` 從 `../core/format.js`。

## 2. 內容（文字照抄，`${}` 換成值；不准自己算跌幅，全部用 `stressPlan`／`lossCheck` 回傳的欄位）

外層 `h('section', { class: 'stress' }, …)`；布局切換時只重畫內層 `div.stress-body`（用 `h` 的 `onchange`），預設 `DEFAULT_LAYOUT`。

```js
const weights = { steady: p.steady / 100, growth: p.growth / 100, bold: p.bold / 100 };
const plan = stressPlan({ data: STRESS, layout, weights });
const chk = lossCheck({ loss, worst: plan.worst.portfolio.mdd });
```
跌幅顯示一律 `fmtPct(-x)`（例 `-42.0%`）。

1. `h3`：`過去的股災，你的三桶會跌多少`
2. 一句 `p`：`用你上面的三桶比例，回頭放進過去 8 次股災，看整個組合最多跌多少、多久回到原來的高點。`
3. 布局切換：`fieldset.choices.stress-layout`（`aria-label`＝`選商品組合`），三個 radio，`name="stress-layout"`（**不能以 `q-` 開頭**，精靈會讀 `q-*`），value＝`A`／`B`／`C`。label 文字由 `LAYOUTS` 產生：`${key} ${label}：` ＋ 三桶各自的代號（桶內用 `＋`、桶間用 `／`），B 後面加 `（預設）`。例：`B 台＋美：00713＋00719B／0050＋00646／00631L（預設）`。
4. 兩張 `explain`（第一張 `tone: 'warn'`，第二張不給 tone）：
   - 2008：`label`＝`${plan.proxyLayer.label}（過去最深）`；`value`＝`組合最多跌 ${fmtPct(-mdd)}`；`how`＝`${from} 買進，${troughDate} 跌到最低；` ＋（`months` 不是 null ？ `約 ${months} 個月回到前高（${recoverDate}）。` ： `到 ${STRESS.asOf} 還沒回到前高。`）；`means`＝`這一次有商品還沒上市，用代替品算（表上標「代替」）。` ＋（`p.bold > 0 && buckets.bold.proxy` ？ `積極桶用的是模擬的正2。` ： ``）＋（`lateStart` ？ `0056 從 2007-12-26 才有資料，所以從這天起算，比真正的高點晚，跌幅會算少一些。` ： ``）
   - 全真實：`label`＝`2020 年起全部用真實商品，最深是${plan.realLayer.label}`；`value`、`how` 同上格式（用 `plan.realLayer`）；`means`＝`這幾次每一檔都已經上市，數字全部是真的。`
5. 第 8 題對照 `explain`：`label`＝`跟你第 8 題比`；`value`＝`你能接受 ${fmtPct(-chk.limit, 0)}，過去最深 ${fmtPct(-plan.worst.portfolio.mdd)}`；`tone`＝`chk.ok ? 'ok' : 'warn'`；`means`＝（`chk.ok` ？ `過去最深的一次，在你能接受的範圍內。` ： `過去最深的一次，比你能接受的還深。可以把積極桶調低、穩健桶調高，或先確定自己跌到這樣也不會賣。`）＋ `這是過去最深，不是未來的上限。`
6. 表格（照 `dca.js` 的 `table()` 樣板，外層 class 改 `stress-table-scroll`，table 用 `trade-table card-table`）：
   - 表頭：`股災`、`穩健 ${p.steady}%`、`成長 ${p.growth}%`、`積極 ${p.bold}%`、`整個組合`、`回到前高`
   - 每次股災一列（`plan.crashes` 順序）：第一格 `${label}`＋換行小字 `span.stress-from`：`${from} 起`（`lateStart` 加 `（延後）`）；三桶格＝`fmtPct(-buckets[k].mdd)`，`buckets[k].proxy` 時後面加 `span.stress-proxy` 文字 `代替`；組合格＝`fmtPct(-portfolio.mdd)`（`strong`）；回到前高＝`months` 不是 null ？ `${months} 個月` ： `還沒回到`。
7. 說明 `ul.muted`（四點，照抄）：
   - `用台幣、含配息（配息當天買回）。每次股災在區間第一天照你的比例買進，之後不再平衡；跌幅是區間內從高點到低點，「回到前高」從那個高點算到第一次回到同樣金額（區間後每週看一次）。`
   - `股災區間照 ㉙ 股災史的台股、美股高低點，取兩邊最早的高點到最晚的低點。`
   - `標「代替」的格子，是商品那時還沒上市，用相近的東西代替：` ＋ 由 `STRESS.products` 產生（只列 `proxy` 不是 null 的），每檔 `${code} 用 ${proxy}（上市後兩者比對，跌幅最多差 ${(gap*100).toFixed(1)} 點）`，用 `；` 接起來。
   - `資料到 ${STRESS.asOf}；來源：${STRESS.source}。`

## 3. 參考資料

`references([...])` 陣列尾端加兩筆：`{ name: 'FRED DEXTAUS 新台幣兌美元匯率', url: 'https://fred.stlouisfed.org/series/DEXTAUS' }`、`{ name: 'FinMind 台股開放資料', url: 'https://finmindtrade.com/' }`。

## 4. 樣式（`css/app.css` 檔尾）

`.stress-from`（小字 muted、block）、`.stress-proxy`（小標籤：小字、細框、圓角，顏色用現有 `--warn` 或 `--muted` 變數，不要新色）、`.stress-layout` 手機一行一個選項。390 寬不能水平捲動。

## 5. 驗收

- `PROOF_CMD`：`npm.cmd test` → 預期 `ℹ pass 212`（或更多）、`ℹ fail 0`。
- 自己用瀏覽器開 `tools/riskquiz.html` 按「帶入範例」→ 結果出現壓力測試，切 A／C 表格會變；範例答案（積極型 20／30／50）在 B 布局下，2008 那張卡要顯示「積極桶用的是模擬的正2」。

## 6. 回報（`collab/from-codex-stress.md`，欄位寫死，不貼程式碼）

- 完成項（對應第 1–4 節）
- 異動檔案清單
- PROOF_CMD 輸出的 pass／fail 數字
- 範例答案在 B 布局下：2008 組合跌幅、2020 起最深那次的名稱與跌幅、第 8 題對照的 value 文字
- 需要 Opus 決定的事（沒有寫「無」）
