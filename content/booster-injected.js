/**
 * CleanLink & QuickShare - 影音加速助手 (Stream Booster - MAIN World Injected)
 * 運行於網頁 MAIN 執行環境 (document_start)，直接與瀏覽器影音 API 及播放器交互
 * 方案 2: 優先 GPU 硬解，阻止高耗能 AV1 軟解請求
 * 方案 3: 跳過 ABR 階梯試探，鎖定使用者在介面點選之首選畫質
 * 方案 4: 擴展開源 Hls.js/Dash.js 播放器前瞻快取至 120 秒
 */

(function () {
  'use strict';

  // 預設配置
  let config = {
    enableStreamBooster: true,
    boosterQuality: '1080p',
    boosterDisableAV1: true,
    boosterExpandHLS: true
  };

  // 嘗試由 sessionStorage 恢復最近快取之配置，達成零延遲即時攔截
  try {
    const cached = sessionStorage.getItem('__CLEANLINK_BOOSTER_CONFIG__');
    if (cached) {
      Object.assign(config, JSON.parse(cached));
    }
  } catch (_) {}

  // 監聽來自 ISOLATED content script 之動態配置同步
  window.addEventListener('__STREAM_BOOSTER_SYNC__', function (event) {
    if (event && event.detail) {
      Object.assign(config, event.detail);
      try {
        sessionStorage.setItem('__CLEANLINK_BOOSTER_CONFIG__', JSON.stringify(config));
      } catch (_) {}
      applyYouTubeQuality();
    }
  });

  // 畫質字串映射表
  const YT_QUALITY_MAP = {
    auto: 'default',
    '720p': 'hd720',
    '1080p': 'hd1080',
    '1440p': 'hd1440',
    '2160p': 'hd2160'
  };

  function mapQuality(q) {
    return YT_QUALITY_MAP[q] || 'default';
  }

  function isAV1(type) {
    if (typeof type !== 'string') return false;
    return /codecs\s*=\s*["']?av0?1/i.test(type);
  }

  function isVP9(type) {
    if (typeof type !== 'string') return false;
    return /codecs\s*=\s*["']?vp0?9/i.test(type);
  }

  /* -------------------------------------------------------------
   * 方案 2：智慧型 GPU 硬體解碼決策引擎 (MediaCapabilities / MSE)
   * ----------------------------------------------------------- */
  try {
    if (navigator.mediaCapabilities && typeof navigator.mediaCapabilities.decodingInfo === 'function') {
      const origDecodingInfo = navigator.mediaCapabilities.decodingInfo.bind(navigator.mediaCapabilities);
      navigator.mediaCapabilities.decodingInfo = async function (mediaConfig) {
        if (!config.enableStreamBooster) {
          return origDecodingInfo(mediaConfig);
        }

        const contentType = mediaConfig?.video?.contentType || '';

        // 1. 若開啟強制封鎖 AV1，直接回傳不支援
        if (config.boosterDisableAV1 && isAV1(contentType)) {
          return { supported: false, smooth: false, powerEfficient: false };
        }

        // 2. 智慧模式：實測底層硬體 ASIC 能力，若為高負擔 CPU 軟解則促使安全降級至硬解編碼
        try {
          const result = await origDecodingInfo(mediaConfig);
          if (config.boosterDisableAV1 && !result.powerEfficient && (isAV1(contentType) || isVP9(contentType))) {
            return { supported: false, smooth: false, powerEfficient: false };
          }
          return result;
        } catch (_) {
          return origDecodingInfo(mediaConfig);
        }
      };
    }

    if (typeof window.MediaSource !== 'undefined' && typeof window.MediaSource.isTypeSupported === 'function') {
      const origIsTypeSupported = window.MediaSource.isTypeSupported.bind(window.MediaSource);
      window.MediaSource.isTypeSupported = function (type) {
        if (config.enableStreamBooster && config.boosterDisableAV1 && isAV1(type)) {
          return false; // 偽裝不支援 AV1，促使平台推送具備原生硬解之 VP9 / H.264
        }
        return origIsTypeSupported(type);
      };
    }

    if (window.HTMLMediaElement && window.HTMLMediaElement.prototype && typeof window.HTMLMediaElement.prototype.canPlayType === 'function') {
      const origCanPlayType = window.HTMLMediaElement.prototype.canPlayType;
      window.HTMLMediaElement.prototype.canPlayType = function (type) {
        if (config.enableStreamBooster && config.boosterDisableAV1 && isAV1(type)) {
          return ''; // 阻止瀏覽器宣告支援 AV1
        }
        return origCanPlayType.apply(this, arguments);
      };
    }
  } catch (err) {
    console.warn('[StreamBooster] 無法安裝硬解攔截器:', err);
  }

  /* -------------------------------------------------------------
   * 方案 3：跳過 ABR 階梯試探，鎖定首選畫質 (YouTube & 通用播放器)
   * ----------------------------------------------------------- */
  function applyYouTubeQuality() {
    if (!config.enableStreamBooster || !config.boosterQuality || config.boosterQuality === 'auto') {
      return;
    }

    const ytTarget = mapQuality(config.boosterQuality);

    // 1. 預先寫入 YouTube 內部 localStorage，讓播放器初始化時直接讀取目標畫質
    try {
      localStorage.setItem('yt-player-quality', JSON.stringify({
        data: ytTarget,
        creation: Date.now()
      }));
    } catch (_) {}

    // 2. 若 DOM 播放器實例已存在，直接呼叫 API 鎖定畫質
    const player = document.getElementById('movie_player');
    if (player && typeof player.setPlaybackQualityRange === 'function') {
      try {
        player.setPlaybackQualityRange(ytTarget, ytTarget);
        if (typeof player.setPlaybackQuality === 'function') {
          player.setPlaybackQuality(ytTarget);
        }
      } catch (_) {}
    }
  }

  // 監聽 YouTube SPA 路由切換事件
  window.addEventListener('yt-navigate-finish', function () {
    setTimeout(applyYouTubeQuality, 100);
    setTimeout(applyYouTubeQuality, 500);
  });

  window.addEventListener('spfdone', function () {
    setTimeout(applyYouTubeQuality, 100);
  });

  // 監聽頁面 video 元素播放事件
  document.addEventListener('playing', function (e) {
    if (e.target && e.target.tagName === 'VIDEO') {
      applyYouTubeQuality();
    }
  }, true);

  /* -------------------------------------------------------------
   * 方案 4：開源播放器前瞻快取擴展與閉包突破 (Hls.js / Dash.js)
   * ----------------------------------------------------------- */
  function patchHlsConstructor(OriginalHls) {
    if (!OriginalHls || OriginalHls.__stream_booster_patched) return OriginalHls;

    const PatchedHls = function (userConfig) {
      const cfg = userConfig || {};
      if (config.enableStreamBooster && config.boosterExpandHLS) {
        cfg.maxBufferLength = Math.max(cfg.maxBufferLength || 0, 120);
        cfg.maxMaxBufferLength = Math.max(cfg.maxMaxBufferLength || 0, 300);
        cfg.maxBufferSize = Math.max(cfg.maxBufferSize || 0, 130 * 1000 * 1000); // 130MB 容納高清雙分鐘快取
        if (typeof cfg.backBufferLength === 'undefined' || cfg.backBufferLength === Infinity) {
          cfg.backBufferLength = 30; // 環形回收 30 秒前歷史切片，杜絕 QuotaExceededError
        }
        if (typeof cfg.startFragPrefetch === 'undefined') {
          cfg.startFragPrefetch = true;
        }
        if (typeof cfg.abrEwmaDefaultEstimate === 'undefined' || cfg.abrEwmaDefaultEstimate < 8000000) {
          cfg.abrEwmaDefaultEstimate = 8000000; // 8 Mbps 初始頻寬，直攻 1080p
        }
        if (typeof cfg.highBufferWatchdogPeriod === 'undefined') {
          cfg.highBufferWatchdogPeriod = 3;
        }
      }
      return new OriginalHls(cfg);
    };

    PatchedHls.prototype = OriginalHls.prototype;
    PatchedHls.__stream_booster_patched = true;

    // 複製靜態方法與常數 (例如 Hls.Events, Hls.isSupported)
    try {
      for (const prop of Object.getOwnPropertyNames(OriginalHls)) {
        if (prop !== 'prototype' && prop !== 'name' && prop !== 'length') {
          PatchedHls[prop] = OriginalHls[prop];
        }
      }
    } catch (_) {}

    try {
      const origLoadSource = PatchedHls.prototype.loadSource;
      if (typeof origLoadSource === 'function') {
        PatchedHls.prototype.loadSource = function (url) {
          recordMediaStream(url);
          return origLoadSource.apply(this, arguments);
        };
      }
    } catch (_) {}

    return PatchedHls;
  }

  // 1. 攔截全域 window.Hls
  try {
    let _hlsInstance = window.Hls;
    if (_hlsInstance) {
      window.Hls = patchHlsConstructor(_hlsInstance);
    } else {
      Object.defineProperty(window, 'Hls', {
        configurable: true,
        enumerable: true,
        get: function () {
          return _hlsInstance;
        },
        set: function (val) {
          _hlsInstance = patchHlsConstructor(val);
        }
      });
    }
  } catch (err) {
    console.warn('[StreamBooster] 無法攔截 Hls.js:', err);
  }

  // 2. 突破 Webpack / Vite 閉包模組限制之原型鏈屬性守衛
  try {
    const desc = Object.getOwnPropertyDescriptor(Object.prototype, 'maxBufferLength');
    if (!desc || desc.configurable) {
      Object.defineProperty(Object.prototype, 'maxBufferLength', {
        configurable: true,
        enumerable: true,
        get: function () {
          return this.__cl_maxBufferLength !== undefined ? this.__cl_maxBufferLength : 120;
        },
        set: function (val) {
          if (config.enableStreamBooster && config.boosterExpandHLS) {
            this.__cl_maxBufferLength = Math.max(val || 0, 120);
            this.maxMaxBufferLength = Math.max(this.maxMaxBufferLength || 0, 300);
            this.maxBufferSize = Math.max(this.maxBufferSize || 0, 130 * 1000 * 1000);
            if (typeof this.backBufferLength === 'undefined' || this.backBufferLength === Infinity) {
              this.backBufferLength = 30; // 30秒歷史緩衝環形回收
            }
            if (typeof this.startFragPrefetch === 'undefined') {
              this.startFragPrefetch = true;
            }
            if (typeof this.abrEwmaDefaultEstimate === 'undefined' || this.abrEwmaDefaultEstimate < 8000000) {
              this.abrEwmaDefaultEstimate = 8000000;
            }
          } else {
            this.__cl_maxBufferLength = val;
          }
        }
      });
    }
  } catch (_) {}

  /* -------------------------------------------------------------
   * 方案 5：全網影音串流嗅探 (HLS .m3u8, DASH .mpd, MP4/WebM 直鏈)
   * ----------------------------------------------------------- */
  window.__CLEANLINK_CAPTURED_STREAMS__ = window.__CLEANLINK_CAPTURED_STREAMS__ || [];

  function recordMediaStream(url) {
    if (!url || typeof url !== 'string') return;
    if (url.startsWith('blob:') || url.startsWith('data:')) return;
    try {
      const parsed = new URL(url, window.location.href).href;
      // 識別 HLS (.m3u8)、DASH (.mpd)、或標準視訊直鏈 (.mp4, .webm)
      if (
        /\.(m3u8|mpd|mp4|webm|flv)(\?|#|$)/i.test(parsed) ||
        /(master|playlist|manifest|chunklist)\.m3u8/i.test(parsed)
      ) {
        if (!window.__CLEANLINK_CAPTURED_STREAMS__.includes(parsed)) {
          window.__CLEANLINK_CAPTURED_STREAMS__.unshift(parsed);
          if (window.__CLEANLINK_CAPTURED_STREAMS__.length > 30) {
            window.__CLEANLINK_CAPTURED_STREAMS__.pop();
          }

          // 1. 同步寫入共享 DOM 屬性，供 ISOLATED 執行環境即時讀取
          try {
            if (document.documentElement) {
              document.documentElement.setAttribute('data-cleanlink-stream', parsed);
            }
          } catch (_) {}

          // 2. 自動對跨網域媒體 CDN 分片伺服器注入 preconnect 提升首次交握速度
          try {
            const streamOrigin = new URL(parsed).origin;
            if (streamOrigin && streamOrigin !== window.location.origin) {
              if (document.head && !document.querySelector(`link[rel="preconnect"][href^="${streamOrigin}"]`)) {
                const preLink = document.createElement('link');
                preLink.rel = 'preconnect';
                preLink.href = streamOrigin;
                preLink.crossOrigin = 'anonymous';
                document.head.appendChild(preLink);
              }
            }
          } catch (_) {}

          // 3. 透過 postMessage 進行雙向安全廣播
          try {
            window.postMessage({ type: '__CLEANLINK_STREAM_DETECTED__', url: parsed }, '*');
          } catch (_) {}

          // 4. 派發原生自訂事件
          window.dispatchEvent(new CustomEvent('__CLEANLINK_STREAM_DETECTED__', { detail: { url: parsed } }));
        }
      }
    } catch (_) {}
  }

  // 1. Hook window.fetch
  try {
    if (typeof window.fetch === 'function') {
      const origFetch = window.fetch;
      window.fetch = function (input, init) {
        if (typeof input === 'string') {
          recordMediaStream(input);
        } else if (input && input.url) {
          recordMediaStream(input.url);
        }
        return origFetch.apply(this, arguments);
      };
    }
  } catch (_) {}

  // 2. Hook XMLHttpRequest.prototype.open
  try {
    if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
      const origOpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function (method, url) {
        recordMediaStream(url);
        return origOpen.apply(this, arguments);
      };
    }
  } catch (_) {}

  // 3. 監控頁面全域串流變數 (如 Jable.tv 等站點的 window.hlsUrl)
  try {
    let _hlsUrl = window.hlsUrl;
    if (_hlsUrl) recordMediaStream(_hlsUrl);
    Object.defineProperty(window, 'hlsUrl', {
      configurable: true,
      enumerable: true,
      get: function () {
        return _hlsUrl;
      },
      set: function (val) {
        _hlsUrl = val;
        recordMediaStream(val);
      }
    });
  } catch (_) {}
})();

