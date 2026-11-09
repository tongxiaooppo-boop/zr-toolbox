# 任務 ⑥⑧ v1：「正二不是兩倍？」「跌多少要漲多少才回本」改精靈＋四張卡通圖

- 版本：2026-11-09 v1（框架 v5.9）。上一份（③ v1）已完成上線，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/trigger5050.js`（全檔，**照抄它的寫法**：import、`steps`、`explain`、`example`、頁尾「怎麼讀」）
- `js/pages/decay.js`、`js/pages/drawdown.js`（舊頁，整檔要重寫；`lineChart` 用法、textarea 解析、「怎麼讀」文字照這兩檔）
- `js/core/decay.js` 第 35 行以後（`decayPlan`）、`js/core/drawdown.js` 第 25 行以後（`drawdownPlan`），**只准呼叫**，JSDoc 是規格
- `js/ui/wizard.js` 第 1–40 行（介面註解）
- `docs/figures/cartoon/00-風格與角色.md` 和第 3 節表裡的四個提示檔

## 1. 只准改／新增這些檔

- `js/pages/decay.js`、`js/pages/drawdown.js`：整檔改寫成精靈。
- `docs/figures/cartoon/out/` 底下四張 PNG（第 3 節）。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`js/ui/`、`js/data/`、`tests/`、`css/`、`img/`、`tools/`、其他頁面、`docs/`（`docs/figures/cartoon/out/` 除外）。覺得要改就停下寫進回報。

共用輔助（兩頁各自寫在檔內）：`signed(x, digits = 1)` 照舊 ⑥ 頁；`pct = id => num(id) / 100`；`num`、`named`、`price`、`link` 照抄 ② 頁。

## 2.1 ⑥ `js/pages/decay.js`

import：`h, toolHeader, selectField, disclaimer, figure, lineChart`（components）、`wizard, numberInput, explain, withHelp`（wizard）、`decayPlan`（core/decay）、`parseNum, fmtMoney, fmtPct`（format）、`TOOLS`。

state：`kind`、`days`、`size`（百分比數字，例 5）、`amount`、`annualCost`（百分比數字）。

### 步驟 1「選行情」
- hint：「先選一種行情，下一步再填天數和幅度。」
- about：「正二是『每天』大約 2 倍，不是一整段 2 倍。行情來回震盪或一路同方向，結果差很多。」
- figure：`../img/decay/step1.webp`，alt 照第 3 節圖 2 的文字完整寫出。
- body：`withHelp(selectField({ id: 'kind', label: '行情', termId: 'volatility-decay', options: [{ value: 'chop', label: '來回震盪（一天漲、一天跌）' }, { value: 'trend', label: '一路同方向（每天漲跌一樣多）' }], value: s.kind || 'chop' }), { text: ['來回震盪：大盤一天漲、隔天跌同樣的 %，最後幾乎回到原點。', '一路同方向：把整段漲跌平均分到每一天。'] })`
- read：`s.kind = 值`。

### 步驟 2「大盤怎麼走」
- hint：`s.kind === 'chop'` ?「例：20 天、每天漲跌 5%。」:「例：10 天、整段大盤漲 10%；跌就填負數，例 −30。」
- about：「一年大約 250 個交易日。」
- body：`numberInput({ id: 'days', label: '天數', plain: '模擬幾個交易日（1–2520）', suffix: '天', value: s.days })`；`numberInput({ id: 'size', label: chop ? '每天漲跌幅' : '整段大盤漲跌', termId: 'daily-2x', plain: chop ? '大盤一天漲這麼多、隔天跌這麼多' : '整段期間大盤總共漲跌幾 %', suffix: '%', value: s.size })`。
- read：兩格空白 → 錯誤「請填天數和幅度。」；`s.days = num('days'); s.size = num('size')`；然後 `decayPlan({ kind: s.kind, days: s.days, size: s.size / 100 })` 檢查（錯誤丟出去）。

### 步驟 3「你的錢（選填）」
- hint：「兩格都可以留白。填了金額，結果會換算成錢。」
- body：`numberInput({ id: 'amount', label: '投入金額', plain: '留白就只看 %', suffix: '元', value: s.amount })`；`numberInput({ id: 'annualCost', label: '每年內扣費用', plain: '留白當 0；正二大約 1% 上下', suffix: '%', value: s.annualCost, help: { text: ['正二每天從淨值扣的經理費、保管費等，一年合計大約 1% 上下，詳細看投信網站的公開說明書。', '這裡平均攤到每天（÷ 250）。'] } })`。
- read：空白當 NaN 存；`decayPlan(params(s))` 檢查。

### `params(s)`
`{ kind: s.kind, days: s.days, size: s.size / 100, amount: Number.isNaN(s.amount) || s.amount == null ? 0 : s.amount, annualCost: Number.isNaN(s.annualCost) || s.annualCost == null ? 0 : s.annualCost / 100 }`

### 結果
`const r = decayPlan(params(s)); const m = r.amount > 0;` 依序：
1. `explain({ label: '大盤整段', value: signed(r.indexTotal) + (m ? '（' + fmtMoney(r.moneyIndex) + '）' : ''), tone: 'info', how: chop ? '每天 ×(1 + {size}%)、隔天 ×(1 − {size}%)，共 {days} 天。' : '整段 {signed(size/100)} 平均攤成每天一樣的漲跌，共 {days} 天。' })`
2. `explain({ label: '以為的「整段 × 2」', value: signed(r.naive) + (m ? '（…moneyNaive）' : ''), how: '大盤整段 {signed(r.indexTotal)} × 2。', means: '很多人以為正二就是這樣，但正二不是這樣算的。' })`
3. `explain({ label: '正二實際', value: signed(r.leveredTotal) + (m ? '（…moneyLevered）' : ''), tone: r.gap < 0 ? 'bad' : 'ok', how: '每天都用前一天的淨值 ×(1 + 2 × 大盤當天漲跌' + (r.dailyCost > 0 ? ' − 每天費用 ' + (r.dailyCost * 100).toFixed(4) + '%' : '') + ')，一天一天乘上去。' })`
4. `explain({ label: '差距', value: signed(r.gap) + (m ? '（' + (r.moneyGap < 0 ? '少 ' : '多 ') + fmtMoney(Math.abs(r.moneyGap)) + '）' : ''), tone: r.gap < 0 ? 'bad' : 'ok', how: '正二實際 − 以為的整段 × 2。', means: r.gap < 0 ? '來回震盪越多、天數越長，差距通常越大。這就是常聽到的波動耗損。' : '一路同方向時，每天重新變 2 倍反而會放大結果。', todo: ['想知道正二要買多少，看 ', link('exposure.html', '⑪ 正二要買多少'), '。'] })`
5. `lineChart(...)`：照舊 ⑥ 頁（series 正二／大盤、label、yFormat、baseline 1）。
6. `h('p', { class: 'note' }, '理想化計算：' + (r.dailyCost > 0 ? '' : '沒扣內扣費用、') + '沒算追蹤誤差和折溢價，實際結果會再差一些。')`

### example
`{ kind: 'chop', days: 20, size: 5, amount: 1000000, annualCost: NaN }`；範例結果必須有：大盤 −2.5%（975,279）、以為 −4.9%（950,559）、正二 −9.6%（904,382）、差距少 46,177。

### 怎麼讀
`figure({ src: '../img/decay/comic.webp', alt: 第 3 節圖 1 四格文字完整寫出 })`，接舊頁三段文字（不改），`disclaimer('general')`。舊的 `two-days.svg` 不再放進頁面。

## 2.2 ⑧ `js/pages/drawdown.js`

import：`h, toolHeader, selectField, infoChip, disclaimer, figure`（components）、`wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp`（wizard）、`holdingSummary`（core/holdings）、`drawdownPlan`（core/drawdown）、`parseNum, fmtMoney, fmtPct`（format）、`STOCK_NAMES`、`TOOLS`。

state：`mode`、`h`（holdingsInput 的 rows）、`peak`、`now`、`drop`（百分比數字）、`seriesText`、`annual`（百分比數字）。

### 步驟 1「怎麼算跌幅」
- hint：「選你手上有的數字。」
- about：「同一個現價，跟買入價比和跟最高點比，答案不一樣。」
- figure：`../img/drawdown/step1.webp`，alt 照第 3 節圖 4 的文字完整寫出。
- body：`withHelp(selectField({ id: 'mode', label: '跟什麼比', termId: 'drawdown', options: [{ value: 'holding', label: '跟我的買入價比（填持股）' }, { value: 'peak', label: '跟最高點比（填最高和現在）' }, { value: 'pct', label: '直接填跌幅 %' }, { value: 'series', label: '貼一串淨值或股價紀錄' }], value: s.mode || 'holding' }), { text: ['跟買入價比：算「還要漲多少才不虧」。', '跟最高點比：算「還要漲多少才回到最高」，淨值、股價、指數都可以。', '貼一串紀錄：找出中間跌最深的那一次（最大回撤）。'] })`
- read：`s.mode = 值`。

### 步驟 2（標題依 mode：holding「你的持股」／peak「最高點和現在」／pct「跌了幾 %」／series「貼上紀錄」）
- holding：hint「只填一檔。股數和成本均價看券商 App 的庫存。」；figure `../img/common/step-holdings.svg`，alt 照抄 ② 頁步驟 1；body `[holdingsInput({ id: 'h', rows: s.h || [{}], max: 1, label: '你的持股' }), tokenBox()]`；read `s.h = readHoldings('h'); holdingSummary(s.h);`
- peak：hint「淨值、股價、指數都可以，兩格單位要一樣。」；body `numberInput({ id: 'peak', label: '最高點', plain: '之前最高的那個數字', value: s.peak })`、`numberInput({ id: 'now', label: '現在', plain: '現在的數字', value: s.now })`；read 存 `num`。
- pct：body `numberInput({ id: 'drop', label: '跌幅', termId: 'recovery-gain', plain: '從高點跌了幾 %，例：30', suffix: '%', value: s.drop })`；read 存 `num`。
- series：body 照舊頁 `seriesField()`（textarea id `series`，值帶 `s.seriesText`）；read：`s.seriesText = 值`，解析照舊頁（`split(/[\s,，、]+/)`、`parseNum`），有非數字 → 錯誤「紀錄裡有不是數字的內容，請只填數字，用逗號或空白隔開。」
- 每種 read 最後都呼叫 `drawdownPlan(params(s))` 檢查（錯誤丟出去）。

### 步驟 3「之後每年賺多少（選填）」
- hint：「留白就不估要幾年。」
- body：`numberInput({ id: 'annual', label: '之後每年賺多少', plain: '例：大盤長期平均約 8%，這只是假設', suffix: '%', value: s.annual, help: { text: ['用固定的年報酬估要幾年回本，真實行情不會這麼平順。', '留白就不估。'] } })`
- read：`s.annual = num('annual')`（空白＝NaN），`drawdownPlan(params(s))` 檢查。

### `params(s)`
`{ mode: s.mode, annual: s.annual / 100 }` 再依 mode 加：holding `{ shares: s.h[0].shares, buyPrice: s.h[0].buyPrice, nowPrice: s.h[0].nowPrice }`；peak `{ peak: s.peak, now: s.now }`；pct `{ drop: s.drop / 100 }`；series `{ series: 解析後的數字陣列 }`。（`s.annual` 是 NaN 時 `annual` 就是 NaN，core 會當作沒填。）

### 結果
`const r = drawdownPlan(params(s))`；`what = { holding: '買入價', peak: '最高點', series: '前高' }[s.mode]`。依序：
1. `r.drop === 0 && r.up > 0`：`explain({ label: '沒有虧', value: '現在比' + what + '高 ' + fmtPct(r.up), tone: 'ok', means: '不用回本。可以把買入價換成最高點再算一次，看離最高點多遠。' })`，**後面只放第 6、7 項**。`r.drop === 0 && r.up === 0`：同樣格式，value「剛好回到" + what + "」」。
2. `explain({ label: '跌了', value: fmtPct(r.drop), tone: 'bad', how: base 有值 ? '(' + what + ' {base} − {current}) ÷ {base}＝' + fmtPct(r.drop) + '。' : '你填的跌幅。' })`；series 時 how 改「從第 {peakIndex+1} 筆（{base}）跌到第 {troughIndex+1} 筆（{current}），是這串紀錄裡最深的一次。」
3. `explain({ label: '要漲多少才回本', value: fmtPct(r.recovery), tone: 'warn', how: '1 ÷ (1 − ' + fmtPct(r.drop) + ') − 1＝' + fmtPct(r.recovery) + '。', means: '跌是用原本的錢算，漲是用剩下的錢算，所以要漲的比跌的多。' + (base 有值 ? '要從 {current} 漲回 {base}。' : '') })`（數字用 `+x.toFixed(2)` 顯示，不加「元」，因為 peak／series 可能是淨值）。
4. holding 才有：`explain({ label: '現在虧', value: fmtMoney(r.loss), tone: 'bad', how: '{shares 千分位} 股 ×（{buyPrice} − {nowPrice}）。', means: '還沒賣就只是帳面上的虧損；沒算手續費、稅和股利。' })`
5. `r.years !== null`：`explain({ label: '每年賺 ' + s.annual + '% 要', value: '約 ' + r.years.toFixed(1) + ' 年', how: 'ln(1 + ' + fmtPct(r.recovery) + ') ÷ ln(1 + ' + s.annual + '%)。', means: '假設每年都穩穩賺一樣多；真實行情會有起伏。' })`
6. series 才有：`explain({ label: '現在離最高點', value: r.curDrop === 0 ? '在最高點' : '還差 ' + fmtPct(r.curDrop), tone: 'info', how: '最後一筆 ÷ 全部最高的一筆。' })`
7. 對照表 `h('table', { class: 'trade-table' })`：欄「跌了｜要漲」，`r.table` 每列 `fmtPct(drop, 0)`、`fmtPct(gain)`。表下一行 `h('p', { class: 'note' }, ['正二的漲跌約是大盤的 2 倍，回撤也比較深，而且來回震盪會再多虧一點，見 ', link('decay.html', '⑥ 正二不是兩倍？'), '。'])`。

### example
`{ mode: 'holding', h: [{ code: '0050', shares: 1000, buyPrice: 200, nowPrice: 150 }], annual: 8 }`；範例結果必須有：跌了 25.0%、要漲 33.3%、現在虧 50,000、約 3.7 年。

### 怎麼讀
`figure({ src: '../img/drawdown/comic.webp', alt: 第 3 節圖 3 四格文字完整寫出 })`，接舊頁三段文字（不改），`disclaimer('general')`。舊的 `recovery.svg` 不再放進頁面。

## 3. 生四張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| # | 提示檔 | 存成 |
|---|---|---|
| 1 | `docs/figures/cartoon/decay-01-正二不是整段兩倍四格.md` | `docs/figures/cartoon/out/decay-comic.png` |
| 2 | `docs/figures/cartoon/decay-02-兩種行情.md` | `docs/figures/cartoon/out/decay-step1.png` |
| 3 | `docs/figures/cartoon/drawdown-01-跌25要漲33四格.md` | `docs/figures/cartoon/out/drawdown-comic.png` |
| 4 | `docs/figures/cartoon/drawdown-02-跌幅四種算法.md` | `docs/figures/cartoon/out/drawdown-step1.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 頁面引用的是 `img/decay/comic.webp`、`step1.webp`、`img/drawdown/comic.webp`、`step1.webp`（Opus 轉檔搬過去，你不用做）。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "Promise.all([import('./js/core/decay.js'),import('./js/core/drawdown.js')]).then(([a,b])=>{const r=a.decayPlan({kind:'chop',days:20,size:.05,amount:1e6});const d=b.drawdownPlan({mode:'holding',shares:1000,buyPrice:200,nowPrice:150,annual:.08});console.log(Math.round(r.moneyIndex),Math.round(r.moneyNaive),Math.round(r.moneyLevered),Math.round(r.moneyGap),d.drop,d.recovery.toFixed(4),d.loss,d.years.toFixed(1))})"
node --check js/pages/decay.js
node --check js/pages/drawdown.js
```
預期：`ℹ tests 138`、`ℹ pass 138`、`ℹ fail 0`；第二行 `975279 950559 904382 -46177 0.25 0.3333 50000 3.7`；後兩行無輸出。

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
