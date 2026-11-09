# 任務 ⑬⑭ v1：「人生槓桿體檢」「幾倍槓桿最划算」兩個新精靈＋兩個輸入元件＋四張卡通圖

- 版本：2026-11-09 v1（框架 v5.10）。上一份（⑥⑧ v1）已完成上線，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/rebalance.js`（全檔，**照抄它的寫法**：import、`steps`、`explain`、`example`、持股步驟自動抓價、頁尾「怎麼讀」）
- `js/pages/decay.js` 第 60–80 行（`lineChart` 用法）
- `js/ui/wizard.js` 第 1–50 行（介面註解，含本次新增的 `kind:'life'`、`debtsInput`、`readDebts`）、第 230–345 行（`betaHoldingsInput`、`lotsInput` 實作，新元件照它們的寫法）
- `js/core/lifelev.js`、`js/core/kelly.js`（全檔，**只准呼叫**，JSDoc 是規格）
- `tools/rebalance.html`
- `docs/figures/cartoon/00-風格與角色.md` 和第 4 節表裡的四個提示檔

## 1. 只准改／新增這些檔

- `js/ui/wizard.js`：只准 (a) `betaHoldingsInput` 加 `kind:'life'`；(b) 檔尾新增 `debtsInput`、`readDebts`。**不准改其他函式的行為與簽名、不准改檔頭註解**。
- 新增 `js/pages/lifelev.js`、`js/pages/kelly.js`、`tools/lifelev.html`、`tools/kelly.html`（html 照抄 `tools/rebalance.html`，只改 `<title>`〔「人生槓桿體檢｜正二工具箱」「幾倍槓桿最划算｜正二工具箱」〕和頁面 script 路徑）。
- `css/app.css`：只准**在檔尾追加**新元件需要的幾行（若需要）。
- `docs/figures/cartoon/out/` 底下四張 PNG（第 4 節）。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`js/data/`（`tools.js` 的 status 由 Opus 改）、`tests/`、`img/`、其他頁面、`docs/`（`docs/figures/cartoon/out/` 除外）。覺得要改就停下寫進回報。

共用輔助（兩頁各自寫在檔內）：`num`、`named`、`link` 照抄 ③ 頁；`blank = v => v === undefined || v === null || Number.isNaN(v)`；`signedMoney = n => (n < 0 ? '−' : '+') + fmtMoney(Math.abs(n))`。

## 2. 元件（`js/ui/wizard.js`）

### 2.1 `betaHoldingsInput` 的 `kind:'life'`
- 行為同 `'stock'`：可以全部刪光、刪光顯示既有空白提示；max 預設 10；label 預設「你所有的股票和 ETF」。
- 股數副標「1 張＝1000 股」、股數說明同 `'stock'`；**Beta** placeholder 空白、副標「留白＝看代號猜」、說明文字同 `'mix'`、ⓘ 用 `'beta'`。
- `readBetaHoldings` 不用改。

### 2.2 `debtsInput({ id, rows = [], max = 8, label = '你的借款' })`／`readDebts(id)`
- 結構照 `lotsInput`：外框 `div#id.holdings.debts`、`h3` 標題、清單、「＋ 再加一筆借款」（新列種類預設 `'mortgage'`，focus 到餘額）、每列「刪掉這筆」。清單空時顯示 `p.muted`「沒有借款：直接按「下一步」。」，有列時移除。到 max 隱藏新增鈕。每列標題 `strong`「第 N 筆」。
- 每列 class `holding debt`，欄位（都用 `withHelp`，class 前綴 `d-`）：
  | class | 標籤 | 副標 | 說明（help text） |
  |---|---|---|---|
  | `d-kind`（select，選項 `DEBT_KINDS` 的 value／label，從 `../core/lifelev.js` import） | 種類 | 借來做什麼不影響這格 | 「房貸、信貸、股票質押、融資、其他（車貸、保單借款、親友借款…）。」「融資、質押這類用股票擔保的，追繳風險請用 ④、⑤ 另外算。」 |
  | `d-balance` | 還欠多少（元） | 看銀行 App 的剩餘本金 | 「現在還沒還的本金，不是當初借的金額。」 |
  | `d-monthly` | 每月繳多少（元） | 知道就填，不知道留白 | 「看扣款紀錄或繳款通知。」「留白就用下面的利率（和剩幾年）幫你算。」 |
  | `d-rate` | 年利率（%） | 例：2.2 | 「借款合約或 App 上的年利率。」「只填利率、不填剩幾年，就當作只繳利息（質押、融資常見）。」 |
  | `d-years` | 還剩幾年 | 例：25 | 「還要繳幾年；填了會用本息平均攤還算每月繳款。」 |
  | `d-invest` | 拿去投資多少（元） | placeholder 依種類：`investAll ? '留白＝全部' : '留白＝0'`；換種類時要更新 | 「這筆借款有多少拿去買股票、ETF。」「房貸買房子就留白；房貸增貸拿去買股票，填那一部分。」 |
