# 任務 圖示 v1：App 桌面圖示三款候選（只生圖）

- 版本：2026-11-09 v1。上一份（科普二）已完成，以本檔為準。
- 執行者：訂閱 Codex sol，直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要上網、不要 commit、不要改任何程式或網站檔案**。做完寫 `collab/from-codex.md`（覆蓋舊的）就停。

## 0. 要讀的檔案（只准讀這個）

- `docs/figures/cartoon/icon-01-App圖示.md`（圖示提示，全文）

## 1. 要做的事

用你的生圖功能，依提示檔的「共同規格」＋各款說明，生三張 1024×1024 PNG：

| 款 | 存成 |
|---|---|
| icon-a（工具箱） | `docs/figures/cartoon/out/icon-a.png` |
| icon-b（大字） | `docs/figures/cartoon/out/icon-b.png` |
| icon-c（學堂） | `docs/figures/cartoon/out/icon-c.png` |

- 生圖提示＝「共同規格」整段＋該款那一段，**純文字字串**（不要讓 PowerShell 把它序列化成物件）。
- 生完自己看：只准有「正2」兩個字且正確；四角沒有透明或白邊；圖案都在中央 70%。不合就重生該張，**每張最多重生 2 次**，仍不合就留最後一張並在回報寫出哪裡不合。
- 不准改 `icon-192.png`、`icon-512.png`、`manifest.webmanifest`（使用者挑完由 Opus 縮圖換上）。

## 2. PROOF_CMD（必跑，貼結果）

```
node -e "const fs=require('fs');for(const f of ['a','b','c']){const b=fs.readFileSync('docs/figures/cartoon/out/icon-'+f+'.png');console.log('icon-'+f, b.readUInt32BE(16)+'x'+b.readUInt32BE(20))}"
```

預期三行：`icon-a 1024x1024`、`icon-b 1024x1024`、`icon-c 1024x1024`（寬高不是 1024 就把圖縮放／補底色到 1024×1024 再交，回報註明）。

## 3. 回報 `collab/from-codex.md`

```
## 完成項
## PROOF_CMD 結果（原樣貼三行）
## 生圖（每張重生幾次、有沒有不合規格的地方）
## 需要 Opus 決定的事
```
