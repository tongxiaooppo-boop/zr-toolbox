# R14：三桶壓力測試研究（sol）

查閱日：【一手：本次作業】2026-11-26。只沿用指定的 R8 股災表、R13 商品查證及 R11 第四節，未讀另一位研究者的報告。本文是研究用歷史重播，不修改網站分類或配置。

標示規則：【一手】為官方或原始資料；【二手】含 Yahoo 行情轉載與搜尋摘要；【推論】為本次計算或設計建議。表格欄內標示適用該格全部數字；列首標示適用該列全部日期／數值。商品代碼、API 版本、章節編號是識別字。所有報酬均為名目報酬，正號表示上漲，不能稱為「跌幅」。

## 一、結論

建議起點：2020【推論】，作為三種布局全部使用真實商品的共同展示起點；更早情境另列「未上市／替代模型」。
建議布局：三種都做【推論】，以 B「台＋美」為預設、A 與 C 供比較；相同桶比例的實際風險差異很大。
完整共同商品樣本只涵蓋 4 次指定事件【推論】；金融海嘯必須保留為缺資料的補充情境，不能讓共同起點變成風險上限。
採台幣含息日淨值、固定股災區間、買入持有；同時顯示端點損失、區間最深損失及回原點日，取代 R11 現金桶與正二公式估計【推論】。

## 二、別人怎麼做

以下各機構沒有共同規定的回測起點；只有明列的方法可沿用，不能推定「業界都從金融海嘯開始」。官方方法說明不等於免費取得其整套資料或工具。

| 對象 | 情境／起點 | 商品未上市怎麼處理 | 替代誤差與本站可借用處 | 來源網址 |
|---|---|---|---|---|
| Vanguard 資產配置教育 | 【一手】歷史配置序列自 1928 年起，展示年度報酬範圍；不是逐次股災最大回撤 | 【一手】美股跨 S&P 90、S&P 500、Wilshire、MSCI、CRSP 等序列拼接；國際股債亦換指數 | 指數不等於實際投資人報酬；時期的地域配置也不同，不能把古老配置當成今日 ETF。未見統一誤差百分比 | https://investor.vanguard.com/investor-resources-education/education/model-portfolio-allocation |
| Portfolio Visualizer | 【一手】資產類別月報酬部分可追溯 1972 年；基金回測受標的資料限制；非免費功能承諾 | 【一手】公開列出資產類別的基金、研究資料或合成指數拼接方式，可匯入自訂序列 | 可學其逐段揭露資料來源；月資料可能漏掉月中急跌，不能代替本站日線；未公布適用所有替代品的固定誤差 | https://www.portfoliovisualizer.com/faq |
| BlackRock Aladdin Wealth | 【一手】信用危機範例窗口為 2007-07-01～2008-08-01；並非完整金融海嘯 | 用目前持倉的風險暴露模擬歷史衝擊，與直接播放當年基金績效是不同問題 | 對目前持倉較有解釋力，但依賴因子與相關性模型；不把該頁範例當作歷史商品真實報酬，也不移植其數字到本站 | https://www.blackrock.com/aladdin/platforms/solutions/aladdin-wealth/insights/historical-returns |
| Morningstar Scenario Metrics | 【二手：官方搜尋摘要】預設有債券拋售、油價上漲、次貸危機、油價下跌等情境，可看報酬與最大回撤 | 頁面全文存取失敗；新基金歷史延伸方式與序列起始年均待查 | 不能因摘要有情境功能，就推定它用某個指數補歷史或已量化替代誤差 | https://advisor.morningstar.com/scenariometrics.htm |
| Finance Toolkit 作者文件 | 【一手】列網路泡沫、金融海嘯、歐債、2015–2016、2018 年末、疫情、2022 升息；以標普高低點設定共同日期 | 各情境另外抓價格，輸出 coverage；沒有因此承諾能補上市前行情；缺資料處理細節待查 | 借用「共同起訖日＋買入持有＋覆蓋率」；文件以外部資料金鑰示範，未將它當成本站免費供應商 | https://www.jeroenbouma.com/projects/financetoolkit/docs/portfolio-optimization/stress-test |

【推論】本站應採「當年實際商品怎麼走」為主，把今日持倉因子重估另作模型情境。金融海嘯、股債同跌與快速修正都要保留；商品不在場就顯示缺資料，不能悄悄改用今日成分股回填。

## 三、三種布局的代表組合

【推論】下表是可重現的代表案例，不聲稱代表同桶所有商品。桶內比例固定於每次情境起點；B 的穩健與成長各採等額雙標的。A 指全球分散核心搭配美國集中主題衛星，並非每一桶都按全球市值分散；C 指資產為台灣股票，企業營收仍可能有海外與匯率暴露。桶內與桶間均不定期再平衡，ETF 自身換股則已反映於其歷史價格。

