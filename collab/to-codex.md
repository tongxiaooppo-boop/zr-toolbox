# 任務 科普一 v1：⑳ ETF 入門、㉑ 借錢投資的管道、㉒ 商品與賺錢方式（三頁＋六張卡通圖）

- 版本：2026-11-09 v1（框架 v5.11、UI v1）。上一份（R4）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網**（資料全在研究報告裡）。**不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 背景（一段話）

工具箱首頁新增「科普」分組（Opus 已在 `js/data/tools.js` 登記 `etf101`、`loans`、`products` 三張卡，status `planned`，圖到了 Opus 改 ready）。讀者是投資新手。三頁都是**圖文長文，沒有計算機**：內容全部來自研究報告 R3／R4／R5，你要把報告裡的表格**改寫成新手看得懂的白話**放進資料檔，頁面只負責排版。

## 0. 要讀的檔案（只准讀這些）

- `docs/research/R3-ETF常識.md`、`docs/research/R4-個人借錢管道.md`、`docs/research/R5-商品與獲利方式.md`（全檔，**唯一的內容來源**）
- `js/ui/components.js`（全檔，只准呼叫：`h`、`toolHeader`、`figure`、`references`、`disclaimer`）
- `js/data/tools.js`（只看 id 清單與 `TOOLS` 結構）
- `css/app.css`（只看 `.article`、`.compare-wrap`、`.refs`、`.card` 那幾段）
- `tools/fx.html`（html 樣板）
- `scripts/check-kepu.mjs`（**驗收規則**，看懂它會擋什麼）
- `docs/figures/cartoon/00-風格與角色.md` 和第 5 節表裡的六個提示檔

## 1. 只准新增／修改這些檔

- 新增資料檔：`js/data/etf101.js`、`js/data/loans.js`、`js/data/products.js`（格式見第 2–4 節）
- 新增頁面：`js/pages/etf101.js`、`js/pages/loans.js`、`js/pages/products.js`
- 新增 html：`tools/etf101.html`、`tools/loans.html`、`tools/products.html`（照抄 `tools/fx.html`，只改 `<title>`〔「ETF 入門｜正二工具箱」「借錢投資的管道｜正二工具箱」「商品與賺錢方式｜正二工具箱」〕和頁面 script 路徑）
- `css/app.css`：只准**在檔尾追加**需要的幾行（例如 `dl` 排版、誤解列），每條規則要能在淺／深兩種模式下看清楚（用既有 token，不准寫死顏色）。
- `docs/figures/cartoon/out/` 底下六張 PNG（第 5 節）
- 跑 `node scripts/gen-precache.mjs` 更新 `sw.js`（只准用腳本改）
- `collab/from-codex.md`

**不准改**：`js/core/`、`js/net/`、`js/ui/`、`js/data/tools.js`、`js/data/glossary.js`、`tests/`、`scripts/`、`img/`、`docs/`（`docs/figures/cartoon/out/` 除外）、其他頁面。覺得要改就停下寫進回報。

## 2. 共通寫作規則（全部要遵守，`check-kepu.mjs` 會擋一部分）

