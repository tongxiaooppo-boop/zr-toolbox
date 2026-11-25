# 任務書：㉙ 股災與心態（科普頁）

版本：v1（2026-11-25，Opus）。執行者：Sonnet 子代理，直接在主目錄 `D:/ok/zr-toolbox` 工作（同時沒有別人改程式）。

## 0. 規矩

- **只准讀下面「要讀的檔案」**，不要摸索其他檔；不確定就停下回報（格式見第 7 節），最多停 2 次。
- **不准改**：`js/data/tools.js`（只准把 crash 的 `status: 'planned'` 改成 `'ready'`）、`tests/`、`scripts/`、`js/ui/`、`docs/research/`、其他頁面。
- `css/app.css` 只准在檔尾加最多 15 行（長條圖用），不准改既有規則。
- 不准上網、不准新增依賴、不准用 git stash／reset／checkout；只 `git add` 自己動過的檔。暫存檔放 `D:/ok/zr-toolbox/collab/tmp-crash/`，結束前刪掉。
- 頁面用語不准出現「回測」；不給擇時或買賣建議（不准寫「逢低加碼」「抄底」「危機入市」「一定會漲回」之類）；過去不代表未來。

## 1. 要讀的檔案

1. `docs/research/R8-股災史.md`（全文，30 行）— 股災表的唯一數字來源
2. `docs/research/R8-投資心態.md`（全文，41 行）— 心態表、檢查清單
3. `js/pages/riskprofile.js`（全文，28 行）— 科普頁版型樣板（照抄結構）
4. `js/pages/loans.js`（第 1–50 行）— 寬表格 `compare-wrap` 寫法
5. `tools/riskprofile.html`（全文）— html 樣板
6. `js/ui/components.js` 第 27–55 行與第 154–190 行（`h`、`references`、`toolHeader`、`disclaimer`、`pathNav`）
7. `js/data/tools.js` 第 1–20 行（看 id 列表，給 `tools` 欄用）
8. `scripts/check-crash.mjs`（驗收規則，讀懂但不准改）

## 2. 要新增／修改的檔案

| 檔案 | 動作 |
|---|---|
| `js/data/crash.js` | 新增：全部文字與數字（第 3 節） |
| `js/pages/crash.js` | 新增：只排版，不寫死數字（第 4 節） |
| `tools/crash.html` | 新增：照抄 `tools/riskprofile.html`，`<title>股災與心態｜正2工具箱與股市學堂</title>`，script 改 `../js/pages/crash.js` |
| `css/app.css` | 檔尾最多 15 行：長條圖 |
| `js/data/tools.js` | 只改 crash 的 status → `'ready'` |
| `sw.js` | 跑 `node scripts/gen-precache.mjs` 自動產生，不要手改 |

## 3. 資料檔 `js/data/crash.js`（介面寫死，不准改名）

```js
// ㉙ 股災與心態。數字全部出自 docs/research/R8-股災史.md／R8-投資心態.md（查閱日 2026-11-25），不准自己算或估。
export const CRASH_INTRO = [ /* 2–4 段白話：大跌一定會遇到；台股最慘跌近八成、花三十年回來；最近幾次幾個月到兩年；正2 跌得比大盤深很多；先檢查自己撐不撐得住，不是猜底 */ ];
export const CRASHES = [ // 12 列，name 與順序一字不差照 R8 股災表第 1 欄
  { name: '2008 金融海嘯',
    period: '台股 2007-10-29 → 2008-11-20；美股 2007-10-09 → 2009-03-09',
    tw: '−58.3%（9,809.88 → 4,089.93）', twPct: 58.3,          // 沒資料：tw 寫「待查」或「—（說明）」，twPct: null
    us: '−56.8%（1,565.15 → 676.53）',
    recover: '約 7 年 6 個月（2015-04-24）',
    zr: '尚未上市', zrPct: null,                                // 有資料例：'−52.1%（2020-01-14 → 2020-03-19），約 0 年…'；不准寫價格
    cause: '一句白話', lesson: '一句白話，不是擇時建議' },
];
export const ZR_LESSON = [ /* 2–3 段：有正2 資料的幾次，台股跌多少、正2 跌多少（照 R8 數字）；跌一半要漲一倍才回本 → 連到 ⑧ drawdown.html；波動耗損 → ⑥ decay.html；已經虧了怎麼回本 → ㉕ recover.html */ ];
export const MINDSET = [ // 16 列，name 照 R8 心態表第 1 欄
  { name: '損失規避', what: '一句話說明', example: '股災時常見的樣子', action: '可以怎麼做', tools: [] },
];
export const CHECKLIST = [ // 10 列，item 照 R8 檢查清單第 1 欄一字不差
  { item: '槓桿：我現在整體幾倍', why: '白話一句', tools: ['exposure', 'lifelev', 'kelly'] },
];
export const CRASH_LIMITS = [ /* ≥3 段：名目價格、沒算股息與費用和通膨；不是完整股災名單；1990 低點用證交所年度最低收盤 2,560.47，官方沒列日期；正2 追蹤台灣50 不是加權指數，高低點日期可能不同；過去不代表未來 */ ];
export const CRASH_REFS = [ { name: '…', url: 'https://…' } ]; // ≥8 筆，網址只准用 R8 裡出現過的
```

