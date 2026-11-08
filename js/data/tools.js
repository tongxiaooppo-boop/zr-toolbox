// 首頁卡片與捷徑清單。status 'ready' 才會在首頁可點；新工具做完時把 status 改成 'ready'。
// terms：這個工具頁會用到的術語 id（必須存在於 glossary.js，測試會檢查）。
export const TOOLS = Object.freeze([
  { id: 'calc-guide', no: '①', title: '朋友那格計算機怎麼用', oneLine: '原「正二平衡計算器」逐欄白話教學', href: 'tools/calc-guide.html', gate: 3, status: 'planned', terms: [] },
  { id: 'trigger5050', no: '②', title: '50/50 觸發提醒', oneLine: '正二漲跌一半時，配回正二、現金各半', href: 'tools/trigger5050.html', gate: 0, status: 'ready', terms: ['daily-2x', 'rebalance', 'base-price'] },
  { id: 'rebalance', no: '③', title: '定期配比再平衡', oneLine: '60/40、532、442、433，股版與債版', href: 'tools/rebalance.html', gate: 1, status: 'planned', terms: [] },
  { id: 'pledge', no: '④', title: '質押壓力測試', oneLine: '大盤跌多少會被追繳？還款與補擔保分開算', href: 'tools/pledge.html', gate: 2, status: 'planned', terms: [] },
  { id: 'decay', no: '⑥', title: '正二不是兩倍？', oneLine: '每日 2 倍的複利偏離與波動耗損', href: 'tools/decay.html', gate: 2, status: 'planned', terms: [] },
  { id: 'drawdown', no: '⑧', title: '跌多少要漲多少才回本', oneLine: '最大回撤與回本所需漲幅', href: 'tools/drawdown.html', gate: 2, status: 'planned', terms: [] },
  { id: 'exposure', no: '⑪', title: '我現在等於幾倍大盤', oneLine: '持股＋正二＋借款的整體曝險倍數', href: 'tools/exposure.html', gate: 2, status: 'planned', terms: [] },
  { id: 'glossary', no: '⑫', title: '術語辭典', oneLine: 'Beta、維持率、口徑、再平衡……一句白話', href: 'tools/glossary.html', gate: 1, status: 'planned', terms: [] }
]);

export const SHORTCUTS = Object.freeze([
  { label: '朋友那格計算機怎麼用？', toolId: 'calc-guide' },
  { label: '我的正二要不要再平衡？', toolId: 'trigger5050' },
  { label: '質押買正二，跌多少會被追繳？', toolId: 'pledge' }
]);