- 數字欄 `inputmode="decimal"`，值用檔內 `show()` 帶入（NaN 留白）。
- `readDebts(id)` → `[{ kind, balance, monthly, ratePct, years, invest }]`，數字用 `parseNum`（空白＝NaN），不檢查。

## 3. 頁面

### 3.1 ⑬ `js/pages/lifelev.js`
import：`h, toolHeader, disclaimer, figure`（components）、`wizard, betaHoldingsInput, readBetaHoldings, debtsInput, readDebts, tokenBox, numberInput, explain`（wizard）、`lifeLeveragePlan`（core/lifelev）、`guessBeta`（core/rebalance）、`parseNum, fmtMoney, fmtPct, fmtX`（format）、`STOCK_NAMES`、`TOOLS`。

`params(s, over = {})`：
```
{ holdings: s.rows || [], cash: s.cash, realEstate: s.realEstate, otherAssets: s.otherAssets,
  debts: (s.debts || []).map(d => ({ kind: d.kind, balance: d.balance, monthly: d.monthly, rate: d.ratePct / 100, years: d.years, invest: d.invest })),
  monthlyExpense: s.monthlyExpense, monthlyIncome: s.monthlyIncome, stressDrop: s.stressPct / 100, ...over }
```
（NaN 直接傳，core 會當作沒填。）各步檢查用 `lifeLeveragePlan(params(s, {…還沒填的欄位給假值}))`，錯誤丟出去。

**步驟 1「你的持股」**
- hint：「填你全部的股票和 ETF，不只一個策略。股數看券商 App 的庫存；沒有股票就全部刪掉。」
- about：「每檔市值 × Beta 加起來，就是你整體跟著大盤漲跌的金額（曝險）。」
- figure：`../img/common/step-holdings.svg`，alt 照抄 ③ 頁步驟 2。
- body：`betaHoldingsInput({ id: 'rows', rows: s.rows || [{}], kind: 'life' })`＋`tokenBox()`，自動抓價的寫法照 ③ 頁。
- read：`s.rows = readBetaHoldings('rows')`；檢查 `params(s, { cash: 0, debts: [], monthlyExpense: 1 })`。

**步驟 2「現金和房子」**
- hint：「現金含活存、定存；房子填現在大概能賣多少，沒有就留白。」
- about：「總資產＝現金＋股票＋房子＋其他。房子和其他資產不算進金融淨資產。」
- body：`numberInput` 三格：`cash`「現金」plain「活存＋定存＋證券戶交割款，沒有填 0」；`realEstate`「房子市價（選填）」plain「實價登錄或估價，留白＝0」help「自住、出租都算。房子的漲跌在這裡當作 1 倍，是簡化。」；`otherAssets`「其他資產（選填）」plain「車子、保單價值準備金…留白＝0」。suffix 都是「元」。
- read：`cash` 空白 → 錯誤「請填現金，沒有就填 0。」；存三格；檢查 `params(s, { debts: [], monthlyExpense: 1 })`。

**步驟 3「你的借款」**
- hint：「每筆借款一列；看銀行、券商 App 的剩餘本金和每月扣款。沒有借款就全部刪掉。」
- about：「拿去買股票的借款要從金融淨資產扣掉；拿去買房子的不扣，但每月還款照算。」
- figure：`../img/lifelev/step3.webp`，alt 照第 4 節圖 2 的文字完整寫出。
- body：`debtsInput({ id: 'debts', rows: s.debts || [] })`。
- read：`s.debts = readDebts('debts')`；檢查 `params(s, { monthlyExpense: 1 })`。

