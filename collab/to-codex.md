# 任務 ②：「50/50 觸發提醒」改精靈頁＋兩張卡通圖（照 ④ 樣板）

- 版本：2026-11-09 v1（框架 v5.6）。上一份（⑪）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/pledge.js`（**樣板，結構照抄**：steps、`num`、`named`、`withHelp(selectField(...))`、結果 explain、頁尾）
- `js/ui/wizard.js` 第 1–35 行（介面說明）；`holdingsInput`／`readHoldings`／`tokenBox` 怎麼用看樣板就好
- `js/core/trigger.js`（`trigger5050Plan` 的回傳欄位，只准呼叫、不准改）
- `js/net/price.js` 的 `fetchCloseOn`、`getToken`、`setToken`（只准呼叫）
- `js/pages/trigger5050.js`（舊版 ②，**整檔改寫**）
- `docs/figures/cartoon/00-風格與角色.md`、`trigger-01-50對50四格.md`、`trigger-02-基準價怎麼找.md`（第 3 節生圖用）

## 1. 只准改／新增這些檔（其他檔一律不改）

- `js/pages/trigger5050.js`：整檔改寫成精靈（第 2 節）。
- `docs/figures/cartoon/out/trigger-comic.png`、`trigger-step2.png`（第 3 節）。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`js/net/`、`js/ui/`、`tests/`、`js/data/`、`css/`、`img/`、`tools/`、`docs/`（`docs/figures/cartoon/out/` 除外）。覺得要改就停下寫進回報。

## 2. 頁面：`js/pages/trigger5050.js`

檔頭註解：「工具② 50/50 觸發提醒（v5.6 精靈）。公式只在 core/trigger.js 的 trigger5050Plan；依日期抓價用 net/price.js 的 fetchCloseOn。」
import：`h, toolHeader, selectField, disclaimer, figure` 從 components.js；`wizard, holdingsInput, readHoldings, tokenBox, numberInput, explain, withHelp` 從 wizard.js；`holdingSummary` 從 core/holdings.js；`trigger5050Plan` 從 core/trigger.js；`fetchCloseOn, getToken, setToken` 從 net/price.js；`parseNum, fmtMoney, fmtPct` 從 format.js；`STOCK_NAMES`、`TOOLS`。
`const tool = TOOLS.find(t => t.id === 'trigger5050');`；`num`、`named` 照 pledge.js；另加 `const price = n => \`${+n.toFixed(2)} 元\`;`、`const link = (href, text) => h('a', { href }, text);`

state 欄位：`lever`（[{code, shares, buyPrice, nowPrice}]，只有 1 列）、`baseFrom`（'buy'|'date'|'manual'）、`baseDate`（'YYYY-MM-DD' 或 ''）、`basePrice`、`cash`、`threshold`（%，數字或 NaN）。

### 步驟 1「你的正二」
- hint：「只填這個 50/50 策略裡的那一檔正二。打開券商 App 的庫存，照下圖找數字。」
- about：「這一步記下正二現在值多少。現價填好代號會自動抓最近收盤價。」
- figure：照 pledge.js 步驟 1 的 `../img/common/step-holdings.svg`，alt 照抄。
- body：`holdingsInput({ id: 'lever', rows: s.lever || [{}], max: 1, label: '你的正二' })`、`tokenBox()`
- read：`s.lever = readHoldings('lever'); holdingSummary(s.lever);`

### 步驟 2「基準價：上次配回時的價格」
- hint：「從沒配回過就用買入價；配回過就填那天的日期，工具會抓那天的收盤價。」
- about：「漲跌一半是跟「基準價」比，不是跟買入價比。每配回一次，基準價就換成那天的價格。」
- figure：`{ src: '../img/trigger5050/step2.webp', alt: '插圖：基準價＝上次配回各半時的正二價格。小安說我忘了上次是多少錢。三條路：一、從沒配回過，用當初的買入價（券商 App 庫存的成本均價）；二、配回過、記得日期，填那天的日期，工具自動抓那天的收盤價，那天沒開盤就用前一個交易日；三、自己有記下價格，直接填。老師提醒：中間如果有分割（1 股拆成好幾股），舊價格要換算才能比，不然會差很多倍。' }`
- body（依序）：
  1. `withHelp(selectField({ id: 'from', label: '上次配回是什麼時候', termId: 'base-price', options: [{ value: 'buy', label: '從沒配回過（用買入價）' }, { value: 'date', label: '配回過，我記得日期' }, { value: 'manual', label: '我有記下當時的價格' }], value: s.baseFrom || 'buy' }), { text: ['從沒配回過：基準價就是你當初的買入價。', '配回過：填配回那天的日期，工具抓那天的收盤價當基準價。', '有記下價格：直接在下面填。'] })`
  2. 日期欄（`id: 'date-field'` 的 `.field`，`withHelp`）：label「上次配回的日期」、`small.plain-sub`「填好會自動抓那天的收盤價」、`h('input', { id: 'baseDate', type: 'date', value: s.baseDate || '', max: 今天 YYYY-MM-DD })`，下面 `h('small', { id: 'date-status', class: 'holding-status', 'aria-live': 'polite' })`；help：「做完配回那天的日期。」「那天沒開盤（假日、颱風假），會用前一個交易日的收盤價。」。只有 `from` 是 `date` 時顯示（其他時候 `hidden`）。
  3. `numberInput({ id: 'basePrice', label: '基準價', termId: 'base-price', plain: '自動帶入，也可以自己改', value: s.basePrice, suffix: '元', help: { text: ['之後漲跌幾 % 都跟這個價格比。', '用券商 App 查到的價格也可以直接改在這裡。'] } })`
