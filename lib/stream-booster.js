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
