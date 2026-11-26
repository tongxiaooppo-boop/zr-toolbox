import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { wizard, explain } from '../ui/wizard.js';
import { QUESTIONS, PROFILES, scoreQuiz, BUCKETS, allocationPlan, RESERVE, reservePlan } from '../core/riskquiz.js';
import { TOOLS } from '../data/tools.js';
import { STRESS } from '../data/stress.js';
import { LAYOUTS, DEFAULT_LAYOUT, stressPlan, lossCheck } from '../core/stress.js';
import { fmtPct } from '../core/format.js';

const tool = TOOLS.find(t => t.id === 'riskquiz');
const steps = QUESTIONS.map((q, i) => ({
  title: `第 ${q.no} 題：${q.text}`,
  hint: q.hint,
  figure: i === 0 ? { src: '../img/riskquiz/comic.webp', alt: '小安作答，前面四扇門：保守、穩健、成長、積極；老師說沒有好壞，只有適不適合。', caption: '10 題，找出你的投資屬性。' } : undefined,
  body: s => [h('fieldset', { class: 'choices', 'aria-label': q.text },
    ...q.options.map(o => h('label', {},
      h('input', { type: 'radio', name: `q-${q.id}`, value: o.score, checked: s.a?.[i] === o.score }),
      h('span', {}, o.label))))],
  read: s => {
    const selected = document.querySelector(`input[name="q-${q.id}"]:checked`);
    if (!selected) throw new Error(`第 ${q.no} 題還沒選。`);
    s.a ||= [];
    s.a[i] = Number(selected.value);
  }
}));

const meanings = {
  conservative: '你最在意本金不要虧。先把保守（先留）的錢留足，要投資的部分以穩健桶為主，少量放成長。',
  balanced: '你能接受一些漲跌，但不想大起大落。一半放穩健，其餘放成長和少量積極。',
  growth: '你願意承受較大的漲跌換取長期成長。一半放成長型 ETF，其餘依你能承受的虧損分配。',
  aggressive: '你能承受很大的波動，也期待較高報酬。一半放積極部位，但要先想清楚最壞情況。'
};
const reminders = [
  '正2（00631L）風險等級 RR5，是最高等級。官方把它定位成策略交易型商品，不是設計來長期持有的。',
  '它追蹤「單日」2 倍，每天重設，長期累積不等於指數的 2 倍；上下震盪時差距更大。',
  '正2 加上其他股票的實質曝險超過 100%，就等於借錢投資，下跌時虧損會被放大。',
  '2020 年疫情時 00631L 從年初到低點約跌 5 成（同期 0050 約 3 成）。本站的長期做法（正2＋現金定期配回）要能接受腰斬，回本可能要好幾年。',
  '買之前，要先在券商辦好槓桿／反向 ETF 的交易資格（風險預告書等）。',
  '「工作與收入穩定、備用金 6 個月」是本站的建議，不是法規。'
];

