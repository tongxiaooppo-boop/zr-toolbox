# 任務 ⑤：融資融券維持率精靈頁＋兩張卡通圖（照 ⑦ 樣板）

- 版本：2026-11-09 v1。上一份（⑦ v1）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/dca.js`（**樣板，結構照抄**：import、steps、result、table、example、頁尾）
- `tools/dca.html`（照抄成 `tools/margin.html`）
- `js/core/margin.js`（公式與回傳欄位，只准呼叫、不准改）
- `js/ui/wizard.js` 第 1–25 行（介面說明；`holdingsInput` 新增了 `side: 'short'`）
- `js/core/holdings.js` 第 12–16 行（`holdingSummary` 簽名）
- `docs/figures/cartoon/00-風格與角色.md`、`margin-01-融資追繳四格.md`、`margin-02-融資融券對照.md`（第 3 節生圖用）

## 1. 只准新增這些檔（其他檔一律不改）

- `tools/margin.html`：照抄 `tools/dca.html`，title「融資融券維持率｜正二工具箱」，script `../js/pages/margin.js`。
- `js/pages/margin.js`：照第 2 節。
- `docs/figures/cartoon/out/margin-comic.png`、`docs/figures/cartoon/out/margin-step1.png`：照第 3 節。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`tests/`、`js/ui/`、`js/data/`、`css/`、`img/`。覺得要改就停下寫進回報。

## 2. 頁面規格

`const tool = TOOLS.find(t => t.id === 'margin');`；`import { marginPlan, shortSummary } from '../core/margin.js'`、`import { holdingSummary } from '../core/holdings.js'`，`fmtX` 也從 `format.js` 引入，其他照 dca.js 需要的留。
共用小工具：`num`、`signed` 照 dca.js；`const named = c => STOCK_NAMES[c] ? \`${c} ${STOCK_NAMES[c]}\` : c;`；`const hasLong = s => s.kind !== 'short'`、`const hasShort = s => s.kind !== 'long'`；`const pctSigned = n => (n >= 0 ? '+' : '−') + fmtPct(Math.abs(n), 2)`。

### 步驟 1「你用了哪一種」
- hint：「打開券商 App 的『信用庫存』，看你是融資、融券，還是兩種都有。」
- about：「融資是借錢買股票，怕跌；融券是借股票先賣，怕漲。兩種都有時，券商看的是整戶維持率。」
- figure：`{ src: '../img/margin/step1.webp', alt: '卡通圖：融資和融券，差在哪？融資＝借錢買股票：自己出 40 萬、券商借 60 萬，買 100 萬股票；怕跌，股價跌約 22%，維持率碰到 130%。融券＝借股票先賣掉：賣出 10 萬，另交保證金 9 萬；怕漲，股價漲約 46%，維持率碰到 130%，漲多少虧多少，沒有上限。老師說：兩種都有，券商看的是整戶維持率，不是每一檔各自算。' }`
- 欄位：`withHelp(selectField({ id: 'kind', label: '你的信用交易', termId: 'margin-trading', options: [{ value: 'long', label: '只有融資（借錢買股）' }, { value: 'short', label: '只有融券（借股票先賣）' }, { value: 'both', label: '融資、融券都有' }], value: s.kind || 'long' }), { text: ['融資：信用庫存裡寫「融資」的股票。', '融券：信用庫存裡寫「融券」的股票。', '兩種都有：工具會算整戶維持率。'] })`
- read：`s.kind = document.getElementById('kind').value;`

### 步驟 2「你的信用庫存」
- hint：「照信用庫存填，代號填好現價會自動抓。同一邊有好幾檔就按「＋ 再加一檔」。」
- about：「這一步算出你的股票現在值多少。」
- 不放 figure。
- body：依序
  1. `hasLong(s)` 時：`holdingsInput({ id: 'longs', rows: s.longs?.length ? s.longs : [{}], label: '融資買進的股票' })`
  2. `hasShort(s)` 時：`holdingsInput({ id: 'shorts', rows: s.shorts?.length ? s.shorts : [{}], label: '融券賣出的股票', side: 'short' })`
  3. `tokenBox()`
- read：`s.longs = hasLong(s) ? readHoldings('longs') : []; s.shorts = hasShort(s) ? readHoldings('shorts') : [];`，接著 `if (s.longs.length) holdingSummary(s.longs); if (s.shorts.length) shortSummary(s.shorts);`（會丟錯誤訊息）。

