# All Things Scored

> motion · becomes · music

一個將影片動作即時轉換為音樂的互動工具。程式偵測影片中穿越觸發線的動態物體，並依照物體位置與速度觸發對應音符。

---

## 專案結構

```
AllThingsScored/
├── homepage.html            # 首頁（品牌展示頁，含進入入口）
├── video_instrument_app.html # 核心應用（純 HTML + Tone.js，無需打包）
├── src/                     # React 版本（Vite + TypeScript）
│   ├── App.tsx
│   ├── components/
│   │   ├── CanvasOverlay.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBar.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── Visualizer.tsx
│   │   └── Controls/
│   ├── hooks/
│   │   ├── useAudioEngine.ts
│   │   ├── useMotionDetection.ts
│   │   └── useVideoLoader.ts
│   ├── services/
│   │   └── AudioEngine.ts
│   ├── constants/
│   ├── types/
│   └── utils/
├── dist/                    # Vite 打包輸出
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 快速開始

### 直接開啟（不需安裝）

直接用瀏覽器打開 `video_instrument_app.html` 即可，無需任何安裝。

### React 開發版本

```bash
npm install
npm run dev
```

打包：

```bash
npm run build
```

---

## 使用說明

### 上傳影片

支援 `mp4`、`webm`、`mov` 格式。點擊上傳區域或直接拖曳檔案。

### 觸發線

在影片上拖曳綠色觸發線，選擇要偵測的位置。可切換**水平**或**垂直**模式。

### 偵測邏輯

- 程式逐格比對觸發線上每個像素與背景模型的顏色差異
- 差異超過靈敏度閾值時視為動態物體，觸發對應音符
- 物體在觸發線上的**位置**決定音高，**顏色變化幅度**決定力度（velocity）

### 好偵測的影片條件

| 建議 | 說明 |
|------|------|
| 高對比 | 深色背景 + 淺色主體，或反之 |
| 背景靜止 | 鏡頭固定、無閃爍光源、無背景動態元素 |
| 動作清晰 | 物體橫跨畫面移動，速度不過快（畫面不糊） |

| 避免 | 說明 |
|------|------|
| 顏色相近 | 主體與背景色差太小，難以偵測 |
| 背景動態 | 鏡頭搖晃或背景有大量變化，會造成誤觸發 |
| 速度極端 | 過快導致畫面模糊遺漏；完全靜止則無音符 |

---

## 音效設定

| 參數 | 說明 |
|------|------|
| Musical Scale | 選擇音階（五聲音階、利底亞、多利安等） |
| Octave Range | 調整音域範圍 |
| Rhythmic Snap | 開啟後音符對齊節拍格線（1/8、1/16、1/4 音符） |
| Reverb Size | 殘響大小 |
| Delay Time | 延遲回音強度 |
| Master Vol | 主音量 |

> 首次按下 **Play + Activate** 時，音效引擎需約 3 秒初始化（Reverb IR 生成）。狀態列顯示「audio: ready」後再移動物體。

---

## 技術棧

- **Tone.js 14.8** — 音效合成、效果鏈（Reverb、FeedbackDelay、Chorus）、節拍對齊
- **Canvas API** — 逐像素動態偵測、觸發線繪製
- **React 18 + TypeScript** — 元件化重構版本
- **Vite 4** — 開發伺服器與打包

---

## 授權

MIT