function stressSection(p, loss) {
  const keys = ['steady', 'growth', 'bold'];
  const weights = { steady: p.steady / 100, growth: p.growth / 100, bold: p.bold / 100 };
  const body = h('div', { class: 'stress-body' });
  const render = layout => {
    const plan = stressPlan({ data: STRESS, layout, weights });
    const chk = lossCheck({ loss, worst: plan.worst.portfolio.mdd });
    const summary = (crash, label, means, tone) => {
      const { mdd, troughDate, recoverDate, months } = crash.portfolio;
      return explain({ label, value: `組合最多跌 ${fmtPct(-mdd)}`, tone,
        how: `${crash.from} 買進，${troughDate} 跌到最低；` + (months !== null
          ? `約 ${months} 個月回到前高（${recoverDate}）。` : `到 ${STRESS.asOf} 還沒回到前高。`), means });
    };
    const proxy = plan.proxyLayer;
    const headers = ['股災', `穩健 ${p.steady}%`, `成長 ${p.growth}%`, `積極 ${p.bold}%`, '整個組合', '回到前高'];
    const rows = plan.crashes.map(({ label, from, lateStart, buckets, portfolio }) => [
      [label, h('span', { class: 'stress-from' }, `${from} 起${lateStart ? '（延後）' : ''}`)],
      ...keys.map(k => [fmtPct(-buckets[k].mdd), buckets[k].proxy ? h('span', { class: 'stress-proxy' }, '代替') : null]),
      h('strong', {}, fmtPct(-portfolio.mdd)),
      portfolio.months !== null ? `${portfolio.months} 個月` : '還沒回到'
    ]);
    body.replaceChildren(
      summary(proxy, `${proxy.label}（過去最深）`,
        '這一次有商品還沒上市，用代替品算（表上標「代替」）。'
        + (p.bold > 0 && proxy.buckets.bold.proxy ? '積極桶用的是模擬的正2。' : '')
        + (proxy.lateStart ? '0056 從 2007-12-26 才有資料，所以從這天起算，比真正的高點晚，跌幅會算少一些。' : ''), 'warn'),
      summary(plan.realLayer, `2020 年起全部用真實商品，最深是 ${plan.realLayer.label}`, '這幾次每一檔都已經上市，數字全部是真的。'),
      explain({ label: '跟你第 8 題比', value: `你能接受 ${fmtPct(-chk.limit, 0)}，過去最深 ${fmtPct(-plan.worst.portfolio.mdd)}`,
        tone: chk.ok ? 'ok' : 'warn', means: (chk.ok ? '過去最深的一次，在你能接受的範圍內。'
          : '過去最深的一次，比你能接受的還深。可以把積極桶調低、穩健桶調高，或先確定自己跌到這樣也不會賣。') + '這是過去最深，不是未來的上限。' }),
      h('div', { class: 'stress-table-scroll', tabindex: '0', role: 'region', 'aria-label': headers.join('、') },
        h('table', { class: 'trade-table card-table' },
          h('thead', {}, h('tr', {}, headers.map(t => h('th', { scope: 'col' }, t)))),
          h('tbody', {}, rows.map(row => h('tr', {}, row.map((t, i) => h('td', i ? { 'data-label': headers[i] } : {}, t))))))),
      h('ul', { class: 'muted' },
        h('li', {}, '用台幣、含配息（配息當天買回）。每次股災在區間第一天照你的比例買進，之後不再平衡；跌幅是區間內從高點到低點，「回到前高」從那個高點算到第一次回到同樣金額（區間後每週看一次）。'),
        h('li', {}, '股災區間照 ㉙ 股災史的台股、美股高低點，取兩邊最早的高點到最晚的低點。'),
        h('li', {}, '標「代替」的格子，是商品那時還沒上市，用相近的東西代替：' + Object.entries(STRESS.products)
          .filter(([, product]) => product.proxy !== null)
          .map(([code, { proxy, gap }]) => `${code} 用 ${proxy}（上市後兩者比對，跌幅最多差 ${(gap * 100).toFixed(1)} 點）`).join('；')),
        h('li', {}, `資料到 ${STRESS.asOf}；來源：${STRESS.source}。`)));
  };
  const choices = h('fieldset', { class: 'choices stress-layout', 'aria-label': '選商品組合' },
    ...Object.entries(LAYOUTS).map(([key, layout]) => h('label', {},
      h('input', { type: 'radio', name: 'stress-layout', value: key, checked: key === DEFAULT_LAYOUT,
        onchange: e => { if (e.target.checked) render(key); } }),
      h('span', {}, `${key} ${layout.label}：${keys.map(k => layout[k].map(([code]) => code).join('＋')).join('／')}${key === 'B' ? '（預設）' : ''}`))));
  render(DEFAULT_LAYOUT);
  return h('section', { class: 'stress' },
    h('h3', {}, '過去的股災，你的三桶會跌多少'),
    h('p', {}, '用你上面的三桶比例，回頭放進過去 8 次股災，看整個組合最多跌多少、多久回到原來的高點。'), choices, body);
}

