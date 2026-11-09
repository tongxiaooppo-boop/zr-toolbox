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

const EVENT_SETS = { split: 'TaiwanStockSplitPrice', dividend: 'TaiwanStockDividendResult', reduction: 'TaiwanStockCapitalReductionReferencePrice' };

/**
 * 股票事件（v5.7）：since 之後（含）的分割／反分割、除權息、減資原始列，交給 core/events.js 的 normalizeEvents。
 * 三個資料集各查一次；任一個失敗就整個回失敗（事件缺一筆，換算就會錯）。token 壞掉照 fetchClose 的規則改匿名重試。
 * @returns {Promise<{ok:true, raw:{split:object[], dividend:object[], reduction:object[]}, clearToken:boolean} | {ok:false, action:string, message:string}>}
 */
export async function fetchEvents(code, since, { token = '', fetchFn = globalThis.fetch } = {}) {
  const raw = {}; let clearToken = false;
  const get = async (dataset, t) => {
    const u = new URL(API);
    u.searchParams.set('dataset', dataset); u.searchParams.set('data_id', code); u.searchParams.set('start_date', since);
    if (t) u.searchParams.set('token', t);
    try {
      const res = await fetchFn(u.toString());
      let j = null; try { j = await res.json(); } catch { /* 非 JSON 回應 */ }
      return { status: j?.status ?? res.status, data: j?.data };
    } catch { return { status: 0, data: null }; }
  };
  for (const [key, dataset] of Object.entries(EVENT_SETS)) {
    const t = clearToken ? '' : token;
    let r = await get(dataset, t);
    let a = finmindAction({ status: r.status, usedToken: !!t, retried: false });
    if (a.action === 'retry-without-token') {
      r = await get(dataset, '');
      a = finmindAction({ status: r.status, usedToken: false, retried: true });
      if (a.action === 'ok') clearToken = true;
    }
    if (a.action !== 'ok') return { ok: false, action: a.action, message: a.message };
    raw[key] = Array.isArray(r.data) ? r.data : [];
  }
  return { ok: true, raw, clearToken };
}

/**
 * 通用：查一個 FinMind 資料集（v5.11）。token 壞掉照 fetchClose 的規則改匿名重試一次。
 * @param {string} dataset
 * @param {Record<string,string>} params data_id、start_date、end_date…
 * @returns {Promise<{ok:true, rows:object[], clearToken:boolean} | {ok:false, action:string, message:string}>}
 */
export async function fetchDataset(dataset, params, { token = '', fetchFn = globalThis.fetch } = {}) {
  const get = async t => {
    const u = new URL(API);
    u.searchParams.set('dataset', dataset);
    for (const [k, v] of Object.entries(params)) if (v) u.searchParams.set(k, v);
    if (t) u.searchParams.set('token', t);
    try {
      const res = await fetchFn(u.toString());
      let j = null; try { j = await res.json(); } catch { /* 非 JSON 回應 */ }
      return { status: j?.status ?? res.status, data: j?.data };
    } catch { return { status: 0, data: null }; }
  };
  let r = await get(token);
  let a = finmindAction({ status: r.status, usedToken: !!token, retried: false });
  let clearToken = false;
  if (a.action === 'retry-without-token') {
    r = await get('');
    a = finmindAction({ status: r.status, usedToken: false, retried: true });
    clearToken = a.action === 'ok';
  }
  if (a.action !== 'ok') return { ok: false, action: a.action, message: a.message };
  return { ok: true, rows: Array.isArray(r.data) ? r.data : [], clearToken };
}

/**
 * ⑯ 本益比／淨值比／殖利率（證交所每日，FinMind TaiwanStockPER，v5.11）：today 往前 years 年到今天的每一天。
 * 最後一列＝最近一天（給 core/valuation.js 的 ratiosToBase）；全部列給 historyBands。
 * ETF 沒有本益比、淨值比（PER／PBR 是 0）。查無資料 → ok:false（action 'stop'）。
 * @returns {Promise<{ok:true, rows:object[], last:object, clearToken:boolean} | {ok:false, action:string, message:string}>}
 */
export async function fetchRatios(code, { years = 5, token = '', fetchFn = globalThis.fetch, today = new Date() } = {}) {
  const start = new Date(today); start.setFullYear(start.getFullYear() - years);
  const r = await fetchDataset('TaiwanStockPER', { data_id: code, start_date: ymdOf(start) }, { token, fetchFn });
  if (!r.ok) return r;
  if (!r.rows.length) return { ok: false, action: 'stop', message: `查無 ${code} 的本益比資料（上櫃、興櫃或 ETF 可能沒有），請自己填 EPS、每股淨值、股利。` };
  return { ok: true, rows: r.rows, last: r.rows[r.rows.length - 1], clearToken: r.clearToken };
}

/**
 * ⑱ 臺灣銀行牌告匯率（FinMind TaiwanExchangeRate，v5.11）：date 當天或之前最近一個營業日（往前找 14 天）。
 * @param {string} currency FX_CURRENCIES 的 code
 * @param {{date?:string}} opt date 'YYYY-MM-DD'，留白＝今天
 * @returns {Promise<{ok:true, row:object, date:string, clearToken:boolean} | {ok:false, action:string, message:string}>}
 *   row 原樣給 core/fx.js 的 ratePair。
 */
export async function fetchFxRate(currency, { date = '', token = '', fetchFn = globalThis.fetch, today = new Date() } = {}) {
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, action: 'stop', message: '日期格式不對。' };
  const end = date ? new Date(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) : today;
  const r = await fetchDataset('TaiwanExchangeRate', { data_id: currency, start_date: ymdOf(new Date(end.getTime() - 14 * 864e5)), end_date: ymdOf(end) }, { token, fetchFn });
  if (!r.ok) return r;
  const rows = r.rows.filter(x => x.date <= ymdOf(end));
  const last = rows[rows.length - 1];
  if (!last) return { ok: false, action: 'stop', message: `查無 ${currency} 在 ${ymdOf(end)} 前後的匯率，請自己填銀行的買入、賣出匯率。` };
  return { ok: true, row: last, date: last.date, clearToken: r.clearToken };
}

// localStorage 在私密模式或被封鎖時會丟例外，一律包起來；讀不到就當沒有 token。
export function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
export function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); return true; } catch { return false; } }
