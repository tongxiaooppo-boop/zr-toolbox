# 畫圖任務：㉓ 股票基本術語、⑳ ETF 入門、㉔ 正二教學補圖（4 張新圖＋3 處重用）

- 版本：2026-11-27 v1。回報寫到 `collab/from-codex-figures2.md`。
- 執行者：訂閱 Codex sol（VS Code 面板），直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令一律用 `node`／`python`／`npm.cmd`（不要 `npm`）。
- **只准新增**：`docs/figures/cartoon/` 底下 4 個提示檔、`docs/figures/cartoon/out/` 底下 4 張 PNG、`img/basics/`、`img/etf101/` 底下 4 張 WebP、`collab/from-codex-figures2.md`。
- **只准修改**：`js/pages/basics.js`（只改 `FIGS`）、`js/pages/etf101.js`（只改 `FIGS`）、`js/pages/zr101.js`（只改 `periodic` 函式第一行前面加一張圖）、`sw.js`（只能用 `node scripts/gen-precache.mjs` 重產）。
- **不准改**：`js/data/`、`js/core/`、`js/ui/`、`css/`、`tests/`、`scripts/`、其他頁面、既有的圖與提示檔。暫存檔放本 repo 內，結束前刪掉。
- 不要用網路搜尋、網頁抓取。

## 0. 要讀的檔案（只准讀這些）

- `docs/figures/cartoon/00-風格與角色.md`（全文，每張提示最前面都要整段貼上）
- `docs/figures/cartoon/basics-03-T加2交割.md`（提示檔樣板，照它的寫法）
- `js/pages/basics.js` 第 1–30 行、`js/pages/etf101.js` 第 1–30 行、`js/pages/zr101.js` 第 1–25 行
- `js/pages/loans.js` 第 28 行、`js/pages/rebalance.js` 第 138 行（只為了抄 alt 字串）

## 1. 生圖規則（之前出過事，一定要照做）

1. 每張提示檔先寫好存檔，再用 Read 讀檔，把**純文字原文**直接貼給 imagegen。**不要經過 PowerShell 變數**（之前 PowerShell 物件被序列化成字串，生出無關照片）。
2. **配色覆蓋**（使用者 2026-11-26 定，優先於 `00-風格與角色.md` 的配色）：**不要用綠色**。主色深海軍藍 #1f3a68、暖金 #f2b134、漲／好＝紅橘 #c2410c、跌／注意＝藍灰 #3d4f7a、背景暖米白。提示檔裡貼完共用風格後，加一行寫明這段配色覆蓋。
3. 生完先自己看：畫面是卡通、角色是小安／老師、提示裡的中文**一字不差**、沒有多出來的數字或字。不對就重生，每張最多重生 3 次；3 次都不對，寫進回報，不要硬交。
4. 圖上只准出現第 2 節引號內的字；沒寫的地方不要自己加字或數字。
5. 直式 1024×1536，PNG 存 `docs/figures/cartoon/out/<頁>-<名>.png`。
6. 轉 WebP 用 Python PIL：`Image.open(png).save(webp, 'WEBP', quality=80, method=6)`。

## 2. 4 張新圖（字串照抄，引號內是圖上的字）

1. 提示檔 `basics-04-開戶要開哪些戶頭.md` → PNG `basics-market.png` → `img/basics/market.webp`
   標題「開戶要開哪些戶頭」。上半部三個並排的方框，框上方標「買台股」：「證券戶：用來下單」「交割銀行戶：買股扣款、賣股入帳」「集保帳戶：股票存在這裡」，三個框之間用箭頭連起來；小安拿著手機站在證券戶前面，手機上寫「券商 App（示意）」。下半部一個方框，框上方標「買海外股票」：「複委託戶：在同一家券商另外申請」，框旁畫一張文件寫「風險預告、稅務文件」。老師對話框：「股票在集保，錢在銀行，下單走證券戶；買美股要再開複委託。」
2. `basics-05-誰先成交.md` → `basics-match.png` → `img/basics/match.webp`
   標題「誰先成交？先比價格，再比時間」。畫一排排隊買股票的人，每人頭上舉牌。左半邊標「價格優先」：出價比較高的人排在最前面。右半邊標「時間優先」：出價一樣的人，先來的排前面，小安排在後面看著手錶。老師對話框：「想買到，價格要夠；價格一樣，就看誰先掛。」
