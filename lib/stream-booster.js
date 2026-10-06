/**
 * CleanLink & QuickShare - 影音加速助手核心模組 (Stream Booster Lib)
 * 純函數封裝：畫質代號映射、AV1 軟解檢測正則、HLS 緩衝配置擴充
 */

// 支援的畫質選項與 YouTube 播放器內部代號映射
export const QUALITY_MAP = {
  auto: {
    label: '自動',
    ytQuality: 'default',
    biliQn: 0
  },
  '720p': {
    label: '720p',
    ytQuality: 'hd720',
    biliQn: 64
  },
  '1080p': {
    label: '1080p',
    ytQuality: 'hd1080',
    biliQn: 80
  },
  '1440p': {
    label: '1440p',
    ytQuality: 'hd1440',
    biliQn: 112
  },
  '2160p': {
    label: '4K',
    ytQuality: 'hd2160',
    biliQn: 116
  }
};

/**
 * 將使用者設定的畫質名稱轉換為 YouTube 內部 quality level
 * @param {string} qualityKey - 如 '1080p', '1440p', '2160p', 'auto'
 * @returns {string} YouTube 內部畫質代號 (如 'hd1080', 'default')
 */
export function mapToYouTubeQuality(qualityKey) {
  if (!qualityKey || !QUALITY_MAP[qualityKey]) {
    return 'default';
  }
  return QUALITY_MAP[qualityKey].ytQuality;
}

/**
 * 判斷 MIME Type 字串是否為 AV1 編碼
 * 針對 video/mp4; codecs="av01...", video/webm; codecs="av1" 等
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isAV1Codec(mimeType) {
  if (typeof mimeType !== 'string') return false;
  // 符合 av01 (如 av01.0.08M.08) 或 av1
  return /codecs\s*=\s*["']?av0?1/i.test(mimeType);
}

/**
 * 針對開源 Hls.js 配置物件進行安全緩衝擴充
 * 將預設約 30 秒的前瞻緩衝拉長至 120 秒，並設定 60MB 緩衝上限
 * @param {Object} originalConfig - 原本傳入 Hls 建構子的配置
 * @returns {Object} 擴展後的安全配置
 */
export function expandHlsConfig(originalConfig = {}) {
  const config = { ...originalConfig };

  // 前瞻緩衝長度 (秒)：預設 30 秒 -> 擴展至 120 秒
  config.maxBufferLength = Math.max(config.maxBufferLength || 0, 120);

  // 最大緩衝上限 (秒)：擴展至 300 秒 (5分鐘)
  config.maxMaxBufferLength = Math.max(config.maxMaxBufferLength || 0, 300);

  // 記憶體緩衝容量 (Bytes)：預設約 30MB -> 安全擴充至 60MB
  config.maxBufferSize = Math.max(config.maxBufferSize || 0, 60 * 1024 * 1024);

  // 當緩衝發生停頓時的寬容容錯時間 (秒)
  if (typeof config.highBufferWatchdogPeriod === 'undefined') {
    config.highBufferWatchdogPeriod = 3;
  }

  return config;
}

/**
 * 純幾何向量 PotPlayer 圖示 (顯示器基座 + 播放三角)
 * 嚴格零 Emoji，標準 SVG 向量幾何圖形
 */
export const POTPLAYER_ICON = '<svg viewBox="0 0 24 24" class="__cleanlink-pip-svg" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polygon points="10 7 16 10 10 13" fill="currentColor"></polygon></svg>';

/**
 * 萬用視訊串流網址探測引擎
 * 支援 DOM 直鏈、HLS .m3u8、DASH .mpd、深層 iFrame 及主流影音平台正規化
 * @param {HTMLVideoElement|Object} video - 當前目標視訊 DOM 或 Mock 對象
 * @param {Document|Object} doc - document 對象
 * @param {Array<string>} capturedStreams - 攔截到的網路串流快取
 * @returns {string} 提取到的最佳串流或影片 URL
 */
