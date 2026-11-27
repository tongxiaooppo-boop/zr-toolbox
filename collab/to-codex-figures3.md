# 畫圖任務：㉓ 股票基本術語、㉒ 商品分層補圖（4 張新圖）

- 版本：2026-11-27 v1。回報寫到 `collab/from-codex-figures3.md`。
- 執行者：訂閱 Codex sol（VS Code 面板），直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`python`／`npm.cmd`（不要 `npm`）。
- **只准新增**：`docs/figures/cartoon/` 底下 4 個提示檔、`docs/figures/cartoon/out/` 底下 4 張 PNG、`img/basics/`、`img/products/` 底下 4 張 WebP、`collab/from-codex-figures3.md`。
- **只准修改**：`js/pages/basics.js`（只改 `FIGS`，和第 3 節寫的兩處）、`js/pages/products.js`（只改第 3 節寫的兩處）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。
- **不准改**：`js/data/`、`js/core/`、`js/ui/`、`css/`、`tests/`、`scripts/`、其他頁面、既有的圖與提示檔。暫存檔放本 repo 內，結束前刪掉。
- 不要用網路搜尋、網頁抓取。

## 0. 要讀的檔案（只准讀這些）

- `docs/figures/cartoon/00-風格與角色.md`（全文，每張提示最前面都要整段貼上；配色已改成新配色，不用另外寫配色覆蓋）
- `docs/figures/cartoon/basics-04-開戶要開哪些戶頭.md`（提示檔樣板，照它的寫法）
- `js/pages/basics.js` 第 1–30 行、`js/pages/products.js` 第 1–30 行

## 1. 生圖規則（之前出過事，一定要照做）

1. 每張提示檔先寫好存檔，再用 Read 讀檔，把**純文字原文**直接貼給 imagegen。**不要經過 PowerShell 變數**（之前 PowerShell 物件被序列化成字串，生出無關照片）。
2. **不要用綠色**（`00-風格與角色.md` 已寫）。
3. 生完先自己看：畫面是卡通、角色是小安／老師、提示裡的中文**一字不差**、沒有多出來的數字或字。不對就重生，每張最多重生 3 次；3 次都不對，寫進回報，不要硬交。
4. 圖上只准出現第 2 節引號內的字；沒寫的地方不要自己加字或數字。
5. 直式 1024×1536，PNG 存 `docs/figures/cartoon/out/<頁>-<名>.png`。
6. 轉 WebP 用 Python PIL：`Image.open(png).save(webp, 'WEBP', quality=80, method=6)`。

## 2. 4 張新圖（字串照抄，引號內是圖上的字）

1. 提示檔 `basics-07-基金與衍生商品三件事.md` → PNG `basics-fund.png` → `img/basics/fund.webp`
   標題「基金與衍生商品：先弄清楚三件事」。由上到下三格：
   第一格標「怎麼取得」：左邊小安走向一棟寫「基金公司」的建築，旁邊寫「申購：買新發行的單位」；右邊兩個人在交易所櫃台交換，旁邊寫「交易所：向別的投資人買」；下面一行小字「贖回：把單位交還換回錢，可能比本金少」。
   第二格標「契約給你什麼權利」：兩張卡片，「買權：照約定價格買進」「賣權：照約定價格賣出」；卡片旁一個錢袋寫「權利金：買權利的價錢」。
   第三格標「什麼時候到期」：一本日曆，圈起一天寫「到期日」，旁邊沙漏；小安冒汗。
   老師對話框：「有期限的商品，不能一直等回本。」
2. `basics-08-買正2融資借券各要多做什麼.md` → `basics-sign.png` → `img/basics/sign.webp`
   標題「買正2、融資、借券，各要多做什麼」。最上面一個方框「先有證券戶」，往下分出三條箭頭到三個並排方框：
   「買正2：簽風險預告書、符合一項資格」
   「融資融券：另外開信用戶、簽信用交易契約」
   「借券出借：向券商申請，被借走才收費」
   小安拿著一疊文件。老師對話框：「簽了只代表知道風險，不代表適合重押。」
3. `products-03-先弄懂再碰.md` → `products-careful.png` → `img/products/careful.webp`
   標題「先弄懂再碰：買之前先答三題」。一張大題目卡，三個勾選框由上到下：「它怎麼運作？」「交割和費用怎麼算？」「最壞會虧多少？」。小安拿筆在想。老師對話框：「答不出來，就先別買。」
