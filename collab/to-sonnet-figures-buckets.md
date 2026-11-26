# Sonnet 任務 B：14 張新圖放進頁面＋三桶改版（㉖ 結果頁、㉗ 頁、buckets.svg）

- 版本：2026-11-26 v1（框架 commit e0c9dd4，決策 `docs/decision/決策-2026-11-26-三桶改版.md`）。直接在 `D:\ok\zr-toolbox` 主目錄工作。**不要 commit、不要 stash／reset／checkout**；另一個 Sonnet（任務 A）同時在改 home.js、wizard.js、smoke.mjs、app.css。
- **只准修改**：`js/pages/crash.js`、`riskprofile.js`、`loans.js`、`etf101.js`、`zr101.js`、`basics.js`、`riskquiz.js`、`recover.js`、`yearcheck.js`（都在 `js/pages/`）、`img/riskquiz/buckets.svg`。
- **不准改**：`js/data/`、`js/core/`、`js/ui/`、`css/`、`tests/`、`scripts/`、`sw.js`、任何圖片（buckets.svg 除外）。需要新 CSS 就停下回報。暫存檔放 `D:\ok\zr-toolbox\.tmp-b\`，結束前刪掉。
- 不確定就停下回報，不要摸索其他檔案。

## 0. 要讀的檔案（只准讀這些）

- 上列 9 個頁面檔（只讀要改的段落附近）
- `js/ui/components.js` 第 1–25 行（`figure({ src, alt, caption })`）
- `js/ui/wizard.js` 第 20–30 行（step 的 `figure` 欄位）
- `js/core/riskquiz.js` 第 85–150 行（`RESERVE`、`reservePlan`、`BUCKETS`、`allocationPlan`，回傳欄位已改 `steady`）
- `js/data/riskprofile.js` 第 18–45 行（新 `BUCKET_GUIDE`：key＝reserve／steady／growth／bold，只有 title／who／why，**已經沒有 items**）
- `img/riskquiz/buckets.svg`

## 1. 放圖（每張用 `figure()`，alt 照抄下表「alt」，caption 照抄）

| 頁 | 放哪裡 | src | alt | caption |
|---|---|---|---|---|
| crash | 「正2 跌得比大盤深」卡片標題下 | `../img/crash/zr.webp` | 大盤和正2 兩條溜滑梯，正2 那條更陡更深；老師說正2 每天追 2 倍，連跌時跌更深，回來也要更久。 | 先確定自己撐得住，再決定放多少。 |
| crash | 「跌的時候腦袋會怎樣」標題下 | `../img/crash/mind.webp` | 三格漫畫：新聞一直喊崩盤、好想全部賣掉、老師拉住說照當初的計畫做。 | 想逃很正常，先停一下。 |
| crash | 「跌的時候先檢查這 10 件事」標題下 | `../img/crash/check.webp` | 小安拿清單檢查：整體幾倍槓桿、會不會被追繳、生活費夠撐幾個月、這筆錢幾年內會用到。 | 這 4 件先看，其他在下面清單。 |
| riskprofile | `#rr` 卡片標題下 | `../img/riskprofile/rr.webp` | RR1 到 RR5 的樓梯：貨幣市場、投資等級債、全球已開發國家股票、單一國家股票（例台灣 50）、新興市場股票與正2。 | RR 只看價格波動，不代表未來會怎樣。 |
| riskprofile | `#match` 卡片標題下 | `../img/riskprofile/match.webp` | 小安穿著太大的鞋（超過自己能承受的商品）在下坡快跌倒，老師說對不上最常見的是跌到最低點時撐不住、賣掉。 | 先做測驗，再挑合腳的商品。 |
| loans | 「常見 14 種比一比」標題下 | `../img/loans/call.webp` | 三格漫畫：股價下跌、跌破追繳線要補錢、沒補股票會被賣掉（斷頭）。 | 押股票借錢，要先知道追繳線在哪。 |
| loans | 「新手常見誤解」標題下 | `../img/loans/worst.webp` | 蹺蹺板：漲時賺更多，跌時賠更多而且利息照付。 | 先想最壞情況，再決定要不要借。 |
| etf101 | id＝cost 那段標題下 | `../img/etf101/cost.webp` | ETF 籃子底下的水龍頭滴出硬幣，寫著經理費、保管費（內扣）。 | 不會另外寄帳單，淨值已經扣過了。 |
| etf101 | id＝dividend 那段標題下 | `../img/etf101/dividend.webp` | 除息前籃子滿滿，除息後籃子少一點、手上多一袋硬幣。 | 領到現金，基金的價值也少了同樣的金額。 |
| zr101 | id＝daily 那段標題下 | `../img/decay/two-days.svg` | 兩天一漲一跌，大盤和正二各自剩多少（取自 ⑥ 正二不是兩倍）。 | 每天 2 倍，不等於整段 2 倍。 |
| zr101 | id＝risks 那段標題下 | `../img/zr101/risks.webp` | 小安在山腳，山路上三塊牌子：可能腰斬、回本可能要好幾年、每天 2 倍不是整段 2 倍。 | 撐得住再上山。 |
| basics | id＝settle 那段標題下 | `../img/basics/settle.webp` | 時間線：T 日成交、T+1、T+2 上午 10 點前交割帳戶要有錢；錢不夠＝違約交割。 | 成交後第 2 個營業日扣款。 |
| riskquiz | 第 1 題 step 的 `figure` 欄位 | `../img/riskquiz/comic.webp` | 小安作答，前面四扇門：保守、穩健、成長、積極；老師說沒有好壞，只有適不適合。 | 10 題，找出你的投資屬性。 |
| recover | 第 1 步 step 的 `figure` 欄位（已有就換成這張，原圖移到結果「怎麼讀」） | `../img/recover/comic.webp` | 三岔路口：不動等它漲回來、攤平再買一些、換成 0050。 | 先算清楚，每條路各要漲多少。 |
| yearcheck | 「這頁在算什麼」卡片標題下 | `../img/yearcheck/comic.webp` | 100 萬分進四個罐子：正2 四種做法、0050、0056、00981A。 | 過去不代表未來。 |

