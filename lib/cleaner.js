/**
 * CleanLink & QuickShare - Core URL Normalizer & Privacy Cleaner
 * Pure JavaScript (ES Module & CommonJS compatible)
 */

// 通用追蹤標籤清單 (Tracking query parameters)
const TRACKING_PARAMS = new Set([
  // UTM parameters
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'utm_reader',
  // Social & Ad click identifiers
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'twclid', 'igshid', 'ttclid', 'mc_eid',
  'msclkid', 'yclid', 'wickedid', 'dclid', 'zanpid', 'ScCid', 's_kwcid',
  // Platform share & referral tags
  'si', 'feature', 'ref', 'ref_', 'source', 'share_id', 'share_token', 'spm', 'scm', 'pvid',
  'embeds_referring_euri', 'embeds_referring_origin', 'tracking_code', 'aff_trace_key'
]);

// 敏感個人識別資訊 (PII) 參數特徵
const PII_KEYS = new Set([
  'email', 'mail', 'user_email', 'token', 'access_token', 'auth', 'jwt',
  'session', 'session_id', 'user_id', 'userid', 'invite_code', 'signature',
  'api_key', 'apikey', 'auth_token', 'bearer'
]);

// 跨國語系與幣別脫敏參數 (Global Adaptive URL)
export const GLOBAL_ADAPTIVE_PARAMS = new Set([
  'hl', 'gl', 'lang', 'language', 'locale', 'currency', 'curr', 'country', 'region', 'intl', 'setlang'
]);

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * 激進路徑裁剪與特定平台深度正規化 (Aggressive Canonical Extraction)
 * @param {URL} parsedUrl 
 * @param {Object} options 
 * @returns {string|null} 若匹配特定平台則返回正規化後的 URL 字串，否則返回 null
 */
