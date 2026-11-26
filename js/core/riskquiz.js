// ㉖ 投資屬性測驗（v5.12，Opus 定；外包不得改題目、分數、門檻與回傳欄位）。
// 依據：docs/research/R9-投資屬性測驗.md（題目改寫自永豐金證券、安達人壽問卷，選項與配分為本站自訂）。
// 門檻由 Opus 2026-11-25 用 10 個人設校準（見 tests/riskquiz.test.js）：保守 10–24、穩健 25–33、成長 34–38、積極 39–50。
// 第 8 題與 R9 草案不同：最高一級改成「-50%（腰斬）也撐得住」，讓「能承受腰斬」直接成為正2 條件。
//
// 介面：
//   QUESTIONS：10 題 [{ id, no, text, hint, options:[{ label, score }] }]，options 依 score 1→5 排列
//   PROFILES：4 型 [{ key, label, min, max, rr }]（rr＝可買的最高風險報酬等級，RR1–RR{rr}）
//   CAPS：封頂規則 [{ key, max, text }]
//   scoreQuiz(answers) answers＝10 個分數（1–5 整數，依題號）
//     → { total, scoreKey, key, profile, caps:[{ key, max, text }], zr:{ ok, checks:[{ key, ok, text }] } }
//       scoreKey：只看總分的型態；key：套用封頂後的最終型態；caps：真的把型態往下拉的規則（依 CAPS 順序）
//       zr：正2（00631L，RR5）可能適合的四個條件，全過才 ok
//     不合格 throw Error（中文，頁面直接顯示）
//   BUCKETS、AGE_BANDS、ALLOC、allocationPlan：三桶配置，見檔尾

export const QUESTIONS = Object.freeze([
  { id: 'age', no: 1, text: '你的年齡', hint: '年紀越輕，虧了之後越有時間賺回來。', options: [
    { label: '60 歲以上', score: 1 }, { label: '50–59 歲', score: 2 }, { label: '40–49 歲', score: 3 },
    { label: '30–39 歲', score: 4 }, { label: '未滿 30 歲', score: 5 }] },
  { id: 'income', no: 2, text: '你目前的工作與收入穩定嗎？', hint: '收入穩定，跌的時候才不用被迫賣股票過生活。', options: [
    { label: '沒有固定收入（學生、退休靠存款）', score: 1 }, { label: '收入不固定（接案、業績制）', score: 2 },
    { label: '有工作，但最近擔心失業或減薪', score: 3 }, { label: '穩定的薪水或固定收入', score: 4 },
    { label: '穩定，而且還有第二份收入或家人收入支撐', score: 5 }] },
  { id: 'cash', no: 3, text: '如果突然沒收入，備用金能撐幾個月生活費？', hint: '備用金＝不拿去投資、隨時能用的錢。', options: [
    { label: '沒有備用金', score: 1 }, { label: '不到 3 個月', score: 2 }, { label: '3–6 個月', score: 3 },
    { label: '6–9 個月', score: 4 }, { label: '9 個月以上', score: 5 }] },
  { id: 'years', no: 4, text: '你投資多久了？', hint: '從第一次買股票、基金或 ETF 算起。', options: [
    { label: '未滿 1 年', score: 1 }, { label: '1–3 年', score: 2 }, { label: '3–6 年', score: 3 },
    { label: '6–10 年', score: 4 }, { label: '10 年以上', score: 5 }] },
  { id: 'products', no: 5, text: '你買過哪些商品？（選風險最高的那一項）', hint: '有買過就算，不管現在還有沒有。', options: [
    { label: '都沒買過', score: 1 }, { label: '只有存款、保險', score: 2 }, { label: '債券、基金', score: 3 },
    { label: '股票、ETF', score: 4 }, { label: '期貨、選擇權、槓桿或反向 ETF', score: 5 }] },
  { id: 'horizon', no: 6, text: '這筆錢預計放多久不會動用？', hint: '例如 3 年後要買房的頭期款，就選 1–3 年。', options: [
    { label: '未滿 1 年', score: 1 }, { label: '1–3 年', score: 2 }, { label: '3–5 年', score: 3 },
    { label: '5–7 年', score: 4 }, { label: '7 年以上', score: 5 }] },
  { id: 'share', no: 7, text: '這筆投資占你可投資總資產的多少？', hint: '可投資總資產＝存款＋股票基金，不含自住房子。', options: [
    { label: '80% 以上', score: 1 }, { label: '50–80%', score: 2 }, { label: '30–50%', score: 3 },
    { label: '10–30%', score: 4 }, { label: '10% 以下', score: 5 }] },
  { id: 'loss', no: 8, text: '你最多能接受投資暫時虧多少？', hint: '想像 100 萬變成多少，你還睡得著、不會賣掉。', options: [
    { label: '0%，不能虧', score: 1 }, { label: '-10%（剩 90 萬）', score: 2 }, { label: '-20%（剩 80 萬）', score: 3 },
    { label: '-30%（剩 70 萬）', score: 4 }, { label: '-50%（腰斬，剩 50 萬）也撐得住', score: 5 }] },
  { id: 'react', no: 9, text: '持有的股票 1 個月內跌了 15%，你會？', hint: '照你真的會做的選，不是照應該做的選。', options: [
    { label: '全部賣掉', score: 1 }, { label: '賣掉一半以上', score: 2 }, { label: '賣掉一小部分', score: 3 },
    { label: '不動，繼續抱著', score: 4 }, { label: '再買一些', score: 5 }] },
  { id: 'expect', no: 10, text: '你期待一年賺多少？', hint: '期待越高，通常要承受的漲跌也越大。', options: [
    { label: '約 5%', score: 1 }, { label: '約 10%', score: 2 }, { label: '約 15%', score: 3 },
    { label: '約 20%', score: 4 }, { label: '25% 以上', score: 5 }] }
]);

