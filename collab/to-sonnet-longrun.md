# 任務書：㉚ 正2 上市以來，每年變多少（頁面）

版本：v1（2026-11-26，Opus）。執行者：Sonnet，直接在主目錄 `D:/ok/zr-toolbox` 工作。

## 規矩

- **只准讀**：本任務書、`js/pages/yearcheck.js`（樣板，照它的寫法）、`tools/yearcheck.html`（樣板）、`js/data/longrun.js` 的**前 400 字元**（看結構就好，資料很大，不要整檔讀）、`scripts/check-longrun.mjs`（讀懂不准改）、`js/ui/components.js` 第 125–160 行（`lineChart`）。
- **只准新增／修改**：`tools/longrun.html`（新）、`js/pages/longrun.js`（新）、`js/pages/yearcheck.js`（只加一段連結）、`js/data/tools.js`（只把 longrun 的 `status` 改成 `'ready'`）、`css/app.css`（檔尾加 ㉚ 需要的少量樣式，可不加）。
- **不准改**：`js/core/`、`js/data/longrun.js`、`scripts/`、`tests/`、`js/ui/`。覺得框架有問題就停下回報。
- 不 commit、不 git add、不 stash／reset／checkout、不跑 smoke、不跑 gen-precache、不上網。暫存檔不留。
- 頁面用語**不准用「回測」**。數字（報酬率、金額、日期）一律從 `LONGRUN` 算出來，不准寫死。

## 資料（`js/data/longrun.js`，`export const LONGRUN`）

```
{ asOf, start, tradingDays, startMoney: 1e6, splits: { '0050': { 'YYYY-MM-DD': 4 } }, source,
  lump: {                                  // 上市那天投入 100 萬，放到現在
    dates: [...每個交易日], months, years: [{ year, from, to, partial }],
    series: [{ id, name, rule, values: [每日資產（元）], final, ret, cagr, peak, peakDate, giveback, mdd, mddDate,
               years: [每年報酬，跟 lump.years 同順序], dividendTotal, trades }] },
  yearly: [{ year, from, to, series: [{ id, final, ret, mdd, peak, peakDate }] }]   // 每年第一個交易日各投入一筆新的 100 萬，到該年最後一個交易日
}
```

series 的 id 與順序固定：`allin`（正2 全押長抱）、`dajen`（大仁 50/50 觸發）、`q5050`（50/50 每季配回）、`q532`（532 股版每季）、`h0050`（0050 長抱）。短名稱照 ㉘：`{ allin: '全押', dajen: '大仁', q5050: '季配', q532: '532', h0050: '0050' }`。

## 框架已備（Opus 做好）

- `lineChart` 支援 5 條線、`log: true` 等比刻度、每條線 `color: 0–4` 固定顏色（勾掉某條線時其他線顏色不變：series 第 k 個做法永遠用 `color: k`）。
- CSS 已有 `.yc-table`（欄寬依內容）、`.yc-stack`（手機上表格變一做法一張卡；`td` 要帶 `data-label`）、`.yc-month`（窄欄數字表）、`.yc-legend`、`.yc-best`。照 `yearcheck.js` 用法。

## 頁面內容（依序）

1. `toolHeader(TOOLS.find(t => t.id === 'longrun'))`。
2. **這頁在算什麼**（`section.card.article`）：
   - `figure({ src: '../img/yearcheck/giveback.svg', alt: <照 yearcheck.js 的 ALT 常數原文>, caption: '最高點不等於賺到的錢；回吐是從最高點掉回來多少。' })`。
   - 一段：正2 用 00675L 富邦臺灣加權正2，它從 `LONGRUN.start` 上市到現在沒有分割過，可以一路算到 `LONGRUN.asOf`（共 `tradingDays` 個交易日）；比較正2 四種做法和 0050 長抱，兩種算法都有（下面兩節）。
   - 條列：手續費 0.1425%、ETF 賣出證交稅 0.1%；股數取整數；現金不算利息；0050 長抱的配息當天買回 0050，其他做法的配息先放現金、每季配回時一起調；0050 在 `<splits 裡的日期>` 1 拆 `<倍數>`，股數已經換算（從 `LONGRUN.splits` 讀出來組句子）。
   - 頁內兩個錨點連結：「上市那天投入 100 萬 ↓」「每年年初投入 100 萬 ↓」。
   - `p.muted`：每月底更新一次。資料來源：`LONGRUN.source`。
