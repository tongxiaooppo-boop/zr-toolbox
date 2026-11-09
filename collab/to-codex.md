# 任務 ⑩：股息與除權息精靈頁（照 ⑨ 樣板）

- 版本：2026-11-09 v2（v2：加 2b 生卡通圖）。上一份（研究任務 R v4）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`（PowerShell 擋 `npm.ps1`）；**不要跑 `npm.cmd run smoke`**（沙箱開不了 Chrome，Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/cost.js`（**樣板，結構照抄**：import、steps 陣列、result、example、頁尾「怎麼讀」）
- `tools/cost.html`（照抄成 `tools/dividend.html`）
- `js/core/dividend.js`（公式，只准呼叫、不准改）
- `js/ui/wizard.js` 第 53–80 行（`withHelp`、`numberInput`、`explain` 簽名）
- `js/core/cost.js` 第 15–20 行（`guessKind`）

## 1. 要新增的檔案（只准新增這兩個＋第 2b 節兩張 PNG＋回報檔，其他檔一律不改）

- `tools/dividend.html`：照抄 `tools/cost.html`，title 改「股息與除權息｜正二工具箱」，script 改 `../js/pages/dividend.js`。
- `js/pages/dividend.js`：照下面規格。

**不准改**：`js/core/`、`tests/`、`js/ui/`、`js/data/`（`tools.js` 的 status 由 Opus 改）、`css/`、`img/`。覺得要改就停下寫進回報。

## 2. 頁面規格

`const tool = TOOLS.find(t => t.id === 'dividend');`，`import { dividendPlan, NHI_MIN } from '../core/dividend.js'`、`import { guessKind } from '../core/cost.js'`，其他 import 照 cost.js 需要的留。

### 步驟 1「你持有什麼」
- 跟 cost.js 步驟 1 一樣：`holdingsInput({ id: 'hold', rows: s.holdings || [{}], max: 1, label: '你的持股' })`＋`tokenBox()`，figure 用同一張 `../img/common/step-holdings.svg`（alt 照抄）。
- hint：「填一檔你有的股票或 ETF：代號、股數、買入價。代號填好，現價會自動抓。」
- about：「這一步確定你有幾股、成本多少。股利是按股數發的。」
- read：`readHoldings` → `holdingSummary([x])`；代號換了才設 `s.kind = guessKind(x.code)`、`s.prevClose = x.nowPrice`；`s.holdings = [x]`。

### 步驟 2「這次發多少股利」
- hint：「照公司（或投信）的股利公告填。公告在券商 App 個股頁的『股利』或公開資訊觀測站。」
- about：「這一步算出你會領多少現金、多幾股。股票股利的『元』要除以面額，才是配股比例。」
- figure：`{ src: '../img/dividend/step2.webp', alt: '卡通圖：股利公告怎麼看？某檔股票股利公告：現金股利每股 2.4 元，填到每股現金股利；股票股利每股 0.5 元，填到每股股票股利。小安有 1 張（1,000 股）：現金 2.4 元 × 1,000 股＝2,400 元；配股 0.5 元 ÷ 面額 10 元＝5%，1,000 股 × 5%＝50 股。老師說：股票股利的元要除以面額，才是配股比例。多數公司面額 10 元，少數不是，依公告；ETF 通常只配現金。' }`
- 欄位（依序）：
  1. `selectField` id `exdone`，label「除權息日過了嗎」，options：`no`「還沒，先算算看」、`yes`「已經過了」，預設 `s.exDone || 'no'`。用 `withHelp`：「還沒過：除權息前收盤價就用現價（已自動帶入）。」「已經過了：要自己查除權息前一天的收盤價，結果會告訴你填息了沒。」
  2. `numberInput` id `prevclose`，label「除權息前一天收盤價」，termId `ex-dividend`，plain「還沒除權息就用現價」，value `s.prevClose`，suffix「元」，help：「除權息當天的參考價，就是用這個價格扣掉股利算出來的。」「已經除權息過了：在券商 App 的日 K 線找除權息前一天的收盤價。」
  3. `numberInput` id `cash`，label「每股現金股利」，termId `dividend-yield`，plain「公告寫『現金股利 2.4 元』就填 2.4」，value `s.cash ?? ''`，suffix「元」，help：「是每 1 股發多少錢，不是你總共領多少。」「沒有發現金就填 0。ETF 的『每單位配息』也填這裡。」
  4. `numberInput` id `stockdiv`，label「每股股票股利」，plain「公告寫『股票股利 0.5 元』就填 0.5；沒有填 0」，value `s.stockDiv ?? 0`，suffix「元」，help：「配股比例＝這個數字 ÷ 面額。面額 10 元時，0.5 元＝每 1,000 股配 50 股。」「ETF 通常只配現金，填 0。」
  5. `numberInput` id `par`，label「股票面額」，plain「多數公司是 10 元」，value `s.par ?? 10`，suffix「元」，help：「少數公司面額不是 10 元（例：1 元），公告或公開資訊觀測站查得到。」
