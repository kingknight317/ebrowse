/**
 * CleanLink & QuickShare - Pre-Flight Link Radar
 * 連結行前探測器：本地離線辨識嚴格付費牆、強制登入與低品質 AI 內容農場
 */

// 嚴格付費牆 / 強制登入 / 閱讀屏障站點名單
export const PAYWALL_DOMAINS = new Set([
  // 國際主流付費財經與新聞
  'wsj.com',
  'nytimes.com',
  'ft.com',
  'bloomberg.com',
  'economist.com',
  'thetimes.co.uk',
  'telegraph.co.uk',
  'nikkei.com',
  'hbr.org',
  'theathletic.com',
  'barrons.com',
  'theinformation.com',
  'newyorker.com',
  'washingtonpost.com',
  'scmp.com',
  'technologyreview.com',
  'theglobeandmail.com',
  'lefigaro.fr',
  'handelsblatt.com',
  // 華文付費限定媒體
  'caixin.com',
  'businessweekly.com.tw',
  'cw.com.tw',
  'hbrtaiwan.com',
  // 強制登入/訂閱阻擋閱讀站點
  'quora.com',
  'scribd.com',
  'slideshare.net',
  'patreon.com'
]);

// 低品質 AI 內容農場、採集轉載站與垃圾 SEO 爬蟲站名單
export const AI_FARM_DOMAINS = new Set([
  // 華文常見內容農場
  'kknews.cc',
  'read01.com',
  'xuehua.us',
  'coco01.net',
  'gigacircle.com',
  'teepr.com',
  'bomb01.com',
  'mission-tw.com',
  'flxdaily.com',
  'twgreatdaily.com',
  'greatdaily.org',
  'ptt01.cc',
  'buzzhand.com',
  'daliulian.net',
  'share001.org',
  'ezp9.com',
  'dailybuzz.cc',
  'b1129.com',
  'how01.com',
  'twgreatdaily.live',
  'anyelse.com',
  'ezgoe.com',
  'lookforward.cc',
  'post01.com',
  'gushiciku.cn',
  'hotbak.net',
  'itread01.com',
  'geek-docs.com',
  // 採集代碼/機翻爬蟲站
  'codenong.com',
  'itbaoku.cn',
  'helplib.com',
  'alibabacloud.com/blog/mirror',
  'copyprogramming.com'
]);

// 公認優質/安全可信域名 (白名單加權，避免誤判)
export const SAFE_DOMAINS = new Set([
  'wikipedia.org',
  'wikimedia.org',
  'github.com',
  'gitlab.com',
  'mozilla.org',
  'w3.org',
  'stackoverflow.com',
  'stackexchange.com',
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'nature.com',
  'science.org',
  'arxiv.org',
  'google.com',
  'youtube.com',
  'microsoft.com',
  'apple.com'
]);

/**
 * 檢查 hostname 是否吻合目標清單 (支援子網域匹配)
 * @param {string} host 
 * @param {Set<string>} domainSet 
 * @returns {string|null} 匹配成功的基準域名，或 null
 */
function matchDomainList(host, domainSet) {
  if (!host) return null;
  const lowerHost = host.toLowerCase();
  
  if (domainSet.has(lowerHost)) {
    return lowerHost;
  }

  for (const baseDomain of domainSet) {
    if (lowerHost.endsWith(`.${baseDomain}`)) {
      return baseDomain;
    }
  }

  return null;
}

/**
 * 評估目標 URL 的行前安全與品質狀態
 * @param {string} rawUrl 
 * @returns {Object} 探測結果物件
 */
