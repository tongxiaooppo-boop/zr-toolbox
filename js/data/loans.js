// ㉑ 借錢投資的管道，來源 docs/research/R4-個人借錢管道.md（Codex 依研究報告改寫，2026-11-09）。
export const LOAN_GROUPS = [
  {
    "id": "stock",
    "title": "押股票",
    "line": "拿股票等帳戶裡的資產去借錢。價格一跌可能要你補擔保品；基金、債券、黃金現貨的算法不一樣，要另外看。"
  },
  {
    "id": "asset",
    "title": "押房子、保單、車、定存",
    "line": "不會因為股價每天被追著補錢，但還不出來時，抵押的東西可能被拿去賣，保單也可能失效。"
  },
  {
    "id": "none",
    "title": "什麼都不押",
    "line": "通常不用抵押股票或房子；但要照約定還錢，晚繳會傷信用。"
  },
  {
    "id": "other",
    "title": "其他（政府專案、親友、當舖與民間）",
    "line": "政府方案要看你符不符合對象、用途對不對；親友的錢一樣要還；當舖和民間借貸只拿來當最壞例子，不建議。"
  }
];

export const LOANS = [
  {
    "id": "bank-pledge",
    "name": "股票質借（銀行）",
    "group": "stock",
    "main": true,
    "who": "銀行",
    "how": "拿銀行接受的上市櫃股票當擔保，要準備身分和信用審查的資料；ETF 收不收，還要查。",
    "rate": "舉例：永豐公告年利率 3.41% 起，每筆收費 15,000 元，公告基準日 2026-01-21，查詢日 2026-11-09；最高利率還沒查到。",
    "amount": "看你的股票和個人信用來核定；能借幾成，公開資料沒查到。",
    "term": "利率會浮動；期限、繳息及續借看契約。",
    "call": "擔保品不夠可能被叫你補；銀行的比率、給你幾天補、什麼情況會被賣，還沒查到，別拿券商的數字來套。",
    "worst": "股票被賣掉還不夠還，差的部分你還是要還。",
    "forStock": "要看契約有沒有限制；公開頁只寫資金調度，沒確認能不能拿去買股票。",
    "tools": [
      "pledge",
      "lifelev"
    ],
    "sources": [
      {
        "name": "永豐銀行：股票貸款",
        "url": "https://bank.sinopac.com/sinopacBT/personal/loan/other-personal-loan/stock.html"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "broker-loan",
    "name": "不限用途款項借貸（證券商）",
    "group": "stock",
    "main": true,
    "who": "證券商",
    "how": "要開證券戶和借貸戶、簽約、準備財力證明，再把合格的擔保品轉進去。",
    "rate": "舉例：元大 2026-10-21 公告年利率 6.25%，查詢日 2026-11-09；合庫的手續費單位怪怪的，還沒查清楚。",
    "amount": "依規定，股票最多借前一天收盤價的 60%，非信用交易標的是 40%；券商可以訂得更嚴。",
    "term": "原6個月，可審核展延2次；公開例最長18個月，按日計息。",
    "call": "整戶維持率低於 130% 會通知你，要在 2 個營業日內補到高於 166%；沒補、還是不夠，第 3 個營業日起券商可以賣你的擔保品。回到 130% 以上只是先不賣，要到 166% 以上，或補足通知上寫的差額，才算解除；契約另有約定的，要再核對。",
    "worst": "擔保品賣掉還不夠還，差額你繼續欠。",
    "forStock": "可以，這項業務不限制錢的用途；不過還是要看契約、標的和法規。",
    "tools": [
      "pledge",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "元大證券：股票借貸與債券擔保品",
        "url": "https://www.yuanta.com.tw/file-repository/content/t0/dist/index.html"
      },
      {
        "name": "合作金庫證券：不限輕鬆貸",
        "url": "https://luckydraw.tcfhc-sec.com.tw/websites/loan/index.html"
      },
      {
        "name": "證交所：不限用途借貸操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl080086"
      }
    ]
  },
  {
    "id": "finance-pledge",
    "name": "股票擔保借款（證金公司）",
    "group": "stock",
    "main": false,
    "who": "證券金融公司",
    "how": "用股票當擔保，帶兩種身分證件開借款戶；每一筆都審核過才撥款。",
    "rate": "還沒查到：公開介紹裡找不到能核對的現行年利率。",
    "amount": "開戶時寫的 100 萬元只是參考額度，實際能撥多少另外審。",
    "term": "還本金時結算利息，可申請續借；原期限待查。",
    "call": "會盯擔保品的價值；股票借款多少會被叫補、多少會被賣，數字還沒查到，別套券商的規則。",
    "worst": "擔保品被賣掉後可能還欠錢，也可能不能再續借。",
    "forStock": "要看契約有沒有限制；確定個人可以申請，用途的完整條款還沒查到。",
    "tools": [
      "pledge",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證金：股票借款",
        "url": "https://www.yuantafinance.com.tw/brief/index.html"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "margin",
    "name": "融資",
    "group": "stock",
    "main": true,
    "who": "證券商或證券金融公司",
    "how": "要符合信用交易資格，開信用戶，準備財力證明和自備款；買進的合格證券就是擔保品。",
    "rate": "舉例：元大公告年利率 6.25%，查詢日 2026-11-09；每家券商不一樣，不是全市場統一的利率。",
    "amount": "看你個人的核定；現在最高能借幾成還沒查到，不沿用舊工具裡的數字。",
    "term": "原6個月，可審核展延2次、每次6個月；到期還錢或賣股償還。",
    "call": "整戶維持率低於 130%，通知送到後 2 個營業日內要補差額；時間到還是不夠，隔一個營業日券商就會賣。回到 130% 以上只是先不賣，要到 166% 以上，或補足通知上的差額，才取消追繳。",
    "worst": "跌停時可能賣不掉；被賣掉後虧損就成真了，不夠的部分還要補。",
    "forStock": "可以，但只能拿來買這筆合格證券；額度不能隨便領出來花。",
    "tools": [
      "margin",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "永豐金證券：融資融券契約",
        "url": "https://www.sinotrade.com.tw/EX/Html/Contract_MT.html"
      },
      {
        "name": "證交所：融資融券操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201_print.aspx?FLCODE=FL007121"
      }
    ]
  },
  {
    "id": "short",
    "name": "融券",
    "group": "stock",
    "main": true,
    "who": "證券商或證券金融公司",
    "how": "要開信用戶、繳保證金，向券商借股票來賣；賣掉的錢也會被扣著當擔保。",
    "rate": "舉例：元大融券手續費萬分之八，查詢日 2026-11-09；公告的 0.2% 要分清楚，它是賣出價金和保證金的利息，不是借股票的總成本；完整費用還沒查到。",
    "amount": "公開例子是保證金 90%，加上賣出的價金，合計擔保 190%；實際怎麼核定要另外看。",
    "term": "原6個月，可審核展延；要買回或交股票還券，特殊事件可能須提前了結。",
    "call": "整戶維持率低於 130% 會叫你補，2 個營業日內補差額；回到 166% 以上才解除。融券是先賣再買，所以股價漲上去也會觸發。",
    "worst": "股價大漲時你得用高價買回來，可能虧得比保證金還多，還要補差額。",
    "forStock": "不行，這是借股票來賣；賣出的價金和保證金都不是能自由領出來用的現金。",
    "tools": [
      "margin"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "富邦證券：客戶借入",
        "url": "https://www.fbs.com.tw/BusinessAgency/Borrow"
      },
      {
        "name": "永豐金證券：融資融券契約",
        "url": "https://www.sinotrade.com.tw/EX/Html/Contract_MT.html"
      },
      {
        "name": "證交所：融資融券操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201_print.aspx?FLCODE=FL007121"
      }
    ]
  },
  {
    "id": "borrow-stock",
    "name": "借券（借入）",
    "group": "stock",
    "main": true,
    "who": "開辦借券業務的券商",
    "how": "個人要先開證券戶滿 3 個月等條件，簽約，並先準備現金或股票當擔保；借入和出借是相反的角色。",
    "rate": "還沒查到：借入費用看標的和契約，別把出借賺的錢當成借入的利率。",
    "amount": "公開例子要準備前一天收盤價 140% 的擔保；還受限於券商有沒有股票可借、額度夠不夠。",
    "term": "按約還同種股票，可能被提前召回；確切天數看契約。",
    "call": "公開例子一開始是 140%，掉到 120% 以下會被叫補，甚至被強制結束；通知後 2 日內要補，是不是指營業日還要再確認。",
    "worst": "股價上漲或被召回時買不到股票，可能被迫用高價補回來，擔保品也可能被賣掉。",
    "forStock": "不行，你借到的是股票，用來還券、避險或賣出，不是一筆現金。",
    "tools": [
      "margin"
    ],
    "sources": [
      {
        "name": "富邦證券：客戶借入",
        "url": "https://www.fbs.com.tw/BusinessAgency/Borrow"
      },
      {
        "name": "元大證券：股票借貸與債券擔保品",
        "url": "https://www.yuanta.com.tw/file-repository/content/t0/dist/index.html"
      }
    ]
  },
  {
    "id": "personal",
    "name": "個人信貸（分期）",
    "group": "none",
    "main": true,
    "who": "銀行",
    "how": "準備身分和收入資料，通過信用審核；通常不用抵押股票或房子。",
    "rate": "舉例：永豐第一期 0.01%，第 2 期起 2.73%–14.84%，費用 0–9,000 元；公告基準日 2026-09-21，查詢日 2026-11-09。",
    "amount": "公開例子最高 800 萬元，實際能借多少看你的信用。",
    "term": "公開例最長7年，按月一起還本金與利息；提前還款可能收違約金。",
    "call": "不會因為股價被叫補錢；晚繳會被催收、傷信用，提早還清也可能要付費用。",
    "worst": "投資虧了，月付還是要繳；晚繳可能被追討，甚至被強制執行。",
    "forStock": "要看契約有沒有限制；一般週轉金不代表都能拿去買股票，申請時要照實填用途。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "永豐銀行：數位信用貸款",
        "url": "https://bank.sinopac.com/sinopacBT/webevents/psn_loan/index.html?LinkSource=3000"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "revolving",
    "name": "個人信貸（循環）",
    "group": "none",
    "main": true,
    "who": "銀行",
    "how": "銀行先核一個能重複使用的額度，依方案可能是被邀請，或要準備收入證明；你動用了才算欠錢。",
    "rate": "舉例：永豐年利率 3.5%–15%，公告基準日 2026-09-21，查詢日 2026-11-09。",
    "amount": "公開例子小額最高 40 萬元、大額最高 150 萬元，還是要審核。",
    "term": "公開例最長3年，額度內隨借隨還；還本金才恢復額度，繳息與到期還本依約。",
    "call": "不會因為股價被叫補錢；額度會到期，也會重新審查你的信用。",
    "worst": "一直只繳利息、本金沒減少，到期可能還不出來而被追討。",
    "forStock": "要看契約有沒有限制；公開頁主要寫生活週轉，能不能用在證券投資，條款還沒查到。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "永豐銀行：私房錢循環信貸",
        "url": "https://bank.sinopac.com/sinopacbt/webevents/"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "mortgage-topup",
    "name": "房貸增貸",
    "group": "asset",
    "main": true,
    "who": "銀行",
    "how": "房子要重新估價，銀行審你的收入和負債，你要準備抵押文件、說明用途；原本房貸還沒還的餘額要先扣掉。",
    "rate": "舉例：國泰世華 2.72% 起；APR 範例的貸款年利率 2.72%–4.06%，帳務費 20,000 元；公告基準日 2025-05-24，查詢日 2026-11-09。APR 是把費用也算進去的年化總成本。",
    "amount": "公開例子寫最高房價 8 成，那是整體來算，不是原本房貸之外再多給 8 成；還受原本的房貸餘額和央行規定限制。",
    "term": "公開例最長20年，依約分期還款；提前還款費用看契約。",
    "call": "沒有跟股價連動的追繳；但逾期、用途不符或違反擔保約定，銀行還是可能要你還錢。",
    "worst": "房子可能被拍賣，拍賣的錢不夠還，你還是欠錢。",
    "forStock": "要看契約有沒有限制；雖然列了投資理財，用途還是要經銀行核定，也要符合管制條件。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "國泰世華：房屋增貸",
        "url": "https://www.cathaybk.com.tw/cathaybk/personal/loan/product/further-advance/"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "mortgage-line",
    "name": "理財型房貸",
    "group": "asset",
    "main": true,
    "who": "銀行",
    "how": "把房子拿去抵押，準備身分、財力證明和房屋文件，申請一個能重複動用的額度。",
    "rate": "舉例：凱基年利率 2.86%–3.3%，開辦費 5,000–20,000 元，查詢日 2026-11-09。",
    "amount": "看房子和你的信用核定；有沒有統一的成數，公開資料沒查到。",
    "term": "一年一約，公開例最長續約7年；每月付息、到期還本，按每日最高動用餘額計息。",
    "call": "不會因為股價每天被叫補錢；收入或信用有變動，可能影響續約，逾期銀行可以行使抵押權。",
    "worst": "不能續約時要還本金，還不出來可能失去房子，還欠一筆差額。",
    "forStock": "要看契約有沒有限制；雖然列了投資理財，還是要經銀行核定，也要符合央行規定。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "凱基銀行：理財型房貸",
        "url": "https://www.kgibank.com.tw/zh-tw/personal/loan/home/wealth-management-mortgage"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "policy",
    "name": "保單質借",
    "group": "asset",
    "main": true,
    "who": "壽險公司",
    "how": "保單的要保人，拿保單累積的價值去借錢；不是拿整份保額來借。",
    "rate": "舉例：壽險公會列的國泰，年利率 3%–6.9%，查詢日 2026-11-09；你自己那張保單實際多少還沒查到，最低的利率不一定輪到你。",
    "amount": "看保單可借的金額，不是保額；有沒有統一的成數還沒查到。",
    "term": "可隨時部分或全部還款；利息與未付利息怎麼處理，看保單。",
    "call": "沒有股票那種維持率；但欠的本金加利息超過保單價值的一定比例又沒還，保單可能失效；比例多少、幾天前通知，還沒查到。",
    "worst": "保單失效就沒有保障了，理賠時也可能先扣掉你沒還的本金和利息。",
    "forStock": "要看契約有沒有限制；沒確認每張保單都能借來做證券投資。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "國泰人壽：保單借款",
        "url": "https://www.cathaylife.com.tw/cathaylife/webStatics/loan/loan/index.html"
      },
      {
        "name": "壽險公會：保單借款利率一覽",
        "url": "https://www.lia-roc.org.tw/list_article?article_content=425"
      }
    ]
  },
  {
    "id": "cash-advance",
    "name": "信用卡預借現金",
    "group": "none",
    "main": true,
    "who": "發卡銀行",
    "how": "拿有效的信用卡、有預借額度，用本人名義領現金；能借多少另外核定。",
    "rate": "舉例：玉山循環利率 5.88%–15%，分期預借 7%–15%；一般每筆收 3.5% 再加 150 元，查詢日 2026-11-09；2015-09-01 起循環利率法定上限是 15%，但這不是所有費用的上限。",
    "amount": "看預借可以用的額度，不等於整張卡的額度。",
    "term": "一般列入帳單，循環另計利息；分期預借公開例有3、6、12、18、24、30期。",
    "call": "不會因為股價被叫補錢；最低應繳金額沒繳或逾期，會被收遲繳利息、違約金，信用也受影響。",
    "worst": "手續費和利息讓欠款越滾越多，逾期還會傷信用、被追討。",
    "forStock": "要看契約有沒有限制；領得到現金，不代表能違反用途或發卡約定去買股票。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "玉山銀行：預借現金",
        "url": "https://www.esunbank.com/zh-tw/personal/credit-card/loan/cash-advance"
      },
      {
        "name": "金管會：銀行法",
        "url": "https://law.fsc.gov.tw/LawContent.aspx?id=FL006378"
      }
    ]
  },
  {
    "id": "card",
    "name": "信用卡循環／帳單分期",
    "group": "none",
    "main": true,
    "who": "發卡銀行",
    "how": "已經刷出去的帳款，沒還清的部分會滾成循環；帳單分期要另外申請，不會多撥一筆現金給你。",
    "rate": "舉例：玉山循環利率 5.88%–15%，帳單分期 6%–14%，查詢日 2026-11-09；2015 年起循環利率法定上限是 15%，但不是所有費用的上限。",
    "amount": "受信用額度和可分期的帳款限制，沒還的本金會一直占著額度。",
    "term": "循環雖可按最低額繳，本金仍存在；帳單分期公開例有3、6、12、18、24期。",
    "call": "不會因為股價被叫補錢；帳單不還會被催收、傷信用；分期要提早結清或中止，照契約辦。",
    "worst": "利息和費用越積越多，逾期會被追討，信用紀錄也受影響。",
    "forStock": "不行，台股不能直接刷卡交割；拿還卡的現金去投資，等於背著卡債投資，有些投資交易也不能分期。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "玉山銀行：預借現金",
        "url": "https://www.esunbank.com/zh-tw/personal/credit-card/loan/cash-advance"
      },
      {
        "name": "玉山銀行：刷卡分期",
        "url": "https://www.esunbank.com/zh-tw/personal/credit-card/loan/layaway-plan?tabid=tab03"
      },
      {
        "name": "金管會：銀行法",
        "url": "https://law.fsc.gov.tw/LawContent.aspx?id=FL006378"
      }
    ]
  },
  {
    "id": "car",
    "name": "車貸增貸",
    "group": "asset",
    "main": true,
    "who": "銀行或融資公司",
    "how": "用你名下的汽車申請，準備身分、行照和收入資料；銀行會看車況、舊貸款和抵押設定。",
    "rate": "舉例：中租集團教學頁約 3.05%–16%，查詢日 2026-11-09；這只是教學估算，不是正式報價，實際費率和總費用還沒查到。",
    "amount": "看車子還剩多少價值、你的信用和舊貸款；先拿來還舊貸後，實拿的錢會變少，能借幾成還沒查到。",
    "term": "依契約分期還本息，教學月付例不能當統一期限。",
    "call": "沒看到股票那種維持率；逾期車子可能被收回、賣掉；什麼情況會提前到期，還沒查到。",
    "worst": "車子沒了可能影響生活和工作，賣掉後還可能欠差額。",
    "forStock": "要看契約有沒有限制；買車的貸款只能拿來買車，用原本的車去借，也要核對用途。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "中租集團：原車融資說明",
        "url": "https://carloan.chailease.com/Scooter/Media/Page1?newsSeq=92"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "deposit",
    "name": "存單質借",
    "group": "asset",
    "main": true,
    "who": "銀行",
    "how": "把合格的定存抵押給銀行；開了這個功能，提款超過活存餘額時，可能自動變成借款。",
    "rate": "舉例：板信是被動用的那筆定存利率再加 1.5 個百分點，查詢日 2026-11-09；總年利率還沒查到，別把 1.5% 當成全部成本。",
    "amount": "公開綜合存款的例子，最多借到質押定存總額的九成五左右。",
    "term": "看定存及借款契約，按當日最後借款餘額計息；到期扣抵安排待核。",
    "call": "不會因為股價被叫補錢；逾期或到期沒還，銀行可能直接扣你的定存來抵。",
    "worst": "定存被扣去還債，備用的錢就沒了，借貸的利差你還是要負擔。",
    "forStock": "要看契約有沒有限制；公開的存款問答沒說每種證券用途都可以。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "板信銀行：存單質借問答",
        "url": "https://www.bop.com.tw/Footer/QA?tni=93"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "fund",
    "name": "基金質借",
    "group": "stock",
    "main": false,
    "who": "證券金融公司，透過基金平台合作辦理",
    "how": "要同時開基金平台戶和證金的借款戶，用合格的國內投信基金當擔保；不是每一檔基金都能用。",
    "rate": "還沒查到：行銷比較表上寫的單一上限，不是個別基金實際核定的利率，現在完整的報價沒拿到。",
    "amount": "最多借基金市值的 6 成，最低 1,000 元，每次以 1,000 元往上加；依標的審核。",
    "term": "每筆6個月，可審核展延2次至18個月；按日計息、到期繳息，須用現金還。",
    "call": "整戶維持率低於 140%，通知後 3 個營業日內要補；回到 140% 以上只是先不處理。要等各筆補到 167% 以上、整戶自己漲回 180% 以上，或補足通知上的差額，才會取消紀錄；算比率時分母還包含應收利息。",
    "worst": "基金被賣掉，虧損就成真，可能還有借款沒還完。",
    "forStock": "要看契約有沒有限制；公開寫的是應急用途，能不能再拿去投資，條款還沒查到。",
    "tools": [
      "pledge",
      "lifelev"
    ],
    "sources": [
      {
        "name": "基富通：好享貸基金借貸",
        "url": "https://www.fundrich.com.tw/event/fundloan/"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "bond",
    "name": "債券質借",
    "group": "stock",
    "main": false,
    "who": "有開辦的券商",
    "how": "開借貸戶，把合格的公債、公司債或金融債轉進擔保專戶；債券 ETF 不算直接持有的債券。",
    "rate": "舉例：元大不限用途借貸年利率 6.25%，查詢日 2026-11-09；個別案件可能加碼或減碼，要另外看。",
    "amount": "中央登錄公債最多借面額的 80%，地方政府債、公司債和金融債等最多借面額的 60%；券商可以更嚴。",
    "term": "依不限用途契約，原6個月，可審核展延。",
    "call": "適用同一戶 130% 要補、166% 才解除的規則；不過債券的計價基礎不一樣，不能整套照股票市值的算法。",
    "worst": "到期或擔保品不夠時會被賣掉，賣完還不夠還的部分，你還是要還。",
    "forStock": "可以，這一項屬於不限用途；但別以為銀行的海外債或信託債券都能拿來借。",
    "tools": [
      "pledge",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "元大證券：股票借貸與債券擔保品",
        "url": "https://www.yuanta.com.tw/file-repository/content/t0/dist/index.html"
      },
      {
        "name": "證交所：不限用途借貸操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl080086"
      }
    ]
  },
  {
    "id": "worker",
    "name": "勞工紓困貸款（已結束梯次）",
    "group": "other",
    "main": false,
    "who": "政府公告，由承辦銀行受理",
    "how": "要符合當期生活困難、勞保年資滿 15 年等資格，也要符合沒欠保費、舊貸款等條件。",
    "rate": "舉例：勞保局 2025-12-05 公告 2.165%，查詢日 2026-11-09；你本人現在適用的利率還沒查到。",
    "amount": "這一梯次每人最多 10 萬元。",
    "term": "3年，前6個月繳息、第7個月起還本息；受理2025-12-15至2026-01-02，已截止。",
    "call": "不會因為股價被叫補錢；沒還款，之後的勞保給付可能被扣。",
    "worst": "沒還款會影響以後領的保險給付，欠的錢還是要還。",
    "forStock": "不行，這是生活紓困方案；照方案的目的保守判斷，有沒有逐條禁止買股的規定，沒查到。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "勞保局：115年紓困貸款",
        "url": "https://www.bli.gov.tw/0109572.html"
      }
    ]
  },
  {
    "id": "pawn",
    "name": "當舖質當",
    "group": "other",
    "main": false,
    "who": "合法登記的當舖",
    "how": "把能收當的動產交給當舖，拿到當票；股票、有價證券和存款憑證不能當。",
    "rate": "實際年利率還沒查到；2026-11-09 查到當舖業法的上限是 30%，倉棧費最高是收當金額的 5%，這不是推薦的報價。",
    "amount": "依物品估價和雙方談的結果，沒有全國統一的成數。",
    "term": "滿當期至少3個月；滿期後5日內仍可取贖或繳息順延，否則依規定流當。",
    "call": "沒有股票那種追繳；到期沒贖回也沒延期，物品的所有權就轉走了。",
    "worst": "押的東西沒了；如果另外簽了借據或本票，還要查清楚多出來的法律責任。",
    "forStock": "要看契約有沒有限制；這裡只拿來當成本高、又可能失去抵押物的最壞例子，不建議。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "全國法規資料庫：當舖業法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0080075"
      }
    ]
  },
  {
    "id": "private",
    "name": "民間借貸／民間抵押借款",
    "group": "other",
    "main": false,
    "who": "私人出借人",
    "how": "要確認出借人是誰、實際拿到多少本金、借據怎麼寫、有哪些費用和擔保；如果要簽本票，條款要看清楚。",
    "rate": "實際年利率還沒查到；2026-11-09 查民法 205 條，約定利率超過 16% 的部分無效，206 條禁止用其他名目偷拿好處；這不是市場行情。",
    "amount": "雙方談好就算，沒有統一的成數。",
    "term": "依約還本付息；月息及預扣費不能冒稱低年利率。",
    "call": "有擔保品的話，可能依法、依約被處分；沒有統一的股票追繳線，逾期還是可能被告、被強制執行。",
    "worst": "可能為本金和費用起爭議、失去擔保的資產、被追討；對方用違法手段討債，也有另外的法律風險。",
    "forStock": "要看契約有沒有限制；沒限用途也不代表安全，這裡只當最壞例子，不建議。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "family",
    "name": "親友借款",
    "group": "other",
    "main": false,
    "who": "家人或朋友",
    "how": "要講清楚這是借款，不是送你的；借據、匯款紀錄、利息和還款時間都要留下來。",
    "rate": "還沒查到：雙方自己談，可以不算利息，沒有統一的市場利率；但還是受民法相關規定限制。",
    "amount": "雙方說好就算，沒有銀行那種統一額度。",
    "term": "依約返還；未定期限時的催告與返還依民法478條。",
    "call": "沒拿股票抵押，就不會因為股價被叫補錢；但到期了仍可能被催還、被追討，甚至被強制執行。",
    "worst": "投資虧了，還欠親友本金，關係也可能變差。",
    "forStock": "要看有沒有限制；親友同意你拿去投資，不代表一定賺錢，也不代表不用還。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "second-mortgage",
    "name": "二順位房貸（二胎）",
    "group": "asset",
    "main": false,
    "who": "銀行",
    "how": "已經有別家銀行的房貸，再把同一間房子抵押第二次；銀行會審你的收入，也看房子還剩多少擔保空間。",
    "rate": "舉例：國泰世華 3.45% 起，APR 範例的貸款年利率 3.45%–15%，費用是貸款金額的 1%；公告基準日 2025-05-24，查詢日 2026-11-09。APR 是把利息和費用都算進去的年化成本。",
    "amount": "公開例子是 20 萬–150 萬元，房子不一定能核到這麼多。",
    "term": "公開例最長10年，依契約分期還本息。",
    "call": "沒有股票那種每天追繳；逾期可能被要求還清，抵押的房子也可能被處分。",
    "worst": "房子被拍賣，先還給第一順位的銀行，剩下的才輪到你這筆，可能還有借款沒還完。",
    "forStock": "要看契約有沒有限制；沒確認買股票的用途都受理。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "國泰世華：二順位房貸",
        "url": "https://www.cathaybk.com.tw/cathaybk/personal/loan/product/second-mortgage/"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "settlement-advance",
    "name": "預支交割款",
    "group": "stock",
    "main": false,
    "who": "有開辦的券商",
    "how": "股票已經賣掉、錢還沒入帳，就拿這筆應收的交割款抵押，開不限用途借貸戶來申請。",
    "rate": "還沒查到：這個產品實際的年利率沒拿到，別套用一般股票借款的牌告利率。",
    "amount": "依應收應付的淨額，扣掉已借的錢和費用；公開例子最低 5,000 元。",
    "term": "成交後第2營業日交割時自動扣還；公開例不接受提前還款，假日也可能算息。",
    "call": "應收的交割款不算進一般的維持率；交割出問題或錢不夠，還是照契約處理。",
    "worst": "先領的錢花掉後，交割要扣的錢加上其他開銷，可能讓你手上現金不夠。",
    "forStock": "可以，屬於不限用途；但要留夠交割和還這筆債需要的現金。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：股票借貸與債券擔保品",
        "url": "https://www.yuanta.com.tw/file-repository/content/t0/dist/index.html"
      },
      {
        "name": "證交所：不限用途借貸操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl080086"
      }
    ]
  },
  {
    "id": "student",
    "name": "就學貸款（用途限定）",
    "group": "none",
    "main": false,
    "who": "承貸銀行",
    "how": "要符合學籍和家庭條件，準備繳費單和身分資料；依規定找保證人，並辦對保，確認契約內容。",
    "rate": "舉例：臺銀問答寫學生負擔 0.775%，是 2026-08-01 起補貼後的算法，查詢日 2026-11-09；利率會浮動，也依有沒有補貼的身分而不同。",
    "amount": "依學雜費、符合規定的住宿費、書籍費和必要的生活支出核定。",
    "term": "依教育貸款規定分期還款；緩繳須核准。",
    "call": "不會因為股價被叫補錢；逾期銀行可以向學生和連帶保證人討債，信用也受影響。",
    "worst": "學生和保證人都會被追債，金融信用也受損。",
    "forStock": "不行，只能用在必要的教育支出，多半由銀行直接撥給學校，不是拿來買股票的錢。",
    "tools": [
      "lifelev"
    ],
    "sources": [
      {
        "name": "臺灣銀行：就學貸款問答",
        "url": "https://sloan.bot.com.tw/customer/login/SLoanLogin.action"
      }
    ]
  },
  {
    "id": "gold",
    "name": "黃金現貨擔保借款",
    "group": "stock",
    "main": false,
    "who": "可受理的券商",
    "how": "把合格的櫃買黃金現貨轉進擔保專戶；金飾或任何黃金存摺都不能直接拿去借。",
    "rate": "舉例：元大不限用途借貸年利率 6.25%，查詢日 2026-11-09；黃金這類案件加碼或減碼多少，還沒查到。",
    "amount": "最多借前一個營業日收市均價的 60%；收不收、實際借幾成，還是由券商核定。",
    "term": "依不限用途借貸契約，原6個月，可審核展延。",
    "call": "照整戶 130% 要補、166% 才解除這套流程走；黃金價格依規定更新，契約也可能另有約定。",
    "worst": "金價變動或借款到期時，擔保品被賣掉後，可能還欠差額。",
    "forStock": "可以，屬於不限用途；先確認現在收哪些品種，不是所有黃金都能借。",
    "tools": [
      "pledge",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "元大證券：股票借貸與債券擔保品",
        "url": "https://www.yuanta.com.tw/file-repository/content/t0/dist/index.html"
      },
      {
        "name": "證交所：不限用途借貸操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl080086"
      }
    ]
  },
  {
    "id": "t5",
    "name": "證券業務借貸款項（T+5交割型）",
    "group": "stock",
    "main": false,
    "who": "有開辦的券商",
    "how": "為了這筆證券交割要付的錢申請，拿已經買進的證券等當擔保，並開借貸戶。",
    "rate": "舉例：元大年利率 7.5%，查詢日 2026-11-09；這個子產品的費用要另外看。",
    "amount": "看交割需要多少錢和擔保品來核定；有沒有統一成數還沒查到。",
    "term": "短期T+5型；起算、假日和續借限制待核契約，不能當長期額度。",
    "call": "不能套用不限用途那套整戶追繳線；短期要不要補擔保、什麼時候被賣，條款還沒查到，到期沒還一樣有被賣的風險。",
    "worst": "短期到期還不出來，擔保品被賣掉後可能還欠差額。",
    "forStock": "可以，但只限這筆證券的交割，不能當現金隨便用。",
    "tools": [
      "margin",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "證交所：證券業務借貸款項操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl039943"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "half-year",
    "name": "證券業務借貸款項（半年型）",
    "group": "stock",
    "main": false,
    "who": "有開辦的券商",
    "how": "為了證券交割相關的需要，拿手上或買進的證券當擔保，依規定申請。",
    "rate": "舉例：元大年利率 6.25%，查詢日 2026-11-09。",
    "amount": "依擔保規則和個別審核，不能直接套不限用途的額度。",
    "term": "半年型；能否展延及還本付息方式看個別契約。",
    "call": "這個指定類型低於 130% 要補，2 個營業日內補到高於 166%；還有逐筆計算等規定，不能混進不限用途的整戶來算。",
    "worst": "擔保品被賣掉就是實際虧損，差額你還要還，也可能不能延長。",
    "forStock": "可以，但只限證券交割，不是隨便投資或生活週轉都能用。",
    "tools": [
      "margin",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "證交所：證券業務借貸款項操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl039943"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  },
  {
    "id": "subscription",
    "name": "認股借貸（用途限定）",
    "group": "stock",
    "main": false,
    "who": "有開辦的券商",
    "how": "為了認購有價證券需要的錢申請，用認購的證券等依規定當擔保。",
    "rate": "舉例：元大年利率 6.25%，查詢日 2026-11-09；不是免息先墊錢。",
    "amount": "看認購要付多少錢、標的是什麼，由券商核定；成數還沒查到。",
    "term": "期限、何時開始計息與如何歸還看契約，不能直接套半年型。",
    "call": "照特定認購的擔保和期限分類來走；要補多少擔保的完整數字還沒查到，逾期可以被賣。",
    "worst": "證券下跌或來不及賣，到期還是要還錢，被處分賣掉的錢也可能不夠還。",
    "forStock": "可以，但只能用來認購合格的有價證券，不能拿去付其他股票的交割款。",
    "tools": [
      "margin",
      "lifelev"
    ],
    "sources": [
      {
        "name": "元大證券：借貸利率公告",
        "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49"
      },
      {
        "name": "證交所：證券業務借貸款項操作辦法",
        "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl039943"
      },
      {
        "name": "全國法規資料庫：民法",
        "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001"
      }
    ]
  }
];

export const LOAN_MYTHS = [
  {
    "myth": "質借利率低，就比信貸安全。",
    "fact": "利率低不代表風險小；拿股票擔保，價格一跌就可能被叫補錢，信貸則是每月要付、還要背信用壓力。"
  },
  {
    "myth": "所有股票借款都在同一維持率追繳。",
    "fact": "券商、信用交易、證金、銀行各有各的規則；基金借款算比率時，分母還可能包含應收利息。"
  },
  {
    "myth": "回到追繳線，就解除追繳。",
    "fact": "先不賣你的擔保品，跟取消追繳紀錄是兩回事；再跌破的話，可能要當天下午就補錢。"
  },
  {
    "myth": "融券公告利率就是借股成本。",
    "fact": "有些是券商付給你的價金或保證金利息；借股票的費用和手續費要另外看。"
  },
  {
    "myth": "出借股票就是借錢投資。",
    "fact": "出借的人提供股票，可能收費；借入的人要付費，而且要還股票，兩邊方向相反。"
  },
  {
    "myth": "理財型房貸沒動用，就完全沒成本。",
    "fact": "沒動用就沒有借款利息，但可能有開辦費；動用之後只繳利息，本金還是沒減少。"
  },
  {
    "myth": "保單借款不影響保險。",
    "fact": "欠的本息碰到條款的上限，保單可能失效；理賠時也可能先扣掉欠款。"
  },
  {
    "myth": "信用卡循環法定上限，就是全部費用上限。",
    "fact": "循環利率和每筆預借的手續費是兩回事，銀行實際收的費用不等於法定的那個數字。"
  },
  {
    "myth": "刷卡投資等於免息拿銀行錢。",
    "fact": "拿還卡的現金去投資，等於背著循環或分期的卡債；台股不能直接刷卡交割，有些投資也不能分期。"
  },
  {
    "myth": "房貸最高成數，就是額外能領的金額。",
    "fact": "銀行要重新估房價，扣掉原本的房貸餘額，再審你的收入和負債；不是原房貸之外，再多給你一整份成數。"
  },
  {
    "myth": "斷頭後交出擔保品就不欠錢。",
    "fact": "斷頭就是擔保品被強制賣掉；賣的錢不夠還，對方還是可以向你討，跌停時也可能賣不掉。"
  },
  {
    "myth": "政府低利貸款隨時能拿來買股。",
    "fact": "紓困貸款有受理期間，也要符合生活困難的資格；就學貸款只能付教育費；青創貸款的對象是合格的事業。"
  }
];

export const LOAN_OPEN = [
  "銀行股票質借接受哪些 ETF、能借幾成、借多久、怎麼追繳，都還沒查到，別拿券商的門檻來套。",
  "證金純股票借款的利率和契約還沒查到，別套同一家公司基金借貸的追繳規則。",
  "公開問答裡追繳的文字寫法有些不一樣；回到先不賣的那條線，不等於取消追繳，要核對完整流程。",
  "公開的手續費寫了重複的百分號，單位怪怪的，實際單位還沒查清楚，不能自己改成百分比或千分比。",
  "融券公告的利率，錢是誰付給誰、完整費用有哪些，還沒查清楚；要確認它是付給你的利息，還是你要付的成本。",
  "保單你個人適用的利率、失效的比例、通知的天數都還沒查到；公會的概覽不能取代你自己保單的條款。",
  "基金借款每個標的的報價還沒查到，行銷用的上限，不能當成完整的利率範圍。",
  "債券擔保收哪些券、實際受理到什麼範圍，還沒查到；直接持有的債券、銀行信託和債券 ETF 不能混為一談。",
  "黃金現貨擔保和實體金飾質當不一樣，別以為所有黃金存摺都能辦。",
  "存單質借只查到「定存利率加碼」這個算法；你個人的總利率、到期怎麼扣抵、借超過的條款，都還沒查到。",
  "原車融資只有教學頁的概略估算；實際總成本、期限、車子怎麼處分、扣掉舊貸後實拿多少，都還沒查到。",
  "勞工紓困已公告的那一梯次已經截止，現在能不能新申請、你的利率多少，還沒查到；不能假設明年條件一樣，也不額外推測有沒有逐條禁買股的法規。",
  "青創貸款是給合格事業做營運和買設備的；其他政府專案要一個一個查對象，不能一概當成個人投資貸款。",
  "當舖和民間借貸適用的法律不同，不能隨便挑比較高的利率上限來用；實際報價還沒查到，兩者都只當最壞例子。",
  "T+5、半年型和認股融通有沒有開辦、實際期限、認股範圍和補擔保的契約，都還要再核對。",
  "到 2026-11-09 為止，不先採用 2026-11-15 才生效的規章第 6 條；追繳看第 54、55 條，銀行和證金的契約要另外核對。",
  "現金卡、P2P 和雇主借款，現在有哪些方案可以辦還沒查到；法律有規定，不代表現在辦得到；私下的安排歸在親友或民間借貸。"
];

export const LOAN_REFS = [
  {
    "name": "永豐銀行：股票貸款",
    "url": "https://bank.sinopac.com/sinopacBT/personal/loan/other-personal-loan/stock.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "全國法規資料庫：民法",
    "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=B0000001",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "元大證券：借貸利率公告",
    "url": "https://www.yuanta.com.tw/eYuanta/Securities/News?CategoryId=S000000051&NewsId=6d34c15e-6c97-4bd8-a34a-d4c2378abd49",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "元大證券：股票借貸與債券擔保品",
    "url": "https://www.yuanta.com.tw/file-repository/content/t0/dist/index.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "合作金庫證券：不限輕鬆貸",
    "url": "https://luckydraw.tcfhc-sec.com.tw/websites/loan/index.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：不限用途借貸操作辦法",
    "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl080086",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "元大證金：股票借款",
    "url": "https://www.yuantafinance.com.tw/brief/index.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "永豐金證券：融資融券契約",
    "url": "https://www.sinotrade.com.tw/EX/Html/Contract_MT.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：融資融券操作辦法",
    "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201_print.aspx?FLCODE=FL007121",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "富邦證券：客戶借入",
    "url": "https://www.fbs.com.tw/BusinessAgency/Borrow",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "永豐銀行：數位信用貸款",
    "url": "https://bank.sinopac.com/sinopacBT/webevents/psn_loan/index.html?LinkSource=3000",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "永豐銀行：私房錢循環信貸",
    "url": "https://bank.sinopac.com/sinopacbt/webevents/",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "國泰世華：房屋增貸",
    "url": "https://www.cathaybk.com.tw/cathaybk/personal/loan/product/further-advance/",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "凱基銀行：理財型房貸",
    "url": "https://www.kgibank.com.tw/zh-tw/personal/loan/home/wealth-management-mortgage",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "國泰人壽：保單借款",
    "url": "https://www.cathaylife.com.tw/cathaylife/webStatics/loan/loan/index.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "壽險公會：保單借款利率一覽",
    "url": "https://www.lia-roc.org.tw/list_article?article_content=425",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "玉山銀行：預借現金",
    "url": "https://www.esunbank.com/zh-tw/personal/credit-card/loan/cash-advance",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "金管會：銀行法",
    "url": "https://law.fsc.gov.tw/LawContent.aspx?id=FL006378",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "玉山銀行：刷卡分期",
    "url": "https://www.esunbank.com/zh-tw/personal/credit-card/loan/layaway-plan?tabid=tab03",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "中租集團：原車融資說明",
    "url": "https://carloan.chailease.com/Scooter/Media/Page1?newsSeq=92",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "板信銀行：存單質借問答",
    "url": "https://www.bop.com.tw/Footer/QA?tni=93",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "基富通：好享貸基金借貸",
    "url": "https://www.fundrich.com.tw/event/fundloan/",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "勞保局：115年紓困貸款",
    "url": "https://www.bli.gov.tw/0109572.html",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "全國法規資料庫：當舖業法",
    "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0080075",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "國泰世華：二順位房貸",
    "url": "https://www.cathaybk.com.tw/cathaybk/personal/loan/product/second-mortgage/",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "臺灣銀行：就學貸款問答",
    "url": "https://sloan.bot.com.tw/customer/login/SLoanLogin.action",
    "note": "查閱 2026-11-09"
  },
  {
    "name": "證交所：證券業務借貸款項操作辦法",
    "url": "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=fl039943",
    "note": "查閱 2026-11-09"
  }
];

// 指定提示的完整圖中文字，供螢幕閱讀器使用。
export const FIGURE_TEXT = {
  "comic": "借錢之前先問三件事。想借錢多買一點。借錢。借來的錢拿去投資，賺更多？第一問：利息多少。利息每個月都要付，不管賺還是賠。第二問：會不會被追繳。追繳通知。拿股票去借，股價跌太多就要補錢，不補可能被賣掉。第三問：最壞會怎樣。虧損變成真的。還要繼續還錢。信用紀錄變差。三件事都想清楚，再決定要不要借。以上只是說明，不是借款建議。",
  "map": "押什麼借，差很多。押股票。股票質借、融資、融券、借券。股價跌太多會被追繳，不補可能被賣掉。例：融資整戶維持率低於 130%，要在 2 個營業日內補。押房子、保單、車、定存。房貸增貸、理財型房貸、保單質借、車貸、存單質借。不會因為股價每天追繳。還不出來，擔保品可能被處分。什麼都不押。個人信貸、信用卡預借現金、循環信用。不會追繳，但利息通常比較高。遲繳會影響信用紀錄。不會追繳，不代表不會虧。"
};
