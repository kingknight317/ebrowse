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

---

## 如何在 Chrome 中載入測試

1. 打開 Google Chrome 瀏覽器，網址列輸入 `chrome://extensions`。
2. 找到 **CleanLink & QuickShare** 卡片，點擊右下角的 **「重新載入 (Reload)」** 按鈕。
3. 點擊彈窗右下角的齒輪按鈕，即可開啟專屬的本地設定中心。
