// ㉑ 借錢投資的管道，來源 docs/research/R4-個人借錢管道.md（Codex 依研究報告改寫，2026-11-09）。
export const LOAN_GROUPS = [
  {
    "id": "stock",
    "title": "押股票",
    "line": "押股票等帳戶資產借款，價格變動可能要補擔保；基金、債券及黃金現貨的計價規則要另看。"
  },
  {
    "id": "asset",
    "title": "押房子、保單、車、定存",
    "line": "不因股價每日追繳，但還不出款項時，擔保品可能被處分，保單也可能停效。"
  },
  {
    "id": "none",
    "title": "什麼都不押",
    "line": "通常不用押股票或房屋；仍要依約還款，遲繳會影響信用。"
  },
  {
    "id": "other",
    "title": "其他（政府專案、親友、當舖與民間）",
    "line": "政府方案看適用對象與用途，親友借款也要還；當舖與民間只當最壞例子，不建議。"
  }
];

export const LOANS = [
  {
    "id": "bank-pledge",
    "name": "股票質借（銀行）",
    "group": "stock",
    "main": true,
    "who": "銀行",
    "how": "拿可接受的上市櫃股票設擔保，備身分及信用審查資料；ETF是否接受待查。",
    "rate": "例：永豐公告年利率3.41%起、每筆費用15,000元，基準2026-01-21、查詢2026-11-09；上限待查。",
    "amount": "看股票及個人信用核定；公開可借成數待查。",
    "term": "利率會浮動；期限、繳息及續借看契約。",
    "call": "擔保不足可能追繳；銀行的比率、補款天數和處分條件待查，不能套券商數字。",
    "worst": "股票被賣掉後，若還不夠還債，差額仍要還。",
    "forStock": "契約限制要看；公開頁只有資金調度，未確認所有買股用途。",
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
    "how": "開證券及借貸戶、簽約並備財力證明，把合格擔保品轉入。",
    "rate": "例：元大2026-10-21公告年利率6.25%，查詢2026-11-09；合庫手續費單位異常，待查。",
    "amount": "按規定，股票前日收盤價60%、非信用標的40%；券商可以更嚴。",
    "term": "原6個月，可審核展延2次；公開例最長18個月，按日計息。",
    "call": "整戶低於130%通知，2營業日內補至高於166%；未補且仍不足，自第3營業日起處分。130%以上僅暫緩，166%以上或補足通知差額才解除；另約定須核。",
    "worst": "賣掉擔保品仍不夠清償，差額繼續欠。",
    "forStock": "可以，業務不限定交割用途；仍須看契約、標的與法令。",
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
    "how": "用股票擔保，備雙證件開借款戶；每筆審核後才撥款。",
    "rate": "待查：公開介紹沒有可核實的現行年利率。",
    "amount": "開戶100萬元只是參考額度，實際撥款另審。",
    "term": "還本金時結算利息，可申請續借；原期限待查。",
    "call": "會看擔保價值；股票借款的追繳和處分數字待查，不能套券商規則。",
    "worst": "擔保品被處分後仍可能欠錢，也可能無法續借。",
    "forStock": "契約限制要看；已確認個人可申請，完整用途條款待查。",
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
    "how": "符合信用交易資格，開信用戶並備財力、自備款；用買進的合格證券擔保。",
    "rate": "例：元大公告年利率6.25%，查詢2026-11-09；不是全市場統一費率。",
    "amount": "依個人核定；現行最高成數待查，不套舊工具數字。",
    "term": "原6個月，可審核展延2次、每次6個月；到期還錢或賣股償還。",
    "call": "整戶低於130%，通知送達起2營業日補差額；期滿仍不足，次營業日處分。130%以上暫緩，166%以上或補足通知差額才取消追繳。",
    "worst": "跌停可能賣不掉；處分後虧損實現，不足額還要補。",
    "forStock": "可以，限這筆合格證券買進；額度不能任意領走。",
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
    "how": "開信用戶、繳保證金，借股票並賣出；賣出款也留作擔保。",
    "rate": "例：元大融券手續費萬分之八，查詢2026-11-09；公告0.2%須辨為價金及保證金利息，不能當借股總成本，完整費用待查。",
    "amount": "公開例保證金90%，加賣出價金共190%擔保；實際核定另核。",
    "term": "原6個月，可審核展延；要買回或交股票還券，特殊事件可能須提前了結。",
    "call": "整戶低於130%追繳，2營業日補差額；166%以上解除。借股賣出時，股價上漲也會觸發。",
    "worst": "股價大漲時須高價買回，可能虧超過保證金並欠差額。",
    "forStock": "不行，是借股票供賣出；價金及保證金不是可自由領用的現金。",
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
    "how": "自然人證券開戶滿3個月等資格，簽約並先備現金或股票擔保；借入和出借是相反角色。",
    "rate": "待查：借入費看標的和契約，不能拿出借收入當借入利率。",
    "amount": "公開例按前日收盤價140%備擔保；還受券源及額度限制。",
    "term": "按約還同種股票，可能被提前召回；確切天數看契約。",
    "call": "公開例原始140%、低於120%追繳，可能強制了結；通知起2日內補，是否營業日待核。",
    "worst": "上漲或被召回時買不到股票，可能被迫高價回補及處分擔保品。",
    "forStock": "不行，借到的是股票，用於還券、避險或賣出等，不是一筆現金信貸。",
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
    "how": "備身分與收入資料，經信用審核；通常不用押股票或房子。",
    "rate": "例：永豐首期0.01%、第2期起2.73%–14.84%，費用0–9,000元；基準2026-09-21，查詢2026-11-09。",
    "amount": "公開例最高800萬元，實際看信用核定。",
    "term": "公開例最長7年，按月一起還本金與利息；提前還款可能收違約金。",
    "call": "不因股價追繳；逾期會催收並影響信用，提前清償也可能有費用。",
    "worst": "投資虧了仍須月付，逾期可能被追償或強制執行。",
    "forStock": "契約限制要看；一般週轉不代表一律可買股，要如實申報用途。",
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
    "how": "先核定可反覆使用的額度，依方案邀請或備收入證明；動用才欠款。",
    "rate": "例：永豐年利率3.5%–15%，基準2026-09-21，查詢2026-11-09。",
    "amount": "公開例小額最高40萬元、大額最高150萬元，仍須審核。",
    "term": "公開例最長3年，額度內隨借隨還；還本金才恢復額度，繳息與到期還本依約。",
    "call": "不因股價追繳；額度會到期、也會重新審查信用。",
    "worst": "一直只繳息，本金沒減少，到期可能還不出而被追償。",
    "forStock": "契約限制要看；公開頁以生活週轉為主，全面證券用途條款待查。",
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
    "how": "房屋重新估價，審查收入和負債，備抵押文件並說明用途；要扣原房貸餘額。",
    "rate": "例：國泰世華2.72%起；APR範例的貸款年利率2.72%–4.06%，帳務費20,000元；基準2025-05-24，查詢2026-11-09。APR指含費用的總費用年百分率。",
    "amount": "公開例最高房價8成是整體評估，非另外再拿8成；還受原餘額與央行限制。",
    "term": "公開例最長20年，依約分期還款；提前還款費用看契約。",
    "call": "未列股價式追繳；逾期、違反用途或擔保約定，仍可能被要求還款。",
    "worst": "房子可能被拍賣，拍賣款不夠仍欠錢。",
    "forStock": "契約限制要看；雖列投資理財，仍須核定用途及符合管制條件。",
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
    "how": "把房屋設定抵押，備身分、財力和房屋文件，申請可反覆動用的額度。",
    "rate": "例：凱基年利率2.86%–3.3%，開辦費5,000–20,000元，查詢2026-11-09。",
    "amount": "依房屋及信用核定；公開統一成數待查。",
    "term": "一年一約，公開例最長續約7年；每月付息、到期還本，按每日最高動用餘額計息。",
    "call": "不因股價每天追繳；收入或信用變動可能影響續約，逾期可動用抵押權。",
    "worst": "不能續約時須還本金，還不出可能失去房子並欠差額。",
    "forStock": "契約限制要看；雖列投資理財，仍須核定並符合央行規範。",
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
    "how": "要保人用保單累積的價值借款，不是拿整份保額借錢。",
    "rate": "例：壽險公會國泰列年利率3%–6.9%，查詢2026-11-09；個別保單實際利率待查，下限不一定適用。",
    "amount": "看保單可借金額，不是保額；統一成數待查。",
    "term": "可隨時部分或全部還款；利息與未付利息怎麼處理，看保單。",
    "call": "沒有股票式維持率；本息超過保單價值的特定比例又未還，可能停效，比例及通知天數待查。",
    "worst": "保單停效會失去保障，理賠也可能先扣未還本息。",
    "forStock": "契約限制要看；未確認所有保單都能當證券投資融資。",
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
    "how": "持有效卡並有預借額度，以本人帳戶領現金；可借金額另外核定。",
    "rate": "例：玉山循環5.88%–15%、分期預借7%–15%；一般每筆3.5%加150元，查詢2026-11-09；2015-09-01起循環法定上限15%，非所有費用上限。",
    "amount": "看預借可用額度，不等於整張信用卡額度。",
    "term": "一般列入帳單，循環另計利息；分期預借公開例有3、6、12、18、24、30期。",
    "call": "不因股價追繳；最低應繳未繳或逾期，會有遲延息、違約金和信用影響。",
    "worst": "手續費與利息讓負債增加，逾期還有信用及求償風險。",
    "forStock": "契約限制要看；能領到現金，不代表可違反用途或發卡約定買股。",
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
    "how": "已有刷卡帳款，未還清部分可能循環；帳單分期另申請，不會新撥一筆現金。",
    "rate": "例：玉山循環5.88%–15%、帳單分期6%–14%，查詢2026-11-09；2015年起循環法定上限15%，不能當所有費用上限。",
    "amount": "受信用額度和可分期帳款限制，未還本金持續占額度。",
    "term": "循環雖可按最低額繳，本金仍存在；帳單分期公開例有3、6、12、18、24期。",
    "call": "不因股價追繳；不還帳單會催收、傷信用，分期提前結清或終止依約。",
    "worst": "利息和費用累積，逾期會被求償並影響信用紀錄。",
    "forStock": "不行，台股不能直接刷卡交割；挪用還卡現金投資等於背卡債，部分投資交易也排除分期。",
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
    "how": "用名下汽車申請，備身分、行照和收入資料；審查車況、舊貸和抵押設定。",
    "rate": "例：中租集團教學約3.05%–16%，查詢2026-11-09；是教學概估，非正式報價，實際費率與總費用待查。",
    "amount": "看車輛剩餘價值、信用和舊貸；代還舊貸後實拿不同，成數待查。",
    "term": "依契約分期還本息，教學月付例不能當統一期限。",
    "call": "未見股票式維持率；逾期可能取回並處分車輛，提前到期條件待查。",
    "worst": "失去車輛可能影響生活工作，處分後仍可能欠差額。",
    "forStock": "契約限制要看；購車款限購車，原車融資也須核對用途。",
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
    "how": "把合格定存設質；開啟功能後，提款超過活存可能自動形成借款。",
    "rate": "例：板信按被動用定存利率加1.5個百分點，查詢2026-11-09；總年利率待查，不能把1.5%當總價。",
    "amount": "公開綜存例為質押定存總額九成五範圍。",
    "term": "看定存及借款契約，按當日最後借款餘額計息；到期扣抵安排待核。",
    "call": "不因股價追繳；逾期或到期未還，可能直接扣定存還債。",
    "worst": "定存被扣來還債，預備金消失，仍須負擔借貸利差。",
    "forStock": "契約限制要看；公開存款問答沒有承諾所有證券用途皆可。",
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
    "who": "證券金融公司與基金平台合作管道",
    "how": "同時開基金平台和證金借款戶，拿合格境內投信基金擔保；不是每檔基金都可。",
    "rate": "待查：行銷比較表的單一上限不是個別基金核定利率，現行完整報價未取得。",
    "amount": "基金市值最高6成，最低1,000元、每1,000元遞增；依標的審核。",
    "term": "每筆6個月，可審核展延2次至18個月；按日計息、到期繳息，須用現金還。",
    "call": "整戶低於140%，通知後3營業日補；140%以上暫緩。各筆補至167%以上、整戶自然回180%以上或補足通知差額等才取消紀錄；分母含應收息。",
    "worst": "基金被處分，虧損實現後仍可能有未還借款。",
    "forStock": "契約限制要看；公開列應急用途，再投資條款待查。",
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
    "how": "開借貸戶，把合格公債、公司債或金融債轉入擔保專戶；不是拿債券ETF當直接債券。",
    "rate": "例：元大不限用途年利率6.25%，查詢2026-11-09；個案加減碼另核。",
    "amount": "中央登錄公債按面額80%，地方政府、公司與金融債等按面額60%；券商可更嚴。",
    "term": "依不限用途契約，原6個月，可審核展延。",
    "call": "適用該戶130%追繳及166%解除框架；債券計價基礎不同，不能全套股票市值公式。",
    "worst": "到期或擔保不足被處分，不足清償的部分仍被追償。",
    "forStock": "可以，這列屬不限用途；不能推成所有銀行海外債或信託債券都能借。",
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
    "who": "政府公告、承辦銀行受理",
    "how": "限當期生活困難、勞保年資滿15年等資格，也要符合無欠保費及舊貸等條件。",
    "rate": "例：勞保局2025-12-05公告2.165%，查詢2026-11-09；本人現行利率待查。",
    "amount": "該梯每人最高10萬元。",
    "term": "3年，前6個月繳息、第7個月起還本息；受理2025-12-15至2026-01-02，已截止。",
    "call": "不因股價追繳；未還款可能從未來勞保給付扣減。",
    "worst": "未還款影響未來保險給付，還款義務仍存在。",
    "forStock": "不行，這是生活紓困方案；依方案目的保守判讀，逐條禁買股規定未取得。",
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
    "who": "依法許可的當舖",
    "how": "交付可收當的動產並取得當票；股票、有價證券和存款憑證不能收當。",
    "rate": "實際年利率待查；2026-11-09查得當舖業法最高30%、倉棧費最高為收當金額5%，不是推薦報價。",
    "amount": "依物品估價協議，沒有全國固定成數。",
    "term": "滿當期至少3個月；滿期後5日內仍可取贖或繳息順延，否則依規定流當。",
    "call": "不是股票式追繳；到期未取贖或順延，物品所有權會移轉。",
    "worst": "失去質當物；若另簽借據或本票，還要核對額外法律責任。",
    "forStock": "契約限制要看；只當高成本與失去質當物的最壞例子，不建議。",
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
    "how": "確認出借人、實拿本金、借據、費用和擔保；若簽本票，要看清楚條款。",
    "rate": "實際年利率待查；2026-11-09查民法205條，約定利率超過16%部分無效，206條禁止巧取利益；不是市場行情。",
    "amount": "雙方約定，沒有統一成數。",
    "term": "依約還本付息；月息及預扣費不能冒稱低年利率。",
    "call": "有擔保可能依法及依約處分；沒有共同股票追繳線，逾期仍可被訴追或執行。",
    "worst": "可能有本金費用爭議、失去擔保資產及被追償，違法討債另有法律風險。",
    "forStock": "契約限制要看；未限用途也不代表安全，只列最壞例子，不建議。",
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
    "how": "講清楚是借款而非贈與，留存借據、匯款紀錄、利息和到期安排。",
    "rate": "待查：由雙方議定，可不計息，沒有統一市場利率；仍受民法相關限制。",
    "amount": "看雙方協議，沒有銀行統一額度。",
    "term": "依約返還；未定期限時的催告與返還依民法478條。",
    "call": "沒押股票時不因股價追繳，但到期仍可被催還、求償或強制執行。",
    "worst": "投資虧了還欠親友本金，也可能損害關係。",
    "forStock": "契約限制要看；親友同意用途不代表一定賺錢或不用還。",
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
    "how": "已有他行房貸，再把同一房屋設後順位抵押；審查收入及房屋還剩多少擔保空間。",
    "rate": "例：國泰世華3.45%起，APR範例貸款年利率3.45%–15%，費用為貸款額1%；基準2025-05-24，查詢2026-11-09。APR含利息及費用。",
    "amount": "公開例20萬–150萬元，房屋不一定都能核足。",
    "term": "公開例最長10年，依契約分期還本息。",
    "call": "沒有股票式每日追繳；逾期可能被要求清償並處分抵押房屋。",
    "worst": "房屋被拍賣，先還前順位後，仍可能有未清借款。",
    "forStock": "契約限制要看；未確認所有買股用途都受理。",
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
    "how": "已賣出股票但錢還沒到帳，用這筆應收交割款設質，開不限用途借貸戶申請。",
    "rate": "待查：此子產品的實際年利率未取得，不能套一般股票借款牌告。",
    "amount": "依應收付淨額扣已借與費用；公開例最低5,000元。",
    "term": "成交後第2營業日交割時自動扣還；公開例不接受提前還款，假日也可能算息。",
    "call": "應收交割款不列一般維持率；交割異常或不足額仍須按契約處理。",
    "worst": "先領的款項花掉後，交割扣還和其他支出可能形成現金缺口。",
    "forStock": "可以，屬不限用途架構；仍要留下交割與扣抵債務所需現金。",
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
    "how": "符合學籍、家庭條件，備繳費和身分資料；依規定提供保證人並辦對保確認契約。",
    "rate": "例：臺銀問答學生負擔0.775%，2026-08-01起補貼口徑，查詢2026-11-09；會浮動且依補貼身分不同。",
    "amount": "依學雜費、合格住宿、書籍及生活必要支出核定。",
    "term": "依教育貸款規定分期還款；緩繳須核准。",
    "call": "不因股價追繳；逾期可向學生與連帶保證人求償並影響信用。",
    "worst": "學生和保證人被追債，金融信用受損。",
    "forStock": "不行，限教育必要支出，多由銀行撥學校，不是買股融資。",
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
    "how": "把合格櫃買黃金現貨轉入擔保專戶，不等於拿金飾或任何黃金存摺去借。",
    "rate": "例：元大不限用途年利率6.25%，查詢2026-11-09；黃金個案加減碼待查。",
    "amount": "按前一營業日收市均價60%；是否接受和實際成數仍依券商核定。",
    "term": "依不限用途借貸契約，原6個月，可審核展延。",
    "call": "依整戶130%追繳、166%解除等流程；依規定更新黃金價格，契約可另約定。",
    "worst": "金價變動或欠款到期，擔保被處分後仍可能欠差額。",
    "forStock": "可以，屬不限用途；先確認目前受理品種，不是所有黃金都能借。",
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
    "how": "為這筆證券交割資金申請，提供已買證券等擔保並開借貸戶。",
    "rate": "例：元大年利率7.5%，查詢2026-11-09；子產品費用另核。",
    "amount": "依交割需求及擔保品核定，統一成數待查。",
    "term": "短期T+5型；起算、假日和續借限制待核契約，不能當長期額度。",
    "call": "不能套不限用途整戶追繳線；短期補擔保及處分條款待查，到期未還仍有處分風險。",
    "worst": "短期到期還不出，擔保被賣掉仍可能欠差額。",
    "forStock": "可以，限這筆證券交割，不能任意當現金使用。",
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
    "how": "為證券交割相關需求，用持有或買進的證券擔保，按規定申請。",
    "rate": "例：元大年利率6.25%，查詢2026-11-09。",
    "amount": "依擔保規則及個別審核，不直接套不限用途額度。",
    "term": "半年型；能否展延及還本付息方式看個別契約。",
    "call": "指定類型低於130%追繳，2營業日補至高於166%；有逐筆計算等規定，不能混入不限用途整戶計算。",
    "worst": "擔保被處分形成虧損，差額仍欠，也可能無法展延。",
    "forStock": "可以，限證券交割用途，不是任意投資或生活週轉授權。",
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
    "how": "為認購有價證券的資金需求，以認購證券等按規定擔保。",
    "rate": "例：元大年利率6.25%，查詢2026-11-09；不是無息墊款。",
    "amount": "依認購款、標的及券商核定，成數待查。",
    "term": "期限、何時開始計息與如何歸還看契約，不能直接套半年型。",
    "call": "依特定認購擔保和期限分類；完整補擔保數字待查，逾期可處分。",
    "worst": "證券下跌或無法及時賣出，到期仍須還款，處分也可能不夠。",
    "forStock": "可以，限認購合格有價證券，不能挪作其他股票交割。",
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
    "fact": "利率不等於風險上限；股票擔保會隨價格更新而追繳，信貸則有月付和信用負擔。"
  },
  {
    "myth": "所有股票借款都在同一維持率追繳。",
    "fact": "券商、信用交易、證金與銀行各有規則；基金借款的分母還可能含應收利息。"
  },
  {
    "myth": "回到追繳線，就解除追繳。",
    "fact": "暫不處分和取消追繳紀錄不同，再跌破可能須當日下午補款。"
  },
  {
    "myth": "融券公告利率就是借股成本。",
    "fact": "有些是券商付給客戶的價金或保證金利息；借股費與手續費還要另外看。"
  },
  {
    "myth": "出借股票就是借錢投資。",
    "fact": "出借方提供股票並可能收費；借入方付費且要還股票，方向相反。"
  },
  {
    "myth": "理財型房貸沒動用，就完全沒成本。",
    "fact": "沒動用雖不生借款利息，仍可能有開辦費；動用後只繳息也沒減少本金。"
  },
  {
    "myth": "保單借款不影響保險。",
    "fact": "未還本息達到條款限制可能讓保單停效，理賠也可能先扣欠款。"
  },
  {
    "myth": "信用卡循環法定上限，就是全部費用上限。",
    "fact": "循環利率和每筆預借手續費不同，銀行費率不等於法定數字。"
  },
  {
    "myth": "刷卡投資等於免息拿銀行錢。",
    "fact": "挪用還卡現金投資，等於背循環或分期卡債；台股不能直接刷卡交割，部分投資也不能分期。"
  },
  {
    "myth": "房貸最高成數，就是額外能領的金額。",
    "fact": "要重新估房價，扣原餘額並審收入負債；不能在原房貸外再加一整份成數。"
  },
  {
    "myth": "斷頭後交出擔保品就不欠錢。",
    "fact": "斷頭是強制賣出擔保品；賣款不夠仍可追償，跌停也可能賣不掉。"
  },
  {
    "myth": "政府低利貸款隨時能拿來買股。",
    "fact": "紓困有期間與生活困難資格，就學限教育費；青創對象是合格事業。"
  }
];

