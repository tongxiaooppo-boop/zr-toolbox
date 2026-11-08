# Gate 1 任務書：⑫ 術語辭典＋③ 定期配比再平衡

- 版本：2026-11-08 v1（對應 FRAMEWORK.md 2026-11-08 v2）
- 執行者：訂閱 Codex sol。直接在本 repo（`D:\ok\zr-toolbox`）工作。
- **不要 commit**，做完寫 `collab/from-codex.md` 就停；Opus 看 `git diff` 驗收後 commit。

## 0. 要讀的檔案（只准讀這些）

| 檔案 | 為什麼 |
|---|---|
| `js/pages/trigger5050.js` | **樣板，照抄結構** |
| `tools/trigger5050.html` | 頁殼樣板 |
| `js/ui/components.js` | 可用元件與簽名（檔頭註解） |
| `js/core/rebalance.js` | ③ 要呼叫的 `TEMPLATES`、`rebalance()` |
| `js/core/format.js` | `parseNum`、`fmtMoney`、`fmtPct`、`fmtX` |
| `js/data/glossary.js` | 辭典資料格式（檔頭註解）與現有 3 筆 |
| `js/data/tools.js` | 卡片清單 |
| `tests/registry.test.js` | 辭典欄位檢查與 `REQUIRED` 18 詞 |
| `css/app.css` | 現有樣式（只准在檔尾追加） |

不要讀 `docs/` 以外的舊專案（`D:\ok\zr-calc` 等）；需要的事實已寫在本檔第 3 節。

## 1. 規則（違反就退回）

- **不准改**：`js/core/**`、`js/ui/components.js`、`scripts/smoke.mjs`、`img/**`、`tests/core.test.js`、`tests/ported.test.js`、`docs/**`。
- `tests/registry.test.js` 只准做一件事：把 `{ todo: 'Gate 1' }` 參數拿掉（含前面的逗號），讓必備詞測試正式生效。不准改 `REQUIRED`、不准改其他測試。
- 頁面不寫公式，只呼叫 `js/core`；不用 `innerHTML`，一律用 `h()` 與元件。
- 不用 localStorage、不連網路、不加外部套件。
- 暫存檔、一次性腳本不准留在 repo，結束前刪掉。
- 不確定就停下，寫進回報「需要決定的事」（格式：問題一句＋2–3 選項＋你的建議）。小疑問（例如措辭）自行決定並在回報註明，不用停。最多停下問 2 次。

## 2. 要做的事（3 步）

### 步驟 1：辭典資料（`js/data/glossary.js`）

- 保留現有 3 筆（`daily-2x`、`rebalance`、`base-price`）原文不動，只能在它們的 `related` 陣列**追加**新 id。
- 依第 3 節新增 15 筆，讓 `REQUIRED` 18 個 id 全部存在。順序：依第 3 節表格順序放在現有 3 筆之後。
- 欄位規則（測試會查）：`plain` ≤ 40 字（用 `[...s].length` 算）且**不用其他術語**；`example` 以「例：」開頭；`related` 的 id 必須存在；`aka` 是陣列。
- 第 3 節的「必須寫進去的事實／數字」一個都不能改，也不准另外加沒列出的事實（例如其他券商的數字、沒列的 API 次數）。措辭可以自己寫，白話優先。

### 步驟 2：⑫ 辭典頁

新增 `tools/glossary.html`（照抄 `tools/trigger5050.html`，改 title 為「術語辭典｜正二工具箱」、script 改 `../js/pages/glossary.js`）與 `js/pages/glossary.js`。由上到下：

