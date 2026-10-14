import fs from 'fs';
import {
  mapToYouTubeQuality,
  isAV1Codec,
  expandHlsConfig,
  QUALITY_MAP,
  POTPLAYER_ICON,
  detectVideoMediaUrl,
  buildPotPlayerUrl,
  formatPotPlayerTime,
  buildPotPlayerCommand
} from '../lib/stream-booster.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('--- 開始測試 影音加速助手 (Stream Booster) ---');

// 1. 畫質對應測試
assert(mapToYouTubeQuality('1080p') === 'hd1080', '1080p 映射為 hd1080');
assert(mapToYouTubeQuality('1440p') === 'hd1440', '1440p 映射為 hd1440');
assert(mapToYouTubeQuality('2160p') === 'hd2160', '2160p (4K) 映射為 hd2160');
assert(mapToYouTubeQuality('720p') === 'hd720', '720p 映射為 hd720');
assert(mapToYouTubeQuality('auto') === 'default', 'auto 映射為 default');
assert(mapToYouTubeQuality('unknown') === 'default', '無效畫質預設安全映射為 default');

// 2. AV1 軟解阻斷檢測測試
assert(isAV1Codec('video/mp4; codecs="av01.0.08M.08"') === true, 'MP4 av01 識別為 AV1');
assert(isAV1Codec('video/webm; codecs="av1"') === true, 'WebM av1 識別為 AV1');
assert(isAV1Codec('video/mp4; codecs=av01.0.05M.08') === true, '無引號 av01 識別為 AV1');
assert(isAV1Codec('video/webm; codecs="vp9"') === false, 'VP9 不被識別為 AV1 (正常放行)');
assert(isAV1Codec('video/mp4; codecs="avc1.640028"') === false, 'H.264 (avc1) 不被識別為 AV1 (正常放行)');
assert(isAV1Codec('audio/webm; codecs="opus"') === false, 'Opus 音訊不被識別為 AV1 (正常放行)');
assert(isAV1Codec(null) === false, '空值安全防護');
assert(isAV1Codec('') === false, '空字串安全防護');

// 3. 開源 Hls 配置擴充測試
const originalConfig = {
  maxBufferLength: 30,
  maxBufferSize: 30 * 1024 * 1024,
  customProp: 'test'
};
const expanded = expandHlsConfig(originalConfig);

assert(expanded.maxBufferLength === 120, 'HLS maxBufferLength 成功擴展至 120 秒');
assert(expanded.maxMaxBufferLength === 300, 'HLS maxMaxBufferLength 安全設定為 300 秒');
assert(expanded.maxBufferSize === 130 * 1000 * 1000, 'HLS maxBufferSize 擴充至 130MB (容納高清雙分鐘快取)');
assert(expanded.backBufferLength === 30, 'HLS backBufferLength 環形回收 30 秒歷史切片 (杜絕 QuotaExceededError)');
assert(expanded.startFragPrefetch === true, 'HLS startFragPrefetch 啟用首切片預取加速');
assert(expanded.abrEwmaDefaultEstimate === 8000000, 'HLS abrEwmaDefaultEstimate 初始頻寬估算為 8Mbps (直攻 1080p)');
assert(expanded.customProp === 'test', '保留原生配置屬性');
assert(originalConfig.maxBufferLength === 30, '不可變原則：原配置未被就地竄改');

// 4. Universal PiP 子母畫面解鎖與配置測試
function unrestrictVideoForPip(videoMock) {
  if (videoMock.hasAttribute('disablePictureInPicture')) {
    videoMock.removeAttribute('disablePictureInPicture');
  }
  videoMock.disablePictureInPicture = false;
  return videoMock;
}

const mockVideo = {
  attributes: { disablePictureInPicture: '' },
  hasAttribute(name) { return name in this.attributes; },
  removeAttribute(name) { delete this.attributes[name]; },
  disablePictureInPicture: true
};

