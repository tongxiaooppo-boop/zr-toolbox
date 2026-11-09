# 任務 ② v2：50/50 觸發頁帶入股票事件（分割、除權息、減資）

- 版本：2026-11-09 v2（框架 v5.7）。上一份（② v1）已完成上線，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網。不要 commit**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`／`node`；**不要跑 `npm.cmd run smoke`**（Opus 會跑）。暫存檔只准放本 repo 內，結束前刪掉。

## 背景（為什麼要改）

FinMind 日線是未還原價格。實測：00631L 在 2026-01-02 收盤 375.25 元，2026-03-31 分割（443.15 → 20.14，約 1 拆 22），現價 26.3 元。不換算會變成「跌 93%」；換算後基準價 375.25 × 20.14 ÷ 443.15 ≈ 17.05 元，其實是 **+54.2%，要配回**。使用者要求：股票事件要帶入；另外也可以請使用者照券商 App 現在的股數＋成本重填。

## 0. 要讀的檔案（只准讀這些）

- `js/pages/trigger5050.js`（全檔，**只改這一檔**）
- `js/core/events.js`（`normalizeEvents`、`adjustBasePrice`，只准呼叫）
- `js/net/price.js` 的 `fetchEvents`（只准呼叫）

## 1. 只准改這些檔

- `js/pages/trigger5050.js`、`collab/from-codex.md`。其他一律不改；覺得要改就停下寫進回報。

## 2. 要改的地方

### 2.1 import
加 `fetchEvents`（net/price.js）、`normalizeEvents, adjustBasePrice`（core/events.js）。

### 2.2 步驟 1
hint 改成：「只填這個 50/50 策略裡的那一檔正二。股數和成本均價照券商 App「現在」顯示的填（分割、除權後券商會自動換算）。」

### 2.3 步驟 2「配回過，我記得日期」的抓價流程
日期 change 後（沿用現有 `seq` 防舊回應，每個 await 之後都要檢查）：
1. `fetchCloseOn` 不 ok → 跟現在一樣顯示 `r.message`，`basePrice` 不動。
2. ok → 狀態先顯示「抓到 {r.date} 的收盤價 {r.close} 元，查詢之後的股票事件中…」，接著 `fetchEvents(code, r.date, { token: getToken() })`（`clearToken` 為 true 就 `setToken('')`，兩次呼叫任一次是 true 都要清）。
3. 事件查不到（`!ev.ok`）→ `basePrice` **清空**，狀態：「抓到 {r.date} 的收盤價 {r.close} 元，但查不到之後的分割、除權息資料（{ev.message}），沒辦法換算。請改選「從沒配回過」用券商 App 的成本均價，或自己填換算後的價格。」；`s.baseRaw = NaN; s.baseEvents = []`。
4. 事件查到 → `const list = normalizeEvents(ev.raw); const a = adjustBasePrice(r.close, r.date, list);`
   - `basePrice` 填 `+a.adjusted.toFixed(4)`；`s.baseRaw = r.close; s.baseRawDate = r.date; s.baseEvents = a.applied; s.baseAdjusted = +a.adjusted.toFixed(4);`
   - `a.applied.length === 0` → 狀態：「抓到 {r.date} 的收盤價 {r.close} 元；之後沒有分割、除權息。」（日期不同時照舊加「（{日期} 沒開盤，用前一個交易日）」）
   - 有事件 → 狀態：「抓到 {r.date} 的收盤價 {r.close} 元；之後有 {n} 個股票事件，已換算成現在的基準 {price(a.adjusted)}：」後面接 `h('ul', {}, a.applied.map(e => h('li', {}, \`${e.date} ${e.note}\`)))`（狀態元素改成可以放子節點：用 `replaceChildren`）。
   - 原本「沒開盤用前一個交易日」的提示保留。
5. `from` 改成 `buy`／`manual`、或使用者手動改 `basePrice` → `s.baseEvents = []`、`s.baseRaw = NaN`（手動改過就不再宣稱有換算）。
6. 「我有記下當時的價格」的 help 加一句：「如果之後有分割或除權息，要填換算後的價格；不確定就改選「我記得日期」讓工具換算。」

read 不變（另外 `s.baseEvents ??= []`）。

### 2.4 結果
在第一項「相對基準價」**前面**，當 `s.baseFrom === 'date' && s.baseEvents?.length && s.basePrice === s.baseAdjusted` 時加一項：
- `explain({ label: '基準價已換算股票事件', value: price(s.basePrice), tone: 'info', how, means, todo })`
- how：「{s.baseRawDate} 收盤 {price(s.baseRaw)}」，每個事件接「 × {e.after} ÷ {e.before}（{e.date} {e.note}）」，最後「＝{price(s.basePrice)}。」
- means：「分割、除權息之後股價會變，不換算就會把它誤當成漲跌。換算後才能跟現價比。」
- todo：有 `kind === 'dividend'` 的事件 →「領到的現金股利，記得加進第 3 步的策略現金。」；否則不放。

### 2.5 疑似分割（`r.suspectSplit`）那一項
todo 改成陣列，兩條路：
「① 打開券商 App，照現在的股數和成本均價重填第 1 步，第 2 步選「從沒配回過」；② 第 2 步選「我記得日期」，工具會自動換算分割和除權息。」
（其餘不變：仍然不顯示買賣股數。）

## 3. 範例
`example` 不變（範例走 `buy`，沒有事件）。範例結果必須跟現在一樣：+52.5%、賣 861 股、下次 15.25／45.75。

## 4. PROOF_CMD（必跑，貼結果）

```
npm.cmd test
node -e "import('./js/core/events.js').then(e=>{const l=e.normalizeEvents({split:[{date:'2026-03-31',before_price:443.15,after_price:20.14}]});const a=e.adjustBasePrice(375.25,'2026-01-02',l);console.log(l[0].note,a.adjusted.toFixed(4),(26.3/a.adjusted-1).toFixed(4))})"
node --check js/pages/trigger5050.js
```
預期：`ℹ tests 125`、`ℹ pass 125`、`ℹ fail 0`；第二行 `分割（約 1 股拆成 22 股） 17.0541 0.5421`；第三行無輸出。

## 5. 回報 `collab/from-codex.md`（欄位寫死，不貼程式碼）

```
## 完成項
## 修改檔案
## PROOF_CMD 結果
- npm.cmd test：tests __ pass __ fail __
- 換算數字：__
- node --check：__
## 偏離規格或自行決定的小事
## 需要 Opus 決定的事
```
