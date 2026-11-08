# zr-toolbox 框架（Gate 0 定稿）

- 版本：**2026-11-08 v3**（v2＝加入圖解流程、首頁四大分組、Gate 4；v3＝`components.js` 新增 `lineChart`、Gate 2 拆 2a／2b、Codex 只跑單元測試）。改介面要改這份並升版，所有還寫舊行為的段落一起改。
- 依據：[decision/決策-2026-11-08.md](decision/決策-2026-11-08.md)、[HANDOFF.md](HANDOFF.md)。

## 1. 技術約定

- 純靜態，**無建置步驟、無外部套件**。瀏覽器端用原生 ES modules（`<script type="module">`），Node 端 `package.json` 設 `"type": "module"`，同一份 `js/core` 兩邊共用。
- 所有連結用相對路徑（部署在 GitHub Pages 的 `/<repo>/` 底下也能用）。
- 手機優先：390px 寬不得水平捲動（冒煙測試會檢查）。
- 不用 `innerHTML` 組畫面，一律用 `js/ui/components.js` 的 `h()` 與元件（防 XSS、樣式一致）。
- 不用 localStorage 存計算輸入（v1 不做）；只有 Gate 3 的 FinMind token 會存。

## 2. 目錄與模組邊界

```
index.html                 首頁（捷徑＋卡片），內容由 js/pages/home.js 依 js/data/tools.js 產生
tools/<id>.html            每個工具一頁，只是殼：<main id="app"> ＋ 載入 ../js/pages/<id>.js
css/app.css                全站唯一樣式檔
img/<id>/*.svg             各工具的圖解（sol 畫，Opus 驗數字）
docs/figures/<id>-<名>.md  每張圖給 sol 的繪圖提示（留存，改圖時改這份重畫）
js/core/*.js               純函式：不碰 DOM、不碰網路。所有公式只在這裡。
js/data/tools.js           分組 GROUPS＋卡片清單（id、編號、group、標題、一句話、href、gate、status、terms）
js/data/glossary.js        術語辭典資料（欄位見檔頭註解）
js/ui/components.js        共用 UI 元件（簽名見檔頭註解；Gate 0 定死，v3 加 lineChart）
js/pages/<id>.js           各工具頁：組欄位 → 呼叫 core → 顯示結果。不寫公式。
tests/*.test.js            node:test 單元測試
scripts/smoke.mjs          冒煙測試（無頭 Chrome，逐頁按「帶入範例」）
```

依賴方向只能 `pages → ui, core, data`；`ui → data, core/format`；`core` 不依賴任何其他層。

## 3. 純函式介面（`js/core`，Gate 0 已實作＋測試）

| 檔案 | 函式 | 用在 | 來源 |
|---|---|---|---|
| format.js | `parseNum(text)`、`fmtMoney(n)`、`fmtPct(n, digits=1)`、`fmtX(n, digits=2)` | 全部 | 新 |
| trigger.js | `checkTrigger({basePrice, nowPrice, threshold=.5})` → `{change, hit, direction}`；`split5050({lever, cash})` → `{total, target, leverTrade, cashAfter}` | ② | 新（research.js 的頁內邏輯抽出） |
| rebalance.js | `TEMPLATES`（7 個：5050、6040、532/442/433 股版、532/442 債版）；`dueDate(last, months)`；`rebalance({template, holdings[3], contribution, fee, months, last, asOf})` → `{total, targets, trades, due, ready, exposure}` | ③ | research-model 移植＋模板擴充 |
| pledge.js | `pledgeStress(p, decline)`（欄位見檔頭；`remedy: 'repay'|'collateral'`；Gate 2b 加回傳 `nowRatio`、`callDrop`）；`pledgeTable(p, declines)` | ④ | research-model `stress()` 移植 |
| decay.js | `simulateDaily(indexReturns, {leverage=2, dailyCost=0})` → `{indexPath, leveredPath, indexTotal, leveredTotal, naive, gap}`；`makeScenario('chop'|'trend', days, size)` | ⑥ | 新 |
| drawdown.js | `recoveryGain(d)`、`maxDrawdown(values)` → `{mdd, peakIndex, troughIndex}`、`yearsToRecover(d, r)` | ⑧ | 新 |
| exposure.js | `exposureNow({positions:[{value,beta}], cash, debt})` → `{assets, net, exposure, assetBasis, netBasis, leverageRatio}`；`betaPlan(p)` | ⑪（及 ① 教程對照） | betaPlan 為 research-model 移植 |
| finmind.js | `finmindAction({status, usedToken, retried})` → `{action, message}` | Gate 3 token 處理 | 新 |

