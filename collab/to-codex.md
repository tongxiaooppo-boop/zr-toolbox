# 任務 ⑮：平均成本與攤平精靈頁＋兩張卡通圖（照 ⑨ 樣板）

- 版本：2026-11-09 v1。上一份（⑲ v1）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。
- 暫存檔、一次性腳本只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/cost.js`（**樣板，結構照抄**：KIND 選單、折扣、低消、`feeHow` 的寫法、結果 notes）
- `tools/cost.html`（照抄成 `tools/avgcost.html`）
- `js/core/avgcost.js`（公式與回傳欄位，只准呼叫、不准改）
- `js/ui/wizard.js` 第 1–30 行（介面說明；本次新增 `holdingsInput` 的 `side: 'lot'` 與 `lotsInput`／`readLots`）
- `docs/figures/cartoon/00-風格與角色.md`、`avgcost-01-越跌越買四格.md`、`avgcost-02-均價要照股數算.md`（第 3 節生圖用）

## 1. 只准新增這些檔（其他檔一律不改）

- `tools/avgcost.html`：照抄 `tools/cost.html`，title「平均成本與攤平｜正二工具箱」，script `../js/pages/avgcost.js`。
- `js/pages/avgcost.js`：照第 2 節。
- `docs/figures/cartoon/out/avgcost-comic.png`、`docs/figures/cartoon/out/avgcost-step1.png`：照第 3 節。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`tests/`、`js/ui/`、`js/data/`、`css/`、`img/`。覺得要改就停下寫進回報。

## 2. 頁面規格（`js/pages/avgcost.js`）

`const tool = TOOLS.find(t => t.id === 'avgcost');`
import：`h, toolHeader, selectField, disclaimer, figure` 從 components.js；`wizard, holdingsInput, readHoldings, lotsInput, readLots, tokenBox, numberInput, explain, withHelp` 從 wizard.js；`holdingSummary` 從 core/holdings.js；`avgCostPlan` 從 core/avgcost.js；`guessKind, tickSize, TAX_UNTIL` 從 core/cost.js；`parseNum, fmtMoney, fmtPct` 從 format.js；`STOCK_NAMES`、`TOOLS`。
共用小工具照 cost.js：`num`、`yuan`、`signed`、`KIND`、`KIND_NAME`；另加 `const p2 = n => n.toFixed(2) + ' 元';`、`const sh = n => n.toLocaleString('en-US') + ' 股';`。

state 欄位：`first`（{code, shares, buyPrice, nowPrice}）、`more`（[{shares, price}]）、`kind`、`discount`（折，10＝不打折）、`minFeeBoard`、`minFeeOdd`、`addPrice`、`addShares`、`target`。

### 步驟 1「你買了哪些」
- hint：「打開券商 App 的「成交回報」或「對帳單」，每一次買進填一筆。代號填好，現價會自動抓。」
- about：「這一步算出平均每股花了多少錢。分次買的價格要照股數加權，不是直接平均。」
- figure：`{ src: '../img/avgcost/step1.webp', alt: '插圖：平均成本，要照股數算。對帳單兩筆：100 元 × 1,000 股、90 元 × 3,000 股。直接平均（錯）：(100＋90)÷2＝95 元，沒管每次買了幾股。照股數加權（對）：100×1,000＝100,000，90×3,000＝270,000，370,000÷4,000 股＝92.5 元，買比較多的那次影響比較大。老師說：每一次成交填一筆，工具會幫你加上每筆的手續費。這張圖沒算手續費。' }`
- body：
  1. `holdingsInput({ id: 'hold', rows: [s.first || {}], max: 1, label: '第 1 筆買進', side: 'lot' })`
  2. `lotsInput({ id: 'lots', rows: s.more ?? [{}], first: 2, label: '之後每一次買進（只買過一次就按「刪掉這筆」）' })`
  3. `tokenBox()`
- read：
  ```js
  const [x] = readHoldings('hold');
  holdingSummary([x]);
  const more = readLots('lots').filter(l => !(Number.isNaN(l.shares) && Number.isNaN(l.price))); // 整列留白就略過
  avgCostPlan({ kind: guessKind(x.code), lots: [{ shares: x.shares, price: x.buyPrice }, ...more] }); // 只拿來檢查，錯誤會寫「第 N 筆」
  if (s.first?.code !== x.code) { s.kind = guessKind(x.code); s.addPrice = x.nowPrice; }
  s.first = x; s.more = more;
  ```

### 步驟 2「商品類型與券商費率」
- hint、about：照 cost.js 第 2 步（about 改成：「這一步決定每一筆被收多少手續費，以及全部賣掉時的證交稅。」）。
- figure：不放。
- body（照 cost.js 寫法）：
  1. `kind` 選單：照抄 cost.js（`KIND`、withHelp 第一段說明照抄），value `s.kind || 'stock'`。**不放當沖選單**。
  2. `discount`：照抄 cost.js，value `s.discount ?? 10`。
  3. `numberInput` id `minboard`，label「整股最低手續費」，plain「1000 股的倍數，常見 20 元」，value `s.minFeeBoard ?? 20`，suffix「元」，help：「這一筆的手續費算出來比這個少，就收這個數字。」「你的券商不同就改掉。」
  4. `numberInput` id `minodd`，label「零股最低手續費」，plain「不滿 1000 股的倍數，常見 1 元」，value `s.minFeeOdd ?? 1`，suffix「元」，help：「零股交易的最低收費，各券商不同，常見 1 元。」「像 1500 股這種，實際下單會拆成 1 張＋500 股兩筆；這裡整筆當零股算。」
- read：`s.kind`、`s.discount`、`s.minFeeBoard = num('minboard')`、`s.minFeeOdd = num('minodd')`；折扣檢查照 cost.js；任一低消不是 ≥0 →「最低手續費填 0 以上的數字，例：20。」

### 步驟 3「打算再買（選填）」
- hint：「想知道再買會怎樣才填。只想看現在的平均成本，股數和目標均價都留白，直接看結果。」
- about：「這一步試算「再買一筆」之後的平均成本，或想攤平到某個價格要再買多少股。」
- figure：不放。
- body：
  1. `numberInput` id `addprice`，label「打算再買的價格」，termId `averaging-down`，plain「預設是現價，可以改成你想掛的價格」，value `s.addPrice`，suffix「元」，help：「跌了再買叫攤平，漲了再買叫加碼；兩種都可以算。」
  2. `numberInput` id `addshares`，label「打算再買幾股（選填）」，plain「例：2000（2 張）；不試算就留白」，value `s.addShares`，suffix「股」，help：「填了會算出再買之後的平均成本、回本要漲多少。」
  3. `numberInput` id `target`，label「想把平均成本降到多少（選填）」，termId `average-cost`，plain「例：88；不試算就留白」，value `s.target`，suffix「元」，help：「會算出用上面的價格要再買幾股，平均成本（含手續費）才會降到這裡。」「目標要低於現在的均價、又要高於再買的價格，不然算不出來。」
- read：`s.addPrice = num('addprice'); s.addShares = num('addshares'); s.target = num('target');`；
  addShares 或 target 至少一個有填時：addPrice 不是 >0 →「打算再買的價格要大於 0，例：80。」；addShares 有填但不是正整數 →「打算再買的股數要是正整數，例：2000；不試算就留白。」；target 有填但不是 >0 →「目標均價要大於 0，例：88；不試算就留白。」

### 結果
```js
const want = Number.isFinite(s.addShares) || Number.isFinite(s.target);
const lots = [{ shares: s.first.shares, price: s.first.buyPrice }, ...s.more];
const r = avgCostPlan({ kind: s.kind, lots, nowPrice: s.first.nowPrice, discount: s.discount / 10,
  minFeeBoard: s.minFeeBoard, minFeeOdd: s.minFeeOdd,
  add: want ? { price: s.addPrice, shares: s.addShares } : null, targetAvg: want ? s.target : undefined });
