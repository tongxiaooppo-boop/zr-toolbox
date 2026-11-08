# Gate 2b 任務書：④ 質押壓力測試＋⑪ 我現在等於幾倍大盤

- 版本：2026-11-08 v1（對應 FRAMEWORK.md 2026-11-08 v3＋`pledgeStress` 新增回傳 `nowRatio`、`callDrop`）。Gate 2a 的任務書已完成，以本檔為準。
- 執行者：訂閱 Codex sol。直接在本 repo（`D:\ok\zr-toolbox`）工作。
- **不要 commit**，做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`（PowerShell 會擋 `npm.ps1`）。**不要跑 `npm run smoke`**（沙箱開不了 Chrome，會卡住），冒煙測試由 Opus 跑。
- 這兩頁牽涉金額：數字顯示照本檔寫的函式與格式，不要自己換算或四捨五入成別的樣子。

## 0. 要讀的檔案（只准讀這些）

| 檔案 | 為什麼 |
|---|---|
| `js/pages/rebalance.js` | **樣板，照抄結構**（表格 `trade-table`、`change` 事件、頁內小元件的寫法） |
| `tools/rebalance.html` | 頁殼樣板 |
| `js/ui/components.js` | 元件簽名（檔頭註解） |
| `js/core/pledge.js` | ④ 用 `pledgeTable`（回傳欄位見函式本體） |
| `js/core/exposure.js` | ⑪ 用 `exposureNow`、`betaPlan` |
| `js/core/format.js` | `fmtMoney`、`fmtPct`、`fmtX` |
| `js/data/tools.js` | 卡片清單 |
| `css/app.css` | 只准在檔尾追加 |

## 1. 規則（違反就退回）

- **不准改**：`js/core/**`、`js/ui/components.js`、`js/data/glossary.js`、`scripts/**`、`img/**`、`tests/**`、`docs/**`、其他工具頁。
- 頁面不寫公式，只呼叫 `js/core`（把百分比數字除以 100、空白欄位當 0 不算公式）；不用 `innerHTML`，一律用 `h()` 與元件。
- 不用 localStorage、不連網路、不加套件。暫存檔、一次性腳本結束前刪掉，不准留在 repo。
- core 丟出的 `Error.message` 直接用 `showError` 顯示，不改寫。
- 不確定就停下，寫進回報「需要決定的事」（問題一句＋2–3 選項＋建議）。小疑問自行決定並註明。最多停 2 次。
- **進階欄位**用原生 `<details>`：`h('details', { class: 'advanced' }, h('summary', {}, '進階設定（選填）'), …欄位)`。css 檔尾追加 `.advanced` 樣式（上邊框 `var(--line)`、上下留白、`summary` 用 `var(--muted)` 色、可點游標）。

## 2. 步驟 1：④ 質押壓力測試

新增 `tools/pledge.html`（title「質押壓力測試｜正二工具箱」）與 `js/pages/pledge.js`，照樣板五段。

**輸入卡**

| id | 元件 | label | plain | termId | 其他 |
|---|---|---|---|---|---|
| `shares` | `numberField` | 已質押股數 | 拿去質押的股票有幾股 | `pledge` | suffix `股` |
| `price` | `numberField` | 擔保品目前股價 | 質押的那檔股票現在一股多少錢 | — | suffix `元` |
| `debt` | `numberField` | 借款總額 | 已經借的＋這次打算借的，全部加起來 | — | suffix `元` |
| `call` | `numberField` | 追繳線 | 多數券商契約是 130%，以你的契約為準 | `margin-call` | suffix `%`，value `130` |
| `target` | `numberField` | 補回目標 | 被追繳後要補回到多少，看契約，例如 160 或 166 | `maintenance-ratio` | suffix `%`，value `160` |
| 以下放進 `<details class="advanced">` | | | | | |
| `rate` | `numberField` | 借款年利率 | 填了會把利息算進借款，沒有就留白 | — | suffix `%` |
| `days` | `numberField` | 計算期間 | 算幾天後的利息，整數天，沒有就留白 | — | suffix `天` |
| `collateralQ` | `numberField` | 擔保品認列成數 | 券商把股票打幾折算維持率，沒打折就是 100 | — | suffix `%`，value `100` |
| — | `exampleButton` | | | | `{ shares: 10000, price: 100, debt: 500000, call: 130, target: 160, rate: '', days: '', collateralQ: 100 }` |

**計算**

- 必填：`shares`、`price`、`debt`、`call`、`target`、`collateralQ`；任一 NaN → `填完 N 格就會算。`（同樣板）
- `rate`、`days` 是 NaN（空白）時當 0。
- 組參數（照抄，不要增減欄位）：
  ```
  { shares, pledgePrice: price, price, collateralQ: collateralQ / 100, debt, newDebt: 0, credit: 0,
    investRatio: 0, purchasePrice: price, rate: rate / 100, days, call: call / 100,
    restore: target / 100, safety: target / 100, reserve: 0, remedy: 'repay', q: 1 }
  ```
- `const rows = pledgeTable(p)`（預設 10–50% 五列），`const r0 = rows[0]`。丟錯 → `showError(result, e.message)`。
- `debt === 0` → 只顯示 `h('p', {}, '沒有借款，就不會被追繳。')`。

**結果卡**（`debt > 0`）

1. `.metrics`：
   - `metric('目前維持率', fmtPct(r0.nowRatio, 0), r0.called || r0.nowRatio < call / 100 ? 'bad' : 'ok')`
   - `metric('股價跌破這裡會被追繳', r0.referencePrice.toFixed(2) + ' 元', 'warn')`
   - `metric('等於從現在跌', fmtPct(r0.callDrop), 'warn')`
2. `r0.callDrop <= 0` 時加 `h('p', { class: 'note' }, '⚠ 現在的維持率已經低於追繳線。')`
3. 表格 `h('table', { class: 'trade-table pledge-table' }, …)`：
   - 表頭四欄：`股價跌`、`維持率`、`` `補回 ${target}% 要還款` ``、`或補擔保品`
   - 每列：`'−' + fmtPct(row.decline, 0)`；`fmtPct(row.ratio, 0) + (row.called ? '（追繳）' : '')`；`row.repay < 0.5 ? '不用' : fmtMoney(row.repay)`；`row.topup < 0.5 ? '不用' : fmtMoney(row.topup)`
   - `row.called` 的 `<tr>` 加 `class: 'called'`；css 檔尾追加 `.pledge-table tr.called td{color:var(--bad)}`
4. 兩段 `h('p', { class: 'note' }, …)`：
   - `rate > 0 && days > 0`：`` `已把 ${days} 天、年利率 ${rate}% 的利息算進借款。` ``；否則：`沒有算利息；借越久，利息會讓維持率越來越低。`
   - 固定：`跌幅是質押那檔股票的跌幅，不是大盤；質押 0050 時兩者接近。補擔保要契約接受，各家認列方式不同。`

**範例預期**（Opus 會核對）：目前維持率 200%、追繳價 65.00 元、從現在跌 35.0%；表格五列維持率 180%／160%／140%／120%（追繳）／100%（追繳），還款 不用／不用／NT$ 62,500／NT$ 125,000／NT$ 187,500，補擔保 不用／不用／NT$ 100,000／NT$ 200,000／NT$ 300,000。

**怎麼讀卡**

- `figure({ src: '../img/pledge/call-line.svg', alt: '質押 1 萬股、借 50 萬：股價 100 元時擔保品 100 萬、維持率 200%；跌 35% 到 65 元，維持率 130%，碰到追繳線；跌 40% 到 60 元，維持率 120%，被追繳。要補回 160%：拿現金還款 12.5 萬（60 萬 ÷ 37.5 萬），或補擔保品 20 萬（80 萬 ÷ 50 萬）。', caption: '股價跌，維持率跟著掉；同樣補回目標，還款要的錢比補擔保少。' })`
- 三段白話（照抄）：
  1. 「質押就是把股票押給券商借錢。維持率＝擔保品市值 ÷ 借款，股價跌，維持率就往下掉。」
  2. 「掉到追繳線（多數券商契約是 130%，以你的契約為準）就會被通知補錢，期限內沒補，券商可以賣掉你的股票。補的時候要補回契約寫的目標，不是剛好補到 130%。」
  3. 「借來的錢如果拿去買正二，正二跌得大約是大盤的 2 倍，帳面虧損和追繳可能同時來。先看上面的表，確定最壞那一列的錢你拿得出來。」
- 最後 **`disclaimer('executable')`**。

## 3. 步驟 2：⑪ 我現在等於幾倍大盤

新增 `tools/exposure.html`（title「我現在等於幾倍大盤｜正二工具箱」）與 `js/pages/exposure.js`。

**輸入卡**（一張卡，兩個小標 `h('h3', {}, …)`）

| id | 元件 | label | plain | termId | 其他 |
|---|---|---|---|---|---|
| 小標「現在的部位」 | | | | | |
| `ordinary` | `numberField` | 股票市值（不含正二） | 原型 ETF、個股等一般股票合計 | `exposure` | suffix `元` |
| `lever` | `numberField` | 正二市值 | 00631L 這類兩倍 ETF 合計，沒有就填 0 | `daily-2x` | suffix `元` |
| `cash` | `numberField` | 現金 | 帳上隨時能用的錢 | — | suffix `元` |
| `debt` | `numberField` | 借款 | 質押、融資、信貸，所有借來的錢，沒有就填 0 | `net-assets` | suffix `元` |
| 小標「想調到幾倍（選填）」 | | | | | |
| `target` | `numberField` | 目標倍數 | 想要等於幾倍大盤，例如 1.4 | — | suffix `倍` |
| `basis` | `selectField` | 倍數怎麼算 | 有借錢時兩種差很多 | `basis` | options：`[{value:'net',label:'淨資產口徑（扣掉借款）'},{value:'asset',label:'總資產口徑（不扣借款）'}]`，value `'net'` |
| `allowBorrow` | `selectField` | 現金不夠時 | 要不要再借錢買 | — | options：`[{value:'no',label:'不借新的錢'},{value:'yes',label:'可以再借'}]`，value `'no'` |
| `minCash` | `numberField` | 至少留現金 | 買完至少要留多少現金，沒有就留白 | — | suffix `元` |
| 以下放進 `<details class="advanced">` | | | | | |
| `ordinaryBeta` | `numberField` | 股票的 Beta | 跟大盤的連動，0050 約 1 | `beta` | value `1` |
| `leverBeta` | `numberField` | 正二的 Beta | 約 2，期間越長偏離越多 | — | value `2` |
| — | `exampleButton` | | | | `{ ordinary: 10000000, lever: 0, cash: 2000000, debt: 3000000, target: 1.4, basis: 'net', allowBorrow: 'no', minCash: '', ordinaryBeta: 1, leverBeta: 2 }` |

**計算**

- 必填：`ordinary`、`lever`、`cash`、`debt`、`ordinaryBeta`、`leverBeta`；任一 NaN → `填完 N 格就會算。`
- `const now = exposureNow({ positions: [{ value: ordinary, beta: ordinaryBeta }, { value: lever, beta: leverBeta }], cash, debt })`
- `target` 有填（不是 NaN）且 `now.net > 0` 時：
  `const r = betaPlan({ ordinary, ordinaryBeta, lever, leverBeta, cash, debt, target, minCash: NaN 時 0, basis, allowBorrow: allowBorrow === 'yes' })`
- 任何丟錯 → `showError(result, e.message)`。

**結果卡**

A. `.metrics`（現在）：
   - `metric('淨資產', fmtMoney(now.net))`
   - `metric('等於幾倍大盤（淨資產）', fmtX(now.netBasis))`
   - `metric('總資產口徑', fmtX(now.assetBasis))`
   - `metric('槓桿比（總資產÷淨資產）', fmtX(now.leverageRatio))`
   - `now.net <= 0` 時再加 `h('p', { class: 'note' }, '⚠ 借款已經大於或等於總資產，淨資產口徑算不出來。')`，不算 B。
B. `target` 有填且 `now.net > 0`：先 `h('h3', {}, \`調到 ${target} 倍\`)`
   - `r.possible === false`：`h('p', { class: 'note' }, '⚠ ' + r.reason)`；有 `r.shortage` 再加 `h('p', {}, \`還差 ${fmtMoney(r.shortage)}。\`)`
   - `r.possible === true`：
     - `.metrics`：`metric('正二要調到', fmtMoney(r.targetLever))`；`Math.abs(r.delta) < 0.5` → `metric('正二', '不用動')`，否則 `metric(r.delta > 0 ? '要買進正二' : '要賣出正二', fmtMoney(Math.abs(r.delta)))`；`metric('要新增借款', fmtMoney(r.borrow), r.borrow > 0 ? 'warn' : undefined)`
     - `h('p', {}, \`交易後：現金 ${fmtMoney(r.cashAfter)}、借款 ${fmtMoney(r.debtAfter)}，等於 ${fmtX(r.achieved)}大盤。\`)`
     - `r.borrow > 0`：`h('p', { class: 'note' }, '要借錢才能達標：先用 ', h('a', { href: 'pledge.html' }, '④ 質押壓力測試'), ' 看跌下來會不會被追繳。')`
C. 固定 `h('p', { class: 'note' }, '沒算手續費、稅和利息；算出來是金額，不是股數。')`

**範例預期**（Opus 會核對）：淨資產 NT$ 9,000,000、淨資產口徑 1.11 倍、總資產口徑 0.83 倍、槓桿比 1.33 倍；調到 1.4 倍：正二要調到 NT$ 1,300,000、要買進正二 NT$ 1,300,000、要新增借款 NT$ 0；「交易後：現金 NT$ 700,000、借款 NT$ 3,000,000，等於 1.40 倍大盤。」把目標改 2 → 「⚠ 現金不足且未允許新增借款。」「還差 NT$ 2,000,000。」

**怎麼讀卡**

- `figure({ src: '../img/exposure/buy-to-1.4.svg', alt: '股票 1,000 萬、現金 200 萬、借款 300 萬，淨資產 900 萬，曝險 1,000 萬，約 1.11 倍。拿 130 萬現金買正二後，正二 130 萬乘 2 等於 260 萬曝險，曝險變 1,260 萬，淨資產仍是 900 萬，等於 1.4 倍。', caption: '總資產沒變，倍數變高：多出來的曝險來自正二的 2 倍。' })`
- 三段白話（照抄）：
  1. 「曝險倍數回答的是：大盤漲跌 1%，我的淨資產大約漲跌幾 %。1 倍就是跟大盤一樣；1.4 倍代表大盤跌 10% 時，你大約跌 14%。」
  2. 「分母有兩種：淨資產（扣掉借款）和總資產（不扣）。有借錢時兩者差很多，聽別人說幾倍之前，先問是哪一種。」
  3. 「正二的 2 倍是『每天』2 倍，拉長時間會偏離，所以這裡的 Beta 只是估計。原本那格正二平衡計算器用的是同一套公式。」
- 最後 **`disclaimer('executable')`**。

## 4. 步驟 3：`js/data/tools.js`

- `pledge`：`status: 'ready'`，`terms: ['pledge', 'maintenance-ratio', 'margin-call']`
- `exposure`：`status: 'ready'`，`terms: ['exposure', 'beta', 'net-assets', 'basis', 'leverage-ratio']`
- 不改其他卡片。

## 5. 驗收指令（PROOF_CMD）

Codex 跑：

```
npm.cmd test
```

預期：`ℹ tests 48`、`ℹ pass 48`、`ℹ fail 0`、`ℹ todo 0`。

Opus 另外跑 `npm run smoke`，預期 `smoke pages 8 pass 8 fail 0`（home、decay、glossary、trigger5050、rebalance、drawdown、pledge、exposure）。

## 6. 回報（覆蓋 `collab/from-codex.md`，只填這些欄位，不貼程式碼）

```
## 完成項
- 步驟 1：…
- 步驟 2：…
- 步驟 3：…
## 異動檔案
- （git status 的清單）
## PROOF_CMD 輸出
- tests / pass / fail / todo：
## 範例實測（帶入範例後畫面上的數字）
- ④：目前維持率／追繳價／從現在跌／表格五列（維持率、還款、補擔保）：
- ⑪：淨資產／淨資產口徑／總資產口徑／槓桿比／正二目標／買進／新增借款／交易後那句：
- ⑪ 目標改 2：
## 自行決定的小事
- …
## 需要決定的事
- （沒有就寫「無」）
```
