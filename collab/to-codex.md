# Gate 3a 任務書：① 朋友那格計算機怎麼用（逐欄教程＋FinMind token 教學）

- 版本：2026-11-08 v1（對應 FRAMEWORK.md 2026-11-08 v4）。Gate 2b 的任務書已完成，以本檔為準。
- 執行者：訂閱 Codex sol。直接在本 repo（`D:\ok\zr-toolbox`）工作。
- **不要 commit**，做完寫 `collab/from-codex.md`（覆蓋舊的）就停。
- 指令一律用 `npm.cmd`。**不要跑 `npm run smoke`**，冒煙測試由 Opus 跑。
- 這頁沒有輸入和計算，只把 `js/data/calcGuide.js` 的文案排成畫面。**文案一個字都不准改**，也不准另外加說明文字（下面寫明的除外）。

## 0. 要讀的檔案（只准讀這些）

| 檔案 | 為什麼 |
|---|---|
| `js/data/calcGuide.js` | 全部文案與資料結構（檔頭註解有欄位說明） |
| `js/pages/glossary.js` | 樣板：沒有輸入的頁面怎麼寫、`#id` 定位的寫法 |
| `tools/pledge.html` | **頁殼樣板（含 manifest 與 `pwa.js`，一行都不能少）** |
| `js/ui/components.js` | 元件簽名（檔頭註解） |
| `js/data/tools.js` | 卡片清單 |
| `css/app.css` | 只准在檔尾追加 |

## 1. 規則（違反就退回）

- **不准改**：`js/core/**`、`js/ui/components.js`、`js/data/glossary.js`、`js/data/calcGuide.js`、`js/pwa.js`、`sw.js`、`manifest.webmanifest`、`scripts/**`、`img/**`、`tests/**`、`docs/**`、其他工具頁與 html。
- 不用 `innerHTML`，一律用 `h()` 與元件。不用 localStorage、不連網路、不加套件。暫存檔結束前刪掉。
- 不確定就停下，寫進回報「需要決定的事」（問題一句＋2–3 選項＋建議）。小疑問自行決定並註明。最多停 2 次。

## 2. 步驟 1：頁面

新增 `tools/calc-guide.html`（照抄 `tools/pledge.html`，只改 title 為「朋友那格計算機怎麼用｜正二工具箱」與頁面 script 為 `../js/pages/calc-guide.js`）與 `js/pages/calc-guide.js`。

由上到下：

1. `toolHeader(tool)`（`TOOLS` 依 id `'calc-guide'` 取）
2. 開頭卡 `section.card`：
   - `h('p', {}, '這頁一格一格說明朋友在用的「正二平衡計算器」。看完可以到原頁操作，也可以用工具箱的 ⑪ 算同一件事。')`
   - 按鈕連結：`h('a', { class: 'button-link', href: ONLINE_URL, target: '_blank', rel: 'noopener' }, '打開原計算器 ↗')`
   - `figure({ src: '../img/calc-guide/map.svg', alt: '原計算器四個區塊對應 ⑪：持股對股票市值（各檔加總）、正二 ETF 對正二市值、現金與負債對現金與借款、目標對目標倍數與倍數怎麼算。兩邊都按範例：股票 1,000 萬、現金 200 萬、負債 300 萬、目標 1.4，淨資產 900 萬，需買進正二 NT$ 1,300,000。', caption: '原計算器的每一區，都能在 ⑪ 找到對應的格子。' })`
   - 目錄 `h('nav', { class: 'guide-toc' }, …)`：每個 `GUIDE_SECTIONS` 一個 `<a href="#${s.id}">${s.title}</a>`，再加 `#differences`「和 ⑪ 不一樣的地方」、`#token`「FinMind token 怎麼申請」。
3. 每個 `GUIDE_SECTIONS` 一張 `section.card`，`id: s.id`：
   - `h('h2', {}, s.title)`、`h('p', {}, s.intro)`
   - 每個 field 一個 `h('div', { class: 'field guide-field' }, …)`（`.field` 是為了讓 ⓘ 小卡展開在這格底下）：
     - `h('h3', {}, f.name, f.termId ? infoChip(f.termId) : null)`
     - `h('p', {}, f.what)`
     - `f.tip` 有值：`h('p', { class: 'tip' }, f.tip)`
     - `f.toolbox` 有值：`h('p', { class: 'map' }, '⑪ 對應：', f.toolbox)`
4. `section.card`，`id: 'differences'`：`h2`「和 ⑪ 不一樣的地方」；`h('ul', {}, DIFFERENCES.map(d => h('li', {}, d)))`；`h('p', {}, h('a', { href: 'exposure.html' }, '打開 ⑪ 我現在等於幾倍大盤'))`
5. `section.card`，`id: 'token'`：
   - `h2`「FinMind token 怎麼申請」，再加 `infoChip('finmind-token')` 放在 h2 裡（h2 包在 `h('div', { class: 'field' }, …)` 裡，讓小卡有地方展開）
   - `h('p', {}, TOKEN_GUIDE.why)`、`h('p', {}, TOKEN_GUIDE.limit)`
   - `h('ol', {}, TOKEN_GUIDE.steps.map(s => h('li', {}, s)))`
   - `h('h3', {}, '看到錯誤怎麼辦')`，每個 error 一個 `div.guide-field`：`h('p', {}, h('strong', {}, e.sign))`、`h('p', {}, e.meaning)`、`h('p', { class: 'tip' }, e.todo)`
   - `h('h3', {}, '保密')`、`h('p', {}, TOKEN_GUIDE.privacy)`
6. **`disclaimer('executable')`**（main 的最後一個元素）。
7. `app.append(...)` 之後：`location.hash` 有值時 `document.getElementById(location.hash.slice(1))?.scrollIntoView()`（照 glossary 的寫法）。

**css 檔尾追加**：
- `.button-link`：inline-block、padding 10px 16px、圓角 8px、背景 `var(--accent)`、字色 `var(--card)`、無底線、粗體、上下 margin 8px
- `.guide-toc a`：block、padding 4px 0
- `.guide-field`：上邊框 `1px solid var(--line)`、上下 padding 10px；`.guide-field h3` 字級 16px、margin 0 0 4px
- `.tip`：字級 14px、色 `var(--muted)`；`.map`：字級 14px、色 `var(--accent)`

## 3. 步驟 2：`js/data/tools.js`

- `calc-guide`：`status: 'ready'`，`terms: ['beta', 'exposure', 'basis', 'net-assets', 'leverage-ratio', 'daily-2x', 'closing-price', 'finmind-token']`
- 不改其他卡片。

## 4. 驗收指令（PROOF_CMD）

Codex 跑：

```
npm.cmd test
```

預期：`ℹ tests 51`、`ℹ pass 51`、`ℹ fail 0`、`ℹ todo 0`。

Opus 另外跑 `npm run smoke`，預期 `smoke pages 9 pass 9 fail 0`（home＋8 個 ready 工具頁）。

## 5. 回報（覆蓋 `collab/from-codex.md`，只填這些欄位，不貼程式碼）

```
## 完成項
- 步驟 1：…
- 步驟 2：…
## 異動檔案
- （git status 的清單）
## PROOF_CMD 輸出
- tests / pass / fail / todo：
## 畫面實測
- 區塊數（GUIDE_SECTIONS 卡片數）／欄位說明總數／差異條數／token 步驟數／錯誤條數：
- 有 ⓘ 的欄位數：
## 自行決定的小事
- …
## 需要決定的事
- （沒有就寫「無」）
```