**單位規約**：core 一律用小數，不用百分比數字——比例、跌幅、利率、維持率都是小數（利率 3%＝`0.03`、追繳線 130%＝`1.3`、跌 30%＝`0.3`、權重 40%＝`0.4`）；金額為新台幣元；`days` 為日曆天整數。頁面欄位讓使用者輸入百分比數字（例 130），**頁面自己除以 100** 再傳進 core，顯示時用 `fmtPct`。

純函式丟出的 `Error.message` 是給使用者看的中文，頁面直接顯示，不另外改寫。

**FinMind 回應規則**（`finmindAction`，決策 D5 的落實版）：200 正常；402 顯示「申請免費會員 token（每小時 600 次）」教學；**403 一律停止**（可能是 IP 被封 30 分鐘，清 token 或重試只會更糟）；400／401 且有帶 token 且還沒重試 → 不帶 token 重試一次，**重試回 200 才清掉 token**（400 也可能是參數錯，不能直接判定 token 壞）；其他一律停止並請使用者手動輸入股價。

## 4. 工具頁樣板（照抄 `js/pages/trigger5050.js`）

每頁由上到下固定五段：

1. `toolHeader(tool)`（tool 從 `TOOLS` 依 id 取）
2. 輸入卡：每個欄位 `numberField`／`selectField`，`label`＝正式名稱，`plain`＝一句白話副標，有術語就給 `termId`（ⓘ，一欄最多一顆）；卡片最後一個是 `exampleButton(values, update)`
3. 結果卡：`<div class="result" aria-live="polite">`，`app` 的 `input` 事件即時重算；有缺欄位時顯示「填完 N 格就會算」；錯誤用 `showError(result, e.message)`
4. 「怎麼讀」卡：**先放至少一張圖解** `figure({src, alt, caption})`，再 2–3 段白話
5. `disclaimer('general')`；**原計算機教程與 ⑪ 用 `disclaimer('executable')`**（決策補充 1：可執行不等於安全）

做完一個工具：在 `tools.js` 把 `status` 改成 `'ready'`、填 `terms`；用到的術語必須已在 `glossary.js`。

## 5. 圖解（使用者 2026-11-08：每個工具都要圖文解說，圖交給 sol 畫）

- 每個工具頁（含辭典）至少一張圖解，放 `img/<工具id>/`；冒煙測試檢查圖存在且載入成功。
- 流程：寫繪圖提示 `docs/figures/<id>-<名>.md`（照抄 `trigger5050-split-5050.md` 的格式：要表達的事＋**寫死的數字**＋技術規格）→ 免費 sol 一次問答出 SVG（`ask-file.mts --sol --effort high`，可用 `batch` 一次多張）→ 存檔 → 無頭 Chrome 淺色／深色各截一張 → **Opus 對照 core 函式核對圖上每個數字**，錯就改提示重畫，最多 2 輪。
- 圖上的數字必須和該頁「帶入範例」或 core 測試裡的數字一致，不准另編。
- SVG 規格：`viewBox="0 0 360 H"`、不設 width/height、有 `<title>`／`<desc>`、顏色寫在內部 `<style>` 並含 `prefers-color-scheme: dark`、背景透明、最小字 12；禁止 script、foreignObject、外部資源、filter、動畫。色票見提示範本。

## 6. 測試與驗收

