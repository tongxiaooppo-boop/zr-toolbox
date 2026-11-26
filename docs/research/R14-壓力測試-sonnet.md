# R14 三桶壓力測試要怎麼做（Sonnet 獨立版）

版本：2026-11-26 v1；查閱日 2026-11-26。本報告為 Sonnet 獨立研究，未參考另一份報告。數字標記：【一手】＝官方或原始資料（證交所、FinMind 轉載證交所、發行商頁面）；【二手】＝新聞、搜尋摘要、Yahoo 資料；【推論】＝本報告用上述資料自己算或估。跌幅算法：價格（收盤價）從區間內高點到後續低點的最大回撤，已換成新台幣，不含配息再投資、費用、稅；組合為期初一次買入、權重不再平衡。除非特別標示，本報告所有跌幅都是【推論】（資料取自 Yahoo、證交所、FRED）。

## 一、結論

- 建議起點：2008。理由：它是唯一讓成長桶跌近六成（0050 實際 -59.0%【一手轉載】）的事件，且 0050、加權指數有真實資料；比「2018 起只用真實商品」（只有 5 次、最深約 -37%）更能對照測驗第 8 題的「-30% 以上」。
- 建議布局：三種都做（A 全球／B 台＋美／C 純台股）。理由：同一個成長桶 2022 年台幣最大跌幅 A -16.3%、B -23.7%、C -36.4%，差兩倍以上【推論】，布局本身就決定結果。
- 2022 穩健桶實際：A（AOM）-9.5%、B（00713＋00719B）-7.9%、C（00713）-21.4%【推論】；若穩健桶放 00720B 為 -27.6%，與成長桶差不多，名不符實的風險要寫在結果頁。
- 代替品誤差：00631L 用 0050 每日 2 倍模擬，2022 差 9.7 點；00713 用 0056 代替差 10.2 點；00757 用 NASDAQ-100 代替差約 11 點【推論】，所以 2008 前後的積極桶只能當示意。
- 限制：2000 年三桶商品都未上市，只能列指數；2022 年台幣貶值使美元資產台幣跌幅縮小，不能解讀為「美元資產比較安全」。

## 二、別人怎麼做

| 機構／工具 | 用哪些股災 | 起點年份 | 沒上市的商品怎麼代替 | 有沒有說明誤差 | 來源 |
|---|---|---|---|---|---|
| Vanguard 顧問用 Portfolio stress testing | 2008 全球金融危機、鷹派升息循環、關稅衝擊（情境庫定期更新），另有假設衝擊【一手】 | 各事件自己的期間，起點年份待查 | 頁面未說明（待查） | 只有一般免責聲明（不保證結果），沒有代替誤差說明【一手】 | https://advisors.vanguard.com/strategies/portfolio-strategies/portfolio-analytics/stress-testing |
| Morningstar Direct 情境分析 API | 2007–2009 次貸危機、2020 COVID 恐慌，另有市場衝擊情境【一手】 | 各事件期間，確切日期頁面未列（待查） | 頁面未說明；方法論 PDF 未取得（待查） | 待查 | https://developer.morningstar.com/content/documentation/direct-web-services/scenario-analysis/overview/scenario-analysis-overview.md |
| Portfolio Visualizer | 沒有「重播某次股災」的工具；提供回撤分析（深度、長度、回復時間）與歷史報酬重抽樣【一手】 | 看資產可得的歷史 | 短歷史資產可對應追蹤指數或相似基金 backfill；資產類別序列由不同工具接起來（例：1977 前用 Kenneth French 資料）【一手】 | 頁面未見誤差說明（待查） | https://www.portfoliovisualizer.com/faq |
| Kwanti 壓力測試 | 固定情境日期，把各資產在該期間報酬合成；沒價格的資產用 proxy，並扣顧問費【二手：搜尋摘要，原頁 403】 | 待查 | 用 proxy（種類待查） | 待查 | https://support.kwanti.com/hc/en-us/articles/115000684988-Stress-test |
| PortfolioPilot | 重播 2008 與 2020；因現在的持股當時多不存在，用持股的國家與產業曝險組出 proxy【二手：搜尋摘要】 | 2008 | 國家＋產業曝險合成 | 待查 | https://portfoliopilot.com/portfolio-management/portfolio-stress-test |
| BlackRock Scenario Tester | 不是重播股災，而是各因子約 1 個標準差的假設衝擊（用 10 年歷史估波動）【一手：頁面】 | 近 10 年因子歷史 | 基金用持股或建構區塊建模，頁面稱不保證完全代表基金 | 有（免責；搜尋摘要稱附預測誤差範圍【二手】） | https://www.blackrock.com/us/financial-professionals/tools/scenarios-methodology |
| StashAway 2008 回測（新加坡理財機器人） | 2008；基準為 60% VTSMX＋40% VTBMX 與 S&P 500【二手：搜尋摘要】 | 2008 | 用當時存在的 Vanguard 指數基金當基準 | 待查 | https://www.stashaway.sg/r/stashaway-2008-backtest |
| 台灣理財機器人、投信、券商 | 搜尋找不到任何一家公布 2008 或各次股災的組合壓力測試（待查）；只有媒體以台灣 50 報酬指數對照新 ETF 的官方指數回測，並提醒回測不等於實際【二手】 | 待查 | 報酬指數；0050 上市前（2003-06-30）回測常用還原收盤價【二手】 | 媒體有「回測不等於實際」提醒 | https://www.businesstoday.com.tw/article/category/183013/post/202603120041/ |

