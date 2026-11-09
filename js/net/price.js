// 用代號抓 FinMind 最近收盤價＋token 存取（v5 新增）。唯一會連網路的模組；core 仍然不碰網路。
// 規則（使用者 2026-11-08／11-09）：token 只存在使用者自己的瀏覽器（localStorage），只送給 FinMind；
// 沒有 token 也先匿名查（每小時 300 次），查不到才請使用者手動填現價。錯誤處理一律照 core/finmind.js 的 finmindAction。
import { finmindAction } from '../core/finmind.js';

const API = 'https://api.finmindtrade.com/api/v4/data';
const TOKEN_KEY = 'zr-toolbox.finmind-token';

const ymdOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/**
 * 查詢網址：today 往前 14 天的日線（涵蓋連假），token 有值才帶。
 * endDate（v5.6，② 抓「上次配回日」的收盤價）：有值才帶 end_date，today 要傳同一天。
 */
export function priceUrl(code, token, today = new Date(), endDate = '') {
  const u = new URL(API);
  u.searchParams.set('dataset', 'TaiwanStockPrice');
  u.searchParams.set('data_id', code);
  u.searchParams.set('start_date', ymdOf(new Date(today.getTime() - 14 * 864e5)));
  if (endDate) u.searchParams.set('end_date', endDate);
  if (token) u.searchParams.set('token', token);
  return u.toString();
}

async function once(code, token, fetchFn, today, endDate = '') {
  try {
    const res = await fetchFn(priceUrl(code, token, today, endDate));
    let j = null; try { j = await res.json(); } catch { /* 非 JSON 回應 */ }
    return { status: j?.status ?? res.status, data: j?.data };
  } catch { return { status: 0, data: null }; } // 斷網、CORS
}

/**
 * @param {string} code 已 normalizeCode 過的代號
 * @param {{token?:string, fetchFn?:Function, today?:Date}} opt fetchFn／today 給測試注入
 * @returns {Promise<{ok:true, close:number, date:string, clearToken:boolean} | {ok:false, action:string, message:string}>}
 */
export async function fetchClose(code, { token = '', fetchFn = globalThis.fetch, today = new Date(), endDate = '' } = {}) {
  let r = await once(code, token, fetchFn, today, endDate);
  let a = finmindAction({ status: r.status, usedToken: !!token, retried: false });
  let clearToken = false;
  if (a.action === 'retry-without-token') {
    r = await once(code, '', fetchFn, today, endDate);
    a = finmindAction({ status: r.status, usedToken: false, retried: true });
    clearToken = a.action === 'ok'; // 不帶 token 才查得到，證明是 token 壞掉
  }
  if (a.action !== 'ok') return { ok: false, action: a.action, message: a.message };
  const rows = Array.isArray(r.data) ? r.data.filter(x => !endDate || x.date <= endDate) : [];
  const last = rows.length ? rows[rows.length - 1] : null;
  if (!last || !(last.close > 0)) return { ok: false, action: 'stop', message: `查無 ${code} 的股價，請確認代號，或手動填現價。` };
  return { ok: true, close: last.close, date: last.date, clearToken };
}

/**
 * 某一天的收盤價（v5.6，② 基準價）：那天沒開盤就用之前最近一個交易日，回傳的 date 是實際用到的那天。
 * @param {string} date 'YYYY-MM-DD'，不能是未來
 * 注意：FinMind 日線是未還原價格，這段期間有分割／合併時舊價格不能直接比（core 的 trigger5050Plan 會標 suspectSplit）。
 */
export async function fetchCloseOn(code, date, { token = '', fetchFn = globalThis.fetch } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return { ok: false, action: 'stop', message: '日期格式不對。' };
  const [y, m, d] = date.split('-').map(Number);
  const r = await fetchClose(code, { token, fetchFn, today: new Date(y, m - 1, d), endDate: date });
  if (!r.ok && /^查無/.test(r.message)) return { ...r, message: `查無 ${code} 在 ${date} 前後的收盤價，請確認日期，或手動填基準價。` };
  return r;
}

// localStorage 在私密模式或被封鎖時會丟例外，一律包起來；讀不到就當沒有 token。
export function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
export function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); return true; } catch { return false; } }
