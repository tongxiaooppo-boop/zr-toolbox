# 任務 ⑯⑰⑱ v1：「股價估價」「股利要怎麼報稅」「換匯成本與海外損益」三個新精靈＋六張卡通圖

- 版本：2026-11-09 v1（框架 v5.11）。上一份（⑬⑭ v1）已完成上線，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/kelly.js`（全檔，**照抄它的寫法**：import、`steps`、`explain`、`example`、頁尾「怎麼讀」）
- `js/pages/trigger5050.js` 第 30–95 行（**頁面自己做日期欄＋自動抓資料**的寫法：`withHelp(h('div',{class:'field'},…))`、`seq` 防舊回應、`isConnected`、`clearToken` 時 `setToken('')`）
- `js/ui/wizard.js` 第 1–50 行（介面註解）、第 160–216 行（代號欄自動抓價的寫法，⑯ 代號欄照它做）
- `js/core/valuation.js`、`js/core/divtax.js`、`js/core/fx.js`（全檔，**只准呼叫**，JSDoc 是規格）
- `js/net/price.js` 第 95 行以後（`fetchDataset`、`fetchRatios`、`fetchFxRate`）
- `tools/kelly.html`
- `docs/figures/cartoon/00-風格與角色.md` 和第 4 節表裡的六個提示檔

## 1. 只准改／新增這些檔

- 新增 `js/pages/valuation.js`、`js/pages/divtax.js`、`js/pages/fx.js`、`tools/valuation.html`、`tools/divtax.html`、`tools/fx.html`（html 照抄 `tools/kelly.html`，只改 `<title>`〔「股價估價｜正二工具箱」「股利要怎麼報稅｜正二工具箱」「換匯成本與海外損益｜正二工具箱」〕和頁面 script 路徑）。
- `css/app.css`：只准**在檔尾追加**需要的幾行（若需要）。
- `docs/figures/cartoon/out/` 底下六張 PNG（第 4 節）。
- `collab/from-codex.md`。

**不准改**：`js/core/`、`js/net/`、`js/ui/`、`js/data/`（`tools.js` 的 status 由 Opus 改）、`tests/`、`img/`、其他頁面、`docs/`（`docs/figures/cartoon/out/` 除外）。覺得要改就停下寫進回報。

共用輔助（三頁各自寫在檔內）：`num`、`named`、`link` 照抄 kelly／③ 頁；`blank = v => v === undefined || v === null || Number.isNaN(v)`；`signedMoney = n => (n < 0 ? '−' : '+') + fmtMoney(Math.abs(n))`；`signedPct = (x, d = 1) => (x < 0 ? '−' : '+') + fmtPct(Math.abs(x), d)`；`price2 = n => (+n.toFixed(2)).toLocaleString('zh-TW') + ' 元'`。
自動抓資料的狀態文字一律用 `h('small', { class: 'holding-status', 'aria-live': 'polite' })`；失敗時 `r.message`，`r.action === 'show-quota-guide'` 再接「 申請方式見下方 token 說明。」；有 `clearToken` 就 `setToken('')`。

## 2. ⑯ `js/pages/valuation.js`

import：`h, toolHeader, disclaimer, figure`（components）、`wizard, numberInput, explain, withHelp, tokenBox`（wizard）、`valuationPlan, ratiosToBase, historyBands, METHODS`（core/valuation）、`normalizeCode`（core/holdings）、`fetchClose, fetchRatios, getToken, setToken`（net/price）、`parseNum, fmtMoney, fmtPct`（format）、`STOCK_NAMES`、`TOOLS`。

頁內變數 `let fetched = null;`（`{ code, rows, last }`）。state：`code, price, eps, bvps, dividend, pe[3], pb[3], yieldPct[3]`（殖利率存百分比數字）、`bands`、`ratioDate`、`autoFrom`。
`params(s)`：`{ price: s.price, eps: s.eps, bvps: s.bvps, dividend: s.dividend, pe: s.pe, pb: s.pb, yields: (s.yieldPct || []).map(x => x / 100) }`。

**步驟 1「哪一檔、現在多少錢」**
- hint：「填代號會自動抓收盤價和證交所的本益比資料；沒有代號（或上櫃、ETF 抓不到）就自己填現價。」
- about：「估價是拿現價跟你算出來的便宜價、合理價、昂貴價比。」
- body：代號欄（照 wizard.js 第 186–209 行的寫法，id `code`，標籤「股票代號（選填）」＋名稱 span，副標「例：2330；ETF 沒有本益比」）＋`numberInput({ id: 'price', label: '現價', plain: '輸入代號後自動帶入', suffix: '元', value: s.price })`＋`tokenBox()`。
  代號 change：`normalizeCode` → 同時 `fetchClose(c, { token })` 填 `price`、`fetchRatios(c, { token })`：成功就 `fetched = { code: c, rows: r.rows, last: r.last }`，狀態「現價 {close}（{date} 收盤）；證交所 {last.date}：本益比 {PER || '—'}、淨值比 {PBR || '—'}、殖利率 {dividend_yield}%，下一步自動帶入。」；失敗 `fetched = null`，狀態顯示 message。
- read：`s.code = normalizeCode(code 欄) || ''`；`s.price = num('price')`，`!(s.price > 0)` → 錯誤「請填現價。」。
  若 `fetched && fetched.code === s.code && s.autoFrom !== s.code`：`const b = ratiosToBase(s.price, fetched.last)`；`s.eps = b.eps ?? NaN; s.bvps = b.bvps ?? NaN; s.dividend = b.dividend ?? NaN; s.bands = historyBands(fetched.rows); s.ratioDate = fetched.last.date; s.autoFrom = s.code;`。
  若 `s.code` 和 `s.autoFrom` 不同（也沒抓到）：`s.bands = null; s.ratioDate = ''; s.autoFrom = ''`（eps 等不清，讓使用者自己改）。

**步驟 2「每股數字」**
- hint：`s.ratioDate ? '已用證交所 ' + s.ratioDate + ' 的資料反推帶入，可以改成你自己的數字。' : '到公司財報或財經網站查；不知道的留白，那個方法就不算。'`（hint 依 state 變：照 ⑥⑧ 的做法在前一步 read 裡改 `steps[1].hint`）
- about：「三種方法各用一個每股數字：EPS 給本益比法、每股淨值給本淨比法、每年股利給殖利率法。」
- body 三格（suffix 都是「元」）：
  - `eps`「每股盈餘 EPS」termId `'eps'`，plain「近四季加起來；虧損填負數」，help `['證交所的本益比用最近四季的 EPS。', '用財經網站的「預估 EPS」也可以，但那是別人的猜測，要記得是哪一年的預估。']`
  - `bvps`「每股淨值」termId `'pb-ratio'`，plain「最近一季財報」，help `['公司資產減負債，平均到每一股。']`
  - `dividend`「每年每股股利」termId `'dividend-yield'`，plain「一年配的加起來」，help `['一年內每次配息加起來，例：季配 4 次各 4 元填 16。', '證交所帶入的數字含股票股利；只想看現金股利就改成現金的部分。']`
- read：存三格；`valuationPlan({ ...params(s), pe: [1, 2, 3], pb: [1, 2, 3], yields: [0.03, 0.02, 0.01] })` 檢查（錯誤丟出去）。

**步驟 3「你的三個倍數」**
- hint：`s.bands && (s.bands.pe || s.bands.pb || s.bands.yields) ? '按「用這檔過去 5 年的區間」會帶入它自己的 25／50／75 分位數；也可以自己填。' : '倍數由你自己定：可以參考這檔過去的本益比區間，或同產業的公司。'`（同上，在前一步 read 改 `steps[2].hint`）
- about：「便宜、合理、昂貴各填一個倍數。本益比、本淨比由小到大；殖利率由大到小（殖利率越高，價格越便宜）。」
- figure：`../img/valuation/step3.webp`，alt 照第 4 節圖 2 的文字完整寫出。
- body：只放「步驟 2 有填每股數字」的方法（`blank(s.eps)` 等判斷），每個方法一個 `h('div', { class: 'triple' })` 三格：
  - 本益比：ids `pe0 pe1 pe2`，標籤「本益比：便宜」「合理」「昂貴」，suffix「倍」，termId 只放第一格 `'pe-ratio'`
  - 本淨比：`pb0 pb1 pb2`，「本淨比：便宜」「合理」「昂貴」，suffix「倍」，termId `'pb-ratio'`
  - 殖利率：`y0 y1 y2`，「殖利率：便宜」「合理」「昂貴」，suffix「%」，termId `'dividend-yield'`
  - 有 `s.bands` 且至少一個方法的 band 不是 null → 最上面放按鈕 `h('button', { type: 'button', class: 'secondary' }, '用這檔過去 5 年的區間（' + s.bands.from + '～' + s.bands.to + '）')`，按下把有 band 的方法填進格子（pe／pb 取 2 位小數；yields × 100 取 2 位小數）。band 是 null 的方法不動，並在按鈕下 `p.muted` 寫「{方法} 資料不夠 20 天，沒有帶入。」（只在按過之後顯示）。
- read：`s.pe = [num('pe0'), …]`（該方法沒顯示就 `[]`），`s.pb`、`s.yieldPct` 同理；`valuationPlan(params(s))` 檢查。

**結果**（`const r = valuationPlan(params(s))`），依序：
1. 每個 `m of r.methods`：
   - `!m.ok` → `explain({ label: m.label, value: '不能用', tone: 'warn', how: m.reason, means: m.key === 'pe' ? '虧損的公司看本淨比或營收比較合適。' : m.key === 'pb' ? '淨值是負的，公司資產不夠還負債。' : '沒有配息的股票不適合用殖利率估。' })`
   - `m.ok` → `explain({ label: m.label, value: m.zoneLabel, tone: { 'below-cheap': 'ok', 'cheap-fair': 'ok', 'fair-expensive': 'warn', 'above-expensive': 'bad' }[m.zone], how, means })`：
     - how（pe）：`'EPS ' + m.base.toFixed(2) + ' 元 × ' + a + '／' + b + '／' + c + ' 倍 ＝ 便宜 ' + price2(cheap) + '／合理 ' + price2(fair) + '／昂貴 ' + price2(expensive) + '。'`；pb 同（「每股淨值」）；yield：`'每年股利 ' + m.base.toFixed(2) + ' 元 ÷ ' + 三個殖利率用 fmtPct(x, 2) 以「／」接 + ' ＝ 便宜 …／合理 …／昂貴 …。'`
     - means（pe／pb）：`'現在' + (pe ? '本益比 ' : '本淨比 ') + m.current.toFixed(2) + ' 倍；現價 ' + price2(r.price) + ' 落在' + m.zoneLabel + '。'`；yield：`'現在殖利率 ' + fmtPct(m.current, 2) + '；現價 ' + price2(r.price) + ' 落在' + m.zoneLabel + '。'`
2. 只要有 2 個以上 `ok` 的方法：表格 `h('table', { class: 'trade-table' })`，欄「方法｜便宜價｜合理價｜昂貴價｜現價在哪」，每列 `m.label`、三個 `price2`、`m.zoneLabel`。
3. `s.ratioDate` 有值：`h('p', { class: 'note' }, 'EPS、每股淨值、股利是用證交所 ' + s.ratioDate + ' 的本益比、淨值比、殖利率反推的；證交所的殖利率含股票股利。')`
4. `h('p', { class: 'note' }, '倍數是你的假設，沒有公定的合理倍數；估出來的價格不是買賣建議。虧損公司、景氣循環股、金融股適合的方法不一樣。')`，接 todo 一段：`['想算領多少股利、除息後股價，看 ', link('dividend.html', '⑩ 股息與除權息'), '。']`
**example**：`{ code: '', price: 580, eps: 32, bvps: 140, dividend: 16, pe: [15, 20, 25], pb: [3, 4, 5], yieldPct: [4, 3, 2.5], bands: null, ratioDate: '', autoFrom: '' }`
範例結果必須有：本益比法「便宜價到合理價之間」、480／640／800、現在 18.13 倍；本淨比法「合理價到昂貴價之間」、420／560／700、現在 4.14 倍；殖利率法「合理價到昂貴價之間」、400／533.33／640、現在殖利率 2.76%；比較表 3 列。
**怎麼讀**：`figure({ src: '../img/valuation/comic.webp', alt: 第 4 節圖 1 四格文字完整寫出 })`，接三段：
- 「估價就是先決定一把尺：用獲利（本益比）、用公司資產（本淨比）、或用配息（殖利率），乘上或除以你認為合理的倍數，得到便宜、合理、昂貴三個價格。」
- 「倍數沒有標準答案。比較穩的做法是看這檔股票自己過去幾年的區間：最低的四分之一當便宜、中間當合理、最高的四分之一當昂貴。但公司變了，過去的區間就不一定適用。」
- 「三把尺給的答案常常不一樣，這很正常。ETF 沒有本益比、本淨比，只能看殖利率；殖利率法要先確認配息是不是能一直配下去。」
最後 `disclaimer('general')`。

## 3. ⑰ `js/pages/divtax.js`

import：`h, toolHeader, disclaimer, figure, selectField`（components）、`wizard, numberInput, explain, withHelp`（wizard）、`dividendTaxPlan, TAX_YEARS, DEFAULT_TAX_YEAR, DIVIDEND_CREDIT_CAP`（core/divtax）、`parseNum, fmtMoney, fmtPct`（format）、`TOOLS`。
`params(s)`：`{ year: +s.year, married: s.married === 'yes', people: s.people, elderly: s.elderly, salaries: s.salaries || [], otherIncome: s.otherIncome, dividends: s.dividends, itemized: s.itemized, otherSpecial: s.otherSpecial }`
`pay = p => p < 0 ? '可退 ' + fmtMoney(-p) : '要繳 ' + fmtMoney(p)`。

**步驟 1「申報年度和家裡幾個人」**
- hint：「申報戶＝同一份報稅書上的人：本人、一起申報的配偶、扶養的家人。」
- about：「人數決定免稅額和扣除額，扣越多，股利併進來時適用的稅率越低。」
- body：
  - `withHelp(selectField({ id: 'year', label: '哪一年的所得', options: Object.values(TAX_YEARS).map(p => ({ value: String(p.year), label: p.year + ' 年度所得（' + p.fileIn + ' 年 5 月報稅）' })), value: String(s.year || DEFAULT_TAX_YEAR) }), { text: ['報稅是報「前一年」的所得：2027 年 5 月報的是 115 年度（2026 年）的所得。', '各年度的免稅額、扣除額、稅率級距不同。'] })`
  - `selectField({ id: 'married', label: '有沒有配偶一起申報', options: [{ value: 'no', label: '沒有（單身或分開申報）' }, { value: 'yes', label: '有，夫妻一起申報' }], value: s.married || 'no' })`
  - `numberInput({ id: 'people', label: '申報戶總人數', plain: '本人＋配偶＋扶養的家人', suffix: '人', value: s.people })`
  - `numberInput({ id: 'elderly', label: '其中 70 歲以上（選填）', plain: '留白＝0', suffix: '人', value: s.elderly, help: { text: ['70 歲以上的本人、配偶、扶養的直系尊親屬，免稅額比較高。'] } })`
- read：存四格（year、married 存字串）；`people` 空白 → 錯誤「請填申報戶總人數。」；`dividendTaxPlan(params({ ...s, salaries: [], dividends: 0 }))` 檢查。

**步驟 2「薪資和其他所得」**
- hint：「看各人的扣繳憑單或國稅局的所得資料；沒有就留白。」
- about：「薪資每個人可以分開扣一筆薪資特別扣除額，所以每人一格。」
- body：`n = Math.min(s.people, 4)` 格 `numberInput({ id: 'sal' + i, …, suffix: '元', value: (s.salaries || [])[i] })`，標籤：第 0 格「本人薪資」；第 1 格 `s.married === 'yes' ? '配偶薪資' : '家人 1 薪資'`；其餘「家人 k 薪資」（k 接著編號）；plain 都是「一年的薪資總額，沒有就留白」；第 0 格 help `{ text: ['薪資特別扣除額每人最多 ' + fmtMoney(TAX_YEARS[s.year].salaryCap) + '，不能合併給別人用。'] }`。`s.people > 4` 時下方 `h('p', { class: 'muted' }, '超過 4 個人有薪資時，把其他人的薪資加在最後一格（薪資扣除額會少算一些）。')`。
  再一格 `numberInput({ id: 'otherIncome', label: '其他所得（選填）', plain: '利息、租金、執行業務…合計，留白＝0', suffix: '元', value: s.otherIncome })`。
- read：`s.salaries = [num('sal0'), …]`（n 格）；存 `otherIncome`；`dividendTaxPlan(params({ ...s, dividends: 0 }))` 檢查。

**步驟 3「股利和扣除額」**
- hint：「股利看國稅局的所得資料或券商寄的股利憑單，全家加起來。」
- about：「8.5% 抵減每戶最多 8 萬元；股利很多、所得很高時，分開計稅才可能比較省。」
- figure：`../img/divtax/step3.webp`，alt 照第 4 節圖 4 的文字完整寫出。
- body：
  - `numberInput({ id: 'dividends', label: '一年的股利所得', termId: 'dividend-tax', plain: '全家加起來', suffix: '元', value: s.dividends, help: { text: ['現金股利加股票股利；股票股利按面額算（每股配 1 元股票股利、持有 1 張＝1,000 元）。', 'ETF 配息只有「股利」那一部分算這裡，利息、收益平準金不是；以基金公司寄的所得明細為準。'] } })`
  - `numberInput({ id: 'itemized', label: '列舉扣除額（選填）', plain: '保險費、醫藥費、房貸利息、捐款…合計；留白＝用標準扣除額', suffix: '元', value: s.itemized })`
  - `numberInput({ id: 'otherSpecial', label: '其他特別扣除額（選填）', plain: '身障、教育學費、幼兒、長照、房租…合計，薪資的不用填', suffix: '元', value: s.otherSpecial })`
- read：`dividends` 空白 → 錯誤「請填一年的股利所得，沒有就填 0。」；存三格；`dividendTaxPlan(params(s))` 檢查。

**結果**（`const r = dividendTaxPlan(params(s)); const c = r.combined, p = r.separate; const minus = r.exemption + r.deduction + r.salarySpecial + r.otherSpecial + r.basicLivingDiff;`）依序：
1. `explain({ label: '建議', value: { combined: '合併計稅', separate: '分開計稅', same: '兩種一樣' }[r.best], tone: 'ok', how: '合併計稅' + pay(c.payable) + '；分開計稅' + pay(p.payable) + '。', means: r.best === 'same' ? '兩種算法繳的一樣。' : '選這個少繳 ' + fmtMoney(r.saving) + '。報稅時系統也會幫你比，選少的那個。' })`
2. `explain({ label: '兩種都先扣掉', value: fmtMoney(minus), tone: 'info', how: '免稅額 ' + fmtMoney(r.exemption) + '（' + s.people + ' 人' + (elderly > 0 ? '，其中 70 歲以上 ' + elderly + ' 人' : '') + '）＋ ' + (r.deductionKind === 'itemized' ? '列舉' : '標準') + '扣除額 ' + fmtMoney(r.deduction) + ' ＋ 薪資特別扣除額 ' + fmtMoney(r.salarySpecial) + ' ＋ 其他特別扣除額 ' + fmtMoney(r.otherSpecial) + ' ＋ 基本生活費差額 ' + fmtMoney(r.basicLivingDiff) + '。', means: r.basicLivingDiff > 0 ? '基本生活費 ' + fmtMoney(r.basicLiving) + '（每人 ' + fmtMoney(r.params.basicLiving) + ' × ' + s.people + ' 人）比免稅額加扣除額還多，差額也可以扣。' : '兩種算法扣的一樣，差別只在股利怎麼算。' })`（`elderly = blank(s.elderly) ? 0 : s.elderly`）
3. `explain({ label: '合併計稅', value: pay(c.payable), tone: r.best === 'combined' ? 'ok' : 'info', how: '所得總額 ' + fmtMoney(c.income) + '（含股利 ' + fmtMoney(s.dividends) + '）− ' + fmtMoney(minus) + ' ＝ 所得淨額 ' + fmtMoney(c.net) + '；× ' + fmtPct(c.rate, 0) + ' − 累進差額 ' + fmtMoney(c.diff) + ' ＝ ' + fmtMoney(c.taxBefore) + '；減股利抵減 ' + fmtMoney(c.credit) + '（股利 × 8.5%' + (c.creditCapped ? '，超過上限只能抵 ' + fmtMoney(DIVIDEND_CREDIT_CAP) : '') + '）。', means: c.payable < 0 ? '抵減比稅還多，差額可以退稅。' : '股利跟其他所得一起照級距算，你最高那一級是 ' + fmtPct(c.rate, 0) + '。' })`
4. `explain({ label: '分開計稅', value: pay(p.payable), tone: r.best === 'separate' ? 'ok' : 'info', how: '不含股利的所得總額 ' + fmtMoney(p.income) + ' − ' + fmtMoney(minus) + ' ＝ 所得淨額 ' + fmtMoney(p.net) + '；× ' + fmtPct(p.rate, 0) + ' − 累進差額 ' + fmtMoney(p.diff) + ' ＝ ' + fmtMoney(p.taxBefore) + '；股利 ' + fmtMoney(s.dividends) + ' × 28% ＝ ' + fmtMoney(p.dividendTax) + '；合計 ' + fmtMoney(p.payable) + '。', means: '股利不管多少都是 28%；所得級距到 40% 的人比較可能划算。' })`
5. `r.provisional`：`h('p', { class: 'note' }, r.year + ' 年度的基本生活費財政部還沒公告（通常 11 月下旬），先用每人 ' + fmtMoney(r.params.basicLiving) + ' 估；只影響家裡人多、收入低的情況。')`
6. `h('p', { class: 'note' }, '只算一個申報戶的綜合所得稅；沒算最低稅負制、已經被扣繳的稅、二代健保補充保費。實際以報稅系統試算為準。')`，接 todo：`['股利的二代健保補充保費，看 ', link('dividend.html', '⑩ 股息與除權息'), '。']`
**example**：`{ year: '115', married: 'no', people: 1, elderly: NaN, salaries: [800000], otherIncome: NaN, dividends: 300000, itemized: NaN, otherSpecial: NaN }`
範例結果必須有：建議「合併計稅」、少繳 92,680；兩種都先扣掉 464,000；合併要繳 8,120（所得淨額 636,000、12%、累進差額 42,700、33,620、抵減 25,500）；分開要繳 100,800（336,000、5%、16,800、84,000）；有「基本生活費還沒公告」那段 note。
**怎麼讀**：`figure({ src: '../img/divtax/comic.webp', alt: 第 4 節圖 3 四格文字完整寫出 })`，接三段：
- 「股利要報綜合所得稅，有兩種算法擇一：合併計稅是把股利加進所得照級距算，再減股利的 8.5%（每戶最多 8 萬，抵不完可以退）；分開計稅是股利單獨按 28% 算。」
- 「大多數人合併比較省：級距 5%、12%、20% 的人，減掉 8.5% 之後股利的稅率遠低於 28%，甚至可以退稅。所得到 40% 級距、股利又多的人，分開才可能比較省。」
- 「這裡用的是財政部公告的免稅額、扣除額和級距；每年會依物價調整，報稅時以報稅系統為準。」
最後 `disclaimer('general')`。

## 4. ⑱ `js/pages/fx.js`

import：`h, toolHeader, disclaimer, figure, selectField`（components）、`wizard, numberInput, explain, withHelp, tokenBox`（wizard）、`fxPlan, ratePair, FX_CURRENCIES`（core/fx）、`fetchFxRate, getToken, setToken`（net/price）、`parseNum, fmtMoney, fmtPct`（format）、`TOOLS`。
`params(s)`：`{ twdIn: s.twdIn, rateIn: { buy: s.inBuy, sell: s.inSell }, feeIn: blank(s.feeIn) ? 0 : s.feeIn, foreignNow: s.foreignNow, rateNow: { buy: s.nowBuy, sell: s.nowSell }, feeOut: blank(s.feeOut) ? 0 : s.feeOut }`
`cur = s => FX_CURRENCIES.find(c => c.code === s.currency)?.label || s.currency`；`rate4 = x => (+x.toFixed(4)).toString()`；`fx2 = x => (+x.toFixed(2)).toLocaleString('zh-TW')`。
自動抓匯率共用一個頁內函式 `fillRates(currency, kind, date, buyInput, sellInput, status)`：`fetchFxRate(currency, { date, token: getToken() })` → `ratePair(r.row, kind)`；有值就填兩格，狀態「臺灣銀行 {r.date} 牌告{kind === 'cash' ? '（現鈔）' : '（即期）'}：買入 {buy}、賣出 {sell}。你的銀行可能不同，可以改。」；`ratePair` 是 null →「臺灣銀行 {r.date} 沒有{現鈔／即期}報價，請自己填。」；失敗顯示 message。用 `seq` 防舊回應、`isConnected` 檢查（照 trigger5050.js）。

**步驟 1「當初換匯」**
- hint：「看銀行 App 的換匯紀錄：付了多少台幣、成交匯率。只記得日期的話，填日期會自動抓那天的牌告匯率。」
- about：「台幣換外幣用『銀行賣出』匯率；同一天的『銀行買入』匯率用來算價差。」
- figure：`../img/fx/step1.webp`，alt 照第 4 節圖 6 的文字完整寫出。
- body：
  - `selectField({ id: 'currency', label: '幣別', options: FX_CURRENCIES.map(c => ({ value: c.code, label: c.label + '（' + c.code + '）' })), value: s.currency || 'USD' })`
  - `withHelp(selectField({ id: 'kind', label: '換的是', termId: 'fx-spread', options: [{ value: 'spot', label: '即期（存進外幣帳戶、複委託）' }, { value: 'cash', label: '現鈔（領現金）' }], value: s.kind || 'spot' }), { text: ['投資海外股票通常是即期：錢在帳戶裡，不領現金。', '現鈔的價差比較大。'] })`
  - 日期欄（照 trigger5050.js 的日期欄寫法，id `dateIn`，標籤「哪一天換的（選填）」，副標「填了會自動抓臺灣銀行那天的牌告匯率」，`max` 今天）；幣別、種類、日期任一改變且日期有值 → `fillRates(…, 'inBuy', 'inSell')`。
  - `numberInput({ id: 'twdIn', label: '付出的台幣', plain: '含手續費，總共花了多少', suffix: '元', value: s.twdIn })`
  - `numberInput({ id: 'inSell', label: '銀行賣出匯率', termId: 'fx-spread', plain: '台幣換外幣用這個', value: s.inSell, help: { text: ['1 外幣＝多少台幣。換匯紀錄上的成交匯率就是這個。', '有議價或優惠的話填你實際成交的。'] } })`
  - `numberInput({ id: 'inBuy', label: '銀行買入匯率', plain: '同一天的另一個價格，用來算價差', value: s.inBuy })`
  - `numberInput({ id: 'feeIn', label: '換匯手續費（選填）', plain: '留白＝0', suffix: '元', value: s.feeIn })`
  - `tokenBox()`
- read：存 `currency, kind, dateIn, twdIn, inSell, inBuy, feeIn`；`twdIn`、兩個匯率任一空白 → 錯誤「請填付出的台幣和兩個匯率。」；`fxPlan(params({ ...s, nowBuy: s.inBuy, nowSell: s.inSell, foreignNow: NaN }))` 檢查。

**步驟 2「外幣現在值多少」**
- hint：「看外幣帳戶或複委託 App：股票市值＋剩下的外幣現金。只想知道換匯來回少多少，就留白。」
- about：「外幣的漲跌和匯率的漲跌分開算，最後再合起來看換回台幣賺多少。」
- body：先放 `h('p', { class: 'muted' }, '當初換到約 ' + fx2((s.twdIn - (blank(s.feeIn) ? 0 : s.feeIn)) / s.inSell) + ' ' + cur(s) + '。')`；再 `numberInput({ id: 'foreignNow', label: '現在外幣總值（選填）', plain: '留白＝跟換到的一樣', suffix: s.currency, value: s.foreignNow })`
- read：存；`fxPlan(params({ ...s, nowBuy: s.inBuy, nowSell: s.inSell }))` 檢查。

**步驟 3「現在換回台幣」**
- hint：「換回台幣用『銀行買入』匯率。已經自動帶入今天的臺灣銀行牌告，可以改成你銀行的。」
- body：狀態文字＋`numberInput({ id: 'nowBuy', label: '銀行買入匯率', plain: '外幣換回台幣用這個', value: s.nowBuy })`、`numberInput({ id: 'nowSell', label: '銀行賣出匯率', plain: '用來算現在的價差', value: s.nowSell })`、`numberInput({ id: 'feeOut', label: '換回手續費（選填）', plain: '留白＝0', suffix: '元', value: s.feeOut })`。
  **只有 `blank(s.nowBuy) && blank(s.nowSell)` 時**，render 後呼叫 `fillRates(s.currency, s.kind, '', …)` 抓今天的匯率。
- read：兩個匯率任一空白 → 錯誤「請填現在的兩個匯率。」；存；`fxPlan(params(s))` 檢查。

**結果**（`const r = fxPlan(params(s))`）依序：
1. `explain({ label: '換回台幣', value: fmtMoney(r.twdOut), tone: 'info', how: fx2(r.foreignNow) + ' ' + cur(s) + ' × 銀行買入 ' + s.nowBuy + ' − 手續費 ' + fmtMoney(params(s).feeOut) + ' ＝ ' + fmtMoney(r.twdOut) + '。', means: '當初付出 ' + fmtMoney(s.twdIn) + '。' })`
2. `explain({ label: '台幣損益', value: signedMoney(r.pnl) + '（' + signedPct(r.ret, 2) + '）', tone: r.pnl >= 0 ? 'ok' : 'bad', how: fmtMoney(r.twdOut) + ' − ' + fmtMoney(s.twdIn) + '。', means: '用外幣看是 ' + signedPct(r.assetRet) + '，換回台幣變成 ' + signedPct(r.ret, 2) + '，差在匯率和價差。' })`
3. 「錢去哪了」：`h('h3', {}, '錢去哪了')`＋表格 `h('table', { class: 'trade-table' })`，欄「項目｜金額｜怎麼算」，6 列（金額用 `signedMoney(Math.round(x))`，合計用 `signedMoney(Math.round(r.pnl))`）：
   - 外幣資產漲跌｜parts.asset｜`'外幣多了 ' + fx2(r.foreignNow - r.foreignIn) + ' × 當初中間價 ' + rate4(r.midIn)`
   - 匯率變動｜parts.fx｜`'現在外幣 × 中間價 ' + rate4(r.midIn) + ' → ' + rate4(r.midNow) + '（' + signedPct(r.fxRet, 2) + '）'`
   - 換入價差｜parts.spreadIn｜`'賣出 ' + s.inSell + ' 比中間價貴 ' + rate4(s.inSell - r.midIn)`
   - 換回價差｜parts.spreadOut｜`'買入 ' + s.nowBuy + ' 比中間價便宜 ' + rate4(r.midNow - s.nowBuy)`
   - 手續費｜parts.fees｜「換入＋換回」
   - 合計｜pnl｜「＝ 台幣損益」
   表下 `h('p', { class: 'note' }, '中間價＝(銀行買入＋銀行賣出) ÷ 2，用來把匯率的漲跌和銀行的價差分開。')`
4. `explain({ label: '換完馬上換回會少', value: fmtPct(r.spreadPctIn, 2), tone: 'warn', how: '(賣出 ' + s.inSell + ' − 買入 ' + s.inBuy + ') ÷ 賣出 ' + s.inSell + '。', means: '只換匯、什麼都不做的成本，還沒算手續費。' + (s.kind === 'cash' ? '現鈔的價差比即期大。' : '') })`
5. `r.breakEvenBuy !== null`：`explain({ label: '不虧的匯率', value: rate4(r.breakEvenBuy), tone: s.nowBuy >= r.breakEvenBuy ? 'ok' : 'warn', how: '(付出 ' + fmtMoney(s.twdIn) + ' ＋ 換回手續費 ' + fmtMoney(params(s).feeOut) + ') ÷ 現在外幣 ' + fx2(r.foreignNow) + '。', means: '銀行買入匯率要高於這個，換回台幣才不虧；現在是 ' + s.nowBuy + '。' })`
6. `h('p', { class: 'note' }, '匯率是臺灣銀行牌告（經 FinMind）或你填的數字，實際以你的銀行成交為準；沒算海外股票的稅（例：美股股利預扣）和券商手續費。')`
**example**：`{ currency: 'USD', kind: 'spot', dateIn: '', twdIn: 330000, inBuy: 32.9, inSell: 33, feeIn: NaN, foreignNow: 11000, nowBuy: 31.4, nowSell: 31.5, feeOut: NaN }`
範例結果必須有：換回 345,400；台幣損益 +15,400（+4.67%）、外幣 +10.0%；錢去哪了 +32,950／−16,500／−500／−550／+0（或 −0 顯示成「+0」都可，回報註明）／+15,400；中間價 32.95 → 31.45（−4.55%）；換完馬上換回會少 0.30%；不虧的匯率 30。
**怎麼讀**：`figure({ src: '../img/fx/comic.webp', alt: 第 4 節圖 5 四格文字完整寫出 })`，接三段：
- 「投資海外要換兩次匯：台幣換外幣時用銀行賣出匯率（比較貴），換回台幣時用銀行買入匯率（比較便宜），中間差的就是銀行的價差。」
- 「外幣資產漲了，換回台幣不一定賺一樣多：外幣變便宜（台幣升值）會吃掉一部分報酬，外幣變貴則會多賺。」
- 「這裡把台幣損益拆成四塊：資產漲跌、匯率變動、兩次換匯價差、手續費，加起來剛好等於總損益。」
最後 `disclaimer('general')`。

## 5. 生六張卡通圖（用你的生圖功能）

每張把 `00-風格與角色.md` 全文＋該張提示全文合在一起當生圖提示，生成直式 1024×1536 PNG：

| # | 提示檔 | 存成 |
|---|---|---|
| 1 | `docs/figures/cartoon/valuation-01-估價三把尺四格.md` | `docs/figures/cartoon/out/valuation-comic.png` |
| 2 | `docs/figures/cartoon/valuation-02-用自己的歷史當尺.md` | `docs/figures/cartoon/out/valuation-step3.png` |
| 3 | `docs/figures/cartoon/divtax-01-股利報稅二選一四格.md` | `docs/figures/cartoon/out/divtax-comic.png` |
| 4 | `docs/figures/cartoon/divtax-02-抵減有上限.md` | `docs/figures/cartoon/out/divtax-step3.png` |
| 5 | `docs/figures/cartoon/fx-01-換過去再換回來四格.md` | `docs/figures/cartoon/out/fx-comic.png` |
| 6 | `docs/figures/cartoon/fx-02-買入賣出別看反.md` | `docs/figures/cartoon/out/fx-step1.png` |

- 生完自己看一遍：中文與數字要和提示一字不差；錯了重生該張，**每張最多重生 2 次**，仍有錯就留最後一張並在回報寫出哪裡錯。
- 頁面引用 `img/valuation/comic.webp`、`step3.webp`、`img/divtax/comic.webp`、`step3.webp`、`img/fx/comic.webp`、`step1.webp`（Opus 轉檔搬過去，你不用做）。
- 不能生圖就跳過本節，回報寫「無法生圖」，頁面照常交付。

## 6. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "Promise.all([import('./js/core/valuation.js'),import('./js/core/divtax.js'),import('./js/core/fx.js')]).then(([v,t,f])=>{const a=v.valuationPlan({price:580,eps:32,bvps:140,dividend:16,pe:[15,20,25],pb:[3,4,5],yields:[.04,.03,.025]});const b=t.dividendTaxPlan({people:1,salaries:[800000],dividends:300000});const c=f.fxPlan({twdIn:330000,rateIn:{buy:32.9,sell:33},foreignNow:11000,rateNow:{buy:31.4,sell:31.5}});console.log(a.methods.map(m=>m.zone).join(','),Math.round(b.combined.payable),Math.round(b.separate.payable),b.best,Math.round(c.pnl),c.breakEvenBuy)})"
node --check js/pages/valuation.js
node --check js/pages/divtax.js
node --check js/pages/fx.js
```
預期：`ℹ tests 155`、`ℹ pass 155`、`ℹ fail 0`；第二行 `cheap-fair,fair-expensive,fair-expensive 8120 100800 combined 15400 30`；後三行無輸出。

## 7. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
## 修改檔案
## PROOF_CMD 結果
- npm.cmd test：tests __ pass __ fail __
- 範例數字：__
- node --check（三檔）：__
## 生圖（每張重生幾次、有沒有殘留錯字）
## 偏離規格或自行決定的小事
## 需要 Opus 決定的事
```
