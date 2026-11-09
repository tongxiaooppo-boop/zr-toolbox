# zr-toolbox 框架（Gate 0 定稿）

- 版本：**2026-11-09 v5.10**（v5.10＝⑬⑭：新增 `lifelev.js`（`lifeLeveragePlan`、`loanPayment`、`DEBT_KINDS`）、`kelly.js`（`kellyPlan`、`leveredGrowth`）；`wizard.js` 定 `betaHoldingsInput` 的 `kind:'life'` 與 `debtsInput`／`readDebts` 簽名（Codex 實作）。v5.9＝⑥⑧ 改精靈：`decay.js` 新增 `decayPlan`（情境＋天數＋幅度＋選填金額與每年內扣費用÷250）、`drawdown.js` 新增 `drawdownPlan`（holding／peak／pct／series 四種算跌幅，回本漲幅、虧損、年數、對照表）。v5.8＝③ 改精靈：`rebalance.js` 新增 `WIZARD_TEMPLATES`（8 個，含自訂；模板只是預設列）、`guessBeta(code)`、`rebalancePlan`（任意多檔、目標比例、新投入、零股／整張取整、到期日選填）；舊 `TEMPLATES`／`rebalance` 保留、新頁不用。v5.7＝股票事件：新增 `core/events.js`（`normalizeEvents`、`adjustBasePrice`：分割／反分割／除權息／減資，係數＝事件後參考價÷事件前收盤價，只用基準日之後的事件）、`price.js` 新增 `fetchEvents`（三個 FinMind 資料集，任一失敗整個失敗）；② 依日期抓的基準價自動換算。v5.6＝② 改精靈：`trigger.js` 新增 `trigger5050Plan`；`price.js` 新增 `fetchCloseOn`（某日收盤價，沒開盤用前一交易日）、`priceUrl`／`fetchClose` 加選填 `endDate`。v5.5＝⑪ 改精靈「正二要買多少」：新增 `balance.js`（朋友計算機線上版 `calc()` 照抄移植，`tests/balance.test.js` 直接跑線上版原始碼比對）、`wizard.js` 新增 `betaHoldingsInput`／`readBetaHoldings`；舊 `exposure.js`（`exposureNow`、`betaPlan`）保留不刪、新頁不用。v5.4＝⑮ `avgcost.js`；`cost.js` 抽出 `breakEvenPrice`、`sellProceeds`（⑨⑮ 共用，tradeCost 行為不變）；`wizard.js` 新增 `lotsInput`／`readLots`（同一檔分次買進）與 `holdingsInput` 的 `side: 'lot'`。v5.3＝⑲ `retire.js`、⑦ `dcaPlan` 加停扣後再滾（`holdYears`／`holdReturn`）；⑲ 頁面讀網址 `?pool=` 接 ⑦ 帶過來的金額，不改 wizard。v5.1＝v5.1＝說明版面：桌面左計算機、右說明欄，手機說明在下方；步驟可帶 `about`＋`figure`；格子用 `withHelp` 掛說明（可附小圖）；共用圖放 `img/common/`。v5＝逐步精靈：新增 `js/ui/wizard.js`、`js/net/price.js`、`js/core/holdings.js`、`js/data/stocks.js`、`pledgePlan`；④ 改為精靈樣板；FinMind 抓價與 token 存瀏覽器；第 4 節樣板改為 `js/pages/pledge.js`。v2＝加入圖解流程、首頁四大分組、Gate 4；v3＝`components.js` 新增 `lineChart`、Gate 2 拆 2a／2b、Codex 只跑單元測試；v4＝PWA 定案（network-first、不做新版提示）、頁殼加 manifest／`pwa.js`、Gate 3 拆 3a／3b、① 文案放 `js/data/calcGuide.js`）。改介面要改這份並升版，所有還寫舊行為的段落一起改。
- 依據：[decision/決策-2026-11-08.md](decision/決策-2026-11-08.md)、[HANDOFF.md](HANDOFF.md)。