- read：讀進 `s.exDone`、`s.prevClose`、`s.cash`、`s.stockDiv`、`s.par`；驗證（訊息照寫）：
  - prevClose 不是 >0 → 「除權息前收盤價要大於 0，例：50。」
  - cash 或 stockDiv 不是 ≥0 → 「股利不能是負的，沒有就填 0。」
  - 兩者都 0 → 「現金股利和股票股利至少填一個。」
  - par 不是 >0 → 「面額要大於 0，多數公司是 10 元。」

### 步驟 3「健保身分」
- hint：「股利一次領到 2 萬元以上，會先被扣二代健保補充保費。」
- about：「這一步決定要不要扣補充保費。大多數人選『一般』。」
- 不放 figure。
- 欄位：`selectField` id `identity`，label「健保身分」，termId `nhi-premium`，plain「不確定就選一般」，options：`general`「一般（受僱、自己投保、依附眷屬）」、`exempt`「符合免扣資格（例：中低收入戶，依健保署規定）」，預設 `s.identity || 'general'`。用 `withHelp`：「一般身分：單次股利所得達 20,000 元，全額 × 2.11%，由發股利的公司直接扣。」「以雇主或自營業主身分投保的人另有扣除規則，這裡沒有算，請以健保署為準。」
- read：`s.identity = document.getElementById('identity').value`。

### 結果
```js
const [x] = s.holdings;
const after = s.exDone === 'yes';
const r = dividendPlan({ shares: x.shares, prevClose: s.prevClose, cashPerShare: s.cash, stockPerShare: s.stockDiv, par: s.par,
  buyPrice: x.buyPrice, nowPrice: after ? x.nowPrice : undefined, identity: s.identity });
```
名稱照 cost.js 用 `STOCK_NAMES`。依序輸出 `explain`（數字格式：金額 `fmtMoney`、百分比 `fmtPct(…, 2)`、股數 `toLocaleString('en-US') + ' 股'`、參考價 `r.refPrice.toFixed(2) + ' 元'`）：

1. **現金股利** `fmtMoney(r.cashTotal)`；how：「每股 {cash} 元 × {shares} 股＝{cashTotal}（元以下捨去）。」；means：「發放日以公告為準，匯進你的交割帳戶。」。`s.cash === 0` 時不顯示。
2. **配股** `{newShares} 股`；how：「配股比例＝{stockDiv} ÷ 面額 {par}＝{stockRate 百分比}；{shares} 股 × 配股比例＝{newSharesExact 取 2 位}股。」若 `newSharesExact !== newShares` 加「不足 1 股的部分依公司公告處理（通常折發現金）。」；means：「除權後你有 {sharesAfter} 股。」。`s.stockDiv === 0` 時不顯示。
3. **二代健保補充保費** `fmtMoney(r.premium)`，`r.premium > 0` 時 tone `warn`；how 三種情況擇一：
   - exempt：「你選了免扣資格，不扣。」
   - `r.income < NHI_MIN`：「這次股利所得 {income}（現金 {cashTotal} ＋ 股票股利面額 {stockIncome}），未達 20,000 元，不扣。」（stockIncome 為 0 時省略括號裡的股票股利那段）
   - 其他：「（現金 {cashTotal} ＋ 股票股利面額 {stockIncome}）× 2.11%＝{premium}（四捨五入）。」（stockIncome 為 0 時寫「現金 {cashTotal} × 2.11%」）
   - means：「由發股利的公司直接從現金股利扣掉。」
4. **實領現金** `fmtMoney(r.netCash)`，tone `ok`；how：「現金股利 {cashTotal} − 補充保費 {premium}。」；means：「這是會進帳的錢；所得稅另外在報稅時算（見下方注意）。」
5. **除權息參考價** `{refPrice} 元`；how：「（{prevClose} − {cash}）÷（1 ＋ {stockRate 百分比}）。」（stockDiv 為 0 時寫「{prevClose} − {cash}」）；means：「除權息當天的開盤參考，不是預測會成交在哪；實際參考價會對齊升降單位，以證交所公告為準。」
6. **除權息前後總值** `{fmtMoney(valueBefore)} → {fmtMoney(valueAfter)}`；how：「前：{shares} 股 × {prevClose} 元。後：{sharesAfter} 股 × {refPrice} 元 ＋ 現金股利 {cashTotal}。」；means：「總值幾乎不變：股利是從股價搬到你口袋，不是多賺的。扣掉補充保費 {premium} 元，反而少一點。」（premium 為 0 時最後一句省略）
7. **現金殖利率** `fmtPct(r.cashYield, 2)`；how：「每股現金股利 {cash} ÷ 除權息前收盤價 {prevClose}。」；有 buyPrice 時 means：「用你的買入價 {buyPrice} 元算，成本殖利率是 {costYield}。比較不同股票要用同一種分母。」，沒有時 means：「殖利率高不等於賺得多，還要看股價有沒有漲回來。」。`s.cash === 0` 時不顯示。
8. **填息要漲多少** `fmtPct(r.fillPct, 2)`；how：「從參考價 {refPrice} 元漲回 {prevClose} 元：{prevClose} ÷ {refPrice} − 1。」；means：
   - `r.filled === true`（tone `ok`）：「現價 {nowPrice} 元已回到 {prevClose} 元，已經填息。」
   - `r.filled === false`（tone `warn`）：「現價 {nowPrice} 元，還差 {prevClose − nowPrice 取 2 位} 元才填息。」
   - `null`：「除權息後股價漲回 {prevClose} 元才叫填息（有配股叫填權），不保證，也沒有期限。」