1. **只用研究報告裡的內容**。每個百分比數字都要能在對應報告原樣找到（`check-kepu` 會比對：⑳ 對 R3、㉑ 對 R4、㉒ 對 R5）；報告寫「待查」的就寫「待查」，不准補數字。報告沒寫的事不准加。
2. **白話改寫**：一句話講一件事；術語第一次出現時接一句白話解釋；不要照抄報告的長句。報告裡的「本機」連結（`來源/…md`）不要放進頁面；網址只用報告裡出現過的 `https://` 原網址。
3. 每個欄位：一般 1–2 句、**最多 120 字**；不寫「建議你借／買」，寫「要注意什麼」。不准出現「保證獲利」「穩賺」。
4. 有日期的數字保留年份或查詢日期（例：「2026 年查詢」「至 2026-12-31」）。
5. 機構名稱（銀行、券商、投信）只准出現在：利率／費率的「例：」說明裡、以及參考資料。頁面要有一句：「列出的機構只是查得到公告的例子，不是推薦；利率會變，以各家最新公告為準。」
6. 頁面程式**不准寫死任何百分比數字**，數字一律放資料檔；不准 `innerHTML`，全部用 `h()`。
7. 每個 `tools` 欄位是 `js/data/tools.js` 的 id 陣列（例：`['margin']`），沒有就 `[]`；頁面把它變成連結 `h('a', { href: id + '.html' }, no + ' ' + title)`（從 `TOOLS` 查 `no`、`title`）。可用的對應：每日 2 倍／耗損 → `decay`；手續費、證交稅、當沖 → `cost`；除息、殖利率、二代健保 → `dividend`；股利報稅 → `divtax`；定期定額 → `dca`；融資融券、維持率 → `margin`；質押、股票質借、不限用途借貸 → `pledge`；信貸、房貸、多筆負債 → `lifelev`；正二要買多少 → `exposure`；再平衡 → `rebalance`；匯率 → `fx`；估價 → `valuation`。
8. **參考資料**：每頁的 `*_REFS` 收這頁用到的全部來源（同一網址只收一次），`{ name: '發行者：標題', url, note: '查閱 2026-11-09' }`；頁底用 `references(*_REFS)`。

共通頁面骨架（三頁都一樣）：

```js
import { h, toolHeader, figure, references, disclaimer } from '../ui/components.js';
import { TOOLS } from '../data/tools.js';
const tool = TOOLS.find(t => t.id === '<id>');
document.getElementById('app').append(
  toolHeader(tool),
  h('section', { class: 'card article' }, h('h2', {}, '先看這張圖'), figure({ src: '../img/<id>/comic.webp', alt: <四格文字完整寫出>, caption: <一句> }), <開場 1–2 段>),
  h('nav', { class: 'card article', 'aria-label': '本頁目錄' }, h('h2', {}, '這頁有什麼'), h('ol', {}, <每節一個 h('a', { href: '#節id' }, 節標題)>)),
  …各節（每節 h('section', { class: 'card article', id: 節id }, h('h2', {}, 節標題), …)）,
  references(<REFS>),
  disclaimer('general'));
```

`alt` 一律把該張提示裡的**所有文字**依順序寫成一段（照前幾個工具頁的做法）。`map.webp` 的 `figure` 放在指定那一節的 `h2` 下方。

## 3. ⑳ `js/data/etf101.js`＋`js/pages/etf101.js`

資料格式：

```js
// ⑳ ETF 入門的內容（Codex 依 R3 改寫，2026-11-09）。數字都出自 docs/research/R3-ETF常識.md。
export const ETF_SECTIONS = [
  { id: 'what', title: 'ETF 是什麼', intro: '一兩句導讀',
    topics: [{ title: '小標', text: '白話說明', myth: '常見誤解（一句）', fact: '其實（一句）', tools: [] }, …] },
  …
];
export const ETF_LIMITS = ['R3「使用限制」改寫成 2–4 句白話'];
export const ETF_REFS = [{ name, url, note }, …];
```