function applyAggressiveCanonical(parsedUrl, options = {}) {
  const host = parsedUrl.hostname.toLowerCase();

  // 1. Amazon: 提煉標準 /dp/ASIN (砍掉所有搜尋關鍵字與 SEO slug)
  if (options.cleanAmazon !== false && /(^|\.)amazon\.(com|co\.uk|co\.jp|de|fr|es|it|ca|com\.au|com\.br|in|cn)$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?]|$)/i);
    if (match && match[1]) {
      const domainMatch = host.match(/amazon\.([a-z\.]+)$/i);
      const domainSuffix = domainMatch ? domainMatch[1] : 'com';
      return `https://www.amazon.${domainSuffix}/dp/${match[1].toUpperCase()}`;
    }
  }

  // 2. Google Search: 僅保留核心關鍵字 q，砍除數十組 sca_esv, sxsrf, ei, ved 等除錯參數
  if (options.cleanGoogle !== false && /(^|\.)google\.[a-z.]+/i.test(host) && parsedUrl.pathname === '/search') {
    if (parsedUrl.searchParams.has('q')) {
      const clean = new URL('https://www.google.com/search');
      clean.searchParams.set('q', parsedUrl.searchParams.get('q'));
      return clean.toString();
    }
  }

  // 3. Shopee (蝦皮): 砍除超長中文標題 Slug 與導流碼，提煉純淨商品頁 /product/shopId/itemId
  if (options.cleanShopee !== false && /(^|\.)shopee\.(tw|com|vn|ph|my|sg|co\.id|com\.br|com\.mx)$/i.test(host)) {
    const match = parsedUrl.pathname.match(/-i\.(\d+)\.(\d+)/) || parsedUrl.pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (match && match[1] && match[2]) {
      return `https://${parsedUrl.hostname}/product/${match[1]}/${match[2]}`;
    }
  }

  // 4. Reddit: 砍掉數十單詞的超長標題路徑，轉為官方超短格式 redd.it/ID
  if (options.cleanReddit !== false && /(^|\.)reddit\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/(?:r\/[^\/]+\/)?comments\/([a-z0-9]+)/i);
    if (match && match[1]) {
      return `https://redd.it/${match[1]}`;
    }
  }

  // 5. Twitter / X: 砍除分享來源與追蹤碼，保留乾淨狀態頁
  if (options.cleanTwitter !== false && /(^|\.)(twitter|x)\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
    if (match && match[1] && match[2]) {
      return `https://x.com/${match[1]}/status/${match[2]}`;
    }
  }

  // 6. Bilibili: 砍除 vd_source, spm_id_from 等，保留乾淨影片頁
  if (options.cleanBilibili !== false && /(^|\.)bilibili\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/video\/(BV[a-zA-Z0-9]+|av\d+)/i);
    if (match && match[1]) {
      return `https://www.bilibili.com/video/${match[1]}`;
    }
  }

  // 7. Taobao (淘寶) / Tmall (天貓): 砍除長串推薦參數，只保留核心商品 id
  if (options.cleanTaobao !== false && /(^|\.)(taobao|tmall)\.com$/i.test(host) && parsedUrl.pathname.includes('item.htm')) {
    if (parsedUrl.searchParams.has('id')) {
      const clean = new URL(`https://${parsedUrl.hostname}/item.htm`);
      clean.searchParams.set('id', parsedUrl.searchParams.get('id'));
      return clean.toString();
    }
  }

  // 8. Momo 購物網 (台灣): 砍除分類、廣告導流碼，僅保留核心商品 i_code
  if (options.cleanMomo !== false && /(^|\.)momoshop\.com\.tw$/i.test(host) && parsedUrl.pathname.includes('GoodsDetail.jsp')) {
    if (parsedUrl.searchParams.has('i_code')) {
      const clean = new URL('https://www.momoshop.com.tw/goods/GoodsDetail.jsp');
      clean.searchParams.set('i_code', parsedUrl.searchParams.get('i_code'));
      return clean.toString();
    }
  }

  // 9. PChome 24h 購物 (台灣): 提煉純淨 /prod/商品ID
  if (options.cleanPchome !== false && /(^|\.)pchome\.com\.tw$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/prod\/([A-Za-z0-9_-]+)/);
    if (match && match[1]) {
      return `https://24h.pchome.com.tw/prod/${match[1]}`;
    }
  }

  // 10. eBay (全球): 砍除超長標題與 _trkparms、amdata 等，提煉 /itm/物品ID
  if (options.cleanEbay !== false && /(^|\.)ebay\.(com|co\.uk|de|fr|com\.au|ca|it|es)$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/itm\/(?:[^\/]+\/)?(\d{9,14})/);
    if (match && match[1]) {
      const domainMatch = host.match(/ebay\.([a-z\.]+)$/i);
      const domainSuffix = domainMatch ? domainMatch[1] : 'com';
      return `https://www.ebay.${domainSuffix}/itm/${match[1]}`;
    }
  }

  // 11. AliExpress (全球速賣通): 砍除 spm, algo_pvid 等，提煉 /item/商品ID.html
  if (options.cleanAliexpress !== false && /(^|\.)aliexpress\.(com|us|ru)$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/item\/(\d+)(?:\.html)?/);
    if (match && match[1]) {
      return `https://www.aliexpress.com/item/${match[1]}.html`;
    }
  }

  // 12. Coupang 酷澎 (台/韓): 提煉 /vp/products/商品ID
  if (options.cleanCoupang !== false && /(^|\.)coupang\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/vp\/products\/(\d+)/);
    if (match && match[1]) {
      return `https://${parsedUrl.hostname}/vp/products/${match[1]}`;
    }
  }

  // 13. JD 京東: 提煉 /item.jd.com/商品ID.html
  if (options.cleanJd !== false && /(^|\.)jd\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/(?:product\/)?(\d+)\.html/);
    if (match && match[1]) {
      return `https://item.jd.com/${match[1]}.html`;
    }
  }

  // 14. Steam 遊戲商城: 提煉 /app/AppID/，砍除標題與導流碼
  if (options.cleanSteam !== false && host === 'store.steampowered.com') {
    const match = parsedUrl.pathname.match(/\/app\/(\d+)/);
    if (match && match[1]) {
      return `https://store.steampowered.com/app/${match[1]}/`;
    }
  }

  // 15. Spotify: 提煉 /track/ID, /album/ID, /playlist/ID，砍除 si= 分享碼
  if (options.cleanSpotify !== false && host === 'open.spotify.com') {
    const match = parsedUrl.pathname.match(/\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/);
    if (match && match[1] && match[2]) {
      return `https://open.spotify.com/${match[1]}/${match[2]}`;
    }
  }

  // 16. Instagram: 提煉 /p/代碼/, /reel/代碼/，砍除 igsh 追蹤碼
  if (options.cleanInstagram !== false && /(^|\.)instagram\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && match[2]) {
      return `https://www.instagram.com/${match[1]}/${match[2]}/`;
    }
  }

  // 17. Threads: 提煉 /@帳號/post/貼文ID，砍除 xmt 追蹤碼
  if (options.cleanThreads !== false && /(^|\.)threads\.net$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/@([a-zA-Z0-9._]+)\/post\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && match[2]) {
      return `https://www.threads.net/@${match[1]}/post/${match[2]}`;
    }
  }

  // 18. Netflix: 提煉 /title/影片ID，砍除 trackId 等
  if (options.cleanNetflix !== false && /(^|\.)netflix\.com$/i.test(host)) {
    const match = parsedUrl.pathname.match(/\/(?:watch|title)\/(\d+)/);
    if (match && match[1]) {
      return `https://www.netflix.com/title/${match[1]}`;
    }
  }

  // 19. YouTube
  const isYtStandard = host === 'www.youtube.com' || host === 'youtube.com' || host === 'm.youtube.com';
  const isYtShort = host === 'youtu.be';
  if (isYtStandard || isYtShort) {
    let videoId = null;
    let timestamp = null;
    if (options.preserveTimestamp && parsedUrl.searchParams.has('t')) {
      timestamp = parsedUrl.searchParams.get('t');
    }

    if (isYtShort) {
      videoId = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0];
      if (videoId) {
        const clean = new URL(`https://www.youtube.com/watch?v=${videoId}`);
        if (timestamp) clean.searchParams.set('t', timestamp);
        return clean.toString();
      }
    }

    const shortsMatch = parsedUrl.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return `https://www.youtube.com/shorts/${shortsMatch[1]}`;
    }

    if (parsedUrl.pathname === '/watch' && parsedUrl.searchParams.has('v')) {
      videoId = parsedUrl.searchParams.get('v');
      const clean = new URL('https://www.youtube.com/watch');
      clean.searchParams.set('v', videoId);
      if (timestamp) clean.searchParams.set('t', timestamp);
      return clean.toString();
    }
  }

  return null;
}