export const LOAN_OPEN = [
  "銀行股票質借的ETF接受清單、成數、期限及追繳條款待查，不能借用券商門檻。",
  "證金的純股票借款利率與契約待查，不能套同一公司基金借貸的追繳規則。",
  "公開問答的追繳文字有簡寫差異；回到暫不處分線不等於取消追繳，要核對完整流程。",
  "公開手續費有重複百分號的單位異常，實際費率單位待查，不能自行改成百分比或千分比。",
  "融券公告利率的資金方向與完整費用待查；須確認是付給客戶的利息，還是客戶的成本。",
  "保單的個人利率、停效比例和通知天數待查，公會概覽不能代替本人保單條款。",
  "基金借款的個別標的報價待查，行銷上限不能補成完整利率區間。",
  "債券擔保的券種與實際受理範圍待查；直接持債、銀行信託和債券ETF不能混用。",
  "黃金現貨擔保與實體金飾質當不同，不能推成所有黃金存摺都能辦。",
  "存單只有定存利率加碼公式，個人總利率、到期扣抵及超額借款條款待查。",
  "原車融資只有教學概估，實際總成本、期限、處分流程及扣舊貸後的實拿金額待查。",
  "勞工紓困的已公告梯次已截止，目前新申請與本人利率待查；不能推定下年度條件相同，也不額外推論逐條禁買股法規。",
  "青創是合格事業的營運與設備用途；其他政府專案要逐一查對象，不能通稱個人投資貸款。",
  "當舖與民間借貸適用法律不同，不能任選較高利率上限；實際報價待查，均只列最壞例子。",
  "T+5、半年型和認股融通是否開辦、實際期限、認股範圍及補擔保契約仍待核。",
  "截至2026-11-09，不預先採用2026-11-15才生效的規章第6條；追繳看第54、55條，銀行與證金契約另核。",
  "現金卡、P2P及雇主借款的現行受理方案待查；法律有規定不等於目前能申辦，私人安排歸親友或民間類。"
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