| 布局／桶 | 代表組合與桶內比例 | 上市日，與成立日區別 | 含息日報酬資料 | 台灣購買方式 | 匯率風險 | 來源網址 |
|---|---|---|---|---|---|---|
| A／穩健 | 【推論】AOM 全桶；全球股票與債券配置 | 【二手】可取得市場序列始於 2008-11-11；正式上市公告待查；【一手】成立為 2008-11-04 | 有 Yahoo adjclose 及配息事件；發行商亦有績效與配息，但兩者非同一日線接口 | 沿用 R13 已核實的富邦複委託上架；個別通路依清單 | 美元報價需乘美元兌台幣；底層另有跨國曝險 | https://www.ishares.com/us/products/239765/ishares-moderate-allocation-etf；https://fbdca.fbs.com.tw/RspNewWeb/USStock/FAQ_US |
| A／成長 | 【推論】VT 全桶；全球股票核心 | 【一手】交易對照日 2008-06-26（DTCC）；【一手】成立 2008-06-24 | 有 Yahoo adjclose 與配息；Vanguard 公開含息績效，日線另取 | 沿用 R13 國泰證券複委託管道，依標的清單 | 美元報價需換台幣；報價幣別不等於只承擔美元經濟曝險 | https://www.dtcc.com/-/media/Files/pdf/2008/6/26/OTC123.pdf；https://advisors.vanguard.com/investments/products/vt/vanguard-total-world-stock-etf；https://istockapp.cathaysec.com.tw/Marketing/DCASB/ |
| A／積極 | 【推論】00757 全桶；FANG+ 集中主題 | 【一手】2018-12-06；不是 Yahoo 序列中的成立日起算 | 有 adjclose；本次事件未見配息，證交所頁亦顯示尚無配息資料；不假設永遠不配息 | 台股證券戶；特殊風險預告依券商規定 | 台幣報價已反映海外資產與匯率，不再額外乘匯率 | https://isin.twse.com.tw/isin/class_main.jsp；https://www.twse.com.tw/zh/ETFortune/etfInfo/00757 |
| B／穩健 | 【推論】00719B／00713 各 50% | 【一手】00719B 為 2018-02-01；00713 為 2017-09-27 | 均有 adjclose 與配息；官方淨值不是自動含息淨值，要併配息重建 | 櫃買與證交所掛牌，台股證券戶 | 短債仍有美元匯率風險；兩者台幣價格均不重複換匯 | https://www.yuantaetfs.com/product/detail/00719B/Basic_information；https://www.yuantaetfs.com/product/detail/00713/Basic_information |
| B／成長 | 【推論】0050／00646 各 50% | 【一手】0050 為 2003-06-30；00646 為 2015-12-14 | 有 adjclose；配息能力與實際發放不同，需核對事件；0050 跨分割必須調整 | 台股證券戶 | 00646 的美國資產匯率已在台幣價格內 | https://www.yuantaetfs.com/product/detail/0050/Basic_information；https://www.yuantaetfs.com/product/detail/00646/Basic_information |
| B／積極 | 【推論】00631L 全桶；台股槓桿衛星 | 【一手：沿用 R8】2014-10-31 | 有分割調整日價；未見配息時價格報酬可作含息代理；早期資料衝突見後文 | 台股證券戶，須符合槓桿 ETF 適格條件 | 無額外美元換匯；台灣企業仍有經濟曝險 | https://www.yuantaetfs.com/product/detail/00631L/Basic_information |
| C／穩健 | 【推論】00713 全桶；低波動高股息 | 【一手】2017-09-27 | 有 adjclose 與配息；價格回撤與含息回撤分開 | 台股證券戶 | 無額外美元換匯；仍是股票投資 | https://www.yuantaetfs.com/product/detail/00713/Basic_information |
| C／成長 | 【推論】0050 全桶 | 【一手】2003-06-30 | 有 adjclose 與配息；本次 Yahoo 早期覆蓋不足，不等於當時未上市 | 台股證券戶 | 無額外美元換匯；海外營收不等於匯率無關 | https://www.yuantaetfs.com/product/detail/0050/Basic_information |
| C／積極 | 【推論】00631L 全桶 | 【一手：沿用 R8】2014-10-31 | 有分割調整日價；不得把一般指數累計跌幅直接乘倍數 | 台股證券戶，須符合槓桿 ETF 適格條件 | 無額外美元換匯；槓桿與每日重設風險另外存在 | https://www.yuantaetfs.com/product/detail/00631L/Basic_information |

【推論】選 AOM 是為了保留跨資產「穩健」的真實風險；B 選短債與低波股搭配；C 穩健仍全是股票。未把三種穩健桶強行視為同風險，也未拿現金取代。00720B、00878、定存股等可另作敏感度案例，不將本次結果套用到它們。

## 四、每次股災的跌幅

### 固定口徑

【推論】主要比較統一使用 R8 的「台股」高點日到低點日，因此三種布局在同一個曆日窗口估值；美國掛牌標的採各自同曆日收盤，不是台北收盤當下可成交的同步價格。另列 R8 美國窗口的 AOM／VT 敏感度，避免把兩地高低點混加。下列是指定情境重播，不是重新找各 ETF 的個別高低點，也不是整段投資生涯最大回撤。

【推論】令 D 為股息與分割調整後日價；台幣掛牌標的 V=D，美國掛牌標的 V=D×X，X 為每美元的新台幣數。單一資產區間報酬＝V(末日)/V(起日)−1；雙標的桶＝各起始權重乘各自累計報酬加總。即美元換台幣公式為 (1+r美元)×(1+r匯率)−1，不能只把百分比相加。台幣掛牌海外 ETF 不再乘匯率。

【推論】本次優先取 Yahoo adjclose 作稅前、配息再投入代理；它來自【二手】行情，不視為發行商驗證過的含息基金淨值。未另扣個人股息稅、複委託費、交易費與買賣匯差；基金內部費用已反映。非交易日取該市場最近一筆先前可得收盤／匯率；本表端點均有對應觀測，復原日可能由不同市場更新觸發。

