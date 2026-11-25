# 頁面任務：⑦ 定期定額 → 定期定額與持續投入（兩段投入、三情境、複利科普）

- 版本：2026-11-25 v1。回報寫到 `collab/from-codex-dca2.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`（不要 `npm`，PowerShell 擋 npm.ps1）。不要上網。
- **只准新增**：`img/dca/decades.svg`、`collab/from-codex-dca2.md`。
- **只准修改**：`js/pages/dca.js`、`tools/dca.html`（只改 `<title>`）、`js/pages/retire.js`（只改第 19 行字串裡的「定期定額與年化報酬」→「定期定額與持續投入」）、`css/app.css`（只在檔尾加本頁需要的 class）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。
- **不准改**：`js/core/`（`dca.js` 的公式與預期值 Opus 定案，覺得有錯就停下寫進回報）、`js/ui/`、`js/data/`、`tests/`、`scripts/`、其他頁面。暫存檔放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/core/dca.js`（全檔；檔尾 v5.12 的 `accumulatePlan`、`scenarioPlans`、`SCENARIOS`、`growthByDecade`、`dcaPricePath`、`sellAtBottom`、`LESSON_PRICES` 的 JSDoc 就是輸入輸出規格）
- `js/pages/dca.js`（全檔，要改的頁）
- `js/pages/recover.js`（只看「選了某個選項才多一格」怎麼做：`vol`＝`custom` 時多出 `sigmaCustom`；照同樣做法）
- `js/ui/wizard.js` 第 1–40 行、`js/ui/components.js` 第 1–25 行（介面註解，含 `pathNav`）
- `js/core/format.js`（`parseNum`、`fmtPct`、`fmtMoney`）

## 1. 殼

`tools/dca.html` 的 title 改成 `定期定額與持續投入｜正2工具箱與股市學堂`。

## 2. 頁面順序（`js/pages/dca.js`，用 `h()`，不准 innerHTML）

`toolHeader(tool)` → 原本的 joy 圖 → **新的科普卡（第 3 節）** → `wizard({ steps, result, example })` → 原本的「怎麼讀」卡（不動）→ `pathNav('dca')` → `disclaimer('general')`。

## 3. 科普卡「為什麼要持續投入？複利神奇在哪」

`section.card`，`h2` 用上面的標題。開頭 `p.note`：「以下數字都是用固定報酬假設算的情境（每月 5,000 元、年報酬 6%），不是預測；真實市場有漲有跌，也可能虧損。」

**所有數字都在頁面載入時呼叫 core 算出來，不准手打數字。**金額寫「約 X 萬」時用 `(x / 10000).toFixed(1)`。

1. `h3`「複利後段加速」：`const g = growthByDecade(5000, 0.06, 3)`。
   - `figure({ src: '../img/dca/decades.svg', alt: …, caption: '每 10 年都放 60 萬，後面賺得越來越多。' })`
   - `table.trade-table`，欄「期間」「這 10 年投入」「這 10 年賺到」「期末資產」；列 `第 ${from+1}–${to} 年`，數字用 `fmtMoney`。
   - `p`：「每 10 年都放 60 萬，第 21–30 年賺的（約 ${g[2]萬} 萬）是第 1–10 年（約 ${g[0]萬} 萬）的 ${(g[2].earned / g[0].earned).toFixed(1)} 倍：前面賺到的錢也一起在滾，時間越後面滾得越快。」
2. `h3`「早 10 年 vs 晚 10 年」：
   - `early = accumulatePlan({ horizon: 40, stages: [{ start: 0, stop: 10, monthly: 5000, annualReturn: 0.06 }] })`
   - `late = accumulatePlan({ horizon: 40, stages: [{ start: 10, stop: 40, monthly: 5000, annualReturn: 0.06 }] })`
   - `p`：「小早現在開始，每月 5,000 元只扣 10 年就停（投入 ${early.contributed 萬} 萬），之後放著不動。小晚 10 年後才開始，每月 5,000 元連扣 30 年（投入 ${late.contributed 萬} 萬）。到第 40 年：小早約 ${early.finalValue 萬} 萬、小晚約 ${late.finalValue 萬} 萬。小晚多放了 ${(late.contributed − early.contributed) 萬} 萬本金，最後只多約 ${(late.finalValue − early.finalValue) 萬} 萬。」
   - `p`：「早開始的優勢是『時間』，不是金額。」
3. `h3`「定期定額不用猜高低點」：`const d = dcaPricePath(LESSON_PRICES, 5000)`。
   - `p`：「假設每月固定買 5,000 元，價格 12 個月內從 100 跌到 60，再漲回 100（價格：${LESSON_PRICES.join('、')}）。便宜的時候同樣的錢買到比較多股，所以平均成本 ${d.avgCost.toFixed(2)} 元，比這 12 個月的平均價格 ${d.avgPrice.toFixed(2)} 元還低。價格回到 100 時，投入的 ${fmtMoney(d.put)} 變成 ${fmtMoney(d.value)}。」
4. `h3`「停扣、賣在低點的代價」：`const b = sellAtBottom(LESSON_PRICES, 5000, 4)`。
   - `p`：「同一段行情，如果第 5 個月跌到 ${b.sold.price} 元時嚇到全部賣掉、之後不再扣：投入 ${fmtMoney(b.sold.put)}，拿回 ${fmtMoney(b.sold.got)}，虧 ${fmtMoney(−b.sold.gain)}，之後漲回來都跟你無關。繼續扣到第 12 個月的人：投入 ${fmtMoney(b.keep.put)}，變成 ${fmtMoney(b.keep.value)}。」
   - `p.note`：「真實行情不一定會漲回來，也可能跌得更久；這裡只說明：在低點賣掉，會把帳面虧損變成真的虧損。」

`img/dca/decades.svg`（你手寫）：三條橫條由上到下「第 1–10 年 賺約 21.6 萬」「第 11–20 年 賺約 86.2 萬」「第 21–30 年 賺約 201.8 萬」，條長照比例；最下面一行小字「每 10 年都投入 60 萬（每月 5,000 元、年報酬 6% 假設）」。規格：`viewBox="0 0 360 H"`、不設 width/height、有 `<title>`／`<desc>`、顏色寫在內部 `<style>` 並含 `@media (prefers-color-scheme: dark)`、背景透明、最小字 12；禁止 script、foreignObject、外部資源、filter、動畫。alt 要把圖上的字和數字都寫進去。

## 4. 精靈改動

狀態 `s` 存百分比原數字，送 core 前除以 100。寫一個 `params(s)`，轉成 `accumulatePlan` 的參數：

```js
{ initial: s.initial, initialReturn: s.ret / 100, horizon: s.years + s.holdYears, timing: s.timing,
  discount: s.discount / 10, minFee: s.minFee, inflation: s.inflation / 100,
  stages: [
    { start: 0, stop: s.years, monthly: s.monthly, annualReturn: s.ret / 100, holdReturn: hr, stepUp: s.stepUp / 100 },
    // s.stage2 === 'yes' 時才加：
    { start: s.s2start, stop: s.s2stop, monthly: s.s2monthly, annualReturn: s.ret / 100, holdReturn: hr }
  ] }