const b = r.before, a = r.after, now = s.first.nowPrice;
const name = STOCK_NAMES[s.first.code] ? `${s.first.code} ${STOCK_NAMES[s.first.code]}` : s.first.code;
```
依序 `explain`：

1. **平均成本（含手續費）** `p2(b.avgWithFee)`；how：「{name}：」＋每一筆「第 {i} 筆 {price} 元 × {sh(shares)}＝{yuan(amount)}，手續費 {fee} 元」用「；」串起來＋「。合計 {yuan(b.totalCost)} ÷ {sh(b.shares)}。」；means：「不含手續費是 {p2(b.avgNoFee)}。券商 App 的「成本均價」有的含手續費、有的不含，對不上時先看是哪一種。」
2. **現在賺賠** `${signed(b.gain)}（${fmtPct(b.gainPct, 2)}）`，tone `b.gain >= 0 ? 'ok' : 'bad'`；how：「全部按現價 {now} 元賣出：{yuan(b.sell.amount)} − 手續費 {b.sell.fee} 元 − 證交稅 {b.sell.tax} 元＝{yuan(b.sell.net)}；再減總成本 {yuan(b.totalCost)}。」；means：「跟券商的「預估損益」一樣，已經扣掉賣出的費用和稅。」
3. **至少要賣在這裡才不虧** `${b.breakEvenTick} 元`，tone `warn`；how：「理論上賣 {b.breakEven.toFixed(3)} 元剛好拿回總成本；{KIND_NAME[s.kind]}在這個價位每檔跳 {tickSize(b.breakEven, s.kind)} 元，往上取到 {b.breakEvenTick} 元。」；means：`b.needRise > 0` →「比現價還要漲 {fmtPct(b.needRise, 2)}。」否則 →「現價已經比這裡高，現在全部賣掉就有賺。」

`a`（有填再買股數）時接著：

4. **再買之後的平均成本** `p2(a.avgWithFee)`；how：「原本總成本 {yuan(b.totalCost)} ＋ 這次 {s.addPrice} 元 × {sh(r.addLot.shares)}＝{yuan(r.addLot.amount)}、手續費 {r.addLot.fee} 元，合計 {yuan(a.totalCost)} ÷ {sh(a.shares)}。」；means：`a.avgWithFee < b.avgWithFee` →「平均成本從 {p2(b.avgWithFee)} 降到 {p2(a.avgWithFee)}。」否則 →「再買的價格比平均成本高（加碼），平均成本從 {p2(b.avgWithFee)} 變成 {p2(a.avgWithFee)}。」
5. **回本要漲多少** `fmtPct(a.needRise, 2)`；how：「再買之後至少要賣 {a.breakEvenTick} 元才不虧（理論 {a.breakEven.toFixed(3)} 元），÷ 現價 {now} 元 − 1。」；means：「再買前要漲 {fmtPct(b.needRise, 2)}。」（needRise ≤ 0 時兩處都改寫「現價已經高於不虧價」）
6. **再買之後賺賠** `${signed(a.gain)}（${fmtPct(a.gainPct, 2)}）`，tone `a.gain >= 0 ? 'ok' : 'bad'`；how：「全部按現價 {now} 元賣出實拿 {yuan(a.sell.net)} − 總成本 {yuan(a.totalCost)}。」；means：`b.gain < 0` →「再買前是 {signed(b.gain)}。攤平讓平均成本變低，但已經虧的錢不會消失。」否則 →「再買前是 {signed(b.gain)}。」
7. **投入的錢** `fmtMoney(a.totalCost)`，tone `warn`；how：「原本 {yuan(b.totalCost)} ＋ 這次 {yuan(r.addLot.total)}。」；means：「是原本的 {(a.totalCost / b.totalCost).toFixed(2)} 倍。這一檔再跌 10%，帳面要多虧約 {fmtMoney(a.sell.amount * 0.1)}。」；todo：「再買之前先問自己：如果現在手上沒有這檔，還會用這個價格買嗎？」

`r.target`（有填目標）時接著：

8. **攤平到 {s.target} 元要再買**：
   - `r.target.ok`：value `sh(r.target.shares)`，tone `info`；how：「用 {s.addPrice} 元買 {sh(r.target.shares)}：{yuan(r.target.lot.amount)}＋手續費 {r.target.lot.fee} 元＝{yuan(r.target.lot.total)}。({yuan(b.totalCost)}＋{yuan(r.target.lot.total)}) ÷ {sh(r.target.totalShares)}＝{r.target.avgWithFee.toFixed(2)} 元。」；means：「約 {(r.target.shares / 1000).toFixed(2)} 張，要再拿出 {fmtMoney(r.target.lot.total)}；少買 1 股，平均成本就會高於 {s.target} 元。」
   - 否則：value「算不出來」，tone `warn`；means：`r.target.message`。

接著 `h('h3', {}, '每一筆明細')`，表格 `h('table', { class: 'trade-table' }, …)`，欄位：`筆`、`股數`、`買入價（元）`、`股款（元）`、`手續費（元）`、`合計（元）`；每列 `b.lots`（筆＝1、2…），有 `r.addLot` 時最後加一列筆＝「再買」；數字 `Math.round(n).toLocaleString('en-US')`，買入價照原值。

最後 `h('div', { class: 'note' }, …)`：
- 固定：「每一筆買進的手續費分開算，各有最低收費；不是 1000 股倍數的整筆當零股算。」
- 固定：「賣掉一部分、領現金股利或配股之後，各家券商 App 的成本均價調整方式不同，這裡沒有算。」
- 固定：「損益和不虧價都假設一次全部賣出，已扣賣出手續費和證交稅。」
- `s.kind === 'bond-etf'` 時：「債券 ETF 證交稅停徵到 {TAX_UNTIL['bond-etf']}，之後可能恢復課徵。」
- `s.discount < 10` 時：照 cost.js 退佣那句。

### 範例與頁尾
```js
const example = { first: { code: '2317', shares: 1000, buyPrice: 100, nowPrice: 80 }, more: [{ shares: 1000, price: 90 }],
  kind: 'stock', discount: 10, minFeeBoard: 20, minFeeOdd: 1, addPrice: 80, addShares: 2000, target: 88 };
