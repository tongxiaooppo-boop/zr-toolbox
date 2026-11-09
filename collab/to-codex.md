# 任務 ③ v1：定期配比再平衡改精靈（任意多檔＋股數取整）＋兩張卡通圖

- 版本：2026-11-09 v1（框架 v5.8）。上一份（② v2）已完成上線，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/trigger5050.js`（全檔，**照抄它的寫法**：import、`steps`、`explain`、`example`、頁尾「怎麼讀」）
- `js/pages/rebalance.js`（舊頁，整檔要重寫；只看它的「怎麼讀」文字可以沿用哪些）
- `js/core/rebalance.js` 第 60 行以後（`WIZARD_TEMPLATES`、`guessBeta`、`rebalancePlan` 與 JSDoc，**只准呼叫**）
- `js/ui/wizard.js` 第 1–40 行（介面註解）、第 233–295 行（`betaHoldingsInput`／`readBetaHoldings`）
- `docs/figures/cartoon/00-風格與角色.md`、`rebalance-01-時間到了就配回四格.md`、`rebalance-02-532有兩種.md`（第 3 節生圖用）

## 1. 只准改／新增這些檔

- `js/ui/wizard.js`：`betaHoldingsInput` **只新增** `kind: 'mix'`（第 2.1 節）；`'stock'`／`'lever'` 行為、欄名、class 不准變。檔頭註解在 `betaHoldingsInput` 那行後面補一行說明 `'mix'`。
- `js/pages/rebalance.js`：整檔改寫成精靈（第 2.2 節）。
- `js/data/tools.js`：只改 ③ 的 `oneLine` 為「多檔照比例配回，算出每檔要買賣幾股」。
- `docs/figures/cartoon/out/rebalance-comic.png`、`rebalance-step1.png`（第 3 節）。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`tests/`、`css/`、`img/`、其他頁面、`docs/`（`docs/figures/cartoon/out/` 除外）。覺得要改就停下寫進回報。

## 2.1 元件：`betaHoldingsInput` 新增 `kind: 'mix'`

給 ③ 用：正二、原型、債券 ETF 混在同一張表。
- label 預設「這個策略裡的持股」，max 預設 10，**至少留 1 列**（跟 `lever` 一樣：只剩 1 列時隱藏「刪掉這檔」；`rows` 空陣列時先放 1 列空白）。
- 代號 placeholder「例：0050」；代號說明照 `stock`。
- 股數：plain「還沒買就填 0」，說明 `['手上有幾「股」：1 張＝1000 股，零股照實際股數填。', '還沒買的就填 0，工具會算出要買多少。']`。
- Beta：placeholder 空字串，plain「留白＝看代號猜」，chip `'beta'`，說明 `['這檔跟大盤一起漲跌的程度。留白會看代號猜：結尾 L（正二）當 2、R（反向）當 −1、B（債券 ETF）當 0，其他當 1。', '正二是「每天」約 2 倍，放久了會偏離。']`。
- `readBetaHoldings` 不用改。

## 2.2 頁面 `js/pages/rebalance.js`

import：`h, toolHeader, selectField, disclaimer, figure`（components）、`wizard, betaHoldingsInput, readBetaHoldings, tokenBox, numberInput, explain, withHelp`（wizard）、`WIZARD_TEMPLATES, guessBeta, rebalancePlan`（core/rebalance）、`parseNum, fmtMoney, fmtPct, fmtX`（format）、`STOCK_NAMES`、`TOOLS`。輔助函式 `num`、`named`、`price`、`link` 照抄 ② 頁。
今天＝`new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())`。

state 欄位：`template`、`rowsFrom`、`rows`（`[{code, shares, price, beta}]`）、`weights`（物件，代號 → 百分比數字）、`cashPct`、`cash`、`contribution`、`unit`（1 或 1000）、`months`、`last`。

### 步驟 1「選配置」
- hint：「選一個常見的比例當起點，下一步可以改代號、加減檔數。」
- about：「定期配比只看時間：選好比例和週期，時間到了就用當時的總額照比例配回，中間漲跌都不動。這和 ② 的 50/50 觸發不同，那個看的是漲跌幅。」
- figure：`../img/rebalance/step1.webp`，alt 照第 3 節圖 2 的文字完整寫出。
- body：`selectField({ id: 'template', label: '配置', options: Object.entries(WIZARD_TEMPLATES).map(([value, t]) => ({ value, label: t.name })), value: s.template || '532-stock' })`，用 `withHelp` 掛說明：`['股版＝原型／正二／現金；債版＝正二／美債／現金。名字一樣、風險不同。', '模板裡的代號只是例子（0050、00631L、00679B），下一步可以換成你實際買的。']`。
- read：`s.template = 選的值`；**當 `s.rowsFrom !== s.template`**：`const t = WIZARD_TEMPLATES[s.template]; s.rows = t.rows.map(r => ({ code: r.code, shares: NaN, price: NaN, beta: r.beta })); s.weights = Object.fromEntries(t.rows.map(r => [r.code, r.weight * 100])); s.cashPct = t.cash * 100; s.rowsFrom = s.template;`（自訂：`rows` 空陣列、`weights` 空物件、`cashPct` NaN）。同模板回來不重設。

### 步驟 2「你的持股」
- hint：「只填這個策略裡的持股。股數看券商 App 的庫存；還沒買的那檔股數填 0。」
- about：「每一檔記下現在有幾股、現價多少，工具才算得出要買賣幾股。」
- figure：`../img/common/step-holdings.svg`，alt 照抄 ② 頁步驟 1。
- body：`[betaHoldingsInput({ id: 'rows', rows: s.rows || [], kind: 'mix' }), tokenBox()]`。畫完之後，**代號有值、現價空白**的列，對它的 `.b-code` 觸發一次 `change` 事件（讓模板帶入的代號自動抓價）。
- read：`s.rows = readBetaHoldings('rows').map(r => ({ ...r, shares: Number.isNaN(r.shares) ? 0 : r.shares }))`；然後只為了檢查呼叫一次 `rebalancePlan({ rows: s.rows.map(r => ({ ...r, weight: 1 / s.rows.length })), cash: 1, cashWeight: 0 })`（錯誤訊息直接丟出去）。

### 步驟 3「現金與目標比例」
- hint：「現金只算這個策略留的錢，不是全部存款。比例照你自己的規則填，加起來要 100%。」
- about：「每一份要占總額幾 %。總額＝持股市值＋現金＋這次新投入。」
- body：
  - `numberInput({ id: 'cash', label: '策略現金', plain: '這個策略留著的現金', suffix: '元', value: s.cash, help: { text: ['只填這個策略的現金部位（例：放在交割戶、準備配回用的錢）。', '沒有就填 0。'] } })`
  - `numberInput({ id: 'contribution', label: '這次新投入', plain: '沒有就留白', suffix: '元', value: s.contribution, help: { text: ['這次要另外加進來的錢（例：這半年存下來的）。', '會一起算進總額，照比例分下去。'] } })`
  - 每一列持股一格：`numberInput({ id: 'w-' + i, label: named(code) + ' 的比例', suffix: '%', value: s.weights?.[code] })`
  - `numberInput({ id: 'cashPct', label: '現金的比例', suffix: '%', value: s.cashPct })`
  - 一行 `h('p', { class: 'muted', id: 'w-sum' })`：「目前加起來 X%」，畫好時算一次，之後在 body 根節點聽 `input` 事件即時更新（空白當 0；`+x.toFixed(2)`）。
  - `selectField({ id: 'unit', label: '下單方式', options: [{ value: '1', label: '可以買賣零股（算到 1 股）' }, { value: '1000', label: '只用整張（1 張＝1000 股）' }], value: String(s.unit || 1) })`，`withHelp`：`['零股：算到 1 股，最貼近目標比例。', '只用整張：不到 1 張的差額就不動，配完會跟目標差多一點。']`。
- read：`cash` 空白 → 錯誤「請填策略現金，沒有就填 0。」；`contribution` 空白當 0；比例空白當 0，存回 `s.weights[code]`、`s.cashPct`；`s.unit = Number(...)`。然後呼叫一次 `rebalancePlan`（用第 2.2 節最後的「組參數」方式，不帶 `last`）檢查，錯誤丟出去（比例不是 100% 的訊息就是從這裡出來）。

### 步驟 4「多久配回一次」（選填）
- hint：「不知道上次是哪天就留白，工具照樣算今天配回的股數。」
- about：「週期到了才配回；還沒到就不用動。」
- body：`selectField({ id: 'months', label: '再平衡週期', termId: 'rebalance', options: 每月 1／每季 3／每半年 6／每年 12, value: String(s.months || 6) })`；日期欄 `last`（照 ② 頁的日期欄寫法：`type: 'date'`、`max` 今天、`withHelp` 說明 `['上次照比例配好的那天。', '留白就不算到期日。']`）。
- read：`s.months = Number(...)`；`s.last = 值或 ''`。

### 組參數（結果與步驟 3 共用，寫成檔內函式 `params(s, withDate)`）
`{ rows: s.rows.map(r => ({ ...r, weight: (s.weights[r.code] || 0) / 100 })), cash: s.cash, cashWeight: (s.cashPct || 0) / 100, contribution: s.contribution || 0, unit: s.unit || 1, months: s.months || 6, last: withDate ? s.last || undefined : undefined, asOf: 今天 }`

### 結果（`result(s)`，`const r = rebalancePlan(params(s, true))`）
依序：
1. `r.due` 有值時：`explain({ label: '到期了嗎？', value: r.ready ? '到期了，可以配回' : '還沒到期', tone: r.ready ? 'warn' : 'ok', how: '上次配回 {s.last} ＋ {週期中文} ＝ {r.due}。', means: r.ready ? '照規則今天可以配回。' : '照規則先不用動；下面是「如果今天配回」的股數。', todo: r.ready ? '照下面的股數下單，做完把今天的日期記下來，下次第 4 步填這個日期。' : null })`。
2. `explain({ label: '總額', value: fmtMoney(r.pool), tone: 'info', how: '持股市值 {fmtMoney(r.total − s.cash)} ＋ 現金 {fmtMoney(s.cash)}' + (新投入 > 0 ? ' ＋ 新投入 {…}' : '') + ' ＝ {fmtMoney(r.pool)}。', means: '每一份的目標＝總額 × 比例。' })`。
3. 一張表 `h('table', { class: 'trade-table' })`：欄「部位｜現在占｜目標占｜要做的事｜配完股數」。每檔一列：`named(code)`、`fmtPct(nowWeight)`、`fmtPct(weight)`、`tradeShares > 0 ? '買進 N 股' : tradeShares < 0 ? '賣出 N 股' : '不動'`（N 加千分位 `toLocaleString('en-US')`）、`sharesAfter` 加千分位；最後一列現金：`fmtPct(r.cashWeightNow)`、`fmtPct(cashPct/100)`、`配完 fmtMoney(r.cashAfter)`、`—`。
4. 每檔 `tradeShares !== 0` 的列各一項 `explain`：label `{named(code)}：買進／賣出`，value `N 股`，tone `'warn'`；how「目標 {fmtMoney(target)}（{fmtMoney(r.pool)} × {weight×100}%）− 現在 {fmtMoney(value)}，÷ 現價 {price(price)} ＝ {((target − value)/price).toFixed(1)} 股 → {買進無條件捨去／賣出四捨五入}」，整張時後面接「，以 1,000 股為單位」；means「約 {fmtMoney(|tradeAmount|)}。配完 {sharesAfter} 股、約 {fmtMoney(valueAfter)}，占 {fmtPct(weightAfter)}。」。
5. `explain({ label: '配完的現金', value: fmtMoney(r.cashAfter), tone: 'ok', how: '現金 {…} ＋ 新投入 {…} − 買進 {fmtMoney(r.buyAmount)} ＋ 賣出 {fmtMoney(r.sellAmount)} ＝ {…}。', means: '目標是 {fmtMoney(r.cashTarget)}；差一點是因為股數要取整。', todo: ['下單前用 ', link('cost.html', '⑨ 買賣成本與損益'), ' 算手續費和稅；這裡沒算。'] })`。
6. `explain({ label: '曝險倍數', value: '{fmtX(r.exposureNow)} → {fmtX(r.exposureAfter)}', tone: 'info', how: '每檔市值 × Beta 加起來 ÷ 總額。用到的 Beta：{逐檔 code Beta，beta 是用猜的（原本留白）在後面加「（看代號猜）」}。', means: '約等於「總額的幾倍跟著大盤漲跌」；目標比例算出來是 {fmtX(r.exposureTarget)}。現金當 0，債券 ETF 當 0 是簡化。', termId 不用 })`。判斷「用猜的」：步驟 2 讀到的 `beta` 是 NaN。
7. `h('p', { class: 'note' }, '沒算手續費、證交稅；到期那天休市就順延到下一個交易日。')`。

### example
```
{ template: '532-stock', rowsFrom: '532-stock',
  rows: [{ code: '0050', shares: 2000, price: 195.5, beta: 1 }, { code: '00631L', shares: 9000, price: 26.3, beta: 2 }],
  weights: { '0050': 50, '00631L': 30 }, cashPct: 20, cash: 172300, contribution: 50000, unit: 1, months: 6, last: '2026-05-08' }
