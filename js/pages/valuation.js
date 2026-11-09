// 工具⑯：計算只呼叫 core/valuation.js。
import { h, toolHeader, disclaimer, figure } from '../ui/components.js';
import { wizard, numberInput, explain, withHelp, tokenBox } from '../ui/wizard.js';
import { valuationPlan, ratiosToBase, historyBands, METHODS } from '../core/valuation.js';
import { normalizeCode } from '../core/holdings.js';
import { fetchClose, fetchCloseOn, fetchRatios, getToken, setToken } from '../net/price.js';
import { parseNum, fmtMoney, fmtPct } from '../core/format.js';
import { STOCK_NAMES } from '../data/stocks.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'valuation');
const num = id => parseNum(document.getElementById(id)?.value);
const blank = v => v === undefined || v === null || Number.isNaN(v);
const link = (href, text) => h('a', { href }, text);
const price2 = n => (+n.toFixed(2)).toLocaleString('zh-TW') + ' 元';
const params = s => ({ price: s.price, eps: s.eps, bvps: s.bvps, dividend: s.dividend, pe: s.pe, pb: s.pb, yields: (s.yieldPct || []).map(x => x / 100) });
const failure = r => r.message + (r.action === 'show-quota-guide' ? ' 申請方式見下方 token 說明。' : '');
let fetched = null;
const steps = [
  {
    title: '哪一檔、現在多少錢',
    hint: '填代號會自動抓收盤價和證交所的本益比資料；沒有代號（或上櫃、ETF 抓不到）就自己填現價。',
    about: '估價是拿現價跟你算出來的便宜價、合理價、昂貴價比。',
    body: s => {
      const name = h('span', { class: 'holding-name' }, STOCK_NAMES[s.code] || '');
      const code = h('input', { id: 'code', type: 'text', autocomplete: 'off', autocapitalize: 'characters', placeholder: '例：2330', value: s.code || '' });
      const status = h('small', { class: 'holding-status', 'aria-live': 'polite' });
      const price = numberInput({ id: 'price', label: '現價', plain: '輸入代號後自動帶入', suffix: '元', value: s.price });
      let seq = 0;
      code.addEventListener('change', async () => {
        const my = ++seq, c = normalizeCode(code.value);
        fetched = null;
        name.textContent = STOCK_NAMES[c] || '';
        if (!c) { status.textContent = code.value.trim() ? '代號格式不對，例：2330、00631L。' : ''; return; }
        code.value = c;
        status.textContent = '查詢 ' + c + ' 收盤價和本益比資料…';
        const token = getToken();
        try {
          const [p, r] = await Promise.all([fetchClose(c, { token }), fetchRatios(c, { token })]);
          if (my !== seq || !code.isConnected) return;
          if (p.clearToken || r.clearToken) setToken('');
          if (p.ok) price.querySelector('input').value = String(p.close);
          if (r.ok) {
            // 證交所比率要配「同一天」的收盤價反推，現價可能比比率資料新（Opus 驗收補）
            let close = p.ok && p.date === r.last.date ? p.close : NaN;
            if (Number.isNaN(close)) {
              const q = await fetchCloseOn(c, r.last.date, { token: getToken() });
              if (my !== seq || !code.isConnected) return;
              if (q.ok && q.date === r.last.date) close = q.close;
            }
            fetched = { code: c, rows: r.rows, last: r.last, close };
          }
          status.textContent = (p.ok ? `現價 ${p.close}（${p.date} 收盤）；` : failure(p) + '；') +
            (r.ok ? `證交所 ${r.last.date}：本益比 ${r.last.PER || '—'}、淨值比 ${r.last.PBR || '—'}、殖利率 ${r.last.dividend_yield}%，下一步自動帶入。` : failure(r));
        } catch {
          if (my === seq && code.isConnected) { fetched = null; status.textContent = '查詢失敗，請稍後再試，或自己填現價和每股數字。'; }
        }
      });
      return [withHelp(h('div', { class: 'field' }, h('label', { for: 'code' }, '股票代號（選填） ', name), h('small', { class: 'plain-sub' }, '例：2330；ETF 沒有本益比'), code, status), { text: ['填好後自動抓最近收盤價和證交所資料；抓不到就自己填。'] }), price, tokenBox()];
    },
    read: s => {
      s.code = normalizeCode(document.getElementById('code')?.value) || ''; s.price = num('price');
      if (!(s.price > 0)) throw new Error('請填現價。');
      if (fetched && fetched.code === s.code && s.autoFrom !== s.code) {
        const b = ratiosToBase(fetched.close > 0 ? fetched.close : s.price, fetched.last);
        const r2 = x => (x === null ? NaN : +x.toFixed(2));
        s.eps = r2(b.eps); s.bvps = r2(b.bvps); s.dividend = r2(b.dividend);
        s.bands = historyBands(fetched.rows); s.ratioDate = fetched.last.date; s.autoFrom = s.code;
      } else if (s.code !== s.autoFrom) { s.bands = null; s.ratioDate = ''; s.autoFrom = ''; }
      steps[1].hint = s.ratioDate ? '已用證交所 ' + s.ratioDate + ' 的資料反推帶入，可以改成你自己的數字。' : '到公司財報或財經網站查；不知道的留白，那個方法就不算。';
    }
  },
  {
    title: '每股數字', hint: '到公司財報或財經網站查；不知道的留白，那個方法就不算。',
    about: '三種方法各用一個每股數字：EPS 給本益比法、每股淨值給本淨比法、每年股利給殖利率法。',
    body: s => [
      numberInput({ id: 'eps', label: '每股盈餘 EPS', termId: 'eps', plain: '近四季加起來；虧損填負數', suffix: '元', value: s.eps, help: { text: ['證交所的本益比用最近四季的 EPS。', '用財經網站的「預估 EPS」也可以，但那是別人的猜測，要記得是哪一年的預估。'] } }),
      numberInput({ id: 'bvps', label: '每股淨值', termId: 'pb-ratio', plain: '最近一季財報', suffix: '元', value: s.bvps, help: { text: ['公司資產減負債，平均到每一股。'] } }),
      numberInput({ id: 'dividend', label: '每年每股股利', termId: 'dividend-yield', plain: '一年配的加起來', suffix: '元', value: s.dividend, help: { text: ['一年內每次配息加起來，例：季配 4 次各 4 元填 16。', '證交所帶入的數字含股票股利；只想看現金股利就改成現金的部分。'] } })],
    read: s => {
      s.eps = num('eps'); s.bvps = num('bvps'); s.dividend = num('dividend');
      valuationPlan({ ...params(s), pe: [1, 2, 3], pb: [1, 2, 3], yields: [0.03, 0.02, 0.01] });
      steps[2].hint = s.bands && (s.bands.pe || s.bands.pb || s.bands.yields) ? '按「用這檔過去 5 年的區間」會帶入它自己的 25／50／75 分位數；也可以自己填。' : '倍數由你自己定：可以參考這檔過去的本益比區間，或同產業的公司。';
    }
  },
  {
    title: '你的三個倍數', hint: '倍數由你自己定：可以參考這檔過去的本益比區間，或同產業的公司。',
    about: '便宜、合理、昂貴各填一個倍數。本益比、本淨比由小到大；殖利率由大到小（殖利率越高，價格越便宜）。',
    figure: { src: '../img/valuation/step3.webp', alt: '倍數怎麼定？看它自己過去幾年。長條從本益比低到本益比高，圓點代表過去每一天的本益比。最低的四分之一 → 便宜 15 倍；中間一半 → 合理 20 倍；最高的四分之一 → 昂貴 25 倍。小安說：原來是跟它自己比，不是跟別檔比！老師說：過去的區間不代表未來；公司變了，區間也會變。' },
    body: s => {
      const out = [], groups = [ ['eps', 'pe', 'pe', '本益比', '倍', 'pe-ratio'], ['bvps', 'pb', 'pb', '本淨比', '倍', 'pb-ratio'], ['dividend', 'yieldPct', 'y', '殖利率', '%', 'dividend-yield'] ];
      const fields = new Map();
      for (const [base, key, prefix, label, suffix, termId] of groups) {
        if (blank(s[base])) continue;
        const inputs = ['便宜', '合理', '昂貴'].map((zone, i) => numberInput({ id: prefix + i, label: (i === 0 ? label + '：' : '') + zone, suffix, termId: i === 0 ? termId : undefined, value: (s[key] || [])[i] }));
        fields.set(key, inputs); out.push(h('div', { class: 'triple' }, inputs));
      }
      if (s.bands && (s.bands.pe || s.bands.pb || s.bands.yields)) {
        const note = h('p', { class: 'muted' });
        const button = h('button', { type: 'button', class: 'secondary', onclick: () => {
          const missing = [];
          for (const m of METHODS) {
            const key = m.key === 'yield' ? 'yieldPct' : m.key, band = s.bands[m.key === 'yield' ? 'yields' : m.key];
            if (!band) { missing.push(m.label + ' 資料不夠 20 天，沒有帶入。'); continue; }
            fields.get(key)?.forEach((field, i) => { field.querySelector('input').value = +(band[i] * (key === 'yieldPct' ? 100 : 1)).toFixed(2); });
          }
          note.textContent = missing.join(' ');
        } }, '用這檔過去 5 年的區間（' + s.bands.from + '～' + s.bands.to + '）');
        out.unshift(button, note);
      }
      return out;
    },
    read: s => {
      s.pe = blank(s.eps) ? [] : [0, 1, 2].map(i => num('pe' + i));
      s.pb = blank(s.bvps) ? [] : [0, 1, 2].map(i => num('pb' + i));
      s.yieldPct = blank(s.dividend) ? [] : [0, 1, 2].map(i => num('y' + i));
      valuationPlan(params(s));
    }
  }
];