- R3 表格 37 列，**每列都要出現**（可以把很接近的合併，但總主題數 ≥ 34）。分成這 6 節（id／標題固定，主題依內容歸入）：
  1. `what`「ETF 是什麼」：是什麼、市值型／高股息／主題型、債券 ETF、主動與被動、成分股調整。**`map.webp` 放這節**（alt 照 `etf101-02` 全文）。
  2. `cost`「持有要花多少錢」：內扣費用、追蹤差距、追蹤誤差、市價淨值折溢價、流動性與造市、手續費與證交稅、當沖與債券 ETF 稅率期限。
  3. `dividend`「配息要知道的事」：配息來源與收益平準金、除息與總報酬、不配息 ETF、高股息安全迷思。
  4. `trade`「買賣與特殊狀況」：交易時間與零股、漲跌幅、T+2、分割反分割、畸零款與暫停交易、終止上市與清算、匯率與時差。
  5. `leveraged`「槓桿型與反向型（正二）」：每日 2 倍、每日重設、震盪耗損、期貨轉倉、反向 ETF、風險預告與資格、00631L 與其他正二差別、比較資料邊界、曝險不固定 200%、現股正二與借錢買正二、合成回測與實際持有。
  6. `borrow`「借錢買 ETF」：融資融券與質押、維持率與追繳、還本金與補擔保。本節最後一段放連結 `h('a', { href: 'loans.html' }, '㉑ 借錢投資的管道：全部管道一次比 →')`。
- 頁面：每個 topic 渲染成 `h('h3', {}, title)`、`h('p', {}, text)`、`h('p', { class: 'myth' }, h('strong', {}, '常見誤解：'), myth, ' ', h('strong', {}, '其實：'), fact)`，有 tools 再接一行連結。`ETF_LIMITS` 放在最後一節之後的一張 `card article`（標題「這頁的限制」）。
- 開場兩段（照寫）：「ETF 是在證券交易所買賣的基金：一份 ETF 裡面裝著一籃子股票或債券，買一份就等於買下整籃的一小份。」「這頁把新手最常搞錯的地方整理成六節。每一點先講白話，再講常見誤解；正二的部分也在這裡。」
- caption（comic）：「一份 ETF＝一籃子股票的一小份，但還是會跌。」

## 4. ㉑ `js/data/loans.js`＋`js/pages/loans.js`

資料格式：

```js
// ㉑ 借錢投資的管道（Codex 依 R4 改寫，2026-11-09）。數字都出自 docs/research/R4-個人借錢管道.md。
export const LOAN_GROUPS = [
  { id: 'stock', title: '押股票', line: '一句：股價跌太多會被追繳' },
  { id: 'asset', title: '押房子、保單、車、定存', line: '一句' },
  { id: 'none', title: '什麼都不押', line: '一句' },
  { id: 'other', title: '其他（政府專案、親友、當舖與民間）', line: '一句；當舖與民間只當最壞例子' }
];
export const LOANS = [
  { id: 'bank-pledge', name: '股票質借（銀行）', main: true, group: 'stock',
    who, how, rate, amount, term, call, worst, forStock, tools: ['pledge'], sources: [{ name, url }] },
  …
];
export const LOAN_MYTHS = [{ myth, fact }, …];   // R4「新手常見誤解」全部（12 條）
export const LOAN_OPEN = ['R4「待查與矛盾」每條改寫成一句白話', …];
export const LOAN_REFS = [{ name, url, note }, …];
```