function result(s) {
  const r = scoreQuiz(s.a);
  const p = allocationPlan({ key: r.key, age: s.a[0], loss: s.a[7] });
  const shares = [p.steady, p.growth, p.bold];
  const count = r.zr.checks.filter(c => c.ok).length;
  let how = `10 題加總 ${r.total} 分（保守 10–24、穩健 25–33、成長 34–38、積極 39–50）。`;
  if (r.caps.length) how += `總分本來是${PROFILES.find(profile => profile.key === r.scoreKey).label}，但` + r.caps.map(c => c.text).join('');
  let allocationHow = '依你的型態與年齡查表：每一型的主力桶占一半，年紀越大積極桶越少、移到穩健桶。';
  if (p.row === 'growthHigh') allocationHow += '第 8 題你能接受虧 30% 以上，所以積極桶放多一些。';
  if (p.row === 'growthLow') allocationHow += '第 8 題你能接受的虧損在 20% 以內，所以穩健桶放多一些。';
  const reserve = reservePlan({ cash: s.a[2], horizon: s.a[5] });
  return [
    explain({ label: '你的投資屬性', value: r.profile.label, tone: 'info', how, means: meanings[r.key] }),
    explain({ label: '先留：保守（先留）', value: '6 個月生活費＋3 年內要用的錢', how: '這筆錢不算在三桶裡，放定存、貨幣市場基金這類幾乎不會跌的地方；剩下的錢才分三桶。', means: reserve.lines.join(''), tone: reserve.cashOk && reserve.horizonOk ? 'ok' : 'warn' }),
    h('p', { class: 'muted' }, RESERVE.examples.map(e => e.name).join('、')),
    explain({ label: `剩下的錢分三桶（${p.band}）`, value: `穩健 ${p.steady}%／成長 ${p.growth}%／積極 ${p.bold}%`, how: allocationHow }),
    h('div', { class: 'alloc-bar', role: 'img', 'aria-label': `穩健 ${p.steady}%，成長 ${p.growth}%，積極 ${p.bold}%` },
      ...BUCKETS.flatMap((bucket, i) => shares[i] ? [h('span', { class: `alloc-${bucket.key}`, style: `width:${shares[i]}%` }, `${shares[i]}%`)] : [])),
    h('div', { class: 'quiz-buckets' }, ...BUCKETS.map((bucket, i) => h('div', { class: 'bucket' },
      h('h3', {}, `${bucket.label} ${shares[i]}%`),
      h('ul', {}, ...bucket.examples.map(e => h('li', {}, h('strong', {}, e.name), ' ', e.note)))))),
    h('p', { class: 'muted' }, '例子只是舉例、沒有排序，不是推薦買哪一檔。'),
    stressSection(p, s.a[7]),
    explain({ label: '如果你要放正2', value: `${count}／4 點符合`, tone: count === 4 ? 'ok' : 'warn' }),
    h('ul', { class: 'checks' }, ...r.zr.checks.map(c => h('li', {}, `${c.ok ? '✓' : '✗'} ${c.text}`))),
    h('ul', {}, ...reminders.map(text => h('li', {}, text))),
    explain({ label: '關於風險等級（RR）', value: `RR1–RR${r.profile.rr}`,
      means: `這是一般券商問卷對${r.profile.label}的常見對應，本站只當參考、不限制你放什麼。你在券商做的正式評估，可能會限制你買 RR4（例 0050）或 RR5（例正2）的商品，這部分券商說了算。` }),
    h('p', { class: 'muted' }, '答案只在你的瀏覽器裡計算，不會上傳或儲存。年齡、收入、備用金改變時，記得再測一次。')
  ];
}

const example = { a: [5, 4, 4, 3, 4, 5, 4, 3, 4, 3] };
document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/riskquiz/buckets.svg',
      alt: '先留保守（先留）：定存、貨幣市場基金。剩下分三桶：穩健桶（債券 ETF、股債配置、高股息）、成長桶（0050、0056、S&P 500）、積極桶（正2、主動式 ETF、個股）。積極型 20／30／50，穩健型 50／30／20。',
      caption: '先留保守的錢，剩下的依穩健、成長、積極分三桶。' }),
    h('p', {}, '測驗分數決定你的主力桶：保守和穩健型以穩健桶為主，成長型以成長桶為主，積極型以積極桶為主，主力桶大約占一半。'),
    h('p', {}, '這不是券商的正式評估。各家問卷的題目和門檻都不同，結果可能不一樣。真的要買賣，照你開戶的券商規定。'),
    h('p', {}, '想知道各屬性對應什麼商品、為什麼：', h('a', { href: 'riskprofile.html' }, '㉗ 投資屬性是什麼'))),
  pathNav('riskquiz'),
  references([
    { name: '永豐金證券 投資人風險屬性分析問卷（自然人）113.06', url: 'https://www.sinotrade.com.tw/UploadFiles/2024/202406/83ced505-e15c-478f-af49-d58863f73d12.pdf' },
    { name: '安達人壽 投資型保險商品保戶風險適性問卷', url: 'https://life.chubb.com/content/dam/chubb-sites/life-chubb-com/tw-zh/documents/%E6%8A%95%E8%B3%87%E5%9E%8B%E5%95%86%E5%93%81%E4%BF%9D%E6%88%B6%E9%A2%A8%E9%9A%AA%E9%81%A9%E6%80%A7%E5%95%8F%E5%8D%B7.pdf' },
    { name: '元大投信 00631L 基本資料', url: 'https://www.yuantaetfs.com/product/detail/00631L/Basic_information' },
    { name: '臺灣證券交易所《槓桿型及反向型 ETF 介紹》', url: 'https://www.twse.com.tw/downloads/zh/ETF/etfnews01.pdf' },
    { name: 'MoneyDJ 基金風險報酬等級說明', url: 'https://www.moneydj.com/funddj/notes/rrnotes/rrnotes.htm' },
    { name: 'FRED DEXTAUS 新台幣兌美元匯率', url: 'https://fred.stlouisfed.org/series/DEXTAUS' },
    { name: 'FinMind 台股開放資料', url: 'https://finmindtrade.com/' }
  ]),
  disclaimer('general'));