3. `basics-06-加權指數大公司影響大.md` → `basics-company.png` → `img/basics/company.webp`
   標題「加權指數：大公司影響比較大」。一個大翹翹板或天平：一邊是一個很大的箱子寫「市值大的公司」，另一邊是好幾個小箱子寫「市值小的公司」，大箱子那邊比較重。小安一臉驚訝。老師對話框：「大盤漲跌，主要看大公司。」
4. `etf101-05-ETF分割.md` → `etf101-split.png` → `img/etf101/split.webp`
   標題「ETF 分割：股數變多，每股變便宜」。左右兩格：左格標「分割前」：一個大披薩只切成少少幾片；右格標「分割後」：同一個大小的披薩切成很多小片。兩格中間箭頭，下方寫「總價值不變」。小安鬆一口氣。老師對話框：「不是賺了，也不是賠了，只是切得比較細。」

## 3. 放進頁面（照抄，不准改其他地方）

**`js/pages/basics.js` 的 `FIGS`**：在 `settle` 那行前後加三項（鍵名就是段落 id）：
```js
  market: { src: '../img/basics/market.webp', alt: '買台股：證券戶用來下單、交割銀行戶買股扣款賣股入帳、集保帳戶存股票，箭頭相連。買海外股票：在同一家券商另外申請複委託戶，要簽風險預告和稅務文件。', caption: '買台股開三個戶頭；買美股要再開複委託。' },
  match: { src: '../img/basics/match.webp', alt: '排隊買股票：價格優先，出價高的排前面；時間優先，價格一樣先來的排前面。', caption: '想買到，價格要夠；價格一樣，就看誰先掛。' },
  company: { src: '../img/basics/company.webp', alt: '天平：一邊是市值大的公司，一邊是好幾家市值小的公司，大公司那邊比較重。', caption: '大盤漲跌，主要看大公司。' },
```

**`js/pages/etf101.js` 的 `FIGS`**：加三項：
```js
  trade: { src: '../img/etf101/split.webp', alt: '分割前披薩切少少幾片，分割後同樣大小切很多小片，總價值不變。', caption: '不是賺了，也不是賠了，只是切得比較細。' },
  leveraged: { src: '../img/decay/two-days.svg', alt: '兩天一漲一跌，大盤和正二各自剩多少（取自 ⑥ 正二不是兩倍）。', caption: '每天 2 倍，不等於整段 2 倍。' },
  borrow: { src: '../img/loans/call.webp', alt: <照抄 js/pages/loans.js 第 28 行 figure 的 alt 字串>, caption: <照抄同一行的 caption 字串> },
```

**`js/pages/zr101.js` 的 `periodic`**：陣列第一個元素前面加：
```js
  figure({ src: '../img/rebalance/comic.webp', alt: <照抄 js/pages/rebalance.js 第 138 行 figure 的 alt 字串>, caption: '定期配比：先定比例，時間到了才調回去。' }),
```

完成後跑 `node scripts/gen-precache.mjs`。

## 4. PROOF_CMD

```
node -e "const fs=require('fs');const f=['basics/market','basics/match','basics/company','etf101/split'];let bad=f.filter(x=>!fs.existsSync('img/'+x+'.webp')||fs.statSync('img/'+x+'.webp').size<20000);const p={basics:['market.webp','match.webp','company.webp'],etf101:['split.webp','two-days.svg','loans/call.webp'],zr101:['rebalance/comic.webp']};for(const [k,v] of Object.entries(p)){const s=fs.readFileSync('js/pages/'+k+'.js','utf8');for(const x of v)if(!s.includes(x))bad.push(k+':'+x)}console.log(bad.length?'BAD '+bad.join(' '):'OK 4 webp 7 places')" && npm.cmd test
```
預期輸出：`OK 4 webp 7 places`，接著 `ℹ tests 212`、`ℹ fail 0`。smoke 不用跑（Opus 會跑）。

## 5. 回報（`collab/from-codex-figures2.md`，照欄位填，不貼程式碼）

完成張數／每張：檔名、重生幾次、圖上的字有沒有跟第 2 節完全一致（不一致寫哪裡）、有沒有用到綠色／PROOF_CMD 輸出／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