- 欄位對應 R4 比較表：`who`＝誰提供、`how`＝怎麼借、`rate`＝利率大約（**「例：某某公告 x%」＋查詢日期**；報告寫待查就寫「待查」）、`amount`＝額度或成數、`term`＝期限與還款方式、`call`＝會不會追繳或斷頭、`worst`＝最壞情況、`forStock`＝能不能拿去買股票、`tools`＝對應工具、`sources`＝該列來源。
- **R4 比較表 28 列全收**。`main: true` 剛好這 14 列：股票質借（銀行）、不限用途款項借貸（證券商）、融資、融券、借券（借入）、個人信貸（分期）、個人信貸（循環）、房貸增貸、理財型房貸、保單質借、信用卡預借現金、信用卡循環／帳單分期、車貸增貸、存單質借。其餘 14 列 `main: false`。
- `group`：融資、融券、借券、股票質借、不限用途、證金股票擔保、基金質借、債券質借、黃金擔保、證券業務借貸（T+5、半年型）、認股借貸、預支交割款 → `stock`（黃金、基金、債券是押在券商帳戶的資產，跟股票同一套追繳，所以也放這組；在 `how` 裡寫清楚押的是什麼）；房貸增貸、理財型房貸、二胎、保單質借、車貸、存單質借 → `asset`；信貸、信用卡兩種、就學貸款 → `none`；勞工紓困、親友、當舖、民間借貸 → `other`。
- 頁面各節：
  1. `groups`「先分三類：押什麼借」：`map.webp`（alt 照 `loans-02` 全文），接 `LOAN_GROUPS` 每組一段（`h3` title＋`p` line），再一句：「不會追繳，不代表不會虧：借來的錢買的股票跌了，虧損一樣是你的，錢一樣要還。」
  2. `table`「常見 14 種比一比」：`h('div', { class: 'compare-wrap' }, h('table', {}, …))`，欄位 10 欄依序「管道｜誰提供｜怎麼借｜利率大約｜額度或成數｜期限與還款｜會不會追繳或斷頭｜最壞情況｜能不能買股票｜對應工具」；列＝`main` 的 14 列，依 `LOAN_GROUPS` 順序排，第一欄 `name` 下方 `h('small', {}, 組 title)`。表上方一行 `p.muted`：「表格可以左右滑。」表下方放第 2 節第 5 點那句機構說明。
  3. `others`「比較少見的管道」：`main:false` 的 14 列，每列一個 `h('details', { class: 'loan-more' }, h('summary', {}, name), h('dl', {}, …同上 9 個欄位用 dt／dd…))`。`group === 'other'` 且是當舖或民間借貸的，`summary` 後加 `h('small', {}, '（只當最壞例子，不建議）')`。
  4. `myths`「新手常見誤解」：`LOAN_MYTHS` 每條一個 `p.myth`（格式同 ⑳）。
  5. `open`「還查不清楚的地方」：`LOAN_OPEN` 用 `ul`；開頭一句「下面這些是研究時查不到、或不同來源說法不一樣的地方，借之前要直接問銀行或券商。」
  6. `tools`「接著算算看」：三個連結 `pledge`、`margin`、`lifelev`（各一句說明：「押股票借錢，跌多少會被追繳」「融資融券的維持率與追繳價」「房貸、信貸、質押加起來，你其實開了幾倍槓桿」）。
- 開場兩段（照寫）：「借錢投資，賺的時候放大，賠的時候也放大，而且利息每個月都要付。」「這頁把台灣個人可以借錢的管道全部列出來：怎麼借、利息大約多少、會不會被追繳、最壞會怎樣。這不是借款建議，是讓你借之前先看清楚。」
- caption（comic）：「借錢之前先問：利息多少、會不會被追繳、最壞會怎樣。」

## 5. ㉒ `js/data/products.js`＋`js/pages/products.js`

資料格式：

```js
// ㉒ 商品與賺錢方式（Codex 依 R5 改寫，2026-11-09）。數字都出自 docs/research/R5-商品與獲利方式.md。
export const LEVELS = [
  { id: 'ok', title: '可以從這裡開始', line: '一句' },
  { id: 'careful', title: '先弄懂再碰', line: '一句' },
  { id: 'no', title: '新手不建議', line: '一句' }
];
export const PRODUCTS = [{ id, name, plain, how, earn, lose, cost, level, tools: [], sources: [{ name, url }] }, …];  // R5 商品表 20 列
export const WAYS = [{ name, plain, products, cost }, …];   // R5 獲利方式 7 列
export const PRODUCT_LIMITS = ['R5 開頭說明的限制改寫成 2–3 句：等級是依複雜度和最壞損失的整理，不是主管機關評等；稅以台灣稅務居民個人為主…'];
export const PRODUCT_REFS = [{ name, url, note }, …];
```

