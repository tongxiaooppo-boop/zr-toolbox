# zr-toolbox 交接檔

- 現行版本：決策 2026-11-08（[decision/決策-2026-11-08.md](decision/決策-2026-11-08.md)）
- 狀態：**已定案，尚未開工**。下一步＝Opus 定框架（Gate 0）。

## 這是什麼

「正二與股市計算機工具箱」：手機優先的靜態 PWA，首頁是卡片，術語教學藏在工具裡面。由 `D:\ok\zr-calc` 的研究頁與 77 筆資料重新定義而來（使用者 2026-11-08）。

## 可沿用的舊資產（不在本 repo，要用時複製並註明出處）

| 路徑 | 內容 | 用在 |
|---|---|---|
| `D:\ok\zr-calc\research-model.js`＋`tests\research.test.cjs` | 50/50 觸發、時間制再平衡、質押壓測、目標 Beta 純函式，20 項測試 | 工具 ②③④⑪ |
| `D:\ok\zr-calc\index.html` | 原計算機（本機副本；與線上版不同，見下方） | 工具 ① 導覽 |
| `D:\ok\zr-calc2\` | P0 重構版（core/strategies/storage，31 項測試，3 commits，未上線） | 參考，決策已擱置 P0 |
| `D:\ok\zr-calc\docs\正二策略重新調查-2026-11-08.md` | 策略規則、公式推導、來源 | 各工具的教學文案 |
| `D:\ok\zr-calc\資料蒐集\2026-11-08_正二資料庫\` | 77 筆來源（含 25 個網路計算機比較） | 辭典、出處 |
| `D:\ok\zr-calc\資料蒐集\正2serial.pdf` | AI 科普；錯誤清單見 decision/brief.md 第 4 點 | 股版／債版、迷思澄清 |

## 使用者已定（2026-11-08）

1. 原計算機線上版：https://tongxiaooppo-boop.github.io/zr-calc/ （GitHub `tongxiaooppo-boop/zr-calc`，public，main，最後 push 2026-11-04）。
3. **舊案完全不改**（使用者 2026-11-08）：不改 `tongxiaooppo-boop/zr-calc` repo、不在原頁加入口或導覽。原決策 D3（原頁加導覽、ⓘ、副標）與原頁的 token 402 處理、PWA 更新提示**作廢**。
   - 工具 ① 改為在工具箱內做：(a) 原計算機逐欄教程（對照線上版欄位：持股、正二、現金與負債、目標 Beta、口徑、允許借款、FinMind token），工具箱可以單向連到原頁；(b) 是否另做同公式的白話版計算機（含 token 402 教學）→ Gate 0 時由 Opus 提案、使用者拍板。
   - 教程以**線上版**欄位為準（本機 `D:\ok\zr-calc\index.html`、`D:\ok\zr-calc2\index.html` 都和線上不同，不能當依據）。
   - FinMind token 申請教學（免費會員每小時 600 次）放在工具箱內。

## Gate 規劃（草案，Gate 0 時定死）

- Gate 0（Opus）：目錄、共用 UI 元件（卡片、ⓘ 術語小卡、範例鈕、固定免責區）、各工具純函式簽名、測試名稱與預期值、PROOF_CMD。
- Gate 1：首頁＋術語辭典＋工具 ②③（沿用 research-model）。
- Gate 2：工具 ④⑪⑥⑧。
- Gate 3：工具 ①（原計算機教程＋可能的白話版）、FinMind token 教學、工具箱自己的 PWA 更新提示。