### 步驟 3「借了多少、押了多少」
- hint：「成數看下單畫面；金額看對帳單或信用庫存，不知道就留白讓工具用成數算。」
- about：「這一步算出你欠券商多少（融資金額），押了多少（融券保證金）。」
- 不放 figure。
- body：
  - `hasLong(s)` 時：
    1. `withHelp(selectField({ id: 'loanratio', label: '融資成數', termId: 'margin-trading', options: [{ value: '0.6', label: '6 成（一般）' }, { value: '0.5', label: '5 成（個股被調降）' }, { value: '0.4', label: '4 成（個股被調降）' }], value: String(s.loanRatio ?? 0.6) }), { text: ['上市、上櫃股票最高 6 成：買 100 萬，自己出 40 萬、借 60 萬。', '股價異常的個股會被調降成 5 成、4 成，下單時券商會顯示。'] })`
    2. `numberInput` id `loan`，label「融資金額合計（選填）」，plain「信用庫存的『融資金額』加總；留白就用成數算」，value `s.loan`，suffix「元」，help：「券商會把融資金額取整數，用成數算的會跟對帳單差一點。」「有填就用你填的數字。」
  - `hasShort(s)` 時：
    3. `numberInput` id `deprate`，label「融券保證金成數」，termId `short-selling`，plain「最低 9 成，填 90」，value `s.depRate ?? 90`，suffix「%」，help：「融券賣出時另外繳的保證金，占賣出價款的比例。」「最低 9 成；個股可能被提高，以券商顯示為準。」
    4. `numberInput` id `deposit`，label「保證金合計（選填）」，plain「信用庫存的『保證金』加總；留白就用成數算」，value `s.deposit`，suffix「元」，help：「有填就用你填的數字。」
- read（只讀有畫出來的欄位；訊息照寫）：
  - long：`s.loanRatio = Number(document.getElementById('loanratio').value); s.loan = num('loan');`；`s.loan` 不是 NaN 且不是 >0 →「融資金額要大於 0；不知道就留白。」
  - short：`s.depRate = num('deprate'); s.deposit = num('deposit');`；depRate 不是 ≥1 且 ≤200 →「保證金成數填 1–200，常見 90。」；deposit 不是 NaN 且不是 >0 →「保證金要大於 0；不知道就留白。」

### 步驟 4「追繳規則與利息」
- hint：「追繳線、補回目標先用預設值，以券商通知為準。利息選填。」
- about：「這一步決定維持率掉到哪裡會出事、要補回到哪裡。」
- 不放 figure。
- body：
  1. `numberInput` id `call`，label「追繳線」，termId `margin-call`，plain「整戶維持率低於這裡會收到追繳；常見 130」，value `s.call ?? 130`，suffix「%」，help：「整戶維持率低於 130% 時，券商會發追繳通知。」「收到通知後通常要在 2 個交易日內補足，沒補足券商可以強制賣出（斷頭）。」
  2. `numberInput` id `target`，label「補回目標」，termId `account-ratio`，plain「被追繳後要補回到多少；常見 166」，value `s.target ?? 166`，suffix「%」，help：「補到整戶維持率回到 166% 以上，追繳才會解除。」「實際要補多少以券商通知為準。」
  3. `hasLong(s)` 時：`numberInput` id `rate`，label「融資年利率（選填）」，plain「常見 6–7，可以議價；留白不算利息」，value `s.rate`，suffix「%」，help：「按天計息、賣出時結算。」
  4. `hasLong(s)` 時：`numberInput` id `days`，label「打算融資幾天（選填）」，plain「例：30；留白不算利息」，value `s.days`，suffix「天」，help：「用日曆天算，跟年利率一起填才會算利息。」
- read：`s.call = num('call'); s.target = num('target');`；long 時 `s.rate = num('rate'); s.days = num('days');`，short only 時兩個設 NaN。
  call 不是 ≥100 →「追繳線填 100 以上，常見 130。」；target 不是 ≥ call →「補回目標不能低於追繳線，常見 166。」；rate 不是 NaN 且不在 0–100 →「年利率填 0–100，例：6.5。」；days 不是 NaN 且不是 ≥0 的整數 →「天數要是整數，例：30。」

### 結果
```js
const r = marginPlan({ longs: hasLong(s) ? s.longs : [], shorts: hasShort(s) ? s.shorts : [],
  loanRatio: s.loanRatio, loan: s.loan, depositRate: s.depRate / 100, deposit: s.deposit,
  call: s.call / 100, target: s.target / 100,
  rate: Number.isFinite(s.rate) ? s.rate / 100 : 0, days: Number.isFinite(s.days) ? s.days : 0 });
const L = r.long, S = r.short;
const ratioName = s.kind === 'both' ? '整戶維持率' : s.kind === 'long' ? '融資維持率' : '融券維持率';
```
價格一律 `p.toFixed(2)`；金額 `fmtMoney`；百分比 `fmtPct(…, 2)`。依序 `explain`：