3. **上市那天投入 100 萬，放到現在**（`section.card`，`id="lump"`）：
   - 控制列：5 個 checkbox（`h('input', { type: 'checkbox', ... })`，標籤用完整名稱，預設全勾）＋刻度兩選一（radio：「等比刻度（看漲跌幅）」預設、「一般刻度（看金額）」）。至少留一條線：最後一條被取消時把它勾回去。
   - 圖：`lineChart({ series: 勾選的做法.map(s => ({ name: s.name, values: s.values.map(v => v / 1e4), color: 該做法在 series 中的位置 })), label: …, yFormat: v => v.toFixed(0) + ' 萬', baseline: 100, xTicks, log })`。xTicks：每年第一個交易日，文字只顯示偶數年（例「2018」），避免擠。勾選或換刻度時只重畫圖（換掉 chart 節點）。
   - 一句說明：等比刻度下，同樣漲一倍的高度一樣，比較看得出前幾年的起伏。
   - **到現在的成績**：照 ㉘ 的 `yc-table yc-stack` 表，欄：現在、總報酬、年化報酬、最高曾到（日期）、最大回撤（日期 `mddDate`）、買賣次數（`trades`，0 寫「不動」）。最高總報酬那列加 `yc-best`。
   - 一句（算出來的）：正2 三種五五類做法（dajen、q5050、q532）裡，年化最接近的兩種是 X 和 Y，只差 N 個百分點（`(a.cagr-b.cagr)*100` 取絕對值、1 位小數）。
   - **每年報酬**表（`yc-table yc-month`）：列＝`lump.years`，第一欄年份（`partial` 的第一年寫「2016（10/05 起）」、最後一年寫「2026（到 11/25）」，月日從 from／to 取），其他 5 欄短名稱，值用 `+12.3%`／`−5.6%`（負號用 −），每列最高的那格加粗（`h('strong')`）。表下 `p.yc-legend` 短名稱對照。
4. **每年年初投入 100 萬，到年底變多少**（`section.card`，`id="yearly"`）：
   - 一段說明：每一年第一個交易日各拿一筆新的 100 萬，照同一種做法放到那年最後一個交易日；每年分開算，大仁的基準每年重新開始；第一年從上市日開始、今年算到 asOf。
   - 表（`yc-table yc-month`）：列＝`yearly`，欄同上，值是該年報酬（格式同上）、每列最高加粗。最後加一列「贏 0050 的年數」：正2 四種做法各自 `ret > 同年 h0050 的 ret` 的年數，寫「N／總年數」，0050 那格寫「—」。
   - 表下 `p.yc-legend`。
5. **怎麼讀**（`section.card.article`）：三段，不准寫數字：
   - 全押正2 終點最高，但中間最大回撤也最深，要撐得住才拿得到。
   - 五五類做法用一半現金換來比較小的回撤，代價是漲多的年份追不上；幾種五五做法彼此差不多，選自己做得到的就好。
   - 這十年台股大致是多頭，換一段時間、換起點，排名可能完全不同；過去不代表未來。
   - 最後一行連結：`h('a', { href: 'yearcheck.html' }, '只看今年：年初 100 萬，現在變多少 →')`。
6. `disclaimer('general')`。
7. `js/pages/yearcheck.js`：在「怎麼讀」那節最後一個 `h('p', …)` 後面加一個 `h('p', {}, h('a', { href: 'longrun.html' }, '拉長來看：正2 上市以來，每年變多少 →'))`，其他不動。
8. `tools/longrun.html`：照 `tools/yearcheck.html` 複製，改 `<title>正2 上市以來，每年變多少｜股票兩三件事</title>` 和 script 路徑。

## 驗收指令 PROOF_CMD

```
cd D:/ok/zr-toolbox && node scripts/check-longrun.mjs && npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

預期：`check-longrun OK`；tests 203，只允許失敗 1 項「pwa: sw precaches…VERSION」（Opus 會跑 gen-precache），其他都要過。

## 回報格式（不貼程式碼）

```
新增／修改檔案：
check-longrun：
tests：
偏離任務書的地方：（沒有寫「無」）
需要決定的事：（沒有寫「無」）
```
