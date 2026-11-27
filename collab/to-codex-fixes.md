# 修 bug 任務：2026-11-27 全站審查（頁面層 8 項）

- 版本：2026-11-27 v1。回報寫到 `collab/from-codex-fixes.md`。
- 背景：terra 審查 13 組檔案，Opus 逐條到程式碼核實，以下 8 項確認成立。core 的兩項（估價、退休）Opus 已修好並補了測試，**不要再動 `js/core/`**。
- 執行者：訂閱 Codex sol（VS Code 面板），直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`npm.cmd`（不要 `npm`）。
- **只准修改**：第 2 節每項寫的檔案和位置。`sw.js` 只能用 `node scripts/gen-precache.mjs` 重產。新增只准 `collab/from-codex-fixes.md`。
- **不准改**：`js/core/`、`js/data/`、`tests/`、`css/`、其他沒列到的檔案。覺得某項的修法不對就跳過，寫進回報，不要自己發揮。暫存檔放本 repo 內，結束前刪掉。
- 不要用網路搜尋、網頁抓取。
- 如果 `to-codex-figures2.md` 還沒做完，先做完那份再做這份（兩份改的檔案不重疊）。

## 0. 要讀的檔案（只准讀這些，只讀列出的行數附近）

- `js/pages/dca.js` 第 155–195 行
- `js/ui/wizard.js` 第 285–320 行、第 360–395 行
- `js/pages/riskquiz.js` 第 25–35 行、第 95–105 行
- `js/pages/rebalance.js` 第 135–145 行
- `js/pages/lifelev.js` 第 80–90 行
- `js/pages/margin.js` 第 110–130 行、`js/core/margin.js` 的 `marginPlan` 回傳欄位（只讀，看 `called`、`longDrop`、`shortRise`）
- `js/pages/pledge.js` 第 75–92 行
- `js/pages/drawdown.js` 第 20–35 行、第 95–105 行
- `scripts/stress-update.mjs` 第 25–55 行

## 1. 規則

每項改完就跑一次 `npm.cmd test`，全部做完再跑 PROOF_CMD。文案照第 2 節原文抄，`${}` 換成值。

## 2. 要修的 8 項

**F1｜高｜`js/pages/dca.js` `result()`「如果一開始一次投入」**
問題：主結果算到第 `years + holdYears` 年，「一次投入」只滾 `years` 年，有填「停扣後再放幾年」時兩個數字放在一起比是錯的。
修法：`s.holdYears > 0` 時，比較值改成 `single.lumpValue * Math.pow(1 + hr / 100, s.holdYears)`（`hr` 是第 161 行那個百分比數字），`how` 改成：
`同樣 ${fmtMoney(single.principal)} 第一天全部投入：${fmtMoney(single.principal)} × (1＋${s.ret}%)^${s.years}，停扣後再 × (1＋${hr}%)^${s.holdYears}，算到第 ${s.years + s.holdYears} 年；扣一次手續費 ${fmtMoney(single.lumpFee)}，賺 ${signed(比較值 − single.principal − single.lumpFee)}。`
`s.holdYears === 0` 時維持原樣。

**F2｜中｜`js/ui/wizard.js` 自動查價的兩個競態（兩處：約第 299 行 holdingRow、約第 369 行 betaHoldingsInput）**
(a) 約第 302 行：代號格式不對時直接 return，但沒有讓舊的查價失效 → 舊代號的價格晚回來還是會寫進現價。改成在 `if (!c)` 之前先 `++seq`（第 370 行那處已經是先 `++seq`，不用改）。
(b) 兩處都要：使用者在現價欄位（`now`／`price`）手動輸入時，讓進行中的查價失效：`now.addEventListener('input', () => { ++seq; })`（另一處用 `price`）。

**F3｜低｜`js/pages/riskquiz.js` 文案跟配置表對不上**
積極型 40 歲以上、保守型各年齡，主力桶都不是一半。
- 第 30 行 `aggressive` 改成：`你能承受很大的波動，也期待較高報酬。積極部位放得比較多（年輕時是一半），但要先想清楚最壞情況。`
- 第 101 行 `allocationHow` 改成：`依你的型態與年齡查表：年紀越大，積極桶越少、移到穩健桶。`

