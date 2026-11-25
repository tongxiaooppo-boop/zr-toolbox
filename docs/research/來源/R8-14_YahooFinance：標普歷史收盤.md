# YahooFinance：標普歷史收盤

- 網址：https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=-1325635200&period2=1795564800&interval=1d
- 發行者：YahooFinance
- 發布或更新日期：未標示
- 抓取日期：2026-11-25
- 原文：原文/R8-14_YahooFinance：標普歷史收盤.md
- 用在：R8「股災史與價格資料口徑」

## 重點整理

這份補充報價資料以時間戳記對應每日收盤值，並保留資料供應商的原始JSON。使用時先檢查代號是標普指數，再把時間戳記轉成交易日期，排除沒有有效收盤值的紀錄。報價中的小數常因浮點儲存而多出尾數，因此表格把指數點位四捨五入到小數兩位，跌幅則以來源數值計算後顯示一位。本次對每個事件分別選定觀察區間，先找低點，再找此前的區間高點，不用低點之後出現的反彈高點倒算損失。台美市場日期不強制一致，各欄都註明自身高低點。這是官方下載未成功後使用的補充來源，沒有冒充標普或FRED認證的資料。對現行指數推出以前的歷史序列，本次沒有充分取得重建方法，因此大蕭條的標普跌幅仍待查，不使用回傳早期序列直接下結論。這份資料只支持名目價格變化，不是含息報酬，也不等於投資人的美元或台幣實際報酬。

## 關鍵數字

- 1987-08-25；336.7699890136719；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 1987-12-04；223.9199981689453；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 1990-07-16；368.95001220703125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 1990-10-11；295.4599914550781；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2000-02-17；1388.260009765625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2000-03-24；1527.4599609375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2001-10-03；1072.280029296875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2002-10-09；776.760009765625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2007-10-09；1565.1500244140625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2007-10-29；1540.97998046875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2008-11-20；752.4400024414062；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2009-03-09；676.530029296875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2011-01-28；1276.3399658203125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2011-04-29；1363.6099853515625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2011-10-03；1099.22998046875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2011-12-19；1205.3499755859375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2014-06-09；1951.27001953125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2015-04-24；2117.68994140625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2015-04-27；2108.919921875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2015-05-21；2130.820068359375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2015-08-24；1893.2099609375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2015-08-25；1867.6099853515625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2017-05-11；2394.43994140625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2017-06-05；2436.10009765625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2018-01-23；2839.1298828125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2018-08-30；2901.1298828125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2018-09-20；2930.75；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2018-12-24；2351.10009765625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2018-12-26；2467.699951171875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2019-10-22；2995.989990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-01-14；3283.14990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-02-19；3386.14990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-03-19；2409.389892578125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-03-23；2237.39990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-07-06；3179.719970703125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-07-09；3152.050048828125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2020-07-27；3239.409912109375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2022-01-03；4796.56005859375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2022-01-04；4793.5400390625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2022-10-12；3577.030029296875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2022-10-25；3859.110107421875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2024-01-25；4894.16015625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2024-02-15；5029.72998046875；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2024-07-11；5584.5400390625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2024-07-16；5667.2001953125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2024-08-05；5186.330078125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-01-07；5909.02978515625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-02-19；6144.14990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-02-21；6013.1298828125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-04-08；4982.77001953125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-04-09；5456.89990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-08-07；6340；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-08-11；6373.4501953125；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-08-18；6449.14990234375；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。
- 2025-09-12；6584.2900390625；原文timestamp對應 indicators.quote[0].close；顯示時四捨五入。

## 我的判讀

- 補充來源，保留供應商或業者背景；數據口徑及產品推介不能照單全收。
- 跌幅、約略月數與恢復判斷是本研究計算，不是原文直接宣告；缺漏或尺度不明時保留待查。