9. **含息損益**（`x.buyPrice` 有值才顯示）`signed(r.profitAfter)`，tone 依正負 `ok`／`bad`；how：「{sharesAfter} 股 × 參考價 {refPrice} ＋ 實領現金 {netCash} − 買進成本 {costTotal}（{shares} 股 × {buyPrice}）。」；means：「除權息前是 {signed(profitBefore)}，差的就是補充保費。手續費、證交稅沒算，買賣成本請用 ⑨。」

最後一個 `h('div', { class: 'note' }, …)`，固定三條：
- 「所得稅沒有算：股利所得可選合併計稅（8.5% 可抵減，每戶上限 8 萬元）或分開計稅 28%，要看你全年所得。」
- 「ETF 的收益分配不一定全是股利所得，補充保費與所得稅的計算以配息通知為準；這裡用全額估，是上限。」
- 「現金增資、減資、分割、匯費等沒有算；實際金額以公司公告與券商入帳為準。」

### 範例與頁尾
```js
const example = { holdings: [{ code: '2412', shares: 10000, buyPrice: 40, nowPrice: 50 }], kind: 'stock',
  exDone: 'no', prevClose: 50, cash: 2.4, stockDiv: 0.5, par: 10, identity: 'general' };
```
範例結果必須是：現金股利 24,000、配股 500 股、補充保費 612、實領 23,388、參考價 45.33、總值 500,000 → 500,000、現金殖利率 4.80%、填息 10.29%、含息損益 +99,388。

頁尾照 cost.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片放
`figure({ src: '../img/dividend/comic.webp', alt: '四格漫畫：一、除權息前一天，小安有某檔股票 10,000 股 × 50 元＝500,000 元。二、股利來了：現金股利 2.4 元 × 10,000 股＝24,000 元，股票股利 0.5 元多 500 股，健保補充保費 −612 元。三、除權息當天參考價 45.33 元，10,500 股 × 45.33 元約 476,000 元，加現金 24,000 元還是 500,000 元。四、老師說股價要從 45.33 元漲 10.29% 回到 50 元才叫填權息；股利是從股價搬到你口袋，股價漲回來才算真的賺到。補充保費＝（現金 24,000＋股票股利面額 5,000）× 2.11%。' })`
加三段 `h('p')`：
- 「發股利那天叫除權息：股價先扣掉發出去的股利，所以你的總值幾乎不變。」
- 「股利要等股價漲回除權息前的價格（填息），才算真的賺到；一直沒漲回來叫貼息，領了股利還是虧。」
- 「單次股利達 2 萬元會先扣 2.11% 補充保費；殖利率比較要用同一種分母（現價或你的成本）。」

最後 `disclaimer('general')`。

註：`img/dividend/` 的兩張 webp 由 Opus 從你生的 PNG 轉檔放入（第 2b 節），你不要自己放進 `img/`、不要轉檔。

## 2b. 生兩張卡通圖（用你的生圖功能）

依序讀 `docs/figures/cartoon/00-風格與角色.md`，再讀下面每張的提示檔，**把風格檔全文＋該張提示全文合在一起當生圖提示**，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/dividend-01-領股利四格.md` | `docs/figures/cartoon/out/dividend-comic.png` |
| `docs/figures/cartoon/dividend-02-股利公告怎麼看.md` | `docs/figures/cartoon/out/dividend-step2.png` |

- 生完自己看一遍：圖上中文與數字要和提示一字不差；有錯字或數字錯，重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖（沒有這個功能）就跳過本節，回報寫「無法生圖」，頁面照常交付。
- 這兩個 PNG 是本任務唯一允許寫進 `docs/` 的檔案。

## 3. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/dividend.js').then(m=>{const r=m.dividendPlan({shares:10000,prevClose:50,cashPerShare:2.4,stockPerShare:0.5,par:10,buyPrice:40});console.log(r.cashTotal,r.newShares,r.premium,r.netCash,r.refPrice.toFixed(2),Math.round(r.valueAfter),(r.fillPct*100).toFixed(2),Math.round(r.profitAfter))})"
node --check js/pages/dividend.js
```
預期：`ℹ tests 73`、`ℹ pass 73`、`ℹ fail 0`；第二行輸出 `24000 500 612 23388 45.33 500000 10.29 99388`；第三行無輸出。

## 4. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
- …
## 新增檔案
- …
## PROOF_CMD 結果
- npm.cmd test：tests __ pass __ fail __
- 範例數字：__
- node --check：__
## 卡通圖
- dividend-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- dividend-step2.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
