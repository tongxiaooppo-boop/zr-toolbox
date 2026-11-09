// 術語辭典資料。每筆欄位（測試會檢查）：
//   id      英文小寫連字號，唯一
//   term    畫面上的名稱
//   aka     別名陣列（可空）
//   plain   一句白話，≤ 40 字，不用其他術語
//   detail  2–3 句補充（可提公式，但先講白話）
//   example 一個具體數字例子，數字標成「例：」
//   related 相關術語 id（必須存在）
// 事實要有出處：寫法以 D:\ok\zr-calc\docs\正二策略重新調查-2026-11-08.md 為準；不確定就不寫。
export const GLOSSARY = Object.freeze([
  {
    id: 'daily-2x', term: '每日 2 倍', aka: ['正二', '槓桿 ETF'],
    plain: '正二追求的是「每一天」漲跌為大盤的 2 倍，不是一段時間的 2 倍。',
    detail: '因為每天重新槓桿，連續幾天下來的報酬會偏離「大盤報酬 × 2」。盤整來回震盪時通常比 2 倍差，單邊行情時可能比 2 倍好。',
    example: '例：大盤第一天 +10%、第二天 −10%，大盤共 −1%，正二約 −4%，不是 −2%。',
    related: ['rebalance', 'volatility-decay', 'tracking-error']
  },
  {
    id: 'rebalance', term: '再平衡', aka: ['配回'],
    plain: '漲多的賣一點、跌多的補一點，讓各部位回到原本設定的比例。',
    detail: '可以按時間做（例如每半年），也可以按條件做（例如正二漲跌 50%）。再平衡會產生交易成本，也可能在趨勢中提早賣掉強勢部位。',
    example: '例：正二 15 萬、現金 10 萬，配回各半＝正二賣 2.5 萬，兩邊各 12.5 萬。',
    related: ['daily-2x', 'base-price']
  },
  {
    id: 'base-price', term: '基準價', aka: [],
    plain: '上次配回各半時的正二價格，之後漲跌幅都跟它比。',
    detail: '每做完一次配回，就把當時的價格記成新的基準價。這個工具不會幫你記，請自己記下來。',
    example: '例：上次配回時正二 100 元，現在 150 元，相對基準 +50%。',
    related: ['rebalance', 'closing-price']
  },
  {
    id: 'beta', term: 'Beta', aka: ['β'],
    plain: '這一部分跟著大盤一起漲跌的程度。',
    detail: '本工具箱用近似值：原型（大盤 ETF）1、正二 2、現金與美債 0，美債 0 是簡化。這是教學用近似，不是統計算出來的值。',
    example: '例：正二 Beta 2，大盤某天漲 1%，正二那天約漲 2%。',
    related: ['exposure', 'daily-2x']
  },
  {
    id: 'exposure', term: '曝險', aka: ['曝險金額', 'Beta 曝險'],
    plain: '你手上的錢，有多少會跟著大盤漲跌。',
    detail: '會跟著大盤漲跌的金額，算法是各部位市值乘以 Beta，再全部加總。',
    example: '例：持股 1,000 萬（Beta 1）＋正二 130 萬（Beta 2）＝曝險 1,260 萬。',
    related: ['beta', 'basis', 'net-assets']
  },
  {
    id: 'net-assets', term: '淨資產', aka: ['自有資金'],
    plain: '把借來的錢扣掉後，真正屬於自己的錢。',
    detail: '總資產是持股加上現金；再扣掉借款，才是自己的錢。',
    example: '例：持股 1,000 萬＋現金 200 萬－借款 300 萬＝淨資產 900 萬。',
    related: ['exposure', 'leverage-ratio']
  },
  {
    id: 'basis', term: '口徑', aka: ['淨資產口徑', '總資產口徑'],
    plain: '算幾倍時，選哪個數字當分母。',
    detail: '算「幾倍大盤」時，淨資產口徑＝曝險÷淨資產；總資產口徑＝曝險÷總資產。原計算機有「口徑」欄位。',
    example: '例：曝險 1,000 萬、淨資產 900 萬、總資產 1,200 萬，淨資產口徑約 1.11 倍、總資產口徑約 0.83 倍。',
    related: ['exposure', 'net-assets']
  },
  {
    id: 'leverage-ratio', term: '資產槓桿', aka: [],
    plain: '手上全部的錢，是自己那份錢的幾倍。',
    detail: '總資產÷淨資產，用來看借了多少錢，和曝險倍數不是同一件事。',
    example: '例：總資產 1,200 萬、淨資產 900 萬，資產槓桿約 1.33 倍；再用 130 萬現金買正二後，淨資產口徑曝險是 1.4 倍，資產槓桿仍約 1.33 倍。',
    related: ['net-assets', 'basis']
  },
  {
    id: 'volatility-decay', term: '波動耗損', aka: ['複利偏離'],
    plain: '每天重設倍數，累積結果會偏離整段漲跌的兩倍。',
    detail: '每天重新槓桿會造成偏離。單邊趨勢時偏離可能是正的，不能用固定耗損率表示。',
    example: '例：大盤先漲 10% 再跌約 9.09% 會回到原點，理想每日 2 倍卻約虧 1.82%。',
    related: ['daily-2x', 'tracking-error']
  },
  {
    id: 'tracking-error', term: '追蹤誤差', aka: [],
    plain: '實際每天的漲跌，和原本要跟上的目標差多少。',
    detail: '正二實際每日漲跌和「指數×2」有差距，來源有費用、期貨等衍生工具，以及基金曝險不是每天剛好 200%。元大 00631L 揭露曝險範圍為 180%–220%。',
    example: '例：假設某天臺灣 50 漲 1%，理想是 +2%，正二實際 +1.9%，差的 0.1 個百分點就是追蹤誤差。',
    related: ['daily-2x', 'premium-discount']
  },
  {
    id: 'premium-discount', term: '折溢價', aka: ['溢價', '折價'],
    plain: '買賣價格比每一份真正值的錢，高了或低了多少。',
    detail: 'ETF 市價和淨值（每單位真正值多少）的差，就是折溢價。市價高於淨值叫溢價，低於叫折價；溢價時買進等於多付。',
    example: '例：淨值 100 元、市價 101 元，溢價 1%。',
    related: ['tracking-error']
  },
  {
    id: 'maintenance-ratio', term: '維持率', aka: ['擔保維持率'],
    plain: '押給券商的東西現在值多少，除以連利息在內欠的錢。',
    detail: '擔保品現在算多少錢，除以借款（含利息），就是維持率。',
    example: '例：持股算 100 萬、借 60 萬，維持率約 166.67%；持股跌 30% 後約 116.67%。',
    related: ['margin-call', 'pledge']
  },
  {
    id: 'margin-call', term: '追繳', aka: ['斷頭前通知'],
    plain: '押的東西不夠值錢了，要限時還錢或多押一些。',
    detail: '維持率跌破追繳線，就要在期限內還款或補擔保，否則可能被賣掉擔保品。追繳線多數券商契約是 130%，以你的契約為準（新光證券 2024.03 公開版為低於 130% 通知、166% 解除）。還款和補擔保擇一，需要的金額不一樣。',
    example: '例：維持率 116.67% 低於 130%，收到追繳。',
    related: ['maintenance-ratio', 'pledge']
  },
  {
    id: 'pledge', term: '質押', aka: ['不限用途借貸', '股票質押'],
    plain: '把持股押給券商，換成一筆借來的錢。',
    detail: '股票還是你的，但借款期間不能隨意賣。借來的錢拿去買正二，下跌時擔保品和正二會一起跌。',
    example: '例：持股 100 萬借 60 萬，維持率約 166.67%。',
    related: ['maintenance-ratio', 'margin-call']
  },
  {
    id: 'drawdown', term: '回撤', aka: ['最大回撤', 'MDD'],
    plain: '從前一個高點往下跌了多少。',
    detail: '回撤是從前一個高點往下跌的幅度；最大回撤是一段期間裡最大的那次。',
    example: '例：從 120 萬跌到 84 萬，回撤 30%。',
    related: ['recovery-gain']
  },
  {
    id: 'recovery-gain', term: '回本漲幅', aka: [],
    plain: '跌下來之後，要再漲多少才能回到原來的錢。',
    detail: '跌了 d 之後要漲 d÷(1−d) 才回本，跌越多要漲越多。',
    example: '例：跌 30% 要漲約 42.9%；跌 50% 要漲 100%。',
    related: ['drawdown']
  },
  {
    id: 'closing-price', term: '收盤價', aka: [],
    plain: '當天最後成交的價格。',
    detail: '台股 13:30 收盤，13:25–13:30 是收盤集合競價。本工具箱算漲跌用收盤價就夠。',
    example: '例：某天正二收盤 150 元，相對基準價 100 元是 +50%。',
    related: ['base-price']
  },
  {
    id: 'finmind-token', term: 'FinMind token', aka: ['API token'],
    plain: '查台股資料時用的通行證，像密碼一樣要保密。',
    detail: 'FinMind 是提供台股資料的免費服務；註冊免費會員拿到 token，每小時可查 600 次。超過次數會被擋（回應碼 402）；token 像密碼，不要貼給別人。',
    example: '例：一天查 20 檔股價，用免費會員 token 綽綽有餘。',
    related: ['closing-price']
  },
  {
    id: 'broker-fee', term: '手續費', aka: ['券商手續費', '低消'],
    plain: '買和賣都要付給券商的錢，有最低收費。',
    detail: '成交金額 × 0.1425% × 券商折扣，元以下捨去。算出來比最低手續費少，就收最低（整股常見 20 元、零股常見 1 元，依券商）。',
    example: '例：買 10 萬元股票，0.1425% 是 142.5 元，捨去後收 142 元；買 5,000 元只算到 7 元，仍收 20 元。',
    related: ['transaction-tax', 'break-even-price']
  },
  {
    id: 'transaction-tax', term: '證交稅', aka: ['證券交易稅'],
    plain: '賣出時才收、繳給政府的稅，買進不收。',
    detail: '賣出成交金額 × 稅率，元以下捨去。股票 0.3%、ETF 0.1%；債券 ETF 停徵到 2026-12-31；股票現股當沖 0.15% 到 2027-12-31，ETF 當沖仍是 0.1%。',
    example: '例：賣出 10 萬元的股票收 300 元；同樣金額的 ETF 收 100 元。',
    related: ['broker-fee', 'break-even-price']
  },
  {
    id: 'break-even-price', term: '損益兩平價', aka: ['不賠價'],
    plain: '賣在這個價格，扣完費用剛好不賺不賠。',
    detail: '賣出實拿（扣手續費和證交稅）剛好等於買入總成本的價格。實際掛單要對齊升降單位，所以要再往上取到掛得出去的價位。',
    example: '例：100 元買 1 張股票，理論損益兩平約 100.587 元；100–500 元每檔跳 0.5 元，要賣 101 元才不虧。',
    related: ['broker-fee', 'transaction-tax', 'tick-size']
  },
  {
    id: 'tick-size', term: '升降單位', aka: ['跳動點', '一檔'],
    plain: '股價每次最少能跳多少錢，掛單價格要對齊它。',
    detail: '股票：10 元以下 0.01、10–50 元 0.05、50–100 元 0.1、100–500 元 0.5、500–1000 元 1、1000 元以上 5。ETF：50 元以下 0.01、50 元以上 0.05。',
    example: '例：股價 120 元的股票只能掛 120、120.5、121……不能掛 120.3。',
    related: ['break-even-price']
  },
  {
    id: 'ex-dividend', term: '除權息', aka: ['除息', '除權', '參考價'],
    plain: '發股利那天，股價先扣掉發出去的部分，總值不變。',
    detail: '除息：股價扣掉每股現金股利。除權：配股後股數變多，股價依配股率往下調。參考價＝（除權息前收盤價 − 現金股利）÷（1 ＋ 配股率），配股率＝每股股票股利 ÷ 面額。股利是從公司的錢搬到你手上，不是多賺的。',
    example: '例：收盤 50 元，配現金 2.4 元、股票 0.5 元（配股率 5%），參考價＝47.6 ÷ 1.05 ≈ 45.33 元。',
    related: ['dividend-yield', 'fill-dividend', 'nhi-premium']
  },
  {
    id: 'dividend-yield', term: '殖利率', aka: ['現金殖利率', '成本殖利率'],
    plain: '一年領到的現金股利，占股價的比例。',
    detail: '現金殖利率＝每股現金股利 ÷ 股價；成本殖利率＝每股現金股利 ÷ 你的買入價。比較不同股票要用同一種分母。殖利率高不等於賺得多，除息後股價沒漲回來，總報酬一樣會虧。',
    example: '例：股價 50 元、每股配 2.4 元，現金殖利率 4.8%；如果你買在 40 元，成本殖利率是 6%。',
    related: ['ex-dividend', 'fill-dividend']
  },
  {
    id: 'fill-dividend', term: '填息', aka: ['填權', '填權息', '貼息'],
    plain: '除權息後，股價漲回除權息前一天的收盤價。',
    detail: '除權息當天股價先往下調；之後漲回原本的收盤價叫填息（有配股叫填權），一直沒漲回來叫貼息。填息不保證、也沒有期限。',
    example: '例：除息前 50 元、參考價 45.33 元，要漲約 10.29% 回到 50 元才算填權息。',
    related: ['ex-dividend', 'dividend-yield']
  },
  {
    id: 'nhi-premium', term: '二代健保補充保費', aka: ['補充保費', '二代健保'],
    plain: '單次股利達 2 萬元，先被扣 2.11% 的健保費。',
    detail: '一般身分：單次股利所得（現金股利＋股票股利以面額計）達 20,000 元，全額 × 2.11%，單次以 1,000 萬元為上限，由發放公司直接扣。符合免扣資格（依健保署）不扣；以雇主或自營業主身分投保另有規則。ETF 收益分配只有股利所得等部分計費，以配息通知為準。',
    example: '例：一次領現金股利 24,000 元＋股票股利面額 5,000 元，共 29,000 元，扣 612 元。',
    related: ['ex-dividend']
  }
]);

export const TERM_BY_ID = Object.freeze(Object.fromEntries(GLOSSARY.map(t => [t.id, t])));