1. `toolHeader(tool)`（`TOOLS.find(t => t.id === 'glossary')`）
2. 一張 `.card`：`h2`「先看這張圖」＋ `figure({ src: '../img/glossary/exposure-basis.svg', alt: '同一個例子算出淨資產、曝險、兩種口徑與資產槓桿：持股 1,000 萬、現金 200 萬、借款 300 萬，淨資產 900 萬，淨資產口徑約 1.11 倍、總資產口徑約 0.83 倍、資產槓桿約 1.33 倍。', caption: '同一個人，換個分母，倍數就不一樣。' })`，再一段白話：「下面每個詞都先給一句白話，再補一個數字例子。在其他工具按 ⓘ 也會看到同一張小卡。」
3. 一張 `.card`：關鍵字篩選
   - `h('input', { id: 'q', type: 'search', placeholder: '輸入關鍵字，例如 維持率、Beta', autocomplete: 'off', 'aria-label': '篩選術語', class: 'glossary-filter' })`
   - 下方一行 `h('p', { class: 'muted', id: 'q-count' })` 顯示「共 N 個詞」或「找到 N 個」；0 個時顯示「找不到，換個關鍵字試試。」
   - 篩選規則：關鍵字去頭尾空白、英文不分大小寫；符合 `term`、`aka` 任一、`plain`、`detail` 任一者就顯示。空字串＝全部顯示。用 `el.hidden = true/false` 隱藏，不重建 DOM。監聽 `q` 的 `input` 事件。
4. 每個詞一個包裝：`h('div', { class: 'glossary-item', id: t.id }, termCard(t.id))`，全部放在一張 `.card` 裡，順序同 `GLOSSARY`。（`termCard` 內部 id 是 `term-<id>`，外層用 `<id>`，所以兩者不衝突；其他頁的「相關」連結是 `glossary.html#<id>`，指到外層。）
5. 定位：畫面建好後執行 `focusHash()`，並監聽 `hashchange`。`focusHash`：讀 `decodeURIComponent(location.hash.slice(1))`，找到對應 `.glossary-item` 就清空篩選（`q.value = ''` 並重新套用篩選）、`scrollIntoView({ block: 'start' })`、加上 class `flash`（2 秒後移除）。
6. 最後 `disclaimer('general')`。
7. 這頁沒有「帶入範例」也沒有 `.result`，不要加。

`css/app.css` 檔尾追加（只准追加這些 class，用現有 CSS 變數）：`.glossary-filter`（寬 100%、與其他 input 一致的外觀）、`.glossary-item`（項目間距、分隔線）、`.glossary-item.flash`（淡色背景提示，可用 `var(--soft)`）。

### 步驟 3：③ 定期配比再平衡頁

新增 `tools/rebalance.html`（title「定期配比再平衡｜正二工具箱」）與 `js/pages/rebalance.js`，照樣板五段：

**輸入卡**（順序如下）

| id | 元件 | label | plain（白話副標） | termId | 其他 |
|---|---|---|---|---|---|
| `template` | `selectField` | 配置模板 | 股版和債版名字一樣、內容不同，選之前看清楚 | — | options 見下 |
| `months` | `selectField` | 再平衡週期 | 多久配回一次，不看漲跌 | `rebalance` | `[{value:'1',label:'每月'},{value:'3',label:'每季'},{value:'6',label:'每半年'},{value:'12',label:'每年'}]`，預設 `'6'` |
| `last` | 日期欄位 | 上次配回日 | 上次照比例配好的日期 | — | `type="date"` |
| `asOf` | 日期欄位 | 檢視日 | 預設今天 | — | `type="date"`，預設今天（本機時區） |
| `h0`、`h1`、`h2` | `numberField` | `<資產名>市值`（例「原型市值」） | h0：「這個策略裡的這一部分現在值多少」；h1、h2 同 | — | suffix `元` |
| `contribution` | `numberField` | 這次新投入 | 沒有就留白 | — | suffix `元` |
| `fee` | `numberField` | 費用預算 | 先扣掉手續費、稅的預留金額，沒有就留白 | — | suffix `元` |
| — | `exampleButton` | | | | 值見下 |

