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
    related: ['rebalance']
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
    related: ['rebalance']
  }
]);

export const TERM_BY_ID = Object.freeze(Object.fromEntries(GLOSSARY.map(t => [t.id, t])));