### 三桶端點報酬（台幣）

「未上市」指完整窗口起點時尚未上市；即使事件中途上市，也不縮短窗口冒充全程。B 為雙標的時，任何一檔未上市便列桶組合不完整；不表示該桶每檔都未上市。2008 的 C 成長是已上市但本次資料不足。

| 事件 | R8 台股窗口 | 布局 | 穩健桶 | 成長桶 | 積極桶 | 來源網址 |
|---|---|---|---|---|---|---|
| 【推論：標記口徑】2000 | 【沿用 R8：一手／二手混合】2000-02-17～2001-10-03 | A | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2000 | 【沿用 R8：一手／二手混合】2000-02-17～2001-10-03 | B | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2000 | 【沿用 R8：一手／二手混合】2000-02-17～2001-10-03 | C | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2008 | 【沿用 R8：一手／二手混合】2007-10-29～2008-11-20 | A | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2008 | 【沿用 R8：一手／二手混合】2007-10-29～2008-11-20 | B | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2008 | 【沿用 R8：一手／二手混合】2007-10-29～2008-11-20 | C | 未上市（完整區間不可算） | 待查（資料缺漏） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2011 | 【沿用 R8：一手／二手混合】2011-01-28～2011-12-19 | A | 【推論】+5.0% | 【推論】-7.9% | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2011 | 【沿用 R8：一手／二手混合】2011-01-28～2011-12-19 | B | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2011 | 【沿用 R8：一手／二手混合】2011-01-28～2011-12-19 | C | 未上市（完整區間不可算） | 【推論】-25.8% | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2015 | 【沿用 R8：一手／二手混合】2015-04-27～2015-08-24 | A | 【推論】+2.1% | 【推論】-5.9% | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2015 | 【沿用 R8：一手／二手混合】2015-04-27～2015-08-24 | B | 未上市（完整區間不可算） | 未上市（完整區間不可算） | 【推論】-41.7%（官方價格） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2015 | 【沿用 R8：一手／二手混合】2015-04-27～2015-08-24 | C | 未上市（完整區間不可算） | 【推論】-21.0% | 【推論】-41.7%（官方價格） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2018 | 【沿用 R8：一手／二手混合】2018-01-23～2018-12-26 | A | 【推論】-1.6% | 【推論】-11.6% | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2018 | 【沿用 R8：一手／二手混合】2018-01-23～2018-12-26 | B | 未上市（完整區間不可算） | 【推論】-12.3% | 【推論】-24.5% | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2018 | 【沿用 R8：一手／二手混合】2018-01-23～2018-12-26 | C | 【推論】-7.3% | 【推論】-13.8% | 【推論】-24.5% | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2020 | 【沿用 R8：一手／二手混合】2020-01-14～2020-03-19 | A | 【推論】-14.4% | 【推論】-28.8% | 【推論】-27.6% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2020 | 【沿用 R8：一手／二手混合】2020-01-14～2020-03-19 | B | 【推論】-10.9% | 【推論】-28.1% | 【推論】-52.1% | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2020 | 【沿用 R8：一手／二手混合】2020-01-14～2020-03-19 | C | 【推論】-25.0% | 【推論】-28.2% | 【推論】-52.1% | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2022 | 【沿用 R8：一手／二手混合】2022-01-04～2022-10-25 | A | 【推論】-2.8% | 【推論】-7.8% | 【推論】-30.6% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2022 | 【沿用 R8：一手／二手混合】2022-01-04～2022-10-25 | B | 【推論】-0.5% | 【推論】-19.9% | 【推論】-51.1% | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2022 | 【沿用 R8：一手／二手混合】2022-01-04～2022-10-25 | C | 【推論】-13.0% | 【推論】-32.8% | 【推論】-51.1% | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2024-08 | 【沿用 R8：一手／二手混合】2024-07-11～2024-08-05 | A | 【推論】-1.0% | 【推論】-6.4% | 【推論】-19.0% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2024-08 | 【沿用 R8：一手／二手混合】2024-07-11～2024-08-05 | B | 【推論】-3.3% | 【推論】-14.1% | 【推論】-37.2% | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2024-08 | 【沿用 R8：一手／二手混合】2024-07-11～2024-08-05 | C | 【推論】-8.1% | 【推論】-21.3% | 【推論】-37.2% | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2025-04 | 【沿用 R8：一手／二手混合】2025-02-21～2025-04-09 | A | 【推論】-2.3% | 【推論】-7.6% | 【推論】-26.1% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 【推論：標記口徑】2025-04 | 【沿用 R8：一手／二手混合】2025-02-21～2025-04-09 | B | 【推論】-6.0% | 【推論】-22.7% | 【推論】-49.5% | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 【推論：標記口徑】2025-04 | 【沿用 R8：一手／二手混合】2025-02-21～2025-04-09 | C | 【推論】-13.6% | 【推論】-26.1% | 【推論】-49.5% | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |

【一手核對＋推論】正二的早期日線不能直接信任：官方在 2015-04-27 收 24.78、2015-08-24 收 14.44，算得 −41.7%；與 R8 相符。Yahoo 同日期分割還原值為 0.80227 與 0.65636【二手】，比值只得約 −18.2%【推論】，不是固定分割倍數可以解釋的差異。本表該事件改用官方端點，恢復時間待查，沒有擅自補一條日路徑。來源：https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?response=json&date=20150401&stockNo=00631L；https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?response=json&date=20150801&stockNo=00631L。