- `template` options（依序，value 用 `TEMPLATES` 的 key；label 照抄）：
  - `5050`：`股版｜50／50（正二 50、現金 50）`
  - `6040`：`股版｜60／40（正二 60、現金 40）`
  - `532-stock`：`股版｜532（原型 50、正二 30、現金 20）`
  - `442-stock`：`股版｜442（原型 40、正二 40、現金 20）`
  - `433-stock`：`股版｜433（原型 40、正二 30、現金 30）`
  - `532-bond`：`債版｜532（正二 50、美債 30、現金 20）`
  - `442-bond`：`債版｜442（正二 40、美債 40、現金 20）`
  - 預設 `532-stock`。
- **日期欄位**：components 沒有日期元件，不准改 components.js；在頁內寫一個小函式，產生和 `numberField` 相同的結構：`div.field > label[for] + small.plain-sub + div.input-row > input[type=date]`。讀值直接用 `document.getElementById(id).value`（`YYYY-MM-DD` 字串，空字串＝沒填）。
  今天：`new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)`。
- **資產名跟著模板變**：`TEMPLATES[key].assets` 給三個名字。模板改變時更新 h0–h2 的 label 文字（例：`document.querySelector('label[for=h0]').firstChild.textContent = assets[0] + '市值'`）。h0–h2 **都不給 termId**；本頁唯一的 ⓘ 是 `months` 的 `rebalance`。
- 讀數字用 `readNumbers(['h0','h1','h2','contribution','fee'])`；`contribution`、`fee` 是 NaN（留白）時當 0；`h0–h2` 任一 NaN 或日期沒填 → 顯示 `填完 N 格就會算。`（N＝還沒填的必填格數：h0、h1、h2、last、asOf）。
- `months` 用 `Number(document.getElementById('months').value)`。
- 呼叫 `rebalance({ template, holdings: [h0,h1,h2], contribution, fee, months, last, asOf })`；丟錯就 `showError(result, e.message)`。
- `app` 監聽 `input` 與 `change` 兩個事件都要重算（select 與日期欄位在部分瀏覽器只發 `change`）。

**範例值**（`exampleButton`，和圖解、`tests/core.test.js` 的測試一致，不准改）：
`{ template: '532-stock', months: '6', last: '2026-05-08', asOf: '2026-11-08', h0: 450000, h1: 210000, h2: 200000, contribution: '', fee: '' }`
注意：exampleButton 只設值、不會觸發事件；它會呼叫 `update`，所以 `update` 裡要先依目前 `template` 更新三個 label 再計算。

**結果卡**（`.result`，`aria-live="polite"`）

1. 第一組 `.metrics`：
   - `metric('下次到期日', r.due)`
   - `metric('到期了嗎？', r.ready ? '到期了，可以配回' : '還沒到期', r.ready ? 'warn' : 'ok')`
2. 第二組 `.metrics`：
   - `metric('策略總額', fmtMoney(r.total))`
   - `metric('近似曝險', '約 ' + fmtX(r.exposure) + '大盤')`（fmtX 已含「倍」，結果像「約 1.10 倍大盤」）
3. 一個 `h('table', { class: 'trade-table' }, …)`：表頭「部位｜目標金額｜要做的事」；每列：資產名、`fmtMoney(r.targets[i])`、`trades[i] > 0` → `買進 NT$ x`，`< 0` → `賣出 NT$ x`（現金那列用「用掉 NT$ x」／「增加 NT$ x」），`= 0`（`Math.abs < 0.5`）→ `不動`。金額用 `fmtMoney(Math.abs(...))`。
4. 若 `!r.ready`：`h('p', { class: 'note' }, '還沒到期，照規則先不用動；上面是「如果今天配回」的金額。')`
5. 固定一行：`h('p', { class: 'note' }, '近似曝險＝原型權重×1＋正二權重×2，美債與現金算 0，是簡化，不是預期報酬。')`
- **不准**顯示任何「預期年化」「x 倍大盤報酬」之類的報酬預測。

css 檔尾追加 `.trade-table`（寬 100%、字 14px、儲存格 padding、手機 390px 不得撐出水平捲動）。

**怎麼讀卡**