## 1. 技術約定

- 純靜態，**無建置步驟、無外部套件**。瀏覽器端用原生 ES modules（`<script type="module">`），Node 端 `package.json` 設 `"type": "module"`，同一份 `js/core` 兩邊共用。
- 所有連結用相對路徑（部署在 GitHub Pages 的 `/<repo>/` 底下也能用）。
- 手機優先：390px 寬不得水平捲動（冒煙測試會檢查）。
- 不用 `innerHTML` 組畫面，一律用 `js/ui/components.js` 的 `h()` 與元件（防 XSS、樣式一致）。
- 不用 localStorage 存計算輸入。**例外（v5，使用者 2026-11-08）**：FinMind token 存在使用者自己的瀏覽器（`js/net/price.js` 的 `getToken`／`setToken`，key `zr-toolbox.finmind-token`），只送給 FinMind；讀寫一律 try/catch。
- 抓股價只能經 `js/net/price.js` 的 `fetchClose`／`fetchCloseOn`（沒 token 先匿名查，每小時 300 次；錯誤照 `finmindAction`）；頁面與 core 不准自己 `fetch`。
- PWA：network-first（有網路永遠拿新版，離線用最後看過的版本），所以**不做新版提示**、不用維護快取版本號（使用者 2026-11-08 授權 Opus 定）。

## 2. 目錄與模組邊界

```
index.html                 首頁（捷徑＋卡片），內容由 js/pages/home.js 依 js/data/tools.js 產生
tools/<id>.html            每個工具一頁，只是殼：<main id="app"> ＋ 載入 ../js/pages/<id>.js ＋ manifest 連結與 ../js/pwa.js（照抄 tools/pledge.html；tests/pwa.test.js 會檢查）
css/app.css                全站唯一樣式檔
img/<id>/*.svg             各工具的圖解（sol 畫，Opus 驗數字）
docs/figures/<id>-<名>.md  每張圖給 sol 的繪圖提示（留存，改圖時改這份重畫）
js/core/*.js               純函式：不碰 DOM、不碰網路。所有公式只在這裡。
js/data/tools.js           分組 GROUPS＋卡片清單（id、編號、group、標題、一句話、href、gate、status、terms）
js/data/glossary.js        術語辭典資料（欄位見檔頭註解）
js/data/calcGuide.js       ① 原計算機逐欄教程＋FinMind token 教學文案（Opus 寫，頁面只排版）
js/pwa.js                  每頁載入，註冊 sw.js
sw.js、manifest.webmanifest、icon-192.png、icon-512.png   PWA（根目錄）
js/ui/components.js        共用 UI 元件（簽名見檔頭註解；Gate 0 定死，v3 加 lineChart）
js/ui/wizard.js            精靈元件（v5）：wizard、holdingsInput／readHoldings、betaHoldingsInput／readBetaHoldings（v5.5）、lotsInput／readLots、tokenBox、explain、numberInput（簽名見檔頭註解，外包不得改）
js/net/price.js            唯一連網模組（v5）：priceUrl、fetchClose、fetchCloseOn（v5.6）、fetchEvents（v5.7）（可注入 fetchFn 測試）、getToken／setToken
js/data/stocks.js          常見代號 → 名稱（只顯示用）
js/pages/<id>.js           各工具頁：組欄位 → 呼叫 core → 顯示結果。不寫公式。
tests/*.test.js            node:test 單元測試
scripts/smoke.mjs          冒煙測試（無頭 Chrome，逐頁按「帶入範例」）
```

依賴方向只能 `pages → ui, core, data`；`ui → data, core, net`；`net → core/finmind`；`core` 不依賴任何其他層。

## 3. 純函式介面（`js/core`，Gate 0 已實作＋測試）