function result(s) {
  const r = valuationPlan(params(s));
  const out = r.methods.map(m => {
    if (!m.ok) return explain({ label: m.label, value: '不能用', tone: 'warn', how: m.reason, means: m.key === 'pe' ? '虧損的公司看本淨比或營收比較合適。' : m.key === 'pb' ? '淨值是負的，公司資產不夠還負債。' : '沒有配息的股票不適合用殖利率估。' });
    const prices = '便宜 ' + price2(m.prices.cheap) + '／合理 ' + price2(m.prices.fair) + '／昂貴 ' + price2(m.prices.expensive) + '。';
    return explain({ label: m.label, value: m.zoneLabel, tone: { 'below-cheap': 'ok', 'cheap-fair': 'ok', 'fair-expensive': 'warn', 'above-expensive': 'bad' }[m.zone],
      how: m.key === 'yield' ? '每年股利 ' + m.base.toFixed(2) + ' 元 ÷ ' + m.multiples.map(x => fmtPct(x, 2)).join('／') + ' ＝ ' + prices : (m.key === 'pe' ? 'EPS ' : '每股淨值 ') + m.base.toFixed(2) + ' 元 × ' + m.multiples.join('／') + ' 倍 ＝ ' + prices,
      means: (m.key === 'yield' ? '現在殖利率 ' + fmtPct(m.current, 2) : '現在' + (m.key === 'pe' ? '本益比 ' : '本淨比 ') + m.current.toFixed(2) + ' 倍') + '；現價 ' + price2(r.price) + ' 落在' + m.zoneLabel + '。' });
  });
  const valid = r.methods.filter(m => m.ok);
  if (valid.length >= 2) out.push(h('table', { class: 'trade-table' }, h('thead', {}, h('tr', {}, ['方法', '便宜價', '合理價', '昂貴價', '現價在哪'].map(x => h('th', { scope: 'col' }, x)))), h('tbody', {}, valid.map(m => h('tr', {}, [m.label, price2(m.prices.cheap), price2(m.prices.fair), price2(m.prices.expensive), m.zoneLabel].map(x => h('td', {}, x)))))));
  if (s.ratioDate) out.push(h('p', { class: 'note' }, 'EPS、每股淨值、股利是用證交所 ' + s.ratioDate + ' 的本益比、淨值比、殖利率反推的；證交所的殖利率含股票股利。'));
  out.push(h('p', { class: 'note' }, '倍數是你的假設，沒有公定的合理倍數；估出來的價格不是買賣建議。虧損公司、景氣循環股、金融股適合的方法不一樣。'), h('p', { class: 'todo' }, ['想算領多少股利、除息後股價，看 ', link('dividend.html', '⑩ 股息與除權息'), '。']));
  return out;
}
const example = { code: '', price: 580, eps: 32, bvps: 140, dividend: 16, pe: [15, 20, 25], pb: [3, 4, 5], yieldPct: [4, 3, 2.5], bands: null, ratioDate: '', autoFrom: '' };
document.getElementById('app').append(toolHeader(tool), wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/valuation/comic.webp', alt: '四格漫畫：一、580 元貴不貴？小安指著股價牌 580 元問：這檔到底貴不貴？老師說：先選一把尺來量。二、本益比這把尺。每股盈餘 32 元 × 15 倍／20 倍／25 倍；便宜 480、合理 640、昂貴 800；580 在 480 和 640 之間。三、殖利率這把尺。每年股利 16 元 ÷ 4%／3%／2.5%；便宜 400、合理 533、昂貴 640；580 在 533 和 640 之間。四、答案不一樣很正常。小安問：一把說還算便宜，一把說偏貴？老師說：倍數是你自己定的假設，看的角度不同。倍數只是例子，沒有公定標準；估出來的價格不是買賣建議。' }),
    h('p', {}, '估價就是先決定一把尺：用獲利（本益比）、用公司資產（本淨比）、或用配息（殖利率），乘上或除以你認為合理的倍數，得到便宜、合理、昂貴三個價格。'),
    h('p', {}, '倍數沒有標準答案。比較穩的做法是看這檔股票自己過去幾年的區間：最低的四分之一當便宜、中間當合理、最高的四分之一當昂貴。但公司變了，過去的區間就不一定適用。'),
    h('p', {}, '三把尺給的答案常常不一樣，這很正常。ETF 沒有本益比、本淨比，只能看殖利率；殖利率法要先確認配息是不是能一直配下去。')), disclaimer('general'));