**F4｜低｜`js/pages/rebalance.js` 第 141 行**
「現金一定夠」沒算手續費和證交稅，改成：
`算出來的是取整後的股數。買進無條件捨去、賣出四捨五入，配完會跟目標差一點點；這裡沒算手續費和證交稅，實際要多留一點現金付費用。`

**F5｜低｜`js/pages/lifelev.js` 第 84、87 行**
淨資產剛好 0 時也會顯示「總淨資產是負的」。兩處文字都改成 `總淨資產是 0 或負的`。

**F6｜低｜`js/pages/margin.js`、`js/pages/pledge.js` 追繳判斷**
(a) margin 第 118、124 行：「已經低於追繳線」改用 core 回傳的 `r.called` 判斷（`r.called ? '已經低於追繳線' : fmtPct(...)`），tone 的 `'bad'` 也用 `r.called`。
(b) margin 融資那張：`r.longDrop >= 1` 時（融資＋融券、融券部位很賺的情況），`value` 顯示 `跌到 0 也不會被追繳`、`tone: 'ok'`，`how` 改成 `融券那邊的擔保夠多，融資的股票就算跌到 0，維持率也不會碰到 ${s.call}%。`，不要印參考價（會變負數）。
(c) pledge 第 79 行 `const under = r.callDrop <= 0;` 改成 `const under = r.called;`。

**F7｜低｜`js/pages/drawdown.js` 第 101 行**
貼一串數字（`s.mode === 'series'`）而且一路沒跌過（`r.mdd === 0`）時，現在會顯示「剛好回到…」。這種情況改成：`value: '這串紀錄沒有跌過'`、`how: '每一筆都不比前面的最高點低，最大跌幅是 0。'`，其他模式維持原樣。

**F8｜低｜`scripts/stress-update.mjs` 第 33 行**
`const TIMEOUT = { signal: AbortSignal.timeout(60e3) };` 在載入時就開始計時，前面 FinMind 抓超過 60 秒，FRED 一開始就會被中斷。改成函式 `const timeout = () => ({ signal: AbortSignal.timeout(60e3) });`，每個 `fetch(..., TIMEOUT)` 改成 `fetch(..., timeout())`。**不要執行這支腳本**（會重抓資料）。

## 3. PROOF_CMD

```
node -e "const fs=require('fs');const r=f=>fs.readFileSync(f,'utf8');const bad=[];if(r('js/pages/rebalance.js').includes('現金一定夠'))bad.push('F4');if(r('js/pages/lifelev.js').includes(\"'總淨資產是負的'\"))bad.push('F5');if(!r('js/pages/pledge.js').includes('r.called'))bad.push('F6c');if(!r('js/pages/margin.js').includes('跌到 0 也不會被追繳'))bad.push('F6b');if(r('scripts/stress-update.mjs').includes('const TIMEOUT'))bad.push('F8');if(!r('js/pages/drawdown.js').includes('這串紀錄沒有跌過'))bad.push('F7');if(r('js/pages/riskquiz.js').includes('主力桶占一半'))bad.push('F3');if((r('js/ui/wizard.js').match(/addEventListener\('input', \(\) => \{ \+\+seq/g)||[]).length<2)bad.push('F2b');if(!r('js/pages/dca.js').includes('停扣後再 ×'))bad.push('F1');console.log(bad.length?'BAD '+bad.join(' '):'OK 8 fixes')" && npm.cmd test
```
預期輸出：`OK 8 fixes`，接著 `ℹ tests 214`、`ℹ fail 0`。smoke 不用跑（Opus 會跑）。

## 4. 回報（`collab/from-codex-fixes.md`，照欄位填，不貼程式碼）

完成項（F1–F8 各寫 完成／跳過＋理由）／PROOF_CMD 輸出／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