// hr＝停扣後年報酬有填就用它，沒填＝s.ret；都要 ÷ 100
```

- 第 1 步「要扣哪一檔」：不動。
- 第 2 步「每月扣多少」：在「每年調升」後面加：
  - `selectField` id `stage2`，label「之後要再加碼嗎」：`no`「不用」、`yes`「要，之後每月再多扣一筆」，預設 `no`。help：「例如 10 年後加薪了，每月再多扣 5,000 元。」「這筆加碼不跟著每年調升，跟原本那筆用同一個報酬率。」
  - 選 `yes` 才多三格：`s2start`「從第幾年開始加」suffix「年」plain「從現在算，例：10」；`s2stop`「加到第幾年停」suffix「年」plain「例：20，要比開始晚」；`s2monthly`「每月再加多少」suffix「元」plain「例：5000」。
  - 第 2 步 `read` 只檢查 `s2monthly > 0`、`s2start`／`s2stop` 是整數且 `s2start ≥ 0`、`s2stop > s2start`（年數上限在第 3 步交給 core 檢查）。
- 第 3 步「假設報酬與年數」：
  - 最上面加 `age`「現在幾歲（選填）」suffix「歲」plain「填了，結果會用年齡顯示」。
  - 「投資幾年」label 改成「第一筆扣幾年」，plain「填整數，例：20」。
  - 「停扣後再放幾年」plain 改成「例：45 歲停扣、65 歲退休就填 20；不放填 0。也是算到哪一年為止」。
  - 最後加 `inflation`「通膨（選填）」suffix「%」預設 2，plain「把結果換成今天的購買力；不算填 0」。
  - `read` 最後呼叫一次 `accumulatePlan(params(s))`，讓「第 2 段停扣不能超過總年數」這類錯誤在這一步就顯示。

`example` 改成：
```js
{ have: 'no', holdings: [{ code: '0050', nowPrice: 50 }], initial: 0, monthly: 5000, stepUp: 0, stage2: 'yes', s2start: 10, s2stop: 20,
  s2monthly: 5000, discount: 10, minFee: 1, age: 30, years: 20, ret: 6, timing: 'start', holdYears: 10, holdRet: 4, inflation: 2 }