**步驟 4「生活費和收入」**
- hint：「生活費不含還款（還款上一步填過了）。收入填每月實拿。」
- body：`monthlyExpense`「每月生活費」plain「吃住交通保險…不含還款」；`monthlyIncome`「每月收入（選填）」plain「薪水等實拿，留白就不算結餘」；`stressPct`「大跌情境（選填）」plain「大盤跌幾 %，留白＝30」suffix「%」。前兩格 suffix「元」。
- read：存三格；檢查 `params(s)`。

**結果**（`const r = lifeLeveragePlan(params(s))`），依序：
1. `explain({ label: '金融淨資產', value: fmtMoney(r.financialNet), tone: r.financialNet > 0 ? 'info' : 'bad', how: '現金 {cash} ＋ 股票 {stockValue} − 拿去投資的借款 {investDebt} ＝ {financialNet}。', means: '能拿來投資、會跟著市場漲跌的自己的錢。房子不算；房貸買房不扣。' })`
2. 市場曝險倍數：`r.marketLeverage === null` → value「算不出來」、tone bad、means「金融淨資產是 0 或負的：借來投資的錢比現金加股票還多。」；否則 value `fmtX(r.marketLeverage)`（fmtX 已帶「倍」），tone `> 2 ? 'bad' : > 1 ? 'warn' : 'ok'`，how「每檔市值 × Beta：」＋每檔「{named(code)} {fmtMoney(value)} × {beta}{beta 是猜的就加（看代號猜）}」用「＋」接，＋「＝ {fmtMoney(exposure)}；÷ 金融淨資產 {fmtMoney(financialNet)}。」，means「大盤漲跌 1%，你的金融淨資產大約漲跌 {marketLeverage.toFixed(2)}%。」，todo `['想調整倍數，看 ', link('exposure.html', '⑪ 正二要買多少'), '。']`。（「是猜的」＝ `blank(s.rows[i].beta)`。）
3. `explain({ label: '帳面槓桿', value: …, how: '總資產 {assets} ÷ 總淨資產 {net}。', means: '把房子、房貸都算進來，總共借了多少錢來撐資產。總淨資產＝總資產 {assets} − 全部借款 {debt}。' })`；`r.bookLeverage === null` → value「總淨資產是負的」tone bad。
4. `explain({ label: '總曝險槓桿', value: fmtX(r.totalLeverage), how: '（房子 {realEstate} ＋ 股票曝險 {exposure}）÷ 總淨資產 {net}。', means: '房價和股市一起跌時，總淨資產會放大幾倍受傷。房子當 1 倍是簡化。' })`；null 時同上。
5. 每月現金流：`r.monthlyFree === null` → label「每月要付」、value `fmtMoney(r.monthlyOut)`、tone info；否則 label「每月結餘」、value `signedMoney(r.monthlyFree)`、tone `r.monthlyFree < 0 ? 'bad' : 'ok'`。how：（有收入時「收入 {income} − 」）＋「生活費 {expense}」＋每筆借款「 − {label} {fmtMoney(monthly)}」，`payBy === 'amortized'` 加「（用年利率 {ratePct}%、{years} 年本息攤還算的）」、`'interest'` 加「（只繳利息：餘額 × {ratePct}% ÷ 12）」。means：結餘 < 0 時「每月入不敷出，要動用存款或賣股票。」，否則「每月花在生活和還款的錢共 {monthlyOut}。」
6. `explain({ label: '現金撐幾個月', value: r.cashMonths.toFixed(1) + ' 個月', tone: < 3 ? 'bad' : < 6 ? 'warn' : 'ok', how: '現金 {cash} ÷ 每月要付 {monthlyOut}。', means: '收入突然停了，不賣股票能撐多久。大跌時常常也是最不想賣的時候。' })`
7. 生活費倍數：value `r.lifeMultiple > 0 ? r.lifeMultiple.toFixed(1) + ' 倍' : '0 倍'`，tone info，how「金融淨資產 {financialNet} ÷ 一年生活費 {12×expense}。」，means `r.withdrawRate ? '相當於每年領 ' + fmtPct(r.withdrawRate) + '。對照：4% 法則約 25 倍。' : '金融淨資產不是正的。'`，todo `['退休要存多少，看 ', link('retire.html', '⑲ 退休提領'), '。']`。
8. 大盤跌多少會歸零：`r.exposure <= 0` 就整項不放。`r.zeroDrop === null`（金融淨資產 ≤ 0）→ value「已經是負的」tone bad；`r.zeroDrop > 1` → value「大盤跌光也不會」tone ok；否則 value `fmtPct(r.zeroDrop)`、tone `< 0.5 ? 'bad' : 'warn'`。how「金融淨資產 {financialNet} ÷ 股票曝險 {exposure}。」，means「直線估算：正二每天重新 2 倍，真的大跌時結果會不太一樣。」
9. 大跌情境：label `'大盤跌 ' + fmtPct(r.stressDrop, 0) + ' 後'`，value `fmtMoney(r.financialNetAfter)`，tone `r.financialNetAfter <= 0 ? 'bad' : 'warn'`，how：每檔「{named(code)} {fmtMoney(value)} → {fmtMoney(valueAfter)}」用「；」接，＋「。金融淨資產 {financialNet} → {financialNetAfter}；借款不會跟著變少。」，means `r.marketLeverageAfter === null ? '金融淨資產變成 0 或負的。' : '曝險倍數 ' + fmtX(r.marketLeverage) + ' → ' + fmtX(r.marketLeverageAfter) + '：越跌倍數越高。'`，todo：借款裡有 `pledge` 就放 `['有股票質押，追繳線看 ', link('pledge.html', '④ 質押壓力測試'), '。']`；有 `margin` 就放 ⑤ `margin.html`「⑤ 融資融券維持率」（兩個都有就兩句接在一起；都沒有就不放）。
10. `h('p', { class: 'note' }, '只做體檢、不給建議倍數。Beta 是估計值、房子當 1 倍；沒算稅、手續費、利率變動。')`