- 互動（在 body 裡掛事件，閉包用 `s`）：
  - `from` 改成 `buy` → `basePrice` 填 `s.lever[0].buyPrice`、隱藏日期欄；改成 `date` → 顯示日期欄（日期已有值就照下一條抓一次）；改成 `manual` → 隱藏日期欄、`basePrice` 不動。
  - 第一次畫這一步時：`s.basePrice` 沒有值且 `from` 是 `buy` → 先帶入買入價。
  - 日期 `change` → `date-status`「查詢中…」→ `fetchCloseOn(s.lever[0].code, 日期, { token: getToken() })`；用 `seq` 計數防舊回應（照 wizard.js 抓價的寫法）。
    - `ok`：`basePrice` 填 `r.close`；狀態「抓到 {r.date} 的收盤價 {r.close} 元。」（`r.date !== 日期` 時加「（{日期} 沒開盤，用前一個交易日）」）；`r.clearToken` → `setToken('')`。
    - 不 ok：狀態顯示 `r.message`，`basePrice` 不動。
- read：
  ```js
  s.baseFrom = document.getElementById('from').value;
  s.baseDate = document.getElementById('baseDate').value;
  s.basePrice = num('basePrice');
  if (!(s.basePrice > 0)) throw new Error(s.baseFrom === 'date' ? '基準價還沒抓到：確認日期，或直接手動填基準價。' : '基準價要大於 0。');
  ```

### 步驟 3「策略現金與門檻」
- hint：「現金只算留給這個策略的錢，不是你全部的存款。」
- about：「配回時用「正二市值＋策略現金」各分一半。門檻是漲跌多少要動，大仁原文用 50%。」
- figure：不放。
- body：
  1. `numberInput({ id: 'cash', label: '策略現金', termId: 'rebalance', plain: '留給這個策略、還沒買正二的錢，例：100000', value: s.cash, suffix: '元', help: { text: ['開始時跟正二各一半的那筆現金，之後配回時進出的錢也算在這裡。', '其他用途的存款不要算進來。'] } })`
  2. `numberInput({ id: 'threshold', label: '觸發門檻（選填）', plain: '漲或跌超過幾 % 就配回；留白＝50', value: s.threshold, suffix: '%', help: { text: ['大仁 50/50 原文：正二相對基準價漲或跌 50% 就配回。', '想更常配回可以改小（例：30），可填 10–90。'] } })`
- read：`s.cash = num('cash'); s.threshold = num('threshold');`；`!(s.cash >= 0)` →「策略現金要填 0 以上的數字；沒有就填 0。」（門檻範圍交給 core 檢查）

### 結果
```js
const L = s.lever[0], t = Number.isNaN(s.threshold) ? 50 : s.threshold;
const r = trigger5050Plan({ shares: L.shares, nowPrice: L.nowPrice, basePrice: s.basePrice, cash: s.cash, threshold: t / 100 });
const name = named(L.code);
```
依序 `explain`：

