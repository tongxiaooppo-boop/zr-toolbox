# 頁面任務：㉕ 正2 虧了，要漲多少才回本（精靈）

- 版本：2026-11-25 v1。回報寫到 `collab/from-codex-recover.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`（不要 `npm`，PowerShell 擋 npm.ps1）。不要上網。
- **只准新增**：`tools/recover.html`、`js/pages/recover.js`、`img/recover/need.svg`、`collab/from-codex-recover.md`。
- **只准修改**：`js/data/tools.js`（只把 `recover` 那筆的 status 從 `'planned'` 改成 `'ready'`，其他不動）、`css/app.css`（只在檔尾加本頁需要的 class）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。
- **不准改**：`js/core/`（尤其 `recover.js`：公式與預期值 Opus 定案，覺得有錯就停下寫進回報）、`js/ui/`、`tests/`、`scripts/`、其他頁面。暫存檔放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/core/recover.js`（全檔，約 130 行；`recoverPlan` 的 JSDoc 是輸入輸出規格）
- `js/pages/drawdown.js`（精靈頁樣板，照它的結構寫：`steps`、`read`、`result`、`example`、`explain`、`numberInput`、`selectField`、`withHelp`）
- `js/ui/wizard.js` 第 1–40 行、`js/ui/components.js` 第 1–20 行（介面註解）
- `js/core/format.js`（`parseNum`、`fmtPct`、`fmtMoney`）
- `tools/drawdown.html`（殼，照抄）

## 1. 殼

`tools/recover.html`：照抄 `tools/drawdown.html`，title `正2 虧了，要漲多少才回本｜正2工具箱與股市學堂`，script 改 `../js/pages/recover.js`。

## 2. 精靈（`js/pages/recover.js`，用 `h()`，不准 innerHTML）

頁面由上到下：`toolHeader(tool)` → `wizard({ steps, result, example })` → 「怎麼讀」卡（第 4 節）→ `pathNav('recover')` → `references([...])`（第 6 節）→ `disclaimer('general')`。

精靈狀態 `s` 存百分比原數字（例 `s.loss = 40`），送進 core 前除以 100。寫一個 `params(s)` 轉成 `recoverPlan` 的參數：留白欄位 `parseNum` 會得到 `NaN`，直接傳，core 會當成沒填。`sigma` 由 `s.vol` 決定：`calm`／`normal`／`wild` 用 `VOL_PRESETS` 的 sigma，`custom` 用 `s.sigmaCustom / 100`。

1. **你虧多少**：`selectField` id `mode`，termId `recovery-gain`：`price`「填成本和現價」、`pct`「直接填虧幾 %」。
   - `price`：`numberInput` cost「買入成本（均價）」plain「券商 App 庫存的成本均價」suffix「元」；now「現價」suffix「元」；shares「股數（選填）」plain「填了才換算金額，1 張＝1000 股」。
   - `pct`：loss「正2 現在虧幾 %」suffix「%」plain「例：40」。
   - 照 drawdown 的做法：選 mode 放第 1 步、數字放第 2 步也可以；兩種做法擇一，總步數 4–5 步都可以。
   - `read`：讀值後呼叫一次 `recoverPlan(params(s))`，讓錯誤訊息在這一步就顯示。
2. **之後的行情（假設）**：
   - `selectField` id `vol`，termId `volatility-decay`，label「大盤之後震得多大」：選項文字用 `${p.label}（每年波動約 ${p.sigma*100}%）`，由 `VOL_PRESETS` 產生，再加 `custom`「自己填」；預設 `normal`。選 `custom` 時多一格 `sigmaCustom`「每年波動」suffix「%」。help 文字：「臺灣50 指數平常一年的波動大約 15%–25%，股災時會更大。」「波動越大，正2 被耗損吃掉越多。」
   - years「想看幾年」suffix「年」plain「例：2」；fee「每年內扣費用」suffix「%」預設 `DEFAULT_FEE * 100`（1.1），plain「00631L 經理費 1.00%＋保管費 0.04%；不含期貨轉倉成本」。
3. **比較攤平與機率（選填）**：
   - target「攤平後只要再漲幾 %」suffix「%」plain「留白就不算攤平；要比現在要漲的少」。
   - mu「假設大盤每年平均報酬」suffix「%」plain「留白就不算機率；例：8，這只是假設」。

`example`：`{ mode: 'price', cost: 40, now: 24, shares: 1000, vol: 'normal', years: 2, fee: 1.1, target: 30, mu: 8 }`。

## 3. 結果（`result(s)`，`const r = recoverPlan(params(s))`，依序）

數字一律用 `fmtPct(x, 1)`；大盤的數字前面加「約」。

1. `explain`：label「正2 自己要漲」，value `fmtPct(r.zrGain)`，tone `'warn'`。
   - how：`1 ÷ (1 − ${fmtPct(r.loss)}) − 1`。
   - means：price 模式「要從 ${now} 元漲回 ${cost} 元。」；有 `r.lossAmount` 再加「現在帳面虧 ${fmtMoney(r.lossAmount)}。」
2. `explain`：label「大盤（臺灣50）要漲多少」，value `約 ${fmtPct(r.index.full)}`，tone `'info'`。
   - how：「波動 ${sigma%}、${years} 年、每年內扣 ${fee%}：√(1＋正2 要漲) × e^((波動²＋費用) × 年數 ÷ 2) − 1。」
   - 下面接 `table.trade-table`，兩欄「算法」「大盤要漲」，四列：
     - 「直覺：除以 2」→ `r.index.naive`
     - 「最好情況：每天穩穩上漲」→ `r.index.best`
     - 「加上震盪耗損」→ `r.index.vol`
     - 「再加內扣費用」→ `r.index.full`
   - means：「大盤每天穩穩上漲時，複利幫忙，要漲的比『除以 2』還少；震得越大、拖得越久，要漲的越多。」
3. 卡片標題（`h3`）「三條路並排（只是算術，不是建議）」，`table.trade-table`，欄：「做法」「大盤要漲」「要再拿出的錢」「大盤再跌 20%，再虧原投入的」。列：
   - 不動：`約 ${best}～${full}`（`r.stay.indexBest`～`r.stay.indexFull`）｜「0」｜`fmtPct(r.stay.shockLoss)`
   - 攤平（只有 `r.avg` 時）：`約 ${avg.indexBest}～${avg.indexFull}`｜`原投入的 ${fmtPct(avg.addPct)}`，有 `avg.addShares` 再接 `（約 ${addShares} 股、${fmtMoney(addMoney)}，新成本 ${newCost} 元）`｜`fmtPct(avg.shockLoss)`
   - 換成 0050：`約 ${fmtPct(r.swap.indexNeed)}`｜「0（賣正2 的錢全買 0050）」｜`fmtPct(r.swap.shockLoss)`
   - 有 `r.invested` 時，最後一欄再接金額：`（${fmtMoney(r.invested * shockLoss)}）`。
   - 表下 `p.note`：「攤平：要漲的變少，但放進去的錢變多，大盤再跌時虧得更多。換成 0050：沒有槓桿耗損，但大盤要漲更多才回到原本成本，而且賣出時虧損就確定了。再跌 20% 是用每天穩穩下跌估的，震盪時正2 會虧更多。」
4. 只有 `r.prob` 時：`h3`「假設大盤每年平均 ${mu}%：幾年內『曾經回到成本』的機率」，`table.trade-table`，欄「做法」＋`r.prob.years` 每個一欄（`${y} 年內`），列「不動」「攤平」（`r.prob.avg` 不為 null 才有）「換成 0050」，數字 `fmtPct(x, 0)`。表下 `p.note`：「這是在你填的平均報酬與波動下算出的機率，換個假設答案會差很多；不代表你一定能回本。不顯示『平均幾年回本』，因為波動讓有人很快回本、有人一直回不來。」
5. `p.note`：「想看正2 為什麼不是 2 倍：」連 `decay.html`「⑥ 正二不是兩倍？」；「一般股票跌多少要漲多少：」連 `drawdown.html`「⑧ 跌多少要漲多少才回本」；「平均成本細算（含手續費）：」連 `avgcost.html`「⑮ 平均成本與攤平」。

**不准出現的字句**：「保證」「一定回本」「遲早回本」「建議攤平」「建議停損」「該換」「現在是低點」「適合／不適合」。

## 4. 怎麼讀卡＋圖

`section.card`，標題「怎麼讀」，先放 `figure({ src: '../img/recover/need.svg', alt: …, caption: '正2 虧 40%，大盤要漲多少？看假設。' })`，再接四段（照抄）：

- 「正2 每天追大盤的 2 倍。虧 40% 的正2 自己要漲 66.7% 才回本，但大盤不用漲 66.7%，也不剛好是 66.7% ÷ 2＝33.3%。」
- 「大盤每天穩穩上漲時，正2 的漲幅會比 2 倍還多（複利），大盤約漲 29.1% 就夠。大盤上下震盪時，正2 會被耗損吃掉一點：一年波動 25%、拖 2 年、加上每年 1.1% 內扣，大盤要漲約 38.9%。」
- 「這裡是從現在往後算：過去的耗損已經反映在現價，不用再算一次。」
- 「公式假設波動固定、漲跌連續；真實市場會突然大跌（例如 2020 年 3 月），數字只當參考。『大盤』指臺灣50 指數，0050 會配息，價格漲幅會比指數略少。」

`img/recover/need.svg`（你手寫）：橫條圖，四條由上到下：「正2 自己要漲 66.7%」「直覺：除以 2　33.3%」「每天穩穩上漲　29.1%」「震盪 25%、2 年、含費用　38.9%」；第一條用警示色，其他三條同一色系。規格：`viewBox="0 0 360 H"`、不設 width/height、有 `<title>`／`<desc>`、顏色寫在內部 `<style>` 並含 `@media (prefers-color-scheme: dark)`、背景透明、最小字 12；禁止 script、foreignObject、外部資源、filter、動畫。alt 要把圖上的字和數字都寫進去。

## 5. CSS（`css/app.css` 檔尾，只在需要時加）

表格在 390px 寬不得水平捲動（可讓表格外包一層可橫向捲動的容器，但頁面本身不能橫向捲）；小字不准用 `--accent` 當文字色。

## 6. 參考資料（`references`）

- 元大投信 00631L 基本資料：https://www.yuantaetfs.com/product/detail/00631L/Basic_information
- 臺灣證券交易所《槓桿型及反向型 ETF 介紹》：https://www.twse.com.tw/downloads/zh/ETF/etfnews01.pdf
- Pocket 理財教室：股價漲回原點，槓桿 ETF 卻還在虧錢：https://www.pocket.tw/school/articles/5255/
- FINRA Regulatory Notice 09-31（槓桿與反向 ETF）：https://www.finra.org/rules-guidance/notices/09-31

## 7. PROOF_CMD

```
node scripts/gen-precache.mjs && npm.cmd test
```

預期：`tests 187`、`pass 187`、`fail 0`。smoke 由 Opus 跑（預期 pages 28 全過），不要跑 `npm.cmd run smoke`（面板裡會卡住）。

範例（`example`）結果頁 Opus 會核對的數字：正2 要漲 66.7%、帳面虧 16,000 元；大盤四列 33.3%／29.1%／35.5%／37.0%；攤平原投入的 73.3%（約 1223 股、29,352 元，新成本 31.2 元）、大盤約 14.0%～21.0%；再跌 20% 再虧：不動 21.6%（8,640 元）、攤平 48.0%（19,200 元）、0050 12.0%（4,800 元）；機率 1／2／3／5／10 年：不動 28／47／57／68／80%、攤平 59／72／78／84／90%、0050 4／17／31／49／73%。

## 8. 回報（`collab/from-codex-recover.md`，欄位固定，不貼程式碼）

完成項（對照第 1–6 節）／新增修改檔案清單／PROOF_CMD 的 tests、pass、fail／範例結果頁的實際數字（照第 7 節的順序列）／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