**example**：
```
{ rows: [{ code: '0050', shares: 10000, price: 195.5, beta: NaN }, { code: '00631L', shares: 20000, price: 26.3, beta: NaN }],
  cash: 500000, realEstate: 12000000, otherAssets: NaN,
  debts: [{ kind: 'mortgage', balance: 8000000, monthly: NaN, ratePct: 2.2, years: 25, invest: NaN },
          { kind: 'credit', balance: 1000000, monthly: 18000, ratePct: NaN, years: NaN, invest: 1000000 }],
  monthlyExpense: 40000, monthlyIncome: 100000, stressPct: NaN }
```
範例結果必須有：金融淨資產 1,981,000；市場曝險 1.52；帳面槓桿 2.50；總曝險槓桿 2.51；房貸月付 34,693；每月結餘 +7,307；現金 5.4 個月；生活費倍數 4.1 倍（每年領 24.2%）；歸零 65.9%；跌 30% 後 1,078,900、曝險 1.52 → 1.66。

**怎麼讀**：`figure({ src: '../img/lifelev/comic.webp', alt: 第 4 節圖 1 四格文字完整寫出 })`，接三段：
- 「同樣買了正二，有人只用閒錢、有人背著房貸和信貸。這個工具把家裡有的、欠的全部列出來，看你真正開了幾倍槓桿。」
- 「三種倍數分母不同：市場曝險倍數看金融淨資產（只扣拿去投資的借款）；帳面槓桿、總曝險槓桿看總淨資產（扣全部借款、房子也算）。不要拿不同分母的數字互相比。」
- 「大跌時股票變少、借款不變，所以越跌倍數越高。現金撐幾個月，決定你大跌時要不要被迫賣股票。」

最後 `disclaimer('general')`。

### 3.2 ⑭ `js/pages/kelly.js`
import：`h, toolHeader, disclaimer, figure, lineChart`（components）、`wizard, numberInput, explain`（wizard）、`kellyPlan`（core/kelly）、`parseNum, fmtPct`（format）、`TOOLS`。

`params(s)`：`{ cagr1x: s.cagrPct / 100, vol: s.volPct / 100, borrowRate: s.borrowPct / 100, cashRate: blank(s.cashPct) ? 0 : s.cashPct / 100, current: s.current }`
`x2 = L => L.toFixed(2) + ' 倍'`。