4. `products-04-新手不建議.md` → `products-no.png` → `img/products/no.webp`
   標題「新手不建議：看到這些先停下來」。四個警示牌並排（兩排兩個）：「有到期日」「有槓桿」「要借錢」「規則很複雜」。下方一條藍灰色橫幅：「有些虧損會比保證金還多」。小安停下腳步舉手。老師對話框：「新手先別碰。」

## 3. 放進頁面（照抄，不准改其他地方）

**`js/pages/basics.js`**：

(a) `FIGS` 在 `settle` 那行前面加一項（鍵名是段落 id）：
```js
  fund: { src: '../img/basics/fund.webp', alt: '三件事：怎麼取得（申購是向基金公司買新發行的單位，交易所是向別的投資人買；贖回把單位交還換回錢，可能比本金少）、契約給你什麼權利（買權照約定價格買進、賣權照約定價格賣出，權利金是買權利的價錢）、什麼時候到期（到期日）。有期限的商品，不能一直等回本。', caption: '先看怎麼取得、有什麼權利、哪天到期。' },
```

(b) 在 `const FIGS = {...};` 後面新增：
```js
const TERM_FIGS = {
  'leveraged-sign': { src: '../img/basics/sign.webp', alt: '先有證券戶，再分三條：買正2 要簽風險預告書、符合一項資格；融資融券要另外開信用戶、簽信用交易契約；借券出借要向券商申請，被借走才收費。', caption: '簽了只代表知道風險，不代表適合重押。' }
};
```
並把 `el: h('div', { class: 'basic-item', id: t.id }, h('h3', {}, t.term),` 改成
`el: h('div', { class: 'basic-item', id: t.id }, TERM_FIGS[t.id] ? figure(TERM_FIGS[t.id]) : null, h('h3', {}, t.term),`
（只加這一段，同一行其他字不准動）。

**`js/pages/products.js`**：

(a) 在 `const links = ...` 那段前面新增：
```js
const LEVEL_FIGS = {
  careful: { src: '../img/products/careful.webp', alt: '買之前先答三題：它怎麼運作？交割和費用怎麼算？最壞會虧多少？答不出來，就先別買。', caption: '答不出來，就先別買。' },
  no: { src: '../img/products/no.webp', alt: '四個警示牌：有到期日、有槓桿、要借錢、規則很複雜；有些虧損會比保證金還多。', caption: '看到這些先停下來。' }
};
```
(b) 把 `LEVELS.map(level => [h('h3', {}, level.title), h('p', {}, level.line),` 改成
`LEVELS.map(level => [h('h3', {}, level.title), LEVEL_FIGS[level.id] ? figure(LEVEL_FIGS[level.id]) : null, h('p', {}, level.line),`
（只加這一段）。

完成後跑 `node scripts/gen-precache.mjs`。

## 4. PROOF_CMD

```
node -e "const fs=require('fs');const f=['basics/fund','basics/sign','products/careful','products/no'];let bad=f.filter(x=>!fs.existsSync('img/'+x+'.webp')||fs.statSync('img/'+x+'.webp').size<20000);const p={basics:['fund.webp','sign.webp','TERM_FIGS[t.id] ? figure(TERM_FIGS[t.id]) : null'],products:['careful.webp','no.webp','LEVEL_FIGS[level.id] ? figure(LEVEL_FIGS[level.id]) : null']};for(const [k,v] of Object.entries(p)){const s=fs.readFileSync('js/pages/'+k+'.js','utf8');for(const x of v)if(!s.includes(x))bad.push(k+':'+x)}const sw=fs.readFileSync('sw.js','utf8');for(const x of f)if(!sw.includes(x+'.webp'))bad.push('sw:'+x);console.log(bad.length?'BAD '+bad.join(' '):'OK 4 webp 6 places sw')" && npm.cmd test
```
預期輸出：`OK 4 webp 6 places sw`，接著 `ℹ tests 218`、`ℹ fail 0`。smoke 不用跑（Opus 會跑）。

## 5. 回報（`collab/from-codex-figures3.md`，照欄位填，不貼程式碼）

完成張數／每張：檔名、重生幾次、圖上的字有沒有跟第 2 節完全一致（不一致寫哪裡）、有沒有用到綠色／PROOF_CMD 輸出／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
