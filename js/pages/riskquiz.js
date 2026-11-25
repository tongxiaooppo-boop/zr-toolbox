import { h, toolHeader, figure, references, disclaimer, pathNav } from '../ui/components.js';
import { wizard, explain } from '../ui/wizard.js';
import { QUESTIONS, PROFILES, scoreQuiz, BUCKETS, allocationPlan } from '../core/riskquiz.js';
import { TOOLS } from '../data/tools.js';

const tool = TOOLS.find(t => t.id === 'riskquiz');
const steps = QUESTIONS.map((q, i) => ({
  title: `第 ${q.no} 題：${q.text}`,
  hint: q.hint,
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
  conservative: '你最在意本金不要虧。資金以保守穩健為主，少量放成長型 ETF。',
  balanced: '你能接受一些漲跌，但不想大起大落。一半放保守穩健，其餘放成長和少量積極。',
  growth: '你願意承受較大的漲跌換取長期成長。一半放成長型 ETF，其餘依你能承受的虧損分配。',
  aggressive: '你能承受很大的波動，也期待較高報酬。一半放積極部位，但要先想清楚最壞情況。'
};
const reminders = [
  '正2（00631L）風險等級 RR5，是最高等級；官方定位為策略交易型商品，不是為長期持有設計。',
  '它追蹤「單日」2 倍，每天重設，長期累積不等於指數的 2 倍；上下震盪時差距更大。',
  '正2 加上其他股票的實質曝險超過 100%，就等於借錢投資，下跌時虧損會被放大。',
  '2020 年疫情時 00631L 從年初到低點約跌 5 成（同期 0050 約 3 成）。本站的長期做法（正2＋現金定期配回）要能接受腰斬，回本可能要好幾年。',
  '要先在券商辦好槓桿／反向 ETF 的交易資格（風險預告書等）。',
  '「工作與收入穩定、備用金 6 個月」是本站的建議，不是法規。'
];

function result(s) {
  const r = scoreQuiz(s.a);
  const p = allocationPlan({ key: r.key, age: s.a[0], loss: s.a[7] });
  const shares = [p.safe, p.growth, p.bold];
  const count = r.zr.checks.filter(c => c.ok).length;
  let how = `10 題加總 ${r.total} 分（保守 10–24、穩健 25–33、成長 34–38、積極 39–50）。`;
  if (r.caps.length) how += `總分本來是${PROFILES.find(profile => profile.key === r.scoreKey).label}，但` + r.caps.map(c => c.text).join('');
  let allocationHow = '依你的型態與年齡查表：每一型的主力桶占一半，年紀越大積極桶越少、移到保守穩健桶。';
  if (p.row === 'growthHigh') allocationHow += '第 8 題你能接受虧 30% 以上，所以積極桶放多一些。';
  if (p.row === 'growthLow') allocationHow += '第 8 題你能接受的虧損在 20% 以內，所以保守穩健桶放多一些。';
  return [
    explain({ label: '你的投資屬性', value: r.profile.label, tone: 'info', how, means: meanings[r.key] }),
    explain({ label: `三桶資金怎麼分（${p.band}）`, value: `保守穩健 ${p.safe}%／成長 ${p.growth}%／積極 ${p.bold}%`, how: allocationHow }),
    h('div', { class: 'alloc-bar', role: 'img', 'aria-label': `保守穩健 ${p.safe}%，成長 ${p.growth}%，積極 ${p.bold}%` },
      ...BUCKETS.flatMap((bucket, i) => shares[i] ? [h('span', { class: `alloc-${bucket.key}`, style: `width:${shares[i]}%` }, `${shares[i]}%`)] : [])),
    h('div', { class: 'quiz-buckets' }, ...BUCKETS.map((bucket, i) => h('div', { class: 'bucket' },
      h('h3', {}, `${bucket.label} ${shares[i]}%`), h('p', {}, bucket.examples.join('、'))))),
    h('p', { class: 'muted' }, '例子只是舉例、沒有排序，不是推薦買哪一檔。'),
    explain({ label: '如果你要放正2', value: `${count}／4 點符合`, tone: count === 4 ? 'ok' : 'warn' }),
    h('ul', { class: 'checks' }, ...r.zr.checks.map(c => h('li', {}, `${c.ok ? '✓' : '✗'} ${c.text}`))),
    h('ul', {}, ...reminders.map(text => h('li', {}, text))),
    explain({ label: '關於風險等級（RR）', value: `RR1–RR${r.profile.rr}`,
      means: `這是一般券商問卷對${r.profile.label}的常見對應，本站只當參考、不限制你放什麼。你在券商做的正式評估可能限制你買 RR4（例 0050）或 RR5（例正2）商品，以券商為準。` }),
    h('p', { class: 'muted' }, '答案只在你的瀏覽器裡計算，不會上傳或儲存。年齡、收入、備用金改變時，記得再測一次。')
  ];
}

const example = { a: [5, 4, 4, 3, 4, 5, 4, 3, 4, 3] };
document.getElementById('app').append(
  toolHeader(tool),
  wizard({ steps, result, example }),
  h('section', { class: 'card' }, h('h2', {}, '怎麼讀'),
    figure({ src: '../img/riskquiz/buckets.svg',
      alt: '三桶資金：保守穩健桶，例子為債券 ETF、定存股、00713、VT；成長桶，例子為 0050、QQQ、SPY；積極桶，例子為主動式 ETF、正2、個股。積極型 20／30／50，穩健型 50／30／20，示意主力桶占一半。',
      caption: '三桶依保守穩健、成長、積極排列，比例隨型態與年齡改變。' }),
    h('p', {}, '測驗分數決定你的主力桶：保守和穩健型以保守穩健桶為主，成長型以成長桶為主，積極型以積極桶為主，主力桶大約占一半。'),
    h('p', {}, '這不是券商的正式評估。各家問卷題目和門檻都不同，結果可能不一樣；正式買賣以你開戶的券商為準。'),
    h('p', {}, '想知道各屬性對應什麼商品、為什麼：', h('a', { href: 'riskprofile.html' }, '㉗ 投資屬性是什麼'))),
  pathNav('riskquiz'),
  references([
    { name: '永豐金證券 投資人風險屬性分析問卷（自然人）113.06', url: 'https://www.sinotrade.com.tw/UploadFiles/2024/202406/83ced505-e15c-478f-af49-d58863f73d12.pdf' },
    { name: '安達人壽 投資型保險商品保戶風險適性問卷', url: 'https://life.chubb.com/content/dam/chubb-sites/life-chubb-com/tw-zh/documents/%E6%8A%95%E8%B3%87%E5%9E%8B%E5%95%86%E5%93%81%E4%BF%9D%E6%88%B6%E9%A2%A8%E9%9A%AA%E9%81%A9%E6%80%A7%E5%95%8F%E5%8D%B7.pdf' },
    { name: '元大投信 00631L 基本資料', url: 'https://www.yuantaetfs.com/product/detail/00631L/Basic_information' },
    { name: '臺灣證券交易所《槓桿型及反向型 ETF 介紹》', url: 'https://www.twse.com.tw/downloads/zh/ETF/etfnews01.pdf' },
    { name: 'MoneyDJ 基金風險報酬等級說明', url: 'https://www.moneydj.com/funddj/notes/rrnotes/rrnotes.htm' }
  ]),
  disclaimer('general'));