### 匯率端點核對

X 的單位為新台幣／美元；正變動代表美元升值。下表匯價與日期為【一手：FRED／Fed H.10】，百分比為【推論】。本次成功取得官方 CSV，未採 Yahoo 的匯率作最終計算。

| 事件 | 起日 | 末日 | 起日 X | 末日 X | 匯率變化 | 來源網址 |
|---|---|---|---|---|---|---|
| 2000 | 【一手】2000-02-17 | 【一手】2001-10-03 | 【一手】30.7200 | 【一手】34.6100 | 【推論】+12.7% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2008 | 【一手】2007-10-29 | 【一手】2008-11-20 | 【一手】32.3900 | 【一手】33.4200 | 【推論】+3.2% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2011 | 【一手】2011-01-28 | 【一手】2011-12-19 | 【一手】29.0500 | 【一手】30.3800 | 【推論】+4.6% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2015 | 【一手】2015-04-27 | 【一手】2015-08-24 | 【一手】30.4400 | 【一手】33.0000 | 【推論】+8.4% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2018 | 【一手】2018-01-23 | 【一手】2018-12-26 | 【一手】29.2300 | 【一手】30.8100 | 【推論】+5.4% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2020 | 【一手】2020-01-14 | 【一手】2020-03-19 | 【一手】29.8900 | 【一手】30.4000 | 【推論】+1.7% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2022 | 【一手】2022-01-04 | 【一手】2022-10-25 | 【一手】27.5200 | 【一手】32.3400 | 【推論】+17.5% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2024-08 | 【一手】2024-07-11 | 【一手】2024-08-05 | 【一手】32.5100 | 【一手】32.6700 | 【推論】+0.5% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2025-04 | 【一手】2025-02-21 | 【一手】2025-04-09 | 【一手】32.7500 | 【一手】32.8500 | 【推論】+0.3% | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |

### 美國窗口敏感度（仍為台幣含息代理）

本表只改用 R8 美國窗口，不與上表台灣窗口的桶報酬相加。尤其台灣關稅事件的末日已包含美國反彈，故美國窗口損失可能更大。混合布局若要改用美國窗口，必須整個組合所有標的一起重算。

| 事件 | R8 美國窗口 | AOM 台幣報酬 | VT 台幣報酬 | 來源網址 |
|---|---|---|---|---|
| 2000 | 【沿用 R8：一手／二手混合】2000-03-24～2002-10-09 | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2008 | 【沿用 R8：一手／二手混合】2007-10-09～2009-03-09 | 未上市（完整區間不可算） | 未上市（完整區間不可算） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2011 | 【沿用 R8：一手／二手混合】2011-04-29～2011-10-03 | 【推論】-0.5% | 【推論】-18.7% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2015 | 【沿用 R8：一手／二手混合】2015-05-21～2015-08-25 | 【推論】+0.2% | 【推論】-7.9% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2018 | 【沿用 R8：一手／二手混合】2018-09-20～2018-12-24 | 【推論】-6.8% | 【推論】-17.9% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2020 | 【沿用 R8：一手／二手混合】2020-02-19～2020-03-23 | 【推論】-15.8% | 【推論】-33.6% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2022 | 【沿用 R8：一手／二手混合】2022-01-03～2022-10-12 | 【推論】-6.6% | 【推論】-14.8% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2024-08 | 【沿用 R8：一手／二手混合】2024-07-16～2024-08-05 | 【推論】-1.8% | 【推論】-7.8% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2025-04 | 【沿用 R8：一手／二手混合】2025-02-19～2025-04-08 | 【推論】-5.5% | 【推論】-15.7% | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |

### 整個組合：最深損失與回原點

【推論】下表每格是「固定窗口內相對起始本金的最深損失／回原點日（自起點起曆日數）」。從窗口內最低組合值之後找首次回到起始本金的日子；不是從谷底計時，也不代表之後再無回跌。每日以起始資金分配後的資產單位估值，沒有把各桶不同日期的最大跌幅加權。只計資料完整案例，不把缺桶權重改成現金。

配置比例沿用任務書【一手：使用者設定】，順序為穩健／成長／積極：保守型 80/20/0、穩健型 50/30/20、成長型高承受 25/50/25、成長型一般 35/50/15、積極型 25/30/45；沒有改動比例。表格所有計算結果均為【推論】、輸入行情為【二手】。