| 檔案 | 函式 | 用在 | 來源 |
|---|---|---|---|
| format.js | `parseNum(text)`、`fmtMoney(n)`、`fmtPct(n, digits=1)`、`fmtX(n, digits=2)` | 全部 | 新 |
| trigger.js | `checkTrigger({basePrice, nowPrice, threshold=.5})` → `{change, hit, direction}`；`split5050({lever, cash})` → `{total, target, leverTrade, cashAfter}`；`trigger5050Plan({shares, nowPrice, basePrice, cash, threshold=.5})`（v5.6）→ `{value, total, change, hit, direction, upPrice, downPrice, target, tradeShares, tradeAmount, leverAfter, cashAfter, newBase, nextUp, nextDown, suspectSplit}`；買進捨去、賣出四捨五入 | ② | 新（research.js 的頁內邏輯抽出） |
| rebalance.js | `TEMPLATES`（7 個：5050、6040、532/442/433 股版、532/442 債版）；`dueDate(last, months)`；`rebalance({template, holdings[3], contribution, fee, months, last, asOf})` → `{total, targets, trades, due, ready, exposure}` | ③ | research-model 移植＋模板擴充 |
| rebalance.js（v5.8） | `WIZARD_TEMPLATES`、`guessBeta(code)`（L→2、R→−1、B→0、其他 1）、`rebalancePlan({rows[{code,shares,price,beta?,weight}], cash, cashWeight, contribution, unit, months?, last?, asOf?})` → 每檔 `tradeShares`（買捨去、賣四捨五入）、`cashAfter`、`exposureNow/Target/After`、`maxDrift`、`due/ready` | ③ 精靈 | Opus 新寫，簽名見檔內 JSDoc |
| pledge.js | `pledgeStress(p, decline)`（欄位見檔頭；`remedy: 'repay'|'collateral'`；Gate 2b 加回傳 `nowRatio`、`callDrop`）；`pledgeTable(p, declines)` | ④ | research-model `stress()` 移植 |
| decay.js | `simulateDaily(indexReturns, {leverage=2, dailyCost=0})` → `{indexPath, leveredPath, indexTotal, leveredTotal, naive, gap}`；`makeScenario('chop'|'trend', days, size)` | ⑥ | 新 |
| drawdown.js | `recoveryGain(d)`、`maxDrawdown(values)` → `{mdd, peakIndex, troughIndex}`、`yearsToRecover(d, r)` | ⑧ | 新 |
| exposure.js | `exposureNow({positions:[{value,beta}], cash, debt})` → `{assets, net, exposure, assetBasis, netBasis, leverageRatio}`；`betaPlan(p)` | ⑪（及 ① 教程對照） | betaPlan 為 research-model 移植 |
| holdings.js | `CODE_RE`、`normalizeCode(text)`、`holdingSummary(list)` → `{rows, cost, value, gain, gainPct}`（錯誤訊息標明第幾檔） | 所有精靈的持股步驟 | v5 新 |
| pledge.js（v5） | `pledgePlan({holdings, debt, rate, days, call, target, collateralQ, use})` → `{summary, rows, nowRatio, callDrop, interest, perStock[{code, callPrice, vsBuy}], useFactor, useLossAtCall}`；多檔擔保品視為同時同幅漲跌；`use`：'cash' 0 倍、'same' 1 倍、'lever' 2 倍（粗估） | ④ 精靈 | v5 新，內部呼叫 `pledgeTable` |
| cost.js | `FEE_RATE`、`TAX_RATE`、`TAX_UNTIL`、`guessKind(code)`、`defaultMinFee(shares)`、`taxRate(kind, dayTrade)`、`tickSize(price, kind)`、`roundUpToTick`、`brokerFee(amount, {discount, minFee})`、`sellProceeds(price, shares, rate, {discount, minFee})`、`breakEvenPrice(cost, shares, kind, rate, {discount, minFee})` → `{breakEven, breakEvenTick}`（v5.4）、`tradeCost({kind, dayTrade, shares, buyPrice, sellPrice, discount, minFee})` → `{buyAmount, buyFee, buyTotal, rate, sell{amount, fee, tax, net}, totalCost, profit, profitPct, breakEven, breakEvenTick, feeRate}`；手續費、證交稅元以下捨去；discount 小數（2.8 折＝0.28） | ⑨（之後 ⑩⑮⑤ 共用費用） | v5 新 |
| dca.js（v5.3） | `monthlyRate(annual)`、`cagr(start, end, years)`、`dcaPlan({initial, monthly, years, annualReturn, timing, stepUp, discount, minFee, holdYears, holdReturn})` → `{monthlyRate, months, principal, contributed, fees, finalValue, gain, gainPct, lumpValue, lumpFee, lumpGain, naiveCagr, heldValue, totalYears, rows}` | ⑦ | v5 新；holdYears 為 v5.3 |
| retire.js（v5.3） | `annuityFactor(i, g, n, timing)`、`retirePlan({pool, years, annualReturn, inflation, residual, timing, otherIncome, targetSpend})` → `{monthlyRate, monthlyGrowth, months, pvResidual, available, factor, firstWithdraw, lastWithdraw, firstTotal, lastTotal, lastOtherReal, totalWithdrawn, withdrawRate, rule4Monthly, needWithdraw, needPool, gap, endBalance, rows}`；成長型年金（每月照通膨調高），i＝g 時 A＝N÷(1＋i)（改正 todo2 的 ÷N） | ⑲ | todo2 PRD 4.7 移植 |
| avgcost.js（v5.4） | `lotMinFee(shares, {minFeeBoard, minFeeOdd})`、`buyLot(shares, price, opt)`、`avgCostPlan({kind, lots:[{shares, price}], nowPrice, discount, minFeeBoard, minFeeOdd, add:{price, shares?}, targetAvg})` → `{rate, feeRate, before, addLot, after, target}`；Summary＝`{lots, shares, amount, fees, totalCost, avgNoFee, avgWithFee, breakEven, breakEvenTick, sell, gain, gainPct, needRise}`；手續費逐筆算、整股／零股各自低消；target 到不了回 `{ok:false, message}` | ⑮ | R2-11 |
| balance.js（v5.5） | `checkBalanceRows(list, kind)` → `{value, exposure}`；`balanceSnap(stocks, cash, debt, bexp)`；`balancePlan({stocks, levers, cash, debt, target, minCash, basis, allowBorrow, fullRebalance})` → `{fullMode, label, S, D, L, LB, bw, bwDefaulted, base, targetExposure, X, delta, available, canBuy, shortage, borrow, cashAfter, debtAfter, before, after, rows, achieved, enough, reached, capped, borrowCantReach, notes}`；算法照抄朋友線上版（含 X<0 設 0、現金不足不自動借、總資產口徑借款分支）；weight 為百分比數字（例外於單位規約，照原頁） | ⑪ | 朋友計算機線上版 calc() |
| lifelev.js（v5.10） | `DEBT_KINDS`、`loanPayment(balance, rate, years)`（本息均攤）、`lifeLeveragePlan({holdings[{code,shares,price,beta?}], cash, realEstate?, otherAssets?, debts[{kind,balance,monthly?,rate?,years?,invest?}], monthlyExpense, monthlyIncome?, stressDrop?})` → `{financialNet, marketLeverage, bookLeverage, totalLeverage, monthlyFree, cashMonths, lifeMultiple, withdrawRate, zeroDrop, financialNetAfter, marketLeverageAfter, …}`；口徑照 HAMR 人生槓桿，不採作者建議倍數 | ⑬ | R2-08／O-04 |
| kelly.js（v5.10） | `leveredGrowth(a, L)` → `{growth, cagr, halveProb}`、`kellyPlan({cagr1x, vol, borrowRate, cashRate?, current?})` → `{mu, full, half, quarter, maxCagr, breakEven, rows, curve}`；每日固定倍數的 GBM，借錢段付 borrowRate、現金段領 cashRate | ⑭ | Opus 新寫（R1 T04／T19 同類） |
| finmind.js | `finmindAction({status, usedToken, retried})` → `{action, message}` | 日後抓股價的工具（v1 工具箱不抓 FinMind） | 新 |