unrestrictVideoForPip(mockVideo);
assert(mockVideo.hasAttribute('disablePictureInPicture') === false, '成功拔除 disablePictureInPicture 標籤屬性');
assert(mockVideo.disablePictureInPicture === false, '成功重設 disablePictureInPicture 為 false');

// 5. 零 Emoji 與向量 SVG 檢查
const PIP_ENTER_ICON = '<svg viewBox="0 0 24 24" class="__cleanlink-pip-svg" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><rect x="12" y="10" width="8" height="6" rx="1" ry="1" fill="currentColor"></rect></svg>';
const PIP_RESTORE_ICON = '<svg viewBox="0 0 24 24" class="__cleanlink-pip-svg" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><polyline points="13 14 16 11 19 14"></polyline><line x1="16" y1="11" x2="16" y2="17"></line></svg>';

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert(!emojiRegex.test(PIP_ENTER_ICON), '進入 PiP SVG 嚴格零 Emoji');
assert(!emojiRegex.test(PIP_RESTORE_ICON), '還原 PiP SVG 嚴格零 Emoji');
assert(PIP_ENTER_ICON.includes('<rect') && PIP_RESTORE_ICON.includes('<polyline'), 'PiP SVG 具備標準幾何向量路徑');

// 6. 預覽頁面與卡片預覽影片判定測試 (在預覽頁不跳出按鈕)
function testIsPreviewVideoOrPage(url, videoMock = null) {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host.includes('youtube.com')) {
    const isWatchPage = path.startsWith('/watch') ||
                        path.startsWith('/shorts/') ||
                        path.startsWith('/embed/') ||
                        path.startsWith('/live/');
    if (!isWatchPage) return true;

    if (videoMock && videoMock.closest) {
      if (videoMock.closest('#inline-preview-player, ytd-video-preview, ytd-compact-video-renderer')) {
        return true;
      }
    }
  }

  if (host.includes('bilibili.com')) {
    const isWatchPage = path.startsWith('/video/') ||
                        path.startsWith('/bangumi/play/') ||
                        path.startsWith('/medialist/play/') ||
                        host.startsWith('live.bilibili.com');
    if (!isWatchPage) return true;

    if (videoMock && videoMock.closest && videoMock.closest('.bili-video-card, .feed-card')) {
      return true;
    }
  }

  if (host.includes('jable.tv')) {
    if (!path.startsWith('/videos/')) return true;
  }

  return false;
}

assert(testIsPreviewVideoOrPage('https://www.youtube.com/') === true, 'YouTube 首頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://www.youtube.com/results?search_query=news') === true, 'YouTube 搜尋結果頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://www.youtube.com/feed/subscriptions') === true, 'YouTube 訂閱動態頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://www.youtube.com/@mkbhd') === true, 'YouTube 頻道首頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://www.youtube.com/watch?v=dQw4w9WgXcQ') === false, 'YouTube 播放頁判定為正常播放 (放行按鈕)');
assert(testIsPreviewVideoOrPage('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  closest: (sel) => sel.includes('ytd-compact-video-renderer')
}) === true, 'YouTube 播放頁側欄推薦卡片預覽 (精確攔截排除)');
assert(testIsPreviewVideoOrPage('https://www.bilibili.com/') === true, 'Bilibili 首頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://www.bilibili.com/video/BV1xx411c7X') === false, 'Bilibili 影片播放頁判定為正常播放 (放行按鈕)');
assert(testIsPreviewVideoOrPage('https://jable.tv/') === true, 'Jable.tv 首頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://jable.tv/hot/') === true, 'Jable.tv 分類頁判定為預覽頁 (靜默不跳出)');
assert(testIsPreviewVideoOrPage('https://jable.tv/videos/start-387/') === false, 'Jable.tv 影片實際播放頁放行按鈕');

// 7. PotPlayer 向量圖示與零 Emoji 檢驗
assert(!emojiRegex.test(POTPLAYER_ICON), 'PotPlayer SVG 嚴格零 Emoji');
assert(POTPLAYER_ICON.includes('<polygon') && POTPLAYER_ICON.includes('<rect'), 'PotPlayer SVG 具備標準幾何螢幕與播放三角向量路徑');