etf101／zr101／basics 的段落是用迴圈畫的：在頁面檔加一個 `const FIGS = { cost: {...}, dividend: {...} }` 這類對照表，迴圈裡 `FIGS[s.id] ? figure(FIGS[s.id]) : null`。recover 若第 1 步原本就有 figure，先讀清楚再決定；只要第 1 步顯示新圖、原圖還留在頁面某處即可，拿不準就停下回報。

## 2. ㉖ 測驗結果頁（`js/pages/riskquiz.js`）

1. `allocationPlan` 回傳欄位已從 `safe` 改 `steady`：`shares = [p.steady, p.growth, p.bold]`。頁面所有「保守穩健」改成「穩健」（meanings、allocationHow、explain 的 value 與 aria-label）。`meanings.conservative` 改：「你最在意本金不要虧。先把保守（先留）的錢留足，要投資的部分以穩健桶為主，少量放成長。」
2. 「三桶資金怎麼分」之前加一項 `explain({ label: '先留：保守（先留）', value: '6 個月生活費＋3 年內要用的錢', how: '這筆錢不算在三桶裡，放定存、貨幣市場基金這類幾乎不會跌的地方；剩下的錢才分三桶。', means: reservePlan({ cash: s.a[2], horizon: s.a[5] }).lines.join('') , tone: <cashOk 且 horizonOk ? 'ok' : 'warn'> })`，下面一行小字列 `RESERVE.examples` 的 name。
3. 三桶 explain 的 label 改「剩下的錢分三桶（${p.band}）」。
4. `.quiz-buckets` 每桶：`h3` `${label} ${pct}%`，底下 `ul`，每個 example 一個 `li`：`strong(name)` ＋ ' ' ＋ note。
5. 「怎麼讀」卡：buckets.svg 的 alt 換成「先留保守（先留）：定存、貨幣市場基金。剩下分三桶：穩健桶（債券 ETF、股債配置、高股息）、成長桶（0050、0056、S&P 500）、積極桶（正2、主動式 ETF、個股）。積極型 20／30／50，穩健型 50／30／20。」caption「先留保守的錢，剩下的依穩健、成長、積極分三桶。」說明段的「保守和穩健型以保守穩健桶為主」改「保守和穩健型以穩健桶為主」。

## 3. ㉗ 投資屬性頁（`js/pages/riskprofile.js`）

- 目錄與 `#buckets` 標題改「先留保守，再分三桶」。
- buckets.svg 的 alt、caption 同第 2 節第 5 點。
- `BUCKET_GUIDE.map(...)`：每桶 `h3 title`、`p.muted who`、`p why`，接著 `ul` 列例子：key＝'reserve' 用 `RESERVE.examples`，其他用 `BUCKETS.find(b => b.key === bucket.key).examples`；每個 `li`：`strong(name)` ＋ ' ' ＋ note。舊的 `details.product`（items）整段拿掉。
- import `RESERVE`、`BUCKETS` from `../core/riskquiz.js`。

## 4. `img/riskquiz/buckets.svg`

改圖上文字（版面、尺寸、配色沿用；只在現有框架內調整）：
- 最上方加一條橫的「先留：保守（先留）｜定存、貨幣市場基金」（淺灰底，跟下面三桶分開，表示不算在三桶裡）。
- 標題「三桶資金」改「剩下的錢分三桶」。
- 三桶標籤：「穩健」「成長」「積極」；例子：穩健＝「債券 ETF」「股債配置」「00713」；成長＝「0050」「0056」「S&P 500」；積極＝「主動式 ETF」「正2」「個股」。
- 底下兩行比例與「示意主力桶占一半」照舊。
- 不准出現「保守穩健」、VT、QQQ、SPY、定存股。SVG 裡的中文字用 `<text>`，不要轉成路徑。

## 5. PROOF_CMD

```
cd /d/ok/zr-toolbox && node --test 2>&1 | grep -E "^ℹ (pass|fail)|^✖" ; node scripts/smoke.mjs | tail -3 ; grep -rn "保守穩健\|p\.safe" js/pages img/riskquiz/buckets.svg | wc -l
```

預期：tests 只有 1 個 fail＝`pwa: sw precaches…`（Opus 最後重產 sw.js，**不要去修**）；smoke `fail 0`（任務 A 同時在改首頁和 wizard，若首頁或精靈模式失敗且原因跟你無關，照實寫進回報）；最後的 grep 計數＝`0`。

## 6. 回報（直接回在對話，欄位固定，不貼程式碼）

完成項（對照第 1–4 節，15 張圖逐一打勾）／修改檔案清單／tests pass、fail（列 fail 名稱）／smoke 最後一行與失敗頁／grep 計數／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