1. **{ratioName}** `fmtPct(r.ratio, 2)`，tone：`r.called` → `bad`；`r.belowTarget` → `warn`；否則 `ok`。
   - how：kind `long`：「融資股票現在值 {fmtMoney(L.value)} ÷ 融資金額 {fmtMoney(r.loan)}。」；`short`：「(融券賣出價款 {fmtMoney(S.proceeds)} ＋ 保證金 {fmtMoney(r.deposit)}) ÷ 現在買回來要 {fmtMoney(S.value)}。」；`both`：「(融資股票市值 {fmtMoney(L.value)} ＋ 融券賣出價款 {fmtMoney(S.proceeds)} ＋ 保證金 {fmtMoney(r.deposit)}) ÷ (融資金額 {fmtMoney(r.loan)} ＋ 融券股票市值 {fmtMoney(S.value)})。」
   - means：called「低於追繳線 {call}%，會收到追繳通知。」；belowTarget「還沒低於追繳線 {call}%，但已經低於補回目標 {target}%，離追繳不遠。」；其他「高於補回目標 {target}%，目前安全。」；kind `both` 再加「券商看的是整戶，不能把每一檔的維持率平均。」
2. **補現金（回到 {target}%）**（`r.called` 才顯示）`fmtMoney(r.topup)`，tone `bad`；how：「{target}% × {fmtMoney(r.debt)} − {fmtMoney(r.collateral)}。補進去的現金加在分子。」；todo：「收到追繳通知後，通常要在 2 個交易日內補足；沒補足，券商可以強制賣出（斷頭）。實際金額以券商通知為準。」
3. **或：償還融資**（`r.called && r.loan > 0` 才顯示）`fmtMoney(r.repay)`，tone：`r.repayEnough` → `warn`，否則 `bad`；how：「{fmtMoney(r.debt)} − {fmtMoney(r.collateral)} ÷ {target}%。還錢讓分母變小。」；means：`r.repayEnough` →「同樣回到 {target}%，還融資要的錢比補現金少，但融資部位會變小。」；否則 →「要還的比融資金額 {fmtMoney(r.loan)} 還多，光還融資補不回去，要補現金或買回融券的股票。」
4. **融資股票再跌多少會被追繳**（`L` 才顯示）值：`r.longDrop > 0 ? fmtPct(r.longDrop, 2) : '已經低於追繳線'`，tone：`r.longDrop > 0.1 ? 'ok' : r.longDrop > 0 ? 'warn' : 'bad'`；how：「假設融資的股票一起跌{kind 為 both 時『、融券的股票不動』}，維持率碰到 {call}% 的參考價：」＋ `r.perStock.filter(p => p.side === 'long')` 每檔「{named(code)} {callPrice.toFixed(2)} 元（比買進價 {pctSigned(vsEntry)}）」用「；」串起來，結尾「。」；means：「維持率由券商收盤後計算，實際以券商通知為準。融資 6 成時，大約從買進價跌 22% 就碰到 130%。」
5. **融券股票再漲多少會被追繳**（`S` 才顯示）值：`r.shortRise > 0 ? fmtPct(r.shortRise, 2) : '已經低於追繳線'`，tone：`r.shortRise > 0.1 ? 'ok' : r.shortRise > 0 ? 'warn' : 'bad'`；how：同上改「一起漲」「{kind 為 both 時『、融資的股票不動』}」，每檔「{named(code)} {callPrice.toFixed(2)} 元（比融券賣出價 {pctSigned(vsEntry)}）」；means：「融券怕漲：股價漲多少就虧多少，沒有上限。」
6. **融資自備款**（`L` 才顯示）`fmtMoney(r.ownCash)`；how：「買進成本 {fmtMoney(L.cost)} − 融資金額 {fmtMoney(r.loan)}。槓桿＝成本 ÷ 自備款＝{fmtX(r.leverage)}。」；means：「融資部位現在 {signed(L.gain)}，等於自備款的 {pctSigned(L.gain / r.ownCash)}。股價每跌 1%，自備款大約虧 {r.leverage.toFixed(2)}%。」
7. **融資利息**（`L && r.interest > 0` 才顯示）`fmtMoney(r.interest)`；how：「{fmtMoney(r.loan)} × {rate}% × {days} 天 ÷ 365。」；means：「按天計息、賣出時結算；不算進維持率，但會吃掉獲利。」
8. **融券損益**（`S` 才顯示）`signed(S.gain)`，tone 依正負 `ok`／`bad`；how：「融券賣出價款 {fmtMoney(S.proceeds)} − 現在買回來要 {fmtMoney(S.value)}。」；means：「還沒扣手續費、證交稅和融券手續費（借券費）。」

