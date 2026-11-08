# Gate 2a 任務書：⑥ 正二不是兩倍？＋⑧ 跌多少要漲多少才回本

- 版本：2026-11-08 v1（對應 FRAMEWORK.md 2026-11-08 v3）。Gate 1 的任務書已完成，以本檔為準。
- 執行者：訂閱 Codex sol。直接在本 repo（`D:\ok\zr-toolbox`）工作。
- **不要 commit**，做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`（PowerShell 會擋 `npm.ps1`）。**不要跑 `npm run smoke`**（沙箱開不了 Chrome，會卡住），冒煙測試由 Opus 跑。

## 0. 要讀的檔案（只准讀這些）

| 檔案 | 為什麼 |
|---|---|
| `js/pages/rebalance.js` | **樣板，照抄結構**（含「label 跟著選單變」與 `change` 事件的寫法） |
| `tools/rebalance.html` | 頁殼樣板 |
| `js/ui/components.js` | 元件簽名（檔頭註解），**新元件 `lineChart`** |
| `js/core/decay.js` | ⑥ 用 `simulateDaily`、`makeScenario` |
| `js/core/drawdown.js` | ⑧ 用 `recoveryGain`、`maxDrawdown`、`yearsToRecover` |
| `js/core/format.js` | `parseNum`、`fmtPct` |
| `js/data/tools.js` | 卡片清單 |
| `css/app.css` | 只准在檔尾追加 |

## 1. 規則（違反就退回）

- **不准改**：`js/core/**`、`js/ui/components.js`、`js/data/glossary.js`、`scripts/**`、`img/**`、`tests/**`、`docs/**`、其他工具頁。
- 頁面不寫公式，只呼叫 `js/core`（把百分比數字除以 100、把文字切成數字陣列不算公式）；不用 `innerHTML`，一律用 `h()` 與元件。
- 不用 localStorage、不連網路、不加套件。暫存檔、一次性腳本結束前刪掉，不准留在 repo。
- core 丟出的 `Error.message` 直接用 `showError` 顯示，不改寫。
- 不確定就停下，寫進回報「需要決定的事」（問題一句＋2–3 選項＋建議）。小疑問自行決定並註明。最多停 2 次。

## 2. 步驟 1：⑥ 正二不是兩倍？

新增 `tools/decay.html`（title「正二不是兩倍？｜正二工具箱」）與 `js/pages/decay.js`，照樣板五段。

**輸入卡**

| id | 元件 | label | plain | termId | 其他 |
|---|---|---|---|---|---|
| `scenario` | `selectField` | 行情情境 | 同樣的天數，來回震盪和一路漲跌結果差很多 | `volatility-decay` | options：`[{value:'chop',label:'來回震盪（一天漲、一天跌）'},{value:'trend',label:'單邊趨勢（每天同方向）'}]`，預設 `'chop'` |
| `days` | `numberField` | 天數 | 模擬幾個交易日（1–2520） | — | suffix `天` |
| `size` | `numberField` | 依情境變（見下） | 依情境變 | `daily-2x` | suffix `%` |
| — | `exampleButton` | | | | `{ scenario: 'chop', days: 20, size: 5 }` |

- `size` 的 label／plain 跟著 `scenario` 變（每次 `update` 開頭更新，寫法同 rebalance 的 label；plain 用 `label.nextElementSibling`（`small.plain-sub`）的 `textContent`）：
  - chop：label「每日漲跌幅」、plain「大盤一天漲這麼多、隔天跌這麼多，例如 5」
  - trend：label「整段大盤漲跌」、plain「整段期間大盤總共漲跌幾 %，例如 10 或 −30」
- 計算：`makeScenario(scenario, days, size / 100)` → `simulateDaily(returns)`（槓桿用預設 2、費用 0）。`days` 不是整數時 core 會丟錯，照顯示。
- 缺欄位：`days`、`size` 任一 NaN → `填完 N 格就會算。`

**結果卡**

1. `.metrics`：
   - `metric('大盤整段', signed(r.indexTotal))`
   - `metric('「大盤 × 2」', signed(r.naive))`
   - `metric('正二實際', signed(r.leveredTotal), r.gap < 0 ? 'bad' : 'ok')`
   - `metric('差距', signed(r.gap), r.gap < 0 ? 'bad' : 'ok')`
   - `signed(x, digits = 1)` 是頁內小函式：`(x > 0 ? '+' : '') + fmtPct(x, digits)`（只是加正號，不算公式）。
2. `lineChart({ series: [{ name: '正二', values: r.leveredPath }, { name: '大盤', values: r.indexPath }], label: '正二與大盤的淨值走勢，起點為 0%', yFormat: v => signed(v - 1, 0), baseline: 1 })`
3. 一段 `h('p', {}, …)`：
   - `r.gap < 0`：`正二比「大盤 × 2」少了 ${fmtPct(-r.gap)}。來回震盪越多、天數越長，差距通常越大。`
   - `r.gap >= 0`：`正二比「大盤 × 2」多了 ${fmtPct(r.gap)}。一路同方向時，每天重新槓桿反而會放大結果。`
4. 固定 `h('p', { class: 'note' }, '理想化計算：沒有扣費用、追蹤誤差和折溢價，實際結果會再差一些。')`

**範例預期**（Opus 會核對）：大盤 −2.5%、大盤×2 −4.9%、正二 −9.6%、差距 −4.6%。

**怎麼讀卡**

- `figure({ src: '../img/decay/two-days.svg', alt: '兩天的例子：大盤 100 先漲 10% 到 110 再跌 10% 到 99，正二 100 先漲 20% 到 120 再跌 20% 到 96；大盤共 −1%，整段 ×2 應是 −2%，正二實際 −4%。另一例：連續 10 天每天漲 1%，大盤 +10.5%、整段 ×2 為 +20.9%、正二 +21.9%。', caption: '正二是「每天」2 倍，連續幾天下來不等於整段 2 倍。' })`
- 三段白話（照抄）：
  1. 「正二每天收盤後都會把倍數調回 2 倍，所以它保證的是『每一天』大約 2 倍，不是一個月、一年的 2 倍。」
  2. 「來回震盪時，跌下來的那天是用比較大的本金在跌，漲回去的那天是用比較小的本金在漲，一來一回就輸給『整段 × 2』。這就是常聽到的波動耗損。」
  3. 「反過來，一路往同一個方向走的時候，正二可能比整段 2 倍還多。所以不能用一個固定的『每年耗損幾 %』來估。」
- 最後 `disclaimer('general')`。

## 3. 步驟 2：⑧ 跌多少要漲多少才回本

新增 `tools/drawdown.html`（title「跌多少要漲多少才回本｜正二工具箱」）與 `js/pages/drawdown.js`。

**輸入卡**

| id | 元件 | label | plain | termId | 其他 |
|---|---|---|---|---|---|
| `drop` | `numberField` | 跌幅 | 從高點跌了幾 %，例如 30 | `recovery-gain` | suffix `%` |
| `annual` | `numberField` | 之後每年賺多少（選填） | 填了會估要幾年回本 | — | suffix `%` |
| `series` | 頁內 textarea 欄位（見下） | 淨值或股價紀錄（選填） | 用逗號或空白隔開，例：100, 120, 90 | `drawdown` | — |
| — | `exampleButton` | | | | `{ drop: 50, annual: 10, series: '100, 120, 90, 130, 65, 140' }` |

- **textarea 欄位**：components 沒有，不准改 components.js；在頁內寫小函式，結構同 `numberField`：`div.field > label[for=series]（文字＋infoChip）＋ small.plain-sub ＋ textarea#series[rows=3]`。ⓘ 用 components 的 `infoChip('drawdown')`（要 import）。`exampleButton` 會用 `el.value = ...` 填值，textarea 也適用。
- css 檔尾追加 `.field textarea`，外觀與 `input` 一致（寬 100%、padding 10px、圓角 8px、邊框、背景、字色、字級 16px、`resize: vertical`）。
- 解析紀錄：`text.split(/[\s,，、]+/).filter(Boolean).map(parseNum)`；有任何 NaN → `showError(result, '紀錄裡有不是數字的內容，請只填數字，用逗號或空白隔開。')`；筆數 < 2 → `showError(result, '紀錄至少要兩筆。')`；其餘錯誤交給 `maxDrawdown` 丟。

**計算與結果**（`.result`；`drop` 與 `series` 都空白時顯示 `填跌幅，或貼一串淨值紀錄，就會算。`）

A. `drop` 有填時：
   - `const d = drop / 100`；`metric('回本要漲', fmtPct(recoveryGain(d)), 'warn')`
   - `annual` 有填時再加 `metric('每年賺 ' + annual + '% 要', '約 ' + yearsToRecover(d, annual / 100).toFixed(1) + ' 年')`
   - A 的 metric 放同一個 `.metrics`。
B. `series` 有填時（在 A 下面，前面加 `h('h3', {}, '你的紀錄')`）：
   - `const m = maxDrawdown(values)`
   - `m.mdd === 0` → `h('p', {}, '這串紀錄沒有從高點往下跌過。')`
   - 否則 `.metrics`：`metric('最大回撤', fmtPct(m.mdd), 'bad')`、`metric('要漲多少才回到前高', fmtPct(recoveryGain(m.mdd)))`，下面一段 `h('p', {}, \`從第 ${m.peakIndex + 1} 筆（${values[m.peakIndex]}）跌到第 ${m.troughIndex + 1} 筆（${values[m.troughIndex]}）。\`)`
C. A、B 任一丟錯就整個 `showError(result, e.message)`。

**範例預期**（Opus 會核對）：回本要漲 100.0%、每年賺 10% 要約 7.3 年；最大回撤 50.0%、要漲 100.0%，「從第 4 筆（130）跌到第 5 筆（65）。」

**怎麼讀卡**

- `figure({ src: '../img/drawdown/recovery.svg', alt: '100 萬跌 50% 剩 50 萬，要漲 100% 才回到 100 萬。對照：跌 10% 要漲 11.1%、跌 20% 要漲 25%、跌 30% 要漲 42.9%、跌 40% 要漲 66.7%、跌 50% 要漲 100%。跌 50% 後每年賺 10% 約要 7.3 年回本。', caption: '跌得越深，回本要漲的幅度越大，而且不是等比例變大。' })`
- 三段白話（照抄）：
  1. 「跌和漲的基準不一樣：跌是用原本的錢算，漲是用剩下的錢算。100 萬跌 50% 剩 50 萬，50 萬要漲 100% 才回到 100 萬。」
  2. 「回撤是從前一個高點往下跌了多少；最大回撤是一段期間裡最深的那一次。貼一串淨值或股價進來，就能找出最大回撤在哪裡。」
  3. 「正二的漲跌大約是大盤的 2 倍，回撤也會比較深。考慮要放多少錢之前，先想想自己能不能等到回本。」
- 最後 `disclaimer('general')`。

## 4. 步驟 3：`js/data/tools.js`

- `decay`：`status: 'ready'`，`terms: ['daily-2x', 'volatility-decay', 'tracking-error']`
- `drawdown`：`status: 'ready'`，`terms: ['drawdown', 'recovery-gain']`
- 不改其他卡片。

## 5. 驗收指令（PROOF_CMD）

Codex 跑：

```
npm.cmd test
```

預期：`ℹ tests 46`、`ℹ pass 46`、`ℹ fail 0`、`ℹ todo 0`。

Opus 另外跑 `npm run smoke`，預期 `smoke pages 6 pass 6 fail 0`（home、decay、glossary、trigger5050、rebalance、drawdown）。

## 6. 回報（覆蓋 `collab/from-codex.md`，只填這些欄位，不貼程式碼）

```
## 完成項
- 步驟 1：…
- 步驟 2：…
- 步驟 3：…
## 異動檔案
- （git status 的清單）
## PROOF_CMD 輸出
- tests / pass / fail / todo：
## 範例實測（帶入範例後畫面上的數字）
- ⑥：大盤／大盤×2／正二／差距：
- ⑧：回本要漲／年數／最大回撤／前高回本／第幾筆到第幾筆：
## 自行決定的小事
- …
## 需要決定的事
- （沒有就寫「無」）
```