```

## 5. 結果（`result(s)`，依序）

`const p = params(s), sc = scenarioPlans(p), r = sc[1].plan`（中性），`H = p.horizon`；`yearLabel(y)`＝有填 age 時 `第 ${y} 年（${age + y} 歲）`，沒填時 `第 ${y} 年`。

1. `explain` label `${yearLabel(H)}的資產`，value `fmtMoney(r.finalValue)`。how 列各池：有 initial 時「目前持股 ${fmtMoney(r.initialValue)}」、「第一筆（扣 ${s.years} 年）${fmtMoney(r.stageValues[0])}」、有第 2 段時「加碼那筆（第 ${s2start}–${s2stop} 年）${fmtMoney(r.stageValues[1])}」，用「＋」連起來。means：沿用原本的「用固定報酬算的情境，不是預測…」；有停扣後年數時加「停扣後用年報酬 ${hr}% 滾到第 ${H} 年。」
2. `inflation > 0` 時 `explain` label「換成今天的購買力」，value `fmtMoney(r.realFinal)`，how「${fmtMoney(r.finalValue)} ÷ (1＋${inflation}%)^${H}」，means「${H} 年後的錢，大約只買得到今天這麼多東西。」
3. 投入本金、手續費合計、累積賺到：沿用原本三張卡，數字改用 `r.principal`、`r.fees`、`r.gain`；手續費的 how 改成「每次扣款 × 0.1425%（× 折扣），元以下捨去、最低 ${minFee} 元，共扣 ${扣款次數} 次。」，扣款次數＝各段 (stop − start) × 12 相加。累積賺到的 means 改「占你總共付出的 ${fmtPct(r.gain / (r.principal + r.fees), 2)}。」
4. `h3`「三種情境（報酬率一起 −2／不變／＋2 個百分點）」，`table.trade-table`，欄「情境」「投入期年報酬」「停扣後年報酬」「${yearLabel(H)}資產」「今天的購買力」「累積賺到」；三列照 `sc` 順序，報酬率用 `fmtPct(ret/100 + x.shift, 1)`，金額 `fmtMoney`。表下 `p.note`：「報酬率只差 2 個百分點，幾十年後的結果就差很多；哪個情境都不是預測。」
5. **只有沒加碼（`stage2 === 'no'`）時**才顯示原本的「如果一開始一次投入」「年化報酬別算錯」兩張卡（照舊用 `dcaPlan` 算；兩段時這兩張不成立，不顯示）。
6. 「每月約可買」：照舊。
7. 退休連結：`retire.html?pool=${Math.round(r.finalValue)}`（改用中性情境的最終資產）。
8. `h3`「逐年變化」，表格欄改成「年」（有 age 時寫「年（歲）」）、「累計投入（元）」「累計手續費（元）」「年底資產（元）」「今天的購買力（元）」，資料用 `r.rows`（`principal`、`fees`、`value`、`real`）。
9. 原本的 `div.note` 四段照舊，最後加一段：「加碼那筆和第一筆是分開算的：各自扣款、各自停扣，最後加總。」

**不准出現的字句**：「保證」「一定會漲回」「穩賺」「現在是低點」「回測」。

## 6. CSS

表格在 390px 寬不得讓頁面水平捲動（可以外包一層可橫向捲動的容器）；小字不准用 `--accent` 當文字色。沒需要就不加。

## 7. PROOF_CMD

```
node scripts/gen-precache.mjs && npm.cmd test
```

預期：`tests 196`、`pass 196`、`fail 0`。smoke 由 Opus 跑（預期 pages 28 全過），不要跑 `npm.cmd run smoke`（面板裡會卡住）。

Opus 會核對的數字：

- 科普卡：每 10 年賺 216,321／861,907／2,018,053（期末 816,321／2,278,229／4,896,282），9.3 倍；小早 60 萬 → 約 468.9 萬、小晚 180 萬 → 約 489.6 萬，多放 120 萬只多約 20.8 萬；平均成本 80.47、平均價格 83.33、60,000 → 74,563；賣在低點投入 25,000 拿回 19,369、虧 5,631。
- 範例結果頁：第 30 年（60 歲）資產 4,580,690（第一筆 3,372,335＋加碼 1,208,355）；今天的購買力 2,528,866；投入本金 1,800,000；手續費 2,520（共扣 360 次）；累積賺到 2,778,170；三情境資產 3,121,900／4,580,690／6,750,987、購買力 1,723,510／2,528,866／3,727,024、賺到 1,319,380／2,778,170／4,948,467；不顯示一次投入與年化兩張卡；每月約可買 100 股；退休連結 `pool=4580690`；逐年表第 20 年資產 3,094,550。

## 8. 回報（`collab/from-codex-dca2.md`，欄位固定，不貼程式碼）

完成項（對照第 1–6 節）／新增修改檔案清單／PROOF_CMD 的 tests、pass、fail／科普卡與範例結果頁的實際數字（照第 7 節順序列）／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