- `figure({ src: '../img/rebalance/532-stock.svg', alt: '532 股版範例：到期日原型 45 萬、正二 21 萬、現金 20 萬，合計 86 萬；配回後原型 43 萬、正二 25.8 萬、現金 17.2 萬，原型賣 2 萬、正二買 4.8 萬、現金用掉 2.8 萬。', caption: '不看漲跌，到期就用當時的總額配回原比例。' })`
- 三段白話（照抄）：
  1. 「定期配比只看時間：選好比例和週期，到期那天用當時的總額照比例配回，中間漲跌都不動。這和 ② 的 50/50 觸發不同，那個看的是正二漲跌一半。」
  2. 「網路上的 532、442 有兩種：股版是原型／正二／現金，債版是正二／美債／現金。名字一樣、風險不同，別人說 442 時先問是哪一種。」
  3. 「算出來的是各部位的目標金額，不是下單股數；實際下單還要看股價、零股、手續費和稅。到期那天休市就順延到下一個交易日。」
- 最後 `disclaimer('general')`。

### 步驟 4（收尾）：`js/data/tools.js`

- `glossary`：`status: 'ready'`，`terms: []` 不動。
- `rebalance`：`status: 'ready'`，`terms: ['rebalance', 'beta', 'exposure']`（在 ③ 頁要有用到 `rebalance` 的 ⓘ，`beta`、`exposure` 可以只列不用）。
- 不改其他卡片。

## 3. 辭典新增 15 筆：必須寫進去的事實

單位用中文數字＋萬或元；百分比照寫。`related` 依「相關」欄。