| 事件／布局 | 保守型 | 穩健型 | 成長型高承受 | 成長型一般 | 積極型 | 來源網址 |
|---|---|---|---|---|---|---|
| 2018/C | 【推論】-10.0%／2019-03-15（416 日） | 【推論】-13.1%／2019-04-01（433 日） | 【推論】-14.9%／2019-04-09（441 日） | 【推論】-13.2%／2019-04-08（440 日） | 【推論】-17.0%／2019-04-09（441 日） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2020/A | 【推論】-17.3%／2020-08-04（203 日） | 【推論】-21.4%／2020-06-03（141 日） | 【推論】-24.9%／2020-06-05（143 日） | 【推論】-23.6%／2020-06-08（146 日） | 【推論】-24.7%／2020-05-20（127 日） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2020/B | 【推論】-14.3%／2020-07-06（174 日） | 【推論】-24.3%／2020-07-06（174 日） | 【推論】-29.8%／2020-07-13（181 日） | 【推論】-25.7%／2020-07-13（181 日） | 【推論】-34.6%／2020-07-06（174 日） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2020/C | 【推論】-25.7%／2020-07-06（174 日） | 【推論】-31.4%／2020-07-06（174 日） | 【推論】-33.4%／2020-07-06（174 日） | 【推論】-30.7%／2020-07-06（174 日） | 【推論】-38.2%／2020-07-06（174 日） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2022/A | 【推論】-10.1%／2023-04-27（478 日） | 【推論】-15.5%／2023-05-29（510 日） | 【推論】-18.1%／2023-05-29（510 日） | 【推論】-15.7%／2023-06-01（513 日） | 【推論】-21.4%／2023-05-29（510 日） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2022/B | 【推論】-6.0%／2023-03-01（421 日） | 【推論】-17.4%／2023-05-29（510 日） | 【推論】-24.0%／2023-06-13（525 日） | 【推論】-19.1%／2023-06-07（519 日） | 【推論】-29.5%／2023-07-04（546 日） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2022/C | 【推論】-17.2%／2023-04-10（461 日） | 【推論】-26.6%／2023-05-29（510 日） | 【推論】-32.4%／2023-06-15（527 日） | 【推論】-28.6%／2023-06-12（524 日） | 【推論】-36.1%／2023-06-15（527 日） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2024-08/A | 【推論】-2.0%／2024-08-16（36 日） | 【推論】-6.2%／2024-10-04（85 日） | 【推論】-8.2%／2024-10-09（90 日） | 【推論】-6.4%／2024-09-23（74 日） | 【推論】-10.7%／2024-11-06（118 日） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2024-08/B | 【推論】-5.5%／2024-10-15（96 日） | 【推論】-13.4%／2025-09-05（421 日） | 【推論】-17.2%／2025-08-13（398 日） | 【推論】-13.8%／2025-01-06（179 日） | 【推論】-21.8%／2025-09-09（425 日） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2024-08/C | 【推論】-10.8%／2024-10-18（99 日） | 【推論】-17.9%／2025-09-08（424 日） | 【推論】-22.0%／2025-08-11（396 日） | 【推論】-19.1%／2025-08-07（392 日） | 【推論】-25.2%／2025-09-09（425 日） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2025-04/A | 【推論】-7.1%／2025-08-22（182 日） | 【推論】-12.0%／2025-08-22（182 日） | 【推論】-14.9%／2025-08-13（173 日） | 【推論】-12.6%／2025-08-20（180 日） | 【推論】-17.8%／2025-08-13（173 日） | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 2025-04/B | 【推論】-9.4%／2025-09-24（215 日） | 【推論】-19.7%／2025-08-27（187 日） | 【推論】-25.2%／2025-08-11（171 日） | 【推論】-20.9%／2025-08-13（173 日） | 【推論】-30.6%／2025-08-11（171 日） | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| 2025-04/C | 【推論】-16.1%／2025-09-08（199 日） | 【推論】-24.5%／2025-08-07（167 日） | 【推論】-28.8%／2025-07-18（147 日） | 【推論】-25.3%／2025-07-18（147 日） | 【推論】-33.5%／2025-08-07（167 日） | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |

【推論】例如穩健型的 C 布局，疫情最深損失為 −31.4%，升息情境為 −26.6%；若第八題選擇只能承受 −20%，就應顯示超出承受範圍，而非因型態名稱叫「穩健」就宣稱符合。歷史中沒超過也不能稱安全通過。這裡只是代表標的案例，不能當使用者實際持倉的預測。來源：上表 C 對應資料 URL。

### 穩健桶在升息情境的實際差異

窗口固定為【沿用 R8】2022-01-04～2022-10-25。下列不是全年報酬，也不是 R13 的年度內價格最大回撤。

| 布局／標的 | 該窗口台幣含息端點 | 解釋與 R13 對照 | 來源網址 |
|---|---|---|---|
| A／AOM | 【推論】−2.8%；美元含息約 −17.3% | 【推論】美元同期升值約 17.5%，抵銷大部分美元損失；不能把匯率幫忙視為往後仍然有效。R13 的 −20.6% 是美元年度內價格最大回撤【二手】，口徑不同 | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| B／短債與低波股等額 | 【推論】−0.5% | 【推論】00719B 台幣含息約 +12.1%，00713 約 −13.0%，互相抵銷；端點接近持平不表示過程未虧損 | https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |
| C／00713 | 【推論】−13.0% | R13 同年度價格最大回撤為 −21.4%【二手】；配息、日期與最大值定義都不同。全股票低波桶仍會明顯下跌 | https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://www.yuantaetfs.com/product/detail/00713/Basic_information |
| 長公司債敏感度／00720B（未納入本次代表組合） | 指定窗口含息端點待查 | 沿用 R13：年度內台幣價格最大回撤 −27.6%【二手】；不可拿這個數字直接替換前列固定窗口結果 | https://www.yuantaetfs.com/product/detail/00720B/Basic_information；https://finance.yahoo.com/quote/00720B.TWO/history/ |

【推論】同一指定窗口內，穩健桶「相對起始本金」的最深損失分別是 A：−8.9%（2022-06-14）、B：−2.6%（2022-07-06）、C：−13.7%（2022-10-13）。這是每天對整桶估值後取最低，並非將各成分自己的最低日相加；因此端點表中的近乎持平不能解讀成期間內都沒虧損。來源：本節 AOM、00719B、00713 日線與 FRED 匯率完整請求 URL。

