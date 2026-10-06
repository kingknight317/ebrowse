# CleanLink & QuickShare (Chrome Extension)

專為鍵盤狂人設計的**新世代純淨網址與深度正規化分享助手**。

---

## 核心特色

1. **激進路徑裁剪與深度正規化 (Aggressive Canonical Extraction)**：
   * **各國主流購物電商平台**：
     * **Amazon 全球站**：提煉標準全球格式 `amazon.<tld>/dp/<ASIN>`。
     * **蝦皮 (Shopee)**：砍除長串中文品名 SEO Slug 與導流碼，提煉標準 `/product/店鋪ID/商品ID`。
     * **Momo 購物網 (台灣)**：砍除分類代碼與多組 mdiv, Area 導流碼，僅保留核心 `i_code`。
     * **PChome 24h (台灣)**：砍除長串推薦與搜尋參數，提煉為純淨 `/prod/商品ID`。
     * **eBay 全球站**：移除長串商品標題與 `_trkparms`, `amdata` 追蹤碼，提煉 `/itm/物品ID`。
     * **AliExpress 全球速賣通**：砍除 `spm`, `pdp_npi`, `algo_pvid` 等，提煉為 `/item/商品ID.html`。
     * **淘寶 (Taobao) / 天貓 (Tmall)**：砍除長串推薦參數，僅保留核心商品 `id`。
     * **Coupang 酷澎 (台/韓)**：移除 `vendorItemId` 與分流渠道，提煉為 `/vp/products/商品ID`。
     * **JD 京東**：砍除聯盟分銷推廣碼，提煉為 `/item.jd.com/商品ID.html`。
     * **Steam 遊戲商城**：砍除長串遊戲標題與 `snr` 導流碼，提煉為標準 `/app/AppID/`。
   * **社群媒體與影音內容平台**：
     * **Google 搜尋**：原本三四百字連結，砍除數十組除錯參數，激進精簡為 `google.com/search?q=關鍵字`。
     * **YouTube**：剝離推薦追蹤標籤（`si=...`、`feature=...`），支援保留播放時間戳記（`?t=...`），Shorts 乾淨去追蹤。
     * **Twitter / X**：砍除所有來源分享參數，保留純淨狀態頁 `x.com/用戶名/status/貼文ID`。
     * **Reddit**：砍除超長標題路徑，轉為官方超短網址 `https://redd.it/文章ID`。
     * **Bilibili**：砍除 `vd_source`、`spm_id_from` 等參數，保留乾淨影片頁。
     * **Instagram**：剝離官方分享注入的 `igsh=`, `utm_source=` 追蹤碼，保留純淨貼文與 Reels 短網址。
     * **Threads**：移除 Meta 跨平台 `xmt=` 導流追蹤碼，保留乾淨貼文連結。
     * **Spotify**：移除分享按鈕注入的 `si=...` 個人裝置追蹤碼與 `context` 標籤。
     * **Netflix**：將繁複播放網址提煉為標準 `/title/影片ID`，砍除 `trackId` 參數。
   * **通用資安與跨國自適應防護**：
     * **PII 敏感個資防護**：自動過濾並警示含有 `email=`、`token=`、`auth=`、`session=` 等個人識別資訊的網址。
     * **跨國語系與幣別脫敏 (Global Adaptive)**：自動剝離 `hl=`, `gl=`, `lang=`, `currency=` 等參數，使海外朋友以自身裝置語系瀏覽。

2. **精準快捷操作 (快捷鍵 + 右鍵選單 + Mini Popup)**：
   * **全局快捷鍵**：
     * `Alt + C`：一鍵複製純淨網址 (Clean URL)。
     * `Alt + M`：一鍵複製 Markdown 格式連結 `[網頁標題](純淨網址)`。
     * `Alt + Q`：一鍵複製反白選取文字引言與來源網址。
   * **右鍵上下文選單 (Context Menu)**：在任何網頁、超連結或反白文字上按右鍵即可呼叫。
   * **Mini Popup 介面**：同行並列三張卡片，圖示放大置中，整合 `morphicons` 彈簧物理變形動畫。

3. **專屬本地設定中心 (Options Page)**：
   * 點擊彈窗右下角齒輪按鈕，即在新分頁開啟我們專屬的高質感設定中心。
   * 可自由切換各平台（Google、蝦皮、Reddit、Twitter 等）的正規化開關、PII 防護、跨國自適應與影音偏好。
   * 內建快捷鍵管理指南與 Chrome 原生快捷鍵跳轉按鈕。

