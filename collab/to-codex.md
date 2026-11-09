# 任務 ⑦：定期定額與年化報酬精靈頁＋兩張卡通圖（照 ⑨⑩ 樣板）

- 版本：2026-11-09 v1。上一份（⑩ v2）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/dividend.js`（**樣板，結構照抄**：import、steps、result、example、頁尾）
- `js/pages/pledge.js` 第 100–108 行（表格寫法 `trade-table`）
- `tools/dividend.html`（照抄成 `tools/dca.html`）
- `js/core/dca.js`（公式，只准呼叫、不准改）
- `js/core/holdings.js` 第 1–5 行（`CODE_RE`）
- `docs/figures/cartoon/00-風格與角色.md`、`dca-01-每月存五千四格.md`、`dca-02-月報酬不是除以12.md`（第 3 節生圖用）

## 1. 只准新增這些檔（其他檔一律不改）

- `tools/dca.html`：照抄 `tools/dividend.html`，title「定期定額與年化報酬｜正二工具箱」，script `../js/pages/dca.js`。
- `js/pages/dca.js`：照第 2 節。
- `docs/figures/cartoon/out/dca-comic.png`、`docs/figures/cartoon/out/dca-step3.png`：照第 3 節。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`tests/`、`js/ui/`、`js/data/`、`css/`、`img/`。覺得要改就停下寫進回報。

## 2. 頁面規格

`const tool = TOOLS.find(t => t.id === 'dca');`；`import { dcaPlan } from '../core/dca.js'`、`import { holdingSummary, CODE_RE } from '../core/holdings.js'`，其他照 dividend.js 需要的留。

### 步驟 1「要扣哪一檔」
- hint：「填你要定期定額的股票或 ETF 代號，現價會自動抓。已經有這檔的，股數和買入價也填，會一起算進去。」
- about：「這一步確定要買哪一檔、現在已經有多少。」
- figure：同 dividend.js 步驟 1 的 `../img/common/step-holdings.svg`（alt 照抄）。
- 欄位：
  1. `selectField` id `have`，label「這檔你已經有了嗎」，options `no`「還沒有，從零開始」、`yes`「已經有一些」，預設 `s.have || 'no'`。`withHelp`：「還沒有：只填代號就好，股數、買入價留空。」「已經有：照券商 App 庫存填股數和買入價，現在的市值會當成起始金額一起滾。」
  2. `holdingsInput({ id: 'hold', rows: s.holdings || [{}], max: 1, label: '要扣款的那一檔' })`
  3. `tokenBox()`
- read：`s.have = …value`；`const [x] = readHoldings('hold')`；
  - `yes`：`holdingSummary([x])`（會丟錯誤訊息），`s.initial = x.shares * x.nowPrice`。
  - `no`：`if (!CODE_RE.test(x.code)) throw new Error('股票代號格式不對，例：0050、00631L。')`；`s.initial = 0`。
  - `s.holdings = [x]`。

### 步驟 2「每月扣多少」
- hint：「填每次扣款金額和券商的手續費設定。不知道就先用預設值。」
- about：「這一步決定每月投入多少、被收多少手續費。」
- 不放 figure。
- 欄位：
  1. `numberInput` id `monthly`，label「每月投入」，termId `dca`，plain「每個月扣款多少錢」，value `s.monthly ?? ''`，suffix「元」，help：「一個月扣好幾次（例：6、16、26 日），把每次金額加起來填。」「券商通常有最低扣款金額（常見 1,000 元或 3,000 元），依券商。」
  2. `numberInput` id `stepup`，label「每年調升」，plain「薪水變多想多扣就填；不調填 0」，value `s.stepUp ?? 0`，suffix「%」，help：「例：填 5，第 2 年每月投入變成 1.05 倍，第 3 年再乘 1.05。」
  3. `numberInput` id `discount`，label「手續費折扣」，termId `broker-fee`，plain「2.8 折填 2.8；沒打折填 10」，value `s.discount ?? 10`，suffix「折」，help：「定期定額的手續費常有專屬優惠，看券商的定期定額說明。」
  4. `numberInput` id `minfee`，label「每次最低手續費」，plain「定期定額常見 1 元」，value `s.minFee ?? 1`，suffix「元」，help：「手續費算出來比這個少，就收這個數字。」
- read（訊息照寫）：monthly 不是 >0 →「每月投入要大於 0，例：5000。」；stepUp 不是 0–100 →「每年調升填 0–100，不調升填 0。」；discount 不是 >0 且 ≤10 →「折扣填 0.1–10，例：2.8；沒打折填 10。」；minFee 不是 ≥0 →「最低手續費填 0 以上的數字，例：1。」

### 步驟 3「假設報酬與年數」
- hint：「報酬率是你自己設的假設，不是預測。可以試幾個不同的數字比較。」
- about：「這一步決定要滾多久、用多少報酬率算。年報酬會用複利換成每月報酬。」
- figure：`{ src: '../img/dca/step3.webp', alt: '卡通圖：年報酬 6%，每個月是多少？直接除以 12 得每月 0.5%，一年滾起來約 6.17%，算多了。用複利換算：(1＋6%) 開 12 次方根 − 1，每月約 0.487%，一年滾起來剛好 6%。老師說：每個月賺的錢會繼續滾，所以每月要比 0.5% 少一點。本工具用複利換算；報酬率是你自己設的假設，不是預測。' }`
- 欄位：
  1. `numberInput` id `years`，label「投資幾年」，plain「填整數，例：20」，value `s.years ?? ''`，suffix「年」，help：「定期定額適合長期；年數越長，複利的效果越明顯。」
  2. `numberInput` id `ret`，label「假設年報酬」，termId `compound-interest`，plain「自己設的假設，例：6」，value `s.ret ?? ''`，suffix「%」，help：「這是假設每年都一樣的報酬，真實市場會有漲有跌，也可能虧損。」「ETF 的內扣費用已經反映在淨值裡，用歷史報酬當假設時不要再扣一次。」
  3. `selectField` id `timing`，label「每月什麼時候扣款」，options `start`「月初（當月就開始滾）」、`end`「月底（下個月才開始滾）」，預設 `s.timing || 'start'`。
- read：years 不是 1–60 的整數 →「投資年數填 1–60 的整數，例：20。」；ret 不是 >−99 且 <99 →「假設年報酬填 −99 到 99，例：6。」

### 結果
```js
const [x] = s.holdings;
const r = dcaPlan({ initial: s.initial, monthly: s.monthly, years: s.years, annualReturn: s.ret / 100, timing: s.timing,
  stepUp: s.stepUp / 100, discount: s.discount / 10, minFee: s.minFee });
