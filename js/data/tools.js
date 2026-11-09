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
  { id: 'rebalance', no: '③', group: 'variants', title: '定期配比再平衡', oneLine: '60/40、532、442、433，股版與債版', href: 'tools/rebalance.html', gate: 1, status: 'ready', terms: ['rebalance', 'beta', 'exposure'] },
  { id: 'calc-guide', no: '①', group: 'leverage', title: '朋友那格計算機怎麼用', oneLine: '原「正二平衡計算器」逐欄白話教學', href: 'tools/calc-guide.html', gate: 3, status: 'ready', terms: ['beta', 'exposure', 'basis', 'net-assets', 'leverage-ratio', 'daily-2x', 'closing-price', 'finmind-token'] },
  { id: 'exposure', no: '⑪', group: 'leverage', title: '我現在等於幾倍大盤', oneLine: '持股＋正二＋借款的整體曝險倍數', href: 'tools/exposure.html', gate: 2, status: 'ready', terms: ['exposure', 'beta', 'net-assets', 'basis', 'leverage-ratio'] },
  { id: 'pledge', no: '④', group: 'leverage', title: '質押壓力測試', oneLine: '大盤跌多少會被追繳？還款與補擔保分開算', href: 'tools/pledge.html', gate: 2, status: 'ready', terms: ['pledge', 'maintenance-ratio', 'margin-call'] },
  { id: 'drawdown', no: '⑧', group: 'stock', title: '跌多少要漲多少才回本', oneLine: '最大回撤與回本所需漲幅', href: 'tools/drawdown.html', gate: 2, status: 'ready', terms: ['drawdown', 'recovery-gain'] },
  { id: 'margin', no: '⑤', group: 'stock', title: '融資維持率', oneLine: '融資買股，跌到多少會被追繳', href: 'tools/margin.html', gate: 4, status: 'planned', terms: [] },
  { id: 'dca', no: '⑦', group: 'stock', title: '定期定額與年化報酬', oneLine: '每月扣款滾出多少、年化報酬怎麼算', href: 'tools/dca.html', gate: 4, status: 'planned', terms: [] },
  { id: 'cost', no: '⑨', group: 'stock', title: '買賣成本與損益', oneLine: '手續費、證交稅、零股、當沖，賣多少才不虧', href: 'tools/cost.html', gate: 4, status: 'ready', terms: ['broker-fee', 'transaction-tax', 'break-even-price', 'tick-size'] },
  { id: 'dividend', no: '⑩', group: 'stock', title: '股息殖利率與除權息', oneLine: '殖利率、除息後股價、填息', href: 'tools/dividend.html', gate: 4, status: 'planned', terms: [] }
]);

export const SHORTCUTS = Object.freeze([
  { label: '朋友那格計算機怎麼用？', toolId: 'calc-guide' },
  { label: '我的正二要不要再平衡？', toolId: 'trigger5050' },
  { label: '質押買正二，跌多少會被追繳？', toolId: 'pledge' }
]);
