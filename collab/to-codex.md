# 任務 科普二 v1：㉓ 股票基本術語、㉔ 正二教學（兩頁＋四張卡通圖）

- 版本：2026-11-09 v1（框架 v5.11、UI v1）。上一份（科普一）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網**（資料全在研究報告裡）。**不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 背景（一段話）

接續科普一（⑳㉑㉒，已上線，做法相同）。Opus 已在 `js/data/tools.js` 登記 `basics`（㉓，科普組）與 `zr101`（㉔，正二教學組），status `planned`，圖到了 Opus 改 ready。讀者是投資新手。兩頁都是**圖文長文，沒有計算機**：內容只來自研究報告，你把它**改寫成白話**放進資料檔，頁面只排版。

## 0. 要讀的檔案（只准讀這些）

- `docs/research/R5-基本術語.md`（全檔，㉓ 唯一來源）
- `docs/research/R6-正二教學素材.md`（全檔）＋ `docs/research/R3-ETF常識.md`（只讀「每日2倍目標」到「合成回測與實際持有」中和正二有關的列：每日2倍目標、每日重設與路徑依賴、震盪耗損與趨勢複利、期貨轉倉與基差、槓反風險預告與資格、00631L與三檔加權正二差別、基金曝險不固定精準200%、現股正二與借錢買正二、終止上市與清算、合成回測與實際持有）＝㉔ 的來源
- `js/pages/etf101.js`（**樣板**，照它的結構寫）、`js/data/etf101.js`（只看前 40 行，看資料檔寫法）
- `js/pages/glossary.js`（只看篩選框那段：`q`、`count`、篩選與 `location.hash` 跳轉）
- `js/ui/components.js`（只准呼叫：`h`、`toolHeader`、`figure`、`references`、`disclaimer`）
- `js/data/tools.js`（id 清單）
- `css/app.css`（只看 `.article`、`.compare-wrap`、`.myth`、`.related`、`.glossary-filter` 那幾段）
- `tools/etf101.html`（html 樣板）
- `scripts/check-kepu2.mjs`（**驗收規則**，看懂它會擋什麼）
- `docs/figures/cartoon/00-風格與角色.md` 和第 5 節表裡的四個提示檔

## 1. 只准新增／修改這些檔

- 新增資料檔：`js/data/basics.js`、`js/data/zr101.js`
- 新增頁面：`js/pages/basics.js`、`js/pages/zr101.js`
- 新增 html：`tools/basics.html`、`tools/zr101.html`（照抄 `tools/etf101.html`，只改 `<title>`〔「股票基本術語｜正二工具箱」「正二教學｜正二工具箱」〕和頁面 script 路徑）
- `js/pages/etf101.js`：**只准**在 `s.id === 'borrow'` 那行的前面，加一行：`s.id === 'leveraged' ? h('p', {}, h('a', { href: 'zr101.html' }, '㉔ 正二教學：從頭帶你走一遍 →')) : null,`
- `css/app.css`：只准**在檔尾追加**需要的幾行（用既有 token，不准寫死顏色，淺／深都要看得清楚）
- `docs/figures/cartoon/out/` 底下四張 PNG（第 5 節）
- 跑 `node scripts/gen-precache.mjs` 更新 `sw.js`（只准用腳本改）
- `collab/from-codex.md`

**不准改**：`js/core/`、`js/net/`、`js/ui/`、`js/data/tools.js`、`js/data/glossary.js`、其他 `js/data/*`、`tests/`、`scripts/`、`img/`、`docs/`（`docs/figures/cartoon/out/` 除外）、其他頁面。覺得要改就停下寫進回報。

## 2. 共通寫作規則（同科普一，`check-kepu2.mjs` 會擋一部分）

