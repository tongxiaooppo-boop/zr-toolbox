# zr-toolbox 交接檔

## ⚠ 方向修正（使用者 2026-11-08 晚，最優先；蓋過下方 Gate 4–7 計畫與 FRAMEWORK 第 7 節）

使用者原話：「正2計算機（原型＋變種＋槓桿）／融資率／還有 sol 調研 77 套內容對應的計算機，我不是要白話，是要一步一步帶投資新手輸入，輸入股票代號＋買入數＋買入價格＋相關金額，倍率及對應參數，輸出結果並解說。感覺你跑偏了。」

**跑偏在哪**：Gate 0–3 做成「一張表單、直接填市值、文案寫白話」。使用者要的是**逐步引導（精靈式）**：新手不需要先懂市值、曝險這些概念，照步驟填自己真實的交易紀錄就好。

**目標樣子（Opus 的理解，下次開工先跟使用者確認）**：
1. 每個計算機都是分步驟的精靈：① 選要算什麼（或從首頁問題進入）→ ② 輸入持股：**股票代號＋買入股數＋買入價格**（現價用代號自動抓 FinMind 最近收盤價，抓不到就手動填）→ ③ 相關金額：現金、借款／質押／融資金額等 → ④ 倍率與參數：目標倍數、再平衡規則、追繳線、利率等，每一步附一句說明＋範例 → ⑤ 結果：數字＋**逐項解說**（這個數字怎麼來的、代表什麼、要做什麼）。
2. 涵蓋範圍：
   - 正二計算機三大類：**原型**（原型＋正二，例 532 股版）、**變種**（50/50 觸發、定期配比 532／442／433、股版／債版，以及 77 筆資料裡的其他策略：一貓人沙威瑪、輕紫琉璃旁支、乘豐大道至簡 V2.3…）、**槓桿**（質押、借錢買 0050 或直接買正二、目標 Beta）。
   - 融資維持率（含融券、整戶）。
   - sol 調研 77 筆資料裡**有計算方法的**（策略規則、配置比例、質押／融資算法、網路計算機），各對應一個計算機。**很多筆是科普文件（證交所／SEC 風險說明、論文、基金資料），跟計算無關，不做計算機，放進科普頁或工具的解說**（使用者 2026-11-08 補充）。來源：`D:\ok\zr-calc\資料蒐集\2026-11-08_正二資料庫\`（`變種策略比較.md`、`計算機比較.md`、`來源筆記/`）。
3. FinMind：因為要用代號抓價，token 要存，**只存在使用者自己的瀏覽器**（localStorage），只送給 FinMind（使用者 2026-11-08 說明）；402／403／400／401 照 `js/core/finmind.js` 的規則處理。這條推翻 FRAMEWORK「工具箱不抓 FinMind、不存 token」。

**現有資產還能用的**：`js/core/` 全部純函式與 51 項測試（公式不變，改的是輸入方式）、術語辭典、14 張圖、PWA、部署。**要重做的**：各工具頁的輸入流程（從單一表單改成精靈）、首頁入口。

**2026-11-09 使用者拍板（照 Opus 建議，第 1 步完成）**：
1. 精靈＝一步一畫面，有進度點、上一步／下一步。
2. 樣板工具＝④ 質押。
3. 持股可「＋再加一檔」，由工具決定哪些代號算擔保品或曝險。
4. 老手捷徑＝結果頁「改參數重算」跳回某一步，不另做一頁式表單。
5. 沒有 FinMind token → 現價手動填，旁邊放 token 教學連結。
6. 使用者追加：研究範圍加「圍繞正二與各類 ETF 的股票常識」；調研改派**訂閱 Codex sol**（面板可上網），取代下方第 2、2b 步的 luna／Opus WebSearch。任務書 `collab/to-codex.md`（研究任務 R v4，產出 `docs/research/R1–R3`；R2／R3 的每個網頁留原文全文於 `docs/research/來源/原文/`〔gitignore，只留本機〕＋sol 用自己理解的轉寫筆記於 `docs/research/來源/`〔會 commit〕），驗收 `node scripts/check-research.mjs`。Codex 回報後 Opus 抽查網址與稅率數字，再合併成清單給使用者挑選排序。

**2026-11-09 進度（Opus）**：
- 研究 R 完成（Codex sol，Opus 驗收：check OK、轉寫筆記與原文 8 字重疊極低、抽查證交稅 0.3%／ETF 0.1%、當沖 0.15% 至 2027-12-31、債券 ETF 免徵至 2026-12-31、二代健保 2.11% 皆與原文一致）。合併清單 [research/候選清單.md](research/候選清單.md)，**使用者照 Opus 建議順序拍板**：④ 樣板 → ⑨ 買賣成本與損益 → ⑩ 股息與除權息 → ⑦ 定期定額 → ⑤ 融資融券 → ⑮ 平均成本 → 其餘 A 類改精靈 → ⑬⑭ → ⑯⑰⑱；歷史回測類不做。
- 框架 **v5** 完成（Opus 自己寫）：`js/ui/wizard.js`、`js/net/price.js`、`js/core/holdings.js`、`js/data/stocks.js`、`pledgePlan`；④ 已改成精靈樣板。tests 60、smoke 9 全過；無頭 Chrome 實測輸入 0050 真的抓到 FinMind 收盤價、四步走完、回第 1 步值還在、390px 無水平捲動。
- 小調整（使用者第 5 點的延伸）：沒有 token 也先匿名抓（每小時 300 次，原計算機就是這樣），抓不到才手動填。
- v5.1（同日，使用者要求）：桌面左計算機、右說明欄，手機說明在下方；④ 三張步驟圖＋兩張格子小圖（成本均價、認列成數），sol 畫、Opus 核對數字。
- **UI 美化延後**（使用者 2026-11-09：「ui 有點醜，程式完成再調」）：計算機都做完後統一改 `css/app.css`＋`components.js`／`wizard.js`；調之前請使用者指出哪裡醜或給參考網站。圖的風格（SVG 內配色字型）若要改要早說，否則整批重畫。
- ④ 樣板使用者 2026-11-09 已點頭。
- **卡通圖（使用者 2026-11-09）**：嫌 SVG 太簡單，改用訂閱 sol 生卡通圖（實測中文與數字正確）。④ 已試做兩張：`img/pledge/comic.webp`（怎麼讀四格）、`img/pledge/step2.webp`（步驟 2），Opus 逐字核對無誤。流程見 FRAMEWORK 第 5 節 v5.2；之後每個工具派工前，Opus 先寫卡通提示請使用者生圖。
- **⑨ 進度（2026-11-09，Opus 自己寫；文案即規格，寫任務書不划算）**：`js/core/cost.js`＋`tests/cost.test.js`（8 項，第 1 組對上研究 R2-02 原頁範例 584 元／100.587→101）、4 個術語（手續費、證交稅、損益兩平價、升降單位）、`js/pages/cost.js`＋`tools/cost.html`、步驟 3 SVG（free sol，已核對）。無頭 Chrome 實測範例與手動（0050 零股、2.8 折）數字全對。**卡通圖已到（使用者 2026-11-09）**：Opus 逐字核對兩張無誤，轉 `img/cost/comic.webp`、`img/cost/step2.webp`，卡片改 ready 並上線（tests 68、smoke 10 全過）。
- **⑩ 進度（2026-11-09）**：Opus 寫好 `js/core/dividend.js`＋`tests/dividend.test.js`（5 項，範例 10,000 股／收盤 50／現金 2.4＋股票 0.5 → 實領 23,388、參考價 45.33、填息 10.29%）、4 個術語（除權息、殖利率、填息、二代健保補充保費）、卡通提示 `docs/figures/cartoon/dividend-01-領股利四格.md`→`out/dividend-comic.png`、`dividend-02-股利公告怎麼看.md`→`out/dividend-step2.png`；頁面＋生兩張卡通圖的任務書 `collab/to-codex.md`（⑩ v2）待 Codex 面板做。**待查證**：股票股利以面額計入補充保費的股利所得（研究原文沒寫，Opus 依健保署規則補）。
  - **已上線（2026-11-09）**：Codex 一輪過（頁面照規格、兩張卡通圖由 Codex 面板 imagegen 生成，step2 自行重生 1 次修引號），Opus 未修改；逐字核對兩張圖無誤，轉 `img/dividend/*.webp`，卡片 ready。tests 73、smoke 11 全過。
  - 發現：Codex 面板可以生圖，之後「頁面＋卡通圖」併成一份任務書、使用者只打一句。
- **⑦ 進度（2026-11-09）**：Opus 寫好 `js/core/dca.js`（`dcaPlan`、`cagr`、`monthlyRate`）＋`tests/dca.test.js`（7 項，預期值用年金公式獨立算：每月 5,000、20 年、6%、月初 → 2,278,229；手續費 1,680；硬算年化 3.26%）、3 個術語（定期定額、複利、年化報酬）、卡通提示 `dca-01`→`out/dca-comic.png`、`dca-02`→`out/dca-step3.png`；任務書 `collab/to-codex.md`（⑦ v1，頁面＋生圖一份）待 Codex 面板做。
  - **已上線（2026-11-09）**：Codex 一輪過（頁面＋兩張圖，0 次重生），Opus 未修改；兩張圖逐字核對無誤，轉 `img/dca/*.webp`，卡片 ready。tests 80、smoke 12 全過。
- **⑤ 進度（2026-11-09）**：Opus 寫好 `js/core/margin.js`（`marginPlan`、`shortSummary`；融資／融券／整戶一個函式）＋`tests/margin.test.js`（7 項，預期值手算對上 R2-06 原頁：60 萬融資、市值 76 萬 → 126.67%；6／5／4 成跌 22／35／48% 碰 130%；融券漲 46.15%；目標 1÷0.6 時補現金 240,000、還融資 144,000；整戶 177.27% 不是平均 178.33%）、3 個術語（融資、融券、整戶維持率）、`holdingsInput` 新增 `side: 'short'`（欄名改融券股數／融券賣出價；向下相容）、卡通提示 `margin-01`→`out/margin-comic.png`、`margin-02`→`out/margin-step1.png`；任務書 `collab/to-codex.md`（⑤ v1，頁面＋生圖一份）待 Codex 面板做。tests 87、smoke 12 全過。
  - 簡化（頁面註明）：不算券商把融資金額／保證金取整數、融券價款不扣費用與借券費、不算假除權息。
  - **已上線（2026-11-09）**：Codex 一輪過（頁面＋兩張圖，0 次重生）；兩張圖逐字核對無誤，轉 `img/margin/*.webp`，卡片 ready。Opus 只改一處文案：已低於追繳線時，參考價說明改成「要漲回／跌回這個價格」。無頭 Chrome 實測範例與「融資＋融券」手動流程數字全對。tests 87、smoke 13 全過。
- **UI 風格已定（使用者 2026-11-09）：第 5 套 Neo-brutalism 粗框硬陰影**。樣板 [ui/style-5-neo-brutalism.html](ui/style-5-neo-brutalism.html)＋截圖 `docs/ui/style-5-*.png`（5 套原 demo 在 `D:\ok\zr-ui-demo\`，不在 repo）。重點：米黃底 `#fff4c9`、白卡片、3px 黑框、`5px 5px 0` 硬陰影、橘紅主按鈕 `#ff5a36`、結果卡依語意填色（藍資訊、綠賺、黃警告、紅錯誤）、表頭橘紅、小圓角 6px；深色模式框線與陰影改淺色。計算機都做完後統一改 `css/app.css`（＋`components.js`／`wizard.js` 需要時），不逐頁改。注意：深色模式 demo 沒截圖驗證過；Sonnet 評「可信感較低」，數字區要保持好讀。
- **⑲ 進度（2026-11-09）**：Opus 寫好 `js/core/retire.js`（`retirePlan`、`annuityFactor`，移植 todo2 PRD 4.7 成長型年金；改正 todo2 在報酬＝通膨時少除 (1＋i)；勞保月退金改「其他每月固定收入」；加月初／月底領、4% 法則對照、想花多少→要存多少）＋`tests/retire.test.js`（7 項，todo2 三個鎖定值 49,768.29／39,875.32＋65,311.81／36,500.69 全對上，另用逐月加總現值獨立驗算）；⑦ `dcaPlan` 加「停扣後再滾」（`holdYears`／`holdReturn`，+1 項測試）；3 個術語（通膨、實質購買力、4% 法則）；tools.js 加 ⑲（status 先 `planned`，圖到了再改 ready）；卡通提示 `retire-01`→`out/retire-comic.png`、`retire-02`→`out/retire-step3.png`；任務書 `collab/to-codex.md`（⑲ v1：⑲ 頁面＋⑦ 加兩格與「帶到退休提領」連結＋生圖）待 Codex 面板做。tests 95 全過。
  - **已上線（2026-11-09）**：Codex 一輪過（頁面＋⑦ 修改＋兩張圖，各重生 1 次修標點／角色一致）；兩張圖逐字核對無誤，轉 `img/retire/*.webp`，卡片 ready。Opus 只改一處：⑦「停扣後再放幾年」、⑲「其他每月固定收入」兩個選填欄留白當 0（原本會跳錯）。無頭 Chrome 實測範例數字全對、⑦→⑲ 帶入 `?pool=2278229`、選填留白可算。tests 95、smoke 14 全過。
- **⑮ 進度（2026-11-09）**：Opus 寫好 `js/core/avgcost.js`（`avgCostPlan`：逐筆手續費、整股／零股各自低消、含費／不含費均價、全部賣出的不虧價、現價損益、再買之後、攤平到目標均價要買幾股）＋`tests/avgcost.test.js`（6 項，R2-11 範例 95.00／95.14 對上；頁面範例手算：95.6→88.1 不虧價、虧損 −30,978→−31,914、攤平到 88 要 1,810 股）；`cost.js` 抽出 `breakEvenPrice`／`sellProceeds`（⑨ 測試不變全過）；`wizard.js` 加 `lotsInput`／`readLots`、`holdingsInput` 的 `side: 'lot'`（＋`css` 兩行）；2 個術語（平均成本、攤平）；tools.js 加 ⑮（`planned`）；卡通提示 `avgcost-01`→`out/avgcost-comic.png`、`avgcost-02`→`out/avgcost-step1.png`；任務書 `collab/to-codex.md`（⑮ v1，頁面＋生圖一份）待 Codex 面板做。tests 101、smoke 14 全過。框架升 v5.4。
  - **已上線（2026-11-09）**：Codex 一輪過（頁面＋兩張圖，0 次重生），Opus 未修改；兩張圖逐字核對無誤，轉 `img/avgcost/*.webp`，卡片 ready。無頭 Chrome 實測範例 8 項與明細 3 列全對；手動（0050 零股 300 股、2.8 折、第 3 步留白）均價 150.06／+2,916／不虧價 150.3 與手算一致。tests 101、smoke 15 全過。小事：結果卡 tone `info` 目前沒有 CSS（顯示預設色），UI 統一美化時補。
- **研究任務 O 完成（2026-11-09，Codex sol，Opus 驗收）**：報告 [research/O-朋友計算機出處.md](research/O-朋友計算機出處.md)。**出處沒找到**：線上版無出處說明、repo 無 README，4 個 commit 全是 Claude Sonnet 協作（`tongxiaooppo-boop/zr-calc` 在使用者自己的帳號）→ 方法要問當初下指令的人。最接近同類 T06 HAMR 指數爆擊流（鼠叔），但它是輸入三類百分比重配，沒有目標 Beta 反解／口徑／借款。A 130 萬、B 192 萬對上。Opus 抽查 C（6,666,667、總 1.4／淨 2.59）、T01 補款疑點（網站 144 萬→0.98，正確外部 360 萬）皆重算一致。
  - **更正出處（使用者 2026-11-09）**：朋友那格是使用者請手機版 Claude 依計算模板 md 做的（`docs/research/來源/O-08_原始規格：正二平衡計算器模板.md`），後來小改。Opus 對照結果寫在 O 報告末節「追加：原始規格」：公式、X<0 設 0（第 3 條＝刻意）、現金不足不自動借款都照規格；借款後分母、多檔正二、完整重配是後來補的；第 4 條是規格缺口。
  - Gate 7 備忘：① 方法標「使用者以手機版 Claude 依計算模板製作，後續小改」；② 「可以執行」≠ 達標（D 組可執行但仍 1.0、目標 0.8）；③ 借款後總資產分母要重算，**不移植 T01 補款公式**；④ Opus 任務書的 C 組標錯：B＝1.4 < 正二 Beta 2，不會觸發 DIFFERENCES 第 4 條，Gate 7 寫比對測試時另加 B ≥ 2 且現金不足的案例。
- **朋友計算機收錄決定（使用者 2026-11-09）**：[decision/決策-2026-11-09-朋友計算機收錄.md](decision/決策-2026-11-09-朋友計算機收錄.md)：⑪ 升級成精靈「正二要買多少」、算法照抄線上版＋比對測試（＝Gate 7＋⑪ 改精靈合併）、七個難懂處都要圖文、網路公開做法不另收（⑪ 說明欄放對照表）、① 保留。原始規格已移到 `docs/research/來源/O-08_原始規格：正二平衡計算器模板.md`。
- **⑪ 正二要買多少 進度（2026-11-09，Opus）**：照決策 2026-11-09 寫好 `js/core/balance.js`（`balancePlan`＝朋友線上版 `calc()` 照抄移植，加判讀 `enough`／`reached`／`capped`／`borrowCantReach`；`checkBalanceRows` 給步驟檢查）＋`tests/balance.test.js`（15 項：O 組 A–D、B≥2 總資產借款組、現金不足、完整重配等鎖定值手算；另有 17 組輸入直接跑線上版原始碼比對，fixture `tests/fixtures/zr-calc-online.src.txt` 由 O-01 原文逐字抽出）。`calcGuide.js` 的「⑪ 對應」改指新精靈步驟、DIFFERENCES 改寫（仍 4 條）；tools.js ⑪ 標題改「正二要買多少」、加首頁捷徑；`wizard.js` 檔頭定 `betaHoldingsInput`／`readBetaHoldings` 簽名；框架 v5.5。卡通提示 `balance-01`→`out/balance-comic.png`、`balance-02`→`out/balance-step3.png`、`balance-03`→`out/balance-step4.png`；任務書 `collab/to-codex.md`（⑪ v1：元件＋頁面＋① 兩句＋三張圖）待 Codex 面板做。tests 116 全過。
  - 舊 `exposure.js`（`exposureNow`、`betaPlan`）與其測試保留，新頁不用。① 的 `img/calc-guide/map.svg` 還寫舊 ⑪ 欄位名，UI 統一美化時重畫。
  - **已上線（2026-11-09）**：Codex 一輪過（元件 `betaHoldingsInput`＋頁面＋① 兩句＋三張圖，step4 重生 1 次修引號），Opus 未修改；三張圖逐字核對無誤，轉 `img/exposure/comic.webp`、`step3.webp`、`step4.webp`。無頭 Chrome 實測範例（130 萬／65,000 股／現金 70 萬／1.40 倍／總資產口徑 340 萬現金不夠）與手動「0050 1,000 萬＋00631L、00685L 各 20 萬、現金 100 萬、借款 300 萬、總資產口徑、允許借款、1.4 倍」（調到 6,666,667、借 5,266,667、淨資產口徑變 2.78 倍）皆與 core 一致。tests 116、smoke 15 全過。
- **其餘 A 類改精靈（使用者 2026-11-09 拍板）**：② ③ ⑥ ⑧ **四個全改精靈**；③ 照 R2 **擴充成任意多檔＋股數取整**（保留 532／442／433 等模板）；② 基準價可**填上次配回日期自動抓那天收盤價**（`fetchCloseOn`）。順序 ② → ③ → ⑥⑧。
  - **② 進度（2026-11-09，Opus）**：`trigger5050Plan`（core）＋`fetchCloseOn`／`priceUrl` 加 `endDate`（net）＋`tests/trigger.test.js`（6 項：範例 5,000 股／基準 20／現價 30.5／現金 10 萬 → +52.5%、賣 861 股、下次 15.25／45.75；跌 51% 買 2,602 股捨去；門檻 30%；疑似分割；依日期抓價遇假日用前一交易日）；卡通提示 `trigger-01`→`out/trigger-comic.png`、`trigger-02`→`out/trigger-step2.png`；任務書 `collab/to-codex.md`（② v1，頁面＋生圖一份）待 Codex 面板做。框架 v5.6。tests 122 全過。
  - **已上線（2026-11-09）**：Codex 一輪過（頁面＋兩張圖，comic 重生 1 次）；兩張圖逐字核對無誤，轉 `img/trigger5050/comic.webp`、`step2.webp`。Opus 改三處：「用買入價」模式每次進第 2 步都跟第 1 步買入價同步；股數加千分位；**疑似分割時只顯示漲跌幅＋警告，不給買賣股數與觸發價**（無頭 Chrome 實測：00631L 填 2026-01-03 → 抓到 01-02 收盤 375.25，現價 26.3，原版會建議「跌到了，買 450 股」）。範例數字全對、回第 2 步值還在、390px 無水平捲動。tests 122、smoke 15 全過。
  - **② v2 股票事件（使用者 2026-11-09：「有股票事件要帶入；也可要求使用者重新輸入券商 App 的股數＋成本」）**：Opus 寫好 `js/core/events.js`＋`fetchEvents`＋`tests/events.test.js`（3 項，用 FinMind 實際資料：00631L 2026-03-31 分割 443.15→20.14，基準 375.25 → 17.0541，現價 26.3 → +54.2% 要配回；0050 有 4 筆除息＋1 筆分割已實查）。除權息也換算（還原價），結果頁提醒現金股利加進策略現金。任務書 `collab/to-codex.md`（② v2，只改頁面）。框架 v5.7。
    - **已上線（2026-11-09）**：Codex 一輪過；Opus 只改一句（買進說明不限跌到時）。無頭 Chrome 實測 00631L 填 2026-01-03 → 01-02 收盤 375.25 × 20.14 ÷ 443.15 ＝ 17.0541，結果頁列出換算過程、+54.2% 要配回。tests 125、smoke 15 全過。
- **③ 進度（2026-11-09，Opus）**：`js/core/rebalance.js` 新增 `WIZARD_TEMPLATES`（8 個含自訂，模板只是預設列）、`guessBeta`（L 2／R −1／B 0／其他 1）、`rebalancePlan`（任意多檔、新投入、零股／整張取整：買捨去、賣四捨五入、整張不超賣、現金變負就從最大買單減）＋`tests/rebalance.test.js`（6 項手算：範例 0050 2,000 股@195.5、00631L 9,000 股@26.3、現金 172,300、新投入 5 萬 → 總額 85 萬、買 173／695 股、現金 170,200、曝險 1.08→1.10；正二漲到 40 → 零股賣 2,075 股、整張賣 2 張；債版建倉 00679B 5,263 股）；`stocks.js` 加 00679B；舊 `TEMPLATES`／`rebalance` 保留。卡通提示 `rebalance-01`→`out/rebalance-comic.png`、`rebalance-02`→`out/rebalance-step1.png`；任務書 `collab/to-codex.md`（③ v1：`betaHoldingsInput` 加 `kind:'mix'`＋頁面＋生圖）待 Codex 面板做。框架 v5.8。tests 131 全過。
  - **已上線（2026-11-09）**：Codex 一輪過（`kind:'mix'`＋頁面＋兩張圖，0 次重生），Opus 未修改；兩張圖逐字核對無誤（step1 老師多了眼鏡，不影響），轉 `img/rebalance/comic.webp`、`step1.webp`。無頭 Chrome 實測範例 8 項全對；手動「532 債版 → 模板代號自動抓價 → 00631L 10,000 股、現金 25 萬 → 比例 90% 被擋 → 整張」00679B 買 5 張、00631L 不動、現金 115,550、曝險 1.03 與手算一致。tests 131、smoke 15 全過。舊 `img/rebalance/532-stock.svg` 頁面已不用，留著。
- **⑥⑧ 進度（2026-11-09，Opus）**：`decayPlan`（decay.js）、`drawdownPlan`（drawdown.js）＋`tests/wizard68.test.js`（7 項，封閉公式：±5% 震盪 20 天、100 萬 → 大盤 975,279、以為 950,559、正二 904,382；每年 1% 費用 250 天；0050 1,000 股 200→150 → 跌 25%、要漲 33.3%、虧 50,000、8% 約 3.7 年；高點 18,000→15,300；紀錄 130→65）。卡通提示四張 `decay-01/02`、`drawdown-01/02`；任務書 `collab/to-codex.md`（⑥⑧ v1：兩頁＋四張圖一份）待 Codex 面板做。框架 v5.9。tests 138 全過。
  - **已上線（2026-11-09）**：Codex 一輪過（兩頁＋四張圖，decay-comic、drawdown-comic 各重生 1 次）；四張圖逐字核對無誤（decay-step1 多了角色名牌，不影響），轉 `img/decay/`、`img/drawdown/` 的 `comic.webp`、`step1.webp`。Opus 改三處小事：⑧ 紀錄欄拿掉「（選填）」、⑧「現在離最高點」公式補「1 −」、⑥ 圖表座標不再出現「-0%」。無頭 Chrome 實測：⑥ 範例（−2.5%／−4.9%／−9.6%、少 46,177）、手動一路跌 30% 250 天＋費用 1% → 正二 −51.5%（手算一致）；⑧ 範例（25%／33.3%／50,000／3.7 年）、貼紀錄 130→65、現在離最高 15.4%、0050 自動抓價。tests 138、smoke 15 全過。Codex 做法：第 2 步標題／提示依第 1 步選擇改 `steps[1]`（wizard 每次 render 讀 steps，可行）。
- **A 類改精靈全部完成**（②③④⑤⑥⑦⑧⑨⑩⑪⑮⑲）。
- **科普範圍追加（使用者 2026-11-09）**：首頁加「科普」分組。① **ETF 入門**（素材現成：[research/R3-ETF常識.md](research/R3-ETF常識.md) 37 條，不用再調研）；② **借錢投資的管道**＝**個人可以借的全部管道**（使用者原話「全部喔，個人可以借的」）：股票質借（銀行／券商不限用途）、融資、融券、借券、個人信貸、房貸增貸／理財型房貸、保單質借，以及其他個人可借管道（例：信用卡預借現金、車貸增貸等，由調研補齊）。要先派 Codex sol 上網調研 **研究 R4**（每種：怎麼借、利率大約、會不會追繳／斷頭、期限、最壞情況、官方來源＋查詢日期），頁面放總比較表並連到 ④⑤⑬；③ 正二教學（FRAMEWORK Gate 6 原規劃）。
  - **順序（使用者定）**：先做 ⑬⑭，科普放後面。⑬ 若需要信貸／房貸數字，先用使用者輸入（利率、月付自己填），不等 R4。
- **⑬⑭ 進度（2026-11-09，Opus）**：`js/core/lifelev.js`（`lifeLeveragePlan`、`loanPayment`、`DEBT_KINDS`；口徑照 HAMR 人生槓桿，不採作者建議倍數）、`js/core/kelly.js`（`kellyPlan`、`leveredGrowth`；每日固定倍數 GBM，借錢段 borrowRate、現金段 cashRate，腰斬機率 0.5^(2ν/(Lσ)²)）＋`tests/lifelev-kelly.test.js`（7 項：房貸 800 萬 2.2% 25 年月付 34,692.69 用逐月攤還驗；⑬ 範例金融淨資產 1,981,000、曝險 1.52、帳面 2.50、總曝險 2.51、結餘 +7,307、現金 5.4 月、生活費 4.1 倍、歸零 65.9%、跌 30% → 1,078,900／1.66；⑭ 範例 8%／20%／3%／1% → 全凱利 1.69（格點搜尋驗）、年化 9.02%、2 倍 8.80%／腰斬 48.1%、1.4 倍 8.84%／22.4%、3.76 倍歸零）；4 個術語（金融淨資產、生活費倍數、波動、凱利倍數）；tools.js 加 ⑬ `lifelev`、⑭ `kelly`（`planned`）；`wizard.js` 檔頭定 `kind:'life'`、`debtsInput`／`readDebts`；卡通提示 `lifelev-01/02`、`kelly-01/02`；任務書 `collab/to-codex.md`（⑬⑭ v1：兩個元件＋兩頁＋四張圖）待 Codex 面板做。框架 v5.10。tests 145 全過。
  - **已上線（2026-11-09）**：Codex 一輪過（`kind:'life'`、`debtsInput`／`readDebts`、兩頁、四張圖 0 次重生）；四張圖逐字核對無誤（四格圖的老師沒戴眼鏡，不影響），轉 `img/lifelev/comic.webp`、`step3.webp`、`img/kelly/comic.webp`、`step1.webp`，兩張卡片 ready。Opus 改三處：沒填收入時每月要付的算式改成「＋」並補總數、沒持股時大跌情境不再以「。」開頭、⑭ 表格「全凱利」去掉重複括號（core label 改「全凱利」）。無頭 Chrome 實測 ⑬⑭ 範例數字全對；手動「沒持股＋質押 100 萬只填利率 3%＋沒收入」：投資金額 placeholder 自動變「留白＝全部」、金融淨資產 −400,000、曝險算不出來、每月要付 52,500。tests 145、smoke 17 全過。
- **⑯⑰⑱ 進度（2026-11-09，Opus）**：`js/core/valuation.js`（`valuationPlan`、`ratiosToBase`、`historyBands`）、`js/core/divtax.js`（`dividendTaxPlan`、`progressiveTax`、`TAX_YEARS`）、`js/core/fx.js`（`fxPlan`、`ratePair`）、`price.js` 加 `fetchDataset`／`fetchRatios`／`fetchFxRate`＋`tests/valuation-divtax-fx.test.js`（10 項：⑯ 範例 580／EPS 32／淨值 140／股利 16 → 480–800、420–700、400–640；⑰ 單身薪資 80 萬股利 30 萬 → 合併 8,120、分開 100,800；高薪 600 萬＋股利 200 萬分開省 160,000；四口之家基本生活費差額 202,000 → 可退 8,500；⑱ 33 萬換 1 萬美元→11,000、33→31.5 → +15,400、拆解 +32,950／−16,500／−500／−550）。5 個術語（每股盈餘、本益比、本淨比、股利合併／分開計稅、匯差）；tools.js 加 ⑯ `valuation`、⑰ `divtax`、⑱ `fx`（`planned`）；卡通提示六張 `valuation-01/02`、`divtax-01/02`、`fx-01/02`；任務書 `collab/to-codex.md`（⑯⑰⑱ v1：三頁＋六張圖）待 Codex 面板做。框架 v5.11。tests 155 全過。
  - 稅率參數（Opus WebSearch 2026-11-09，新聞轉述財政部 2025-11-27 公告；累進差額自行驗算）：115 年度免稅額 101,000（70 歲以上 151,500）、標準 136,000／272,000、薪資 227,000、級距 61／138／277／519 萬；114 年度 97,000／145,500、131,000／262,000、218,000、59／133／266／498 萬、基本生活費 213,000。**115 年度基本生活費未公告（通常 11 月下旬）→ 暫用 213,000，公告後改 `TAX_YEARS[115].basicLiving`、`provisional:false`**。
  - FinMind 實測（匿名可用）：TaiwanStockPER 2330 五年 1,211 筆、分位 16.7／23.4／27.6 倍；0050 無資料（ETF）→ 頁面請使用者自填；TaiwanExchangeRate USD 即期 32.72／32.82、JPY 也有。
  - **已上線（2026-11-09）**：Codex 一輪過（三頁＋六張圖；第一輪 6 次生圖因 PowerShell 把提示序列化成物件字串而畫出無關照片，未交付，修正後各重生 1 次、valuation-step3 2 次）。六張圖逐字核對無誤，轉 `img/valuation/`、`img/divtax/`、`img/fx/` 的 webp，三張卡片 ready。Opus 改一處：⑯ 反推 EPS／淨值／股利改用**證交所比率那天**的收盤價（`fetchCloseOn`；原本用最新收盤價配舊比率，2330 實測 2235 vs 2135 差 4.7%），並取 2 位小數。無頭 Chrome 實測：三頁範例數字全對；2330 → 11-06 收盤 2135 反推 EPS 86.26、五年區間帶入 16.71／23.37／27.61；0050 正確提示自填；⑰ 114 年度四口之家可退 8,500；⑱ 填 2026-01-03 → 抓 01-02 牌告 31.37／31.47、第 3 步自動抓今天 32.72／32.82；390px 無水平捲動。tests 155、smoke 20 全過。
- **下次開工（新 session，從這裡接）**：計算機全部完成（②–⑲）。下一步 → 科普（研究 R4 個人借錢管道 → ETF 入門、借錢管道、正二教學）→ UI 統一美化（Neo-brutalism）。另：**115 年度基本生活費公告後（約 11 月下旬）改 `js/core/divtax.js` 的 `TAX_YEARS[115].basicLiving` 與 `provisional:false`**。
- **研究 R4 完成（2026-11-09）**：任務書 `collab/to-codex.md`（R4 v1：個人可借的全部管道，比較表 11 欄 ≥14 列＋新手常見誤解＋待查與矛盾，原文／轉寫照研究 R 規則），驗收 `node scripts/check-r4.mjs`（Opus 寫）。Codex 一輪過：比較表 28 列（利率待查 14）、誤解 12 條、來源 28 個；Opus 抽查融資 130%／166%、信用卡循環上限 15%、當舖 30%／倉棧費 5%、民法 16% 皆與原文一致。報告 [research/R4-個人借錢管道.md](research/R4-個人借錢管道.md)。
- **全站離線（使用者 2026-11-09：「安裝後就直接全部本地可以跑」，Opus 自己做）**：`sw.js` 安裝時預快取整站 124 個檔（約 6 MB），`VERSION`＝整站內容雜湊，網站一改就重新下載整份；連不上就用手機裡那份，不靠 GitHub。清單與版本由 `node scripts/gen-precache.mjs` 產生，`tests/pwa.test.js` 會擋忘記重跑。**之後每次改網站檔案（含 Codex 任務），commit 前都要跑 `node scripts/gen-precache.mjs`**；任務書 PROOF_CMD 改成 `node scripts/gen-precache.mjs && npm.cmd test`。無頭 Chrome 實測：只開首頁一次 → 關掉伺服器 → ⑭⑱⑨（沒開過）與首頁照常、範例能算、圖片沒破。仍要網路：FinMind 抓價（抓不到改手動填）。
- **UI v1 已上線（2026-11-09）**：Codex 一輪過（app.css 150→183 行、`references(items)`、科普用 `.article`／`.compare-wrap`／`.refs`；淺色橘紅小字對比 3.1 不足 → 連結與編號改黑字，橘紅只用在底色與線條），Opus 未修改。check-ui OK、tests 155、smoke 20 全過；無頭 Chrome 截圖 390 淺／深、1280、首頁、精靈第 1 步皆正常。下一步＝科普（ETF 入門 R3、借錢管道 R4、商品與獲利方式 R5、基本術語 R5、正二教學）。
- **研究 R5 完成（2026-11-09）**：Codex 一輪過：商品 20 列（不建議 9）、獲利方式 7 列、術語 48 列、來源 35 個（全為官方：證交所、櫃買、期交所、集保、財政部、金管會、健保署、投信投顧公會，及券商／銀行官網）。Opus 抽查證交稅 0.3%／ETF 0.1%／當沖 0.15% 至 2027-12-31、期交稅股價類十萬分之 2、選擇權權利金千分之 1、健保 2.11% 皆與原文一致。注意：債券 ETF 證交稅停徵現行到 2026-12-31，延長至 2036 尚是草案（科普頁寫現行並註記）。報告 [research/R5-商品與獲利方式.md](research/R5-商品與獲利方式.md)、[research/R5-基本術語.md](research/R5-基本術語.md)。
- **UI 統一美化任務書（2026-11-09，Opus）**：使用者「懶得看舊 UI」→ Opus 自己對照樣板列 12 個醜點，`collab/to-codex-ui.md`（UI v1：重寫 `css/app.css`＋token 照抄＋結果卡依 tone 填色用 `:has()`＋科普用 `.article`／`.compare-wrap`（寬表第一欄 sticky）／`.refs`＋`components.js` 新增 `references(items)`；不用外部字型以保離線），**R5 做完才派**，回報 `collab/from-codex-ui.md`；驗收 `node scripts/check-ui.mjs && node scripts/gen-precache.mjs && npm.cmd test`＋Opus 跑 smoke、截 390／1280 淺深色給使用者看前後對比。順序（使用者同意）：R5 → UI → 科普。
- **科普分兩份任務書（使用者 2026-11-09 拍板）**：股票基本術語＝**獨立一頁**；分兩份派 Codex，**都要卡通圖**。
  - **科普一**（⑳ ETF 入門 `etf101`、㉑ 借錢投資的管道 `loans`、㉒ 商品與賺錢方式 `products`）：Opus 已在 `tools.js` 加 `science` 分組＋三張卡（`planned`），寫好驗收 `scripts/check-kepu.mjs`（資料檔筆數、百分比與網址必須出自 R3／R4／R5、頁面元件、PNG）、六張卡通提示 `etf101-01/02`、`loans-01/02`、`products-01/02`（→ `out/<id>-comic.png`、`<id>-map.png`），任務書 `collab/to-codex.md`（科普一 v1）待 Codex 面板做。內容放 `js/data/etf101.js`／`loans.js`／`products.js`，頁面只排版。Codex 回報後 Opus：核對圖、轉 `img/<id>/comic.webp`、`map.webp`、改 ready、跑 smoke、抽查數字與白話。
  - **科普一已上線（2026-11-09）**：Codex 一輪過（R3 37 主題不合併、R4 28 列〔比較表 14＋展開 14〕、誤解 12、待查 17、R5 商品 20〔2/9/9〕、賺錢方式 7；六張圖 products-comic 重生 1 次），Opus 未修改內容；六張圖逐字核對無誤，轉 `img/<id>/comic.webp`、`map.webp`，三張卡片 ready。Opus 重跑 check-kepu OK、tests 155、smoke 22 全過；抽查借錢表 14 列利率與非百分比數字（萬分之八、3.5%加150元、15,000 元、加 1.5 個百分點）皆與 R4 一致；CDP 390px 截圖排版正常。注意：表格文字偏專業（例「130% 以上僅暫緩」），使用者若嫌難懂，UI／文案統一修時再白話化。
  - **科普二**（㉓ 股票基本術語〔R5 術語 48 列〕、㉔ 正二教學〔含大仁 50/50 原文結果與限制〕）：科普一驗收後再寫任務書。
- **① 移除（使用者 2026-11-09：「工具箱本身就有，就連到那裡；舊版那個不同專案留著」）**：首頁拿掉 ① 卡片與捷徑；⑪ 副標加「朋友那格『正二平衡計算器』的新版」；`tools/calc-guide.html` 改成轉址（`#token` → `token.html`，其他 → `exposure.html`）；FinMind token 教學搬到 `tools/token.html`＋`js/data/token.js`（文案改成工具箱用法，不是首頁卡片），各計算機 token 欄連到這裡；刪 `js/pages/calc-guide.js`、`js/data/calcGuide.js`、`img/calc-guide/`。舊專案 `zr-calc` 不動。同時修 ⑪ 對照表 ⑬⑭ 還寫「製作中」→ 改成連結。smoke 19 頁（少了 ①）。
- **引用規則（使用者 2026-11-09）**：外部網站內容預設**完全 AI 重寫**（原文最多引一句加引號，做法出處寫「做法出自 某某」＋連結）；要照抄文字或圖必須網站同意並標「引用自」，目前無同意 → 不照抄。UI 美化時每頁底部加「參考資料」（名稱＋連結），科普頁照此格式。
- **科普範圍再追加（使用者 2026-11-09）**：④ **股票基本術語**（補辭典沒有的最基本詞：上市櫃、集保、交割、委託單、漲跌停、T+2…）；⑤ **個人（非專業投資人）可交易的股票相關商品與獲利方式圖文詳解**（股票、零股、興櫃、ETF、ETN、權證、期貨、選擇權、可轉債、債券、基金、複委託、TDR、REITs、借券出借、當沖；價差、股利、利息等）。研究 **R5** 任務書 `collab/to-codex-r5.md`（R4 做完才做，回報 `collab/from-codex-r5.md`），驗收 `node scripts/check-r5.mjs`。科普頁共五頁：ETF 入門（R3）、借錢管道（R4）、商品與獲利方式（R5）、股票基本術語（R5，併入辭典或獨立頁待定）、正二教學。
- （舊）⑥ ⑧ 改精靈（無持股，輸入少，步驟可以短）。全部 A 類做完 → ⑬⑭ → ⑯⑰⑱ → UI 統一美化（Neo-brutalism）。
  - 注意：股票事件換算（`core/events.js`）其他工具目前用不到（都用券商 App 現在的股數／成本）；之後若有工具要比歷史價格，直接用 `fetchEvents`＋`adjustBasePrice`。
- **再下一步（舊）**：⑪ 完成（Gate 7 併入）。之後「其餘 A 類改精靈」（先列清單給使用者看）。原文：⑮ 平均成本（加碼／攤平後均價），照 ⑦ 格式「core＋測試由 Opus 寫，頁面＋生圖一份任務書」。（原文：⑤ 融資融券（core 由 Opus 寫：研究 R2-06 RSI20 融資融券試算＋R2-01 證交所指南；併融券、整戶維持率；任務書照 ⑦ 格式「頁面＋生圖一份」）→ ⑲ 退休提領（使用者 2026-11-09 定：todo2 財務計算機只納入退休提領，⑦ 之後加「停扣後再滾」選項；詳見 [research/候選清單.md](research/候選清單.md) 末節）。）

**下次開工順序（Opus）**：
1. 先跟使用者確認上面「目標樣子」，用 1–2 個畫面草圖（ASCII 或 artifact）對齊，**沒對齊不寫程式**。
2. 派 luna／DeepSeek Flash 讀 77 筆資料，**先分兩類**：(a) 有計算方法 → 整理成「方法 → 需要的輸入 → 輸出 → 對應現有 core 函式或缺什麼」；(b) 純科普 → 只記可用在哪個科普頁或解說。Opus 核對後，把 (a) 交給使用者挑選與排序。
2b. **Opus 自己調研（使用者 2026-11-08 要求）：投資新手和老手實際會用到的計算機**，不限於 77 筆資料。做法：上網查台灣常見的投資計算機網站與 App、券商工具、PTT／Dcard 常被問的計算問題，整理成「計算機 → 誰會用 → 輸入 → 輸出 → 有多常被問」，和第 2 步的 (a) 合併去重後，交給使用者挑選與排序。（GPT／DeepSeek 不能上網，這一步由 Opus 用 WebSearch，或照 deep-research 流程做。）
   初步清單（Opus 憑印象列的起點，調研時要驗證、補齊）：
   - 交易基本：買賣損益與報酬率（含手續費、證交稅、ETF 稅率較低、零股、券商折扣）、加碼／攤平後的平均成本、損益兩平價、停損停利價。
   - 股息：殖利率、除權息參考價、填息、股票股利配股、二代健保補充保費、股利所得合併／分開計稅。
   - 長期：定期定額（含每月扣款日、手續費下限）、單筆 vs 定期定額、複利與年化報酬（CAGR）、存股達到目標要幾年、退休提領 4% 法則。
   - 信用交易：融資維持率與追繳價、融券、整戶維持率、當沖損益（證交稅減半）。
   - 槓桿與借貸：質押（已有 ④）、借錢投資的利息成本 vs 預期報酬、信貸／房貸增貸投資。
   - 估價：本益比、本淨比、殖利率估價法（便宜價／合理價／昂貴價）。
   - 正二相關：已有 ②③④⑥⑧⑪，以及 77 筆資料裡的變種策略。
   - 其他：ETF 折溢價、外幣／美股換匯成本、資產配置再平衡（任意比例）。
3. Opus 定精靈框架：`components.js` 新增精靈元件（步驟、上一步／下一步、進度、每步驗證）、持股輸入元件（代號＋股數＋買入價，現價自動抓），以及 FinMind 抓價與 token 儲存的模組；升框架 v5。先拿一個工具（建議 ⑪ 目標倍數或 ④ 質押）做成樣板，給使用者看過再照抄。
4. 之後才分批派 Codex 改各工具、做新工具。


- 現行版本：決策 2026-11-08（[decision/決策-2026-11-08.md](decision/決策-2026-11-08.md)）；框架 **2026-11-09 v5.11**（[FRAMEWORK.md](FRAMEWORK.md)）
- 狀態：**Gate 3a 完成**（2026-11-08，① 逐欄教程＋token 教學，Codex sol 一輪過、Opus 未修改）。PROOF_CMD 實測：tests 51 全過；smoke pages 9 全過。Gate 0–2 同日完成。
- 手機實機：使用者 2026-11-08 回報線上版可以打開。尚未確認：加到主畫面、離線開啟。
- （以下 Gate 4–7 計畫已被上方「方向修正」取代，待重排；內容與大仁數字仍可用）
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
- 驗收指令：`npm test && npm run smoke`（現行預期：tests 155 全過、smoke pages 19 全過；科普三頁 ready 後 22）。
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