- 欄位對應 R5 商品表：`plain`＝一句話說明、`how`＝怎麼買、`earn`＝怎麼賺錢、`lose`＝怎麼虧錢（最壞情況）、`cost`＝交易成本與稅、`level`＝適合新手嗎（是→`ok`、小心→`careful`、不建議→`no`，**照報告分，不准自己改**：2／9／9）。
- 頁面各節：
  1. `ways`「錢是怎麼賺來的」：`WAYS` 每種一個 `h3` name＋`p` plain＋`p.muted` 「哪些商品有：」products＋「要注意：」cost。
  2. `levels`「新手從哪裡開始」：`map.webp`（alt 照 `products-02` 全文），接 `LEVELS` 三組，每組 `h3` title＋`p` line，下面該等級的商品，每個 `h('details', { class: 'product' }, h('summary', {}, h('strong', {}, name), ' ', plain), h('dl', {}, 怎麼買／怎麼賺／怎麼虧（最壞）／成本與稅 4 組 dt／dd), tools 連結)`。
  3. `limits`「這頁的限制」：`PRODUCT_LIMITS`，加第 2 節第 5 點那句機構說明。
- 開場兩段（照寫）：「同樣是『投資』，賺錢的方式不一樣，虧錢的方式也不一樣。」「這頁先講錢從哪裡來（價差、股利、利息……），再把個人可以買的商品依難度分三層：每一種寫清楚怎麼買、怎麼賺、最壞會怎樣。」
- caption（comic）：「每種賺法都有對應的虧法。」

## 6. 生六張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示（**提示要是純文字字串**；上次 PowerShell 把提示序列化成物件字串，畫出無關照片），生成直式 1024×1536 PNG：

| # | 提示檔 | 存成 |
|---|---|---|
| 1 | `docs/figures/cartoon/etf101-01-ETF是一籃子股票四格.md` | `docs/figures/cartoon/out/etf101-comic.png` |
| 2 | `docs/figures/cartoon/etf101-02-ETF怎麼分.md` | `docs/figures/cartoon/out/etf101-map.png` |
| 3 | `docs/figures/cartoon/loans-01-借錢投資先問三件事四格.md` | `docs/figures/cartoon/out/loans-comic.png` |
| 4 | `docs/figures/cartoon/loans-02-三種擔保.md` | `docs/figures/cartoon/out/loans-map.png` |
| 5 | `docs/figures/cartoon/products-01-賺錢的方法四格.md` | `docs/figures/cartoon/out/products-comic.png` |
| 6 | `docs/figures/cartoon/products-02-新手的風險階梯.md` | `docs/figures/cartoon/out/products-map.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 頁面引用 `img/<id>/comic.webp`、`img/<id>/map.webp`（Opus 轉檔搬過去，你不用做）。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付（`check-kepu` 會因缺 PNG 報 FAIL，回報註明即可）。

## 7. PROOF_CMD（必跑，貼結果）

```
node scripts/check-kepu.mjs && node scripts/gen-precache.mjs && npm.cmd test
node --check js/pages/etf101.js
node --check js/pages/loans.js
node --check js/pages/products.js
```

預期：`check-kepu` 倒數第二行 `ETF 主題 n（≥34）；借錢管道 28 列（main 14）；商品 20、賺錢方式 7；百分比 a/b/c；網址 d/e/f`，最後一行 `OK`；`sw.js：n 個檔案，版本 …`；`ℹ tests 155`、`ℹ pass 155`、`ℹ fail 0`；三個 `node --check` 無輸出。出現 `FAIL` 就修到 OK（**修資料，不准改 check-kepu.mjs**）。

## 8. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
## 修改檔案
## PROOF_CMD 結果
- check-kepu：（原樣貼最後兩行）
- gen-precache：__
- npm.cmd test：tests __ pass __ fail __
- node --check（三檔）：__
## R3 合併了哪幾列（沒合併寫「無」）
## 生圖（每張重生幾次、有沒有殘留錯字）
## 偏離規格或自行決定的小事
## 需要 Opus 決定的事
```
