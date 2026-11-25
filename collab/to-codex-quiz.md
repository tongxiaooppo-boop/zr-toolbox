# 頁面任務：㉖ 投資屬性測驗（精靈＋三桶配置）

- 版本：2026-11-25 v1。回報寫到 `collab/from-codex-quiz.md`。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`（不要 `npm`，PowerShell 擋 npm.ps1）。
- **只准新增**：`tools/riskquiz.html`、`js/pages/riskquiz.js`、`img/riskquiz/buckets.svg`、`collab/from-codex-quiz.md`。
- **只准修改**：`js/data/tools.js`（加一筆）、`css/app.css`（只加本頁需要的新 class，放檔尾）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。
- **不准改**：`js/core/`（尤其 `riskquiz.js`：題目、分數、門檻、比例都是使用者定案）、`js/ui/`、`tests/`、`scripts/`、其他頁面。覺得 core 有問題就停下，寫進回報。暫存檔放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `js/core/riskquiz.js`（全檔，約 130 行：`QUESTIONS`、`PROFILES`、`scoreQuiz`、`BUCKETS`、`AGE_BANDS`、`allocationPlan`）
- `js/pages/drawdown.js`（精靈頁樣板，照它的結構寫）
- `js/ui/wizard.js` 第 1–40 行（介面註解）、`js/ui/components.js` 第 1–20 行（介面註解）
- `tools/drawdown.html`（殼，照抄）
- `js/data/tools.js`（加一筆用）

## 1. 註冊與殼

- `js/data/tools.js` 的 `TOOLS`：在 `basics` 那筆**前面**加：
  `{ id: 'riskquiz', no: '㉖', group: 'science', title: '投資屬性測驗', oneLine: '10 題測出你是保守、穩健、成長還是積極型，以及三桶資金怎麼分', href: 'tools/riskquiz.html', gate: 6, status: 'ready', terms: [] }`
- `tools/riskquiz.html`：照抄 `tools/drawdown.html`，title 改成 `投資屬性測驗｜正2工具箱與股市學堂`，script 改 `../js/pages/riskquiz.js`。

## 2. 精靈（`js/pages/riskquiz.js`）

- `toolHeader(tool)` → `wizard({ steps, result, example })` → 「怎麼讀」卡 → `references([...])` → `disclaimer('general')`。
- **10 個步驟由 `QUESTIONS` 產生**（不要手抄題目）：
  - `title`：`第 ${q.no} 題：${q.text}`；`hint`：`q.hint`；不給 `about`／`figure`。
  - `body`：一個 `fieldset.choices`，每個選項一個 `label` 包 `input type="radio" name="q-${q.id}" value=score`，用 `h()` 組，不准 innerHTML。已選過（`s.a[i]`）的要預先勾選。
  - `read`：讀勾選的值存進 `s.a[i]`（數字）；沒勾 → `throw new Error(`第 ${q.no} 題還沒選。`)`。
- `example`：`{ a: [5, 4, 4, 3, 4, 5, 4, 3, 4, 3] }`（28 歲、穩定、可虧 20%：39 分積極型，配置 20／30／50，正2 第 4 點不符）。

## 3. 結果（`result(s)`，依序）

`const r = scoreQuiz(s.a); const p = allocationPlan({ key: r.key, age: s.a[0], loss: s.a[7] });`

1. `explain`：label「你的投資屬性」，value `r.profile.label`，tone `'info'`。
   - how：`10 題加總 ${r.total} 分（保守 10–24、穩健 25–33、成長 34–38、積極 39–50）。` 若 `r.caps.length`：再接 `總分本來是${scoreKey 的 label}，但` ＋ 各 `c.text` 串起來。
   - means：用下面四段文案（照抄，依 key 選一段）：
     - conservative：「你最在意本金不要虧。資金以保守穩健為主，少量放成長型 ETF。」
     - balanced：「你能接受一些漲跌，但不想大起大落。一半放保守穩健，其餘放成長和少量積極。」
     - growth：「你願意承受較大的漲跌換取長期成長。一半放成長型 ETF，其餘依你能承受的虧損分配。」
     - aggressive：「你能承受很大的波動，也期待較高報酬。一半放積極部位，但要先想清楚最壞情況。」
2. `explain`：label「三桶資金怎麼分（${p.band}）」，value `保守穩健 ${p.safe}%／成長 ${p.growth}%／積極 ${p.bold}%`。
   - how：`依你的型態與年齡查表：每一型的主力桶占一半，年紀越大積極桶越少、移到保守穩健桶。` 若 `p.row === 'growthHigh'` 加 `第 8 題你能接受虧 30% 以上，所以積極桶放多一些。`；`'growthLow'` 加 `第 8 題你能接受的虧損在 20% 以內，所以保守穩健桶放多一些。`
   - 下方接一條**比例條**：`div.alloc-bar` 內三段 `span`（class `alloc-safe`／`alloc-growth`／`alloc-bold`，寬度用 `style="width:${n}%"`，0% 的段不畫，段內文字 `${n}%`），再接三張小卡 `div.bucket`：標題 `BUCKETS[i].label ${n}%`＋例子用「、」串起來（例：「債券、債券 ETF、定存股（電信、官股銀行…）、00713、VT 類全球股」）。小卡底下一行小字：「例子只是舉例、沒有排序，不是推薦買哪一檔。」
3. `explain`：label「如果你要放正2」，value 用 `r.zr.checks` 符合的數目寫 `${n}／4 點符合`，tone：4 點都符合 `'ok'`、否則 `'warn'`。下面接清單 `ul.checks`：每條前面 `✓` 或 `✗`＋`c.text`。**不寫「適合／不適合」「建議／不建議」**。再接以下提醒（照抄，`ul`）：
   - 正2（00631L）風險等級 RR5，是最高等級；官方定位為策略交易型商品，不是為長期持有設計。
   - 它追蹤「單日」2 倍，每天重設，長期累積不等於指數的 2 倍；上下震盪時差距更大。
   - 正2 加上其他股票的實質曝險超過 100%，就等於借錢投資，下跌時虧損會被放大。
   - 2020 年疫情時 00631L 從年初到低點約跌 5 成（同期 0050 約 3 成）。本站的長期做法（正2＋現金定期配回）要能接受腰斬，回本可能要好幾年。
   - 要先在券商辦好槓桿／反向 ETF 的交易資格（風險預告書等）。
   - 「工作與收入穩定、備用金 6 個月」是本站的建議，不是法規。
4. `explain`：label「關於風險等級（RR）」，value `RR1–RR${r.profile.rr}`，means：「這是一般券商問卷對${r.profile.label}的常見對應，本站只當參考、不限制你放什麼。你在券商做的正式評估可能限制你買 RR4（例 0050）或 RR5（例正2）商品，以券商為準。」
5. 一段 `p.muted`：「答案只在你的瀏覽器裡計算，不會上傳或儲存。年齡、收入、備用金改變時，記得再測一次。」

## 4. 怎麼讀卡＋圖解

- 卡片 `section.card`，標題「怎麼讀」，放 `figure({ src: '../img/riskquiz/buckets.svg', alt: …, caption: … })`＋兩段白話：
  - 「測驗分數決定你的主力桶：保守和穩健型以保守穩健桶為主，成長型以成長桶為主，積極型以積極桶為主，主力桶大約占一半。」
  - 「這不是券商的正式評估。各家問卷題目和門檻都不同，結果可能不一樣；正式買賣以你開戶的券商為準。」
- `img/riskquiz/buckets.svg`：你手寫 SVG。內容寫死：三個並排的桶，由左到右「保守穩健／成長／積極」，桶內各寫例子（保守穩健：債券 ETF、定存股、00713、VT；成長：0050、QQQ、SPY；積極：主動式 ETF、正2、個股）；桶下方一行「積極型 20／30／50」「穩健型 50／30／20」示意主力桶占一半。規格：`viewBox="0 0 360 H"`、不設 width/height、有 `<title>`／`<desc>`、顏色寫在內部 `<style>` 並含 `@media (prefers-color-scheme: dark)`、背景透明、最小字 12；禁止 script、foreignObject、外部資源、filter、動畫。三個桶的顏色和比例條一致（保守穩健 `#1f3a68` 系、成長 `#f2b134` 系、積極 `#c0392b` 系；深色模式改淺一點）。
- alt 要把圖上的字都寫進去。