```
範例結果必須是：平均成本 95.14 元（不含費 95.00 元）、現在賺賠 −NT$ 30,978（-16.28%，紅）、不虧價 95.6 元（理論 95.558，還要漲 19.50%）、再買之後 87.62 元、回本要漲 10.12%（再買前 19.50%）、再買之後賺賠 −NT$ 31,914（-9.11%）、投入的錢 NT$ 350,498（1.84 倍，再跌 10% 多虧約 NT$ 32,000）、攤平到 88 元要再買 1,810 股（NT$ 145,006，均價 88.00）、明細表 3 列（第 3 列「再買」2,000／80／160,000／228／160,228）。

頁尾照 cost.js：`toolHeader(tool)`、`wizard({ steps, result, example })`、「怎麼讀」卡片放
`figure({ src: '../img/avgcost/comic.webp', alt: '四格漫畫：一、小安分兩次買同一檔股票：100 元買 1 張、90 元買 1 張，股款 190,000 元加手續費 270 元，共 190,270 元。二、老師說平均成本＝總花費 ÷ 總股數：190,270 ÷ 2,000 股約 95.14 元，每一筆的手續費都要算進去。三、跌到 80 元，小安再買 2 張攤平：平均成本 95.14 變 87.62 元，回本要漲 19.5% 變 10.1%。四、老師說虧的錢沒有消失：帳面虧損約 3.1 萬變約 3.2 萬，投入的錢約 19 萬變約 35 萬；先問如果手上沒有這檔，現在還會買嗎。手續費 0.1425%、不打折、最低 20 元；虧損已扣賣出手續費與證交稅 0.3%。' })`
加三段 `h('p')`：
- 「平均成本＝總花費 ÷ 總股數。分好幾次買，要照每次的股數加權，不是把價格直接平均。」
- 「攤平：跌了再買，平均成本變低、回本要漲的幅度變小；但投入的錢變多，再跌會虧更多。」
- 「「至少要賣在這裡才不虧」比平均成本高一點，因為賣出還要付手續費和證交稅。」

最後 `disclaimer('general')`。`img/avgcost/` 的 webp 由 Opus 轉檔放入，你不要放、不要轉檔。

## 3. 生兩張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| 提示檔 | 存成 |
|---|---|
| `docs/figures/cartoon/avgcost-01-越跌越買四格.md` | `docs/figures/cartoon/out/avgcost-comic.png` |
| `docs/figures/cartoon/avgcost-02-均價要照股數算.md` | `docs/figures/cartoon/out/avgcost-step1.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/avgcost.js').then(m=>{const r=m.avgCostPlan({kind:'stock',lots:[{shares:1000,price:100},{shares:1000,price:90}],nowPrice:80,add:{price:80,shares:2000},targetAvg:88});console.log(r.before.avgWithFee.toFixed(2),r.before.gain,r.before.breakEvenTick,r.after.avgWithFee.toFixed(2),r.after.breakEvenTick,r.after.gain,r.after.totalCost,r.target.shares,r.target.lot.total)})"
node --check js/pages/avgcost.js
```
預期：`ℹ tests 101`、`ℹ pass 101`、`ℹ fail 0`；第二行 `95.14 -30978 95.6 87.62 88.1 -31914 350498 1810 145006`；第三行無輸出。

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
- avgcost-comic.png：已生成／重生 _ 次／自查有無錯字（列出）
- avgcost-step1.png：同上
## 偏離規格或自行決定的小事
- （沒有寫「無」）
## 需要 Opus 決定的事
- （沒有寫「無」）
```