4. **影音加速助手與萬用 PotPlayer 聯動 (Stream Booster & Universal PotPlayer)**：
   * **萬用影音探測引擎**：支援 HTML5 Direct MP4/WebM、HLS `.m3u8`、DASH `.mpd`、延遲載入串流以及深層 iFrame 穿透探測。
   * **MSE Blob 逆向嗅探**：透過底層網路攔截（Fetch / XHR Hook）直接捕獲真實串流清單網址，突破內部 `blob:` 無法外部開啟之限制。
   * **本機 PotPlayer 一鍵跳轉**：游標懸停影片右上角時淡入極簡雙膠囊工具列，點擊一鍵透過 `potplayer://` 呼出本機 PotPlayer 進行硬解播放。
   * **播放進度時間戳同步**：自動辨識當前播放秒數，精確附加時間戳（如 YouTube `&t=Xs`），跳轉時自動暫停網頁影片防止雙重播放。
   * **通用子母畫面 (Universal PiP)**：支援原生子母畫面雙向切換，突破網站刻意設置的 `disablePictureInPicture` 限制。
   * **預覽頁智慧排除**：在 YouTube 首頁、搜尋結果、訂閱動態等預覽卡片自動靜默，杜絕多餘干擾。
   * **嚴格零 Emoji、純幾何向量 SVG、溫潤暖沙燕麥紙質系設計風格**。

---

## 專案結構 / Project Structure

```
ebrowse/
├── background/
│   └── service-worker.js         # 後台服務核心 (右鍵選單、快捷鍵派發與通訊)
├── content/
│   ├── booster-injected.js       # 影音串流底層攔截與 HLS/DASH 嗅探 (MAIN 執行環境)
│   ├── content.css               # 暖沙燕麥紙質系 UI、懸浮雙膠囊與浮動 HUD 樣式
│   └── content.js                # 內容腳本 (懸浮工具列、快選引言、行前雷達與視訊探測)
├── lib/
│   ├── cleaner.js                # 激進網址正規化與 PII 脫敏核心引擎
│   ├── formatter.js              # Markdown 與 Text Fragment 引言格式化器
│   ├── i18n.js                   # 4 國語言 (繁中/簡中/英/日) 對稱國際化字典
│   ├── media-extractor.js        # 各平台高解析原圖逆向提取模組
│   ├── radar.js                  # 連結行前探測器 (付費牆與內容農場辨識)
│   └── stream-booster.js         # 影音加速助手、PotPlayer 協議建構與萬用探測
├── options/
│   ├── options.html              # 設定中心視覺介面 (五大偏好面板)
│   ├── options.css               # 設定中心樣式
│   └── options.js                # 設定中心資料讀寫與 Chrome Storage 同步
├── popup/
│   ├── popup.html                # 彈出卡片介面 (精簡三卡片架構)
│   ├── popup.css                 # 彈出介面樣式
│   └── popup.js                  # 彈出卡片互動邏輯與快捷按鍵
├── scripts/
│   ├── test-booster.mjs          # 影音加速與 PotPlayer 單元測試 (48 項)
│   ├── test-cleaner.mjs          # 網址正規化單元測試 (22 項)
│   ├── test-formatter.mjs        # 格式化器單元測試 (14 項)
│   ├── test-i18n.mjs             # 多語言對稱完整性單元測試 (14 項)
│   ├── test-media.mjs            # 媒體原圖提取單元測試 (8 項)
│   ├── test-radar.mjs            # 連結雷達單元測試 (23 項)
│   └── verify-integrity.mjs      # 全專案檔案引用與結構完整性校驗
├── manifest.json                 # Chrome Extension Manifest V3 設定檔
├── package.json                  # 專案套件配置
└── README.md                     # 專案繁體中文說明文件
```

---

## 如何在 Chrome 中載入測試

1. 打開 Google Chrome 瀏覽器，網址列輸入 `chrome://extensions`。
2. 開啟右上角「開發人員模式 (Developer mode)」。
3. 點擊「載入未封裝項目 (Load unpacked)」，選擇此專案根目錄 `ebrowse`。
4. 點擊彈窗右下角的齒輪按鈕，即可開啟專屬的本地設定中心進行功能微調。

---

*Last updated / ?敺?? 2026-10-06 (v1.0.1)*