export function detectVideoMediaUrl(video, doc = null, capturedStreams = []) {
  const currentDoc = doc || (typeof document !== 'undefined' ? document : null);
  const locationObj = currentDoc && currentDoc.location ? currentDoc.location : (typeof location !== 'undefined' ? location : null);
  const host = locationObj && locationObj.hostname ? locationObj.hostname.toLowerCase() : '';
  const pageUrl = locationObj ? locationObj.href : '';

  // 1. YouTube 平台：PotPlayer 具備原生或 yt-dlp 解析能力，優先傳送乾淨頁面 URL
  if (host.includes('youtube.com') || host === 'youtu.be') {
    return pageUrl;
  }

  // 2. Bilibili 平台：傳送乾淨頁面 URL
  if (host.includes('bilibili.com')) {
    return pageUrl;
  }

  // 3. 視訊 DOM 本體 currentSrc (解析後之絕對直鏈，優先排除 blob: 與 data:)
  if (video && typeof video.currentSrc === 'string' && video.currentSrc) {
    if (!video.currentSrc.startsWith('blob:') && !video.currentSrc.startsWith('data:')) {
      return video.currentSrc;
    }
  }

  // 4. 視訊 DOM 本體 src 屬性
  if (video && typeof video.src === 'string' && video.src) {
    if (!video.src.startsWith('blob:') && !video.src.startsWith('data:')) {
      return video.src;
    }
  }

  // 5. 檢查 video 內部 source 子標籤
  if (video && typeof video.querySelectorAll === 'function') {
    const sources = video.querySelectorAll('source');
    for (const s of sources) {
      const src = s.getAttribute('src') || s.src;
      if (src && !src.startsWith('blob:') && !src.startsWith('data:')) {
        return src;
      }
    }
  }

  // 6. 檢查常規自訂屬性 (如 data-src, data-url)
  if (video && typeof video.getAttribute === 'function') {
    const dataSrc = video.getAttribute('data-src') || video.getAttribute('data-url') || video.getAttribute('data-video-url');
    if (dataSrc && !dataSrc.startsWith('blob:') && !dataSrc.startsWith('data:')) {
      return dataSrc;
    }
  }

  // 7. 檢查播放器實例 (hls.js / dplayer 等掛載於 DOM 或全局之屬性)
  if (video && video.__hls__ && typeof video.__hls__.url === 'string') {
    return video.__hls__.url;
  }

  // 8. 檢查攔截快取的最新 HLS (.m3u8) 或 DASH (.mpd) 串流
  if (Array.isArray(capturedStreams) && capturedStreams.length > 0) {
    return capturedStreams[0];
  }

  // 9. 回退使用當前頁面 URL
  return pageUrl;
}

/**
 * 建構喚起 PotPlayer 本機播放器之安全協議網址 (potplayer://)
 * 支援秒數時間戳自動附加
 * @param {string} rawMediaUrl - 欲播放之串流或網址
 * @param {number} currentTimeSeconds - 當前播放進度 (秒)
 * @returns {string} potplayer:// 協議字串
 */
export function buildPotPlayerUrl(rawMediaUrl, currentTimeSeconds = 0) {
  if (!rawMediaUrl || typeof rawMediaUrl !== 'string') {
    return 'potplayer://';
  }

  let targetUrl = rawMediaUrl.trim();
  const seconds = Math.floor(currentTimeSeconds || 0);

  // 針對 YouTube 網址附加或替換 &t= 時間戳
  if (seconds > 0) {
    if (/youtube\.com|youtu\.be/i.test(targetUrl)) {
      try {
        const u = new URL(targetUrl);
        u.searchParams.set('t', `${seconds}s`);
        targetUrl = u.toString();
      } catch (_) {
        targetUrl += `${targetUrl.includes('?') ? '&' : '?'}t=${seconds}s`;
      }
    }
  }

  return `potplayer://${targetUrl}`;
}