**單位規約**：core 一律用小數，不用百分比數字——比例、跌幅、利率、維持率都是小數（利率 3%＝`0.03`、追繳線 130%＝`1.3`、跌 30%＝`0.3`、權重 40%＝`0.4`）；金額為新台幣元；`days` 為日曆天整數。頁面欄位讓使用者輸入百分比數字（例 130），**頁面自己除以 100** 再傳進 core，顯示時用 `fmtPct`。

純函式丟出的 `Error.message` 是給使用者看的中文，頁面直接顯示，不另外改寫。

**FinMind 回應規則**（`finmindAction`，決策 D5 的落實版）：200 正常；402 顯示「申請免費會員 token（每小時 600 次）」教學；**403 一律停止**（可能是 IP 被封 30 分鐘，清 token 或重試只會更糟）；400／401 且有帶 token 且還沒重試 → 不帶 token 重試一次，**重試回 200 才清掉 token**（400 也可能是參數錯，不能直接判定 token 壞）；其他一律停止並請使用者手動輸入股價。

## 4. 工具頁樣板（v5：精靈，照抄 `js/pages/pledge.js`；單筆交易型照抄 `js/pages/cost.js`）

每頁由上到下：

1. `toolHeader(tool)`
2. `wizard({ steps, result, example })`：
   - 輸入步驟每步一個主題（例 ④：持股 → 借款 → 契約規則），每步 `hint` 一句「去哪裡找這個數字」；欄位用 `numberInput`／`selectField`，`plain` 寫白話與例子，有術語給 `termId`。
   - 有持股的工具第 1 步用 `holdingsInput`＋`tokenBox`，`read` 裡呼叫 `holdingSummary` 檢查。
   - `read` 把百分比照使用者輸入存（例 130），`result` 裡才除以 100 傳進 core。
   - `result` 用一串 `explain({label, value, tone, how, means, todo})`：**每個數字都要有「怎麼來的」（帶入使用者自己的數字寫出算式）與「代表什麼」**，有行動就寫「要做什麼」；表格放最後。
   - `example`：完整 state，數字和圖解一致；第 1 步的「帶入範例」直接跳到結果（冒煙測試靠它）。
   - **說明（v5.1，使用者 2026-11-09）**：每步給 `about`（一句這步在做什麼）＋`figure`（sol 畫的步驟圖，**必做**）；桌面放右欄、手機放步驟內。格子給 `help: { text, img? }`（`numberInput` 直接帶；其他 `.field` 用 `withHelp`）：桌面點進格子或按「說明」顯示在右欄，手機按「說明」在格子下方展開。**格子小圖只給新手會卡的格子**（例：成本均價、認列成數）。figure 不另寫 caption 重複圖裡的字。
   - 持股四格（代號、股數、買入價、現價）的說明內建在 `holdingsInput`，共用圖在 `img/common/`。