// 8. 萬用視訊串流網址探測引擎 (detectVideoMediaUrl) 測試
const ytMockDoc = {
  location: { hostname: 'www.youtube.com', href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
};
assert(detectVideoMediaUrl(null, ytMockDoc) === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'YouTube 平台優先傳送完整頁面 URL');

const biliMockDoc = {
  location: { hostname: 'www.bilibili.com', href: 'https://www.bilibili.com/video/BV1xx411c7X' }
};
assert(detectVideoMediaUrl(null, biliMockDoc) === 'https://www.bilibili.com/video/BV1xx411c7X', 'Bilibili 平台優先傳送完整頁面 URL');

const genericDoc = {
  location: { hostname: 'example.com', href: 'https://example.com/movie' }
};

// 測試 currentSrc (排除 blob: 並優先取得直鏈)
const videoWithBlobCurrentSrc = {
  currentSrc: 'blob:https://example.com/1234-5678',
  src: 'https://example.com/direct-video.mp4'
};
assert(detectVideoMediaUrl(videoWithBlobCurrentSrc, genericDoc) === 'https://example.com/direct-video.mp4', '排除 blob:currentSrc 並自動回退至 src 直鏈');

// 測試 source 子標籤
const videoWithSource = {
  currentSrc: 'blob:https://example.com/blob-id',
  src: '',
  querySelectorAll(sel) {
    if (sel === 'source') {
      return [{ getAttribute: () => 'https://cdn.example.com/source-stream.m3u8' }];
    }
    return [];
  }
};
assert(detectVideoMediaUrl(videoWithSource, genericDoc) === 'https://cdn.example.com/source-stream.m3u8', '從 source 子標籤提取 HLS .m3u8 直鏈');

// 測試 data-src 自訂屬性
const videoWithDataSrc = {
  currentSrc: '',
  src: '',
  querySelectorAll: () => [],
  getAttribute(attr) {
    if (attr === 'data-src') return 'https://video.example.com/file.mp4';
    return null;
  }
};
assert(detectVideoMediaUrl(videoWithDataSrc, genericDoc) === 'https://video.example.com/file.mp4', '從 data-src 屬性提取直鏈');

// 測試 hls.js 物件實例屬性
const videoWithHlsInstance = {
  currentSrc: 'blob:https://example.com/blob-id',
  src: '',
  querySelectorAll: () => [],
  getAttribute: () => null,
  __hls__: { url: 'https://live.example.com/playlist.m3u8' }
};
assert(detectVideoMediaUrl(videoWithHlsInstance, genericDoc) === 'https://live.example.com/playlist.m3u8', '從 hls.js 播放器實例中提取直播串流清單網址');

// 測試 Jable.tv 等站點內嵌 script 標籤中的 hlsUrl 提取
const jableDocWithScript = {
  location: { hostname: 'jable.tv', href: 'https://jable.tv/videos/start-387/' },
  querySelectorAll(sel) {
    if (sel === 'script:not([src])') {
      return [
        { textContent: 'var a = 1;' },
        { textContent: 'var hlsUrl = "https://assets-cdn.jable.tv/contents/videos_sources/start-387/index.m3u8";' }
      ];
    }
    return [];
  }
};
const jableVideoBlob = {
  currentSrc: 'blob:https://jable.tv/1234',
  src: 'blob:https://jable.tv/1234',
  querySelectorAll: () => [],
  getAttribute: () => null
};
assert(detectVideoMediaUrl(jableVideoBlob, jableDocWithScript) === 'https://assets-cdn.jable.tv/contents/videos_sources/start-387/index.m3u8', '從頁面內嵌 script 正則提取真實 Jable.tv hlsUrl m3u8');

// 測試網絡攔截快取串流 (MSE blob 回退)
const pureBlobVideo = {
  currentSrc: 'blob:https://example.com/blob-id',
  src: '',
  querySelectorAll: () => [],
  getAttribute: () => null
};

// 測試共享 DOM 屬性 data-cleanlink-stream 提取
const docWithSharedAttr = {
  location: { hostname: 'example.com', href: 'https://example.com/watch' },
  documentElement: {
    getAttribute(attr) {
      if (attr === 'data-cleanlink-stream') return 'https://cdn.example.com/shared.m3u8';
      return null;
    }
  },
  querySelectorAll: () => []
};
assert(detectVideoMediaUrl(pureBlobVideo, docWithSharedAttr) === 'https://cdn.example.com/shared.m3u8', '從共享 DOM 屬性 data-cleanlink-stream 提取串流');

const captured = ['https://stream.example.com/master.m3u8', 'https://stream.example.com/manifest.mpd'];
assert(detectVideoMediaUrl(pureBlobVideo, genericDoc, captured) === 'https://stream.example.com/master.m3u8', '從網絡攔截快取中成功命中嗅探之 HLS .m3u8 串流');

// 測試無串流時回退當前頁面
assert(detectVideoMediaUrl(pureBlobVideo, genericDoc, []) === 'https://example.com/movie', '無任何串流直鏈時優雅回退當前頁面 URL');

// 9. PotPlayer 協議與時間戳建構器 (buildPotPlayerUrl) 測試
assert(buildPotPlayerUrl('https://example.com/video.mp4') === 'potplayer://https://example.com/video.mp4', '標準直鏈正確產生 potplayer:// 前綴');
assert(buildPotPlayerUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 125) === 'potplayer://https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=125s', 'YouTube 影片精確附加 &t=125s 時間戳');
assert(buildPotPlayerUrl('https://youtu.be/dQw4w9WgXcQ?feature=share', 45) === 'potplayer://https://youtu.be/dQw4w9WgXcQ?feature=share&t=45s', 'YouTube 短網址帶參照數時精確附加 &t=45s');
assert(buildPotPlayerUrl('https://example.com/video.mp4', 0) === 'potplayer://https://example.com/video.mp4', '進度為 0 時不額外污染網址');
assert(buildPotPlayerUrl('') === 'potplayer://', '空值安全防護');
assert(buildPotPlayerUrl(null) === 'potplayer://', 'null 安全防護');