【一手】Vanguard 的股債年度分解將升息年呈現為股債同跌的例外，並揭露股票與債券採用的指數、美元與避險口徑；iShares 的 AOM 商品定位是跨資產配置與追蹤目標風險指數，都不等於本金保證。來源：https://www.ch.vanguard/content/dam/intl/europe/documents/de/indexing-forum-2023-azingg.pdf；https://www.ishares.com/us/products/239765/ishares-moderate-allocation-etf。

【推論】網站不需改已定案桶名，但旁邊應明寫「穩健＝相對減震，仍會虧損；股票、短債、長債風險不同」。報告的良好台幣端點部分來自匯率，不證明債券在該年一定保護所有台灣投資人；也不能用本次較平穩的 B 桶替所有穩健商品背書。

## 五、起點年份比較

「涵蓋」是指定事件數，不是所有歷史股災。完整真實案例是依本次代表組合與資料覆蓋計數。誤差沒有可靠量化依據時列待查，不杜撰固定誤差帶。

| 起點方案 | 涵蓋指定事件數 | 哪些需要替代／補資料 | 可量化與不可量化誤差 | 建議 | 來源網址 |
|---|---|---|---|---|---|
| 【推論】2008 起，實際下載須從 2007 年高點開始 | 【推論】8 次：海嘯至關稅事件 | AOM、VT 在海嘯起點未上市；A 的 FANG+、B 的短債與低波股、台掛美股、台股正二、C 的低波股在部分事件未上市；0050 海嘯資料本次另缺 | 全球股可用同類總報酬指數，股債桶用歷史股債規則重建，短債用對應債指數；低波與 FANG+ 回填涉及回測選股偏差，正二須逐日模型與成本；誤差幅度待查，不能用大盤乘倍數 | 保留為延伸情境，主頁不能冒稱全真實商品 | https://www.portfoliovisualizer.com/faq；https://www.yuantaetfs.com/product/detail/00631L/Basic_information |
| 【推論】2015 起 | 【推論】6 次：中國股災至關稅事件 | A 積極、B 穩健、B 成長的美股半桶、C 穩健未涵蓋首個事件；正二官方端點可用但恢復日線待查 | 比海嘯少模型段，但低波／主題仍不能用市值指數無誤差代替；本次正二同日期來源差異約 23.5 個百分點【推論】，是資料品質衝突，不是追蹤誤差的估計 | 可作部分真實商品延伸層 | https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?response=json&date=20150401&stockNo=00631L；https://www.yuantaetfs.com/product/detail/00713/Basic_information |
| 【推論】2018 起 | 【推論】5 次：貿易戰至關稅事件 | A 積極於事件中途上市；B 穩健中的短債晚於台股窗口起點；C 已有完整真實商品 | 「從這一年開始都是真實商品」不成立；若改成美國年末窗口，仍可能切掉 FANG+ 未上市部分；差異待查，不能換窗口來美化完整性 | C 可先做；A／B 該事件缺桶須標明 | https://www.yuantaetfs.com/product/detail/00719B/Basic_information；https://isin.twse.com.tw/isin/class_main.jsp |
| 【推論】2020 起 | 【推論】4 次：疫情、升息、套利平倉、關稅 | 本次全部代表商品均已上市；無須補上市前模型 | 替代模型誤差消除，但行情品質、配息調整、交易時差與稅費誤差仍在；未經全量官方交叉核對，無法給可信誤差範圍 | 建議共同主展示；另保留前述更早事件與資料缺口，不當作完整歷史最壞情況 | https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits |

【推論】如果目標優先是教育金融海嘯風險，而非重播目前商品，應另開「資產類別模型」層。每段註明 proxy、可得期間、是否指數正式推出前回填，以及與真實 ETF 重疊期間的報酬差、最大回撤差和恢復日差；沒有重疊也不能假設誤差為零。此工作本次未得到完整免費指數日線，結果待查。

## 六、資料來源