**步驟 1「大盤的假設」**
- hint：「不知道就先用範例：每年 8%、波動 20%，這只是常見的假設，不是預測。」
- about：「凱利倍數只看兩件事：平均每年賺多少、漲跌有多劇烈。兩個都是你猜的，結果對它們非常敏感。」
- figure：`../img/kelly/step1.webp`，alt 照第 4 節圖 2 的文字完整寫出。
- body：`numberInput({ id: 'cagrPct', label: '1 倍每年平均賺多少', plain: '例：全部買 0050 的長期年化報酬', suffix: '%', value: s.cagrPct, help: { text: ['長期年化報酬（含息）。這是對未來的假設，過去的報酬不代表未來。', '填保守一點比較安全。'] } })`；`numberInput({ id: 'volPct', label: '每年波動', termId: 'volatility', plain: '例：20', suffix: '%', value: s.volPct, help: { text: ['一年裡漲跌的典型幅度（標準差）。', '大盤 ETF 常見大約 15%–25%；個股通常更大。'] } })`
- read：空白 → 錯誤「請填每年報酬和波動。」；存；`kellyPlan({ ...params({ ...s, borrowPct: 0, cashPct: 0, current: NaN }) })` 檢查。

**步驟 2「利率和你現在的倍數」**
- hint：「借錢利率填你實際借得到的（質押、信貸、融資）；現金利率填定存或活存。」
- body：`borrowPct`「借錢的年利率」plain「例：質押約 2.5–3」suffix「%」；`cashPct`「現金的年利率（選填）」plain「留白＝0」suffix「%」；`current`「你現在幾倍（選填）」plain「留白就不比較」suffix「倍」help `{ text: ['不知道自己幾倍，可以先用 ⑬ 人生槓桿體檢或 ⑪ 正二要買多少算。', '例：全部買 0050 是 1 倍；一半 0050、一半正二約 1.5 倍。'] }`。
- read：`borrowPct` 空白 → 錯誤「請填借錢的年利率。」；存；`kellyPlan(params(s))` 檢查。

**結果**（`const r = kellyPlan(params(s)); const by = Object.fromEntries(r.rows.map(x => [x.key, x]));`）依序：
1. `explain({ label: '全凱利（長期成長最快）', value: x2(r.full), tone: 'info', how: r.full >= 1 ? '先把年化 ' + s.cagrPct + '% 換成每年平均 μ＝ln(1 + ' + s.cagrPct + '%) ＋ ' + s.volPct + '%² ÷ 2 ＝ ' + fmtPct(r.mu, 2) + '；再算（μ − ln(1 + 借錢利率 ' + s.borrowPct + '%)）÷ ' + s.volPct + '%² ＝ ' + r.full.toFixed(2) + ' 倍。' : '報酬扣掉借錢利率後不夠付波動的代價，借錢不划算；最好的倍數在 1 倍以內（多出來的放現金）。', means: r.full === 0 ? '報酬比現金利率還低：照這個假設，不投入最好。' : '這個倍數長期年化最高，約 ' + fmtPct(r.maxCagr) + '。' })`
2. `explain({ label: '半凱利', value: x2(r.half), tone: 'ok', how: '全凱利 ÷ 2。', means: '長期年化 ' + fmtPct(by.half.cagr) + '，比全凱利少一點，但腰斬機率從 ' + fmtPct(by.full.halveProb) + ' 降到 ' + fmtPct(by.half.halveProb) + '。四分之一凱利是 ' + x2(r.quarter) + '。' })`
3. 對照表 `h('table', { class: 'trade-table' })`，欄「倍數｜長期年化｜曾經腰斬機率」，每列：`x.label + '（' + x2(x.L) + '）'`（`cash`／`one`／`two` 的 label 已含倍數，就只放 label）、`fmtPct(x.cagr)`、`fmtPct(x.halveProb)`。表下 `h('p', { class: 'note' }, '曾經腰斬機率：在這個模型裡，資產曾經跌到起點一半的機率（時間拉到無限長的理論值）。')`
4. 有 `by.current`：`explain({ label: '你現在 ' + x2(by.current.L), value: fmtPct(by.current.cagr), tone: r.breakEven !== null && by.current.L >= r.breakEven ? 'bad' : by.current.L > r.full ? 'warn' : 'ok', how: '照同樣的假設，' + x2(by.current.L) + '的長期年化。', means: by.current.L > r.full ? '已經過了山頂：再加倍數，長期報酬只會變少，腰斬機率（現在 ' + fmtPct(by.current.halveProb) + '）繼續變大。' : '還在山頂左邊：加倍數報酬會增加，但腰斬機率（現在 ' + fmtPct(by.current.halveProb) + '）也會跟著變大。' })`
5. `r.breakEven !== null`：`explain({ label: '超過幾倍長期會虧', value: x2(r.breakEven), tone: 'bad', how: '長期年化掉回 0 的倍數。', means: '倍數太高時，波動拖累比多賺的還多，放越久越虧。正二全押是 2 倍。' })`
6. `lineChart({ series: [{ name: '長期年化報酬', values: r.curve.map(p => p.cagr) }], label: '倍數 0 到 4 倍的長期年化報酬曲線', yFormat: v => { const t = (v * 100).toFixed(0); return (t === '-0' ? '0' : t) + '%'; }, baseline: 0 })`，下面 `h('p', { class: 'note' }, '橫軸：最左邊 0 倍、最右邊 4 倍，每格 0.1 倍。')`
7. `h('p', { class: 'note' }, '理論模型：每年報酬、波動、利率都固定，每天調回同樣倍數；沒算內扣費用、追蹤誤差、追繳和斷頭。對假設非常敏感：每年 8% 改成 6%（其他不變），全凱利就從 1.69 倍掉到約 1.22 倍。')`

