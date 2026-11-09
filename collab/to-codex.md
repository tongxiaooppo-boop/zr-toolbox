# 任務 ⑲：退休提領精靈頁＋⑦ 加「停扣後再滾」＋兩張卡通圖（照 ⑦ 樣板）

- 版本：2026-11-09 v1。上一份（⑤ v1）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/dca.js`（**樣板，結構照抄**；第 3 節也要改這個檔）
- `tools/dca.html`（照抄成 `tools/retire.html`）
- `js/core/retire.js`（公式與回傳欄位，只准呼叫、不准改）
- `js/core/dca.js` 第 20–35 行（`dcaPlan` 新增的 `holdYears`、`holdReturn`、`heldValue`、`totalYears`）
- `js/ui/wizard.js` 第 1–25 行（介面說明）
- `docs/figures/cartoon/00-風格與角色.md`、`retire-01-一千萬領多久四格.md`、`retire-02-通膨要越領越多.md`（第 4 節生圖用）

## 1. 只准新增／修改這些檔（其他檔一律不改）

- 新增 `tools/retire.html`：照抄 `tools/dca.html`，title「退休提領｜正二工具箱」，script `../js/pages/retire.js`。
- 新增 `js/pages/retire.js`：照第 2 節。
- 修改 `js/pages/dca.js`：照第 3 節，只動寫到的地方。
- 新增 `docs/figures/cartoon/out/retire-comic.png`、`docs/figures/cartoon/out/retire-step3.png`：照第 4 節。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`tests/`、`js/ui/`、`js/data/`、`css/`、`img/`。覺得要改就停下寫進回報。

## 2. ⑲ 頁面規格（`js/pages/retire.js`）

`const tool = TOOLS.find(t => t.id === 'retire');`；`import { retirePlan } from '../core/retire.js'`；`h, toolHeader, selectField, disclaimer, figure` 從 components.js；`wizard, numberInput, explain, withHelp` 從 wizard.js；`parseNum, fmtMoney, fmtPct` 從 format.js。不用 holdings、tokenBox、STOCK_NAMES。
共用小工具：`num`、`signed` 照 dca.js。

從 ⑦ 帶過來的資產：
```js
const fromDca = parseNum(new URLSearchParams(location.search).get('pool') ?? '');
```

### 步驟 1「退休時有多少錢」
- hint：「把退休時預計有的錢加起來：存款、股票、ETF、勞退專戶……。」
- about：「這一步是你要拿來每月領的那筆錢。」
- 不放 figure。
- body：
  1. `fromDca > 0` 時先放 `h('p', { class: 'tip' }, \`已從定期定額帶入 ${fmtMoney(fromDca)}，可以自己改。\`)`；否則放 `h('p', { class: 'tip' }, '還不知道退休時會有多少？先用「定期定額與年化報酬」算，結果頁可以一鍵帶過來。')`。
  2. `numberInput` id `pool`，label「退休時的資產」，plain「例：10000000（1,000 萬）」，value `s.pool ?? (fromDca > 0 ? Math.round(fromDca) : '')`，suffix「元」，help：「股票、ETF 用退休那時預計的市值。」「房子如果不打算賣，不要算進來。」
- read：`s.pool = num('pool');`；不是 >0 →「退休時的資產要大於 0，例：10000000。」

### 步驟 2「要領多久、報酬多少」
- hint：「年數想保守就多填幾年；報酬率是你自己設的假設，不是預測。」
- about：「這一步決定錢要撐多久，以及還沒領的錢怎麼繼續滾。」
- 不放 figure。
- body：
  1. `numberInput` id `years`，label「要領幾年」，plain「例：65 歲退休、領到 90 歲就填 25」，value `s.years ?? ''`，suffix「年」，help：「怕活得比預期久，就多填幾年。」
  2. `numberInput` id `ret`，label「退休後年報酬」，termId `compound-interest`，plain「退休後通常放保守一點，例：3.5」，value `s.ret ?? ''`，suffix「%」，help：「這是假設每年都一樣的報酬；真實市場有漲有跌。」「退休後還要每月領錢，通常會多放債券或現金，報酬會比存錢時低。」
  3. `selectField({ id: 'timing', label: '每月什麼時候領', options: [{ value: 'end', label: '月底領（多滾一個月）' }, { value: 'start', label: '月初領（先拿到錢）' }], value: s.timing || 'end' })`
- read：`s.years = num('years'); s.ret = num('ret'); s.timing = document.getElementById('timing').value;`；years 不是 1–60 整數 →「要領幾年填 1–60 的整數，例：25。」；ret 不是 >−99 且 <99 →「退休後年報酬填 −99 到 99，例：3.5。」

### 步驟 3「通膨與留給家人」
- hint：「通膨先用 2%；不打算留錢就填 0。」
- about：「這一步決定每月領的錢要不要跟著物價調高，以及最後要留下多少。」
- figure：`{ src: '../img/retire/step3.webp', alt: '卡通圖：為什麼每月要越領越多？每月固定領 49,768 元：第 1 年購物籃是滿的，第 25 年少了一截，錢一樣多，買得到的東西越來越少。每月跟著物價調高：第 1 年 39,875 元、第 25 年 65,312 元，購物籃一樣滿，買得到的東西一樣多。老師說：物價每年漲 2%，每月領的錢也要跟著調高。1,000 萬、年報酬 3.5%、領 25 年、最後剛好領完。通膨是你自己設的假設。' }`
- body：
  1. `numberInput` id `inflation`，label「通膨率」，termId `inflation`，plain「每年物價漲幾 %，常用 2；不考慮填 0」，value `s.inflation ?? 2`，suffix「%」，help：「填 2：每月領的錢每個月調高一點，一年下來多 2%，買得到的東西不變。」「填 0：每月領一樣多，但後面幾年買得到的東西會變少。」
  2. `numberInput` id `residual`，label「最後要留下多少」，plain「領完時還想剩的錢；不留填 0」，value `s.residual ?? 0`，suffix「元」，help：「例：想留 200 萬給家人或當醫療預備金。」「留越多，每月能領的越少。」
- read：`s.inflation = num('inflation'); s.residual = num('residual');`；inflation 不是 0–20 →「通膨率填 0–20，例：2；不考慮通膨填 0。」；residual 不是 ≥0 →「要留下的錢不能是負的，不留填 0。」

### 步驟 4「其他收入與每月花費」
- hint：「勞保年金、租金這類每月固定進帳填在這裡；兩格都是選填。」
- about：「這一步拿來比較：每月能領的錢＋其他收入，夠不夠你想花的。」
- 不放 figure。
- body：
  1. `numberInput` id `other`，label「其他每月固定收入（選填）」，plain「勞保年金、租金……；沒有填 0」，value `s.other ?? 0`，suffix「元」，help：「勞保年金可以到勞保局網站試算。」「這筆錢這裡不跟著通膨調高。」
  2. `numberInput` id `target`，label「退休第一年每月想花多少（選填）」，plain「用今天的物價想；留白就不比較」，value `s.target`，suffix「元」，help：「之後每年照通膨調高。」
- read：`s.other = num('other'); s.target = num('target');`；other 不是 ≥0 →「其他每月收入不能是負的，沒有填 0。」；target 不是 NaN 且不是 >0 →「每月想花多少要大於 0；不比較就留白。」

### 結果
```js
const r = retirePlan({ pool: s.pool, years: s.years, annualReturn: s.ret / 100, inflation: s.inflation / 100,
  residual: s.residual, timing: s.timing, otherIncome: s.other, targetSpend: s.target });
```
依序 `explain`（金額 `fmtMoney`，百分比 `fmtPct(…, 2)`，月利率 `fmtPct(…, 3)`）：

1. **每月可領（第 1 個月）** `fmtMoney(r.firstWithdraw)`，tone `ok`；how：「資產 {fmtMoney(s.pool)}」＋（residual>0 時「，扣掉要留下的 {fmtMoney(s.residual)} 折現到今天 {fmtMoney(r.pvResidual)}」）＋「；年報酬 {ret}% 換成每月 {fmtPct(r.monthlyRate, 3)}，領 {years} 年共 {r.months} 個月」＋（inflation>0 時「，每月照通膨 {inflation}% 調高」）＋「。」＋（timing start 時「月初領，少滾一個月。」否則「月底領。」）；means：inflation>0 →「之後每個月調高一點，買得到的東西一樣多。」否則 →「每月都一樣多。」；再加 residual>0 →「領完時剛好剩 {fmtMoney(s.residual)}。」否則「領完時剛好用完。」
2. **最後一個月可領**（inflation>0 才顯示）`fmtMoney(r.lastWithdraw)`；how：「第 1 個月 {fmtMoney(r.firstWithdraw)} × (1＋每月 {fmtPct(r.monthlyGrowth, 3)})^{r.months − 1}。」；means：「金額變大，但換回第 1 年的物價，買得到的東西一樣多。」
3. **每月總收入**（other>0 才顯示）`fmtMoney(r.firstTotal)`；how：「第 1 個月可領 {fmtMoney(r.firstWithdraw)} ＋ 其他固定收入 {fmtMoney(s.other)}。最後一個月是 {fmtMoney(r.lastTotal)}。」；means：inflation>0 →「其他收入這裡不跟著通膨調高：{fmtMoney(s.other)} 到最後一個月，只等於第 1 年的 {fmtMoney(r.lastOtherReal)}。」否則 →「沒有算通膨。」
4. **第一年提領率** `fmtPct(r.withdrawRate, 2)`，tone：`r.withdrawRate > 0.04` → `warn`，否則 `ok`；how：「第 1 個月可領 {fmtMoney(r.firstWithdraw)} × 12 ÷ 資產 {fmtMoney(s.pool)}。4% 法則第一年每月約 {fmtMoney(r.rule4Monthly)}。」；means：>0.04 →「比 4% 高：真實報酬比你假設的低、或剛退休就遇到大跌，錢可能提早用完。」否則 →「沒超過 4%，比較保守。」；兩種都再加「4% 法則來自美國的歷史資料，是經驗法則，不是保證。」
5. **想花的錢夠不夠**（target 有填才顯示）`signed(r.gap)`，tone：`r.gap >= 0` → `ok`，否則 `bad`；how：「第 1 個月總收入 {fmtMoney(r.firstTotal)} − 想花 {fmtMoney(s.target)}。」；means：gap<0 →「每月不夠 {fmtMoney(−r.gap)}。要剛好夠，退休時要有 {fmtMoney(r.needPool)}，還差 {fmtMoney(r.needPool − s.pool)}。」否則 →「夠用，每月多 {fmtMoney(r.gap)}。要剛好夠，退休時有 {fmtMoney(r.needPool)} 就可以。」；todo（gap<0 時才給）：「可以多存一點、晚幾年退休、少領幾年，或降低每月花費，改參數重算看看。」
6. **總共領出** `fmtMoney(r.totalWithdrawn)`；how：「{r.months} 個月的提領加起來。」；means：`r.totalWithdrawn > s.pool` →「比退休時的資產多，因為還沒領的錢會繼續滾。」否則 →「比退休時的資產少，因為報酬是負的或要留下一筆錢。」

接著 `h('h3', {}, '逐年變化')`，表格 `h('table', { class: 'trade-table' }, …)` 欄位：`年`、`那年每月領（第 1 個月，元）`、`那年共領（元）`、`年底剩下（元）`；每列 `r.rows`，數字 `Math.round(n).toLocaleString('en-US')`。

最後 `h('div', { class: 'note' }, …)` 固定四條：
- 「這是固定報酬的情境；剛退休就遇到大跌，同樣平均報酬，錢會比這裡更早用完。」
- 「其他每月收入這裡不跟著通膨調高；勞保年金實際有調整機制但不固定，這裡沒有模擬。」
- 「沒算稅、健保費，也沒算醫療、長照這類一次性的大筆支出。」
- 「每月賣股票、ETF 換現金時，還有手續費和證交稅，可以用「買賣成本與損益」算。」

### 範例與頁尾
```js
const example = { pool: 10000000, years: 25, ret: 3.5, timing: 'end', inflation: 2, residual: 0, other: 15000, target: 50000 };
```
範例結果必須是：每月可領 NT$ 39,875、最後一個月 NT$ 65,312、每月總收入 NT$ 54,875（最後一個月 NT$ 80,312、其他收入只等於 NT$ 9,158）、第一年提領率 4.79%（黃）、4% 法則每月約 NT$ 33,333、想花的錢夠不夠 +NT$ 4,875（綠，要剛好夠 NT$ 8,777,360）、總共領出 NT$ 15,466,611、表格 25 列（第 1 列 39,875／482,874／9,859,455）。

頁尾照 dca.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片放
`figure({ src: '../img/retire/comic.webp', alt: '四格漫畫：一、小安抱著 1,000 萬的錢袋，問退休後每個月能領多少。二、不管物價：年報酬 3.5%、領 25 年、最後剛好領完，每月約 49,768 元。三、物價每年漲 2%：第 1 年每月 39,875 元、第 25 年每月 65,312 元，每月跟著物價調高；老師說一開始領少一點，換來每年買得到的東西一樣多。四、4% 法則每月約 33,333 元；老師的白板寫報酬是假設不是保證、剛退休就大跌要領少一點；這是規劃情境，不是預測。' })`
加三段 `h('p')`：
- 「退休提領＝把退休時的錢分成很多個月領，還沒領的錢繼續放著滾。」
- 「物價會漲，所以每月領的錢要跟著調高，買得到的東西才不會變少。」
- 「4% 法則：第一年領資產的 4%，之後照通膨調高。它是經驗法則，不是保證。」

最後 `disclaimer('general')`。`img/retire/` 的 webp 由 Opus 轉檔放入，你不要放、不要轉檔。

## 3. ⑦ 修改（`js/pages/dca.js`）

1. 第 3 步「假設報酬與年數」body 在 `timing` 的 selectField **後面**加兩格：
   - `numberInput` id `holdyears`，label「停扣後再放幾年（選填）」，plain「例：45 歲停扣、65 歲退休就填 20；不放填 0」，value `s.holdYears ?? 0`，suffix「年」，help：「停止扣款後不賣，讓錢繼續滾到退休。」「這段期間不再扣款，也不收手續費。」
   - `numberInput` id `holdret`，label「停扣後年報酬（選填）」，plain「快退休了常放保守一點，例：3；留白＝跟上面一樣」，value `s.holdRet`，suffix「%」，help：「留白就用上面的假設年報酬。」
   read 補上：`s.holdYears = num('holdyears'); s.holdRet = num('holdret');`；holdYears 不是 0–60 整數 →「停扣後再放幾年填 0–60 的整數，不放填 0。」；holdRet 不是 NaN 且不是 >−99 且 <99 →「停扣後年報酬填 −99 到 99，例：3；跟上面一樣就留白。」
2. `result` 的 `dcaPlan({...})` 加 `holdYears: s.holdYears || 0, holdReturn: Number.isFinite(s.holdRet) ? s.holdRet / 100 : s.ret / 100`。
3. `explain` 第 1 項（{years} 年後的資產）**後面**，`s.holdYears > 0` 時插一項 **停扣後再放 {holdYears} 年** `fmtMoney(r.heldValue)`；how：「{years} 年後資產 {fmtMoney(r.finalValue)} × (1＋{停扣後年報酬}%)^{holdYears}，不再扣款、不收手續費。」（停扣後年報酬＝holdRet 有填用它，否則用 ret）；means：「從開始扣款算起，共 {r.totalYears} 年。」
4. 「每月約可買」那項之後、`逐年變化` 標題之前，加：
   ```js
   h('p', { class: 'tip' }, h('a', { href: `retire.html?pool=${Math.round(r.heldValue)}` }, '把這筆錢帶到「退休提領」，算每月能領多少 →'))
   ```
5. `example` 加 `holdYears: 0, holdRet: NaN`（範例數字不變）。

## 4. 生兩張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/retire-01-一千萬領多久四格.md` | `docs/figures/cartoon/out/retire-comic.png` |
| `docs/figures/cartoon/retire-02-通膨要越領越多.md` | `docs/figures/cartoon/out/retire-step3.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 5. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/retire.js').then(m=>{const r=m.retirePlan({pool:1e7,years:25,annualReturn:0.035,inflation:0.02,otherIncome:15000,targetSpend:50000});console.log(Math.round(r.firstWithdraw),Math.round(r.lastWithdraw),Math.round(r.firstTotal),(r.withdrawRate*100).toFixed(2),Math.round(r.gap),Math.round(r.needPool),Math.round(r.totalWithdrawn),r.rows.length)})"
node --check js/pages/retire.js
node --check js/pages/dca.js
```
預期：`ℹ tests 95`、`ℹ pass 95`、`ℹ fail 0`；第二行 `39875 65312 54875 4.79 4875 8777360 15466611 25`；後兩行無輸出。

## 6. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

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
- retire-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- retire-step3.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
