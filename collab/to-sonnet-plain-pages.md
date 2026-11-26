# 任務書：計算機頁面說明文字白話化（人的語氣）

版本：v1（2026-11-26，Opus）。3 個 Sonnet 平行，各自只改分到的檔案。上一輪（`to-sonnet-plain.md`）改的是 `js/data/*.js`，這輪改 `js/pages/*.js` 裡的中文字串。

## 規矩

- 只准讀：本任務書、分到的檔案、`scripts/check-plain-pages.mjs`（讀懂不准改）。不讀其他檔、不上網。
- 只准改分到的 `js/pages/*.js` 裡**含中文的字串內容**（`'…'`、`"…"`、樣板字串 `` `…` `` 的文字段）。程式碼一個字都不准動（含 `${…}` 裡面、註解以外的所有東西）。註解不用改。
- **不 commit、不 git add、不跑 smoke、不跑 gen-precache**（Opus 統一做）。不准 stash／reset／checkout。不改別人的檔。暫存檔一律不留。
- 護欄 `check-plain-pages.mjs` 會擋：程式骨架變了、字串個數變了、字串裡的英文字／數字／算式符號（% + − - × ÷ < > = ＝）增減、改到沒中文的字串、改到 `alt`／`src`／`href`／`id`／`class`／`type`／`value`／`key`／`termId` 的值、禁用字（回測、保證獲利、穩賺）、emoji。
  - `alt` 是圖上文字的描述，要跟圖一致，所以不准改。
  - 數字要一模一樣：不准改寫成國字、不准增減（「1 張＝1000 股」不能改成「一張＝1000 股」）。
- 錯誤訊息（`throw new Error('…')`）也可以改說法，但要保留「填什麼、例：多少」。
- 結果頁的句子常被 `${…}` 切成好幾段，每一段都是獨立字串：改的時候前後段要接得起來，讀整句檢查。

## 語氣（重點，跟上一輪一樣）

像一個懂股票、講話直接的朋友，坐在你旁邊用講的解釋給你聽：

- 用「你」。短句，一句講一件事。口語但不油：不用「親」「寶寶」「喔～」、不用 emoji、不連用驚嘆號。
- 先講結論（會怎樣、要注意什麼），再講為什麼。
- 公文腔（「僅」「係」「予以」「之」「得」「應」「依規定」「暫緩」「請確認」）改成日常講法。
- 不加新事實、不刪事實、不加買賣建議。不確定原意就保留原句。已經很白話的句子不用硬改。
- 長度跟原本差不多或更短；欄位標籤（`label`）、步驟標題（`title`）要短，不要變長。

範例：

- 前：「商品類型已經依代號猜好，請確認。」
- 後：「商品類型已經照代號幫你猜好了，看一下對不對。」

## 分工

| 代號 | 檔案 | 另外要跑的檢查 |
|---|---|---|
| A | `dca.js`、`exposure.js`、`trigger5050.js`、`margin.js`、`avgcost.js`、`decay.js`、`yearcheck.js` | `node scripts/check-ui.mjs`（dca.js 要留 `img/dca/joy.webp`） |
| B | `valuation.js`、`lifelev.js`、`rebalance.js`、`fx.js`、`pledge.js`、`dividend.js`、`riskquiz.js`、`crash.js` | `node scripts/check-crash.mjs`（crash.js 不准寫死 `數字.數字%`、禁用擇時字眼） |
| C | `retire.js`、`cost.js`、`divtax.js`、`drawdown.js`、`recover.js`、`kelly.js`、`loans.js`、`zr101.js`、`basics.js`、`home.js`、`etf101.js`、`riskprofile.js`、`products.js`、`glossary.js`、`token.js` | `node scripts/check-ui.mjs`、`node scripts/check-kepu.mjs`、`node scripts/check-kepu2.mjs` |

（檔案都在 `js/pages/` 底下。）C 的注意：`home.js` 的標語「持續投資」「感謝過去的自己」「日富一日，年富一年」原文不准改（check-ui 會擋）；`etf101.js` 要留 `'zr101.html'`。

## 驗收指令 PROOF_CMD（自己的檔案）

```
cd D:/ok/zr-toolbox && node scripts/check-plain-pages.mjs js/pages/<你的檔1>.js js/pages/<你的檔2>.js … && <上表的檢查> ; npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

預期：`check-plain-pages OK（N 檔，字串 X 個，改寫 M 個）`；check-ui、check-crash、check-kepu2 輸出 OK；**check-kepu 已知有一條既有失敗「ETF 主題 27 個，至少 34」，除此之外不准有新的 FAIL**；tests 198 pass 198（別人同時在改別的檔，若失敗項跟你的檔案無關就註明）。

## 回報格式（不貼程式碼）

```
代號：
檔案：
check-plain-pages：
其他檢查：
tests：
改不動保留原文的地方：（檔案＋原因；沒有寫「無」）
```