寫法規定：

- **數字一律照抄 R8**：跌幅、點數、恢復時間、日期。檢查腳本會把資料檔裡的每個百分比、帶小數的數字、「約 N 年 M 個月」拿去 R8 比對，找不到就 FAIL。不准自己算新的百分比（例如正2 比大盤多跌幾成）。
- `twPct`／`zrPct` 是正數（58.3），要和 `tw`／`zr` 文字裡的跌幅一致；沒資料填 `null`。
- **正2 欄（zr）只寫跌幅％、日期、時間長度，不寫價格**（R8 的 00631L 價格是分割前原價，新手會看不懂）。2018、2015 恢復時間這類 R8 寫待查的，照寫「待查」。
- **1990 列**：高點 1990-02-10，低點只寫「1990 年內最低收盤」，不寫月日（官方查不到）。
- **2022 列**：台股高點是 2022-01-04（Opus 已用 FinMind 核對）。
- `cause`、`lesson`、`what`、`example`、`action`、`why` 用自己的話改得更白話、更短（國中生看得懂），不改原意。
- `tools`：填 `js/data/tools.js` 的 id。R8 對應工具欄的對照：⑪ exposure、⑬ lifelev、⑭ kelly、④ pledge、⑤ margin、⑥ decay、⑧ drawdown、⑮ avgcost、⑨ cost、㉑ loans。MINDSET 的 tools 自行判斷要不要連（可留 `[]`）。

## 4. 頁面 `js/pages/crash.js`

照 `riskprofile.js` 的結構，依序：

1. `toolHeader(tool)`
2. 「先講結論」卡：`CRASH_INTRO`
3. 目錄卡（`nav`），連到下面各節 id
4. `#history`「台股跌過幾次大的」：`compare-wrap` 寬表（欄：事件、期間、台股跌幅、美股跌幅、台股多久回前高、正2 當時、起因、教訓；第一欄 `th scope="row"`）
5. `#zr`「正2 跌得比大盤深」：長條圖（只畫 `twPct` 和 `zrPct` 都不是 null 的列，每列兩條：台股、正2；寬度＝跌幅％，用 `style: 'width:58.3%'` 這類 inline style 由資料算出；條旁文字顯示跌幅），下面接 `ZR_LESSON` 段落
6. `#mind`「跌的時候腦袋會怎樣」：`MINDSET` 每列一個 `details.product`（summary＝名稱＋what；內容 dl：股災時常見的樣子／可以怎麼做／相關工具連結）
7. `#check`「跌的時候先檢查這 10 件事」：`ol`，每項 item 粗體＋why＋工具連結（連結文字用 tools.js 的 `no＋title`，href 用 tools.js 的 href 去掉 `tools/` 前綴）
8. `#limits`「這頁的限制」：`CRASH_LIMITS`
9. `pathNav('crash')`、`references(CRASH_REFS)`、`disclaimer('general')`

頁面檔不准寫死任何數字。長條圖的 CSS 寫在 `css/app.css` 檔尾（≤15 行，用既有 token 如 `var(--line)`、`var(--accent)`，深色模式要看得到）。

## 5. 驗收指令 PROOF_CMD

```
cd D:/ok/zr-toolbox && node scripts/check-crash.mjs && node scripts/gen-precache.mjs && npm.cmd test && node scripts/smoke.mjs
```

預期輸出：

- `check-crash OK（股災 12、心態 16、檢查清單 10、數字 N、參考 M）`（M ≥ 8）
- `npm.cmd test`：`tests 196`、`pass 196`、`fail 0`
- smoke：`smoke pages 29 pass 29 fail 0`

全部過了才 commit（訊息：`㉙ crash page (Sonnet): …`，結尾加 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`）。commit 前確認 `git config user.email` 是 `300864627+tongxiaooppo-boop@users.noreply.github.com`，不是就停下回報。

## 6. 不要做

- 不加圖片、不畫 SVG、不改首頁、不改其他頁面的連結（新手路線由 `pathNav` 自動處理）。
- 不改 `check-crash.mjs`；過不了就修資料，修不了就停下回報。

## 7. 回報格式（精簡，不貼程式碼）

```
完成項：
commit：<hash> <訊息>
PROOF_CMD：check-crash …／tests …／smoke …
自行採用的小決定：（例：某段改寫方式）
需要決定的事：（問題一句＋2–3 選項＋建議；沒有寫「無」）
```