1. **只用研究報告裡的內容**。百分比數字都要能在來源原樣找到（㉓ 對 R5 術語；㉔ 對 R3＋R6）；報告沒寫的事不准加。
2. **白話改寫**：一句話講一件事；術語第一次出現時接一句白話解釋；不要照抄報告的長句（R5 的「一句話說明」很硬，例如「有價證券經程序核准在證交所市場掛牌」，要改成新手聽得懂的話）。報告的「本機」連結不要放進頁面；網址只用報告裡出現過的 `https://` 原網址。
3. 每個欄位一般 1–2 句、**最多 120 字**；不寫「建議你買」，寫「要注意什麼」。不准出現「保證獲利」「穩賺」。
4. 有日期的數字保留年份（例：「一般股票 1 張是 1,000 股（2026 年查詢）」）。
5. 頁面程式**不准寫死任何百分比數字**；不准 `innerHTML`，全部用 `h()`。
6. `tools` 欄位是 `js/data/tools.js` 的 id 陣列，沒有就 `[]`；頁面把它變成連結（照 `etf101.js` 的 `links()`）。可用的對應：手續費、證交稅、張與股、零股、升降單位 → `cost`；除息、股利 → `dividend`；融資融券 → `margin`；質押 → `pledge`；每日 2 倍、耗損 → `decay`；跌幅與回本 → `drawdown`；再平衡 → `rebalance`；50/50 → `trigger5050`；正二要買多少 → `exposure`；借錢管道 → `loans`；ETF → `etf101`；商品 → `products`。
7. **參考資料**：`*_REFS` 收這頁用到的全部來源網址（同一網址只收一次），`{ name: '發行者：標題', url, note: '查閱 2026-11-09' }`；頁底 `references(*_REFS)`。
8. `alt` 一律把該張提示裡的**所有文字**依順序寫成一段（照 `etf101.js` 的 `FIGURE_TEXT` 做法，放資料檔）。

## 3. ㉓ `js/data/basics.js`＋`js/pages/basics.js`

資料格式：

```js
// ㉓ 股票基本術語（Codex 依 R5 改寫，2026-11-09）。數字都出自 docs/research/R5-基本術語.md。
export const BASIC_SECTIONS = [
  { id: 'market', title: '市場與帳戶', intro: '一兩句導讀',
    terms: [{ id: 'listed', term: '上市', plain: '白話一句', example: '例：…', myth: '常見誤解一句', fact: '其實一句', tools: [] }, …] },
  …
];
export const BASIC_LIMITS = ['2–3 句：這頁是制度的白話說明；例子是情境，不是實際報價；規則以證交所、櫃買中心最新公告為準'];
export const BASIC_REFS = [{ name, url, note }, …];
export const FIGURE_TEXT = { comic: '…', map: '…' };
```

- `term` 要和 R5 第一欄**一字不差**（含括號，例「集保（集保帳戶）」「T+2」），48 個全收，不合併、不新增。`id` 自己取英文小寫連字號，不重複。
- 6 節（id／標題固定），每節收這些術語（照這個順序）：
  1. `market`「市場與帳戶」：上市、上櫃、券商（證券經紀商）、證券戶與銀行戶、集保（集保帳戶）、電子下單
  2. `order`「下單」：委託（委託單）、張與股、整股、限價、市價、ROD（當日有效）、IOC（立即成交否則取消）、FOK（立即全部成交否則取消）、未成交、改價、刪單（取消委託）。**`map.webp` 放這節**。
  3. `match`「報價與成交」：買價（委買報價）、賣價（委賣報價）、買賣價差、價格優先、時間優先、集合競價、逐筆交易、試撮、開盤價、成交量、漲跌停、盤後（盤後定價）
  4. `settle`「交割與特殊狀況」：T+2、交割（交割帳戶／交割款）、違約交割、處置股、全額交割（變更交易方法）、暫停交易
  5. `company`「公司與指數」：市值、加權指數、大盤、成分股、股東會、面額
  6. `fund`「基金與衍生商品常見的詞」：申購、贖回（買回）、公開說明書、現金結算、權利金、買權與賣權、到期日
- 欄位對應 R5：`plain`＝一句話說明（白話改寫）、`example`＝例子（以「例：」開頭）、`myth`＝常見誤解、`fact`＝其實（你寫一句糾正）。
- 頁面：
  - 骨架照 `etf101.js`：`toolHeader` → 「先看這張圖」（comic，caption「送出委託、成交、交割、進集保，是四件不同的事。」）＋開場兩段 → 篩選框 → 目錄 → 6 節 → 「這頁的限制」 → `references` → `disclaimer('general')`。
  - 開場兩段（照寫）：「這頁收的是下單前最基本的詞：上市櫃、集保、交割、委託單、漲跌停、T+2……每個詞先講白話，再舉例、講常見誤解。」「Beta、維持率、殖利率這類計算機會用到的詞，在 ⑫ 術語辭典。」（「⑫ 術語辭典」做成連到 `glossary.html` 的連結）
  - 篩選框照 `glossary.js` 的做法：`h('input', { type: 'search', placeholder: '輸入關鍵字，例如 交割、漲跌停', class: 'glossary-filter', 'aria-label': '篩選術語' })`，依 `term`＋`plain`＋`example` 篩選；某節全部被篩掉就整節藏起來；顯示「符合 n 個」。網址 `#id` 要能跳到該術語（照 `glossary.js` 的 `location.hash`）。
  - 每個術語：`h('div', { class: 'basic-item', id: t.id }, h('h3', {}, term), h('p', {}, plain), h('p', { class: 'muted' }, example), h('p', { class: 'myth' }, …常見誤解／其實，同 etf101…), tools 連結)`。