小結【推論】：大型機構多以「2008＋2020＋近期（升息、關稅）」為情境，代替方式寫在各自方法論文件；公開頁面幾乎不給代替品誤差。學術上也提醒，只用單一歷史期間做情境，可能不是對該組合最嚴苛的期間（見 [Springer 論文](https://link.springer.com/10.1057/s41283-017-0024-x)）。所以本站要自己標出「哪格是代替品、差多少」。

## 三、三種布局的代表組合

三桶比例沿用網站：保守型 80/20/0、穩健型 50/30/20、成長型 25/50/25、積極型 25/30/45（穩健／成長／積極）。B 的穩健與成長桶各由兩檔各半組成，其餘單檔。「含息資料」指能抓到含息或還原價的免費來源（Yahoo adjclose 為【二手】、證交所加權報酬指數為【一手】）。上市日寫「首筆」＝Yahoo／FinMind 第一筆資料日，發行商成立日待查。

| 布局 | 桶 | 代表商品 | 上市日 | 含息報酬資料 | 台灣怎麼買 | 匯率風險 | 未上市年份的代替品 | 來源 |
|---|---|---|---|---|---|---|---|---|
| A 全球 | 穩健 | AOM（iShares 40/60 股債；備選 00720B） | 首筆 2008-11-11【二手】 | Yahoo adjclose【二手】；發行商 NAV 報酬待查 | 複委託／部分銀行（R13：富邦定期定額已上架） | 有：美元計價，台幣投資人承擔美元兌台幣 | 0.4×S&P500＋0.6×AGG 每日再平衡（指數合成，AGG 只到 2003-09） | https://www.ishares.com/us/products/239765/ishares-moderate-allocation-etf |
| A 全球 | 成長 | VT（Vanguard 全球股票） | 首筆 2008-06-26【二手】；成立日待查 | Yahoo adjclose【二手】；FinMind USStockPrice 有 Adj_Close【一手轉載】 | 複委託（R13：國泰有定期定額） | 有：美元計價 | ACWI（首筆 2008-03-28）；更早待查 | https://advisors.vanguard.com/investments/products/vt/vanguard-total-world-stock-etf |
| A 全球 | 積極 | 00757（統一 NYSE FANG+，台幣掛牌）；備選 QQQ | 首筆 2018-11-27【二手】 | Yahoo adjclose【二手】 | 證券戶（R13：依券商要求簽風險文件） | 有：台幣掛牌但標的是美股，匯率含在淨值內，未避險 | NASDAQ-100 指數×匯率；誤差大（見五） | https://www.twse.com.tw/zh/ETFortune/etfInfo/00757 |
| B 台＋美 | 穩健 | 00713（50%）＋00719B（50%） | 00713 首筆 2017-09-19、00719B 首筆 2018-01-19【二手】 | Yahoo adjclose【二手】 | 證券戶；00719B 在櫃買（R13） | 00719B 有（美國公債，台幣掛牌，匯率含在淨值）；00713 無 | 00713→0056；00719B→SHY×匯率 | https://www.yuantaetfs.com/product/detail/00713/Basic_information |
| B 台＋美 | 成長 | 0050（50%）＋00646（50%） | 0050：2003-06-30【二手：媒體】；00646 首筆 2015-12-02【二手】 | Yahoo adjclose【二手】；0050 另有 FinMind 原始價【一手轉載】 | 證券戶 | 0050 無；00646 有（S&P500 美元資產，台幣掛牌） | 00646→S&P500 指數×匯率；0050 在 2008 年有實際資料 | https://www.yuantaetfs.com/product/detail/00646/Basic_information |
| B 台＋美 | 積極 | 00631L（元大台灣50正2） | 2014-10-31【一手：R8 引發行商頁】 | Yahoo adjclose【二手】；配息很少 | 證券戶（須符合槓桿 ETF 條件，R13） | 無 | 加權／0050 每日 2 倍模擬（模型，未含資金成本） | https://www.yuantaetfs.com/product/detail/00631L/Basic_information |
| C 純台股 | 穩健 | 00713（元大台灣高股息低波動）；備選 2412、00878 | 首筆 2017-09-19【二手】 | Yahoo adjclose【二手】 | 證券戶 | 無 | 0056（高股息，不同指數）；更早待查 | https://www.yuantaetfs.com/product/detail/00713/Basic_information |
| C 純台股 | 成長 | 0050（元大台灣50） | 2003-06-30 | FinMind 原始價（2003 起）【一手轉載】；證交所加權報酬指數 2003-01 起【一手】 | 證券戶 | 無 | 加權指數（2003 前） | https://www.yuantaetfs.com/product/detail/0050/Basic_information |
| C 純台股 | 積極 | 00631L | 2014-10-31【一手】 | 同上（配息很少） | 證券戶（須符合條件） | 無 | 加權／0050 每日 2 倍模擬 | https://www.yuantaetfs.com/product/detail/00631L/Basic_information |

## 四、每次股災的跌幅

窗口＝R8 台、美兩段區間的聯集；每格是該桶在窗口內「期初買入、不再平衡」的最大回撤，單位 %，已換成新台幣【推論】。「未上市；代替品」＝該桶有商品在窗口起點尚未上市，數字用代替品算（誤差見五）。「窗口起點延至」＝代替品也沒更早的資料，起點被迫延後，跌幅可能偏小。

表 4-1：三桶單獨的最大回撤（價格，不含息）

| 事件 | 窗口 | A 穩 | A 成 | A 積 | B 穩 | B 成 | B 積 | C 穩 | C 成 | C 積 | 來源 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2000 網路泡沫 | 2000-02-17→2002-10-09 | 待查（AOM／AGG 資料不涵蓋） | 未上市；VT 無代替資料，參考 S&P500 台幣 -44.1（指數） | 未上市；無代替資料（待查） | 待查（00713／SHY 資料不涵蓋） | 未上市；加權＋S&P500 指數各半 -50.3（指數合成） | 未上市；加權指數每日 2 倍模擬 -90.6（模型） | 待查（無高股息指數序列） | 未上市；加權指數 -66.2（指數） | 未上市；加權指數每日 2 倍模擬 -90.6（模型） | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2008 金融海嘯 | 2007-10-09→2009-03-09 | 未上市；代替品 -24.9 | 未上市；代替品 -49.6（窗口起點延至 2008-03-28） | 未上市；代替品 -52.2 | 未上市；代替品 -23.1（窗口起點延至 2008-01-02） | 未上市（00646）；0050 實際＋S&P500 指數代替 約 -54.1 | 未上市；代替品 -85.9 | 未上市；代替品 -53.5（窗口起點延至 2008-01-02） | -59.0（0050 實際，價格） | 未上市；代替品 -85.9 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2011 歐債危機 | 2011-01-28→2011-12-19 | -7.5 | -18.9 | 未上市；代替品 -16.2 | 未上市；代替品 -10.7 | 未上市；代替品 -17.2 | 未上市；代替品 -47.2 | 未上市；代替品 -26.8 | -25.8 | 未上市；代替品 -47.2 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2015 中國股災 | 2015-04-27→2015-08-25 | -4.2 | -9.6 | 未上市；代替品 -11.7 | 未上市；代替品 -8.0 | 未上市；代替品 -11.8 | -41.7（00631L 實際，R8） | 未上市；代替品 -22.9 | -21.0 | -41.7（00631L 實際，R8） | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2018 貿易戰 | 2018-01-23→2018-12-26 | -7.4 | -18.9 | 未上市；代替品 -29.6 | -7.5 | -17.0 | -27.3 | -15.7 | -16.7 | -27.3 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2020 新冠 | 2020-01-14→2020-03-23 | -16.9 | -33.9 | -38.5 | -11.7 | -30.0 | -52.1 | -25.8 | -30.5 | -52.1 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2022 升息通膨 | 2022-01-03→2022-10-25 | -9.5 | -16.3 | -33.7 | -7.9 | -23.7 | -51.3 | -21.4 | -36.4 | -51.3 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2024-08 日圓套利平倉 | 2024-07-11→2024-08-05 | -1.8 | -7.8 | -19.0 | -4.2 | -14.3 | -37.2 | -8.5 | -21.7 | -37.2 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2025-04 美國關稅 | 2025-02-19→2025-04-09 | -6.2 | -16.0 | -29.1 | -7.8 | -22.7 | -49.5 | -16.1 | -26.1 | -49.5 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |

表 4-1 補充：R8 的指數對照（沿用，【一手】證交所＋S&P）：加權指數跌幅 2000 -66.2、2008 -58.3、2011 -27.5、2015 -25.7、2018 -15.8、2020 -28.7、2022 -31.6、2024-08 -18.7、2025-04 -26.7；S&P 500 美元 -49.1、-56.8、-19.4、-12.4、-19.8、-33.9、-25.4、-8.5、-18.9。換成台幣後的 S&P 500（【推論】）：2000 -44.1、2008 -53.8、2011 -17.8、2015 -10.9、2018 -19.8、2020 -33.5、2022 -18.1、2024-08 -8.2、2025-04 -18.2；2022 年台幣貶值使美元資產台幣跌幅少約 7 點。

表 4-2：依投資屬性的整個組合最大回撤（價格，期初權重，%；†＝含未上市商品改用代替品；‡＝窗口起點延後）

| 事件 | 保守 80/20/0 A／B／C | 穩健 50/30/20 A／B／C | 成長 25/50/25 A／B／C | 積極 25/30/45 A／B／C | 來源 |
|---|---|---|---|---|---|
| 2000 網路泡沫 | 待查／待查／待查 | 待查／待查／待查 | 待查／待查／待查 | 待查／待查／待查 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2008 金融海嘯 | -23.1†‡／-28.1†‡／-53.9†‡ | -30.9†‡／-44.2†‡／-60.3†‡ | -39.2†‡／-52.5†‡／-62.3†‡ | -38.2†‡／-59.5†‡／-67.7†‡ | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2011 歐債危機 | -9.8／-11.4†／-26.1† | -12.3†／-19.0†／-30.1† | -14.8†／-21.8†／-31.2† | -14.0†／-28.2†／-35.5† | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2015 中國股災 | -5.3／-8.7†／-21.8† | -7.4†／-14.3†／-24.5† | -8.8†／-17.0†／-25.3† | -9.3†／-22.3†／-28.7† | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2018 貿易戰 | -9.6／-9.3／-15.7 | -15.2†／-14.1／-18.0 | -18.5†／-17.1／-18.7 | -20.4†／-19.2／-21.0 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2020 新冠 | -19.9／-15.2／-26.6 | -25.5／-24.9／-32.1 | -29.9／-30.5／-34.5 | -30.9／-35.0／-38.9 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2022 升息通膨 | -10.7／-9.8／-22.5 | -15.7／-19.5／-30.0 | -18.4／-25.5／-35.5 | -21.6／-31.0／-38.5 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2024-08 日圓套利平倉 | -3.0／-6.0／-10.8 | -6.5／-13.7／-18.0 | -8.4／-17.5／-22.2 | -10.7／-22.0／-25.3 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2025-04 美國關稅 | -8.1／-10.2／-17.9 | -13.0／-20.3／-25.7 | -16.1／-25.6／-29.4 | -18.9／-31.0／-34.1 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |

表 4-3：穩健型與成長型「回到原點」要多久（從組合高點到價格首次回到同一點，單位月；不含配息、不再平衡）。格式「最大跌幅／月數」，「未回」＝資料到 2026-11 仍未回。

| 事件 | 穩健型 A；B；C | 成長型 A；B；C | 來源 |
|---|---|---|---|
| 2008 金融海嘯 | -30.9／45†‡；-44.2／81†‡；-60.3／109†‡ | -39.2／46†‡；-52.5／75†‡；-62.3／105†‡ | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2011 歐債危機 | -12.3／11†；-19.0／37†；-30.1／41† | -14.8／12†；-21.8／27†；-31.2／41† | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2015 中國股災 | -7.4／4†；-14.3／15†；-24.5／16† | -8.8／12†；-17.0／15†；-25.3／16† | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2018 貿易戰 | -15.2／12†；-14.1／10；-18.0／12 | -18.5／15†；-17.1／10；-18.7／13 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2020 新冠 | -25.5／5；-24.9／6；-32.1／6 | -29.9／5；-30.5／6；-34.5／6 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2022 升息通膨 | -15.7／17；-19.5／17；-30.0／22 | -18.4／17；-25.5／23；-35.5／25 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2024-08 日圓套利平倉 | -6.5／3；-13.7／14；-18.0／14 | -8.4／3；-17.5／14；-22.2／14 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |
| 2025-04 美國關稅 | -13.0／6；-20.3／7；-25.7／7 | -16.1／6；-25.6／6；-29.4／5 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 ；https://fred.stlouisfed.org/series/DEXTAUS ；https://finance.yahoo.com/quote/0050.TW/history/ |

表 4-4：價格 vs 含息（Yahoo adjclose）對跌幅的影響，單位 %，格式「價格→含息」【推論】

| 事件 | A 成 | B 成 | C 成 | C 穩 | B 穩 | 來源 |
|---|---|---|---|---|---|---|
| 2018 貿易戰 | -18.9→-17.9 | -17.0→-17.0 | -16.7→-16.0 | -15.7→-13.2 | -7.5→-6.5 | https://finance.yahoo.com/quote/0050.TW/history/ |
| 2020 新冠 | -33.9→-33.6 | -30.0→-29.1 | -30.5→-28.2 | -25.8→-25.8 | -11.7→-11.5 | https://finance.yahoo.com/quote/0050.TW/history/ |
| 2022 升息通膨 | -16.3→-16.1 | -23.7→-22.3 | -36.4→-33.8 | -21.4→-18.4 | -7.9→-6.7 | https://finance.yahoo.com/quote/0050.TW/history/ |
| 2025-04 美國關稅 | -16.0→-15.7 | -22.7→-22.7 | -26.1→-26.1 | -16.1→-13.9 | -7.8→-6.9 | https://finance.yahoo.com/quote/0050.TW/history/ |

表 4-5：2022 年各「穩健」商品實際跌多少（台幣；R8 窗口 2022-01-03→10-25 與全年）【推論】

| 商品 | 美元計價跌幅 | 台幣跌幅（R8 窗口） | 台幣跌幅（全年） | 說明 | 來源 |
|---|---|---|---|---|---|
| AOM（40/60 股債） | -20.6 | -9.5 | -9.5 | 股債同跌，但台幣從 27.6 貶到 32.3，吃掉大半美元跌幅 | https://finance.yahoo.com/quote/AOM/history/ |
| AOR（60/40） | 待查 | -11.4 | -11.4 | 同上 | https://finance.yahoo.com/quote/AOR/history/ |
| SHY（1–3 年美債） | -5.6 | -2.6 | -5.5 | 全年跌幅在 11–12 月才擴大（台幣回升） | https://finance.yahoo.com/quote/SHY/history/ |
| 00719B（1–3 年美債，台幣掛牌） | 不適用 | -2.6 | -5.2 | 全年數字與 R13 的 -5.2 一致 | https://finance.yahoo.com/quote/00719B.TWO/history/ |
| 00720B（20 年以上 BBB 公司債） | 不適用 | -27.6 | -27.6 | 與 R13 一致；長天期債與股一起跌，幾乎跟股票一樣深 | https://finance.yahoo.com/quote/00720B.TWO/history/ |
| 00679B（20 年以上美債） | 不適用 | -27.2 | -27.5 | 長天期美債 | https://finance.yahoo.com/quote/00679B.TWO/history/ |
| 00713（台股高股息低波動） | 不適用 | -21.4 | -21.4 | 比 0050 少跌 15 點，但絕對值仍超過兩成；與 R13 一致 | https://finance.yahoo.com/quote/00713.TW/history/ |
| 對照：0050／VT／00646／00631L | 不適用 | -36.4／-16.3／-17.2／-51.3 | 同左 | 成長桶與正2 | https://finance.yahoo.com/quote/0050.TW/history/ |

表 4-6：2022 年各布局穩健桶與整個組合【推論】

| 布局 | 穩健桶 | 穩健型 50/30/20 組合 | 成長型 25/50/25 組合 | 回到原點（穩健型，月） | 來源 |
|---|---|---|---|---|---|
| A | -9.5 | -15.7 | -18.4 | 17 | https://finance.yahoo.com/quote/0050.TW/history/ |
| B | -7.9 | -19.5 | -25.5 | 17 | https://finance.yahoo.com/quote/0050.TW/history/ |
| C | -21.4 | -30.0 | -35.5 | 22 | https://finance.yahoo.com/quote/0050.TW/history/ |

讀法【推論】：2022 年 C 布局穩健型組合 -30.0%，已逼近 0050 本身的 -36.4%；A 布局只有 -15.7%（含台幣貶值緩衝）。Vanguard 文章列出 60/40 組合 2022 年美元跌幅：美國型 -16.1%、全球型 -15.7%【二手：搜尋摘要】，與 AOR／AOM 的美元跌幅同量級。

## 五、起點年份比較

| 起點選項 | 涵蓋幾次股災 | 哪些桶要用代替品 | 代替誤差大約多少 | 缺點 | 來源 |
|---|---|---|---|---|---|
| 2000 起（全指數） | 9 次（2000、2008、2011、2015、2018、2020、2022、2024-08、2025-04） | 三桶全部（沒有任何一檔 ETF 在 2000 存在） | 無法估（沒有同期真實商品可對照）；台幣換算可用 FRED 1983 起匯率 | 只剩指數，A 的穩健、成長無資料；結果像教科書，不像使用者能買的商品 | https://fred.stlouisfed.org/series/DEXTAUS |
| 2008 起（真實＋代替） | 8 次（含 2008，不含 2000） | A：AOM、VT、00757 需代替；B：00646、00719B、00713、00631L 需代替；C：00713、00631L 需代替；0050 有實際資料（2008 -59.0%） | 0050 對加權約 0.7 點（2008）、4.8 點（2022）；00713 對 0056 約 10 點；00631L 模擬對實際約 3.6–9.7 點；00757 對 NASDAQ-100 約 11 點【推論】 | 2008 的穩健、積極桶大多是代替品；A 的 VT 起點被迫延到 2008-03，跌幅偏小 | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=0050&start_date=2007-10-09&end_date=2009-03-09 |
| 2015 起 | 6 次（2015、2018、2020、2022、2024-08、2025-04） | 2015 年 00646、00719B、00713 未上市（2015-12 以後才有）；2018 起只剩 00757 | 同上，少了 2008 的大誤差 | 沒有任何一次「跌近六成」的情境，成長桶最差約 -36%，容易低估 | https://finance.yahoo.com/quote/00646.TW/history/ |
| 2018 起（只用真實商品） | 5 次（2018、2020、2022、2024-08、2025-04） | 只有 A 的 00757（2018-11 才上市）需代替；其餘桶都是真實商品 | 幾乎無（00719B 對 SHY 差 0.9 點） | 最深只到 -37%（C 成長 2022）與 -52%（正2），缺少 2008 那種慢速、大幅、久久回不來的情境 | https://finance.yahoo.com/quote/00719B.TWO/history/ |

表 5-2：代替品 vs 實際商品的差距（同一窗口、同一算法，單位 %；格式「實際｜代替品」）【推論】

| 商品與代替品 | 2018 | 2020 | 2022 | 2024-08 | 2025-04 | 最大差距（點） | 來源 |
|---|---|---|---|---|---|---|---|
| 00631L 與 0050 每日 2 倍模擬 | -27.3｜-32.5 | -52.1｜-52.5 | -51.3｜-61.0 | -37.2｜-39.8 | -49.5｜-46.6 | 9.7（2015：-41.7｜-38.1） | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=00631L&start_date=2015-04-20&end_date=2015-08-26 |
| 00713 與 0056 | -15.7｜-16.0 | -25.8｜-25.1 | -21.4｜-31.6 | -8.5｜-17.7 | -16.1｜-22.6 | 10.2 | https://finance.yahoo.com/quote/0056.TW/history/ |
| 00646 與 S&P500 指數×匯率 | -18.5｜-19.8 | -34.3｜-33.5 | -17.2｜-18.1 | -7.4｜-8.2 | -19.5｜-18.2 | 1.3 | https://finance.yahoo.com/quote/00646.TW/history/ |
| 00719B 與 SHY×匯率 | -1.7｜-1.7 | -1.3｜-1.4 | -2.6｜-2.6 | -1.2｜-0.3 | -1.0｜-1.3 | 0.9 | https://finance.yahoo.com/quote/00719B.TWO/history/ |
| 00757 與 NASDAQ-100 指數×匯率 | 未上市 | -38.5｜-27.6 | -33.7｜-27.3 | -19.0｜-12.0 | -29.1｜-22.3 | 10.9 | https://finance.yahoo.com/quote/00757.TW/history/ |
| AOM 與 0.4×S&P500＋0.6×AGG | -7.4｜-8.3 | -16.9｜-15.7 | -9.5｜-10.1 | -1.8｜-2.1 | -6.2｜-7.3 | 1.2 | https://finance.yahoo.com/quote/AOM/history/ |
| 0050 與加權指數 | -16.7｜-15.8 | -30.5｜-28.7 | -36.4｜-31.6 | -21.7｜-18.7 | -26.1｜-26.7 | 4.8（2008：-59.0｜-58.3） | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=0050&start_date=2007-10-09&end_date=2009-03-09 |

另：證交所加權「報酬指數」（含息）與價格指數的差距：2008 -56.0 對 -58.3、2011 -24.5 對 -27.5、2015 -23.2 對 -25.7、2018 -14.5 對 -15.8、2020 -28.6 對 -28.7、2022 -28.5 對 -31.6【一手：證交所 MFI94U 逐月資料；比較為推論】，含息讓跌幅少 0.1–3 點，所以不含息的結果略偏悲觀。

建議【推論】：以 2008 為起點，每格標示「實際／代替品」；同時把「2018 起只用真實商品」當對照（結果頁可寫「近期真實商品最深約 -37%，2008 年用代替品估到 -59%」）。積極桶（正2、00757）在 2008 前後只提供示意，不放進主要數字。

## 六、資料來源

以下為 2026-11-26 用 node fetch 實測（未登入）的結果。

| 來源 | 涵蓋 | 起始年份 | 要不要 token | 條款或限制 | 網址 |
|---|---|---|---|---|---|
| FinMind TaiwanStockPrice | 台股／ETF 日線（原始收盤價，不含還原）【一手轉載證交所】 | 實測 0050 自 2003-06-30、00631L 自 2014-10-31 | 實測不帶 token 可用；每小時次數上限待查 | 官網註明資料來自證交所並須遵守其交易資訊管理規則；使用條款與商業使用待查 | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=0050&start_date=2008-01-01&end_date=2008-01-10 |
| FinMind TaiwanStockPriceAdj（還原價） | 還原股價 | 待查 | 實測回 400：需升級會員（付費） | 不可用於免費流程 | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPriceAdj&data_id=0050&start_date=2008-01-01&end_date=2008-01-10 |
| FinMind TaiwanStockTotalReturnIndex | 加權報酬指數 | 實測 2008 有、2000 空（證交所自 2003 起） | 實測不帶 token 可用 | 同上 | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockTotalReturnIndex&data_id=TAIEX&start_date=2008-01-01&end_date=2008-01-10 |
| FinMind USStockPrice／TaiwanExchangeRate／TaiwanStockDividend | 美股價（含 Adj_Close）、銀行牌告美元匯率、配息 | 實測 VT 自 2008-06-26；匯率與配息 2008 起實測 | 實測不帶 token 可用 | 同上 | https://api.finmindtrade.com/api/v4/data?dataset=USStockPrice&data_id=VT&start_date=2008-06-01&end_date=2008-07-10 |
| 證交所 加權股價報酬指數 MFI94U | 官方含息加權報酬指數，按月查詢 | 2003-01（查 2000 年回「查詢日期小於 92 年 1 月」）【一手】 | 不用 | 政府公開資料；授權細節待查；連續抓取請放慢（本次每月間隔 0.6 秒） | https://www.twse.com.tw/indicesReport/MFI94U?response=json&date=20080101 |
| 證交所 加權價格指數 MI_5MINS_HIST | 加權指數日線（R8 使用） | R8 已核對 2000 年資料可用 | 不用 | 同上 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20080101 |
| Yahoo Finance chart 端點 | 台股、美股、ETF、指數日線，含 adjclose（含息還原）【二手】 | ^TWII、^GSPC 自 2000；0050 在 Yahoo 自 2009（2003 起已上市）；TWD=X 自 2004 | 不用 token | 非官方 API，條款是否允許程式抓取待查；資料瑕疵：0050 在 2014-01-02 有約 4 倍跳動、00631L 在 2015-01-05 與 2015-08-24 有拆分跳動、TWD=X 有單日異常值，必須清洗 | https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d |
| FRED DEXTAUS（美聯準 H.10 台幣兌美元日匯率） | 台幣／美元日匯率 | 1983-10-03（CSV 實測首列）【一手】 | CSV 下載實測不用 key；API 要 key | 頁面標示有版權，需引用 Board of Governors 並註明由 FRED 取得；FRED 條款禁止轉售、爬取式資料探勘與訓練 AI | https://fred.stlouisfed.org/series/DEXTAUS |
| Stooq | 美股 ETF 日線 | 待查 | 待查 | 實測 stooq.com 對程式抓取回 403 Access denied，本次不可用 | https://stooq.com/q/d/l/?s=vt.us&i=d |

## 七、待查與不確定

| 項目 | 狀況 | 影響 | 來源 |
|---|---|---|---|
| 2000 年三桶 | ETF 都未上市；只有指數，且 A 穩健、A 成長無代替資料 | 表 4-1 的 2000 列多為待查或指數 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20080101 |
| 台灣理財機器人與投信的壓力測試做法 | 搜尋找不到任何公開案例（只找到媒體概念文章） | 二之「台灣」列只能寫待查，需向業者或金管會公開說明查證 | https://smart.businessweekly.com.tw/Reading/WebArticle.aspx?id=7006264 |
| Vanguard、Morningstar 對沒歷史商品的代替方式 | 公開頁面沒寫；方法論 PDF 本次未取得 | 無法用大型機構做法為誤差大小背書 | https://developer.morningstar.com/content/documentation/direct-web-services/scenario-analysis/overview/scenario-analysis-overview.md |
| 窗口是 R8 台、美聯集，不是各商品自己的高低點 | 組合為聯集窗口內期初買入，與逐桶各自最差區間不同 | 組合跌幅可能比各桶單獨跌幅的加權平均小 | https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701 |
| 價格不含息；含息只有 2018 以後商品完整 | 表 4-4 用 Yahoo adjclose 估；2008 的 0050 含息待查 | 不含息略偏悲觀 0.1–3 點；回到原點月數也偏長 | https://finance.yahoo.com/quote/0050.TW/history/ |
| 組合為期初權重、不再平衡、沒有定期定額 | 真實使用者會再平衡或定期投入 | 回復時間可能比表 4-3 短 | https://finance.yahoo.com/quote/0050.TW/history/ |
| 2008 的 A 組合起點被迫延到 2008-03-28 | VT 與其代替品 ACWI 都沒有 2007-10 的資料 | A 在 2008 的跌幅偏小 | https://finance.yahoo.com/quote/ACWI/history/ |
| 00631L 模擬沒有資金成本、期貨轉倉、追蹤誤差 | 2022 模擬 -61.0 對實際 -51.3 | 積極桶在 2008 與 2000 的數字只能當示意 | https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=00631L&start_date=2015-04-20&end_date=2015-08-26 |
| 匯率來源 | 用 FRED 的美聯準日匯率（中價），不是銀行牌告賣價；實際換匯成本待查 | 差異預期小但未驗證 | https://fred.stlouisfed.org/series/DEXTAUS |
| 各商品發行成立日（VT、AOM、00646、00713、00719B、00757） | 只確定 Yahoo／FinMind 首筆交易日，發行商成立日待查 | 起點判斷最多差幾天 | https://www.ishares.com/us/products/239765/ishares-moderate-allocation-etf |
| 2022 全年與 R8 窗口差異 | 00719B／SHY 全年跌幅（-5.2／-5.5）比 R8 窗口（-2.6）深，因 11–12 月台幣回升 | 本報告用 R8 窗口，R13 用全年，兩者不可直接比較 | https://finance.yahoo.com/quote/00719B.TWO/history/ |
| 需要使用者決定 | 結果頁要不要顯示「代替品」標記；積極桶 2008 示意數字是否顯示；起點用 2008 還是 2018 | 影響結果頁文案 | https://www.businesstoday.com.tw/article/category/183013/post/202603120041/ |

## 參考資料

- Vanguard 顧問用 Portfolio stress testing：https://advisors.vanguard.com/strategies/portfolio-strategies/portfolio-analytics/stress-testing
- Morningstar 情境分析 API 概覽：https://developer.morningstar.com/content/documentation/direct-web-services/scenario-analysis/overview/scenario-analysis-overview.md
- Morningstar 組合壓力測試文章：https://www.morningstar.com/business/insights/blog/portfolio-stress-testing
- Portfolio Visualizer FAQ：https://www.portfoliovisualizer.com/faq
- Kwanti Stress test：https://support.kwanti.com/hc/en-us/articles/115000684988-Stress-test
- PortfolioPilot Portfolio stress test：https://portfoliopilot.com/portfolio-management/portfolio-stress-test
- BlackRock Scenario Analysis Methodology：https://www.blackrock.com/us/financial-professionals/tools/scenarios-methodology
- StashAway 2008 Backtest：https://www.stashaway.sg/r/stashaway-2008-backtest
- WisdomTree Stress Test Methodology：https://dpdwl.wisdomtree.com/advisor-solutions/digital-portfolio-developer/stress-test-methodology
- Springer 多重歷史期間壓力測試論文：https://link.springer.com/10.1057/s41283-017-0024-x
- Vanguard 60/40 文章（2022 跌幅）：https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/like-phoenix-6040-portfolio-will-rise-again.html
- Business Today：新 ETF 回測 vs 台灣 50 報酬指數：https://www.businesstoday.com.tw/article/category/183013/post/202603120041/
- Smart 智富：理財機器人背景：https://smart.businessweekly.com.tw/Reading/WebArticle.aspx?id=7006264
- FinMind 首頁：https://finmindtrade.com/
- FinMind API 範例（0050 日線）：https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=0050&start_date=2008-01-01&end_date=2008-01-10
- 證交所 加權報酬指數 MFI94U：https://www.twse.com.tw/indicesReport/MFI94U?response=json&date=20080101
- 證交所 加權指數 MI_5MINS_HIST：https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?response=json&date=20200701
- FRED DEXTAUS：https://fred.stlouisfed.org/series/DEXTAUS
- FRED 使用條款：https://fred.stlouisfed.org/legal/
- Yahoo chart API（0050）：https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d
- 元大 0050：https://www.yuantaetfs.com/product/detail/0050/Basic_information
- 元大 00631L：https://www.yuantaetfs.com/product/detail/00631L/Basic_information
- iShares AOM：https://www.ishares.com/us/products/239765/ishares-moderate-allocation-etf
- Vanguard VT：https://advisors.vanguard.com/investments/products/vt/vanguard-total-world-stock-etf
