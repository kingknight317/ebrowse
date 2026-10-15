/**
 * CleanLink & QuickShare - 影音加速助手 (Stream Booster - MAIN World Injected)
 * 運行於網頁 MAIN 執行環境 (document_start)，直接與瀏覽器影音 API 及播放器交互
 * 方案 2: 優先 GPU 硬解，阻止高耗能 AV1 軟解請求 (智慧保留 ASIC 原生硬解，絕對不阻斷 VP9)
 * 方案 3: 跳過 ABR 階梯試探，鎖定使用者在介面點選之首選畫質 (安全對接 YouTube API)
 * 方案 4: 擴展開源 Hls.js/Dash.js 播放器前瞻快取至 120 秒與 130MB (非 YouTube 專屬)
 */

(function () {
  'use strict';

  const isYouTube = /(?:^|\.)youtube\.com$|(?:^|\.)youtu\.be$/i.test(window.location.hostname);

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

  // 自我修復：清除過往版本可能意外寫入 YouTube localStorage 之損壞資料，防止 YouTube 播放器啟動時 SyntaxError 崩潰
  if (isYouTube) {
    try {
      const corruptCheck = localStorage.getItem('yt-player-quality');
      if (corruptCheck && (corruptCheck.includes('"data":"hd') || corruptCheck.includes('"data":"default"'))) {
        localStorage.removeItem('yt-player-quality');
      }
    } catch (_) {}
  }

  // 監聽來自 ISOLATED content script 之動態配置同步
  window.addEventListener('__STREAM_BOOSTER_SYNC__', function (event) {
    if (event && event.detail) {
      Object.assign(config, event.detail);
      try {
        sessionStorage.setItem('__CLEANLINK_BOOSTER_CONFIG__', JSON.stringify(config));
      } catch (_) {}
      if (isYouTube) {
        applyYouTubeQuality();
      }
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

  /* -------------------------------------------------------------
   * 方案 2：智慧型 GPU 硬體解碼決策引擎 (MediaCapabilities / MSE)
   * 嚴格規範：僅針對無 ASIC 硬解單元之 AV1 促使降級，絕對不阻斷 VP9 或 H.264！
   * ----------------------------------------------------------- */
  try {
    if (navigator.mediaCapabilities && typeof navigator.mediaCapabilities.decodingInfo === 'function') {
      const origDecodingInfo = navigator.mediaCapabilities.decodingInfo.bind(navigator.mediaCapabilities);
      navigator.mediaCapabilities.decodingInfo = async function (mediaConfig) {
        if (!config.enableStreamBooster || !config.boosterDisableAV1) {
          return origDecodingInfo(mediaConfig);
        }

        const contentType = mediaConfig?.video?.contentType || '';

        // 僅針對 AV1 軟解降載，絕對不可阻斷 VP9！
        if (isAV1(contentType)) {
          try {
            const result = await origDecodingInfo(mediaConfig);
            // 智慧模式：若硬體具備原生硬解能力 (powerEfficient: true)，則允許播放高清 AV1
            if (result && result.supported && result.powerEfficient) {
              return result;
            }
          } catch (_) {}
          // 缺乏硬體專用單元 (需 CPU 軟解) 時，回傳不支援促使 YouTube 降級推送具備硬解之 VP9/H.264
          return { supported: false, smooth: false, powerEfficient: false };
        }

        // VP9 與所有其他編碼：100% 放行原生硬體支援度
        return origDecodingInfo(mediaConfig);
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
   * 方案 3：跳過 ABR 階梯試探，鎖定首選畫質 (YouTube 安全對接)
   * 絕不竄改 localStorage 或強制鎖死 setPlaybackQualityRange，支援平滑降級
   * ----------------------------------------------------------- */
  let lastQualityApplied = '';

  function applyYouTubeQuality() {
    if (!isYouTube || !config.enableStreamBooster || !config.boosterQuality || config.boosterQuality === 'auto') {
      return;
    }

    const ytTarget = mapQuality(config.boosterQuality);
    const player = document.getElementById('movie_player');
    if (!player) return;

    try {
      // 優先查詢播放器支援之可用畫質列表，防止鎖死在不存在的解析度上 (如影片最高僅 720p 或直立 Shorts)
      if (typeof player.getAvailableQualityLevels === 'function') {
        const levels = player.getAvailableQualityLevels();
        if (Array.isArray(levels) && levels.length > 0) {
          const target = levels.includes(ytTarget) ? ytTarget : levels[0];
          if (target && target !== lastQualityApplied && typeof player.setPlaybackQuality === 'function') {
            player.setPlaybackQuality(target);
            lastQualityApplied = target;
          }
        }
      } else if (typeof player.setPlaybackQuality === 'function') {
        player.setPlaybackQuality(ytTarget);
      }
    } catch (_) {}
  }

  if (isYouTube) {
    // 監聽 YouTube SPA 路由切換事件
    window.addEventListener('yt-navigate-finish', function () {
      lastQualityApplied = '';
      setTimeout(applyYouTubeQuality, 200);
      setTimeout(applyYouTubeQuality, 800);
    });

    window.addEventListener('spfdone', function () {
      lastQualityApplied = '';
      setTimeout(applyYouTubeQuality, 200);
    });

    // 監聽播放開始事件
    document.addEventListener('playing', function (e) {
      if (e.target && e.target.tagName === 'VIDEO') {
        applyYouTubeQuality();
      }
    }, true);
  }

  /* -------------------------------------------------------------
   * 方案 4：開源播放器前瞻快取擴展 (Hls.js / Dash.js)
   * 僅在非 YouTube 網站執行，杜絕任何對 YouTube 核心架構之干擾
   * ----------------------------------------------------------- */
  if (!isYouTube) {
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
    // 嚴格宣告 enumerable: false，絕不污染 for..in 與 Object.keys
    try {
      const desc = Object.getOwnPropertyDescriptor(Object.prototype, 'maxBufferLength');
      if (!desc || desc.configurable) {
        Object.defineProperty(Object.prototype, 'maxBufferLength', {
          configurable: true,
          enumerable: false, // 嚴格不可列舉，杜絕遍歷污染
          get: function () {
            return this.__cl_maxBufferLength;
          },
          set: function (val) {
            if (!this || typeof this !== 'object') return;
            if (Object.isExtensible && !Object.isExtensible(this)) return; // 凍結物件安全退出，防止拋錯
            try {
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
            } catch (_) {}
          }
        });
      }
    } catch (_) {}
  }

  /* -------------------------------------------------------------
   * 方案 5：全網影音串流嗅探 (HLS .m3u8, DASH .mpd, MP4/WebM 直鏈)
   * 僅針對需嗅探之一般站點，YouTube 原生支援直傳頁面 URL，跳過攔截
   * ----------------------------------------------------------- */
  window.__CLEANLINK_CAPTURED_STREAMS__ = window.__CLEANLINK_CAPTURED_STREAMS__ || [];

  function recordMediaStream(url) {
    if (isYouTube) return; // YouTube 免除嗅探與 DOM 插入
    if (!url || typeof url !== 'string') return;
    if (url.startsWith('blob:') || url.startsWith('data:')) return;
    try {
      const parsed = new URL(url, window.location.href).href;
      if (
        /\.(m3u8|mpd|mp4|webm|flv)(\?|#|$)/i.test(parsed) ||
        /(master|playlist|manifest|chunklist)\.m3u8/i.test(parsed)
      ) {
        if (!window.__CLEANLINK_CAPTURED_STREAMS__.includes(parsed)) {
          window.__CLEANLINK_CAPTURED_STREAMS__.unshift(parsed);
          if (window.__CLEANLINK_CAPTURED_STREAMS__.length > 30) {
            window.__CLEANLINK_CAPTURED_STREAMS__.pop();
          }

          try {
            if (document.documentElement) {
              document.documentElement.setAttribute('data-cleanlink-stream', parsed);
            }
          } catch (_) {}

          // 自動對跨網域媒體 CDN 分片伺服器注入 preconnect 提升首次交握速度 (非 YouTube)
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

          try {
            window.postMessage({ type: '__CLEANLINK_STREAM_DETECTED__', url: parsed }, '*');
          } catch (_) {}

          window.dispatchEvent(new CustomEvent('__CLEANLINK_STREAM_DETECTED__', { detail: { url: parsed } }));
        }
      }
    } catch (_) {}
  }

  if (!isYouTube) {
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
  }
})();