## 5. CSS（`css/app.css` 檔尾）

- `.choices`：無框 fieldset，選項一列一個，整列可點、最小高度 44px、勾選時用 `--soft` 底＋`--line` 粗框。
- `.alloc-bar`（高 28px、粗框、圓角、overflow hidden、flex）、`.alloc-safe`／`.alloc-growth`／`.alloc-bold`（底色同圖，字要清楚，金底用深字）、`.bucket`（小卡）、`ul.checks`（無項目符號）。
- 390px 寬不得水平捲動。小字不准用 `--accent` 當文字色。

## 6. 參考資料（`references`）

- 永豐金證券 投資人風險屬性分析問卷（自然人）113.06：https://www.sinotrade.com.tw/UploadFiles/2024/202406/83ced505-e15c-478f-af49-d58863f73d12.pdf
- 安達人壽 投資型保險商品保戶風險適性問卷：https://life.chubb.com/content/dam/chubb-sites/life-chubb-com/tw-zh/documents/%E6%8A%95%E8%B3%87%E5%9E%8B%E5%95%86%E5%93%81%E4%BF%9D%E6%88%B6%E9%A2%A8%E9%9A%AA%E9%81%A9%E6%80%A7%E5%95%8F%E5%8D%B7.pdf
- 元大投信 00631L 基本資料：https://www.yuantaetfs.com/product/detail/00631L/Basic_information
- 臺灣證券交易所《槓桿型及反向型 ETF 介紹》：https://www.twse.com.tw/downloads/zh/ETF/etfnews01.pdf
- MoneyDJ 基金風險報酬等級說明：https://www.moneydj.com/funddj/notes/rrnotes/rrnotes.htm

## 7. PROOF_CMD

```
node scripts/gen-precache.mjs && npm.cmd test
```

預期：`tests 170`、`pass 170`、`fail 0`（你不新增測試；registry 與 pwa 測試會檢查 tools.js 註冊、html 殼、預快取）。`npm run smoke` 由 Opus 驗收時跑（預期 ready 頁全過、首頁卡片數＝TOOLS 數）。

## 8. 回報（`collab/from-codex-quiz.md`，欄位固定，不貼程式碼）

- 完成項（對照第 1–6 節逐條）
- 新增／修改檔案清單
- PROOF_CMD 輸出的 tests／pass／fail 三個數字
- 偏離任務書的地方（沒有就寫「無」）
- 需要決定的事（沒有就寫「無」）