| 資料 | 免費取得與 Node 方式 | 起始與本次可用性 | token／含息 | 條款與限制 | 來源網址 |
|---|---|---|---|---|---|
| FinMind 台股日價 | fetch v4/data，dataset=TaiwanStockPrice，data_id、start_date、end_date | 【一手】文件標示自 1994-10-01 起；各商品仍以實際上市與回應為準，本次計算未取此資料 | 基本日價文件有不帶 token 範例；註冊 token 提升額度，實際方案／權限以回應為準；原始日價不含息 | 文件的還原價表屬付費 backer／sponsor，不列作免費還原來源；一般價須自行併公司行動。條款限制原始資料再散布與鏡像服務 | https://finmind.github.io/tutor/TaiwanMarket/Technical/；https://finmind.github.io/PrivacyPolicy/；https://finmind.github.io/Disclaimer/ |
| 證交所個股日成交 | fetch rwd/zh/afterTrading/STOCK_DAY，以月份與代碼取 JSON | 【一手：本次回應】早於 2010-01-04 的查詢被拒；本次海嘯起迄月未取得。成功取到正二早期事件端點 | 不需 token；成交價不含息，也不自動解決分割，須併官方配息與分割 | 公開接口可取不等於所有網頁歷史庫都開放重用；開放資料集與交易資訊各依適用授權，不能把免費查詢推成無限轉載 | https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?response=json&date=20150401&stockNo=00631L；https://data.gov.tw/dataset/11549 |
| Yahoo 台股與美股 ETF | fetch chart API，interval=1d、events=div,splits；讀 quote.close 與 indicators.adjclose | 【二手：本次回應】AOM 自 2008-11-11、VT 自 2008-06-26；台股部分從成立日起混有上市前資料；0050 本次僅自 2009 年起 | 本次無 token 可下載；有 adjclose 與配息、分割事件，但非官方保證的歷史總報酬；必須逐檔驗證 | 免費研究可讀的事實不等於網站重發布授權；現行條款頁本次存取受阻，商用／再散布授權待查；非正式接口，不能作服務穩定性保證 | https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits；https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html |
| Stooq 美股 ETF 備援 | 候選 CSV：stooq.com/q/d/l/?s=vt.us&i=d，可供 fetch 後解析 | 各 ETF 起日待查；本次網頁遇驗證，未用作數值來源 | 通常可見不帶 token 的下載網址；本次含配息調整政策未核實 | 頁面與自動抓取可能受驗證限制；免費範圍、調整定義及再散布權均待查，不能保證可直接部署 | https://stooq.com/db/h/；https://stooq.com/q/d/l/?s=vt.us&i=d |
| FRED／Fed H.10 美元兌台幣 | fetch fredgraph.csv?id=DEXTAUS，帶 cosd/coed；解析空白值並只向後取最近有效值 | 【一手：本次下載】涵蓋 2000-01-03 起所請求期間；這是請求下界，不宣稱序列實際始於該年；最早整條序列日期待查 | CSV 本次不需 key；正式 FRED API 的 key 規則另查。每美元台幣，並非個人可成交買賣價 | 官方序列註明須檢查來源著作權；Fed 原始來源與標示資訊須保留，發布方式依資料使用條款 | https://fred.stlouisfed.org/series/DEXTAUS；https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24 |
| 央行台幣匯率備援 | 官網外匯資訊查詢／下載；可優先找官方開放資料接口 | 實際可自動取到的日線起日與接口待查；未用於本次計算 | 公開查詢不需研究者私有憑證；Node 對應格式待查 | 不把銀行牌告買賣匯率混作市場收盤；自動抓取與再利用細節待查 | https://www.cbc.gov.tw/tw/lp-645-1.html |
| 加權報酬指數 | FinMind TaiwanStockTotalReturnIndex，data_id=TAIEX；官方編製要點確認報酬指數概念 | 【一手：FinMind 文件】資料表自 2003-01-01；起始有效交易日依回應，不宣稱有元旦報價 | 文件有不帶 token 範例；總報酬與價格指數分開，不能當台灣50或低波股指數 | FinMind 屬轉載整理，數值標【二手】；對外使用仍須符合其條款及原提供機關授權 | https://finmind.github.io/tutor/TaiwanMarket/Technical/；https://twse-regulation.twse.com.tw/TW/law/DOC01.aspx?FLCODE=FL047579&FLNO=4 |

### 可重跑的計算規格

本次下載與計算使用一次性 Node 程式，依任務要求於結束前移除；以下將關鍵規格留在報告，不新增專案腳本。參考資料列出每個商品的完整請求 URL。所有公式與門檻為【推論】，不是外部查得數據。

~~~js
// 取回 chart.result[0]；依 timestamp 組成 UTC 日期、close、adjclose。
// 拒絕 null／非正值；依官方上市日篩除成立日至上市日前的資料。
// 端點選 date <= 目標日的最近有效值，不可用未來值回補。
const assetValue = (adj, currency, fx) => currency === 'USD' ? adj * fx : adj;
const normalizedPortfolio = (holdings, start, date) =>
  holdings.reduce((sum, h) => sum + h.initialWeight * value(h, date) / value(h, start), 0);
// holdings.initialWeight = 桶權重 × 桶內權重；起點總值為 1。
// 任一必要持倉在起點未上市、缺報價或缺匯率，整個案例不可計算。
// 日期軸取各商品及 FRED 有效日期聯集，已休市市場沿用先前值。
// 在 R8 指定窗口內，找 normalizedPortfolio 最低值與日期。
// 最深損失 = 最低值 - 1；端點報酬 = 末日值 - 1。
// 在最低值日之後，找首次 normalizedPortfolio >= 1 的日期。
// 恢復曆日數 = (恢復日期 - R8 起點日期) / 86400000。
// 截止日後不外推；沒有恢復須寫「截至觀察截止日未回原點」。
// 完成計算才將百分比四捨五入至小數一位；不能拿已四捨五入桶報酬再算。
~~~

【推論】觀察截止統一為 2026-11-24，因美國商品回應最後有效日到此；恢復日表是各市場同曆日收盤估值的研究近似，不保證台灣交易人能在該日收盤同時出清所有部位。正式實作若採台北特定估值時點，應用時間戳重排美股與匯率資料，再重算日期。

## 七、待查與不確定

