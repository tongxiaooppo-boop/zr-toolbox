# 任務書：科普與辭典文案白話化（人的語氣）

版本：v1（2026-11-25，Opus）。4 個 Sonnet 平行，各自只改分到的檔案。

## 規矩

- 只准讀：本任務書、分到的檔案、`scripts/check-plain.mjs`（讀懂不准改）。不讀其他檔、不上網。
- 只准改分到的 `js/data/*.js` 檔的**字串內容**。不改結構、鍵名、陣列長度、匯出名稱。
- **不 commit、不 git add、不跑 gen-precache**（Opus 統一做）。不准 stash／reset／checkout。暫存檔一律不留。
- 數字、網址原封不動：每個字串改寫前後，裡面的數字要一模一樣（不准增減、不准改寫成國字），網址不變。
- 不准改：`id`、`url`、`href`、`tools`、`src`、`step`、`no`、`term`、`aka`、`related`、`FIGURE_TEXT`（要跟圖一致）、`*_REFS`（參考資料名稱）。`check-plain.mjs` 會擋。
- 其他檢查腳本有「逐字比對研究報告」的欄位（basics 術語名、zr101 的 ZR_MIXES／DAJEN／ZR_WAYS／ZR_STEPS 等），跑檢查失敗就把那欄改回原文，不准改腳本。

## 語氣（重點）

像一個懂股票、講話直接的朋友，坐在你旁邊用講的解釋給你聽：

- 用「你」。短句，一句講一件事。口語但不油：不用「親」「寶寶」「喔～」、不用 emoji、不連用驚嘆號。
- 先講結論（會怎樣、要注意什麼），再講為什麼。
- 制度用語、公文腔（「僅」「係」「予以」「之」「得」「應」「依規定」「暫緩」）改成日常講法；專有名詞第一次出現時順手用半句話講白。
- 不加新事實、不刪事實，也不加買賣建議。不確定原意就保留原句。
- 長度跟原本差不多或更短。`glossary.js` 的 `plain` 欄 ≤ 40 字。

範例：

- 前：「維持率 130% 以上僅暫緩追繳，低於 130% 應於期限內補繳差額。」
- 後：「維持率掉到 130% 以下，券商會叫你在期限內補錢；在 130% 以上只是先不用補，不代表安全。」

## 分工

| 代號 | 檔案 | 另外要跑的檢查 |
|---|---|---|
| A | `js/data/loans.js` | `node scripts/check-kepu.mjs` |
| B | `js/data/products.js` | `node scripts/check-kepu.mjs` |
| C | `js/data/basics.js`、`js/data/glossary.js` | `node scripts/check-kepu2.mjs` |
| D | `js/data/etf101.js`、`js/data/zr101.js`、`js/data/riskprofile.js`、`js/data/crash.js` | `node scripts/check-kepu.mjs`、`node scripts/check-kepu2.mjs`、`node scripts/check-crash.mjs` |

## 驗收指令 PROOF_CMD（自己的檔案）

```
cd D:/ok/zr-toolbox && node scripts/check-plain.mjs <你的檔案們> && <上表的檢查> ; npm.cmd test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

預期：`check-plain OK（N 檔，改寫 M 段）`，M 越接近全部段數越好；check-kepu2、check-crash 輸出 OK；**check-kepu 已知有一條既有失敗「ETF 主題 27 個，至少 34」，除此之外不准有新的 FAIL**；tests 196 pass 196（其他人同時在改別的檔，若失敗項跟你的檔案無關就註明）。

## 回報格式（不貼程式碼）

```
代號：
檔案：
check-plain：
其他檢查：
tests：
改不動保留原文的地方：（欄位＋原因；沒有寫「無」）
```