const last = r.rows[r.rows.length - 1];
```
名稱照 dividend.js 用 `STOCK_NAMES`。依序 `explain`（金額 `fmtMoney`、百分比 `fmtPct(…, 2)`）：

1. **{years} 年後的資產** `fmtMoney(r.finalValue)`；how：「{name}：每月 {monthly} 元，共 {months} 次；年報酬 {ret}% 換成每月 {fmtPct(r.monthlyRate, 3)}（(1＋{ret}%) 開 12 次方根 − 1）。{timing 為 start：『月初投入，當月就開始滾。』／end：『月底投入，下個月才開始滾。』}」；means：「用固定報酬算的情境，不是預測；真實市場有漲有跌，結果可能差很多。」
2. **投入本金** `fmtMoney(r.principal)`；how：initial>0 時開頭「目前持股市值 {fmtMoney(initial)} ＋ 」，接「每月投入合計 {fmtMoney(r.contributed)}」；stepUp>0 時再加「（每年調升 {stepUp}%，最後一年每月 {last.amount} 元）」。；means：「你自己放進去的錢。」
3. **手續費合計** `fmtMoney(r.fees)`；how：「第 1 年每次 {r.rows[0].amount} 元 × 0.1425%{discount<10 時 ` × ${discount} 折`}，元以下捨去、最低 {minFee} 元＝{r.rows[0].fees / 12} 元，共扣 {months} 次。」；means：「手續費另外付，不從扣款金額裡扣（依券商可能不同）。」
4. **累積賺到** `signed(r.gain)`（`signed` 照 dividend.js），tone 依正負 `ok`／`bad`；how：「{years} 年後資產 − 投入本金 − 手續費。」；means：「占你總共付出的 {fmtPct(r.gainPct, 2)}。」
5. **如果一開始一次投入** `fmtMoney(r.lumpValue)`；how：「同樣 {fmtMoney(r.principal)} 第一天全部投入：{fmtMoney(r.principal)} × (1＋{ret}%)^{years}；扣一次手續費 {fmtMoney(r.lumpFee)}，賺 {signed(r.lumpGain)}。」；means 依 ret：>0「報酬為正時，越早投入滾越久，所以一次投入比較多；但前提是錢一開始就在手上，定期定額通常是因為每月才有薪水。」；<0「報酬為負時，分批投入虧得比較少。」；=0「報酬為 0 時兩種一樣，只差手續費。」
6. **年化報酬別算錯** `fmtPct(s.ret / 100, 2)`，tone `warn`；how：「在這個情境裡，每一筆錢都是年 {ret}%。如果用『投入本金 {fmtMoney(r.principal)} → 期末 {fmtMoney(r.finalValue)}』硬套年化公式，會算出 {fmtPct(r.naiveCagr, 2)}。」；means：「後面投入的錢只放了很短時間，所以硬算會偏低。定期定額要看年化，要用每筆錢的投入日期算（IRR），不要用單筆的年化公式。」
7. **每月約可買**（`x.nowPrice > 0` 才顯示）`{Math.floor(r.rows[0].amount / x.nowPrice).toLocaleString('en-US')} 股`；how：「第 1 年每月 {r.rows[0].amount} 元 ÷ 現價 {x.nowPrice} 元，取整數。」；means：「台股定期定額通常買零股；每月成交價不同，買到的股數也會變。」

接著 `h('h3', {}, '逐年變化')` ＋表格 `h('table', { class: 'trade-table' }, …)`，欄位：`年`、`每月投入（元）`、`累計投入（元）`、`累計手續費（元）`、`年底資產（元）`，每列一年，金額 `Math.round(…).toLocaleString('en-US')`；累計投入要加上 `s.initial`（＝本金口徑）。

最後 `h('div', { class: 'note' }, …)` 固定四條：
- 「這是固定報酬的情境，沒有模擬漲跌的先後順序；同樣平均報酬，先跌後漲和先漲後跌的結果不一樣。」
- 「配息如果沒有再投入，期末資產會比這裡少。」
- 「扣款日遇到休市會順延；最低扣款金額、手續費以券商為準。」
- 「證交稅只在賣出時收，這裡沒有算賣出。」

### 範例與頁尾
```js
const example = { have: 'no', holdings: [{ code: '0050', nowPrice: 50 }], initial: 0,
  monthly: 5000, stepUp: 0, discount: 10, minFee: 1, years: 20, ret: 6, timing: 'start' };