export const PROFILES = Object.freeze([
  { key: 'conservative', label: '保守型', min: 10, max: 24, rr: 2 },
  { key: 'balanced', label: '穩健型', min: 25, max: 33, rr: 3 },
  { key: 'growth', label: '成長型', min: 34, max: 38, rr: 4 },
  { key: 'aggressive', label: '積極型', min: 39, max: 50, rr: 5 }
]);

export const CAPS = Object.freeze([
  { key: 'noLoss', max: 'conservative', text: '第 8 題選「不能虧」，最高只到保守型。' },
  { key: 'lowCash', max: 'balanced', text: '第 3 題備用金不到 3 個月，最高只到穩健型。' },
  { key: 'age60', max: 'growth', text: '第 1 題 60 歲以上，最高只到成長型。' }
]);

const RANK = Object.fromEntries(PROFILES.map((p, i) => [p.key, i]));
const capHit = (key, a) => key === 'noLoss' ? a[7] === 1 : key === 'lowCash' ? a[2] <= 2 : a[0] === 1;

export function scoreQuiz(answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) throw new Error('題目數量不對，請重新作答。');
  const bad = answers.findIndex(x => !Number.isInteger(x) || x < 1 || x > 5);
  if (bad >= 0) throw new Error(`第 ${bad + 1} 題還沒選。`);
  const total = answers.reduce((s, x) => s + x, 0);
  const scoreKey = PROFILES.find(p => total >= p.min && total <= p.max).key;
  const caps = CAPS.filter(c => capHit(c.key, answers) && RANK[c.max] < RANK[scoreKey]).map(c => ({ ...c }));
  const key = PROFILES[Math.min(RANK[scoreKey], ...caps.map(c => RANK[c.max]))].key;
  const profile = { ...PROFILES[RANK[key]] };
  const checks = [
    { key: 'aggressive', ok: key === 'aggressive', text: '測驗結果是積極型（正2 是最高風險等級 RR5，只有積極型對得上）' },
    { key: 'income', ok: answers[1] >= 4, text: '工作與收入穩定（第 2 題選「穩定的薪水」以上）' },
    { key: 'cash', ok: answers[2] >= 4, text: '備用金 6 個月以上（第 3 題）' },
    { key: 'halve', ok: answers[7] === 5, text: '能承受腰斬（第 8 題選 -50%）' }
  ];
  return { total, scoreKey, key, profile, caps, zr: { ok: checks.every(c => c.ok), checks } };
}

// ---------- 三桶配置（v5.13，決策 docs/decision/決策-2026-11-26-三桶改版.md；比例照 R11 5.3；例子照 R13 v2） ----------
//   RESERVE：保守（先留）＝生活預備金＋幾年內要用的錢，**不算在三桶（5/3/2）裡**，先留好，剩下的才分三桶
//     { label, months: 6, years: 3, examples: [{ name, note }] }
//   reservePlan({ cash, horizon }) cash＝第 3 題分數、horizon＝第 6 題分數（1–5 整數）
//     → { cashOk, horizonOk, lines: string[] }；cashOk＝備用金 6 個月以上（cash ≥ 4）；horizonOk＝3 年以上不動用（horizon ≥ 3）
//     lines：給結果頁的白話句子（cashOk、horizonOk 都 true 時只有 1 句）
//   BUCKETS：[{ key:'steady'|'growth'|'bold', label, examples: [{ name, note }] }]（不排序、不是推薦）
//   ALLOC：四型 × 五個年齡段（依第 1 題分數 5→1：未滿 30、30–39、40–49、50–59、60 以上）的 [steady, growth, bold] 百分比
//     分母＝扣掉保守（先留）之後的可投資金額。成長型分兩列：growthHigh（第 8 題能接受 -30% 以上）、growthLow（-20% 以內）
//     規則：主力桶守 50；積極桶隨年齡遞減，減掉的移到穩健桶。RR 只當參考、不限制各桶商品。
//   allocationPlan({ key, age, loss }) key＝scoreQuiz 的最終型態；age＝第 1 題分數；loss＝第 8 題分數
//     → { steady, growth, bold, band, row }（百分比整數，合計 100；band＝年齡段文字；row＝用到的列名）
export const RESERVE = Object.freeze({
  label: '保守（先留）', months: 6, years: 3,
  examples: Object.freeze([
    { name: '定存、活存', note: '本金不會跌；定存提前解約，利息會變少。' },
    { name: '台幣貨幣市場基金', note: 'RR1，用基金平台買；淨值很少變動，但不是存款。' },
    { name: 'SGOV（複委託）', note: '超短期美國公債；只適合預留「要用美元」的錢，換回台幣會有匯率漲跌。' }
  ])
});

