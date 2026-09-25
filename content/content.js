/**
 * CleanLink & QuickShare - Content Script
 * Fully self-contained to prevent "Extension context invalidated" errors
 */

(function () {
  // 檢查擴充套件執行環境是否仍然有效
  function isContextValid() {
    try {
      return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  // --- 內嵌精簡版清理與格式化函式 (確保斷開連線時不報錯) ---
  const TRACKING_PARAMS = new Set([
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'utm_reader',
    'fbclid', 'gclid', 'gbraid', 'wbraid', 'twclid', 'igshid', 'ttclid', 'mc_eid',
    'msclkid', 'yclid', 'wickedid', 'dclid', 'zanpid', 'ScCid', 's_kwcid',
    'si', 'feature', 'ref', 'ref_', 'source', 'share_id', 'share_token', 'spm', 'scm', 'pvid',
    'embeds_referring_euri', 'embeds_referring_origin', 'tracking_code', 'aff_trace_key'
  ]);

  const PII_KEYS = new Set([
    'email', 'mail', 'user_email', 'token', 'access_token', 'auth', 'jwt',
    'session', 'session_id', 'user_id', 'userid', 'invite_code', 'signature',
    'api_key', 'apikey', 'auth_token', 'bearer'
  ]);

  const GLOBAL_ADAPTIVE_PARAMS = new Set([
    'hl', 'gl', 'lang', 'language', 'locale', 'currency', 'curr', 'country', 'region', 'intl', 'setlang'
  ]);

  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  function localCleanUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return rawUrl || '';
    try {
      const parsedUrl = new URL(rawUrl.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return rawUrl;

      // 1. Amazon ASIN
      if (/(^|\.)amazon\.(com|co\.uk|co\.jp|de|fr|es|it|ca|com\.au|in)$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?]|$)/i);
        if (match && match[1]) {
          const domainMatch = parsedUrl.hostname.match(/amazon\.([a-z\.]+)$/i);
          const domainSuffix = domainMatch ? domainMatch[1] : 'com';
          return `https://www.amazon.${domainSuffix}/dp/${match[1].toUpperCase()}`;
        }
      }

      // 2. Google Search (只留 q)
      if (/(^|\.)google\.[a-z.]+/i.test(parsedUrl.hostname) && parsedUrl.pathname === '/search') {
        if (parsedUrl.searchParams.has('q')) {
          const clean = new URL('https://www.google.com/search');
          clean.searchParams.set('q', parsedUrl.searchParams.get('q'));
          return clean.toString();
        }
      }

      // 3. Shopee 蝦皮 (砍中文標題)
      if (/(^|\.)shopee\.(tw|com|vn|ph|my|sg|co\.id|com\.br|com\.mx)$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/-i\.(\d+)\.(\d+)/) || parsedUrl.pathname.match(/\/product\/(\d+)\/(\d+)/);
        if (match && match[1] && match[2]) {
          return `https://${parsedUrl.hostname}/product/${match[1]}/${match[2]}`;
        }
      }

      // 4. Reddit (轉 redd.it)
      if (/(^|\.)reddit\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/(?:r\/[^\/]+\/)?comments\/([a-z0-9]+)/i);
        if (match && match[1]) {
          return `https://redd.it/${match[1]}`;
        }
      }

      // 5. Twitter / X
      if (/(^|\.)(twitter|x)\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
        if (match && match[1] && match[2]) {
          return `https://x.com/${match[1]}/status/${match[2]}`;
        }
      }

      // 6. Bilibili
      if (/(^|\.)bilibili\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/video\/(BV[a-zA-Z0-9]+|av\d+)/i);
        if (match && match[1]) {
          return `https://www.bilibili.com/video/${match[1]}`;
        }
      }

      // 7. Taobao / Tmall
      if (/(^|\.)(taobao|tmall)\.com$/i.test(parsedUrl.hostname) && parsedUrl.pathname.includes('item.htm')) {
        if (parsedUrl.searchParams.has('id')) {
          const clean = new URL(`https://${parsedUrl.hostname}/item.htm`);
          clean.searchParams.set('id', parsedUrl.searchParams.get('id'));
          return clean.toString();
        }
      }

      // 8. Momo
      if (/(^|\.)momoshop\.com\.tw$/i.test(parsedUrl.hostname) && parsedUrl.pathname.includes('GoodsDetail.jsp')) {
        if (parsedUrl.searchParams.has('i_code')) {
          const clean = new URL('https://www.momoshop.com.tw/goods/GoodsDetail.jsp');
          clean.searchParams.set('i_code', parsedUrl.searchParams.get('i_code'));
          return clean.toString();
        }
      }

      // 9. PChome 24h
      if (/(^|\.)pchome\.com\.tw$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/prod\/([A-Za-z0-9_-]+)/);
        if (match && match[1]) {
          return `https://24h.pchome.com.tw/prod/${match[1]}`;
        }
      }

      // 10. eBay
      if (/(^|\.)ebay\.(com|co\.uk|de|fr|com\.au|ca|it|es)$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/itm\/(?:[^\/]+\/)?(\d{9,14})/);
        if (match && match[1]) {
          const domainMatch = parsedUrl.hostname.match(/ebay\.([a-z\.]+)$/i);
          const domainSuffix = domainMatch ? domainMatch[1] : 'com';
          return `https://www.ebay.${domainSuffix}/itm/${match[1]}`;
        }
      }

      // 11. AliExpress
      if (/(^|\.)aliexpress\.(com|us|ru)$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/item\/(\d+)(?:\.html)?/);
        if (match && match[1]) {
          return `https://www.aliexpress.com/item/${match[1]}.html`;
        }
      }

      // 12. Coupang
      if (/(^|\.)coupang\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/vp\/products\/(\d+)/);
        if (match && match[1]) {
          return `https://${parsedUrl.hostname}/vp/products/${match[1]}`;
        }
      }

      // 13. JD
      if (/(^|\.)jd\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/(?:product\/)?(\d+)\.html/);
        if (match && match[1]) {
          return `https://item.jd.com/${match[1]}.html`;
        }
      }

      // 14. Steam
      if (parsedUrl.hostname.toLowerCase() === 'store.steampowered.com') {
        const match = parsedUrl.pathname.match(/\/app\/(\d+)/);
        if (match && match[1]) {
          return `https://store.steampowered.com/app/${match[1]}/`;
        }
      }

      // 15. Spotify
      if (parsedUrl.hostname.toLowerCase() === 'open.spotify.com') {
        const match = parsedUrl.pathname.match(/\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/);
        if (match && match[1] && match[2]) {
          return `https://open.spotify.com/${match[1]}/${match[2]}`;
        }
      }

      // 16. Instagram
      if (/(^|\.)instagram\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
        if (match && match[1] && match[2]) {
          return `https://www.instagram.com/${match[1]}/${match[2]}/`;
        }
      }

      // 17. Threads
      if (/(^|\.)threads\.net$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/@([a-zA-Z0-9._]+)\/post\/([a-zA-Z0-9_-]+)/);
        if (match && match[1] && match[2]) {
          return `https://www.threads.net/@${match[1]}/post/${match[2]}`;
        }
      }

      // 18. Netflix
      if (/(^|\.)netflix\.com$/i.test(parsedUrl.hostname)) {
        const match = parsedUrl.pathname.match(/\/(?:watch|title)\/(\d+)/);
        if (match && match[1]) {
          return `https://www.netflix.com/title/${match[1]}`;
        }
      }

      // 19. YouTube
      const host = parsedUrl.hostname.toLowerCase();
      if (host === 'youtu.be') {
        const id = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0];
        if (id) return `https://www.youtube.com/watch?v=${id}`;
      } else if (host.includes('youtube.com')) {
        if (parsedUrl.pathname === '/watch' && parsedUrl.searchParams.has('v')) {
          const clean = new URL('https://www.youtube.com/watch');
          clean.searchParams.set('v', parsedUrl.searchParams.get('v'));
          return clean.toString();
        } else if (parsedUrl.pathname.startsWith('/shorts/')) {
          const clean = new URL(parsedUrl.origin + parsedUrl.pathname);
          return clean.toString();
        }
      }

      // 3. 通用追蹤標籤、PII 與跨國自適應清理
      const keysToDelete = [];
      for (const [key, val] of parsedUrl.searchParams.entries()) {
        const lowerKey = key.toLowerCase();
        if (PII_KEYS.has(lowerKey) || EMAIL_REGEX.test(val) || TRACKING_PARAMS.has(lowerKey) || GLOBAL_ADAPTIVE_PARAMS.has(lowerKey) || lowerKey.startsWith('utm_') || lowerKey.startsWith('spm_')) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(k => parsedUrl.searchParams.delete(k));
      return parsedUrl.toString();
    } catch (e) {
      return rawUrl;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function localEncodeTextFragment(str) {
    if (!str) return '';
    return encodeURIComponent(str.trim())
      .replace(/-/g, '%2D')
      .replace(/,/g, '%2C')
      .replace(/&/g, '%26');
  }

  function localGenerateTextFragmentDirective(selectedText) {
    if (!selectedText || typeof selectedText !== 'string') return '';
    const clean = selectedText.trim().replace(/\s+/g, ' ');
    if (!clean) return '';

    const words = clean.split(' ').filter(Boolean);
    if (words.length > 6) {
      const start = words.slice(0, 3).join(' ');
      const end = words.slice(-3).join(' ');
      return `text=${localEncodeTextFragment(start)},${localEncodeTextFragment(end)}`;
    }
    if (words.length <= 2 && clean.length > 24) {
      const start = clean.slice(0, 8);
      const end = clean.slice(-8);
      return `text=${localEncodeTextFragment(start)},${localEncodeTextFragment(end)}`;
    }
    return `text=${localEncodeTextFragment(clean)}`;
  }

  function localAttachTextFragment(url, selectedText) {
    if (!url || typeof url !== 'string') return url || '';
    if (!selectedText || typeof selectedText !== 'string' || !selectedText.trim()) {
      return url;
    }

    const directive = localGenerateTextFragmentDirective(selectedText);
    if (!directive) return url;

    const cleanBase = url.replace(/:~:text=[^&]*/g, '').replace(/#:~:$/, '');
    if (cleanBase.includes('#')) {
      return `${cleanBase}:~:${directive}`;
    }
    return `${cleanBase}#:~:${directive}`;
  }

  function localFormatQuote(quoteText, title, url, options = {}) {
    const { enableTextFragment = true, hasSelection = false } = options;
    const targetUrl = (hasSelection && enableTextFragment && quoteText)
      ? localAttachTextFragment(url, quoteText)
      : url;

    const cleanedQuote = (quoteText || '')
      .trim()
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n');

    if (!cleanedQuote) {
      return {
        plainText: targetUrl,
        html: `<p><a href="${targetUrl}" style="color: #0284c7; text-decoration: underline;">${url}</a></p>`,
        targetUrl
      };
    }

    const plainText = `${cleanedQuote}\n\n— ${targetUrl}`;

    const htmlQuote = (quoteText || '')
      .trim()
      .split('\n')
      .map(line => escapeHtml(line))
      .join('<br>');
    const html = `<blockquote style="border-left: 3px solid #38bdf8; padding-left: 10px; margin: 8px 0; color: #334155; font-style: italic;">${htmlQuote}</blockquote><p>— <a href="${targetUrl}" style="color: #0284c7; text-decoration: underline;">${url}</a></p>`;

    return { plainText, html, targetUrl };
  }

  async function localCopyToClipboard(text, html = null) {
    try {
      if (html && navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([text], { type: 'text/plain' });
        const htmlBlob = new Blob([html], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob
          })
        ]);
        return true;
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // 靜默 fallback
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const res = document.execCommand('copy');
      document.body.removeChild(textarea);
      return res;
    } catch (e) {
      return false;
    }
  }

  // --- 浮動膠囊 (Floating Action Pill) DOM ---
  let pillElement = null;

  function createPill() {
    if (pillElement) return pillElement;

    pillElement = document.createElement('div');
    pillElement.className = '__cleanlink-pill-container';
    pillElement.innerHTML = `
      <button type="button" class="__cleanlink-pill-btn" id="__cleanlink-quote-btn" title="複製引言與乾淨連結">
        <svg viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        <span>引言連結</span>
        <span class="__cleanlink-pill-shortcut">Alt+Q</span>
      </button>
    `;

    document.body.appendChild(pillElement);

    const quoteBtn = pillElement.querySelector('#__cleanlink-quote-btn');
    quoteBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    quoteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await executeCopyQuote();

      const span = quoteBtn.querySelector('span');
      const originalText = span.textContent;
      quoteBtn.classList.add('__cleanlink-pill-success');
      span.textContent = '已複製';

      setTimeout(() => {
        hidePill();
        quoteBtn.classList.remove('__cleanlink-pill-success');
        span.textContent = originalText;
      }, 600);
    });

    return pillElement;
  }

  function hidePill() {
    if (pillElement) {
      pillElement.classList.remove('__cleanlink-visible');
    }
  }

  function handleSelectionChange() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      hidePill();
      return;
    }

    const text = selection.toString().trim();
    if (text.length === 0) {
      hidePill();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      hidePill();
      return;
    }

    const pill = createPill();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const pillLeft = scrollX + rect.left + rect.width / 2;
    const pillTop = scrollY + rect.bottom + 8;

    pill.style.left = `${Math.max(10, pillLeft - 60)}px`;
    pill.style.top = `${pillTop}px`;
    pill.classList.add('__cleanlink-visible');
  }

  document.addEventListener('mouseup', () => {
    setTimeout(handleSelectionChange, 10);
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
      setTimeout(handleSelectionChange, 10);
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (pillElement && !pillElement.contains(e.target)) {
      hidePill();
    }
  });

  async function executeCopyQuote() {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    const hasSelection = text.length > 0;
    const clean = localCleanUrl(window.location.href);

    let enableTextFragment = true;
    if (isContextValid()) {
      try {
        const stored = await chrome.storage.sync.get({ enableTextFragment: true });
        if (stored && typeof stored.enableTextFragment === 'boolean') {
          enableTextFragment = stored.enableTextFragment;
        }
      } catch (e) {}
    }

    const quoteData = localFormatQuote(text || document.title, document.title, clean, {
      enableTextFragment,
      hasSelection
    });
    await localCopyToClipboard(quoteData.plainText, quoteData.html);
  }

  // ==========================================================================
  // 連結行前探測器 (Pre-Flight Link Radar)
  // ==========================================================================
  const LOCAL_PAYWALL_DOMAINS = new Set([
    'wsj.com', 'nytimes.com', 'ft.com', 'bloomberg.com', 'economist.com',
    'thetimes.co.uk', 'telegraph.co.uk', 'nikkei.com', 'hbr.org', 'theathletic.com',
    'barrons.com', 'theinformation.com', 'newyorker.com', 'washingtonpost.com',
    'scmp.com', 'technologyreview.com', 'theglobeandmail.com', 'lefigaro.fr', 'handelsblatt.com',
    'caixin.com', 'businessweekly.com.tw', 'cw.com.tw', 'hbrtaiwan.com',
    'quora.com', 'scribd.com', 'slideshare.net', 'patreon.com'
  ]);

  const LOCAL_AI_FARM_DOMAINS = new Set([
    'kknews.cc', 'read01.com', 'xuehua.us', 'coco01.net', 'gigacircle.com',
    'teepr.com', 'bomb01.com', 'mission-tw.com', 'flxdaily.com', 'twgreatdaily.com',
    'greatdaily.org', 'ptt01.cc', 'buzzhand.com', 'daliulian.net', 'share001.org',
    'ezp9.com', 'dailybuzz.cc', 'b1129.com', 'how01.com', 'twgreatdaily.live',
    'anyelse.com', 'ezgoe.com', 'lookforward.cc', 'post01.com', 'gushiciku.cn',
    'hotbak.net', 'itread01.com', 'geek-docs.com', 'codenong.com', 'itbaoku.cn',
    'helplib.com', 'copyprogramming.com'
  ]);

  const LOCAL_SAFE_DOMAINS = new Set([
    'wikipedia.org', 'wikimedia.org', 'github.com', 'gitlab.com', 'mozilla.org',
    'w3.org', 'stackoverflow.com', 'stackexchange.com', 'reuters.com', 'apnews.com',
    'bbc.com', 'bbc.co.uk', 'nature.com', 'science.org', 'arxiv.org',
    'google.com', 'youtube.com', 'microsoft.com', 'apple.com'
  ]);

  function localMatchDomainList(host, domainSet) {
    if (!host) return null;
    const lowerHost = host.toLowerCase();
    if (domainSet.has(lowerHost)) return lowerHost;
    for (const baseDomain of domainSet) {
      if (lowerHost.endsWith(`.${baseDomain}`)) return baseDomain;
    }
    return null;
  }

  function localAssessLinkUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
      return null;
    }

    let parsed;
    try {
      parsed = new URL(trimmed, window.location.href);
    } catch (e) {
      return null;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // 1. udn.com/vip
    if (host === 'udn.com' || host.endsWith('.udn.com')) {
      if (pathname.startsWith('/vip') || pathname.includes('/vip/')) {
        return {
          status: 'paywall',
          badgeText: '警告：此站有嚴格付費牆 / 強制登入',
          domain: host,
          iconType: 'paywall'
        };
      }
    }

    // 2. 付費牆 / 強制登入
    const matchedPaywall = localMatchDomainList(host, LOCAL_PAYWALL_DOMAINS);
    if (matchedPaywall) {
      return {
        status: 'paywall',
        badgeText: '警告：此站有嚴格付費牆 / 強制登入',
        domain: matchedPaywall,
        iconType: 'paywall'
      };
    }

    // 3. AI 內容農場
    const matchedFarm = localMatchDomainList(host, LOCAL_AI_FARM_DOMAINS);
    if (matchedFarm) {
      return {
        status: 'ai_farm',
        badgeText: '警告：偵測到為低品質 AI 內容農場',
        domain: matchedFarm,
        iconType: 'ai_farm'
      };
    }

    // 4. 特徵識別
    if (/(contentfarm|article01|dailyarticle|greatdaily|toutiao.*clone)/i.test(host)) {
      return {
        status: 'ai_farm',
        badgeText: '警告：偵測到為低品質 AI 內容農場',
        domain: host,
        iconType: 'ai_farm'
      };
    }

    // 5. 優質/安全名單
    const matchedSafe = localMatchDomainList(host, LOCAL_SAFE_DOMAINS);
    if (matchedSafe) {
      return {
        status: 'safe',
        badgeText: '正常',
        domain: matchedSafe,
        iconType: 'safe'
      };
    }

    // 6. 一般網站歸類為正常
    return {
      status: 'safe',
      badgeText: '正常',
      domain: host,
      iconType: 'safe'
    };
  }

  function localGetRadarSvgIcon(iconType) {
    if (iconType === 'paywall') {
      return '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-danger"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    if (iconType === 'ai_farm') {
      return '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-warning"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    }
    return '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-safe"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  }

  // 探測提示 Tooltip 實例與互動管理
  const RADAR_I18N = {
    'zh-TW': {
      paywall: '警告：此站有嚴格付費牆 / 強制登入',
      ai_farm: '警告：偵測到為低品質 AI 內容農場',
      safe: '正常'
    },
    'zh-CN': {
      paywall: '警告：此站有严格付费墙 / 强制登录',
      ai_farm: '警告：检测到为低质量 AI 内容农场',
      safe: '正常'
    },
    'en': {
      paywall: 'Warning: Strict Paywall / Mandatory Login',
      ai_farm: 'Warning: Low-Quality AI Content Farm',
      safe: 'Safe'
    },
    'ja': {
      paywall: '警告：有料ペイウォール / ログイン必須',
      ai_farm: '警告：低品質な AI コンテンツファーム',
      safe: '正常'
    }
  };

  let contentLanguage = 'zh-TW';

  function resolveContentLanguage(pref) {
    if (!pref || pref === 'auto') {
      const nav = (navigator.language || '').toLowerCase();
      if (nav.startsWith('zh-cn') || nav.startsWith('zh-sg') || nav.startsWith('zh-hans')) return 'zh-CN';
      if (nav.startsWith('zh')) return 'zh-TW';
      if (nav.startsWith('ja')) return 'ja';
      if (nav.startsWith('en')) return 'en';
      return 'zh-TW';
    }
    return pref;
  }

  let radarTooltipElement = null;
  let radarHoverTimer = null;
  let currentRadarAnchor = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  let radarSettings = {
    enableLinkRadar: true,
    radarAlertOnly: false,
    radarPosition: 'cursor-top-right'
  };

  if (isContextValid()) {
    try {
      chrome.storage.sync.get({
        enableLinkRadar: true,
        radarAlertOnly: false,
        radarPosition: 'cursor-top-right',
        appLanguage: 'auto',
        enablePipHoverBtn: true
      }, (res) => {
        if (res) {
          radarSettings.enableLinkRadar = res.enableLinkRadar !== false;
          radarSettings.radarAlertOnly = !!res.radarAlertOnly;
          radarSettings.radarPosition = res.radarPosition || 'cursor-top-right';
          contentLanguage = resolveContentLanguage(res.appLanguage);
          enablePipHoverBtn = res.enablePipHoverBtn !== false;
        }
      });
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
          if (changes.enableLinkRadar) radarSettings.enableLinkRadar = changes.enableLinkRadar.newValue;
          if (changes.radarAlertOnly) radarSettings.radarAlertOnly = changes.radarAlertOnly.newValue;
          if (changes.radarPosition) radarSettings.radarPosition = changes.radarPosition.newValue;
          if (changes.appLanguage) {
            contentLanguage = resolveContentLanguage(changes.appLanguage.newValue);
            if (pipButtonElement) updatePipButtonContent(document.pictureInPictureElement === currentTargetVideo);
          }
          if (changes.enablePipHoverBtn !== undefined) {
            enablePipHoverBtn = changes.enablePipHoverBtn.newValue;
            if (!enablePipHoverBtn) hidePipButton();
          }
        }
      });
    } catch (e) {}
  }

  function getOrCreateRadarTooltip() {
    if (radarTooltipElement) return radarTooltipElement;
    radarTooltipElement = document.createElement('div');
    radarTooltipElement.className = '__cleanlink-radar-tooltip';
    document.body.appendChild(radarTooltipElement);
    return radarTooltipElement;
  }

  function hideRadarTooltip() {
    if (radarTooltipElement) {
      radarTooltipElement.classList.remove('__cleanlink-radar-visible');
    }
  }

  function showRadarForAnchor(anchor, mouseX, mouseY) {
    if (!anchor || !radarSettings.enableLinkRadar) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    const result = localAssessLinkUrl(href);
    if (!result) return;

    // 若使用者設定僅在警告時顯示提示，且當前為安全網站，則略過
    if (radarSettings.radarAlertOnly && result.status === 'safe') {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const badgeText = (RADAR_I18N[contentLanguage] && RADAR_I18N[contentLanguage][result.status]) || result.badgeText;

    const tooltip = getOrCreateRadarTooltip();
    tooltip.className = `__cleanlink-radar-tooltip __status-${result.status}`;
    tooltip.innerHTML = `
      ${localGetRadarSvgIcon(result.iconType)}
      <span class="__radar-text">${badgeText}</span>
      <span class="__cleanlink-radar-domain">${result.domain}</span>
    `;

    // 視窗邊界智慧定位
    tooltip.style.left = '-9999px';
    tooltip.style.top = '-9999px';
    tooltip.classList.add('__cleanlink-radar-visible');

    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width || 180;
    const tooltipHeight = tooltipRect.height || 28;

    const posX = typeof mouseX === 'number' && mouseX > 0 ? mouseX : (rect.left + rect.width / 2);
    const posY = typeof mouseY === 'number' && mouseY > 0 ? mouseY : (rect.top + rect.height / 2);
    const posMode = radarSettings.radarPosition || 'cursor-top-right';

    let top = 0;
    let left = 0;

    if (posMode === 'cursor-top-right') {
      // 緊貼鼠標右上 (距離鼠標指針僅 8px)
      top = posY - tooltipHeight - 6;
      left = posX + 8;
      if (top < 8) {
        top = posY + 14;
      }
    } else if (posMode === 'cursor-top') {
      // 鼠標正上方
      top = posY - tooltipHeight - 6;
      left = posX - tooltipWidth / 2;
      if (top < 8) {
        top = posY + 14;
      }
    } else if (posMode === 'cursor-bottom-right') {
      // 鼠標右下方
      top = posY + 14;
      left = posX + 8;
      if (top + tooltipHeight > window.innerHeight - 8) {
        top = posY - tooltipHeight - 6;
      }
    } else {
      // anchor-top (超連結上方，緊湊 4px 間距)
      top = rect.top - tooltipHeight - 4;
      if (top < 8) {
        top = rect.bottom + 4;
      }
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    }

    // 視窗左右邊界保護
    const maxLeft = window.innerWidth - tooltipWidth - 10;
    left = Math.max(10, Math.min(left, maxLeft));

    // 視窗上下邊界防護
    const maxTop = window.innerHeight - tooltipHeight - 6;
    top = Math.max(6, Math.min(top, maxTop));

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  }

  // 監聽即時滑鼠游標位置
  document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }, { passive: true });

  // 監聽滑鼠懸浮事件
  document.addEventListener('mouseover', (e) => {
    if (!radarSettings.enableLinkRadar) return;
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (anchor === currentRadarAnchor) return;
    clearTimeout(radarHoverTimer);
    currentRadarAnchor = anchor;

    radarHoverTimer = setTimeout(() => {
      showRadarForAnchor(anchor, lastMouseX, lastMouseY);
    }, 180);
  });

  document.addEventListener('mouseout', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    if (e.relatedTarget && anchor.contains(e.relatedTarget)) {
      return;
    }

    clearTimeout(radarHoverTimer);
    currentRadarAnchor = null;
    hideRadarTooltip();
  });

  // 頁面滾動或點擊時立即隱藏微型標籤
  window.addEventListener('scroll', () => {
    clearTimeout(radarHoverTimer);
    currentRadarAnchor = null;
    hideRadarTooltip();
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    clearTimeout(radarHoverTimer);
    currentRadarAnchor = null;
    hideRadarTooltip();
  });

  // 監聽頁面快捷鍵 Alt+Q
  document.addEventListener('keydown', async (e) => {
    if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        e.preventDefault();
        await executeCopyQuote();
        hidePill();
      }
    }
  });

  // ==========================================================================
  // 播放器懸浮子母畫面手動按鈕 (Universal PiP Hover Button)
  // ==========================================================================
  const PIP_I18N = {
    'zh-TW': {
      label: '子母畫面',
      title: '開啟子母畫面 (Picture-in-Picture)',
      restoreTitle: '還原子母畫面 (Exit Picture-in-Picture)'
    },
    'zh-CN': {
      label: '画中画',
      title: '开启画中画 (Picture-in-Picture)',
      restoreTitle: '还原画中画 (Exit Picture-in-Picture)'
    },
    'en': {
      label: 'PiP',
      title: 'Picture-in-Picture',
      restoreTitle: 'Exit Picture-in-Picture'
    },
    'ja': {
      label: 'PiP',
      title: 'ピクチャーインピクチャー',
      restoreTitle: 'ピクチャーインピクチャーを解除'
    }
  };

  const PIP_ENTER_ICON = '<svg viewBox="0 0 24 24" class="__cleanlink-pip-svg" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><rect x="12" y="10" width="8" height="6" rx="1" ry="1" fill="currentColor"></rect></svg>';
  const PIP_RESTORE_ICON = '<svg viewBox="0 0 24 24" class="__cleanlink-pip-svg" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><polyline points="13 14 16 11 19 14"></polyline><line x1="16" y1="11" x2="16" y2="17"></line></svg>';

  let enablePipHoverBtn = true;
  let pipButtonElement = null;
  let currentTargetVideo = null;
  let pipHideTimer = null;
  let pipIdleTimer = null;
  let isHoveringPipButton = false;
  let currentPipState = null;

  // 與 YouTube 控制列閒置自動消逝時間同步 (約 2.5 秒)
  const PIP_IDLE_TIMEOUT = 2500;

  function getOrCreatePipButton() {
    if (pipButtonElement) return pipButtonElement;
    pipButtonElement = document.createElement('div');
    pipButtonElement.className = '__cleanlink-pip-btn';
    pipButtonElement.setAttribute('role', 'button');
    pipButtonElement.setAttribute('tabindex', '0');

    // 點擊事件：手動切換子母畫面 (阻止事件冒泡，不影響原播放器暫停/播放)
    pipButtonElement.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const video = currentTargetVideo || document.querySelector('video');
      if (!video) return;

      try {
        if (document.pictureInPictureElement === video) {
          await document.exitPictureInPicture();
        } else {
          if (video.hasAttribute('disablePictureInPicture')) {
            video.removeAttribute('disablePictureInPicture');
          }
          video.disablePictureInPicture = false;
          await video.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('CleanLink PiP request failed:', err);
      }
    });

    pipButtonElement.addEventListener('mouseenter', () => {
      isHoveringPipButton = true;
      clearTimeout(pipHideTimer);
      clearTimeout(pipIdleTimer);
    });

    pipButtonElement.addEventListener('mouseleave', () => {
      isHoveringPipButton = false;
      scheduleHidePipButton(250);
    });

    document.body.appendChild(pipButtonElement);
    return pipButtonElement;
  }

  function updatePipButtonContent(isInPip) {
    if (!pipButtonElement) return;
    if (currentPipState === isInPip && pipButtonElement.firstElementChild) return;
    currentPipState = isInPip;
    const i18n = PIP_I18N[contentLanguage] || PIP_I18N['zh-TW'];
    if (isInPip) {
      pipButtonElement.classList.add('__pip-active');
      pipButtonElement.title = i18n.restoreTitle;
      pipButtonElement.setAttribute('aria-label', i18n.restoreTitle);
      pipButtonElement.innerHTML = PIP_RESTORE_ICON;
    } else {
      pipButtonElement.classList.remove('__pip-active');
      pipButtonElement.title = i18n.title;
      pipButtonElement.setAttribute('aria-label', i18n.title);
      pipButtonElement.innerHTML = PIP_ENTER_ICON;
    }
  }

  function hidePipButton() {
    clearTimeout(pipHideTimer);
    clearTimeout(pipIdleTimer);
    if (pipButtonElement) {
      pipButtonElement.classList.remove('__cleanlink-pip-visible');
    }
    currentTargetVideo = null;
  }

  function scheduleHidePipButton(delay = 150) {
    if (isHoveringPipButton) return;
    clearTimeout(pipHideTimer);
    pipHideTimer = setTimeout(() => {
      if (isHoveringPipButton) return;
      hidePipButton();
    }, delay);
  }

  function resetPipIdleTimer() {
    clearTimeout(pipIdleTimer);
    if (isHoveringPipButton) return;
    pipIdleTimer = setTimeout(() => {
      if (isHoveringPipButton) return;
      hidePipButton();
    }, PIP_IDLE_TIMEOUT);
  }

  // 判定是否為預覽頁面或預覽卡片影片 (如 YouTube 首頁/搜尋/推薦、Bilibili 卡片預覽等，不跳出按鈕)
  function isPreviewVideoOrPage(video = null) {
    const host = (location.hostname || '').toLowerCase();
    const path = (location.pathname || '').toLowerCase();

    // 1. YouTube: 僅在實際播放頁面（/watch, /shorts/, /embed/, /live/）啟用
    if (host.includes('youtube.com')) {
      const isWatchPage = path.startsWith('/watch') ||
                          path.startsWith('/shorts/') ||
                          path.startsWith('/embed/') ||
                          path.startsWith('/live/');
      // 非播放頁面（如首頁 /、搜尋 /results、訂閱與動態 /feed/、頻道 /@channel 等）全數為預覽頁
      if (!isWatchPage) return true;

      // 即使在播放頁，若影片屬於側邊推薦欄或卡片的懸停即時預覽，一律排除
      if (video && video.closest([
        '#inline-preview-player',
        'ytd-video-preview',
        'ytd-inline-preview-renderer',
        '.ytd-inline-preview-renderer',
        'ytd-thumbnail',
        '.ytd-thumbnail',
        'ytd-compact-video-renderer',
        'ytd-rich-item-renderer',
        'ytd-grid-video-renderer',
        'ytd-video-renderer'
      ].join(','))) {
        return true;
      }
    }

    // 2. Bilibili: 僅在實際播放頁面啟用，排除首頁、搜尋與動態卡片預覽
    if (host.includes('bilibili.com')) {
      const isWatchPage = path.startsWith('/video/') ||
                          path.startsWith('/bangumi/play/') ||
                          path.startsWith('/medialist/play/') ||
                          host.startsWith('live.bilibili.com');
      if (!isWatchPage) return true;

      if (video && video.closest('.bili-video-card, .feed-card, .bili-cover-card, .video-card')) {
        return true;
      }
    }

    // 3. Netflix: 排除 /browse 瀏覽頁面與資訊卡預覽
    if (host.includes('netflix.com')) {
      if (!path.startsWith('/watch/')) return true;
      if (video && video.closest('.billboard-row, .title-card, [data-uia*="preview"]')) {
        return true;
      }
    }

    // 4. Twitch: 排除 /directory 遊戲與分類目錄預覽流
    if (host.includes('twitch.tv')) {
      if (path.startsWith('/directory')) return true;
    }

    // 5. 通用預覽容器與標籤特徵排除
    if (video) {
      if (video.hasAttribute('data-preview') || video.getAttribute('data-purpose') === 'preview') {
        return true;
      }
      if (video.closest([
        '#inline-preview-player',
        '[data-testid="preview-player"]',
        '[data-purpose="video-preview"]',
        '.video-preview-container',
        '.hover-preview-video',
        '.thumbnail-preview'
      ].join(','))) {
        return true;
      }
    }

    return false;
  }

  function showPipButtonForVideo(video, playerRect = null, container = null) {
    if (!enablePipHoverBtn || !video || isPreviewVideoOrPage(video)) return;

    // 優先以播放器外層容器 (例如 YouTube #movie_player) 坐標為基準，確保位置始終恆定不跳動
    const playerContainer = container || video.closest([
      '#movie_player',
      '.html5-video-player',
      '.bpx-player-container',
      '.bilibili-player-video',
      '[data-testid="videoPlayer"]',
      '[data-testid="videoComponent"]',
      '.video-js',
      '.jwplayer',
      '.dplayer',
      '.player-container'
    ].join(','));

    const targetRect = playerRect || (playerContainer ? playerContainer.getBoundingClientRect() : video.getBoundingClientRect());
    if (targetRect.width < 160 || targetRect.height < 120) return;
    if (targetRect.bottom < 0 || targetRect.top > window.innerHeight) return;
    if (targetRect.right < 0 || targetRect.left > window.innerWidth) return;

    currentTargetVideo = video;
    const btn = getOrCreatePipButton();
    const isInPip = document.pictureInPictureElement === video;
    updatePipButtonContent(isInPip);

    // 支援全螢幕模式：在全螢幕下 append 至全螢幕容器確保可見
    const mountContainer = document.fullscreenElement || document.body;
    if (btn.parentElement !== mountContainer) {
      mountContainer.appendChild(btn);
    }

    // 依使用者需求避開原生播放器右上角控制項並微調最佳間距：
    const OFFSET_TOP = 15;    // 頂部間距設定為 15px
    const OFFSET_RIGHT = 50;  // 84px - 34px = 50px (右移一個圖示距離)

    let top = targetRect.top + OFFSET_TOP;
    const clientW = document.documentElement.clientWidth || window.innerWidth;
    let right = (clientW - targetRect.right) + OFFSET_RIGHT;

    if (top < OFFSET_TOP) top = OFFSET_TOP;
    if (right < OFFSET_RIGHT) right = OFFSET_RIGHT;

    btn.style.top = `${Math.round(top)}px`;
    btn.style.right = `${Math.round(right)}px`;
    btn.style.left = 'auto';
    btn.style.bottom = 'auto';

    btn.classList.add('__cleanlink-pip-visible');
    clearTimeout(pipHideTimer);
    resetPipIdleTimer(); // 啟動「放置一陣子自動消逝」計時器 (2.5s 與 YT 控制列同步)
  }

  // 智慧搜尋游標所在的活動影片與播放器容器 (支援原生 video, YouTube, Bilibili, Twitter, Twitch 等主流播放器遮罩)
  function findVideoAtPoint(x, y, path) {
    if (isPreviewVideoOrPage(null)) return null;

    const videos = Array.from(document.querySelectorAll('video'));
    if (path && path.length) {
      for (const el of path) {
        if (el && el.shadowRoot) {
          el.shadowRoot.querySelectorAll('video').forEach(v => {
            if (!videos.includes(v)) videos.push(v);
          });
        }
      }
    }

    for (const v of videos) {
      if (isPreviewVideoOrPage(v)) continue;
      const rect = v.getBoundingClientRect();
      if (rect.width >= 160 && rect.height >= 120) {
        const playerContainer = v.closest([
          '#movie_player',
          '.html5-video-player',
          '.bpx-player-container',
          '.bilibili-player-video',
          '[data-testid="videoPlayer"]',
          '[data-testid="videoComponent"]',
          '.video-js',
          '.jwplayer',
          '.dplayer',
          '.player-container'
        ].join(','));

        // 判定 1: 游標落在外層播放器容器內 (YouTube #movie_player 等)
        if (playerContainer) {
          const cRect = playerContainer.getBoundingClientRect();
          if (
            x >= cRect.left &&
            x <= cRect.right &&
            y >= cRect.top &&
            y <= cRect.bottom
          ) {
            return { video: v, rect: cRect, container: playerContainer };
          }
        }

        // 判定 2: 游標直接落在影片畫面範圍內
        if (
          x >= rect.left - 4 &&
          x <= rect.right + 4 &&
          y >= rect.top - 4 &&
          y <= rect.bottom + 4
        ) {
          return { video: v, rect, container: playerContainer };
        }
      }
    }

    // 判定 3: 檢查事件冒泡路徑
    if (path && path.length) {
      for (const el of path) {
        if (el && (el.tagName === 'VIDEO' || el instanceof HTMLVideoElement)) {
          if (isPreviewVideoOrPage(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width >= 160 && rect.height >= 120) {
            const playerContainer = el.closest('#movie_player, .html5-video-player, .bpx-player-container');
            return { video: el, rect: (playerContainer ? playerContainer.getBoundingClientRect() : rect), container: playerContainer };
          }
        }
      }
    }

    return null;
  }

  let lastPipCheckTime = 0;
  document.addEventListener('mousemove', (e) => {
    if (!enablePipHoverBtn) return;

    // 若整頁為預覽頁面，確保按鈕隱藏並直接返回，杜絕多餘運算
    if (isPreviewVideoOrPage(null)) {
      if (pipButtonElement && pipButtonElement.classList.contains('__cleanlink-pip-visible')) {
        hidePipButton();
      }
      return;
    }

    // 優先判定：游標在按鈕本身上方或 8px 緩衝區內，強固鎖定為 hover 狀態，絕不隱藏
    if (pipButtonElement && pipButtonElement.classList.contains('__cleanlink-pip-visible')) {
      if (pipButtonElement === e.target || pipButtonElement.contains(e.target)) {
        isHoveringPipButton = true;
        clearTimeout(pipHideTimer);
        clearTimeout(pipIdleTimer);
        return;
      }
      const bRect = pipButtonElement.getBoundingClientRect();
      if (
        e.clientX >= bRect.left - 8 &&
        e.clientX <= bRect.right + 8 &&
        e.clientY >= bRect.top - 8 &&
        e.clientY <= bRect.bottom + 8
      ) {
        isHoveringPipButton = true;
        clearTimeout(pipHideTimer);
        clearTimeout(pipIdleTimer);
        return;
      }
    }

    isHoveringPipButton = false;

    const now = Date.now();
    if (now - lastPipCheckTime < 40) return; // 40ms 節流，高響應且節能
    lastPipCheckTime = now;

    const path = e.composedPath ? e.composedPath() : [];
    const match = findVideoAtPoint(e.clientX, e.clientY, path);
    if (match && match.video) {
      showPipButtonForVideo(match.video, match.rect, match.container);
    } else {
      if (currentTargetVideo) {
        scheduleHidePipButton(150);
      }
    }
  }, { passive: true });

  // 只要滑鼠真正離開瀏覽器視窗 (頁面外部)，立即消逝 (絕不使用 capture: true 避免誤攔截頁面內子元件)
  document.addEventListener('mouseleave', (e) => {
    if (e.target === document || e.target === document.documentElement) {
      if (!isHoveringPipButton) {
        hidePipButton();
      }
    }
  });

  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && !e.toElement) {
      if (!isHoveringPipButton) {
        hidePipButton();
      }
    }
  });

  window.addEventListener('blur', () => {
    if (!isHoveringPipButton) {
      hidePipButton();
    }
  });

  // 監聽 PiP 狀態事件，即時反饋按鈕狀態
  document.addEventListener('enterpictureinpicture', (e) => {
    if (pipButtonElement && e.target === currentTargetVideo) {
      updatePipButtonContent(true);
    }
  }, true);

  document.addEventListener('leavepictureinpicture', () => {
    if (pipButtonElement) {
      updatePipButtonContent(false);
    }
  }, true);

  // 監聽來自 Background Service Worker 的訊息 (防護 context invalidated)
  if (isContextValid()) {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!isContextValid()) return;

        if (message.action === 'EXECUTE_COPY') {
          localCopyToClipboard(message.text, message.html);
          sendResponse({ success: true });
        } else if (message.action === 'EXECUTE_QUOTE_COPY') {
          const selection = window.getSelection();
          const selectedText = selection ? selection.toString().trim() : '';
          const hasSelection = selectedText.length > 0;
          const urlToUse = message.cleanUrl || localCleanUrl(window.location.href);
          const titleToUse = message.title || document.title;
          const quoteData = localFormatQuote(selectedText || titleToUse, titleToUse, urlToUse, {
            enableTextFragment: message.enableTextFragment !== false,
            hasSelection
          });
          localCopyToClipboard(quoteData.plainText, quoteData.html);
          sendResponse({ success: true });
        } else if (message.action === 'GET_YOUTUBE_CURRENT_TIME') {
          const video = document.querySelector('video');
          if (video && !isNaN(video.currentTime)) {
            sendResponse({ currentTime: Math.floor(video.currentTime) });
          } else {
            sendResponse({ currentTime: null });
          }
        }
        return true;
      });
    } catch (e) {
      // 忽略已失效 context 的監聽器錯誤
    }
  }

  // --- 影音加速助手 (Stream Booster) 配置同步橋接 ---
  if (isContextValid()) {
    try {
      chrome.storage.sync.get(['enableStreamBooster', 'boosterQuality', 'boosterDisableAV1', 'boosterExpandHLS'], (cfg) => {
        if (!isContextValid()) return;
        window.dispatchEvent(new CustomEvent('__STREAM_BOOSTER_SYNC__', {
          detail: {
            enableStreamBooster: cfg.enableStreamBooster !== false,
            boosterQuality: cfg.boosterQuality || '1080p',
            boosterDisableAV1: cfg.boosterDisableAV1 !== false,
            boosterExpandHLS: cfg.boosterExpandHLS !== false
          }
        }));
      });

      chrome.storage.onChanged.addListener((changes, area) => {
        if (!isContextValid() || area !== 'sync') return;
        const boosterKeys = ['enableStreamBooster', 'boosterQuality', 'boosterDisableAV1', 'boosterExpandHLS'];
        const changedBoosterKeys = Object.keys(changes).filter(k => boosterKeys.includes(k));
        if (changedBoosterKeys.length > 0) {
          const detail = {};
          changedBoosterKeys.forEach(k => {
            detail[k] = changes[k].newValue;
          });
          window.dispatchEvent(new CustomEvent('__STREAM_BOOSTER_SYNC__', { detail }));
        }
      });
    } catch (e) {
      // 忽略 context 異常
    }
  }
})();