**example**：`{ cagrPct: 8, volPct: 20, borrowPct: 3, cashPct: 1, current: 1.4 }`；範例結果必須有：全凱利 1.69 倍、年化 9.0%；半凱利 0.84 倍（7.2%、腰斬 3.4%）；2 倍 8.8%／48.1%；你現在 1.40 倍 8.8%／22.4%；超過 3.76 倍長期會虧。

**怎麼讀**：`figure({ src: '../img/kelly/comic.webp', alt: 第 4 節圖 3 四格文字完整寫出 })`，接三段：
- 「倍數越高不一定賺越多。每天調回固定倍數時，波動會吃掉複利：倍數太低賺太少、太高被波動拖垮，中間有一個長期成長最快的點，叫凱利倍數。」
- 「過了凱利倍數，報酬開始變少、風險繼續變大；大約到兩倍凱利，長期報酬就掉回跟現金差不多。」
- 「報酬和波動都是猜的，猜錯一點凱利倍數就差很多，所以很多人只用一半（半凱利）。這裡也沒算追繳：借錢的人在跌到凱利模型說的谷底之前，可能就先被追繳了。」

最後 `disclaimer('general')`。

## 4. 生四張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| # | 提示檔 | 存成 |
|---|---|---|
| 1 | `docs/figures/cartoon/lifelev-01-人生槓桿體檢四格.md` | `docs/figures/cartoon/out/lifelev-comic.png` |
| 2 | `docs/figures/cartoon/lifelev-02-借的錢拿去哪.md` | `docs/figures/cartoon/out/lifelev-step3.png` |
| 3 | `docs/figures/cartoon/kelly-01-幾倍最划算四格.md` | `docs/figures/cartoon/out/kelly-comic.png` |
| 4 | `docs/figures/cartoon/kelly-02-報酬和波動.md` | `docs/figures/cartoon/out/kelly-step1.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 頁面引用 `img/lifelev/comic.webp`、`step3.webp`、`img/kelly/comic.webp`、`step1.webp`（Opus 轉檔搬過去，你不用做）。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 5. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "Promise.all([import('./js/core/lifelev.js'),import('./js/core/kelly.js')]).then(([a,b])=>{const r=a.lifeLeveragePlan({holdings:[{code:'0050',shares:10000,price:195.5},{code:'00631L',shares:20000,price:26.3}],cash:500000,realEstate:12000000,debts:[{kind:'mortgage',balance:8000000,rate:.022,years:25},{kind:'credit',balance:1000000,monthly:18000,invest:1000000}],monthlyExpense:40000,monthlyIncome:100000});const k=b.kellyPlan({cagr1x:.08,vol:.2,borrowRate:.03,cashRate:.01,current:1.4});console.log(r.financialNet,r.marketLeverage.toFixed(2),Math.round(r.monthlyFree),r.marketLeverageAfter.toFixed(2),k.full.toFixed(2),k.breakEven.toFixed(2),k.rows.length)})"
node --check js/pages/lifelev.js
node --check js/pages/kelly.js
node --check js/ui/wizard.js
```
預期：`ℹ tests 145`、`ℹ pass 145`、`ℹ fail 0`；第二行 `1981000 1.52 7307 1.66 1.69 3.76 7`；後三行無輸出。

## 6. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
## 修改檔案
## PROOF_CMD 結果
- npm.cmd test：tests __ pass __ fail __
- 範例數字：__
- node --check（三檔）：__
## 生圖（每張重生幾次、有沒有殘留錯字）
## 偏離規格或自行決定的小事
## 需要 Opus 決定的事
```
