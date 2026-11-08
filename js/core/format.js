// 數字輸入解析與顯示格式。純函式，不碰 DOM。
const FULL = '０１２３４５６７８９．，－';
const HALF = '0123456789.,-';

/** '1,234.5'、'１２３'、' 12 ' → 數字；空字串或非數字 → NaN */
export function parseNum(text) {
  const s = String(text ?? '').replace(/[０-９．，－]/g, c => HALF[FULL.indexOf(c)]).replace(/[,\s]/g, '');
  if (s === '' || !/^-?\d*\.?\d+$|^-?\d+\.$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
/** 1234.6 → 'NT$ 1,235'；非有限數 → '—' */
export function fmtMoney(n) {
  return Number.isFinite(n) ? 'NT$ ' + Math.round(n).toLocaleString('en-US') : '—';
}
/** 0.1234 → '12.3%' */
export function fmtPct(n, digits = 1) {
  return Number.isFinite(n * 100) ? (n * 100).toFixed(digits) + '%' : '—';
}
/** 1.4 → '1.40 倍' */
export function fmtX(n, digits = 2) {
  return Number.isFinite(n) ? n.toFixed(digits) + ' 倍' : '—';
}
