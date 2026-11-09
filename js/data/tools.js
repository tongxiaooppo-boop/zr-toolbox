// 首頁卡片與捷徑清單。status 'ready' 才會在首頁可點；新工具做完時把 status 改成 'ready'。
// group：首頁分組（使用者 2026-11-08：正二教學／正二變種／正二槓桿／其他股票計算機）。
// terms：這個工具頁會用到的術語 id（必須存在於 glossary.js，測試會檢查）。
export const GROUPS = Object.freeze([
  { id: 'learn', title: '正二教學' },
  { id: 'variants', title: '正二變種做法' },
  { id: 'leverage', title: '正二加槓桿' },
  { id: 'stock', title: '其他股票計算機' }
]);

export const TOOLS = Object.freeze([
  { id: 'decay', no: '⑥', group: 'learn', title: '正二不是兩倍？', oneLine: '每日 2 倍的複利偏離與波動耗損', href: 'tools/decay.html', gate: 2, status: 'ready', terms: ['daily-2x', 'volatility-decay', 'tracking-error'] },
  { id: 'glossary', no: '⑫', group: 'learn', title: '術語辭典', oneLine: 'Beta、維持率、口徑、再平衡……一句白話', href: 'tools/glossary.html', gate: 1, status: 'ready', terms: [] },
  { id: 'trigger5050', no: '②', group: 'variants', title: '50/50 觸發提醒', oneLine: '正二漲跌一半時，配回正二、現金各半', href: 'tools/trigger5050.html', gate: 0, status: 'ready', terms: ['daily-2x', 'rebalance', 'base-price'] },
  { id: 'rebalance', no: '③', group: 'variants', title: '定期配比再平衡', oneLine: '多檔照比例配回，算出每檔要買賣幾股', href: 'tools/rebalance.html', gate: 1, status: 'ready', terms: ['rebalance', 'beta', 'exposure'] },
  { id: 'calc-guide', no: '①', group: 'leverage', title: '朋友那格計算機怎麼用', oneLine: '原「正二平衡計算器」逐欄白話教學', href: 'tools/calc-guide.html', gate: 3, status: 'ready', terms: ['beta', 'exposure', 'basis', 'net-assets', 'leverage-ratio', 'daily-2x', 'closing-price', 'finmind-token'] },
  { id: 'exposure', no: '⑪', group: 'leverage', title: '正二要買多少', oneLine: '想要整體等於幾倍大盤？算出正二要買賣多少、錢夠不夠', href: 'tools/exposure.html', gate: 7, status: 'ready', terms: ['exposure', 'beta', 'net-assets', 'basis', 'leverage-ratio', 'daily-2x'] },
  { id: 'pledge', no: '④', group: 'leverage', title: '質押壓力測試', oneLine: '大盤跌多少會被追繳？還款與補擔保分開算', href: 'tools/pledge.html', gate: 2, status: 'ready', terms: ['pledge', 'maintenance-ratio', 'margin-call'] },
  { id: 'lifelev', no: '⑬', group: 'leverage', title: '人生槓桿體檢', oneLine: '房貸、信貸、質押一起算：你其實開了幾倍槓桿？', href: 'tools/lifelev.html', gate: 5, status: 'ready', terms: ['financial-net', 'life-multiple', 'exposure', 'leverage-ratio'] },
  { id: 'kelly', no: '⑭', group: 'leverage', title: '幾倍槓桿最划算', oneLine: '凱利倍數：倍數對長期報酬，過頭反而賺更少', href: 'tools/kelly.html', gate: 5, status: 'ready', terms: ['kelly', 'volatility', 'leverage-ratio', 'daily-2x'] },
  { id: 'drawdown', no: '⑧', group: 'stock', title: '跌多少要漲多少才回本', oneLine: '最大回撤與回本所需漲幅', href: 'tools/drawdown.html', gate: 2, status: 'ready', terms: ['drawdown', 'recovery-gain'] },
  { id: 'margin', no: '⑤', group: 'stock', title: '融資融券維持率', oneLine: '融資、融券、整戶維持率：跌多少被追繳、要補多少', href: 'tools/margin.html', gate: 4, status: 'ready', terms: ['margin-trading', 'short-selling', 'account-ratio', 'margin-call'] },
  { id: 'dca', no: '⑦', group: 'stock', title: '定期定額與年化報酬', oneLine: '每月扣款滾出多少、年化報酬怎麼算', href: 'tools/dca.html', gate: 4, status: 'ready', terms: ['dca', 'compound-interest', 'cagr'] },
  { id: 'cost', no: '⑨', group: 'stock', title: '買賣成本與損益', oneLine: '手續費、證交稅、零股、當沖，賣多少才不虧', href: 'tools/cost.html', gate: 4, status: 'ready', terms: ['broker-fee', 'transaction-tax', 'break-even-price', 'tick-size'] },
  { id: 'avgcost', no: '⑮', group: 'stock', title: '平均成本與攤平', oneLine: '分好幾次買，平均每股多少錢？再買多少能攤到目標價', href: 'tools/avgcost.html', gate: 4, status: 'ready', terms: ['average-cost', 'averaging-down', 'broker-fee', 'break-even-price'] },
  { id: 'dividend', no: '⑩', group: 'stock', title: '股息與除權息', oneLine: '領多少股利、扣多少健保費、除息後股價、填息', href: 'tools/dividend.html', gate: 4, status: 'ready', terms: ['ex-dividend', 'dividend-yield', 'fill-dividend', 'nhi-premium'] },
  { id: 'valuation', no: '⑯', group: 'stock', title: '股價估價', oneLine: '用本益比、本淨比、殖利率算便宜價、合理價、昂貴價', href: 'tools/valuation.html', gate: 4, status: 'planned', terms: ['eps', 'pe-ratio', 'pb-ratio', 'dividend-yield'] },
  { id: 'divtax', no: '⑰', group: 'stock', title: '股利要怎麼報稅', oneLine: '股利合併計稅還是分開計稅，哪一種繳比較少', href: 'tools/divtax.html', gate: 4, status: 'planned', terms: ['dividend-tax', 'dividend-yield', 'nhi-premium'] },
  { id: 'fx', no: '⑱', group: 'stock', title: '換匯成本與海外損益', oneLine: '換外幣的價差、匯率變動，換回台幣到底賺多少', href: 'tools/fx.html', gate: 4, status: 'planned', terms: ['fx-spread'] },
  { id: 'retire', no: '⑲', group: 'stock', title: '退休提領', oneLine: '退休存的錢每月能領多少、要存多少才夠', href: 'tools/retire.html', gate: 4, status: 'ready', terms: ['four-percent-rule', 'inflation', 'real-value', 'compound-interest'] }
]);

export const SHORTCUTS = Object.freeze([
  { label: '我的正二要買多少？', toolId: 'exposure' },
  { label: '朋友那格計算機怎麼用？', toolId: 'calc-guide' },
  { label: '我的正二要不要再平衡？', toolId: 'trigger5050' },
  { label: '質押買正二，跌多少會被追繳？', toolId: 'pledge' }
]);