接著 `h('h3', {}, '一起漲跌時的維持率')`，`h('p', { class: 'tip' }, '假設你所有融資、融券的股票從現價一起漲跌同樣幅度。')`，表格 `h('table', { class: 'trade-table' }, …)`，欄位：`漲跌（從現價）`、`{ratioName}`、`狀態`；每列 `r.rows` 一列：`row.move === 0 ? '現在' : (row.move > 0 ? '+' : '−') + Math.round(Math.abs(row.move) * 100) + '%'`、`fmtPct(row.ratio, 2)`、`row.called ? '追繳' : row.ratio < s.target / 100 ? '注意' : '安全'`。

最後 `h('div', { class: 'note' }, …)` 固定四條：
- 「維持率由券商收盤後計算，盤中跌破不一定馬上通知；收到追繳通知後通常 2 個交易日內要補足，以券商為準。」
- 「券商會把融資金額、保證金取整數；融券價款實際會先扣手續費、證交稅和借券費。這裡沒算，所以和對帳單會差一點。」
- 「除權息前幾個交易日，券商會先用扣掉股利的價格算維持率，維持率可能突然變低。」
- 「融資利率依券商，可以議價；融券還有強制回補日（例如股東會前），以券商通知為準。」

### 範例與頁尾
```js
const example = { kind: 'long', longs: [{ code: '2330', shares: 1000, buyPrice: 1000, nowPrice: 760 }], shorts: [],
  loanRatio: 0.6, loan: NaN, depRate: 90, deposit: NaN, call: 130, target: 166, rate: 6.5, days: 30 };
```
範例結果必須是：融資維持率 126.67%（紅）、補現金 NT$ 236,000、償還融資 NT$ 142,169、追繳參考價「2330 台積電 780.00 元（比買進價 −22.00%）」且值顯示「已經低於追繳線」、自備款 NT$ 400,000、槓桿 2.50 倍、融資部位 −NT$ 240,000（自備款的 −60.00%）、利息 NT$ 3,205、沒有融券項、表格 7 列（+20% 那列 152.00% 注意、+30% 那列 164.67% 注意）。

頁尾照 dca.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片放
`figure({ src: '../img/margin/comic.webp', alt: '四格漫畫：一、小安融資買某檔股票 100 萬，自己出 40 萬、券商借 60 萬。二、老師說維持率＝股票市值 ÷ 融資金額，100 萬 ÷ 60 萬約 166.67%，越高越安全。三、股價跌 24%，76 萬 ÷ 60 萬約 126.67%，跌破 130%，收到追繳通知，2 個交易日內要補錢。四、補回 166% 有兩種做法：補現金 23.6 萬，或還融資約 14.2 萬；老師說沒在期限內補足，券商可以強制賣出（斷頭）。融資 6 成、追繳線 130%、補回 166% 是常見數字，以券商通知為準。' })`
加三段 `h('p')`：
- 「融資＝跟券商借錢買股票，上市櫃最高借 6 成。融券＝跟券商借股票先賣，要另繳 9 成保證金。」
- 「融資怕跌、融券怕漲。維持率跌破 130% 會被追繳，要補回 166% 左右。」
- 「補現金讓分子變大，還融資讓分母變小；同樣補回目標，還融資要的錢比較少。」

最後 `disclaimer('general')`。`img/margin/` 的 webp 由 Opus 轉檔放入，你不要放、不要轉檔。

## 3. 生兩張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/margin-01-融資追繳四格.md` | `docs/figures/cartoon/out/margin-comic.png` |
| `docs/figures/cartoon/margin-02-融資融券對照.md` | `docs/figures/cartoon/out/margin-step1.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/margin.js').then(m=>{const r=m.marginPlan({longs:[{code:'2330',shares:1000,buyPrice:1000,nowPrice:760}],loanRatio:0.6,call:1.3,target:1.66,rate:0.065,days:30});console.log((r.ratio*100).toFixed(2),Math.round(r.topup),Math.round(r.repay),r.perStock[0].callPrice.toFixed(2),r.ownCash,Math.round(r.interest),r.rows.length)})"
node --check js/pages/margin.js
```
預期：`ℹ tests 87`、`ℹ pass 87`、`ℹ fail 0`；第二行 `126.67 236000 142169 780.00 400000 3205 7`；第三行無輸出。

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
- margin-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- margin-step1.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