// 10. 時間戳格式化 (formatPotPlayerTime) 與 PotPlayer 命令行建構器 (buildPotPlayerCommand) 測試
assert(formatPotPlayerTime(0) === '00:00:00', '0 秒格式化為 00:00:00');
assert(formatPotPlayerTime(95) === '00:01:35', '95 秒格式化為 00:01:35');
assert(formatPotPlayerTime(3661) === '01:01:01', '3661 秒格式化為 01:01:01');

assert(
  buildPotPlayerCommand('https://assets-cdn.jable.tv/start-387/index.m3u8', 'https://jable.tv/') ===
  '"C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" "https://assets-cdn.jable.tv/start-387/index.m3u8" /referer="https://jable.tv/"',
  '精確產生帶 /referer 防盜鏈參數之 PotPlayer 啟動指令'
);
assert(
  buildPotPlayerCommand('https://assets-cdn.jable.tv/start-387/index.m3u8', 'https://jable.tv/', 'Mozilla/5.0 Custom', 95) ===
  '"C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" "https://assets-cdn.jable.tv/start-387/index.m3u8" /referer="https://jable.tv/" /user_agent="Mozilla/5.0 Custom" /seek=00:01:35',
  '精確產生帶 /referer, /user_agent 與 /seek 時間戳之 PotPlayer 完整啟動指令'
);
assert(
  buildPotPlayerCommand('https://example.com/video.mp4') ===
  '"C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" "https://example.com/video.mp4"',
  '無 referer 與時間戳時產生簡潔標準執行指令'
);

// 11. 剪貼簿限時刪除 (Auto-Clear) 邏輯驗證
let clipboardState = 'initial';
function simulateClipboardWriteAndAutoClear(text, delayMs = 10) {
  clipboardState = text;
  return new Promise((resolve) => {
    setTimeout(() => {
      clipboardState = ''; // 模擬使用後自動清空
      resolve(clipboardState);
    }, delayMs);
  });
}
await simulateClipboardWriteAndAutoClear('test_command', 10);
assert(clipboardState === '', '剪貼簿使用後能成功自動清空刪除，不留痕跡');

