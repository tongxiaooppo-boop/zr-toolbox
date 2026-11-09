// 用代號抓 FinMind 最近收盤價＋token 存取（v5 新增）。唯一會連網路的模組；core 仍然不碰網路。
// 規則（使用者 2026-11-08／11-09）：token 只存在使用者自己的瀏覽器（localStorage），只送給 FinMind；
// 沒有 token 也先匿名查（每小時 300 次），查不到才請使用者手動填現價。錯誤處理一律照 core/finmind.js 的 finmindAction。
import { finmindAction } from '../core/finmind.js';

const API = 'https://api.finmindtrade.com/api/v4/data';
const TOKEN_KEY = 'zr-toolbox.finmind-token';

/** 查詢網址：最近 14 天的日線（涵蓋連假），token 有值才帶 */
export function priceUrl(code, token, today = new Date()) {
  const d = new Date(today.getTime() - 14 * 864e5);
  const ymd = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const u = new URL(API);
  u.searchParams.set('dataset', 'TaiwanStockPrice');
  u.searchParams.set('data_id', code);
  u.searchParams.set('start_date', ymd);
  if (token) u.searchParams.set('token', token);
  return u.toString();
}

async function once(code, token, fetchFn, today) {
  try {
    const res = await fetchFn(priceUrl(code, token, today));
    let j = null; try { j = await res.json(); } catch { /* 非 JSON 回應 */ }
    return { status: j?.status ?? res.status, data: j?.data };
  } catch { return { status: 0, data: null }; } // 斷網、CORS
}

/**
 * @param {string} code 已 normalizeCode 過的代號
 * @param {{token?:string, fetchFn?:Function, today?:Date}} opt fetchFn／today 給測試注入
 * @returns {Promise<{ok:true, close:number, date:string, clearToken:boolean} | {ok:false, action:string, message:string}>}
 */
export async function fetchClose(code, { token = '', fetchFn = globalThis.fetch, today = new Date() } = {}) {
  let r = await once(code, token, fetchFn, today);
  let a = finmindAction({ status: r.status, usedToken: !!token, retried: false });
  let clearToken = false;
  if (a.action === 'retry-without-token') {
    r = await once(code, '', fetchFn, today);
    a = finmindAction({ status: r.status, usedToken: false, retried: true });
    clearToken = a.action === 'ok'; // 不帶 token 才查得到，證明是 token 壞掉
  }
  if (a.action !== 'ok') return { ok: false, action: a.action, message: a.message };
  const last = Array.isArray(r.data) && r.data.length ? r.data[r.data.length - 1] : null;
  if (!last || !(last.close > 0)) return { ok: false, action: 'stop', message: `查無 ${code} 的股價，請確認代號，或手動填現價。` };
  return { ok: true, close: last.close, date: last.date, clearToken };
}

// localStorage 在私密模式或被封鎖時會丟例外，一律包起來；讀不到就當沒有 token。
export function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
export function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); return true; } catch { return false; } }