3. 「怎麼讀」卡：至少一張圖解＋2–3 段白話（同 v4）。
4. `disclaimer(...)` 放最後。

舊的單一表單頁（②③⑥⑧⑪）在改成精靈之前照舊運作；改的時候公式不動，只換輸入流程。

## 5. 圖解（使用者 2026-11-08：每個工具都要圖文解說，圖交給 sol 畫）

- 每個工具頁（含辭典）至少一張圖解，放 `img/<工具id>/`；多個工具共用的圖（持股步驟、成本均價）放 `img/common/`；冒煙測試檢查圖存在且載入成功。
- **卡通圖文解說（v5.2，使用者 2026-11-09）**：每個工具挑 1–3 張做卡通圖（四格漫畫放「怎麼讀」、步驟插圖放精靈步驟），由使用者用訂閱 sol 生圖（Codex 面板或 ChatGPT）。提示放 `docs/figures/cartoon/<id>-NN-名稱.md`，每張先貼共用的 `00-風格與角色.md`（角色小安／老師、畫風、禁止真實券商名稱）。原圖 PNG 存 `docs/figures/cartoon/out/`（gitignore），Opus **逐字核對圖上數字**後用 PIL 轉 800px 寬 WebP（quality 78，約 100–160KB）放 `img/<id>/`。精確對位的小圖（刻度、算式）仍用 SVG。
- 精靈工具（v5.1）：每個輸入步驟一張步驟圖＋新手會卡的格子小圖；提示檔 `docs/figures/<id>-step<N>-*.md`、`<id>-help-*.md`，批次檔 `docs/figures/batch-*.json`（範例 `batch-v5-pledge.json`）。
- 流程：寫繪圖提示 `docs/figures/<id>-<名>.md`（照抄 `trigger5050-split-5050.md` 的格式：要表達的事＋**寫死的數字**＋技術規格）→ 免費 sol 一次問答出 SVG（`ask-file.mts --sol --effort high`，可用 `batch` 一次多張）→ 存檔 → 無頭 Chrome 淺色／深色各截一張 → **Opus 對照 core 函式核對圖上每個數字**，錯就改提示重畫，最多 2 輪。
- 圖上的數字必須和該頁「帶入範例」或 core 測試裡的數字一致，不准另編。
- SVG 規格：`viewBox="0 0 360 H"`、不設 width/height、有 `<title>`／`<desc>`、顏色寫在內部 `<style>` 並含 `prefers-color-scheme: dark`、背景透明、最小字 12；禁止 script、foreignObject、外部資源、filter、動畫。色票見提示範本。