export function assessLinkUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      status: 'invalid',
      level: 'none',
      badgeText: '',
      domain: '',
      category: '無效連結',
      iconType: 'none',
      shouldShow: false
    };
  }

  const trimmed = rawUrl.trim();
  // 略過純錨點跳轉、javascript 腳本或非法協定
  if (trimmed.startsWith('#') || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return {
      status: 'ignored',
      level: 'none',
      badgeText: '',
      domain: '',
      category: '頁面操作',
      iconType: 'none',
      shouldShow: false
    };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (e) {
    return {
      status: 'invalid',
      level: 'none',
      badgeText: '',
      domain: '',
      category: '無效網址',
      iconType: 'none',
      shouldShow: false
    };
  }

  // 僅針對 HTTP / HTTPS 網頁連結進行探測
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      status: 'ignored',
      level: 'none',
      badgeText: '',
      domain: '',
      category: '非網頁協定',
      iconType: 'none',
      shouldShow: false
    };
  }

  const host = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  // 1. 偵測特定路徑的付費牆 (例如 udn.com/vip)
  if (host === 'udn.com' || host.endsWith('.udn.com')) {
    if (pathname.startsWith('/vip') || pathname.includes('/vip/')) {
      return {
        status: 'paywall',
        level: 'danger',
        badgeText: '警告：此站有嚴格付費牆 / 強制登入',
        domain: host,
        category: '付費專區',
        iconType: 'paywall',
        shouldShow: true
      };
    }
  }

  // 2. 優先檢查是否屬於嚴格付費牆名單
  const matchedPaywall = matchDomainList(host, PAYWALL_DOMAINS);
  if (matchedPaywall) {
    return {
      status: 'paywall',
      level: 'danger',
      badgeText: '警告：此站有嚴格付費牆 / 強制登入',
      domain: matchedPaywall,
      category: '付費牆 / 強制登入',
      iconType: 'paywall',
      shouldShow: true
    };
  }

  // 3. 檢查是否屬於低品質 AI 內容農場 / 採集站名單
  const matchedFarm = matchDomainList(host, AI_FARM_DOMAINS);
  if (matchedFarm) {
    return {
      status: 'ai_farm',
      level: 'warning',
      badgeText: '警告：偵測到為低品質 AI 內容農場',
      domain: matchedFarm,
      category: 'AI 內容農場',
      iconType: 'ai_farm',
      shouldShow: true
    };
  }

  // 4. 特徵識別：疑似內容農場的典型域名特徵 (可擴充啟發式規則)
  // 例如特定的垃圾批量註冊後綴並搭配多級農場關鍵字
  if (/(contentfarm|article01|dailyarticle|greatdaily|toutiao.*clone)/i.test(host)) {
    return {
      status: 'ai_farm',
      level: 'warning',
      badgeText: '警告：偵測到為低品質 AI 內容農場',
      domain: host,
      category: '疑似內容農場',
      iconType: 'ai_farm',
      shouldShow: true
    };
  }

  // 5. 檢查是否屬於優質/安全名單
  const matchedSafe = matchDomainList(host, SAFE_DOMAINS);
  if (matchedSafe) {
    return {
      status: 'safe',
      level: 'safe',
      badgeText: '正常',
      domain: matchedSafe,
      category: '安全可信',
      iconType: 'safe',
      shouldShow: true
    };
  }

  // 6. 一般未列於警告之網址，歸納為正常
  return {
    status: 'safe',
    level: 'safe',
    badgeText: '正常',
    domain: host,
    category: '一般網頁',
    iconType: 'safe',
    shouldShow: true
  };
}

/**
 * 取得對應狀態的現代幾何向量 SVG 圖示字串 (純 SVG，嚴格無 Emoji)
 * @param {'paywall'|'ai_farm'|'safe'} iconType 
 * @returns {string} SVG 標籤字串
 */
export function getRadarSvgIcon(iconType) {
  switch (iconType) {
    case 'paywall':
      // 八角停止/紅色盾牌警示圖示 (Stroke: #ef4444)
      return '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-danger"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    case 'ai_farm':
      // 警告三角圖示 (Stroke: #f59e0b)
      return '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-warning"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';

    case 'safe':
    default:
      // 圓形勾選正常圖示 (Stroke: #10b981)
      return '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-safe"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  }
}