1. **{name} 相對基準價** value `fmtPct(r.change)`（正數前面加「+」），tone `r.hit ? 'warn' : 'info'`；how：「現價 {price(L.nowPrice)} ÷ 基準價 {price(s.basePrice)} − 1。」；means：「漲跌是跟上次配回時比，不是跟買入價比。」
2. **到門檻了嗎** value `r.hit ? (r.direction === 'up' ? '漲到了，要配回' : '跌到了，要配回') : '還沒，不用動'`，tone `r.hit ? 'warn' : 'ok'`；how：「門檻 {t}%：漲到 {price(r.upPrice)}（{price(s.basePrice)} ×（1＋{t}%））或跌到 {price(r.downPrice)}（{price(s.basePrice)} ×（1−{t}%））才要動。」；means：`r.hit` →「用現在的總額配回正二、現金各半。」；否則「價格在 {price(r.downPrice)}～{price(r.upPrice)} 之間都不用動，下次再來看。」
3. （只有 `r.hit`）**{r.tradeShares >= 0 ? '要買進' : '要賣出'}** value「{Math.abs(r.tradeShares).toLocaleString('en-US')} 股」，tone `warn`；how：「正二 {L.shares} 股 × {price(L.nowPrice)}＝{fmtMoney(r.value)}，加現金 {fmtMoney(s.cash)}＝{fmtMoney(r.total)}，各一半＝{fmtMoney(r.target)}；（{fmtMoney(r.target)} − {fmtMoney(r.value)}）÷ {price(L.nowPrice)}，{買進 ? '無條件捨去' : '四捨五入'}。」；means：「約 {fmtMoney(Math.abs(r.tradeAmount))}。做完後正二約 {fmtMoney(r.leverAfter)}、現金約 {fmtMoney(r.cashAfter)}。」＋（買進時）「跌到時補進去的錢，如果之後繼續跌，一樣會跟著跌。」；todo：`['下單前用 ', link('cost.html', '⑨ 買賣成本與損益'), ' 算手續費和稅；這裡沒算。']`
4. **下次的觸發價** value「{price(r.nextDown)}／{price(r.nextUp)}」，tone `info`；how：`r.hit` →「配回後基準價換成今天的 {price(r.newBase)}；× (1 ± {t}%)。」，否則「基準價還是 {price(r.newBase)}；× (1 ± {t}%)。」；means：「跌到 {price(r.nextDown)} 或漲到 {price(r.nextUp)} 再來配回。」；todo：`r.hit ? '把今天的日期和價格記下來，下次第 2 步填這個日期就好。' : null`（null 就不放 todo）
5. （只有 `r.suspectSplit`）**價格差很多倍** value「請確認」，tone `bad`；means：「現價和基準價差 5 倍以上，中間可能有分割或合併。工具抓的是當天的原始價格，沒有換算；請到第 2 步改成換算後的價格。」

最後 `h('div', { class: 'note' }, h('p', {}, '只算這個策略裡的正二和現金；沒算手續費和稅。'), h('p', {}, '做法出自大仁「50 正 2 槓桿 ETF 搭配再平衡」：一半正二、一半現金，正二相對基準價漲跌 50% 就配回。'))`

### 範例與頁尾
```js
const example = { lever: [{ code: '00631L', shares: 5000, buyPrice: 20, nowPrice: 30.5 }], baseFrom: 'buy', baseDate: '', basePrice: 20, cash: 100000, threshold: NaN };
```
範例結果必須是：相對基準價 +52.5%；漲到了，要配回（漲到 30 元或跌到 10 元）；要賣出 861 股，約 NT$ 26,261，做完正二約 NT$ 126,240、現金約 NT$ 126,261；下次的觸發價 15.25 元／45.75 元；沒有「價格差很多倍」。

頁尾照 pledge.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片：
- `figure({ src: '../img/trigger5050/comic.webp', alt: '四格漫畫：一、一開始正二 5,000 股 × 20 元＝10 萬、現金 10 萬，記下 20 元當基準價。二、20 × 1.5＝30 元漲到要動，20 × 0.5＝10 元跌到也要動，中間不用管。三、漲到 30.5 元：正二 152,500 加現金 100,000＝252,500，各一半 126,250，賣 861 股收回約 26,261 元。四、新基準價 30.5 元，下次漲到 45.75 元或跌到 15.25 元；跌到時反過來拿現金買正二，買進去的錢之後還可能繼續跌。沒算手續費和稅；賣出股數四捨五入。' })`
- 舊圖保留：`figure({ src: '../img/trigger5050/split-5050.svg', alt: …照舊版原文, caption: …照舊版原文 })`
- 兩段 `h('p')` 照舊版原文（「這是大仁 50/50 的做法…」「漲到時會賣掉一些正二…」）。
- `h('p', {}, ['其他槓桿做法（532、質押、目標倍數）的比較，看 ', link('exposure.html', '⑪ 正二要買多少'), ' 頁尾的對照表。'])`

最後 `disclaimer('general')`。`img/trigger5050/` 的 webp 由 Opus 轉檔放入，你不要放、不要轉檔。

## 3. 生兩張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/trigger-01-50對50四格.md` | `docs/figures/cartoon/out/trigger-comic.png` |
| `docs/figures/cartoon/trigger-02-基準價怎麼找.md` | `docs/figures/cartoon/out/trigger-step2.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/trigger.js').then(m=>{const r=m.trigger5050Plan({shares:5000,nowPrice:30.5,basePrice:20,cash:100000});console.log(r.change,r.hit,r.tradeShares,r.tradeAmount,r.cashAfter,r.nextDown,r.nextUp,r.suspectSplit)})"
node --check js/pages/trigger5050.js
```
預期：`ℹ tests 122`、`ℹ pass 122`、`ℹ fail 0`；第二行 `0.5249999999999999 true -861 -26260.5 126260.5 15.25 45.75 false`；第三行無輸出。

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
- trigger-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- trigger-step2.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
