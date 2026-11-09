// ㉒ 商品與賺錢方式，來源 docs/research/R5-商品與獲利方式.md（Codex 依研究報告改寫，2026-11-09）。
export const LEVELS = [
  {
    "id": "ok",
    "title": "可以從這裡開始",
    "line": "可用小額理解零股和分散的國內股票原型ETF；仍可能虧錢，要先看費用及持有內容。"
  },
  {
    "id": "careful",
    "title": "先弄懂再碰",
    "line": "先理解個股、匯率、債券、信託和基金策略的差異，再看交割、費用與最壞損失。"
  },
  {
    "id": "no",
    "title": "新手不建議",
    "line": "可能牽涉期限、槓桿、信用或複雜交易規則；有些損失會超過起初投入的保證金。"
  }
];

export const PRODUCTS = [
  {
    "id": "stock",
    "name": "上市櫃股票（整股）",
    "plain": "買一家公司的股東權益，也就是持有公司的一小部分。",
    "how": "開證券戶、集保及交割銀行戶；2026年一般1,000股一張，9:00–13:30交易。",
    "earn": "股價漲後賣出，或領公司發的現金及股票股利。",
    "lose": "公司倒閉或下市時可能全損；自有資金買現股，最多損失投入本金及費用。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025指南賣出稅0.3%；股利稅見賺錢方式，健保2021起2.11%，門檻及豁免待查。",
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
    "plain": "用少於一張的股數買同一家公司，不是另一種股票。",
    "how": "同現股戶，1至999股；2026年盤中9:00–13:30，9:10首撮後每5秒；盤後13:40–14:30，截止後撮合。限價當日有效，未成交不自動移單。",
    "earn": "和整股一樣，靠股價上漲或股利，但股數較少。",
    "lose": "股價下跌可損失全部本金，買賣價差和成交難度不一定與整股相同。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025指南賣出稅0.3%；股利稅見賺錢方式，健保2021起2.11%，門檻及豁免待查。小額留意低消。",
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
    "plain": "透過推薦券商議價，買還沒上市櫃的股票。",
    "how": "有櫃檯買賣證券戶，另簽興櫃風險預告；2026年1股起，9:00–15:00。無一般漲跌幅限制，仍有申報範圍和暫停交易規則。",
    "earn": "企業成長可能帶動報價及股利，但不一定能上市櫃。",
    "lose": "可能賣不到期待價格，或因公司倒閉損失全部本金。",
    "cost": "2026年手續費及上限待查；2025指南股票賣出稅0.3%，股利依居民身分處理，健保適用待查。",
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
    "plain": "在交易所買一份持有一籃子國內股票的基金。",
    "how": "開證券戶；2026年一般1,000單位，零股1單位起；普通交易9:00–13:30，零股另依時段。個別風險文件看券商要求。",
    "earn": "基金價格上漲或配息；要把兩者合計看總報酬。",
    "lose": "持股下跌、集中或清算，可能虧大部分甚至全部投入，不保本。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025指南賣出稅0.1%；經理及保管費從資產扣，逐檔確認；配息稅與健保看組成，個別金額待查。",
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
    "plain": "在台灣買基金單位，基金持有的是海外資產。",
    "how": "同一般ETF；2026年1,000單位或零股1單位，普通9:00–13:30，零股另依時段；海外休市仍須留意估價。",
    "earn": "海外股價上漲、配息或外幣升值可能帶來收益。",
    "lose": "海外股價、匯率和買賣價差可能一起造成損失，最壞全損。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025指南賣出稅0.1%；另有基金內扣和海外稅負，個別稅率待查。",
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
    "plain": "基金持有多筆債券，你買的是基金單位，不是直接持有一張債券。",
    "how": "同一般ETF帳戶；2026年整單1,000單位，零股1單位，普通交易9:00–13:30。",
    "earn": "債息反映在配息或淨值，利率變動也會影響價格。",
    "lose": "升息、發行人違約或匯率變化會虧損；沒有保證讓你到期領回面額的日期。",
    "cost": "2026上市費率自訂，逾0.1425%先通知，非上限；上櫃上限待查。合格債券ETF停徵至2026-12-31，槓反不適用；延至2036草案生效待查，主動式不先套優惠。內扣與配息稅、健保依組成。",
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
    "plain": "追求單日指數倍數或反向表現，不是整段期間固定倍數的基金。",
    "how": "開證券戶並簽風險預告；2026查問答，信用戶、近一年權證10筆、期貨10筆或已有槓反買進紀錄符合其一。整單1,000或零股1單位，普通9:00–13:30。",
    "earn": "單日方向符合目標時可能賺錢；放多天會受每天漲跌路徑影響。",
    "lose": "方向看對仍可能因路徑不利而虧損，最壞全損；借錢買另有個人債務風險。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025指南一般ETF賣出稅0.1%；2026現行法槓反債券ETF不適用停徵，內扣和轉倉成本逐檔看。",
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
    "plain": "發行券商承諾按指數表現支付的債務證券，不是直接持有一籃子資產。",
    "how": "證券戶另簽ETN風險預告，槓反另有資格；2026年一般1,000單位，零股依規則，9:00–13:30。向發行人申購買回的最低量看說明書。",
    "earn": "賺取與指數連動的價格差，屆期支付看條款。",
    "lose": "指數下跌、發行人違約或提前贖回都可能造成全損。",
    "cost": "2026櫃買ETN手續費上限0.1425%，不是上市通知制；賣出稅0.1%，賣回及發行人贖回不課。其他費用看說明書。",
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
    "plain": "付權利金，也就是取得買進或賣出標的權利的費用。",
    "how": "證券戶初次交易先簽權證風險預告；2026年一般1,000單位、零股依規則，9:00–13:30。統一財力或經驗門檻待查，不能套槓反ETF資格。",
    "earn": "認購通常受惠上漲，認售通常受惠下跌，靠售出價差或履約價值賺錢。",
    "lose": "時間過去、波動變化或方向錯誤都可能虧，看對方向也可能虧，到期可歸零。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2026官方問答賣出稅0.1%；履約費稅依給付方式，個別數字待查，工具不能代算履約。",
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
    "plain": "繳一筆保證金，承擔整份指數契約漲跌，損失不只限保證金。",
    "how": "開期貨戶及約定銀行戶，備身分、契約、風險預告及信用調查；公開頁20歲門檻與現行法令衝突待查，財力依審查。至少1口；2026一般8:45–13:45、夜盤15:00–翌日5:00，到期日另依規則；當日保證金待查。",
    "earn": "做多時指數上漲、做空時指數下跌，可能賺取契約價差。",
    "lose": "每天結算可能被追繳或強制平倉；跳空時損失可超過原保證金並欠錢。",
    "cost": "2026股價類期交稅買賣雙方各按契約金額0.002%；另付議定手續費，上限及每口價格待查。",
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
    "plain": "以個別股票為標的的期貨，也是用保證金承擔全份契約漲跌。",
    "how": "開期貨戶及約定銀行戶，備身分、契約、風險預告及信用調查；公開頁20歲門檻與現行法令衝突待查，財力依審查。2026年1口普通2,000股、小型100股；一般8:45–13:45，到期至13:30；適用夜盤17:25–翌日5:00，保證金待查。",
    "earn": "股價變動方向符合多空部位，就可能賺取價差。",
    "lose": "集中個股風險再加槓桿，虧損可以超過保證金並欠款。",
    "cost": "2026股價類期交稅買賣各按契約金額0.002%；手續費議定，上限和每口價格待查，轉倉也再收費稅。",
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
    "plain": "買方付權利金取得權利；賣方收權利金，同時背負履約義務。",
    "how": "開期貨戶及約定銀行戶，備身分、契約、風險預告及信用調查；公開頁20歲門檻與現行法令衝突待查，財力依審查。2026至少1口，買方備權利金、賣方備保證金；一般8:45–13:45、夜盤15:00–翌日5:00，到期日另依規則；賣方額度待查。",
    "earn": "買方賣出權利或履約取得收益；賣方承擔風險後，可能保留淨權利金。",
    "lose": "單純買方可虧光權利金及費用；未避險的買權賣方理論損失無上限，可能欠款。",
    "cost": "2026權利金買賣各課0.1%期交稅，股價類到期現金結算按契約金額0.002%；手續費依期貨商，上限待查。",
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
    "plain": "公司債附帶按條款換成股票的權利，不是一定保本的股票替代品。",
    "how": "上櫃證券戶；2026年公司債交易單位面額10萬元，9:00–13:30，實付依報價折算。CBAS是拆解後的選擇權安排，個人資格及契約待查，不視為一般戶都可買。",
    "earn": "領利息（可能零息）、賺價差，或轉成股票後賣出。",
    "lose": "發行人可能違約；提前贖回、轉股條款及難以成交也有風險，高於面額買入仍可虧，最壞全損。",
    "cost": "2026查公司債停徵至2026-12-31，延至2036-12-31僅草案、生效待查；手續費上限、轉股後費用及利息扣繳待查。",
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
    "plain": "把錢借給政府或公司，對方按債券條款付息並還本金。",
    "how": "向債券商開交易、款項及保管帳戶；公債看管道。2026年普通公司債議價面額1萬元起，9:00–15:00；專業板資格待查，不是一般個人都可買。",
    "earn": "依約收息、折價買進後到期償還，或賣出價差。",
    "lose": "發行人違約可能不還本息；提前賣時升息會虧價，外幣債另有匯率風險。",
    "cost": "2026查政府公債不屬證交稅範圍，公司債停徵至2026-12-31；延至2036-12-31為草案、生效待查。買賣價差、通路費上限及個別利息稅、健保待查。",
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
    "plain": "把資金交給基金依投資策略分散持有資產。",
    "how": "向投信、銀行或合法平台開戶，完成風險評估及扣款約定；最低額與截止時間逐檔逐通路，統一數字待查。依基金淨值申購買回，不是盤中掛價交易。",
    "earn": "靠淨值上升或配息，要合計本金變化與費用。",
    "lose": "市場、信用、匯率或難以變現都會造成虧損；配息可能包含本金，不保本。",
    "cost": "2026公會問答：管理保管費已扣在淨值中，另有申購、買回費；上限與最低額逐檔待查，配息稅與健保依來源，個別數字待查。",
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
    "plain": "複委託是透過台灣券商委託海外券商買股票的管道。",
    "how": "開複委託戶，簽海外風險預告與稅務文件，約定交割帳戶；股數門檻和時間依市場及通路，各市場現行數字待查，不能套台股時段。",
    "earn": "海外股價上漲、股息與換回台幣時的匯率變化。",
    "lose": "公司倒閉可能全損，另有匯率、海外規定及成交困難的風險。",
    "cost": "2026佣金、低消與上限依市場待查；另有換匯價差、匯款保管及當地稅、股息扣繳，依國別稅籍不同。台灣海外所得最低稅負門檻待查，勿套台股稅率。",
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
    "plain": "在台灣買一張代表海外公司原股的憑證。",
    "how": "一般證券戶，依券商簽外國證券風險文件；2026年整單1,000單位，零股另依規則，9:00–13:30。",
    "earn": "憑證價格上漲，或原公司股利經存託機構分配。",
    "lose": "原公司、匯率、流通數量及偏離原股價格的風險，可損失全部本金。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025官方指南採賣方課稅0.1%；其他頁未清楚區分買賣方，依官方口徑。股利屬海外所得，適用費稅待查。",
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
    "plain": "買不動產信託的受益權，間接參與租金等收益，不是登記買下一間房。",
    "how": "一般證券戶買上市櫃受益證券；2026年交易單位1,000單位、零股依規則，一般9:00–13:30。",
    "earn": "領信託分配收益，或受益證券漲價後賣出。",
    "lose": "租金減少、空置、房價下跌、費用與難以成交都可能虧損，可損失投入本金。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2026查免證交稅；信託利益按利息所得扣繳、分開課稅，實際稅率及健保豁免待查，不能套股票股利規則。",
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
    "plain": "把已有的股票暫借出去，被借到時可能收到借券費。",
    "how": "已有證券及集保戶，向券商申請；整股零股依系統設定。2026官方問答：未賣出且同意出借的股票，收盤後可能被借，次營業日開盤前還。",
    "earn": "實際借出才收借券費，不一定成交；這裡是個人交割需求出借，不是法人長期借券。",
    "lose": "原股票下跌仍會虧，另有借入方履約及權息補償風險，擔保不等於保本。",
    "cost": "2026問答：手續費在出借收益10%內，單筆借券費超過20,000元代扣10%，不是最終所得稅；權息補償屬其他所得，不能混用長期出借年化費率。",
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
    "plain": "同一天買賣相同證券沖抵，是交易方法，不是另一種商品。",
    "how": "限合格標的，證券戶滿3個月且近1年10筆，或信用戶等例外；簽授權及風險預告，額度依風控。2026一般9:00–13:30，零股不能直接當當沖。",
    "earn": "先買後賣漲價，或先賣後買跌價，賺當日價差。",
    "lose": "不能買回或賣出，可能要借券、負擔標購成本或違約；先賣後買損失可超過原預算。",
    "cost": "2026上市費率由券商訂，逾0.1425%須先通知，非上限；上櫃上限待查。2025指南股票現股當沖賣出稅0.15%至2027-12-31；非股票及不符條件不能套。交易愈頻繁，手續費與價差愈多。",
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
    "plain": "賣得比買得貴，還要扣掉全部費用，剩下才是賺的。",
    "products": "股票、ETF、ETN、債券、基金、權證、期貨等。",
    "cost": "2025指南列國內一般個人上市證券交易所得停徵，但仍有交易稅；海外與未上市不能直接套。"
  },
  {
    "name": "股利（現金股利／股票股利）",
    "plain": "公司把現金或股票分給股東；現金或股數增加，不等於總財富一定增加。",
    "products": "股票；TDR要看原股及存託契約。",
    "cost": "2025指南：居民可合併抵減8.5%、每戶上限8萬元，或28%分開；健保2021起2.11%，起扣及豁免待查，海外股利另看。"
  },
  {
    "name": "利息（債券／存款）",
    "plain": "把錢借給發行人或放銀行，按約定收利息。",
    "products": "公債、公司債、存款；REIT信託利益依法按利息所得。",
    "cost": "2026年利息有所得稅或分開課稅差異，數字待查；健保2.11%不是所有利息都課，門檻待查。"
  },
  {
    "name": "借券費收入",
    "plain": "股票實際被借走，才會收到借用費，不是掛著就有收入。",
    "products": "持股參加個人交割需求出借。",
    "cost": "2026問答列租賃收入，單筆超過20,000元代扣10%，非最後稅額；手續費可至收益10%。"
  },
  {
    "name": "權利金（賣方）",
    "plain": "賣出選擇權收到費用，同時承擔對方行使權利時須履約的義務。",
    "products": "選擇權賣方；賣掉自己已有的權證只是出售資產。",
    "cost": "2026權利金買賣各課0.1%期交稅，另有手續費；買回、結算及履約的支出可能遠大於收進的錢。"
  },
  {
    "name": "匯差",
    "plain": "同一筆外幣換回台幣，匯率變了，就可能多拿或少拿。",
    "products": "海外股票、外幣基金、債券、海外資產ETF。",
    "cost": "2026年換匯買賣價差及費用依通路而變；海外所得合計及稅負門檻待查，不固定填百分比。"
  },
  {
    "name": "基金配息／收益平準金",
    "plain": "配息是把資產中的現金分出來；收益平準金調整新申購對原受益人分配權益的影響，不會額外創造收益。",
    "products": "有配息政策的共同基金及ETF。",
    "cost": "2026年依股利、利息或海外等實際組成課稅；不能把配息率直接當成總報酬。"
  }
];

export const PRODUCT_LIMITS = [
  "新手等級是依複雜度與最壞損失的研究整理，不是主管機關評等，也不是個別投資建議。",
  "稅務以台灣稅務居民個人為主；來源年份不代表已核對所有2026法令。時刻是台灣一般營業日，休市與商品公告優先。",
  "待查代表證據不足；期貨、選擇權、權證和海外商品不能直接套台股工具參數，CBAS資格與契約待查，REIT也須另設信託稅別。"
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
