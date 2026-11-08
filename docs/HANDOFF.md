# zr-toolbox 交接檔

- 現行版本：決策 2026-11-08（[decision/決策-2026-11-08.md](decision/決策-2026-11-08.md)）；框架 **2026-11-08 v4**（[FRAMEWORK.md](FRAMEWORK.md)）
- 狀態：**Gate 3a 完成**（2026-11-08，① 逐欄教程＋token 教學，Codex sol 一輪過、Opus 未修改）。PROOF_CMD 實測：tests 51 全過；smoke pages 9 全過。Gate 0–2 同日完成。
- 手機實機：使用者 2026-11-08 回報線上版可以打開。尚未確認：加到主畫面、離線開啟。
- **使用者 2026-11-08 晚追加三件事**（順序：計算機 → 科普 → 朋友計算機；細節見 FRAMEWORK 第 7 節 Gate 5–7）：
  1. 計算機：Gate 4 四個之外，加 ⑬ 人生槓桿體檢、⑭ 幾倍槓桿最划算（凱利）。歷史回測不做。
  2. 科普：「正二教學」組加圖文頁，含**大仁 50/50 對比 0050**——只顯示原文結果：2014/10/31–2022/05/26、起始 100 萬（正二 50 萬＋現金 50 萬）、漲跌超過 50% 配回、共 4 次（2017/06/03、2019/10/22、2020/11/09、2021/01/19）；50/50 期末 255.3 萬（+155.37%）、0050 期末 237.5 萬（+137.58%）。原文無年化與最大回撤、未說明費用與 0050 是否含息、第三次配回後現金前後寫 99.5 萬與 99.9 萬不一致 → 頁面標「原作者回測，工具箱未重算」並列這些限制。來源：letf.com.tw「50正2槓桿ETF搭配再平衡，輕鬆打敗0050」（資料庫 C01）。
  3. 朋友計算機：工具箱內做帶指導版（推翻 FRAMEWORK 第 8 節），算法照抄線上版、原頁不動。
- 下一步＝**Gate 4**（⑤ 融資維持率〔併融券、整戶維持率〕、⑦ 定期定額／CAGR、⑨ 交易成本、⑩ 股息殖利率）。新對話開工順序：
  1. Opus 在 `js/core/` 新增 `margin.js`、`dca.js`、`cost.js`、`dividend.js` 純函式＋測試（含每頁範例數字的鎖定測試，照 Gate 2b 的 `pledge ④ page example` 寫法），更新 FRAMEWORK 第 3 節表格並升版 v5。
  2. 每個工具一張圖：寫 `docs/figures/<id>-<名>.md`，用 `batch` 派免費 sol（`--sol --effort high`），無頭 Chrome 淺／深色截圖核對數字。
  3. 四個工具量大，建議拆 4a（⑤⑨）、4b（⑦⑩）兩份任務書，各派一次 Codex 面板。
  4. 驗收：`npm test` 數字、`npm run smoke`、讀頁面程式，過了 commit＋push。
