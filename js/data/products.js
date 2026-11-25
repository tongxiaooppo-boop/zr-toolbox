// ㉒ 商品與賺錢方式，來源 docs/research/R5-商品與獲利方式.md（Codex 依研究報告改寫，2026-11-09）。
export const LEVELS = [
  {
    "id": "ok",
    "title": "可以從這裡開始",
    "line": "可以拿小錢來試：零股，和分散持有國內股票的 ETF。還是可能虧錢，先看費用和它到底持有什麼。"
  },
  {
    "id": "careful",
    "title": "先弄懂再碰",
    "line": "先搞懂個股、匯率、債券、信託和基金策略各自怎麼運作，再看交割方式、費用，還有最壞會虧多少。"
  },
  {
    "id": "no",
    "title": "新手不建議",
    "line": "新手先別碰。這類商品可能有到期日、槓桿、借錢，或規則很複雜；有些虧損會比你一開始投入的保證金還多。"
  }
];

export const PRODUCTS = [
  {
    "id": "stock",
    "name": "上市櫃股票（整股）",
    "plain": "買一家公司的股票，你就是股東，持有公司的一小部分。",
    "how": "先開證券戶、集保戶和交割銀行戶。2026年一般是 1,000股 算一張，交易時間 9:00–13:30。",
    "earn": "股價漲了賣掉賺價差，或是領公司發的現金股利和股票股利。",
    "lose": "公司倒閉或下市，可能全賠；只用自己的錢買現股的話，最多賠掉本金加費用。",
    "cost": "2026年上市股票的手續費率由券商自己訂，超過 0.1425% 要先通知你，這不是上限；上櫃的上限還沒查到。2025年指南的賣出證交稅是 0.3%。股利的稅看「賺錢方式」那一頁；健保補充保費從2021年起是 2.11%，起扣門檻和誰免扣還沒查到。",
    "level": "careful",
    "tools": [
      "cost",
      "dividend",
      "valuation",
      "divtax"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "櫃買中心：上櫃交易系統",
        "url": "https://www.tpex.org.tw/zh-tw/mainboard/trading/rules/system.html"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      },
      {
        "name": "健保署：補充保費試算說明",
        "url": "https://cloudicweb.nhi.gov.tw/esrv/trialbill/countinsurance.aspx"
      }
    ]
  },
  {
    "id": "odd-lot",
    "name": "零股（盤中／盤後）",
    "plain": "只買不到一張的股數，買的還是同一家公司，不是另一種股票。",
    "how": "開戶跟買整股一樣，可以買 1至999股。2026年盤中是 9:00–13:30，9:10 第一次撮合，之後每 5 秒撮合一次；盤後是 13:40–14:30，時間一到才一次撮合。限價單只有當天有效，沒成交不會自動轉到隔天。",
    "earn": "跟整股一樣，靠股價上漲或領股利，只是股數比較少。",
    "lose": "股價下跌，本金可能全賠；買賣價差和能不能成交，也不一定跟整股一樣。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2025年指南的賣出稅是 0.3%；股利的稅看「賺錢方式」那一頁，健保從2021年起是 2.11%，門檻和誰免扣還沒查到。小額交易要留意券商的最低手續費。",
    "level": "ok",
    "tools": [
      "cost",
      "dca"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      },
      {
        "name": "健保署：補充保費試算說明",
        "url": "https://cloudicweb.nhi.gov.tw/esrv/trialbill/countinsurance.aspx"
      }
    ]
  },
  {
    "id": "emerging",
    "name": "興櫃股票",
    "plain": "透過推薦券商跟你議價，買還沒上市櫃的股票。",
    "how": "要有櫃檯買賣證券戶，另外簽興櫃風險預告。2026年 1股 就能買，時間 9:00–15:00。沒有一般的漲跌幅限制，但還是有申報價格範圍，也可能暫停交易。",
    "earn": "公司成長，報價和股利可能跟著變好，但不保證最後會上市櫃。",
    "lose": "可能賣不到你想要的價格，公司倒閉的話本金會全賠。",
    "cost": "2026年的手續費和上限還沒查到；2025年指南的股票賣出稅是 0.3%，股利怎麼課稅看你的居民身分，健保要不要扣還沒查到。",
    "level": "no",
    "tools": [
      "cost",
      "dividend"
    ],
    "sources": [
      {
        "name": "櫃買中心：興櫃交易制度",
        "url": "https://www.tpex.org.tw/zh-tw/esb/trading/rules/overview.html"
      },
      {
        "name": "櫃買中心：常見問題",
        "url": "https://www.tpex.org.tw/zh-tw/about/company/faq.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      }
    ]
  },
  {
    "id": "domestic-etf",
    "name": "ETF（國內股票原型）",
    "plain": "在交易所買一份基金，裡面裝了一籃子國內股票。",
    "how": "開證券戶就能買。2026年一般 1,000單位 一張，零股 1單位 起買；普通交易 9:00–13:30，零股另有時段。要不要簽額外的風險文件，看券商規定。",
    "earn": "基金價格上漲，或領配息；兩個要加起來看總報酬。",
    "lose": "持股下跌、太集中，或基金清算，都可能大賠，甚至全賠，不保本。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2025年指南的賣出稅是 0.1%。經理費和保管費直接從基金資產扣，每檔要自己確認；配息的稅和健保看配息來源，個別金額還沒查到。",
    "level": "ok",
    "tools": [
      "cost",
      "dividend",
      "dca",
      "divtax"
    ],
    "sources": [
      {
        "name": "證交所：ETF總覽",
        "url": "https://www.twse.com.tw/zh/products/securities/etf/overview/introduction.html"
      },
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  },
  {
    "id": "overseas-etf",
    "name": "ETF（國外成分股票）",
    "plain": "在台灣買基金單位，基金裡裝的是海外資產。",
    "how": "跟一般 ETF 一樣。2026年 1,000單位 或零股 1單位，普通交易 9:00–13:30，零股另有時段；海外市場休市時，還是要留意基金的估價。",
    "earn": "海外股價上漲、有配息，或外幣升值，都可能讓你賺錢。",
    "lose": "海外股價、匯率、買賣價差可能一起拖累你，最壞會全賠。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2025年指南的賣出稅是 0.1%。基金內部還有費用，也可能有海外稅，個別稅率還沒查到。",
    "level": "careful",
    "tools": [
      "cost",
      "dividend",
      "fx"
    ],
    "sources": [
      {
        "name": "證交所：ETF總覽",
        "url": "https://www.twse.com.tw/zh/products/securities/etf/overview/introduction.html"
      },
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：商品風險提示",
        "url": "https://investoredu.twse.com.tw/pages/twse_investmentrisk1_6.aspx"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  },
  {
    "id": "bond-etf",
    "name": "ETF（債券原型）",
    "plain": "基金裡裝了很多筆債券，你買的是基金單位，不是直接持有一張債券。",
    "how": "跟一般 ETF 同一個帳戶。2026年整張 1,000單位，零股 1單位，普通交易 9:00–13:30。",
    "earn": "債券的利息會反映在配息或淨值；利率變動也會影響價格。",
    "lose": "升息、發行人違約或匯率變動都會虧；沒有哪個日期保證你能拿回面額。",
    "cost": "2026年上市手續費率自訂，超過 0.1425% 先通知，不是上限；上櫃上限還沒查到。符合資格的債券 ETF 證交稅停徵到 2026-12-31，槓桿和反向型不適用；延到 2036 的草案有沒有生效還沒查到，主動式 ETF 先不當作有優惠。基金內扣費用、配息稅和健保看組成。",
    "level": "careful",
    "tools": [
      "cost",
      "dividend",
      "fx"
    ],
    "sources": [
      {
        "name": "證交所：ETF總覽",
        "url": "https://www.twse.com.tw/zh/products/securities/etf/overview/introduction.html"
      },
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      },
      {
        "name": "財政部：證券交易稅條例",
        "url": "https://law-out.mof.gov.tw/LawContent.aspx?id=FL006079&media=print"
      },
      {
        "name": "財政部：債券證交稅延長草案",
        "url": "https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=d2b1c46fef5242d8a822df113fc8e2fb"
      }
    ]
  },
  {
    "id": "leveraged-etf",
    "name": "ETF（槓桿／反向）",
    "plain": "目標是追單日指數的倍數，或單日反向，不是整段期間都維持固定倍數的基金。",
    "how": "要開證券戶並簽風險預告。2026年查問答，符合下面其中一項就行：有信用戶、近一年有 10筆 權證交易、10筆 期貨交易，或已有買過槓反的紀錄。整張 1,000單位 或零股 1單位，普通交易 9:00–13:30。",
    "earn": "單日方向剛好符合目標，可能賺錢；放好幾天的話，會被每天漲跌的路徑影響。",
    "lose": "就算方向看對，路徑不利也可能虧，最壞全賠；如果是借錢買，還會多一筆個人債務的風險。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2025年指南裡一般 ETF 的賣出稅是 0.1%；2026年現行法律下，槓反和債券 ETF 不適用停徵，基金內扣費用和轉倉成本要逐檔看。",
    "level": "no",
    "tools": [
      "decay",
      "cost"
    ],
    "sources": [
      {
        "name": "證交所：槓反適格性問答",
        "url": "https://investoredu.twse.com.tw/pages/TWSE_InvestmentQA.aspx?ID=11&Page=3"
      },
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      },
      {
        "name": "財政部：證券交易稅條例",
        "url": "https://law-out.mof.gov.tw/LawContent.aspx?id=FL006079&media=print"
      }
    ]
  },
  {
    "id": "etn",
    "name": "ETN（指數投資證券）",
    "plain": "發行的券商承諾，按指數表現付你錢的債務證券，不是直接持有一籃子資產。",
    "how": "證券戶要另外簽 ETN 風險預告，槓桿和反向型還有額外資格。2026年一般 1,000單位 一張，零股依規則，時間 9:00–13:30。向發行人申購或買回的最低數量，看公開說明書。",
    "earn": "賺跟指數連動的價差，到期拿多少看商品條款。",
    "lose": "指數下跌、發行人違約，或被提前贖回，都可能讓你全賠。",
    "cost": "2026年櫃買 ETN 手續費上限是 0.1425%，不像上市的是通知制；賣出稅 0.1%，賣回給發行人和發行人贖回不課稅。其他費用看公開說明書。",
    "level": "no",
    "tools": [
      "cost"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "櫃買中心：ETN商品概述",
        "url": "https://www.tpex.org.tw/zh-tw/product/etn/overview/introduction.html"
      },
      {
        "name": "證交所：商品風險提示",
        "url": "https://investoredu.twse.com.tw/pages/twse_investmentrisk1_6.aspx"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  },
  {
    "id": "warrant",
    "name": "權證（認購／認售）",
    "plain": "你付權利金，換到買進或賣出標的的權利。",
    "how": "證券戶第一次交易前，要先簽權證風險預告。2026年一般 1,000單位 一張，零股依規則，時間 9:00–13:30。統一的財力或經驗門檻還沒查到，也不能套槓反 ETF 的資格。",
    "earn": "認購權證通常在標的上漲時受惠，認售通常在下跌時受惠；賺的是賣出價差，或履約的價值。",
    "lose": "時間過去、波動變化、方向猜錯都可能虧；方向看對也可能虧，到期時價值可能歸零。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2026年官方問答的賣出稅是 0.1%；履約的費用和稅看給付方式，個別數字還沒查到，工具不能幫你算履約。",
    "level": "no",
    "tools": [
      "cost"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：權證教育問答",
        "url": "https://www.twse.com.tw/zh/products/securities/warrant/educate/qa.html"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  },
  {
    "id": "index-futures",
    "name": "期貨（台指期／小台／微台）",
    "plain": "你繳一筆保證金，就要承擔整份指數契約的漲跌，虧的錢不只保證金。",
    "how": "要開期貨戶和約定銀行戶，準備身分文件、簽契約和風險預告，還要過信用調查；公開頁面寫的 20歲 門檻跟現行法令有衝突，還沒查清楚，財力看審查結果。至少買 1口；2026年一般時段 8:45–13:45，夜盤 15:00–翌日5:00，到期日另有規則；當天的保證金還沒查到。",
    "earn": "做多遇到指數上漲，或做空遇到指數下跌，可能賺到契約價差。",
    "lose": "每天結算，可能被叫你補錢，或被強制平倉；遇到跳空，虧損可能超過原本的保證金，還會欠錢。",
    "cost": "2026年股價類期貨的期交稅，買賣雙方各按契約金額收 0.002%；手續費另外談，上限和每口價格還沒查到。",
    "level": "no",
    "tools": [],
    "sources": [
      {
        "name": "期交所：商品問答與稅率",
        "url": "https://www.taifex.com.tw/cht/9/tradersQAProducts"
      },
      {
        "name": "期交所：期貨開戶作業",
        "url": "https://www.taifex.com.tw/cht/4/openingTradingAccount"
      },
      {
        "name": "期交所：期貨交易風險",
        "url": "https://www.taifex.com.tw/file/taifex/event/cht/investmentRisk/index.html"
      },
      {
        "name": "期交所：臺股期貨契約",
        "url": "https://www.taifex.com.tw/cht/2/tX"
      },
      {
        "name": "期交所：微型臺指期貨契約",
        "url": "https://www.taifex.com.tw/cht/2/tMF"
      },
      {
        "name": "期交所：小型臺指期貨契約",
        "url": "https://www.taifex.com.tw/cht/2/mTX"
      }
    ]
  },
  {
    "id": "stock-futures",
    "name": "股票期貨",
    "plain": "標的是個別股票的期貨，同樣用保證金，承擔整份契約的漲跌。",
    "how": "要開期貨戶和約定銀行戶，準備身分文件、簽契約和風險預告，還要過信用調查；公開頁面寫的 20歲 門檻跟現行法令有衝突，還沒查清楚，財力看審查結果。2026年 1口 普通型是 2,000股，小型是 100股；一般時段 8:45–13:45，到期日到 13:30；適用夜盤是 17:25–翌日5:00，保證金還沒查到。",
    "earn": "股價走的方向符合你的多空部位，就可能賺到價差。",
    "lose": "單一個股的風險，再加上槓桿，虧損可能超過保證金，還會欠錢。",
    "cost": "2026年股價類期貨的期交稅，買賣各按契約金額 0.002%；手續費另外談，上限和每口價格還沒查到，轉倉時還會再收一次費用和稅。",
    "level": "no",
    "tools": [],
    "sources": [
      {
        "name": "期交所：商品問答與稅率",
        "url": "https://www.taifex.com.tw/cht/9/tradersQAProducts"
      },
      {
        "name": "期交所：期貨開戶作業",
        "url": "https://www.taifex.com.tw/cht/4/openingTradingAccount"
      },
      {
        "name": "期交所：期貨交易風險",
        "url": "https://www.taifex.com.tw/file/taifex/event/cht/investmentRisk/index.html"
      },
      {
        "name": "期交所：股票期貨契約",
        "url": "https://www.taifex.com.tw/cht/2/sTF"
      }
    ]
  },
  {
    "id": "options",
    "name": "選擇權（臺指買方／賣方）",
    "plain": "買方付權利金，取得權利；賣方收權利金，但要背著履約的義務。",
    "how": "要開期貨戶和約定銀行戶，準備身分文件、簽契約和風險預告，還要過信用調查；公開頁面寫的 20歲 門檻跟現行法令有衝突，還沒查清楚，財力看審查結果。2026年至少 1口，買方要準備權利金，賣方要準備保證金；一般時段 8:45–13:45，夜盤 15:00–翌日5:00，到期日另有規則；賣方的額度還沒查到。",
    "earn": "買方賣出權利或履約，可能有收益；賣方扛了風險，可能留下淨權利金。",
    "lose": "只當買方的話，最多賠光權利金和費用；沒有避險的買權賣方，理論上虧損沒有上限，還可能欠錢。",
    "cost": "2026年權利金買賣各課 0.1% 期交稅；股價類選擇權到期現金結算，按契約金額收 0.002%；手續費看期貨商，上限還沒查到。",
    "level": "no",
    "tools": [],
    "sources": [
      {
        "name": "期交所：商品問答與稅率",
        "url": "https://www.taifex.com.tw/cht/9/tradersQAProducts"
      },
      {
        "name": "期交所：選擇權交易問答",
        "url": "https://www.taifex.com.tw/cht/9/optionsQA"
      },
      {
        "name": "期交所：期貨開戶作業",
        "url": "https://www.taifex.com.tw/cht/4/openingTradingAccount"
      },
      {
        "name": "期交所：期貨交易風險",
        "url": "https://www.taifex.com.tw/file/taifex/event/cht/investmentRisk/index.html"
      },
      {
        "name": "期交所：臺指選擇權契約",
        "url": "https://www.taifex.com.tw/cht/2/tXO"
      }
    ]
  },
  {
    "id": "convertible",
    "name": "可轉債（可轉換公司債；CBAS邊界）",
    "plain": "公司債附帶一個權利，可以依條款換成股票；它不是一定保本的股票替代品。",
    "how": "要有上櫃證券戶。2026年公司債交易單位面額是 10萬元，時間 9:00–13:30，實際付多少錢依報價折算。CBAS 是把可轉債拆開後的選擇權安排，個人資格和契約還沒查到，不要當成一般戶都能買。",
    "earn": "領利息（也可能是零息）、賺價差，或轉成股票再賣出。",
    "lose": "發行公司可能違約；提前贖回、轉股條款，還有不好成交，也都是風險；用高於面額的價格買進一樣會虧，最壞全賠。",
    "cost": "2026年查到公司債停徵到 2026-12-31；延到 2036-12-31 目前只是草案，有沒有生效還沒查到。手續費上限、轉股後的費用、利息扣繳也都還沒查到。",
    "level": "careful",
    "tools": [
      "cost",
      "dividend"
    ],
    "sources": [
      {
        "name": "櫃買中心：上櫃交易系統",
        "url": "https://www.tpex.org.tw/zh-tw/mainboard/trading/rules/system.html"
      },
      {
        "name": "櫃買中心：債券交易制度",
        "url": "https://www.tpex.org.tw/zh-tw/bond/service/introduction/tpex-bond.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "財政部：證券交易稅條例",
        "url": "https://law-out.mof.gov.tw/LawContent.aspx?id=FL006079&media=print"
      },
      {
        "name": "財政部：債券證交稅延長草案",
        "url": "https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=d2b1c46fef5242d8a822df113fc8e2fb"
      }
    ]
  },
  {
    "id": "bond",
    "name": "債券（公債／普通公司債，櫃買）",
    "plain": "把錢借給政府或公司，對方照債券條款付利息，到期還本金。",
    "how": "要向債券商開交易、款項和保管帳戶；公債買的管道不太一樣。2026年普通公司債是議價，面額 1萬元 起，時間 9:00–15:00；專業板的資格還沒查到，不是一般個人都能買。",
    "earn": "照約定收利息，折價買進等到期拿回面額，或賣出賺價差。",
    "lose": "發行人違約，本金和利息可能拿不回來；中途賣掉時，如果碰到升息，價格會跌；外幣債還有匯率風險。",
    "cost": "2026年查到政府公債不在證交稅範圍，公司債停徵到 2026-12-31；延到 2036-12-31 是草案，有沒有生效還沒查到。買賣價差、通路費的上限，以及個別的利息稅和健保，也都還沒查到。",
    "level": "careful",
    "tools": [
      "fx"
    ],
    "sources": [
      {
        "name": "櫃買中心：債券交易制度",
        "url": "https://www.tpex.org.tw/zh-tw/bond/service/introduction/tpex-bond.html"
      },
      {
        "name": "櫃買中心：公司債與金融債",
        "url": "https://www.tpex.org.tw/zh-tw/bond/service/introduction/co-bond.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "財政部：證券交易稅條例",
        "url": "https://law-out.mof.gov.tw/LawContent.aspx?id=FL006079&media=print"
      },
      {
        "name": "財政部：債券證交稅延長草案",
        "url": "https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=d2b1c46fef5242d8a822df113fc8e2fb"
      }
    ]
  },
  {
    "id": "fund",
    "name": "共同基金（含定期定額）",
    "plain": "你把錢交給基金，由基金依投資策略分散持有各種資產。",
    "how": "向投信、銀行或合法平台開戶，做風險評估，並約定扣款；最低金額和截止時間每檔基金、每個通路都不同，統一的數字還沒查到。申購和買回按基金淨值算，不是像股票一樣盤中掛價交易。",
    "earn": "靠淨值上升或領配息，要把本金的變化和費用一起算進去。",
    "lose": "市場、信用、匯率，或不好變現，都可能讓你虧；配息可能包含本金，不保本。",
    "cost": "2026年公會問答說：管理費和保管費已經扣在淨值裡，另外有申購費和買回費；上限和最低金額要逐檔查，配息的稅和健保看配息來源，個別數字還沒查到。",
    "level": "careful",
    "tools": [
      "dca",
      "dividend",
      "fx"
    ],
    "sources": [
      {
        "name": "投信投顧公會：投資人問答",
        "url": "https://www.sitca.org.tw/ROC/Protect/PT6001.aspx?PGMID=PT"
      },
      {
        "name": "證交所：收益平準金",
        "url": "https://www.twse.com.tw/zh/ETFortune/invest/8a8216d697fc438f019918a1dbdc04bb"
      }
    ]
  },
  {
    "id": "overseas",
    "name": "複委託（海外股票交易管道）",
    "plain": "複委託就是透過台灣的券商，委託海外券商幫你買股票的管道。",
    "how": "要開複委託戶，簽海外風險預告和稅務文件，約定交割帳戶；買賣的股數門檻和時間看市場和通路，各市場現行數字還沒查到，不能套台股的交易時段。",
    "earn": "海外股價上漲、領股息，再加上換回台幣時的匯率變化。",
    "lose": "公司倒閉可能全賠，還有匯率、海外規定和不好成交的風險。",
    "cost": "2026年的佣金、最低手續費和上限，要看各市場，還沒查到；另外還有換匯價差、匯款和保管費，以及當地稅和股息扣繳，各國稅籍不同。台灣海外所得最低稅負的門檻還沒查到，不要套台股的稅率。",
    "level": "careful",
    "tools": [
      "cost",
      "dividend",
      "fx"
    ],
    "sources": [
      {
        "name": "國泰證券：海外交易問答",
        "url": "https://www.cathaysec.com.tw/exclude_al/hk_eal/hk_faq.html"
      },
      {
        "name": "中信銀行：TDR問答",
        "url": "https://ecorp.ctbcbank.com/cts/tdr/tdrAction.do?lang=zh&method=faq"
      }
    ]
  },
  {
    "id": "tdr",
    "name": "TDR（臺灣存託憑證）",
    "plain": "在台灣買一張憑證，代表海外公司的原股。",
    "how": "一般證券戶就能買，依券商要求簽外國證券的風險文件。2026年整張 1,000單位，零股另依規則，時間 9:00–13:30。",
    "earn": "憑證價格上漲，或原公司的股利，透過存託機構分給你。",
    "lose": "原公司的風險、匯率、流通數量少，還有憑證價格偏離原股，都可能讓你把本金全賠掉。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2025年官方指南是向賣方課 0.1% 的稅；其他頁面沒講清楚是買方還是賣方，以官方說法為準。股利算海外所得，適用的費用和稅還沒查到。",
    "level": "no",
    "tools": [
      "cost",
      "fx"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：商品風險提示",
        "url": "https://investoredu.twse.com.tw/pages/twse_investmentrisk1_6.aspx"
      },
      {
        "name": "中信銀行：TDR問答",
        "url": "https://ecorp.ctbcbank.com/cts/tdr/tdrAction.do?lang=zh&method=faq"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  },
  {
    "id": "reit",
    "name": "REITs（國內不動產投資信託）",
    "plain": "買的是不動產信託的受益權，間接分到租金等收益，不是登記買下一間房子。",
    "how": "一般證券戶就能買上市櫃的受益證券。2026年交易單位 1,000單位，零股依規則，一般時間 9:00–13:30。",
    "earn": "領信託分配的收益，或等受益證券漲價後賣出。",
    "lose": "租金變少、空置、房價下跌、費用，或不好成交，都可能虧，投入的本金可能賠掉。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2026年查到免證交稅；信託利益按利息所得扣繳、分開課稅，實際稅率和健保是否免扣還沒查到，不能套股票股利的規則。",
    "level": "careful",
    "tools": [
      "dividend"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "金管會：不動產證券化條例",
        "url": "https://law.fsc.gov.tw/LawContent.aspx?id=FL025615"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  },
  {
    "id": "lending",
    "name": "借券出借（個人交割需求出借）",
    "plain": "把手上的股票暫時借出去，被借走時，你可能收到借券費。",
    "how": "要已經有證券戶和集保戶，向券商申請；整股和零股依系統設定。2026年官方問答說：沒賣出、而且同意出借的股票，收盤後可能被借走，下一個營業日開盤前會還回來。",
    "earn": "股票真的被借出去才有借券費，不一定借得出去；這裡講的是個人為了交割需求的出借，不是法人的長期借券。",
    "lose": "原本的股票下跌你一樣會虧，還有借入方能不能履約、權息補償的風險；有擔保不等於保本。",
    "cost": "2026年問答：手續費在出借收益的 10% 以內，單筆借券費超過 20,000元 會代扣 10%，這不是最後的所得稅；權息補償算其他所得，不能跟長期出借的年化費率混在一起用。",
    "level": "careful",
    "tools": [],
    "sources": [
      {
        "name": "證交所：個人交割借券出借問答",
        "url": "https://investoredu.twse.com.tw/Pages/TWSE_InvestmentQA.aspx?ID=9"
      }
    ]
  },
  {
    "id": "day-trade",
    "name": "當沖（現股當沖，交易方式）",
    "plain": "同一天買進再賣出（或賣出再買進）同一檔證券互相沖抵，這是一種交易方法，不是另一種商品。",
    "how": "只限合格標的，證券戶要開滿 3個月 而且近 1年 有 10筆 交易，信用戶等情況有例外；要簽授權和風險預告，額度依券商風控。2026年一般時間 9:00–13:30，零股不能直接當當沖。",
    "earn": "先買後賣，賺漲價；或先賣後買，賺跌價，賺的都是當天的價差。",
    "lose": "買不回來或賣不出去時，可能要借券、付標購成本，甚至違約；先賣後買的虧損，可能超過你原本的預算。",
    "cost": "2026年上市手續費率由券商訂，超過 0.1425% 要先通知，不是上限；上櫃上限還沒查到。2025年指南：股票的現股當沖，賣出稅是 0.15%，到 2027-12-31 為止；不是股票或不符條件的不能套用。交易越頻繁，手續費和價差付得越多。",
    "level": "no",
    "tools": [
      "cost"
    ],
    "sources": [
      {
        "name": "證交所：集中市場交易制度",
        "url": "https://www.twse.com.tw/zh/products/system/trading.html"
      },
      {
        "name": "證交所：臺灣投資指南2025",
        "url": "https://www.twse.com.tw/zh/about/company/guide.html"
      },
      {
        "name": "證交所：當沖風險與資格",
        "url": "https://investoredu.twse.com.tw/pages/TWSE_InvestmentRisk7_2.aspx"
      },
      {
        "name": "證交所：營業細則手續費",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94"
      }
    ]
  }
];

export const WAYS = [
  {
    "name": "價差（資本利得）",
    "plain": "賣得比買得貴，再扣掉所有費用，剩下的才是真的賺到。",
    "products": "股票、ETF、ETN、債券、基金、權證、期貨等。",
    "cost": "2025年指南說，國內一般個人買賣上市證券的所得停徵所得稅，但交易稅還是要繳；海外和未上市的不能直接套用。"
  },
  {
    "name": "股利（現金股利／股票股利）",
    "plain": "公司把現金或股票分給股東；你的現金或股數變多，不代表你的總財富一定變多。",
    "products": "股票；TDR要看原股及存託契約。",
    "cost": "2025年指南：居民可以選合併計稅抵減 8.5%、每戶上限 8萬元，或選 28% 分開計稅；健保從2021年起是 2.11%，起扣點和免扣對象還沒查到，海外股利另外看。"
  },
  {
    "name": "利息（債券／存款）",
    "plain": "把錢借給發行人，或放在銀行，照約定收利息。",
    "products": "公債、公司債、存款；REIT信託利益依法按利息所得。",
    "cost": "2026年利息要繳所得稅還是分開課稅，會有差別，數字還沒查到；健保 2.11% 不是每種利息都要扣，門檻還沒查到。"
  },
  {
    "name": "借券費收入",
    "plain": "股票真的被借走，才有借券費，不是掛著就有收入。",
    "products": "持股參加個人交割需求出借。",
    "cost": "2026年問答把它列為租賃收入，單筆超過 20,000元 會代扣 10%，不是最後的稅額；手續費最多可以到收益的 10%。"
  },
  {
    "name": "權利金（賣方）",
    "plain": "賣出選擇權收到一筆錢，但對方要行使權利時，你有義務履約。",
    "products": "選擇權賣方；賣掉自己已有的權證只是出售資產。",
    "cost": "2026年權利金買賣各課 0.1% 期交稅，另外還有手續費；之後買回、結算和履約付出的錢，可能比當初收進來的多很多。"
  },
  {
    "name": "匯差",
    "plain": "同一筆外幣換回台幣時，匯率變了，你可能多拿，也可能少拿。",
    "products": "海外股票、外幣基金、債券、海外資產ETF。",
    "cost": "2026年換匯的買賣價差和費用，看通路而不同；海外所得合計和稅負的門檻還沒查到，所以這裡不填固定的百分比。"
  },
  {
    "name": "基金配息／收益平準金",
    "plain": "配息是把基金資產裡的現金分給你；收益平準金是用來調整新買進的人，對原持有人可分配收益的影響，不會多創造任何收益。",
    "products": "有配息政策的共同基金及ETF。",
    "cost": "2026年依股利、利息或海外等實際組成來課稅；不要把配息率直接當成總報酬。"
  }
];

export const PRODUCT_LIMITS = [
  "這頁依「難易度」分三層，看新手弄不弄得懂；依「風險」分的三桶（保守穩健／成長／積極）在 ㉗ 投資屬性是什麼。同一個商品在兩邊的位置可能不一樣，例如個股在這裡是「先弄懂再碰」，在三桶裡屬於積極桶。",
  "新手等級是根據複雜度和最壞會虧多少整理出來的，不是主管機關的評等，也不是針對你個人的投資建議。",
  "稅務以台灣稅務居民的個人為主；來源的年份，不代表 2026 年的法令都已經核對過。時間都是台灣一般營業日的時間，休市和商品公告優先。",
  "「待查」代表證據不夠；期貨、選擇權、權證和海外商品，不能直接套台股工具的參數；CBAS 的資格和契約還沒查到，REIT 也要另外設信託的稅別。"
];

export const PRODUCT_REFS = [
  {
    "name": "證交所：集中市場交易制度",
    "url": "https://www.twse.com.tw/zh/products/system/trading.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：臺灣投資指南2025",
    "url": "https://www.twse.com.tw/zh/about/company/guide.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "櫃買中心：上櫃交易系統",
    "url": "https://www.tpex.org.tw/zh-tw/mainboard/trading/rules/system.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：營業細則手續費",
    "url": "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL007304&FLNO=94",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "健保署：補充保費試算說明",
    "url": "https://cloudicweb.nhi.gov.tw/esrv/trialbill/countinsurance.aspx",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "櫃買中心：興櫃交易制度",
    "url": "https://www.tpex.org.tw/zh-tw/esb/trading/rules/overview.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "櫃買中心：常見問題",
    "url": "https://www.tpex.org.tw/zh-tw/about/company/faq.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：ETF總覽",
    "url": "https://www.twse.com.tw/zh/products/securities/etf/overview/introduction.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：商品風險提示",
    "url": "https://investoredu.twse.com.tw/pages/twse_investmentrisk1_6.aspx",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "財政部：證券交易稅條例",
    "url": "https://law-out.mof.gov.tw/LawContent.aspx?id=FL006079&media=print",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "財政部：債券證交稅延長草案",
    "url": "https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=d2b1c46fef5242d8a822df113fc8e2fb",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：槓反適格性問答",
    "url": "https://investoredu.twse.com.tw/pages/TWSE_InvestmentQA.aspx?ID=11&Page=3",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "櫃買中心：ETN商品概述",
    "url": "https://www.tpex.org.tw/zh-tw/product/etn/overview/introduction.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：權證教育問答",
    "url": "https://www.twse.com.tw/zh/products/securities/warrant/educate/qa.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：商品問答與稅率",
    "url": "https://www.taifex.com.tw/cht/9/tradersQAProducts",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：期貨開戶作業",
    "url": "https://www.taifex.com.tw/cht/4/openingTradingAccount",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：期貨交易風險",
    "url": "https://www.taifex.com.tw/file/taifex/event/cht/investmentRisk/index.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：臺股期貨契約",
    "url": "https://www.taifex.com.tw/cht/2/tX",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：微型臺指期貨契約",
    "url": "https://www.taifex.com.tw/cht/2/tMF",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：小型臺指期貨契約",
    "url": "https://www.taifex.com.tw/cht/2/mTX",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：股票期貨契約",
    "url": "https://www.taifex.com.tw/cht/2/sTF",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：選擇權交易問答",
    "url": "https://www.taifex.com.tw/cht/9/optionsQA",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "期交所：臺指選擇權契約",
    "url": "https://www.taifex.com.tw/cht/2/tXO",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "櫃買中心：債券交易制度",
    "url": "https://www.tpex.org.tw/zh-tw/bond/service/introduction/tpex-bond.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "櫃買中心：公司債與金融債",
    "url": "https://www.tpex.org.tw/zh-tw/bond/service/introduction/co-bond.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "投信投顧公會：投資人問答",
    "url": "https://www.sitca.org.tw/ROC/Protect/PT6001.aspx?PGMID=PT",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：收益平準金",
    "url": "https://www.twse.com.tw/zh/ETFortune/invest/8a8216d697fc438f019918a1dbdc04bb",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "國泰證券：海外交易問答",
    "url": "https://www.cathaysec.com.tw/exclude_al/hk_eal/hk_faq.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "中信銀行：TDR問答",
    "url": "https://ecorp.ctbcbank.com/cts/tdr/tdrAction.do?lang=zh&method=faq",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "金管會：不動產證券化條例",
    "url": "https://law.fsc.gov.tw/LawContent.aspx?id=FL025615",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：個人交割借券出借問答",
    "url": "https://investoredu.twse.com.tw/Pages/TWSE_InvestmentQA.aspx?ID=9",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：當沖風險與資格",
    "url": "https://investoredu.twse.com.tw/pages/TWSE_InvestmentRisk7_2.aspx",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "財政部：所得稅法",
    "url": "https://law-out.mof.gov.tw/LawContent.aspx?id=FL005935",
    "note": "查閱 2026-11-09"
  }
];

// 指定提示的完整圖中文字，供螢幕閱讀器使用。
export const FIGURE_TEXT = {
  "comic": "錢是怎麼賺來的。價差。買進。賣出。低買高賣，賺中間的差。股利。公司賺錢，分一部分給股東。利息。債券。把錢借給別人，對方付利息。每種賺法都有虧法。價差：可能買在高點。股利：除息後股價會變低。利息：對方可能還不出來。先知道怎麼虧，再決定買不買。以上只是說明，不是投資建議。",
  "map": "新手從哪裡開始？可以從這裡開始。零股。國內股票原型 ETF。先弄懂再碰。個股整張。海外股票 ETF。債券 ETF。債券。可轉債。基金。複委託。REITs。借券出借。新手不建議。興櫃。槓桿／反向 ETF。ETN。權證。期貨。股票期貨。選擇權。TDR。當沖。先從下面這層練習。越往上，越難懂，也可能虧更多。這是依複雜度和最壞損失的整理，不是主管機關的評等。"
};