```
範例結果必須是：期末資產 NT$ 2,278,229、投入本金 NT$ 1,200,000、手續費 NT$ 1,680、累積賺到 +NT$ 1,076,549、一次投入 NT$ 3,848,563、硬算年化 3.26%、每月約可買 100 股、表格 20 列。

頁尾照 dividend.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片放
`figure({ src: '../img/dca/comic.webp', alt: '四格漫畫：一、小安在券商 App 設定某檔 ETF 每月 6 日扣款 5,000 元。二、20 年總共投入 5,000 元 × 12 個月 × 20 年＝1,200,000 元，手續費共 1,680 元。三、假設每年 6%，20 年後約 2,278,000 元，賺的錢約 1,077,000 元。四、老師說：6% 是假設不是保證；早投入的錢滾得比較久；真實市場有漲有跌，可能賠錢；這是用固定報酬算的情境，不是預測。' })`
加三段 `h('p')`：
- 「定期定額＝每月固定日期、固定金額自動買進，不用挑時間。它不保證賺錢，賺多少還是看你買的東西。」
- 「複利：賺到的錢繼續放著，下一期連它一起賺。所以時間越長，『賺的錢』占的比例越大。」
- 「年化報酬只適用一筆錢從頭放到尾；定期定額每筆錢放的時間不同，不能拿總本金直接套。」

最後 `disclaimer('general')`。`img/dca/` 的 webp 由 Opus 轉檔放入，你不要放、不要轉檔。

## 3. 生兩張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/dca-01-每月存五千四格.md` | `docs/figures/cartoon/out/dca-comic.png` |
| `docs/figures/cartoon/dca-02-月報酬不是除以12.md` | `docs/figures/cartoon/out/dca-step3.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/dca.js').then(m=>{const r=m.dcaPlan({monthly:5000,years:20,annualReturn:0.06,timing:'start',discount:1,minFee:1});console.log(Math.round(r.finalValue),r.principal,r.fees,Math.round(r.gain),Math.round(r.lumpValue),(r.naiveCagr*100).toFixed(2),r.rows.length)})"
node --check js/pages/dca.js
```
預期：`ℹ tests 80`、`ℹ pass 80`、`ℹ fail 0`；第二行 `2278229 1200000 1680 1076549 3848563 3.26 20`；第三行無輸出。

## 5. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

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
- dca-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- dca-step3.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