- Gate 7 備忘：線上版 `calc()` 原始碼直接抓 https://tongxiaooppo-boop.github.io/zr-calc/ （只讀）；與 ⑪ 的 4 處差異已寫在 `js/data/calcGuide.js` 的 `DIFFERENCES`，移植時要讓新版與線上版同輸入同輸出（寫比對測試），不是照 ⑪ 的行為。
- 今天（2026-11-08）結束時：master＝origin/master，工作目錄乾淨；tests 51、smoke pages 9 全過；Codex 面板沒有進行中的任務（`collab/to-codex.md` 是已完成的 3a）。
- **已部署**（2026-11-08，使用者同意公開）：https://tongxiaooppo-boop.github.io/zr-toolbox/ （GitHub `tongxiaooppo-boop/zr-toolbox`，public，Pages 來源 `master` 根目錄，MIT）。之後每個 Gate 驗收完 `git push` 就會更新（Pages 約 1 分鐘生效）。
- **Codex 面板環境限制**（Gate 1 發現）：PowerShell 擋 `npm.ps1`，要用 `npm.cmd`；沙箱裡 `npm run smoke` 開不了無頭 Chrome 會卡住。任務書的 PROOF_CMD 改成：Codex 只跑 `npm.cmd test`，smoke 由 Opus 跑。
- 驗收指令：`npm test && npm run smoke`（現行預期見上方狀態）。
- 使用者 2026-11-08 補充：工具箱分四大類（正二教學／正二變種／正二槓桿／其他股票計算機，含融資等原 v2 項目），**每個工具都要圖文解說，圖由 sol 畫**（流程見 FRAMEWORK.md 第 5 節）。（「⑪ 擔任白話版、不另做」已被 Gate 7 推翻，見上方追加三件事。）

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
2. 部署：工具箱**獨立部署**（新 repo／新 Pages）。
3. **舊案完全不改**（使用者 2026-11-08）：不改 `tongxiaooppo-boop/zr-calc` repo、不在原頁加入口或導覽。原決策 D3（原頁加導覽、ⓘ、副標）與原頁的 token 402 處理、PWA 更新提示**作廢**。
   - 工具 ① 改為在工具箱內做：(a) 原計算機逐欄教程（對照線上版欄位：持股、正二、現金與負債、目標 Beta、口徑、允許借款、FinMind token），工具箱可以單向連到原頁；(b) 是否另做同公式的白話版計算機（含 token 402 教學）→ Gate 0 時由 Opus 提案、使用者拍板。
   - 教程以**線上版**欄位為準（本機 `D:\ok\zr-calc\index.html`、`D:\ok\zr-calc2\index.html` 都和線上不同，不能當依據）。
   - FinMind token 申請教學（免費會員每小時 600 次）放在工具箱內。

## 派工方式（使用者 2026-11-08 指定）

- Gate 1 起寫程式一律派**訂閱 Codex sol**，走 VS Code 右側 Codex 面板＋md（命令列沙箱壞，`codex-stage.sh` 暫不能用）：
  1. Opus 寫 `collab/to-codex.md`（任務書：要讀的檔案、要改的檔案、照抄的樣板 `js/pages/trigger5050.js`、PROOF_CMD 與預期輸出、回報欄位），commit 到 master。
  2. 請使用者在面板打：「讀 collab/to-codex.md 照做，完成寫 collab/from-codex.md」。
  3. 使用者說做完 → Opus 讀回報、看 `git diff`、自己重跑 `npm test && npm run smoke`，修正最多 2 輪。
- 直接在本專案目錄做，不複製 repo。面板不能用或使用者不在 → 改派 Sonnet 子代理。
- 圖解不在任務書裡：Opus 派免費 sol 一次問答畫好、核對完放進 `img/<id>/`，Codex 只用 `figure()` 放進頁面。
- 一次一個 Gate，每輪約 3 步；Codex 不得改 `js/core`、測試預期值、`components.js` 介面，覺得要改就停下寫進回報。

## Gate 規劃（定稿見 FRAMEWORK.md 第 7 節）

- Gate 0 ✅（Opus）：core 全部純函式已實作（research-model 移植＋新寫），40 項單元測試＋4 項資料一致性測試；共用 UI 元件；首頁；工具 ② 已完成並當樣板；冒煙測試 `scripts/smoke.mjs`。
- Gate 1（Codex sol）：⑫ 術語辭典（18 個必備詞）＋ ③ 定期配比再平衡。
- Gate 2：④⑥⑧⑪（開工前 Opus 補 `lineChart` 簽名）。
- Gate 3：①、FinMind token 教學、PWA 與更新提示、部署（新 repo；免費 GitHub Pages 需 public repo，公開前照全域規則檢查）。
- Gate 4：⑤ 融資維持率、⑦ 定期定額／CAGR、⑨ 交易成本、⑩ 股息殖利率（原決策列 v2，使用者 2026-11-08 納入）。
