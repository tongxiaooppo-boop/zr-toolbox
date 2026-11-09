# 任務 ⑪：「正二要買多少」精靈頁＋持股元件＋三張卡通圖（照 ④ 樣板）

- 版本：2026-11-09 v1（框架 v5.5）。上一份（研究 O）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/pledge.js`（**樣板，結構照抄**：steps、`num`、`named`、`withHelp(selectField(...))`、結果 explain、頁尾）
- `js/ui/wizard.js`（全檔；第 1–35 行是介面說明，本次新增 `betaHoldingsInput`／`readBetaHoldings` 簽名已寫在檔頭；照 `holdingRow`／`holdingsInput`／`readHoldings` 的寫法實作）
- `js/core/balance.js`（公式與回傳欄位，只准呼叫、不准改）
- `js/pages/exposure.js`（舊版 ⑪，**整檔改寫**）、`js/pages/calc-guide.js`（只改第 2 節最後列的兩句）
- `docs/figures/cartoon/00-風格與角色.md`、`balance-01-正二要買多少四格.md`、`balance-02-有借錢時倍數兩種算法.md`、`balance-03-目標倍數是什麼.md`（第 3 節生圖用）

## 1. 只准改／新增這些檔（其他檔一律不改）

- `js/ui/wizard.js`：**只新增** `betaHoldingsInput`、`readBetaHoldings`（第 2.1 節）。可以把 `holdingRow` 裡「代號 change → 抓價 → 狀態文字」那段抽成檔內私有函式給兩邊共用，但 `holdingsInput`／`readHoldings`／`lotsInput` 的行為、欄名、class 不准變。不改檔頭註解。
- `js/pages/exposure.js`：整檔改寫成精靈（第 2.2 節）。`tools/exposure.html` 的 `<title>` 改「正二要買多少｜正二工具箱」，其他不動。
- `js/pages/calc-guide.js`：只改兩處文字（第 2.3 節）。
- `docs/figures/cartoon/out/balance-comic.png`、`balance-step3.png`、`balance-step4.png`（第 3 節）。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`tests/`、`js/data/`、`css/`、`img/`、`docs/`（`docs/figures/cartoon/out/` 除外）。覺得要改就停下寫進回報。

## 2.1 元件：`betaHoldingsInput({ id, rows, max, label, kind })`、`readBetaHoldings(id)`

- `kind`：`'stock'`（label 預設「其他持股（不含正二）」，max 預設 10）｜`'lever'`（label 預設「你的正二」，max 預設 3）。
- 外框照 `holdingsInput`：`h('div', { id, class: 'holdings' }, h('h3', {}, label), list, add)`，list class `holding-list`，add 按鈕「＋ 再加一檔」（`secondary`），到 max 隱藏。
- 每列 `h('div', { class: 'holding beta-holding' })`：
  1. 代號欄（全寬，`withHelp`）：label「代號／名稱 」＋名稱 span（`STOCK_NAMES`），input class `b-code`（placeholder：stock「例：0050」、lever「例：00631L」），下面 `small.holding-status`（aria-live）。
     - change：`normalizeCode` 通過 → 照 `holdingRow` 抓價（寫進現價欄、同樣的狀態文字、token 失效清除、`seq` 防舊回應）。
     - 不通過但有填字 → 不抓價，狀態：「不是台股代號：不會自動抓價，現價請自己填（海外股票、基金：股數填 1、現價填總金額）。」；空白 → 清空狀態。
  2. `h('div', { class: 'holding-grid' })` 三格（各自 `withHelp`）：
     - 股數：class `b-shares`，inputmode `decimal`，label「股數」，`small.plain-sub`「1 張＝1000 股」（lever：「還沒買就填 0」），placeholder「例：3000」
     - 現價：class `b-price`，inputmode `decimal`，label「現價（元）」，plain-sub「填好代號自動抓」，placeholder「輸入代號後自動帶入」
     - Beta：class `b-beta`，inputmode `decimal`，label「Beta」＋`infoChip`（stock `'beta'`、lever `'daily-2x'`），plain-sub（stock「不確定就留白＝1」、lever「留白＝2」），placeholder（stock「1」、lever「2」）
  3. 刪除鈕 `link-button`「刪掉這檔」。
     - stock：每列都可刪；刪光時 list 裡顯示 `h('p', { class: 'muted beta-empty' }, '沒有其他持股：直接按「下一步」。')`，再加一檔時移除這行。`rows` 傳 `[]` 時一開始就是刪光狀態。
     - lever：只剩 1 列時隱藏刪除鈕（同 `holdingsInput` 的 `refresh`）。
- 說明文字（`withHelp` 的 `text`）：

| 格子 | stock | lever |
|---|---|---|
| 代號 | 「填台股代號會自動抓最近收盤價，例：0050、2330。」「海外股票、基金這類不是台股的資產，填名稱就好，股數填 1、現價填總金額。」 | 「正二的代號，例：00631L、00685L。最多 3 檔。」「填好會自動抓最近收盤價。」 |
| 股數 | 「手上有幾「股」：1 張＝1000 股，零股照實際股數填。」「已經賣光的就按「刪掉這檔」。」 | 「手上有幾股：1 張＝1000 股。」「還沒買就填 0，工具會算出要買多少。」 |
| 現價 | 「最近一個交易日的收盤價，填好代號會自動帶入，可以自己改。」「抓不到時（沒網路、查詢次數用完）就手動填券商 App 上的價格。」 | 同左 |
| Beta | 「這檔跟大盤一起漲跌的程度：0050 這類大盤 ETF 約 1，不確定就留白（當 1）。」「個股的 Beta 是估計值，會隨時間改變。」 | 「正二每天約等於 2 倍大盤，留白就當 2。」「注意是「每天」2 倍，放久了會偏離。」 |

- `readBetaHoldings(id)` → `[...document.querySelectorAll(\`#${id} .beta-holding\`)].map(el => ({ code: normalizeCode(v) || v.trim(), shares: parseNum(...), price: parseNum(...), beta: parseNum(...) }))`（`v`＝代號欄原值）。
- 需要的 import（`infoChip`）自己從 components.js 補。

## 2.2 頁面：`js/pages/exposure.js`

檔頭註解：「工具⑪ 正二要買多少（v5.5 精靈）。算法照朋友計算機線上版，公式只在 core/balance.js。」
import：`h, toolHeader, selectField, disclaimer, figure` 從 components.js；`wizard, betaHoldingsInput, readBetaHoldings, tokenBox, numberInput, explain, withHelp` 從 wizard.js；`balancePlan, checkBalanceRows` 從 core/balance.js；`parseNum, fmtMoney, fmtPct, fmtX` 從 format.js；`STOCK_NAMES`、`TOOLS`。
`const tool = TOOLS.find(t => t.id === 'exposure');`；`num`、`named` 照 pledge.js；另加：
```js
const BASIS = { net: '淨資產', asset: '總資產' };
const blank = r => r.code === '' && Number.isNaN(r.shares) && Number.isNaN(r.price) && Number.isNaN(r.beta);
const shareText = n => (Number.isFinite(n) ? `約 ${Math.round(n).toLocaleString('en-US')} 股` : '');
const link = (href, text) => h('a', { href }, text);
```
state 欄位：`stocks`、`levers`（[{code, shares, price, beta}]）、`cash`、`debt`、`minCash`、`target`、`basis`、`allowBorrow`（'no'|'yes'）、`full`（'off'|'on'）、`wStocks`、`wLevers`（比重 % 陣列，跟 stocks／levers 同順序）。

### 步驟 1「其他持股（不含正二）」
- hint：「打開券商 App 的「庫存」，一檔填一列。0050、個股都填這裡，正二下一步再填。」
- about：「這一步算出你手上的股票「跟著大盤漲跌多少錢」（曝險）。沒有其他持股就把列刪掉，直接下一步。」
- figure：不放。
- body：`betaHoldingsInput({ id: 'stocks', kind: 'stock', rows: s.stocks ?? [{}] })`、`tokenBox()`
- read：`const rows = readBetaHoldings('stocks').filter(r => !blank(r)); checkBalanceRows(rows, 'stock'); s.stocks = rows;`

### 步驟 2「你的正二」
- hint：「00631L、00685L 這類兩倍 ETF 填這裡。還沒買就股數填 0，代號一樣要填（才抓得到現價、算得出股數）。」
- about：「正二每 1 元市值，大約算 2 元曝險。這一步記下你現在有多少正二。」
- figure：不放。
- body：`betaHoldingsInput({ id: 'levers', kind: 'lever', rows: s.levers ?? [{}] })`
- read：
  ```js
  const rows = readBetaHoldings('levers').filter(r => !blank(r));
  checkBalanceRows(rows, 'lever');
  rows.forEach((r, i) => { if (!(r.price > 0)) throw new Error(`正二第 ${i + 1} 檔的現價要大於 0（還沒買也要填，才能算要買幾股）。`); });
  s.levers = rows;
  ```

### 步驟 3「現金與借款」
- hint：「現金看銀行和證券戶的餘額；借款看質押、融資、信貸的「借款餘額」，全部加起來。」
- about：「有借錢時，倍數有兩種算法：扣掉借款（淨資產）和不扣（總資產），差很多。」
- figure：`{ src: '../img/exposure/step3.webp', alt: '插圖：有借錢時，倍數有兩種算法。股票 1,000 萬、現金 200 萬、借款 300 萬。總資產口徑（不扣借款）：總資產 1,000＋200＝1,200 萬，1,000 萬 ÷ 1,200 萬約 0.83 倍，看起來比大盤還保守。淨資產口徑（扣掉借款）：淨資產 1,200−300＝900 萬，1,000 萬 ÷ 900 萬約 1.11 倍，這才是你自己的錢漲跌幾倍。老師說：借來的錢要還，跌的是你自己的錢，有借錢看淨資產口徑。沒有借錢時，兩種算法一樣。' }`
- body：
  1. `numberInput` id `cash`，label「現金」，plain「隨時能拿來買正二的錢，例：2000000」，value `s.cash`，suffix「元」，help：「銀行和證券戶裡隨時能動用的錢，全部加起來。」「定存、要繳的保費這類不能動的錢不要算進來，或填在下面「至少要留」。」
  2. `numberInput` id `debt`，label「借款」，termId `net-assets`，plain「質押、融資、信貸，所有借來的錢加起來；沒有填 0」，value `s.debt`，suffix「元」，help：「看各個借款帳戶的「借款餘額」，全部加起來。」「房貸要不要算看你自己：如果借來的錢有拿去買股票，就要算。」
  3. `numberInput` id `mincash`，label「買完至少要留多少現金（選填）」，plain「生活預備金、近期要繳的錢；留白當 0」，value `s.minCash`，suffix「元」，help：「買正二之後，帳上至少要剩這麼多現金。」「留白就當 0，代表現金可以全部拿去買。」
- read：`s.cash = num('cash'); s.debt = num('debt'); s.minCash = num('mincash');`
  `!(s.cash >= 0)` →「現金要填 0 以上的數字；沒有就填 0。」；`!(s.debt >= 0)` →「借款要填 0 以上的數字；沒有借錢就填 0。」；`!Number.isNaN(s.minCash) && !(s.minCash >= 0)` →「至少要留的現金要填 0 以上的數字；不用就留白。」

### 步驟 4「想要整體等於幾倍大盤」
- hint：「不確定要幾倍，先看下面「你現在」是幾倍，再想大盤跌 10% 時你受得了跌幾 %。」
- about：「目標倍數＝大盤漲跌 1%，你的錢大約漲跌幾 %。1.4 倍代表大盤跌 10%，你約跌 14%。」
- figure：`{ src: '../img/exposure/step4.webp', alt: '插圖：目標倍數＝大盤跌 10%，你跌幾 %。大盤 −10% 時：1 倍你約跌 10%；1.4 倍你約跌 14%；2 倍你約跌 20%。大盤 +10% 時 1.4 倍約漲 14%。老師說：先想清楚跌的時候受不受得了，再決定倍數。粗估；正二的 2 倍是每天 2 倍，放久了會偏離。' }`
- body：
  1. 「你現在」一行 `h('p', { class: 'tip' }, …)`：
     ```js
     let now = null;
     try { now = balancePlan({ stocks: s.stocks, levers: s.levers, cash: s.cash, debt: s.debt, target: 0, basis: 'asset' }).before; } catch { /* 總資產 ≤ 0 就不顯示 */ }
     ```
     `now` 為 null 不顯示；`s.debt > 0` →「你現在：淨資產口徑 {fmtX(now.bN)}、總資產口徑 {fmtX(now.bA)}。」（`now.N <= 0` 時改：「你現在：借款已經大於或等於總資產，淨資產口徑算不出來；總資產口徑 {fmtX(now.bA)}。」）；`s.debt === 0` →「你現在約等於 {fmtX(now.bA)}大盤（沒有借錢，兩種算法一樣）。」
  2. `numberInput` id `target`，label「目標倍數」，termId `exposure`，plain「想要整體等於幾倍大盤，例：1.4」，value `s.target`，suffix「倍」，help：「1 倍＝跟大盤一樣；1.4 倍＝大盤跌 10% 你約跌 14%。」「倍數越高，漲跌都放大；先想跌的時候受不受得了。」
  3. `withHelp(selectField({ id: 'basis', label: '倍數怎麼算', termId: 'basis', plain: s.debt > 0 ? '你有借錢，建議用淨資產口徑' : '你沒有借錢，兩種算法結果一樣', options: [{ value: 'net', label: '淨資產口徑（扣掉借款）' }, { value: 'asset', label: '總資產口徑（不扣借款）' }], value: s.basis || 'net' }), { text: ['淨資產口徑：分母是扣掉借款後你自己的錢，比較貼近「我的錢漲跌幾 %」。', '總資產口徑：分母不扣借款。有借錢時看起來倍數比較低，但跌的時候虧的是你自己的錢。', '結果頁兩種都會算給你看。'] })`
  4. `withHelp(selectField({ id: 'borrow', label: '現金不夠時', plain: '要不要算出還要借多少', options: [{ value: 'no', label: '不借新的錢（算出還差多少）' }, { value: 'yes', label: '可以再借（算出要借多少）' }], value: s.allowBorrow || 'no' }), { text: ['選「可以再借」只是算出金額，不代表借得到，也不代表安全。', '要借之前，先用 ④ 質押壓力測試看大盤跌多少會被追繳。'] })`
- read：`s.target = num('target'); s.basis = …value; s.allowBorrow = …value;`；`!(s.target >= 0)` →「目標倍數要填 0 以上的數字，例：1.4。」

### 步驟 5「進階：完整重配（選填）」
- hint：「大部分人不用動這一步，直接按「看結果」。」
- about：「預設只調正二、其他持股不動。打開完整重配，會連其他持股一起照比重重新分配，沒填比重的會建議全賣。」
- figure：不放。
- body：
  1. `withHelp(selectField({ id: 'full', label: '要不要連其他持股一起重配', options: [{ value: 'off', label: '不要，只調正二（預設）' }, { value: 'on', label: '要，全部照比重重新分配' }], value: s.full || 'off' }), { text: ['只調正二：其他持股一股都不動，只算正二要買賣多少。', '完整重配：全部股票（含正二）照下面的比重重新分配；沒填比重的那檔會建議全部賣掉。'] })`
  2. `h('h3', {}, '各檔目標比重（選填）')`、`h('p', { class: 'tip' }, '比重填相對大小就好，例：60 和 40，不用加起來剛好 100。')`
  3. 每檔其他持股 `numberInput({ id: \`ws${i}\`, label: \`${named(r.code || \`持股 ${i + 1}\`)} 的比重\`, plain: '只有打開完整重配才會用到', value: s.wStocks?.[i], suffix: '%' })`
  4. 每檔正二 `numberInput({ id: \`wl${i}\`, label: …同上（預設名「正二 ${i + 1}」）, plain: s.levers.length > 1 ? '好幾檔正二時，買賣金額照這個比例分；都不填就照現在市值比例分' : '只有一檔正二不用填', value: s.wLevers?.[i], suffix: '%' })`
- read：`s.full`；`s.wStocks = s.stocks.map((_, i) => num(\`ws${i}\`))`；`s.wLevers` 同理；任一有填但 `< 0` →「比重要填 0 以上的數字；不用就留白。」；`s.full === 'on'` 且全部都沒有 `> 0` →「完整重配要替至少一檔填目標比重；只想調正二就選「不要」。」

### 結果
```js
const input = basis => ({
  stocks: s.stocks.map((r, i) => ({ ...r, weight: s.wStocks?.[i] })), levers: s.levers.map((r, i) => ({ ...r, weight: s.wLevers?.[i] })),
  cash: s.cash, debt: s.debt, minCash: Number.isFinite(s.minCash) ? s.minCash : 0, target: s.target,
  basis, allowBorrow: s.allowBorrow === 'yes', fullRebalance: s.full === 'on' });
const r = balancePlan(input(s.basis));
const other = s.basis === 'net' ? 'asset' : 'net';
let o = null; try { o = balancePlan(input(other)); } catch { /* 淨資產 ≤ 0 */ }
const bn = BASIS[s.basis], T = s.target, minCash = Number.isFinite(s.minCash) ? s.minCash : 0;
const formula = p => p.fullMode
  ? `目標 ${T} 倍 × ${BASIS[p === r ? s.basis : other]} ${fmtMoney(p.base)} ÷ 各檔加權 Beta ${p.bw.toFixed(2)}`
  : `（目標 ${T} 倍 × ${BASIS[p === r ? s.basis : other]} ${fmtMoney(p.base)} − 其他持股曝險 ${fmtMoney(p.D)}）÷ 正二 Beta ${p.bw.toFixed(2)}`;
```
依序 `explain`：

1. **{r.label}要調到** `fmtMoney(r.X)`，tone `info`；
   how：`formula(r)`＋（`r.capped` →「，算出來是負的，所以設成 0」）＋「。」；另外 `s.basis === 'asset' && r.borrow > 0 && r.bw > T` 時改寫成：「借錢會讓總資產一起變大，所以改用（目標 {T} 倍 ×（其他持股 {fmtMoney(r.S)}＋至少留 {fmtMoney(minCash)}）− 其他持股曝險 {fmtMoney(r.D)}）÷（正二 Beta {r.bw.toFixed(2)} − 目標 {T}）。」
   means：`r.fullMode` →「全部股票（含正二）合計應該有這麼多市值，每一檔分多少看下面明細。」；`r.capped` →「其他持股的曝險已經超過目標，正二最少只能是 0。」；否則「你的正二（{s.levers.length} 檔合計）應該有這麼多市值。」
2. **要買進／要賣出**（`Math.abs(r.delta) < 0.5` → label「{r.label}」、value「不用動」）value `fmtMoney(Math.abs(r.delta))`；how：「要調到 {fmtMoney(r.X)} − 現在 {fmtMoney(r.L)}。」；means：`r.rows` 每檔「{named(code)} {買|賣} {fmtMoney(|trade|)}（{shareText(shares)}）」用「；」串，加「。」；todo：`['股數是金額 ÷ 現價的約略值，沒扣手續費、沒分整張零股；下單前用 ', link('cost.html', '⑨ 買賣成本與損益'), ' 再算一次。']`
3. **錢夠不夠**：value `!r.enough` →「不夠」（tone `bad`）；`r.borrow > 0` →「要借 {fmtMoney(r.borrow)}」（tone `warn`）；否則「夠」（tone `ok`）。
   how：「可以用的現金＝現金 {fmtMoney(s.cash)} − 至少留 {fmtMoney(minCash)}＝{fmtMoney(r.available)}；這次要{r.delta >= 0 ? '買' : '賣'} {fmtMoney(|delta|)}。」
   means：`!r.enough` →「還差 {fmtMoney(r.shortage)}，最多只能先買 {fmtMoney(r.canBuy)}。可以降低目標倍數、補錢，或在步驟 4 選「可以再借」。」；`r.borrow > 0` →「現金不夠，要新增借款 {fmtMoney(r.borrow)}，借款變成 {fmtMoney(r.debtAfter)}。這只是算出金額，不代表借得到，也不代表安全。」；`r.delta < 0` →「是賣出，賣掉的錢會回到現金，現金變成 {fmtMoney(r.cashAfter)}。」；否則「買完現金剩 {fmtMoney(r.cashAfter)}。」
   todo（只有 `r.borrow > 0`）：`['借之前先用 ', link('pledge.html', '④ 質押壓力測試'), ' 看大盤跌多少會被追繳。']`
4. **有沒有達到目標**：value `r.reached` →「達到 {T} 倍」（tone `ok`）；`!r.enough` →「錢不夠，還沒達到」（`warn`）；否則「只到 {fmtX(r.achieved)}」（`warn`）。
   how：「調整後曝險 {fmtMoney(r.after.exposure)} ÷ 調整後{bn} {fmtMoney(s.basis === 'net' ? r.after.N : r.after.A)}＝{fmtX(r.achieved)}。」
   means（依序取第一個成立的）：`r.reached` →「大盤跌 10%，你的{bn}大約跌 {(T * 10).toFixed(1)}%；漲的時候也一樣放大。」；`!r.enough` →「下面「調整後」的數字是假設錢夠、買足的情況；實際只能先買 {fmtMoney(r.canBuy)}。」；`r.capped` →「其他持股本身就超過 {T} 倍，正二賣光也降不下來。要降就要賣一些其他持股（步驟 5 可以打開完整重配）。」；`r.borrowCantReach` →「總資產口徑下，目標 {T} 倍不低於正二的 {r.bw.toFixed(2)} 倍：借錢買正二，總資產也跟著變大，倍數追不上目標。改用淨資產口徑，或把目標調低。」；否則「沒有剛好達到目標，看下面的調整前後比較。」
   todo：`['正二的 2 倍是「每天」2 倍，放久了會偏離，這裡的倍數只是估計；看 ', link('decay.html', '⑥ 正二不是兩倍？'), '。']`
5. **用{BASIS[other]}口徑算** value `o ? fmtMoney(o.X) : '算不出來'`；how：`o` →「{formula(o)}。」，否則「借款大於或等於總資產，淨資產口徑算不出來。」；means：`s.debt > 0 && o` →「有借錢時兩種差很多：{bn}口徑要調到 {fmtMoney(r.X)}，{BASIS[other]}口徑要調到 {fmtMoney(o.X)}{o.enough ? '' : '（現金不夠）'}。聽別人說幾倍之前，先問是哪一種。」；`s.debt === 0` →「你沒有借錢，兩種算法一樣。」

接著 `h('h3', {}, '調整前後比較')`＋`h('table', { class: 'trade-table' }, …)`，表頭「」「調整前」「調整後」，列（b＝r.before、a＝r.after）：總資產 `fmtMoney(A)`、淨資產 `fmtMoney(N)`、借款 `fmtMoney(debt)`、負債比 `fmtPct(debtRatio)`、資產槓桿比 `fmtX(lev)`、股票市值 `fmtMoney(stocks)`、股票市值 ÷ 淨資產 `fmtPct(expNet)`、總資產口徑倍數 `fmtX(bA)`、淨資產口徑倍數 `fmtX(bN)`、{r.label}市值 `fmtMoney(r.L)`→`fmtMoney(r.X)`、現金 `fmtMoney(cash)`。

再 `h('h3', {}, '每一檔明細')`＋`trade-table`，欄位「代號」「現在市值」「調整後」「買賣」；每列 `r.rows`：`named(code)`、`fmtMoney(value)`、`fmtMoney(target)`、「{買|賣} {fmtMoney(|trade|)}」＋（有股數時）`h('br')`＋`h('small', {}, shareText(shares))`。

最後 `h('div', { class: 'note' }, …)` 各一個 `h('p')`：
- 固定：`['算法照朋友那格計算機（使用者以手機版 Claude 依計算模板製作，後續小改），同一組輸入算出同樣的數字；欄位對照看 ', link('calc-guide.html', '① 朋友那格計算機怎麼用'), '。']`
- 固定：「沒算手續費、稅和借款利息；股數是約略值。」
- `r.fullMode`：「完整重配：全部持股（含正二）照比重重新分配，沒填比重的會建議全賣。」
- `r.bwDefaulted`：「各檔 Beta 合起來不是正數，改用 2 計算（跟原頁一樣）。」

### 範例與頁尾
```js
const example = { stocks: [{ code: '0050', shares: 100000, price: 100, beta: 1 }], levers: [{ code: '00685L', shares: 0, price: 20, beta: 2 }],
  cash: 2000000, debt: 3000000, minCash: NaN, target: 1.4, basis: 'net', allowBorrow: 'no', full: 'off', wStocks: [NaN], wLevers: [NaN] };
```
範例結果必須是：正二要調到 NT$ 1,300,000（(1.4 × 9,000,000 − 10,000,000) ÷ 2.00）；要買進 NT$ 1,300,000（00685L 群益臺灣加權正2 買 NT$ 1,300,000，約 65,000 股）；錢夠不夠「夠」、買完現金剩 NT$ 700,000；達到 1.4 倍、大盤跌 10% 約跌 14.0%；用總資產口徑算 NT$ 3,400,000（現金不夠）；調整前後：總資產 12,000,000／12,000,000、淨資產 9,000,000／9,000,000、負債比 25.0%／25.0%、槓桿比 1.33／1.33、股票市值 10,000,000／11,300,000、股票市值÷淨資產 111.1%／125.6%、總資產口徑 0.83／1.05、淨資產口徑 1.11／1.40、正二市值 0／1,300,000、現金 2,000,000／700,000。

頁尾照 pledge.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片：
- `figure({ src: '../img/exposure/comic.webp', alt: '四格漫畫：一、小安有股票 1,000 萬、現金 200 萬、借款 300 萬，淨資產 1,000＋200−300＝900 萬，1,000 萬 ÷ 900 萬約 1.11 倍。二、想要 1.4 倍：1.4 × 900 萬＝1,260 萬，減 1,000 萬還差 260 萬曝險；曝險就是跟著大盤漲跌的金額。三、正二 1 元算 2 元曝險：260 萬 ÷ 2＝買 130 萬正二，現金 200 萬剩 70 萬，不用借錢。四、1.4 倍代表大盤跌 10%，淨資產約跌 14%；正二是每天 2 倍，放久了會偏離，這只是估計，錢夠不等於安全。沒算手續費、稅和利息；正二每股 20 元時約 65,000 股。' })`
- 三段 `h('p')`：
  - 「曝險倍數回答的是：大盤漲跌 1%，你的錢大約漲跌幾 %。正二每 1 元市值大約算 2 元曝險，所以用正二調倍數，比全部買 0050 省現金。」
  - 「「錢夠」跟「達到目標」是兩件事：其他持股本身就超過目標時，錢夠也降不下來；用總資產口徑借錢買正二，有時借了也追不上目標。結果頁會分開寫。」
  - 「正二的 2 倍是「每天」2 倍，拉長時間會偏離（波動耗損），這裡的倍數只是估計。」
- `h('h3', {}, '網路上其他槓桿做法，在工具箱哪裡算')`＋`trade-table`，欄位「做法」「在哪裡算」：
  - 「大仁 50/50：正二、現金各半，漲跌一半就配回」｜`link('trigger5050.html', '② 50/50 觸發提醒')`
  - 「532／442／433 百分比配置（HAMR 指數爆擊流）」｜`link('rebalance.html', '③ 定期配比再平衡')`
  - 「質押借錢買正二」｜`link('pledge.html', '④ 質押壓力測試')`
  - 「人生槓桿（HAMR）」｜「⑬ 人生槓桿體檢（製作中）」
  - 「凱利公式：幾倍槓桿最划算」｜「⑭ 幾倍槓桿最划算（製作中）」
  - 「計算Pro 的 Beta 看板」｜「不連結：它的補現金公式算錯（研究時的例子：建議補 144 萬，補完只到 0.98 倍；要到目標其實要 360 萬）」
- `h('p', {}, '同類工具只找到 HAMR 指數爆擊流的曝險計算機，但它是輸入三類百分比，不是從目標倍數反推正二要買多少。')`

最後 `disclaimer('executable')`。`img/exposure/` 的 webp 由 Opus 轉檔放入，你不要放、不要轉檔。

## 2.3 `js/pages/calc-guide.js` 兩處文字

- 「這頁一格一格說明朋友在用的「正二平衡計算器」。看完可以到原頁操作，也可以用工具箱的 ⑪ 算同一件事。」→「這頁一格一格說明朋友在用的「正二平衡計算器」。看完可以到原頁操作，也可以用工具箱的 ⑪「正二要買多少」一步一步算（算法跟原頁一樣）。」
- 連結文字「打開 ⑪ 我現在等於幾倍大盤」→「打開 ⑪ 正二要買多少」。

## 3. 生三張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/balance-01-正二要買多少四格.md` | `docs/figures/cartoon/out/balance-comic.png` |
| `docs/figures/cartoon/balance-02-有借錢時倍數兩種算法.md` | `docs/figures/cartoon/out/balance-step3.png` |
| `docs/figures/cartoon/balance-03-目標倍數是什麼.md` | `docs/figures/cartoon/out/balance-step4.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/balance.js').then(m=>{const r=m.balancePlan({stocks:[{code:'0050',shares:100000,price:100,beta:1}],levers:[{code:'00685L',shares:0,price:20,beta:2}],cash:2000000,debt:3000000,target:1.4,basis:'net'});const o=m.balancePlan({stocks:[{code:'0050',shares:100000,price:100,beta:1}],levers:[{code:'00685L',shares:0,price:20,beta:2}],cash:2000000,debt:3000000,target:1.4,basis:'asset'});console.log(r.X,r.delta,r.cashAfter,r.enough,r.reached,r.rows[0].shares,r.after.bN.toFixed(2),r.after.bA.toFixed(2),o.X,o.enough)})"
node --check js/pages/exposure.js
node --check js/ui/wizard.js
```
預期：`ℹ tests 116`、`ℹ pass 116`、`ℹ fail 0`；第二行 `1300000 1300000 700000 true true 65000 1.40 1.05 3400000 false`；後兩行無輸出。

## 5. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
- …
## 新增／修改檔案
- …
## PROOF_CMD 結果
- npm.cmd test：tests __ pass __ fail __
- 範例數字：__
- node --check：__
## 卡通圖
- balance-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- balance-step3.png：同上
- balance-step4.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