```
範例結果必須是：總額 850,000；0050 買進 173 股（配完 2,173）；00631L 買進 695 股（配完 9,695）；配完現金 170,200；曝險 1.08 倍 → 1.10 倍；到期日 2026-11-08、到期了。

### 頁面組裝（照 ② 頁）
`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片：
- `figure({ src: '../img/rebalance/comic.webp', alt: 第 3 節圖 1 四格文字完整寫出 })`
- 三段文字：沿用舊頁第 1、2 段（定期配比只看時間…；532、442 有兩種…），第 3 段改「算出來的是取整後的股數：買進無條件捨去、賣出四捨五入，所以現金一定夠，配完會跟目標差一點點。」
- `disclaimer('general')`。

## 3. 生兩張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/rebalance-01-時間到了就配回四格.md` | `docs/figures/cartoon/out/rebalance-comic.png` |
| `docs/figures/cartoon/rebalance-02-532有兩種.md` | `docs/figures/cartoon/out/rebalance-step1.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 頁面引用的是 `img/rebalance/comic.webp`、`step1.webp`（Opus 轉檔搬過去，你不用做）。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/rebalance.js').then(m=>{const r=m.rebalancePlan({rows:[{code:'0050',shares:2000,price:195.5,beta:1,weight:.5},{code:'00631L',shares:9000,price:26.3,beta:2,weight:.3}],cash:172300,cashWeight:.2,contribution:50000,months:6,last:'2026-05-08',asOf:'2026-11-09'});console.log(r.pool,r.rows.map(x=>x.tradeShares).join(','),r.cashAfter,r.exposureNow.toFixed(2),r.exposureAfter.toFixed(2),r.due,r.ready)})"
node --check js/pages/rebalance.js
node --check js/ui/wizard.js
```
預期：`ℹ tests 131`、`ℹ pass 131`、`ℹ fail 0`；第二行 `850000 173,695 170200 1.08 1.10 2026-11-08 true`；後兩行無輸出。

## 5. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
## 修改檔案
## PROOF_CMD 結果
- npm.cmd test：tests __ pass __ fail __
- 範例數字：__
- node --check（兩檔）：__
## 生圖（每張重生幾次、有沒有殘留錯字）
## 偏離規格或自行決定的小事
## 需要 Opus 決定的事
```