## 6. 測試與驗收

- 單元測試：`npm test`。預期值由 Opus 定，外包**不得改預期值或刪測試**；覺得預期值錯就停下回報。
- 冒煙測試：`npm run smoke`（首頁卡片數、每個 ready 頁：無 JS 例外、範例按鈕有結果、免責區在最後、無水平捲動）。
- **Gate 0 的 PROOF_CMD**：`npm test && npm run smoke`
  預期：`tests 44`、`pass 43`、`fail 0`、`todo 1`（辭典必備詞，Gate 1 解除）；`smoke pages 2 pass 2 fail 0`。

## 7. Gate 規劃（⚠ 2026-11-08 晚使用者修正方向：改成逐步引導輸入，Gate 4 以後待重排，見 HANDOFF.md 開頭「方向修正」）

| Gate | 內容 | 執行 | PROOF_CMD 預期 |
|---|---|---|---|
| 0 | 本文件、core 全部純函式＋40 項測試、UI 元件（含 `figure`）、分組首頁、樣板工具 ②（含第一張 sol 圖解）、冒煙測試 | Opus | 見上 |
| 1 | ⑫ 辭典（18 個必備詞，見 `tests/registry.test.js` 的 `REQUIRED`；頁面可依 `#id` 定位、上方有關鍵字篩選）＋ ③ 定期配比再平衡（股版／債版分組選模板，註明同名不同配置；不收「預期年化 x 倍大盤」） | 訂閱 Codex sol（面板＋md） | `npm test`：fail 0、todo 0；smoke：pages 4 全過 |
| 2a | ⑥ 複利偏離（用 `lineChart`）、⑧ 回撤 | 訂閱 Codex sol | tests 46 全過；smoke pages 6 全過 |
| 2b | ④ 質押壓測（還款／補擔保兩種分開顯示、130% 寫「多數券商契約，以契約為準」、結果附 `executable` 免責）、⑪ 曝險倍數 | 訂閱 Codex sol | tests 48 全過；smoke：pages 8 全過 |
| 3a | ① 原計算機教程（依**線上版**欄位，文案 `calcGuide.js`）＋FinMind token 申請教學（同頁 `#token`） | 訂閱 Codex sol | tests 51 全過；smoke pages 9 全過 |
| 3b | PWA（Opus 已做：manifest、network-first sw、圖示）、部署（新 repo、Pages、公開前檢查） | Opus | smoke 全過＋手機實機看一次 |
| 4 | 其他股票計算機：⑤ 融資維持率、⑦ 定期定額／年化報酬、⑨ 交易成本、⑩ 股息殖利率與除權息（開工前 Opus 先定 core 簽名與測試預期值） | 訂閱 Codex sol | smoke 全過 |
| 5 | 計算機加做（使用者 2026-11-08 選）：⑬ 人生槓桿體檢（房貸、生活預備金、質押一起算，分開「市場曝險」與「總資產槓桿」，參考 HAMR T03）、⑭ 幾倍槓桿最划算（全／半／四分之一凱利，倍數對長期報酬曲線，參考 HAMR T04、testfolio T19；標明對假設極敏感） | 訂閱 Codex sol | 開工前 Opus 定 core 與測試 |
| 6 | 科普圖文頁（「正二教學」組，可從頭讀到尾、每頁有圖）：正二是什麼、股版與債版、常見迷思澄清（含 PDF 錯誤更正）、**大仁 50/50 對比 0050**（只顯示原作者結果並註明出處與限制，不自己回測，使用者 2026-11-08 定） | 訂閱 Codex sol（文案 Opus 寫進 data 檔） | 開工前 Opus 寫文案 |
| 7 | 帶指導版正二平衡計算器（使用者 2026-11-08 推翻第 8 節）：欄位與算法跟線上版相同（多檔持股、最多 3 檔正二、目標比重完整重配、正二設 0 的行為都照抄），每欄白話副標＋ⓘ＋第一次用逐步導覽；原頁不動 | Opus 定 core（移植線上版 calc() 並寫對照測試）＋Codex 做頁面 | 新舊同輸入比對測試 |