## 4. ㉔ `js/data/zr101.js`＋`js/pages/zr101.js`

資料格式（`check-kepu2` 會逐字比對標★的欄位）：

```js
// ㉔ 正二教學（Codex 依 R6＋R3 改寫，2026-11-09）。數字都出自 docs/research/R6-正二教學素材.md 與 R3-ETF常識.md。
export const ZR_SECTIONS = [
  { id: 'what', title: '正二是什麼', intro: '…', blocks: [{ title, text, tools: [] }, …] },
  { id: 'daily', title: '為什麼不是整段 2 倍', intro, blocks },
  { id: 'ways', title: '常見的幾種用法', intro, blocks },      // blocks 可以是 []，內容用 ZR_WAYS／ZR_MIXES
  { id: 'dajen', title: '大仁 50/50 對比 0050', intro, blocks }, // blocks 可以是 []，內容用 DAJEN
  { id: 'risks', title: '開始前要知道的風險', intro, blocks },
  { id: 'start', title: '照這個順序用工具', intro, blocks: [] }  // 內容用 ZR_STEPS
];
export const ZR_WAYS = [   // ★ id 與 tools 固定；name、how 白話
  { id: 'hold', name: '只買正二長抱', how, tools: ['decay', 'drawdown'] },
  { id: 'dajen', name: '大仁 50/50', how, tools: ['trigger5050'] },
  { id: 'periodic', name: '定期配比', how, tools: ['rebalance'] },
  { id: 'target', name: '目標倍數', how, tools: ['exposure'] },
  { id: 'borrow', name: '借錢加碼', how, tools: ['pledge', 'margin', 'lifelev', 'kelly', 'loans'] }
];
export const ZR_MIXES = [  // ★ R6 第 2 節「定期配比的例子」表格，五個欄位一字不差（全形斜線「／」）
  { name: '60/40', after: '0／42／40', total: '82', target: '0／49.2／32.8', action: '買正二 7.2' },
  …532、442、433
];
export const DAJEN = {
  period: '2014/10/31–2022/05/26',                        // ★
  start: '白話：100 萬起步，正二 50 萬＋現金 50 萬',
  rule: '白話：正二漲跌超過 50% 就配回各半',
  dates: ['2017/06/03', '2019/10/22', '2020/11/09', '2021/01/19'],  // ★
  result5050: '255.3 萬（+155.37%）',                     // ★
  result0050: '237.5 萬（+137.58%）',                     // ★
  limits: ['R6 第 3 節四條限制，白話'],                     // ≥4 條，其中一條寫出 99.5 萬與 99.9 萬
  source: { name: '大仁：50正2槓桿ETF搭配再平衡，輕鬆打敗0050（2022-05-28）', url: 'https://letf.com.tw/50正2槓桿etf搭配再平衡，輕鬆打敗0050/' }  // ★ url
};
export const ZR_STEPS = [  // ★ tools 固定（R6 第 5 節）；text 白話一句
  { text, tools: ['etf101'] }, { text, tools: ['decay'] }, { text, tools: ['drawdown'] },
  { text, tools: ['trigger5050', 'rebalance', 'exposure'] }, { text, tools: ['loans', 'pledge', 'lifelev', 'kelly'] }
];
export const ZR_LIMITS = ['2–3 句：這頁是科普不是投資建議；作者觀點與官方風險揭露並列，作者觀點不是發行商保證；數字是假設或原作者結果'];
export const ZR_REFS = [{ name, url, note }, …];
export const FIGURE_TEXT = { comic: '…', map: '…' };
```