- 單元測試：`npm test`。預期值由 Opus 定，外包**不得改預期值或刪測試**；覺得預期值錯就停下回報。
- 冒煙測試：`npm run smoke`（首頁卡片數、每個 ready 頁：無 JS 例外、範例按鈕有結果、免責區在最後、無水平捲動）。
- **Gate 0 的 PROOF_CMD**：`npm test && npm run smoke`
  預期：`tests 44`、`pass 43`、`fail 0`、`todo 1`（辭典必備詞，Gate 1 解除）；`smoke pages 2 pass 2 fail 0`。

## 7. Gate 規劃（定稿）

| Gate | 內容 | 執行 | PROOF_CMD 預期 |
|---|---|---|---|
| 0 | 本文件、core 全部純函式＋40 項測試、UI 元件（含 `figure`）、分組首頁、樣板工具 ②（含第一張 sol 圖解）、冒煙測試 | Opus | 見上 |
| 1 | ⑫ 辭典（18 個必備詞，見 `tests/registry.test.js` 的 `REQUIRED`；頁面可依 `#id` 定位、上方有關鍵字篩選）＋ ③ 定期配比再平衡（股版／債版分組選模板，註明同名不同配置；不收「預期年化 x 倍大盤」） | 訂閱 Codex sol（面板＋md） | `npm test`：fail 0、todo 0；smoke：pages 4 全過 |
| 2a | ⑥ 複利偏離（用 `lineChart`）、⑧ 回撤 | 訂閱 Codex sol | tests 46 全過；smoke pages 6 全過 |
| 2b | ④ 質押壓測（還款／補擔保兩種分開顯示、130% 寫「多數券商契約，以契約為準」、結果附 `executable` 免責）、⑪ 曝險倍數 | 訂閱 Codex sol | tests 48 全過；smoke：pages 8 全過 |
| 3 | ① 原計算機教程（依**線上版**欄位）、FinMind token 申請教學、PWA（manifest、sw、新版提示）、部署 | 訂閱 Codex sol＋Opus（部署） | smoke 全過＋手機實機看一次 |
| 4 | 其他股票計算機：⑤ 融資維持率、⑦ 定期定額／年化報酬、⑨ 交易成本、⑩ 股息殖利率與除權息（開工前 Opus 先定 core 簽名與測試預期值） | 訂閱 Codex sol | smoke 全過 |

執行者使用者 2026-11-08 指定為訂閱 Codex sol（面板不能用時改 Sonnet），派工流程見 HANDOFF.md。每個 Gate 的圖解由 Opus 派免費 sol 畫、Opus 驗；寫頁面的外包只負責用 `figure()` 放進去。

圖表：`lineChart` 已於 v3 由 Opus 實作（簽名見 `components.js` 檔頭），外包只呼叫、不改。

**Codex 面板限制**：沙箱裡 PowerShell 擋 `npm.ps1`、無頭 Chrome 開不起來。任務書的 PROOF_CMD 給 Codex 的只有 `npm.cmd test`；`npm run smoke` 由 Opus 驗收時跑。

## 8. 工具 ①（b）白話版計算機：已定（2026-11-08）

使用者回覆：工具箱是四大類多個計算機（正二教學、正二變種、正二槓桿、其他股票計算機例如融資），全部都要圖文解說。據此定案：**不另做同公式的白話版計算機，由工具 ⑪ 擔任白話版；① 做逐欄圖文教程。** 理由：

- 線上版和 `betaPlan` 公式相同，但行為有三處不同：多檔持股／多檔正二、「目標比重」觸發的完整重配模式、普通持股曝險已超過目標時線上版默默把正二設 0（`betaPlan` 回報「達不到」）。再做一個「同公式」版本，朋友會看到兩個計算機給出不同答案，反而更難懂。
- ⑪ 已經是白話版：先回答「我現在等於幾倍大盤」（`exposureNow`），再回答「想調到 X 倍要買賣多少」（`betaPlan`，單一普通持股合計＋單一正二）。① 教程每欄附「在 ⑪ 對應哪一格」，並寫明上面三處差異，最後單向連到線上原頁。
- token 402 教學放在 ① 的「FinMind token」欄位說明裡，與 Gate 3 的 token 教學頁共用同一份文案。