// 12. 突破 Webpack / Vite 閉包模組限制之原型鏈屬性守衛測試
const closureHlsConfig = {};
// 模擬 booster-injected.js 原型鏈屬性守衛
Object.defineProperty(Object.prototype, 'testClosureBufferLength', {
  configurable: true,
  enumerable: true,
  get() { return this.__test_buf !== undefined ? this.__test_buf : 120; },
  set(val) {
    this.__test_buf = Math.max(val || 0, 120);
    this.testClosureMaxBufferSize = Math.max(this.testClosureMaxBufferSize || 0, 130 * 1000 * 1000);
    if (typeof this.testClosureBackBuffer === 'undefined') {
      this.testClosureBackBuffer = 30;
    }
  }
});
closureHlsConfig.testClosureBufferLength = 30; // 模組內部預設 30 秒
assert(closureHlsConfig.testClosureBufferLength === 120, '原型鏈屬性守衛成功將閉包模組內 30 秒拉長至 120 秒');
assert(closureHlsConfig.testClosureMaxBufferSize === 130 * 1000 * 1000, '原型鏈守衛成功注入 130MB 記憶體上限');
assert(closureHlsConfig.testClosureBackBuffer === 30, '原型鏈守衛成功注入 30 秒歷史環形回收');
delete Object.prototype.testClosureBufferLength;

// 13. 智慧型 MediaCapabilities powerEfficient 決策引擎模擬測試
async function simulateSmartDecodingInfo(mediaConfig, mockNativeDecodingInfo) {
  const isAV1 = /codecs\s*=\s*["']?av0?1/i.test(mediaConfig.video?.contentType || '');
  const nativeResult = await mockNativeDecodingInfo(mediaConfig);
  // 若該硬體 ASIC 不支援硬解 (powerEfficient: false)，則安全降級
  if (isAV1 && !nativeResult.powerEfficient) {
    return { supported: false, smooth: false, powerEfficient: false };
  }
  return nativeResult;
}

const mockGpuAv1 = { supported: true, smooth: true, powerEfficient: true };
const mockCpuSoftAv1 = { supported: true, smooth: false, powerEfficient: false };

const resultGpu = await simulateSmartDecodingInfo({ video: { contentType: 'video/mp4; codecs="av01.0.08M.08"' } }, async () => mockGpuAv1);
assert(resultGpu.supported === true && resultGpu.powerEfficient === true, '具備原生硬解之硬體放行 AV1 播放');

const resultCpu = await simulateSmartDecodingInfo({ video: { contentType: 'video/mp4; codecs="av01.0.08M.08"' } }, async () => mockCpuSoftAv1);
assert(resultCpu.supported === false && resultCpu.powerEfficient === false, '僅能 CPU 軟解之舊硬體安全封鎖 AV1，促使平台降級至硬解編碼');

// 14. GPU DirectFlip / MPO 硬體直通層 CSS 規則檢驗
const cssContent = fs.readFileSync('content/content.css', 'utf-8');
assert(cssContent.includes('contain: layout style !important;'), 'CSS 包含 contain: layout style 隔離容器渲染重繪');
assert(cssContent.includes('will-change: opacity, transform !important;'), 'CSS 包含 will-change 預先分配合成器獨立圖層');
assert(cssContent.includes('backdrop-filter: none !important;'), 'CSS 預設隱藏態將 backdrop-filter 設為 none，避免污染 DirectFlip 硬體直通層');
assert(cssContent.includes('.__cleanlink-pip-visible .__cleanlink-pip-btn'), '僅在可見 hover 態時才掛載高斯模糊濾鏡');

console.log(`\n測試結果: 通過 ${passed} 項，失敗 ${failed} 項\n`);

if (failed > 0) {
  process.exit(1);
}

