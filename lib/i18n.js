/**
 * CleanLink & QuickShare - Unified i18n Engine & Dictionaries
 * Supports: Traditional Chinese (zh-TW), Simplified Chinese (zh-CN), English (en), Japanese (ja)
 * Automatic detection based on browser language (navigator.language / chrome.i18n.getUILanguage)
 * Dynamic runtime language switching persisted via chrome.storage.sync
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', label: '自動 (瀏覽器預設)', labelEn: 'Auto (Browser Default)' },
  { code: 'zh-TW', label: '繁體中文', labelEn: 'Traditional Chinese' },
  { code: 'zh-CN', label: '简体中文', labelEn: 'Simplified Chinese' },
  { code: 'en', label: 'English', labelEn: 'English' },
  { code: 'ja', label: '日本語', labelEn: 'Japanese' }
];

export const DICTIONARY = {
  'zh-TW': {
    // 右鍵選單    // 品牌與通用
    'brand.name': 'CleanLink',
    'brand.badge': 'QuickShare',
    'brand.desc': '純淨網址與深度正規化分享助手',
    'common.loading': '載入中...',
    'common.saveSuccess': '設定已即時同步儲存',
    'common.footerNotice': '100% 本地運算 · 零數據收集',
    'common.footerNoticeFull': 'CleanLink & QuickShare · 100% 本地運算 · 零數據收集 · 極致鍵盤分享助手',
    'common.language': '介面語言',
    'common.languageAuto': '自動 (跟隨瀏覽器)',

    // Popup: 頂部與批次
    'popup.batchToggleTitle': '切換多分頁批次匯出模式 (B)',
    'popup.batchToggleLabel': '切換多分頁批次匯出模式 (快捷鍵 B)',
    'popup.batch': '批次',
    'popup.selectAll': '全選分頁',
    'popup.selectedCount': '已選取 {selected} / {total}',
    'popup.noTabsSelected': '請至少勾選一個分頁',

    // Popup: 影音加速助手
    'booster.title': '影音加速助手',
    'booster.badge': 'Stream Booster',
    'booster.statusEnabled': '已啟用',
    'booster.statusPaused': '已暫停',
    'booster.toggleTitle': '切換影音加速助手啟用狀態',
    'booster.qualityHeading': '鎖定解析度',
    'booster.qualityAuto': '自動',
    'booster.qualityAutoDesc': '不強制鎖定，由播放器自動調節',
    'booster.quality720pDesc': '鎖定 720p 高畫質',
    'booster.quality1080pDesc': '鎖定 1080p Full HD',
    'booster.quality1440pDesc': '鎖定 1440p 2K 畫質',
    'booster.quality2160pDesc': '鎖定 4K 超高畫質',

    // Popup: 三大核心按鈕
    'popup.cleanUrl': '純淨網址',
    'popup.cleanUrlSub': 'Clean URL',
    'popup.cleanUrlTitle': '複製純淨網址 (Clean URL)',
    'popup.cleanUrlAria': '複製純淨網址 (快捷鍵 1)',
    'popup.markdown': 'Markdown',
    'popup.markdownSub': '[標題](網址)',
    'popup.markdownTitle': '複製 Markdown 格式連結',
    'popup.markdownAria': '複製 Markdown 格式連結 (快捷鍵 2)',
    'popup.quote': '引言來源',
    'popup.quoteSub': 'Quote & Link',
    'popup.quoteTitle': '複製選取引言與來源連結',
    'popup.quoteAria': '複製選取引言與來源連結 (快捷鍵 3)',

    // Popup: 網址卡片與 PII
    'pii.alertTitle': '已攔截敏感個資 (PII)',
    'pii.alertDefault': '已自動為您過濾敏感授權或個人帳號資訊。',
    'pii.alertDetails': '已自動為您過濾敏感授權或個人參數: {params}',
    'urlCard.title': '轉換後純淨網址',
    'urlCard.savings': '省下 {pct}%',
    'urlCard.clickCopyHint': '點擊可複製',
    'urlCard.copiedHint': '已複製至剪貼簿',
    'urlCard.boxAria': '點擊直接複製純淨網址',
    'urlCard.boxTitle': '點擊直接複製網址',
    'urlCard.cannotUse': '無法在此頁面使用',
    'urlCard.restricted': '受限瀏覽器內部頁面',
    'urlCard.origLabel': '原始:',
    'urlCard.strippedLabel': '已剝離:',

    // Popup: 底部與開關
    'yt.keepTime': '保留播放時間戳記 ({time})',
    'yt.keepTimeAria': '保留播放時間戳記',
    'media.highRes': '高清原圖下載',
    'media.rightClickSupport': '右鍵支援',
    'popup.footerStatusDefault': '點擊卡片快速複製 · Esc 關閉',
    'popup.footerStatusBatch': '批次模式 · 點擊下方按鈕整批匯出 · 按 B 切換',
    'popup.footerBatchSuccess': '已批次複製 {count} 個分頁至剪貼簿',
    'popup.footerStatusCopied': '已複製至剪貼簿',
    'popup.footerBoosterToggle': '影音加速助手已{status}',
    'popup.footerResolutionLocked': '已鎖定解析度：{label}',
    'popup.settingsTitle': '開啟設定中心 (O)',
    'popup.settingsAria': '開啟設定中心 (快捷鍵 O)',
    'popup.stateEnabled': '開啟',
    'popup.statePaused': '暫停',

    // Options: 側欄導航
    'nav.social': '社群軟體',
    'nav.ecommerce': '電商平台',
    'nav.pii': '隱私與個資防護',
    'nav.global': '跨國語系獨立',
    'nav.media': '影音偏好',
    'nav.radar': '連結行前探測',
    'nav.shortcuts': '快捷鍵配置',
    'nav.all': '全部設定總覽',

    // Options: Tab Meta (標題與副標題)
    'tab.social.title': '社群軟體與數位內容',
    'tab.social.subtitle': '剝離社交平台注入的好友分享碼、個人推薦與跨站追蹤標記',
    'tab.ecommerce.title': '各國主流購物電商平台',
    'tab.ecommerce.subtitle': '砍除商品長品名 SEO Slug、聯盟分潤追蹤碼、廣告推薦與導流標籤',
    'tab.pii.title': '隱私與個人識別資訊 (PII) 安全防護',
    'tab.pii.subtitle': '防止在分享時意外將含有個人帳號、授權 Token 或 Session 的網址傳送給他人',
    'tab.global.title': '跨國語系與幣別獨立（自適應脫敏）',
    'tab.global.subtitle': '自動剝離強制鎖定的語系與幣別參數，讓海外或跨語系接收者以自身裝置偏好瀏覽',
    'tab.media.title': '影音偏好與極速串流',
    'tab.media.subtitle': '影音加速助手、阻止軟解請求、畫質鎖定、時間戳記與原圖直取',
    'tab.radar.title': '連結行前探測器 (Pre-Flight Link Radar)',
    'tab.radar.subtitle': '滑鼠懸浮即時預警付費牆、強制登入與低品質 AI 內容農場',
    'tab.shortcuts.title': '鍵盤快捷鍵配置',
    'tab.shortcuts.subtitle': '目前預設全局快捷鍵與自訂修改導引',
    'tab.all.title': '全部設定總覽',
    'tab.all.subtitle': '同時檢視並自由切換所有支援平台的偏好開關',

    // Options: Section 標題與描述
    'sec.social.title': '熱門社群與串流平台',
    'sec.social.desc': '自動剝離社交分享注入的推薦代碼、好友標識與狀態追蹤',
    'sec.ecom.title': '國內外主流購物電商',
    'sec.ecom.desc': '砍除商品網址中的長冗長中文品名 SEO Slug 與聯盟行銷推薦分潤碼',
    'sec.pii.title': '隱私與個人識別資訊 (PII) 安全防護',
    'sec.pii.desc': '防止在分享時意外將含有個人帳號、授權 Token 或 Session 的網址傳送給他人',
    'sec.global.title': '跨國語系與幣別獨立（自適應脫敏）',
    'sec.global.desc': '自動剝離強制鎖定的語系與幣別參數，讓海外或跨語系接收者以自身裝置偏好瀏覽',
    'sec.yt.title': 'YouTube 影音偏好',
    'sec.yt.desc': '自訂複製 YouTube 影片時的時間戳記行為',
    'sec.mediaOrig.title': '高畫質純淨原圖直取與下載 (Original Media Extractor)',
    'sec.mediaOrig.desc': '在網頁圖片上點擊右鍵直接開啟、下載或複製未經壓縮的最高畫質純淨原圖',
    'sec.booster.title': '影音加速助手 (Stream Booster)',
    'sec.booster.desc': '透過硬解優先降負、跳過 ABR 階梯試探與擴展開源播放器緩衝，加速影片載入並消除卡頓',
    'sec.radar.title': '點擊前防雷：連結行前探測器 (Pre-Flight Link Radar)',
    'sec.radar.desc': '在滑鼠懸浮於超連結時即時預警付費牆、強制登入與低品質 AI 內容農場',
    'sec.radarPos.title': '提示標籤位置偏好與即時預覽',
    'sec.radarPos.desc': '自訂預警標籤相對於鼠標或超連結的出現方位，並在下方沙盒中即時預覽',
    'sec.shortcuts.title': '鍵盤快捷鍵配置',
    'sec.shortcuts.desc': '目前預設全局快捷鍵與自訂修改導引',
    'sec.textFrag.title': '引言快捷鍵增強：精準段落錨點',
    'sec.textFrag.desc': '反白選取文字並使用 Alt + Q 複製時的跳轉錨點行為配置',

    // Options: 設定項目 Label & Hint
    'opt.cleanGoogle': 'Google 搜尋激進瘦身',
    'opt.cleanGoogleHint': '砍除數十組內部參數（sca_esv, sxsrf, ei 等），只保留核心關鍵字 q=',
    'opt.cleanTwitter': 'Twitter / X 去除分享來源',
    'opt.cleanTwitterHint': '剝離分享按鈕注入的 ?s=20&t=... 等追蹤參數，保留純淨狀態頁',
    'opt.cleanReddit': 'Reddit 轉 redd.it 極短網址',
    'opt.cleanRedditHint': '自動轉化為 Reddit 官方超短網址格式（例如 https://redd.it/abc123）',
    'opt.cleanBilibili': 'Bilibili 剝離推薦與來源碼',
    'opt.cleanBilibiliHint': '移除 vd_source、spm_id_from 等參數，保留乾淨影片頁面',
    'opt.cleanInstagram': 'Instagram (貼文 / Reels)',
    'opt.cleanInstagramHint': '剝離官方分享注入的 igsh=, utm_source= 追蹤碼，保留乾淨短網址',
    'opt.cleanThreads': 'Threads 貼文',
    'opt.cleanThreadsHint': '移除 Meta 跨平台 xmt= 導流追蹤代碼，保留純淨貼文連結',
    'opt.cleanSpotify': 'Spotify 音樂 / 專輯 / 播放清單',
    'opt.cleanSpotifyHint': '移除分享按鈕注入的 si=... 個人裝置追蹤代碼與 context 標籤',
    'opt.cleanNetflix': 'Netflix 影集與電影',
    'opt.cleanNetflixHint': '將繁複播放網址提煉為標準 /title/影片ID，砍除 trackId 參數',

    'opt.cleanAmazon': 'Amazon (美日德各國全站點)',
    'opt.cleanAmazonHint': '砍除非必要路徑與導流標籤，只保留標準最短官方格式 /dp/ASIN',
    'opt.cleanShopee': '蝦皮購物 (Shopee)',
    'opt.cleanShopeeHint': '剝離中文 SEO 冗長品名與分潤追蹤碼，標準化為 /product/賣家ID/商品ID',
    'opt.cleanMomo': 'momo 購物網',
    'opt.cleanMomoHint': '提煉純淨商品代碼 i_code，砍除分類導流 mdiv 與促銷參數',
    'opt.cleanPchome': 'PChome 24h 購物',
    'opt.cleanPchomeHint': '剝離分類大綱與行銷引流標籤，保留乾淨 /prod/商品編號 網址',
    'opt.cleanEbay': 'eBay 全球拍賣商城',
    'opt.cleanEbayHint': '剝離商品長品名 Slug 與 _trkparms 追蹤碼，保留純淨 /itm/物品ID',
    'opt.cleanAliexpress': 'AliExpress 全球速賣通',
    'opt.cleanAliexpressHint': '剝離 spm 追蹤參數與推薦算法標記，保留乾淨 /item/商品ID.html',
    'opt.cleanTaobao': '淘寶 / 天貓 (Taobao & Tmall)',
    'opt.cleanTaobaoHint': '移除阿里系 spm 追蹤標記與導流廣告碼，提煉純淨 id= 物品代碼',
    'opt.cleanCoupang': 'Coupang 酷澎',
    'opt.cleanCoupangHint': '移除 vendorItemId 與行銷引流標籤，保留標準 /vp/products/商品ID',
    'opt.cleanJd': 'JD 京東商城',
    'opt.cleanJdHint': '剝離推廣追蹤代碼與導流參數，保留標準 /商品編號.html 純淨連結',
    'opt.cleanSteam': 'Steam 遊戲商店',
    'opt.cleanSteamHint': '砍除遊戲長名稱 Slug 與 snr 分流導航標籤，保留標準 /app/遊戲ID',

    'opt.filterPII': '自動攔截並脫敏敏感個資 (PII)',
    'opt.filterPIIHint': '偵測並過濾 email=, token=, auth=, session= 等敏感參數，並在彈窗中醒目警示',
    'opt.globalAdaptive': '啟用跨國語系與幣別自適應脫敏',
    'opt.globalAdaptiveHint': '自動剔除 hl=, gl=, lang=, locale=, currency=, curr= 等參數，避免對方點開被強迫鎖定為您的語言或幣別',
    'opt.preserveYtTime': '預設保留當前播放秒數時間戳記 (?t=Xs)',
    'opt.preserveYtTimeHint': '複製 YouTube 連結時，預設帶上您正在觀看的當前時間進度',
    'opt.enableMediaOriginal': '啟用高畫質純淨原圖直取功能',
    'opt.enableMediaOriginalHint': '開啟後，於網頁任一圖片點擊右鍵，即可在功能表中直接使用「在新分頁開啟高清原圖」、「下載高清純淨原圖」與「複製高清原圖網址」',
    'opt.enableStreamBooster': '啟用影音加速助手',
    'opt.enableStreamBoosterHint': '整體開啟或暫停影音加速與畫質鎖定功能',
    'opt.boosterDisableAV1': '優先 GPU 硬體解碼（阻止 AV1 軟解請求）',
    'opt.boosterDisableAV1Hint': '智慧阻斷高耗能的 AV1 軟解格式，促使 YouTube、Bilibili 等平台推送具備 GPU 原生硬解的 VP9 / H.264，大幅降低 CPU 佔用，消除軟解引起的假性轉圈與掉幀',
    'opt.boosterQuality': '預設鎖定解析度',
    'opt.boosterQualityHint': '跳過播放器開頭 360p 的階梯頻寬試探，直接鎖定首選畫質（可在彈出視窗隨時點擊切換）',
    'opt.boosterExpandHLS': '開源播放器前瞻快取擴展（Hls.js / Dash.js）',
    'opt.boosterExpandHLSHint': '在採用開源串流播放器的影視網站與新聞台，將前瞻緩衝長度從預設 30 秒擴展至 120 秒（配額 60MB），免除網路瞬斷轉圈困擾',

    'opt.enablePipHoverBtn': '啟用播放器懸浮子母畫面手動按鈕 (Hover PiP Button)',
    'opt.enablePipHoverBtnHint': '滑鼠移至網頁影片右上角時淡入極簡子母畫面圖示，點擊即可手動開啟或還原原生子母畫面。純手動觸發，絕不自動彈出打擾',
    'pip.buttonTitle': '開啟子母畫面 (Picture-in-Picture)',
    'pip.restoreTitle': '還原子母畫面 (Exit Picture-in-Picture)',

    'opt.enableLinkRadar': '啟用連結行前探測懸浮預警 (Hover Peek)',
    'opt.enableLinkRadarHint': '游標停留於網頁連結 180ms 時，於上方即時彈出網站屬性微型提示卡片',
    'opt.radarAlertOnly': '僅在偵測到警告（付費牆或內容農場）時顯示提示',
    'opt.radarAlertOnlyHint': '開啟後，正常無害的網站將保持隱形不打擾，僅在遇到風險目標時主動跳出警示',
    'opt.enableTextFragment': '反白文字自動附加精準段落錨點 (Scroll-to-Text)',
    'opt.enableTextFragmentHint': '使用 Alt+Q 或反白浮動按鈕時，自動在網址末端附加 #:~:text= 錨點，點擊連結者直接平滑捲動至該段反白並高亮',

    // Options: Info Cards
    'info.piiTitle': '受防護的敏感參數特徵',
    'info.piiDesc': '包含 email, user_email, token, access_token, auth, jwt, session, session_id, user_id, api_key, auth_token, bearer 及符合電子信箱格式的網址查詢參數。',
    'info.globalTitle': '自適應脫敏參數範圍',
    'info.globalDesc': '涵蓋語系與地區標籤（hl, gl, lang, language, locale, country, region, intl, setlang）以及計價幣別標籤（currency, curr）。若有分享固定語系的需求，可隨時在此一鍵關閉。',
    'info.ytTitle': '即時切換快捷鍵',
    'info.ytDesc': '在 YouTube 頁面開啟彈窗時，直接按下鍵盤「T」鍵即可立即切換是否保留當前秒數時間戳記。',
    'info.mediaOrigTitle': '支援平台與高畫質逆向規格',
    'info.mediaOrigDesc': 'Twitter / X（自動還原 :orig 原畫質無損檔）、Reddit（預覽圖自動還原 i.redd.it 原始圖檔）、Bilibili（剝離動態縮圖及 @webp 尺寸後綴）、YouTube（自動升級提取 1080p 超高解析度 maxresdefault.jpg 封面）、新浪微博（自動升級至 /large/ 原始大圖）、維基共享資源 Wikimedia（自動剝離 /thumb/ 提取無損原始檔）以及各大常見圖床縮圖尺寸自動脫敏。',
    'info.boosterTitle': '影音加速運作機制說明',
    'info.boosterDesc': '本功能採用現代前端無損架構：透過遮蔽無硬解支援的高負載編碼以釋放 80%+ 的 CPU 負擔；並於播放器初始化時直接指定目標畫質，消除首段試探的緩衝重建延遲；開源 HLS 前瞻長度則在瀏覽器安全記憶體限額內平穩推進。',
    'info.radarTitle': '探測器預警標籤與視覺規範',
    'info.radarDesc': '全介面採用極致俐落之幾何向量 SVG 圖示，嚴格零 Emoji 干擾：\n• 八角盾牌警示：警告：此站有嚴格付費牆 / 強制登入（涵蓋 WSJ、NYT、彭博、天下、商周、財新等付費鎖死媒體與 Quora、Scribd 等強制註冊閱讀平台）\n• 琥珀三角警示：警告：偵測到為低品質 AI 內容農場（涵蓋各類廢話採集站、轉載洗稿農場與程式碼採集站）\n• 翡翠勾選圓環：正常（安全可信或未受污染之正常網路資源）',
    'info.textFragTitle': '精準錨點作用機制',
    'info.textFragDesc': '僅在使用者於網頁中有實際反白選取文字時才會啟用錨點，未選取時將自動維持純淨原始網址。符合 W3C 原生標準規範，若接收端平台不支援將自動降級開啟原頁面，不影響瀏覽體驗。',

    // Options: 方位卡片與預覽沙盒
    'pos.cursorTopRight': '緊貼鼠標右上',
    'pos.cursorTopRightDesc': '預設推薦，最靠近視覺焦點',
    'pos.cursorTop': '鼠標正上方',
    'pos.cursorTopDesc': '居中對齊游標中軸',
    'pos.cursorBottomRight': '鼠標右下方',
    'pos.cursorBottomRightDesc': '避免遮擋上方內文',
    'pos.anchorTop': '超連結正上方',
    'pos.anchorTopDesc': '貼齊連結頂部邊界',

    'preview.paywallTab': '付費牆',
    'preview.farmTab': '內容農場',
    'preview.safeTab': '正常',
    'preview.mockNewsText': '最新市場焦點分析：聯準會公佈最新政策走向，讀者可點此查閱',
    'preview.mockLink': '紐約時報付費專題報導',
    'preview.mockNewsTail': '進行深度分析，並提供市場未來季度估值走勢預測。',
    'preview.hint': '可切換上方方位即時觀察位置變化，亦可直接將滑鼠移至超連結體驗實際效果',

    // Options: 快捷鍵
    'shortcut.cleanUrl': '複製純淨網址',
    'shortcut.markdown': '複製 Markdown 連結',
    'shortcut.quote': '複製選取引言與來源',
    'shortcut.btnOpenChrome': '前往 Chrome 原生自訂快捷鍵設定',
    'shortcut.openNote': '將開啟 chrome://extensions/shortcuts，可隨時替換鍵盤組合鍵',

    // Radar 標籤文字
    'radar.paywall': '警告：此站有嚴格付費牆 / 強制登入',
    'radar.aiFarm': '警告：偵測到為低品質 AI 內容農場',
    'radar.safe': '正常',

    // 右鍵選單
    'context.main': 'CleanLink 乾淨分享',
    'context.cleanUrl': '複製純淨網址 (Clean URL)  [Alt+C]',
    'context.markdown': '複製 Markdown 格式連結  [Alt+M]',
    'context.quote': '複製引言與來源網址  [Alt+Q]',
    'context.imageOpen': '在新分頁開啟高清原圖',
    'context.imageDownload': '下載高清純淨原圖',
    'context.imageCopy': '複製高清原圖網址',
    'pill.quoteBtn': '引言連結',
    'pill.copied': '已複製'
  },

  'zh-CN': {
    // 右鍵選單    // 品牌与通用
    'brand.name': 'CleanLink',
    'brand.badge': 'QuickShare',
    'brand.desc': '纯净网址与深度规范化分享助手',
    'common.loading': '加载中...',
    'common.saveSuccess': '设置已即时同步保存',
    'common.footerNotice': '100% 本地运算 · 零数据收集',
    'common.footerNoticeFull': 'CleanLink & QuickShare · 100% 本地运算 · 零数据收集 · 极致键盘分享助手',
    'common.language': '界面语言',
    'common.languageAuto': '自动 (跟随浏览器)',

    // Popup: 顶部与批处理
    'popup.batchToggleTitle': '切换多标签页批量导出模式 (B)',
    'popup.batchToggleLabel': '切换多标签页批量导出模式 (快捷键 B)',
    'popup.batch': '批量',
    'popup.selectAll': '全选标签页',
    'popup.selectedCount': '已选取 {selected} / {total}',
    'popup.noTabsSelected': '请至少勾选一个标签页',

    // Popup: 影音加速助手
    'booster.title': '影音加速助手',
    'booster.badge': 'Stream Booster',
    'booster.statusEnabled': '已启用',
    'booster.statusPaused': '已暂停',
    'booster.toggleTitle': '切换影音加速助手启用状态',
    'booster.qualityHeading': '锁定分辨率',
    'booster.qualityAuto': '自动',
    'booster.qualityAutoDesc': '不强制锁定，由播放器自动调节',
    'booster.quality720pDesc': '锁定 720p 高清',
    'booster.quality1080pDesc': '锁定 1080p 全高清',
    'booster.quality1440pDesc': '锁定 1440p 2K 级别',
    'booster.quality2160pDesc': '锁定 4K 超高清',

    // Popup: 三大核心按钮
    'popup.cleanUrl': '纯净网址',
    'popup.cleanUrlSub': 'Clean URL',
    'popup.cleanUrlTitle': '复制纯净网址 (Clean URL)',
    'popup.cleanUrlAria': '复制纯净网址 (快捷键 1)',
    'popup.markdown': 'Markdown',
    'popup.markdownSub': '[标题](网址)',
    'popup.markdownTitle': '复制 Markdown 格式链接',
    'popup.markdownAria': '复制 Markdown 格式链接 (快捷键 2)',
    'popup.quote': '引言来源',
    'popup.quoteSub': 'Quote & Link',
    'popup.quoteTitle': '复制选取引言与来源链接',
    'popup.quoteAria': '复制选取引言与来源链接 (快捷键 3)',

    // Popup: 网址卡片与 PII
    'pii.alertTitle': '已拦截敏感隐私数据 (PII)',
    'pii.alertDefault': '已自动为您过滤敏感授权或个人账号信息。',
    'pii.alertDetails': '已自动为您过滤敏感授权或个人参数: {params}',
    'urlCard.title': '转换后纯净网址',
    'urlCard.savings': '节省 {pct}%',
    'urlCard.clickCopyHint': '点击可复制',
    'urlCard.copiedHint': '已复制到剪贴板',
    'urlCard.boxAria': '点击直接复制纯净网址',
    'urlCard.boxTitle': '点击直接复制网址',
    'urlCard.cannotUse': '无法在此页面使用',
    'urlCard.restricted': '受限浏览器内部页面',
    'urlCard.origLabel': '原始:',
    'urlCard.strippedLabel': '已剥离:',

    // Popup: 底部与开关
    'yt.keepTime': '保留播放时间戳 ({time})',
    'yt.keepTimeAria': '保留播放时间戳',
    'media.highRes': '高清原图下载',
    'media.rightClickSupport': '右键支持',
    'popup.footerStatusDefault': '点击卡片快速复制 · Esc 关闭',
    'popup.footerStatusBatch': '批量模式 · 点击下方按钮整批导出 · 按 B 切换',
    'popup.footerBatchSuccess': '已批量复制 {count} 个标签页到剪贴板',
    'popup.footerStatusCopied': '已复制到剪贴板',
    'popup.footerBoosterToggle': '影音加速助手已{status}',
    'popup.footerResolutionLocked': '已锁定分辨率：{label}',
    'popup.settingsTitle': '打开设置中心 (O)',
    'popup.settingsAria': '打开设置中心 (快捷键 O)',
    'popup.stateEnabled': '开启',
    'popup.statePaused': '暂停',

    // Options: 侧栏导航
    'nav.social': '社交软件',
    'nav.ecommerce': '电商平台',
    'nav.pii': '隐私与个资防护',
    'nav.global': '跨国语言独立',
    'nav.media': '影音偏好',
    'nav.radar': '链接行前探测',
    'nav.shortcuts': '快捷键配置',
    'nav.all': '全部设置总览',

    // Options: Tab Meta
    'tab.social.title': '社交软件与数字内容',
    'tab.social.subtitle': '剥离社交平台注入的好友分享码、个人推荐与跨站追踪标记',
    'tab.ecommerce.title': '各国主流购物电商平台',
    'tab.ecommerce.subtitle': '砍除商品长品名 SEO Slug、联盟分润追踪码、广告推荐与导流标签',
    'tab.pii.title': '隐私与个人可识别信息 (PII) 安全防护',
    'tab.pii.subtitle': '防止在分享时意外将包含个人账号、授权 Token 或 Session 的网址发送给他人',
    'tab.global.title': '跨国语言与币种独立（自适应脱敏）',
    'tab.global.subtitle': '自动剥离强制锁定的语言与币种参数，让海外或跨语言接收者以自身设备偏好浏览',
    'tab.media.title': '影音偏好与极速流媒体',
    'tab.media.subtitle': '影音加速助手、阻止软解请求、画质锁定、时间戳与原图直取',
    'tab.radar.title': '链接行前探测器 (Pre-Flight Link Radar)',
    'tab.radar.subtitle': '鼠标悬浮即时预警付费墙、强制登录与低质量 AI 内容农场',
    'tab.shortcuts.title': '键盘快捷键配置',
    'tab.shortcuts.subtitle': '当前默认全局快捷键与自定义修改指引',
    'tab.all.title': '全部设置总览',
    'tab.all.subtitle': '同时查看并自由切换所有支持平台的偏好开关',

    // Options: Section
    'sec.social.title': '热门社交与流媒体平台',
    'sec.social.desc': '自动剥离社交分享注入的推荐代码、好友标识与状态追踪',
    'sec.ecom.title': '国内外主流购物电商',
    'sec.ecom.desc': '砍除商品网址中的冗长中文品名 SEO Slug 与联盟推广返利分润码',
    'sec.pii.title': '隐私与个人可识别信息 (PII) 安全防护',
    'sec.pii.desc': '防止在分享时意外将包含个人账号、授权 Token 或 Session 的网址发送给他人',
    'sec.global.title': '跨国语言与币种独立（自适应脱敏）',
    'sec.global.desc': '自动剥离强制锁定的语言与币种参数，让海外或跨语言接收者以自身设备偏好浏览',
    'sec.yt.title': 'YouTube 影音偏好',
    'sec.yt.desc': '自定义复制 YouTube 视频时的时间戳行为',
    'sec.mediaOrig.title': '高画质纯净原图直取与下载 (Original Media Extractor)',
    'sec.mediaOrig.desc': '在网页图片上点击右键直接打开、下载或复制未压缩的最高画质纯净原图',
    'sec.booster.title': '影音加速助手 (Stream Booster)',
    'sec.booster.desc': '通过硬解优先降负、跳过 ABR 阶梯试探与扩开展流播放器缓存，加速视频载入并消除卡顿',
    'sec.radar.title': '点击前防雷：链接行前探测器 (Pre-Flight Link Radar)',
    'sec.radar.desc': '在鼠标悬浮于超链接时即时预警付费墙、强制登录与低质量 AI 内容农场',
    'sec.radarPos.title': '提示标签位置偏好与即时预览',
    'sec.radarPos.desc': '自定义预警标签相对于光标或超链接的出现方位，并在下方沙盒中即时预览',
    'sec.shortcuts.title': '键盘快捷键配置',
    'sec.shortcuts.desc': '当前默认全局快捷键与自定义修改指引',
    'sec.textFrag.title': '引言快捷键增强：精准段落锚点',
    'sec.textFrag.desc': '划词选取文字并使用 Alt + Q 复制时的跳转锚点行为配置',

    // Options: Item labels & hints
    'opt.cleanGoogle': 'Google 搜索深度瘦身',
    'opt.cleanGoogleHint': '砍除数十组内部参数（sca_esv, sxsrf, ei 等），仅保留核心关键字 q=',
    'opt.cleanTwitter': 'Twitter / X 去除分享来源',
    'opt.cleanTwitterHint': '剥离分享按钮注入的 ?s=20&t=... 等追踪参数，保留纯净状态页',
    'opt.cleanReddit': 'Reddit 转 redd.it 超短网址',
    'opt.cleanRedditHint': '自动转化为 Reddit 官方超短网址格式（如 https://redd.it/abc123）',
    'opt.cleanBilibili': 'Bilibili 剥离推荐与来源码',
    'opt.cleanBilibiliHint': '移除 vd_source、spm_id_from 等参数，保留干净视频页面',
    'opt.cleanInstagram': 'Instagram (帖子 / Reels)',
    'opt.cleanInstagramHint': '剥离官方分享注入的 igsh=, utm_source= 追踪码，保留干净短网址',
    'opt.cleanThreads': 'Threads 帖子',
    'opt.cleanThreadsHint': '移除 Meta 跨平台 xmt= 导流追踪代码，保留纯净帖子链接',
    'opt.cleanSpotify': 'Spotify 音乐 / 专辑 / 歌单',
    'opt.cleanSpotifyHint': '移除分享按钮注入的 si=... 个人设备追踪代码与 context 标签',
    'opt.cleanNetflix': 'Netflix 剧集与电影',
    'opt.cleanNetflixHint': '将繁琐播放网址提炼为标准 /title/视频ID，砍除 trackId 参数',

    'opt.cleanAmazon': 'Amazon (美日德各国全站点)',
    'opt.cleanAmazonHint': '砍除非必要路径与导流标签，只保留标准最短官方格式 /dp/ASIN',
    'opt.cleanShopee': '虾皮购物 (Shopee)',
    'opt.cleanShopeeHint': '剥离中文 SEO 冗长品名与返利追踪码，标准化为 /product/卖家ID/商品ID',
    'opt.cleanMomo': 'momo 购物网',
    'opt.cleanMomoHint': '提炼纯净商品代码 i_code，砍除分类导流 mdiv 与促销参数',
    'opt.cleanPchome': 'PChome 24h 购物',
    'opt.cleanPchomeHint': '剥离分类大纲与营销引流标签，保留干净 /prod/商品编号 网址',
    'opt.cleanEbay': 'eBay 全球拍卖商城',
    'opt.cleanEbayHint': '剥离商品长品名 Slug 与 _trkparms 追踪码，保留纯净 /itm/物品ID',
    'opt.cleanAliexpress': 'AliExpress 全球速卖通',
    'opt.cleanAliexpressHint': '剥离 spm 追踪参数与推荐算法标记，保留干净 /item/商品ID.html',
    'opt.cleanTaobao': '淘宝 / 天猫 (Taobao & Tmall)',
    'opt.cleanTaobaoHint': '移除阿里系 spm 追踪标记与导流广告码，提炼纯净 id= 物品代码',
    'opt.cleanCoupang': 'Coupang 酷澎',
    'opt.cleanCoupangHint': '移除 vendorItemId 与营销引流标签，保留标准 /vp/products/商品ID',
    'opt.cleanJd': 'JD 京东商城',
    'opt.cleanJdHint': '剥离推广追踪代码与导流参数，保留标准 /商品编号.html 纯净链接',
    'opt.cleanSteam': 'Steam 游戏商店',
    'opt.cleanSteamHint': '砍除游戏长名称 Slug 与 snr 分流导航标签，保留标准 /app/游戏ID',

    'opt.filterPII': '自动拦截并脱敏敏感隐私数据 (PII)',
    'opt.filterPIIHint': '检测并过滤 email=, token=, auth=, session= 等敏感参数，并在弹窗中醒目警示',
    'opt.globalAdaptive': '启用跨国语言与币种自适应脱敏',
    'opt.globalAdaptiveHint': '自动剔除 hl=, gl=, lang=, locale=, currency=, curr= 等参数，避免对方点击时被强制锁定为您的语言或币种',
    'opt.preserveYtTime': '默认保留当前播放秒数时间戳 (?t=Xs)',
    'opt.preserveYtTimeHint': '复制 YouTube 链接时，默认带上您正在观看的当前播放进度',
    'opt.enableMediaOriginal': '启用高画质纯净原图直取功能',
    'opt.enableMediaOriginalHint': '开启后，于网页任一图片点击右键，即可在菜单中直接使用“在新标签页打开高清原图”、“下载高清纯净原图”与“复制高清原图网址”',
    'opt.enableStreamBooster': '启用影音加速助手',
    'opt.enableStreamBoosterHint': '整体开启或暂停影音加速与画质锁定功能',
    'opt.boosterDisableAV1': '优先 GPU 硬件解码（阻止 AV1 软解请求）',
    'opt.boosterDisableAV1Hint': '智能阻断高能耗的 AV1 软解格式，促使 YouTube、Bilibili 等平台推送具备 GPU 原生硬解的 VP9 / H.264，大幅降低 CPU 占用',
    'opt.boosterQuality': '默认锁定分辨率',
    'opt.boosterQualityHint': '跳过播放器开头的阶梯带宽试探，直接锁定首选画质（可在弹窗随时点击切换）',
    'opt.boosterExpandHLS': '开源播放器前瞻缓存扩展（Hls.js / Dash.js）',
    'opt.boosterExpandHLSHint': '在采用开源播放器的影视网站与新闻台，将缓冲长度从默认 30 秒扩展至 120 秒（配额 60MB），免除瞬断转圈困扰',

    'opt.enablePipHoverBtn': '启用播放器悬浮画中画手动按钮 (Hover PiP Button)',
    'opt.enablePipHoverBtnHint': '鼠标移至网页视频右上角时淡入极简画中画图标，点击即可手动开启或还原原生画中画。纯手动触发，绝不自动弹出打扰',
    'pip.buttonTitle': '开启画中画 (Picture-in-Picture)',
    'pip.restoreTitle': '还原画中画 (Exit Picture-in-Picture)',

    'opt.enableLinkRadar': '启用链接行前探测悬浮预警 (Hover Peek)',
    'opt.enableLinkRadarHint': '光标停留于网页链接 180ms 时，于上方即时弹出网站属性微型提示卡片',
    'opt.radarAlertOnly': '仅在检测到警告（付费墙或内容农场）时显示提示',
    'opt.radarAlertOnlyHint': '开启后，正常安全的网站将保持隐形不打扰，仅在遇到风险目标时主动弹出警示',
    'opt.enableTextFragment': '划词文字自动附加精准段落锚点 (Scroll-to-Text)',
    'opt.enableTextFragmentHint': '使用 Alt+Q 或划词悬浮按钮时，自动在网址末端附加 #:~:text= 锚点，点击链接者直接平滑滚动至该段并高亮',

    // Options: Info Cards
    'info.piiTitle': '受保护的敏感参数特征',
    'info.piiDesc': '包含 email, user_email, token, access_token, auth, jwt, session, session_id, user_id, api_key, auth_token, bearer 及符合邮箱格式的网址查询参数。',
    'info.globalTitle': '自适应脱敏参数范围',
    'info.globalDesc': '涵盖语言与地区标签（hl, gl, lang, language, locale, country, region, intl, setlang）以及计价币种标签（currency, curr）。若有分享固定语言的需求，可随时在此一键关闭。',
    'info.ytTitle': '即时切换快捷键',
    'info.ytDesc': '在 YouTube 页面打开弹窗时，直接按下键盘“T”键即可立即切换是否保留当前秒数时间戳。',
    'info.mediaOrigTitle': '支持平台与高清规格',
    'info.mediaOrigDesc': 'Twitter / X（还原 :orig 无损原图）、Reddit（预览图还原 i.redd.it 原图）、Bilibili（剥离动态缩略图 @webp 后缀）、YouTube（提取 1080p 超清封面）、新浪微博（升级为 /large/ 原图）、维基共享 Wikimedia（剥离 /thumb/ 提取无损文件）及各大常见图床。',
    'info.boosterTitle': '影音加速运行机制说明',
    'info.boosterDesc': '本功能采用现代前端无损架构：通过屏蔽无硬解支持的高负载编码以释放 80%+ 的 CPU 负担；并于播放器初始化时直接指定目标画质，消除首段试探的缓冲重建延迟。',
    'info.radarTitle': '探测器预警标签与视觉规范',
    'info.radarDesc': '全界面采用极简几何矢量 SVG 图标，严格零 Emoji 干扰：\n• 八角盾牌警示：此站有严格付费墙 / 强制登录\n• 琥珀三角警示：检测到为低质量 AI 内容农场\n• 翡翠勾选圆环：正常（安全可信或未受污染的正常网络资源）',
    'info.textFragTitle': '精准锚点作用机制',
    'info.textFragDesc': '仅在用户于网页中有实际划词选中文本时才会启用锚点，未选取时自动维持纯净原始网址。符合 W3C 原生标准规范。',

    // Options: 方位卡片与预览沙盒
    'pos.cursorTopRight': '紧贴光标右上',
    'pos.cursorTopRightDesc': '默认推荐，最靠近视觉焦点',
    'pos.cursorTop': '光标正上方',
    'pos.cursorTopDesc': '居中对齐光标中轴',
    'pos.cursorBottomRight': '光标右下方',
    'pos.cursorBottomRightDesc': '避免遮挡上方正文',
    'pos.anchorTop': '超链接正上方',
    'pos.anchorTopDesc': '贴齐链接顶部边界',

    'preview.paywallTab': '付费墙',
    'preview.farmTab': '内容农场',
    'preview.safeTab': '正常',
    'preview.mockNewsText': '最新市场焦点分析：美联储公布最新政策走向，读者可点击查阅',
    'preview.mockLink': '纽约时报付费专题报道',
    'preview.mockNewsTail': '进行深度分析，并提供市场未来季度估值走势预测。',
    'preview.hint': '可切换上方方位观察位置变化，亦可直接将鼠标移至超链接体验实际效果',

    // Options: 快捷键
    'shortcut.cleanUrl': '复制纯净网址',
    'shortcut.markdown': '复制 Markdown 链接',
    'shortcut.quote': '复制选取引言与来源',
    'shortcut.btnOpenChrome': '前往 Chrome 原生自定义快捷键设置',
    'shortcut.openNote': '将打开 chrome://extensions/shortcuts，可随时替换键盘快捷键',

    // Radar 标签
    'radar.paywall': '警告：此站有严格付费墙 / 强制登录',
    'radar.aiFarm': '警告：检测到为低质量 AI 内容农场',
    'radar.safe': '正常',

    // 右键菜单
    'context.main': 'CleanLink 纯净分享',
    'context.cleanUrl': '复制纯净网址 (Clean URL)  [Alt+C]',
    'context.markdown': '复制 Markdown 格式链接  [Alt+M]',
    'context.quote': '复制引言与来源网址  [Alt+Q]',
    'context.imageOpen': '在新标签页打开高清原图',
    'context.imageDownload': '下载高清纯净原图',
    'context.imageCopy': '复制高清原图网址',
    'pill.quoteBtn': '引言链接',
    'pill.copied': '已复制'
  },

  'en': {
    // Context Menus    // Brand & Common
    'brand.name': 'CleanLink',
    'brand.badge': 'QuickShare',
    'brand.desc': 'Keyboard-first clean URL & canonical share helper',
    'common.loading': 'Loading...',
    'common.saveSuccess': 'Settings saved and synced',
    'common.footerNotice': '100% On-device · Zero Data Collection',
    'common.footerNoticeFull': 'CleanLink & QuickShare · 100% On-device · Zero Data Collection · Clean URL Helper',
    'common.language': 'Language',
    'common.languageAuto': 'Auto (Browser Default)',

    // Popup: Top & Batch
    'popup.batchToggleTitle': 'Toggle Multi-tab Batch Export (B)',
    'popup.batchToggleLabel': 'Toggle Multi-tab Batch Export Mode (Key: B)',
    'popup.batch': 'Batch',
    'popup.selectAll': 'Select All Tabs',
    'popup.selectedCount': '{selected} / {total} selected',
    'popup.noTabsSelected': 'Please select at least one tab',

    // Popup: Stream Booster
    'booster.title': 'Stream Booster',
    'booster.badge': 'Stream Booster',
    'booster.statusEnabled': 'Enabled',
    'booster.statusPaused': 'Paused',
    'booster.toggleTitle': 'Toggle Stream Booster status',
    'booster.qualityHeading': 'Lock Resolution',
    'booster.qualityAuto': 'Auto',
    'booster.qualityAutoDesc': 'Adaptive resolution controlled by player',
    'booster.quality720pDesc': 'Lock to 720p HD',
    'booster.quality1080pDesc': 'Lock to 1080p Full HD',
    'booster.quality1440pDesc': 'Lock to 1440p 2K',
    'booster.quality2160pDesc': 'Lock to 4K Ultra HD',

    // Popup: 3 Actions
    'popup.cleanUrl': 'Clean URL',
    'popup.cleanUrlSub': 'Clean URL',
    'popup.cleanUrlTitle': 'Copy Clean URL (Alt+C)',
    'popup.cleanUrlAria': 'Copy Clean URL (Shortcut: 1)',
    'popup.markdown': 'Markdown',
    'popup.markdownSub': '[Title](URL)',
    'popup.markdownTitle': 'Copy Markdown Link (Alt+M)',
    'popup.markdownAria': 'Copy Markdown Link (Shortcut: 2)',
    'popup.quote': 'Quote & Link',
    'popup.quoteSub': 'Quote & Link',
    'popup.quoteTitle': 'Copy Selected Quote & Clean URL (Alt+Q)',
    'popup.quoteAria': 'Copy Quote & Source (Shortcut: 3)',

    // Popup: URL Card & PII
    'pii.alertTitle': 'Sensitive Personal Info (PII) Blocked',
    'pii.alertDefault': 'Personal account identifiers and sensitive tokens have been filtered.',
    'pii.alertDetails': 'Filtered sensitive parameters: {params}',
    'urlCard.title': 'Clean URL Result',
    'urlCard.savings': '{pct}% Saved',
    'urlCard.clickCopyHint': 'Click to copy',
    'urlCard.copiedHint': 'Copied to clipboard',
    'urlCard.boxAria': 'Click to copy clean URL',
    'urlCard.boxTitle': 'Click to copy URL',
    'urlCard.cannotUse': 'Cannot be used on this page',
    'urlCard.restricted': 'Restricted browser internal page',
    'urlCard.origLabel': 'Original:',
    'urlCard.strippedLabel': 'Stripped:',

    // Popup: Footer & Switches
    'yt.keepTime': 'Keep playback timestamp ({time})',
    'yt.keepTimeAria': 'Keep playback timestamp',
    'media.highRes': 'Original Media Extractor',
    'media.rightClickSupport': 'Right-click menu',
    'popup.footerStatusDefault': 'Click card to copy · Press Esc to close',
    'popup.footerStatusBatch': 'Batch Mode · Click buttons to export · Press B to toggle',
    'popup.footerBatchSuccess': 'Copied {count} tabs to clipboard',
    'popup.footerStatusCopied': 'Copied to clipboard',
    'popup.footerBoosterToggle': 'Stream Booster {status}',
    'popup.footerResolutionLocked': 'Resolution locked to: {label}',
    'popup.settingsTitle': 'Open Settings Center (O)',
    'popup.settingsAria': 'Open Settings Center (Key: O)',
    'popup.stateEnabled': 'enabled',
    'popup.statePaused': 'paused',

    // Options: Nav
    'nav.social': 'Social Media',
    'nav.ecommerce': 'E-Commerce',
    'nav.pii': 'PII Protection',
    'nav.global': 'Locale Desensitization',
    'nav.media': 'Media & Stream',
    'nav.radar': 'Pre-Flight Radar',
    'nav.shortcuts': 'Shortcuts',
    'nav.all': 'All Settings',

    // Options: Tab Meta
    'tab.social.title': 'Social & Digital Platforms',
    'tab.social.subtitle': 'Strip referral IDs, friend invite codes, and cross-site telemetry',
    'tab.ecommerce.title': 'Major E-Commerce Platforms',
    'tab.ecommerce.subtitle': 'Remove product SEO slugs, affiliate tracking, and advertising redirects',
    'tab.pii.title': 'Personal Identifiable Information (PII) Guard',
    'tab.pii.subtitle': 'Prevent leaking personal accounts, auth tokens, or session IDs in shared URLs',
    'tab.global.title': 'Locale & Currency Neutrality',
    'tab.global.subtitle': 'Strip forced language and currency locks, allowing recipients to view with local settings',
    'tab.media.title': 'Media Preferences & Fast Streaming',
    'tab.media.subtitle': 'Hardware acceleration, resolution locks, timestamps, and high-res image extraction',
    'tab.radar.title': 'Pre-Flight Link Radar',
    'tab.radar.subtitle': 'Instant peek warnings for paywalls, mandatory logins, and low-quality AI content farms',
    'tab.shortcuts.title': 'Keyboard Shortcuts Configuration',
    'tab.shortcuts.subtitle': 'Default global keybindings and customization guidance',
    'tab.all.title': 'All Settings Overview',
    'tab.all.subtitle': 'View and manage all supported platform switches in one place',

    // Options: Section
    'sec.social.title': 'Popular Social & Streaming Services',
    'sec.social.desc': 'Automatically eliminate referral parameters, account bindings, and analytics tags',
    'sec.ecom.title': 'Global Shopping Platforms',
    'sec.ecom.desc': 'Trim lengthy SEO slugs and affiliate commissions into canonical product URLs',
    'sec.pii.title': 'PII & Security Shield',
    'sec.pii.desc': 'Prevent sensitive auth tokens, email addresses, and session credentials from leaking',
    'sec.global.title': 'Adaptive Desensitization',
    'sec.global.desc': 'Remove forced language and regional pricing tags when sharing across borders',
    'sec.yt.title': 'YouTube Preferences',
    'sec.yt.desc': 'Configure timestamp inclusion behavior when copying YouTube videos',
    'sec.mediaOrig.title': 'Original High-Res Media Extractor',
    'sec.mediaOrig.desc': 'Right-click any web image to open, download, or copy uncompressed original files',
    'sec.booster.title': 'Stream Booster Engine',
    'sec.booster.desc': 'Prioritize GPU decoding, bypass ABR staircase hunting, and expand buffer sizes',
    'sec.radar.title': 'Pre-Flight Link Radar Inspection',
    'sec.radar.desc': 'Hover over hyperlinks to preview destination properties before clicking',
    'sec.radarPos.title': 'Badge Placement & Interactive Preview',
    'sec.radarPos.desc': 'Customize tooltip orientation relative to the cursor or hyperlink',
    'sec.shortcuts.title': 'Keyboard Shortcuts',
    'sec.shortcuts.desc': 'Configured global key combinations and Chrome settings link',
    'sec.textFrag.title': 'Text Fragment Deep Linking (Scroll-to-Text)',
    'sec.textFrag.desc': 'Automatically append exact paragraph anchor #:~:text= when text is selected',

    // Options: Items
    'opt.cleanGoogle': 'Google Search Aggressive Cleaner',
    'opt.cleanGoogleHint': 'Strip internal query junk (sca_esv, sxsrf, ei, etc.), keeping only q=',
    'opt.cleanTwitter': 'Twitter / X Share Referrals',
    'opt.cleanTwitterHint': 'Strip ?s=20&t=... share parameters to keep clean status pages',
    'opt.cleanReddit': 'Reddit to redd.it Short URLs',
    'opt.cleanRedditHint': 'Convert verbose Reddit links into canonical redd.it shortlinks',
    'opt.cleanBilibili': 'Bilibili Tracking & Source Codes',
    'opt.cleanBilibiliHint': 'Remove vd_source, spm_id_from, and user recommendation queries',
    'opt.cleanInstagram': 'Instagram (Posts / Reels)',
    'opt.cleanInstagramHint': 'Remove igsh= and utm_source= tracking tokens',
    'opt.cleanThreads': 'Threads Posts',
    'opt.cleanThreadsHint': 'Strip Meta cross-platform xmt= referral identifiers',
    'opt.cleanSpotify': 'Spotify Tracks / Albums / Playlists',
    'opt.cleanSpotifyHint': 'Remove personal device tracking code (si=) and context flags',
    'opt.cleanNetflix': 'Netflix Movies & Series',
    'opt.cleanNetflixHint': 'Simplify URLs to canonical /title/ID format without tracking params',

    'opt.cleanAmazon': 'Amazon (All Global Domains)',
    'opt.cleanAmazonHint': 'Reduce complex URLs to the shortest standard /dp/ASIN format',
    'opt.cleanShopee': 'Shopee E-Commerce',
    'opt.cleanShopeeHint': 'Remove verbose SEO titles and affiliate tokens to /product/seller/item',
    'opt.cleanMomo': 'momo Shopping',
    'opt.cleanMomoHint': 'Extract pure i_code and strip promotional routing parameters',
    'opt.cleanPchome': 'PChome 24h Shopping',
    'opt.cleanPchomeHint': 'Remove marketing tags and retain clean /prod/ID links',
    'opt.cleanEbay': 'eBay Global Marketplace',
    'opt.cleanEbayHint': 'Strip title slugs and _trkparms to canonical /itm/ID',
    'opt.cleanAliexpress': 'AliExpress Global Store',
    'opt.cleanAliexpressHint': 'Remove spm tracking and recommendation algorithms to /item/ID.html',
    'opt.cleanTaobao': 'Taobao & Tmall',
    'opt.cleanTaobaoHint': 'Strip Alibaba spm telemetry and extract canonical id=',
    'opt.cleanCoupang': 'Coupang',
    'opt.cleanCoupangHint': 'Remove vendorItemId and marketing query codes to /vp/products/ID',
    'opt.cleanJd': 'JD.com Marketplace',
    'opt.cleanJdHint': 'Strip tracking redirects to canonical /ID.html links',
    'opt.cleanSteam': 'Steam Store',
    'opt.cleanSteamHint': 'Remove game title slugs and snr routing navigation tags to /app/ID',

    'opt.filterPII': 'Auto-Filter Sensitive Personal Data (PII)',
    'opt.filterPIIHint': 'Detect and strip email=, token=, auth=, session= parameters with alerts',
    'opt.globalAdaptive': 'Locale & Currency Neutrality',
    'opt.globalAdaptiveHint': 'Strip hl=, gl=, lang=, locale=, currency= to let recipients view in their native format',
    'opt.preserveYtTime': 'Preserve Video Playback Timestamp (?t=Xs)',
    'opt.preserveYtTimeHint': 'Include the current playing position when copying YouTube URLs',
    'opt.enableMediaOriginal': 'Enable Original High-Res Media Extractor',
    'opt.enableMediaOriginalHint': 'Right-click any web image to open, download, or copy uncompressed high-res images',
    'opt.enableStreamBooster': 'Enable Stream Booster',
    'opt.enableStreamBoosterHint': 'Enable or pause video acceleration and resolution locking globally',
    'opt.boosterDisableAV1': 'Prefer GPU Hardware Decoding (Block AV1 software decodes)',
    'opt.boosterDisableAV1Hint': 'Block high-CPU AV1 decodes to encourage YouTube/Bilibili to stream GPU-accelerated VP9/H.264',
    'opt.boosterQuality': 'Default Locked Resolution',
    'opt.boosterQualityHint': 'Bypass 360p bandwidth probing at video start and immediately lock target quality',
    'opt.boosterExpandHLS': 'Expand Open-Source Player Buffers (Hls.js / Dash.js)',
    'opt.boosterExpandHLSHint': 'Expand streaming prefetch buffer from 30s to 120s (60MB cap) to eliminate stutter',

    'opt.enablePipHoverBtn': 'Enable Hover Picture-in-Picture Button on Videos',
    'opt.enablePipHoverBtnHint': 'Shows a sleek floating PiP icon at the top-right of videos on hover. Click to manually open or exit native Picture-in-Picture. 100% manual trigger, never pops up automatically.',
    'pip.buttonTitle': 'Picture-in-Picture',
    'pip.restoreTitle': 'Exit Picture-in-Picture',

    'opt.enableLinkRadar': 'Enable Link Radar Hover Peek',
    'opt.enableLinkRadarHint': 'Display tooltip preview after hovering over hyperlinks for 180ms',
    'opt.radarAlertOnly': 'Only Show Warnings for Risky Sites',
    'opt.radarAlertOnlyHint': 'Stay invisible on safe sites and only alert on paywalls or content farms',
    'opt.enableTextFragment': 'Append Precise Paragraph Anchors (Scroll-to-Text)',
    'opt.enableTextFragmentHint': 'Automatically append #:~:text= anchor when copying with text selected',

    // Options: Info Cards
    'info.piiTitle': 'Protected Sensitive Parameter Types',
    'info.piiDesc': 'Filters email, user_email, token, access_token, auth, jwt, session, session_id, user_id, api_key, auth_token, bearer, and email-formatted query values.',
    'info.globalTitle': 'Desensitized Parameter Scope',
    'info.globalDesc': 'Covers locale and region tags (hl, gl, lang, language, locale, country, region, intl, setlang) and currencies (currency, curr).',
    'info.ytTitle': 'Instant Shortcut Switch',
    'info.ytDesc': 'Press the "T" key when the popup is open on YouTube to toggle timestamp inclusion instantly.',
    'info.mediaOrigTitle': 'Supported Platforms & Extraction Specs',
    'info.mediaOrigDesc': 'Twitter/X (:orig lossless), Reddit (i.redd.it full images), Bilibili (strips @webp dimensions), YouTube (1080p maxresdefault cover), Weibo (/large/ images), Wikimedia (lossless originals), and generic image CDNs.',
    'info.boosterTitle': 'Stream Booster Mechanism',
    'info.boosterDesc': 'Frees 80%+ CPU overhead by blocking unsupported software decodes, eliminates initial bitrate probing delays, and extends open-source HLS buffers within browser memory limits.',
    'info.radarTitle': 'Radar Visual Indicators & Guidelines',
    'info.radarDesc': 'Clean geometric SVG iconography, zero emoji:\n• Octagon Shield: Warning: Strict Paywall / Mandatory Login\n• Amber Triangle: Warning: Low-Quality AI Content Farm\n• Green Checkmark: Safe & Verified Web Resource',
    'info.textFragTitle': 'Scroll-to-Text Anchor Mechanism',
    'info.textFragDesc': 'Only appends anchors when text is actively selected. Follows W3C web standards with graceful fallback for unsupported browsers.',

    // Options: Position & Preview
    'pos.cursorTopRight': 'Cursor Top-Right',
    'pos.cursorTopRightDesc': 'Default recommendation, closest to focus',
    'pos.cursorTop': 'Directly Above Cursor',
    'pos.cursorTopDesc': 'Centered above cursor pointer',
    'pos.cursorBottomRight': 'Cursor Bottom-Right',
    'pos.cursorBottomRightDesc': 'Avoids obscuring text above',
    'pos.anchorTop': 'Above Hyperlink',
    'pos.anchorTopDesc': 'Aligned to top boundary of link',

    'preview.paywallTab': 'Paywall',
    'preview.farmTab': 'Content Farm',
    'preview.safeTab': 'Safe',
    'preview.mockNewsText': 'Market Analysis: The Federal Reserve released its latest outlook. Readers may view the',
    'preview.mockLink': 'NYT Exclusive Paywalled Report',
    'preview.mockNewsTail': 'for in-depth valuation analysis and quarterly market forecasts.',
    'preview.hint': 'Select positions above to observe alignment, or hover over the hyperlink to test live interaction',

    // Options: Shortcuts
    'shortcut.cleanUrl': 'Copy Clean URL',
    'shortcut.markdown': 'Copy Markdown Link',
    'shortcut.quote': 'Copy Selected Quote & Source',
    'shortcut.btnOpenChrome': 'Open Chrome Keyboard Shortcuts Settings',
    'shortcut.openNote': 'Opens chrome://extensions/shortcuts where you can customize hotkeys',

    // Radar Tooltips
    'radar.paywall': 'Warning: Strict Paywall / Mandatory Login',
    'radar.aiFarm': 'Warning: Low-Quality AI Content Farm',
    'radar.safe': 'Safe',

    // Context Menus
    'context.main': 'CleanLink Share',
    'context.cleanUrl': 'Copy Clean URL  [Alt+C]',
    'context.markdown': 'Copy Markdown Link  [Alt+M]',
    'context.quote': 'Copy Quote & Source URL  [Alt+Q]',
    'context.imageOpen': 'Open Original High-Res Image in New Tab',
    'context.imageDownload': 'Download Clean Original Image',
    'context.imageCopy': 'Copy Original Image URL',
    'pill.quoteBtn': 'Quote Link',
    'pill.copied': 'Copied'
  },

  'ja': {
    // ブランドと共通
    'brand.name': 'CleanLink',
    'brand.badge': 'QuickShare',
    'brand.desc': 'キーボード操作特化のクリーンURL＆正規化共有アシスタント',
    'common.loading': '読み込み中...',
    'common.saveSuccess': '設定を即座に同期保存しました',
    'common.footerNotice': '100% ローカル処理 · データ収集ゼロ',
    'common.footerNoticeFull': 'CleanLink & QuickShare · 100% ローカル処理 · データ収集ゼロ · キーボード共有アシスタント',
    'common.language': '表示言語',
    'common.languageAuto': '自動 (ブラウザ既定)',

    // Popup: 上部と一括
    'popup.batchToggleTitle': '複数タブの一括書き出しモード切替 (B)',
    'popup.batchToggleLabel': '複数タブの一括書き出しモード切替 (ショートカット: B)',
    'popup.batch': '一括',
    'popup.selectAll': 'すべてのタブを選択',
    'popup.selectedCount': '{selected} / {total} 件選択中',
    'popup.noTabsSelected': '少なくとも1つのタブを選択してください',

    // Popup: 動画ブースター
    'booster.title': '動画ブースター',
    'booster.badge': 'Stream Booster',
    'booster.statusEnabled': '有効',
    'booster.statusPaused': '一時停止',
    'booster.toggleTitle': '動画ブースターの有効/無効を切替',
    'booster.qualityHeading': '解像度固定',
    'booster.qualityAuto': '自動',
    'booster.qualityAutoDesc': '固定せずプレーヤーに任せる',
    'booster.quality720pDesc': '720p HDに固定',
    'booster.quality1080pDesc': '1080p Full HDに固定',
    'booster.quality1440pDesc': '1440p 2Kに固定',
    'booster.quality2160pDesc': '4K 超高画質に固定',

    // Popup: 3つのアクション
    'popup.cleanUrl': 'クリーンURL',
    'popup.cleanUrlSub': 'Clean URL',
    'popup.cleanUrlTitle': 'クリーンURLをコピー (Alt+C)',
    'popup.cleanUrlAria': 'クリーンURLをコピー (ショートカット: 1)',
    'popup.markdown': 'Markdown',
    'popup.markdownSub': '[タイトル](URL)',
    'popup.markdownTitle': 'Markdownリンクをコピー (Alt+M)',
    'popup.markdownAria': 'Markdownリンクをコピー (ショートカット: 2)',
    'popup.quote': '引用とリンク',
    'popup.quoteSub': 'Quote & Link',
    'popup.quoteTitle': '選択テキスト引用とリンクをコピー (Alt+Q)',
    'popup.quoteAria': '引用とリンクをコピー (ショートカット: 3)',

    // Popup: URLカードとPII
    'pii.alertTitle': '機密個人情報 (PII) を検出・遮断',
    'pii.alertDefault': '認証トークンや個人アカウント情報を自動で除外しました。',
    'pii.alertDetails': '除外された機密パラメータ: {params}',
    'urlCard.title': '変換後クリーンURL',
    'urlCard.savings': '{pct}% 削減',
    'urlCard.clickCopyHint': 'クリックでコピー',
    'urlCard.copiedHint': 'クリップボードにコピーしました',
    'urlCard.boxAria': 'クリックしてクリーンURLをコピー',
    'urlCard.boxTitle': 'クリックしてURLをコピー',
    'urlCard.cannotUse': 'このページでは利用できません',
    'urlCard.restricted': 'ブラウザの内部制限ページです',
    'urlCard.origLabel': '元のURL:',
    'urlCard.strippedLabel': '除去済み:',

    // Popup: フッターとスイッチ
    'yt.keepTime': '再生時間タイムスタンプを保持 ({time})',
    'yt.keepTimeAria': '再生時間タイムスタンプを保持',
    'media.highRes': '高画質元画像ダウンロード',
    'media.rightClickSupport': '右クリック対応',
    'popup.footerStatusDefault': 'カードをクリックして素早くコピー · Escで閉じる',
    'popup.footerStatusBatch': '一括モード · 下のボタンで一括書き出し · Bキーで切替',
    'popup.footerBatchSuccess': '{count} 件のタブを一括コピーしました',
    'popup.footerStatusCopied': 'クリップボードにコピーしました',
    'popup.footerBoosterToggle': '動画ブースターを{status}しました',
    'popup.footerResolutionLocked': '解像度を固定しました：{label}',
    'popup.settingsTitle': '設定センターを開く (O)',
    'popup.settingsAria': '設定センターを開く (ショートカット: O)',
    'popup.stateEnabled': '有効化',
    'popup.statePaused': '一時停止',

    // Options: ナビゲーション
    'nav.social': 'SNS・配信',
    'nav.ecommerce': '通販・EC',
    'nav.pii': '個人情報保護',
    'nav.global': '多言語・通貨脱感',
    'nav.media': '動画・メディア',
    'nav.radar': 'リンク事前探知',
    'nav.shortcuts': 'ショートカット',
    'nav.all': '全設定一覧',

    // Options: Tab Meta
    'tab.social.title': 'SNS・デジタルコンテンツ',
    'tab.social.subtitle': '共有時に付与される招待コード、個人推薦、追跡パラメータを自動除去',
    'tab.ecommerce.title': '主要ショッピング・ECサイト',
    'tab.ecommerce.subtitle': '長いSEO商品名、アフィリエイト追跡、広告リダイレクトを削除',
    'tab.pii.title': '個人識別情報 (PII) セキュリティ保護',
    'tab.pii.subtitle': '共有時に個人アカウント、認証トークン、セッションIDが漏洩するのを防止',
    'tab.global.title': '言語・通貨の自適応脱感',
    'tab.global.subtitle': '強制言語・通貨ロックを除去し、受け取り側の端末既定設定で閲覧可能に',
    'tab.media.title': '動画設定と高速ストリーミング',
    'tab.media.subtitle': 'ハードウェア再生優先、解像度固定、タイムスタンプ、高画質元画像取得',
    'tab.radar.title': 'リンク事前レーダー (Pre-Flight Link Radar)',
    'tab.radar.subtitle': 'リンクホバー時に有料記事、強制ログイン、AIまとめサイトを即座に警告',
    'tab.shortcuts.title': 'キーボードショートカット設定',
    'tab.shortcuts.subtitle': '現在のグローバルショートカット一覧とカスタム手順',
    'tab.all.title': 'すべての設定一覧',
    'tab.all.subtitle': '対応サイトの設定スイッチを一画面でまとめて確認・調整',

    // Options: Section
    'sec.social.title': '主要SNS・ストリーミング',
    'sec.social.desc': '共有ボタンで自動付与される推薦コードや状態追跡を完全に除外',
    'sec.ecom.title': '国内外ECサイト',
    'sec.ecom.desc': '冗長な日本語商品名Slugやアフィリエイト広告パラメータを削除',
    'sec.pii.title': '個人識別情報 (PII) セキュリティ保護',
    'sec.pii.desc': 'トークンやメールアドレスを含むURLが誤って共有されるのを防止',
    'sec.global.title': '言語・通貨の自適応脱感',
    'sec.global.desc': 'hl, gl, currency などの強制地域ロックを解除',
    'sec.yt.title': 'YouTube動画設定',
    'sec.yt.desc': 'YouTube共有時の再生位置タイムスタンプ付与動作をカスタム',
    'sec.mediaOrig.title': '高画質オリジナル画像直取 (Original Media Extractor)',
    'sec.mediaOrig.desc': 'Web画像の上で右クリックし、無圧縮の最高画質元画像を直接開く・保存・コピー',
    'sec.booster.title': '動画ブースター (Stream Booster)',
    'sec.booster.desc': 'GPUハードウェア再生を優先し、プレーヤー初期の画質探査遅延を解消',
    'sec.radar.title': 'クリック前安全確認：リンク事前探知レーダー',
    'sec.radar.desc': 'ハイパーリンクにマウスを重ねた際、接続先属性をポップアップで事前判定',
    'sec.radarPos.title': '警告ラベルの表示位置とライブプレビュー',
    'sec.radarPos.desc': 'カーソルやリンクに対するラベルの出現位置をカスタマイズ',
    'sec.shortcuts.title': 'ショートカット設定',
    'sec.shortcuts.desc': '現在割り当てられているグローバルキーとChrome設定への案内',
    'sec.textFrag.title': '引用ショートカット強化：高精度テキストアンカー',
    'sec.textFrag.desc': 'テキスト選択中にAlt+Qでコピーした際、#:~:text= スクロールアンカーを自動付与',

    // Options: Items
    'opt.cleanGoogle': 'Google検索 徹底スリム化',
    'opt.cleanGoogleHint': '内部パラメータ（sca_esv, sxsrf等）を削り、検索語 q= のみを残します',
    'opt.cleanTwitter': 'Twitter / X 共有元の除去',
    'opt.cleanTwitterHint': '?s=20&t=... などの追跡パラメータを除去し綺麗なツイートURLを保持',
    'opt.cleanReddit': 'Reddit を redd.it 短縮形式に変換',
    'opt.cleanRedditHint': '公式短縮URL（https://redd.it/xxx）に自動正規化',
    'opt.cleanBilibili': 'Bilibili 推薦・参照コード除去',
    'opt.cleanBilibiliHint': 'vd_source, spm_id_from を除き純粋な動画URLに',
    'opt.cleanInstagram': 'Instagram (投稿 / リール)',
    'opt.cleanInstagramHint': 'igsh=, utm_source= などの追跡コードを削除',
    'opt.cleanThreads': 'Threads 投稿',
    'opt.cleanThreadsHint': 'Metaのクロスプラットフォーム誘導追跡 xmt= を除去',
    'opt.cleanSpotify': 'Spotify 楽曲 / アルバム / プレイリスト',
    'opt.cleanSpotifyHint': '端末追跡パラメータ si= を削除',
    'opt.cleanNetflix': 'Netflix 作品ページ',
    'opt.cleanNetflixHint': '標準の /title/作品ID 形式に整理',

    'opt.cleanAmazon': 'Amazon (日米欧全サイト対応)',
    'opt.cleanAmazonHint': '不要なパスや追跡を除去し最短の /dp/ASIN 形式に正規化',
    'opt.cleanShopee': 'Shopee',
    'opt.cleanShopeeHint': '冗長なタイトルとアフィリエイトを除去',
    'opt.cleanMomo': 'momo',
    'opt.cleanMomoHint': '商品コード i_code を抽出',
    'opt.cleanPchome': 'PChome 24h',
    'opt.cleanPchomeHint': 'きれいな /prod/ID 形式を維持',
    'opt.cleanEbay': 'eBay グローバル',
    'opt.cleanEbayHint': 'タイトルSlugと_trkparmsを削り /itm/ID に',
    'opt.cleanAliexpress': 'AliExpress',
    'opt.cleanAliexpressHint': 'spm追跡とアルゴリズムタグを除去',
    'opt.cleanTaobao': '淘宝 / 天猫',
    'opt.cleanTaobaoHint': 'spmパラメータを除去し id= のみを抽出',
    'opt.cleanCoupang': 'Coupang',
    'opt.cleanCoupangHint': 'vendorItemIdなどを除去',
    'opt.cleanJd': 'JD.com',
    'opt.cleanJdHint': 'プロモーション追跡を排除',
    'opt.cleanSteam': 'Steam ストア',
    'opt.cleanSteamHint': 'ゲーム名Slugやsnr誘導タグを除去し /app/ID に正規化',

    'opt.filterPII': '機密個人情報 (PII) の自動遮断と脱感',
    'opt.filterPIIHint': 'email=, token=, auth=, session= などの機密パラメータを検出して自動除去',
    'opt.globalAdaptive': '多言語・通貨の自適応脱感',
    'opt.globalAdaptiveHint': 'hl=, gl=, lang=, currency= を除外して相手の端末言語を尊重',
    'opt.preserveYtTime': '再生時間タイムスタンプ (?t=Xs) を既定で保持',
    'opt.preserveYtTimeHint': 'YouTube共有時に現在の視聴秒数を自動付与',
    'opt.enableMediaOriginal': '高画質元画像直取・保存機能を有効化',
    'opt.enableMediaOriginalHint': '右クリックメニューに「高画質元画像を開く・保存・URLコピー」を追加',
    'opt.enableStreamBooster': '動画ブースターを有効化',
    'opt.enableStreamBoosterHint': '動画の再生高速化と画質固定を全体制御',
    'opt.boosterDisableAV1': 'GPUハードウェア再生優先（AV1軟解を抑止）',
    'opt.boosterDisableAV1Hint': '高負荷なAV1ソフトウェア再生を阻止し、GPU支援のあるVP9/H.264を要求',
    'opt.boosterQuality': '既定の固定解像度',
    'opt.boosterQualityHint': '初期の360p探査をスキップし、指定した画質で直接再生を開始',
    'opt.boosterExpandHLS': 'オープンソースHLSバッファ拡張',
    'opt.boosterExpandHLSHint': 'HLSの先読みバッファを30秒から120秒へ拡張し、途切れを防止',

    'opt.enablePipHoverBtn': '動画プレイヤー上のピクチャーインピクチャー手動ボタン',
    'opt.enablePipHoverBtnHint': '動画の右上にマウスを重ねた際にPiPアイコンを控えめに表示し、クリックで手動起動・解除できます。勝手にポップアップしない完全手動仕様です',
    'pip.buttonTitle': 'ピクチャーインピクチャー',
    'pip.restoreTitle': 'ピクチャーインピクチャーを解除',

    'opt.enableLinkRadar': 'リンク事前探知ホバープレビューを有効化',
    'opt.enableLinkRadarHint': 'リンクの上に180ms静止すると、接続先の属性カードを表示',
    'opt.radarAlertOnly': '警告サイト（有料・農場）のみ表示',
    'opt.radarAlertOnlyHint': '安全なサイトでは非表示にし、リスク時のみポップアップ',
    'opt.enableTextFragment': '選択テキストに高精度アンカーを自動付与',
    'opt.enableTextFragmentHint': 'Alt+Q使用時、URL末尾に #:~:text= を付けて共有相手の画面を自動スクロール',

    // Options: Info Cards
    'info.piiTitle': '保護対象の機密パラメータ',
    'info.piiDesc': 'email, user_email, token, access_token, auth, jwt, session, session_id, user_id, api_key, auth_token, bearer およびメールアドレス形式の値。',
    'info.globalTitle': '脱感対象パラメータ',
    'info.globalDesc': '言語タグ（hl, gl, lang, language, locale, country, region等）および通貨（currency, curr）。',
    'info.ytTitle': '即座切替ショートカット',
    'info.ytDesc': 'YouTube上でポップアップを開いた際、「T」キーを押すと秒数保持のON/OFFを切り替えられます。',
    'info.mediaOrigTitle': '対応プラットフォーム',
    'info.mediaOrigDesc': 'Twitter/X (:orig)、Reddit (i.redd.it 原画像)、Bilibili (@webp除去)、YouTube (1080pカバー)、Weibo (/large/)、Wikimedia、主要画像CDN。',
    'info.boosterTitle': '動画ブースターの仕組み',
    'info.boosterDesc': 'CPU高負荷なソフトウェア再生を抑止してCPU使用率を80%以上削減。初期ビットレート探査の待機時間を短縮します。',
    'info.radarTitle': 'レーダー警告マークの視覚仕様',
    'info.radarDesc': 'Emojiを一切排したシャープな幾何学SVGアイコン：\n• 八角形赤色シールド：警告：有料会員限定記事 / 強制ログイン\n• 琥珀色トライアングル：警告：低品質AIまとめサイト\n• エメラルドサークル：正常（安全・信頼できるWebリソース）',
    'info.textFragTitle': 'スクロールアンカー仕様',
    'info.textFragDesc': 'テキストが選択されている場合のみアンカーを付加。未選択時は元のURLを保ちます。W3C標準準拠。',

    // Options: Position & Preview
    'pos.cursorTopRight': 'カーソル右上',
    'pos.cursorTopRightDesc': '推奨：視線に最も近い位置',
    'pos.cursorTop': 'カーソル真上',
    'pos.cursorTopDesc': 'カーソル中央軸の上に整列',
    'pos.cursorBottomRight': 'カーソル右下',
    'pos.cursorBottomRightDesc': '上部の本文を隠さない',
    'pos.anchorTop': 'リンク真上',
    'pos.anchorTopDesc': 'リンク要素の上面に整列',

    'preview.paywallTab': '有料壁',
    'preview.farmTab': 'まとめ農場',
    'preview.safeTab': '正常',
    'preview.mockNewsText': '最新市場動向分析：FRBが最新の政策を発表。詳しい解説は',
    'preview.mockLink': 'ニューヨーク・タイムズ有料特集記事',
    'preview.mockNewsTail': 'をご参照ください。市場の今後の見通しを提供します。',
    'preview.hint': '上の位置を切り替えて配置の変化を確認できます。リンクにマウスを重ねて実際の動作をお試しください',

    // Options: Shortcuts
    'shortcut.cleanUrl': 'クリーンURLをコピー',
    'shortcut.markdown': 'Markdownリンクをコピー',
    'shortcut.quote': '選択引用とリンクをコピー',
    'shortcut.btnOpenChrome': 'Chromeのショートカット設定を開く',
    'shortcut.openNote': 'chrome://extensions/shortcuts を開き、キーの割り当てを変更できます',

    // Radar Tooltips
    'radar.paywall': '警告：厳格な有料壁 / 強制ログインあり',
    'radar.aiFarm': '警告：低品質AIまとめサイトを検出',
    'radar.safe': '正常',

    // Context Menus
    'context.main': 'CleanLink 共有',
    'context.cleanUrl': 'クリーンURLをコピー  [Alt+C]',
    'context.markdown': 'Markdownリンクをコピー  [Alt+M]',
    'context.quote': '引用とリンクをコピー  [Alt+Q]',
    'context.imageOpen': '新しいタブで高画質元画像を開く',
    'context.imageDownload': '高画質元画像をダウンロード',
    'context.imageCopy': '元画像URLをコピー',
    'pill.quoteBtn': '引用リンク',
    'pill.copied': 'コピー完了'
  }
};

let cachedLanguage = null;

export function getBrowserLanguage() {
  let lang = '';
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
      lang = chrome.i18n.getUILanguage();
    }
  } catch {
    // ignore
  }

  if (!lang && typeof navigator !== 'undefined') {
    lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  }

  lang = (lang || 'zh-TW').toLowerCase();

  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk') || lang.startsWith('zh-mo') || lang === 'zh-hant') {
    return 'zh-TW';
  }
  if (lang.startsWith('zh')) {
    return 'zh-CN';
  }
  if (lang.startsWith('ja')) {
    return 'ja';
  }
  if (lang.startsWith('en')) {
    return 'en';
  }

  return 'en';
}

export async function getAppLanguage() {
  if (cachedLanguage) return cachedLanguage;

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      const stored = await chrome.storage.sync.get({ appLanguage: 'auto' });
      const setting = stored.appLanguage || 'auto';
      if (setting !== 'auto' && DICTIONARY[setting]) {
        cachedLanguage = setting;
        return setting;
      }
    }
  } catch {
    // ignore
  }

  const browserLang = getBrowserLanguage();
  cachedLanguage = browserLang;
  return browserLang;
}

export function getAppLanguageSync() {
  return cachedLanguage || getBrowserLanguage();
}

export async function setAppLanguage(code) {
  cachedLanguage = code === 'auto' ? getBrowserLanguage() : code;
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    await chrome.storage.sync.set({ appLanguage: code });
  }
}

export function t(key, params = {}, lang = null) {
  const activeLang = lang || cachedLanguage || getBrowserLanguage();
  const dict = DICTIONARY[activeLang] || DICTIONARY['zh-TW'];
  
  let text = dict[key];
  if (text === undefined) {
    text = DICTIONARY['zh-TW']?.[key] || DICTIONARY['en']?.[key] || key;
  }

  if (params && typeof params === 'object') {
    Object.keys(params).forEach(p => {
      text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), String(params[p]));
    });
  }

  return text;
}

export function applyTranslations(root = document, lang = null) {
  if (!root) return;
  const activeLang = lang || cachedLanguage || getBrowserLanguage();

  if (root === document && document.documentElement) {
    document.documentElement.lang = activeLang;
  }

  const textElements = root.querySelectorAll('[data-i18n]');
  textElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key, {}, activeLang);
    }
  });

  const titleElements = root.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.setAttribute('title', t(key, {}, activeLang));
    }
  });

  const ariaElements = root.querySelectorAll('[data-i18n-aria-label]');
  ariaElements.forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      el.setAttribute('aria-label', t(key, {}, activeLang));
    }
  });

  const placeholderElements = root.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.setAttribute('placeholder', t(key, {}, activeLang));
    }
  });
}

export async function initI18n() {
  const lang = await getAppLanguage();
  if (typeof document !== 'undefined') {
    applyTranslations(document, lang);
  }
  return lang;
}