| id | term | aka | 必須寫進去的事實／數字 | 相關 |
|---|---|---|---|---|
| `beta` | Beta | `['β']` | 某部位跟大盤一起漲跌的程度。本工具箱用近似值：原型（大盤 ETF）1、正二 2、現金與美債 0（美債 0 是簡化）。是教學用近似，不是統計算出來的值。例：正二 Beta 2，大盤某天漲 1%，正二那天約漲 2%。 | `exposure`、`daily-2x` |
| `exposure` | 曝險 | `['曝險金額', 'Beta 曝險']` | 會跟著大盤漲跌的金額＝各部位市值×Beta 加總。例：持股 1,000 萬（Beta 1）＋正二 130 萬（Beta 2）＝曝險 1,260 萬。 | `beta`、`basis`、`net-assets` |
| `net-assets` | 淨資產 | `['自有資金']` | 總資產（持股＋現金）扣掉借款，才是自己的錢。例：持股 1,000 萬＋現金 200 萬－借款 300 萬＝淨資產 900 萬。 | `exposure`、`leverage-ratio` |
| `basis` | 口徑 | `['淨資產口徑', '總資產口徑']` | 算「幾倍大盤」時除以哪個分母。淨資產口徑＝曝險÷淨資產；總資產口徑＝曝險÷總資產。原計算機有「口徑」欄位。例：曝險 1,000 萬、淨資產 900 萬、總資產 1,200 萬 → 淨資產口徑約 1.11 倍、總資產口徑約 0.83 倍。 | `exposure`、`net-assets` |
| `leverage-ratio` | 資產槓桿 | `[]` | 總資產÷淨資產，看借了多少錢；和曝險倍數不是同一件事。例：總資產 1,200 萬、淨資產 900 萬 → 約 1.33 倍；再用 130 萬現金買正二後，淨資產口徑曝險是 1.4 倍，資產槓桿仍約 1.33 倍。 | `net-assets`、`basis` |
| `volatility-decay` | 波動耗損 | `['複利偏離']` | 每天重新槓桿造成的偏離。大盤先漲 10% 再跌約 9.09% 會回到原點，理想每日 2 倍卻約虧 1.82%。單邊趨勢時偏離可能是正的，不能用固定耗損率表示。例：用上面這組數字。 | `daily-2x`、`tracking-error` |
| `tracking-error` | 追蹤誤差 | `[]` | 正二實際每日漲跌和「指數×2」的差距，來源有費用、期貨等衍生工具、基金曝險不是每天剛好 200%（元大 00631L 揭露曝險範圍 180%–220%）。例：要標明是假設，例如「例：假設某天臺灣 50 漲 1%，理想是 +2%，正二實際 +1.9%，差的 0.1 個百分點就是追蹤誤差。」 | `daily-2x`、`premium-discount` |
| `premium-discount` | 折溢價 | `['溢價', '折價']` | ETF 市價和淨值（每單位真正值多少）的差。市價高於淨值叫溢價，低於叫折價；溢價時買進等於多付。例：淨值 100 元、市價 101 元 → 溢價 1%。 | `tracking-error` |
| `maintenance-ratio` | 維持率 | `['擔保維持率']` | 擔保品現在算多少錢÷借款（含利息）。例：持股算 100 萬、借 60 萬 → 約 166.67%；持股跌 30% → 約 116.67%。 | `margin-call`、`pledge` |
| `margin-call` | 追繳 | `['斷頭前通知']` | 維持率跌破追繳線就要在期限內還款或補擔保，否則可能被賣掉擔保品。追繳線**多數券商契約是 130%，以你的契約為準**（新光證券 2024.03 公開版為低於 130% 通知、166% 解除）。還款和補擔保擇一，需要的金額不一樣。例：維持率 116.67% 低於 130% → 收到追繳。 | `maintenance-ratio`、`pledge` |
| `pledge` | 質押 | `['不限用途借貸', '股票質押']` | 把持股押給券商借錢，股票還是你的，但借款期間不能隨意賣。借來的錢拿去買正二，下跌時擔保品和正二會一起跌。例：持股 100 萬借 60 萬，維持率約 166.67%。 | `maintenance-ratio`、`margin-call` |
| `drawdown` | 回撤 | `['最大回撤', 'MDD']` | 從前一個高點往下跌了多少；最大回撤是一段期間裡最大的那次。例：從 120 萬跌到 84 萬 → 回撤 30%。 | `recovery-gain` |
| `recovery-gain` | 回本漲幅 | `[]` | 跌了 d 之後要漲 d÷(1−d) 才回本，跌越多要漲越多。例：跌 30% 要漲約 42.9%；跌 50% 要漲 100%。 | `drawdown` |
| `closing-price` | 收盤價 | `[]` | 當天最後成交的價格；台股 13:30 收盤，13:25–13:30 是收盤集合競價。本工具箱算漲跌用收盤價就夠。例：某天正二收盤 150 元，相對基準價 100 元是 +50%。 | `base-price` |
| `finmind-token` | FinMind token | `['API token']` | FinMind 是提供台股資料的免費服務；註冊免費會員拿到 token，每小時可查 600 次。超過次數會被擋（回應碼 402）。token 像密碼，不要貼給別人。例：一天查 20 檔股價，用免費會員 token 綽綽有餘。 | `closing-price` |

現有 3 筆的 `related` 追加：`daily-2x` 加 `volatility-decay`、`tracking-error`；`base-price` 加 `closing-price`。

## 4. 驗收指令（PROOF_CMD）

```
npm test && npm run smoke
```

預期輸出（數字要完全一樣）：
- `ℹ tests 45`、`ℹ pass 45`、`ℹ fail 0`、`ℹ todo 0`
- `smoke pages 4 pass 4 fail 0`（home、glossary、trigger5050、rebalance）

另外手動確認（寫進回報）：在 390px 寬開 `tools/glossary.html#margin-call` 會捲到「追繳」並閃一下；③ 換模板時三個市值欄位的名稱跟著變。

## 5. 回報（寫 `collab/from-codex.md`，只填這些欄位，不貼程式碼）

```
## 完成項
- 步驟 1：…（新增幾筆）
- 步驟 2：…
- 步驟 3：…
- 步驟 4：…
## 異動檔案
- （git status 的清單）
## PROOF_CMD 輸出
- tests / pass / fail / todo：
- smoke：
## 手動確認
- glossary #hash 定位：
- ③ 換模板 label：
## 自行決定的小事
- …
## 需要決定的事
- （沒有就寫「無」）
```