- 舊情境的缺口有保留：A／B 的早期主題、短債、低波股與台掛美股缺完整上市歷史；海嘯的 0050 是資料缺漏而非未上市。三桶模型端點與恢復日不能宣稱已補齊。
- 【推論】2000 年情境全部代表組合不完整，僅列狀態與官方匯率；未將 R8 的一般指數跌幅冒充各桶。金融海嘯要重播的實際起點在 2007 年，不能從事件名稱所示的下一年才抓價。
- AOM 正式上市日仍待一手公告確認；本次使用的最早行情日與成立日分開列。VT 交易日由 DTCC 對照支持，與成立日不混同。
- 【二手／推論】Yahoo 正二早期價格比值與官方不合，該事件採官方端點。0050 序列在 2013 年末到 2014 年初出現約四倍尺度斷點；本次沒有計算跨該斷點的恢復日或拼接長期績效。早期序列日後若擴充，必須重新校正，不能直接整段畫圖。
- 本次做了日線大跳動與上市日篩查，但沒有對全部事件、配息、分割與恢復日逐筆以官方交易資料重建。因此新的日線結果標【推論】、以【二手】資料為輸入；可用於規劃與核對，尚不足以稱為全量官方驗證的公開計算機數據。價格／淨值折溢價、配息還原與歷史更正都可能改變結果。
- 【推論】美元匯率最終採 FRED；本次 Yahoo TWD=X 曾出現不合理單日斷點，未採。FRED 的收盤時點與台灣 ETF 收盤不同；整條序列最早日期及央行備援接口仍待核實。
- 【推論】沒有用舊公式把正二跌幅估成大盤跌幅倍數，也沒有把穩健桶當現金。若擴充上市前指數模型，融資成本、期貨轉倉、費用與逐日重設都需獨立估計，誤差目前待查。
- 無法給出未上市代理的可信誤差百分比；應以重疊期間實測。選股指數正式推出前的回填、存活者偏誤與目前商品挑選偏誤都會影響結果；本次未以今日持股倒算舊股災。
- 【推論】主頁採 2020 年共同真實商品案例、較早情境用明確模型層，是本報告建議；使用者仍可選擇先補齊金融海嘯模型再上線。商品組合是代表案例，實際持倉與再平衡規則若不同須重算。此選擇無須改既有桶名與測驗比例。
- 免費讀取與網站對外服務的資料授權分開核實。Yahoo、Stooq 的正式重用條款、FinMind 可用額度與個別資料權限仍有待確認；本次不採付費還原價資料，不要求使用者提供 token，也不輸出原始日線資料庫。

## 參考資料

- Vanguard 資產配置歷史拼接：https://investor.vanguard.com/investor-resources-education/education/model-portfolio-allocation
- Vanguard 股債同跌指數口徑：https://www.ch.vanguard/content/dam/intl/europe/documents/de/indexing-forum-2023-azingg.pdf
- Portfolio Visualizer 方法與資料：https://www.portfoliovisualizer.com/faq
- BlackRock 歷史報酬與今日曝險：https://www.blackrock.com/aladdin/platforms/solutions/aladdin-wealth/insights/historical-returns
- Morningstar Scenario Metrics（本次僅摘要）：https://advisor.morningstar.com/scenariometrics.htm
- Finance Toolkit 歷史情境：https://www.jeroenbouma.com/projects/financetoolkit/docs/portfolio-optimization/stress-test
- AOM 發行商：https://www.ishares.com/us/products/239765/ishares-moderate-allocation-etf
- VT 發行商：https://advisors.vanguard.com/investments/products/vt/vanguard-total-world-stock-etf
- VT DTCC 交易對照：https://www.dtcc.com/-/media/Files/pdf/2008/6/26/OTC123.pdf
- 證交所 ISIN 上市日：https://isin.twse.com.tw/isin/class_main.jsp
- 證交所 FANG+ 資料：https://www.twse.com.tw/zh/ETFortune/etfInfo/00757
- 0050 元大基本資料：https://www.yuantaetfs.com/product/detail/0050/Basic_information
- 00646 元大基本資料：https://www.yuantaetfs.com/product/detail/00646/Basic_information
- 00631L 元大基本資料：https://www.yuantaetfs.com/product/detail/00631L/Basic_information
- 00713 元大基本資料：https://www.yuantaetfs.com/product/detail/00713/Basic_information
- 00719B 元大基本資料：https://www.yuantaetfs.com/product/detail/00719B/Basic_information
- 00720B 元大基本資料：https://www.yuantaetfs.com/product/detail/00720B/Basic_information
- FinMind 技術面資料表：https://finmind.github.io/tutor/TaiwanMarket/Technical/
- FinMind 快速開始：https://finmind.github.io/quickstart/
- FinMind 使用條款：https://finmind.github.io/PrivacyPolicy/
- FinMind 資料授權：https://finmind.github.io/Disclaimer/
- 證交所政府資料集：https://data.gov.tw/dataset/11549
- 加權報酬指數編製：https://twse-regulation.twse.com.tw/TW/law/DOC01.aspx?FLCODE=FL047579&FLNO=4
- FRED 台幣匯率說明：https://fred.stlouisfed.org/series/DEXTAUS
- FRED 本次完整匯率請求：https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS&cosd=2000-01-01&coed=2026-11-24
- 央行匯率查詢候選：https://www.cbc.gov.tw/tw/lp-645-1.html
- Stooq 歷史資料（驗證受阻）：https://stooq.com/db/h/
- Yahoo 使用條款（存取受阻）：https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html
- 官方正二起點月：https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?response=json&date=20150401&stockNo=00631L
- 官方正二低點月：https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?response=json&date=20150801&stockNo=00631L
- AOM 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/AOM?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- VT 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/VT?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- 00757.TW 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/00757.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- 00719B.TWO 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/00719B.TWO?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- 00713.TW 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/00713.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- 0050.TW 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/0050.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- 00646.TW 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/00646.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
- 00631L.TW 本次完整日線請求：https://query1.finance.yahoo.com/v8/finance/chart/00631L.TW?period1=946684800&period2=1795564800&interval=1d&events=div%2Csplits
