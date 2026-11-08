// 共用檢查（自 D:\ok\zr-calc\research-model.js 移植）。
export function nonnegative(values) {
  if (values.some(v => !Number.isFinite(v) || v < 0)) throw new Error('請填入完整、有效且非負的數字。');
}
export function dateParts(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('請填入有效日期。');
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('日期不存在。');
  return date;
}