執行者使用者 2026-11-08 指定為訂閱 Codex sol（面板不能用時改 Sonnet），派工流程見 HANDOFF.md。每個 Gate 的圖解由 Opus 派免費 sol 畫、Opus 驗；寫頁面的外包只負責用 `figure()` 放進去。

圖表：`lineChart` 已於 v3 由 Opus 實作（簽名見 `components.js` 檔頭），外包只呼叫、不改。

**Codex 面板限制**：沙箱裡 PowerShell 擋 `npm.ps1`、無頭 Chrome 開不起來。任務書的 PROOF_CMD 給 Codex 的只有 `npm.cmd test`；`npm run smoke` 由 Opus 驗收時跑。

## 8. 工具 ①（b）白話版計算機：已定（2026-11-08）→ **已被 Gate 7 推翻**（使用者 2026-11-08 晚：原頁沒有指導、① 只是另一頁，朋友用起來還是沒指導）。下面是當初的理由，留作紀錄；Gate 7 照抄線上版行為就不會出現「兩個計算機答案不同」的問題。

使用者回覆：工具箱是四大類多個計算機（正二教學、正二變種、正二槓桿、其他股票計算機例如融資），全部都要圖文解說。據此定案：**不另做同公式的白話版計算機，由工具 ⑪ 擔任白話版；① 做逐欄圖文教程。** 理由：

- 線上版和 `betaPlan` 公式相同，但行為有三處不同：多檔持股／多檔正二、「目標比重」觸發的完整重配模式、普通持股曝險已超過目標時線上版默默把正二設 0（`betaPlan` 回報「達不到」）。再做一個「同公式」版本，朋友會看到兩個計算機給出不同答案，反而更難懂。
- ⑪ 已經是白話版：先回答「我現在等於幾倍大盤」（`exposureNow`），再回答「想調到 X 倍要買賣多少」（`betaPlan`，單一普通持股合計＋單一正二）。① 教程每欄附「在 ⑪ 對應哪一格」，並寫明上面三處差異，最後單向連到線上原頁。
- token 402 教學放在 ① 的「FinMind token」欄位說明裡，與 Gate 3 的 token 教學頁共用同一份文案。