/**
 * 核心清理函式
 * @param {string} rawUrl 原始輸入網址
 * @param {Object} options 設定選項
 * @param {boolean} options.preserveTimestamp 是否保留 YouTube 時間戳 (預設 false)
 * @returns {Object} 清理結果物件
 */
export function cleanUrl(rawUrl, options = {}) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      originalUrl: rawUrl || '',
      cleanUrl: rawUrl || '',
      removedParams: [],
      piiWarnings: [],
      isCanonicalized: false
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch (err) {
    return {
      originalUrl: rawUrl,
      cleanUrl: rawUrl,
      removedParams: [],
      piiWarnings: [],
      isCanonicalized: false
    };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return {
      originalUrl: rawUrl,
      cleanUrl: rawUrl,
      removedParams: [],
      piiWarnings: [],
      isCanonicalized: false
    };
  }

  const removedParams = [];
  const piiWarnings = [];

  const filterPII = options.filterPII !== false;
  const globalAdaptive = options.globalAdaptive !== false;

  // 先搜集原網址中的 PII 與參數
  if (filterPII) {
    for (const [key, val] of parsedUrl.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      if (PII_KEYS.has(lowerKey) || EMAIL_REGEX.test(val)) {
        piiWarnings.push(key);
      }
    }
  }

  // 1. 嘗試激進路徑裁剪 (Aggressive Canonical)
  const canonicalUrl = applyAggressiveCanonical(parsedUrl, options);
  if (canonicalUrl) {
    // 找出原網址被剝除的參數名稱
    const newParsed = new URL(canonicalUrl);
    for (const [key] of parsedUrl.searchParams.entries()) {
      if (!newParsed.searchParams.has(key)) {
        removedParams.push(key);
      }
    }

    return {
      originalUrl: rawUrl,
      cleanUrl: canonicalUrl,
      removedParams,
      piiWarnings,
      isCanonicalized: true
    };
  }

  // 2. 通用追蹤標籤、PII 與跨國自適應清理 (若非特定熱門網站)
  const keysToDelete = [];
  for (const [key, val] of parsedUrl.searchParams.entries()) {
    const lowerKey = key.toLowerCase();
    const isPII = filterPII && (PII_KEYS.has(lowerKey) || EMAIL_REGEX.test(val));
    const isTracking = TRACKING_PARAMS.has(lowerKey) || lowerKey.startsWith('utm_') || lowerKey.startsWith('spm_');
    const isGlobal = globalAdaptive && GLOBAL_ADAPTIVE_PARAMS.has(lowerKey);

    if (isPII || isTracking || isGlobal) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    parsedUrl.searchParams.delete(key);
    removedParams.push(key);
  }

  return {
    originalUrl: rawUrl,
    cleanUrl: parsedUrl.toString(),
    removedParams,
    piiWarnings,
    isCanonicalized: false
  };
}

// 支援 CommonJS 載入（方便 Node.js 測試）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { cleanUrl, TRACKING_PARAMS, PII_KEYS, GLOBAL_ADAPTIVE_PARAMS };
}