- 各節內容（只用 R6／R3，白話）：
  1. `what`：每日 2 倍追的是單日；00631L 追蹤臺灣50、曝險範圍 180%–220%；四檔台股正二基準不同；初次買要簽風險預告書與資格（R3）。最後一個 block 連 `etf101`。
  2. `daily`：漲 10% 再跌約 9.09% 的例子（大盤回原點、正二虧約 1.82%）；單邊行情可能比整段 2 倍多；不能用固定耗損率估。tools `['decay']`。
  3. `ways`：`map.webp` 放 `h2` 下方（alt 照 `zr101-02` 全文）；`ZR_WAYS` 每種 `h3` name＋`p` how＋連結；「定期配比」底下放大仁 50/50 怎麼配回的兩個獨立例子（R6，用 `p` 寫，數字照 R6）、四種配比的瞬間近似倍數（1.2／1.1／1.2／1.0 倍，註明是簡化算法），再放 `ZR_MIXES` 表格：`h('div', { class: 'compare-wrap' }, h('table', {}, …))`，欄位「配置｜變動後 原型／正二／現金（萬）｜合計（萬）｜配回目標（萬）｜要做的事（萬）」，表上方一句「假設 100 萬、原型跌 15%、正二跌 30%、現金不變、不含費用；不代表大盤跌 15% 時正二一定跌 30%。」
  4. `dajen`：`h2` 下方第一行 `h('p', { class: 'muted' }, h('strong', {}, '原作者回測，工具箱未重算'))`；用 `dl` 列出期間、起始、規則、配回日期（`dates.join('、')`）、50/50 期末、0050 期末；接「這份結果的限制」`ul`（`DAJEN.limits`）；最後一行連到原文（`source`）與 `h('a', { href: 'trigger5050.html' }, '② 50/50 觸發提醒：算你自己的 →')`。
  5. `risks`：R6 第 4 節四點（跌 50% 要漲 100%、借錢買會追繳、回測不等於實際、可能終止上市清算），各一個 block，tools 照對應（`drawdown`、`loans`、`[]`、`[]`）。
  6. `start`：`ZR_STEPS` 用 `ol`，每項 `text` 後接連結。
- 開場兩段（照寫）：「正二（例如 00631L）是每天追求大盤 2 倍漲跌的 ETF：漲的時候放大，跌的時候也放大。」「這頁從頭講一遍：正二是什麼、為什麼放久了不是整段 2 倍、常見的幾種用法，以及一份常被引用的 50/50 回測結果。每一節都接到可以算你自己數字的工具。」
- caption（comic）：「先懂每天 2 倍，再選做法；要借錢之前先算追繳。」
- 頁尾「這頁的限制」卡：`ZR_LIMITS`。

## 5. 生四張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示（**提示要是純文字字串**，不要讓 PowerShell 把它序列化成物件），生成直式 1024×1536 PNG：

| # | 提示檔 | 存成 |
|---|---|---|
| 1 | `docs/figures/cartoon/basics-01-從下單到股票進帳戶四格.md` | `docs/figures/cartoon/out/basics-comic.png` |
| 2 | `docs/figures/cartoon/basics-02-一張委託單怎麼看.md` | `docs/figures/cartoon/out/basics-map.png` |
| 3 | `docs/figures/cartoon/zr101-01-正二新手地圖四格.md` | `docs/figures/cartoon/out/zr101-comic.png` |
| 4 | `docs/figures/cartoon/zr101-02-正二的幾種用法.md` | `docs/figures/cartoon/out/zr101-map.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 頁面引用 `img/<id>/comic.webp`、`img/<id>/map.webp`（Opus 轉檔搬過去，你不用做）。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 6. PROOF_CMD（必跑，貼結果）

```
node scripts/check-kepu2.mjs && node scripts/gen-precache.mjs && npm.cmd test
node --check js/pages/basics.js
node --check js/pages/zr101.js
node --check js/pages/etf101.js
```

預期：`check-kepu2` 倒數第二行 `基本術語 48（R5 48）；正二教學 6 節、做法 5、配比 4、路線 5；百分比 a/b；網址 c/d`，最後一行 `OK`；`sw.js：n 個檔案，版本 …`；`ℹ tests 155`、`ℹ pass 155`、`ℹ fail 0`；三個 `node --check` 無輸出。出現 `FAIL` 就修到 OK（**修資料，不准改 check-kepu2.mjs**）。

## 7. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
## 修改檔案
## PROOF_CMD 結果
- check-kepu2：（原樣貼最後兩行）
- gen-precache：__
- npm.cmd test：tests __ pass __ fail __
- node --check（三檔）：__
## 生圖（每張重生幾次、有沒有殘留錯字）
## 偏離規格或自行決定的小事
## 需要 Opus 決定的事
```