export function reservePlan({ cash, horizon }) {
  if (!Number.isInteger(cash) || cash < 1 || cash > 5) throw new Error('第 3 題還沒選。');
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 5) throw new Error('第 6 題還沒選。');
  const cashOk = cash >= 4, horizonOk = horizon >= 3, lines = [];
  if (!cashOk) lines.push('你的備用金不到 6 個月生活費：先把它補到 6 個月，放在定存或貨幣市場基金，再開始投資。');
  if (!horizonOk) lines.push('這筆錢 3 年內就會用到：它應該放保守（先留），不要拿去分三桶。');
  if (cashOk && horizonOk) lines.push('你的備用金已經有 6 個月以上，這筆錢也 3 年以上不會動用，可以照下面的比例分三桶。');
  return { cashOk, horizonOk, lines };
}

export const BUCKETS = Object.freeze([
  { key: 'steady', label: '穩健', examples: Object.freeze([
    { name: '短天期美債 ETF（00719B、00865B；複委託 SHY）', note: '有匯率風險；換成台幣，2020 年最多跌約 7–8%。' },
    { name: '投資等級公司債 ETF（00720B）', note: '20 年以上的長天期債，利率上升時也會跌；2020、2022 年都跌近三成。' },
    { name: '股債配置 ETF（複委託 AOM、AOR）', note: '股票約四成到六成、其餘是債券；2022 年約跌兩成。' },
    { name: '00713、00878', note: '高股息股票 ETF，還是股票；2022 年約跌兩成，0050 同年約跌三成六。' },
    { name: '定存股（例：2412 中華電）', note: '單一公司，有集中風險；2022 年約跌兩成。' }
  ]) },
  { key: 'growth', label: '成長', examples: Object.freeze([
    { name: '0050、006208', note: '台灣 50 大公司；2022 年約跌三成五。' },
    { name: '0056', note: '高股息，但 2022 年約跌三成二，跟 0050 差不多深，所以放這一桶。' },
    { name: '00646、00662', note: '台灣掛牌、追蹤美國 S&P 500／Nasdaq-100，用證券戶就能買。' },
    { name: 'VT、VOO、SPY（複委託）', note: '全球或美國大盤；股利會先被扣 30% 的稅。' },
    { name: 'QQQ（複委託）', note: '集中在科技股；2022 年約跌三成五。' }
  ]) },
  { key: 'bold', label: '積極', examples: Object.freeze([
    { name: '正2（00631L、00675L、00663L）', note: '每天 2 倍；2020、2022 年都跌過約五成。' },
    { name: '主動式 ETF（例：00981A）', note: '經理人自己挑股，2025 年才上市，集中在電子股。' },
    { name: '主題型 ETF（00891 半導體、00757 FANG+）', note: '集中單一產業或少數公司；00891 在 2022 年約跌四成六。' },
    { name: '個股', note: '押在單一公司，看錯沒有分散保護。' }
  ]) }
]);

export const AGE_BANDS = Object.freeze(['60 歲以上', '50–59 歲', '40–49 歲', '30–39 歲', '未滿 30 歲']); // 依第 1 題分數 1–5

// 欄位順序：未滿 30、30–39、40–49、50–59、60 以上
export const ALLOC = Object.freeze({
  conservative: [[75, 25, 0], [80, 20, 0], [80, 20, 0], [85, 15, 0], [90, 10, 0]],
  balanced: [[50, 30, 20], [50, 30, 20], [55, 30, 15], [65, 30, 5], [70, 30, 0]],
  growthHigh: [[20, 50, 30], [25, 50, 25], [30, 50, 20], [40, 50, 10], [50, 50, 0]],
  growthLow: [[30, 50, 20], [35, 50, 15], [40, 50, 10], [50, 50, 0], [50, 50, 0]],
  aggressive: [[20, 30, 50], [25, 30, 45], [30, 30, 40], [40, 30, 30], [50, 30, 20]]
});

export function allocationPlan({ key, age, loss }) {
  if (!RANK.hasOwnProperty(key)) throw new Error('型態不對，請重新作答。');
  if (!Number.isInteger(age) || age < 1 || age > 5) throw new Error('第 1 題還沒選。');
  if (!Number.isInteger(loss) || loss < 1 || loss > 5) throw new Error('第 8 題還沒選。');
  const row = key === 'growth' ? (loss >= 4 ? 'growthHigh' : 'growthLow') : key;
  const [steady, growth, bold] = ALLOC[row][5 - age];
  return { steady, growth, bold, band: AGE_BANDS[age - 1], row };
}
