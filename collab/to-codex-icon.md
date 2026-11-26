# 畫圖任務：App 圖示重畫（投資成長的感覺）——先出 3 款候選

- 版本：2026-11-26 v1。回報寫到 `collab/from-codex-icon.md`。
- 執行者：訂閱 Codex sol（VS Code 面板），直接在本 repo（`D:\ok\zr-toolbox`）工作。**不要 commit**。指令用 `python`／`node`。
- **只准新增**：`docs/figures/cartoon/icon-02-投資成長.md`（提示檔）、`docs/figures/cartoon/out/icon2-a.png`、`icon2-b.png`、`icon2-c.png`、`docs/figures/cartoon/out/icon2-preview.png`、`collab/from-codex-icon.md`。
- **不准改**：`icon-192.png`、`icon-512.png`（使用者挑完才換）、任何 `js/`、`css/`、`tools/`、`manifest.webmanifest`、既有提示檔。暫存檔放本 repo 內，結束前刪掉。

## 0. 要讀的檔案（只准讀這些）

- `docs/figures/cartoon/icon-01-App圖示.md`（舊版圖示提示，看格式與共同規格；**內容已過時**，以本任務書為準）

## 1. 背景

網站已改名「股票兩三件事」：投資屬性測驗＋股票常識＋計算機，正2 只是其中一區。圖示要給人「**長期投資、慢慢成長**」的感覺，不再以「正2」為主角。

網站配色（UI v2）：深海軍藍 `#1f3a68`、暖金 `#f2b134`、米白 `#fbf7ee`，輔色綠 `#2f8f5b`。

## 2. 共同規格（三款都要遵守）

- 正方形 **1024×1024 PNG**，**整張鋪滿底色**（四角不能透明、不能留白邊）。
- **所有圖案在中央 70% 範圍內**（四邊各留 15% 只放底色），Android 會裁外圈。
- **不放任何文字、數字、英文**（縮到 48×48 字會糊）。
- 扁平向量風格，線條粗、形狀簡單、最多 4 色，不要漸層、寫實、3D、細小裝飾。
- 不要真實券商、銀行、投信的名稱或商標；不要錢幣上的面額數字、不要「$」符號。
- 縮到 48×48 還認得出主體。

## 3. 三款

1. **icon2-a（存錢長成樹）**：深海軍藍底。中間一小疊暖金硬幣，硬幣上長出一棵綠色小樹（三到五片圓葉），樹旁一條往右上的暖金箭頭。
2. **icon2-b（階梯長高）**：米白底。三根由矮到高的深海軍藍圓角長條（像長條圖），最高那根頂端冒出一片綠色嫩芽；底下一條暖金粗線當地面。
3. **icon2-c（日出曲線）**：深海軍藍底。下半部一條由左下往右上、平緩上升的暖金粗曲線（不是鋸齒），曲線右上端一個暖金半圓太陽升起，曲線下方淡一點的海軍藍色塊當山丘。

## 4. 生圖規則

1. 提示檔先寫好存檔（三款寫在同一份 `icon-02-投資成長.md`，含第 2 節共同規格），再用 Read 讀檔，把**純文字原文**直接貼給 imagegen；**不要經過 PowerShell 變數**。
2. 生完自己檢查：沒有任何字或數字、四角不透明、主體在中央 70%。不對就重生，每款最多 3 次。
3. 存 `docs/figures/cartoon/out/icon2-a.png` 等三張（1024×1024）。
4. 用 Python PIL 做一張預覽 `icon2-preview.png`：三列（a／b／c），每列並排同一款縮成 512、192、48 的樣子（LANCZOS），白底，給使用者挑。

## 5. PROOF_CMD

```
python -c "from PIL import Image;import sys;fs=['a','b','c'];bad=[f for f in fs if Image.open(f'docs/figures/cartoon/out/icon2-{f}.png').size!=(1024,1024)];im=Image.open('docs/figures/cartoon/out/icon2-a.png').convert('RGBA');print('BAD '+str(bad) if bad else ('OK 3 icons, corner alpha '+str(im.getpixel((0,0))[3])))"
```

預期：`OK 3 icons, corner alpha 255`

## 6. 回報（欄位固定）

三款各重生幾次／有沒有出現字或數字（應為無）／PROOF_CMD 輸出／偏離任務書的地方（沒有寫「無」）／需要決定的事（沒有寫「無」）
