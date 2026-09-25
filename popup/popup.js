/**
 * CleanLink & QuickShare - Popup Logic with Snappy Morphicons Animations
 */
import { cleanUrl } from '../lib/cleaner.js';
import {
  formatMarkdown,
  formatQuote,
  formatBatchUrls,
  formatBatchMarkdown,
  formatBatchQuotes,
  copyToClipboard
} from '../lib/formatter.js';
import { createMorph } from '../lib/morphicons/dom.js';
import { initI18n, t, applyTranslations } from '../lib/i18n.js';

// SVG Icon Paths (相容 24x24 座標系)
const ICONS = {
  // 按鈕 1: Clean URL (初始: Link -> 點擊: Arrow Right)
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',

  // 按鈕 2: Markdown (初始: File/Doc -> 點擊: Tag)
  markdown: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  tag: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2zM7 7h.01',

  // 按鈕 3: Quote (初始: Quote/Message -> 點擊: Code)
  quote: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6'
};

let userSettings = {
  cleanAmazon: true,
  cleanShopee: true,
  cleanMomo: true,
  cleanPchome: true,
  cleanEbay: true,
  cleanAliexpress: true,
  cleanTaobao: true,
  cleanCoupang: true,
  cleanJd: true,
  cleanSteam: true,
  cleanGoogle: true,
  cleanTwitter: true,
  cleanReddit: true,
  cleanBilibili: true,
  cleanInstagram: true,
  cleanThreads: true,
  cleanSpotify: true,
  cleanNetflix: true,
  filterPII: true,
  globalAdaptive: true,
  preserveYtTime: false,
  enableTextFragment: true,
  enableMediaOriginal: true,
  enableStreamBooster: true,
  boosterQuality: '1080p',
  boosterDisableAV1: true,
  boosterExpandHLS: true
};

let currentTab = null;
let currentCleaned = null;
let ytCurrentTime = null;

let isBatchMode = false;
let windowTabs = [];
let selectedTabIds = new Set();

let morph1 = null;
let morph2 = null;
let morph3 = null;

const elements = {
  piiAlert: document.getElementById('pii-alert'),
  piiDetails: document.getElementById('pii-details'),
  cleanUrlDisplay: document.getElementById('clean-url-display'),
  originalUrlDisplay: document.getElementById('original-url-display'),
  charSavings: document.getElementById('char-savings'),
  tagsSection: document.getElementById('tags-section'),
  tagsContainer: document.getElementById('tags-container'),
  ytOptions: document.getElementById('yt-options'),
  ytTimestampToggle: document.getElementById('yt-timestamp-toggle'),
  ytTimeText: document.getElementById('yt-time-text'),
  mediaOptions: document.getElementById('media-options'),
  mediaOrigToggle: document.getElementById('media-orig-toggle'),
  streamBoosterCard: document.getElementById('stream-booster-card'),
  boosterToggle: document.getElementById('booster-toggle'),
  boosterStatusLabel: document.getElementById('booster-status-label'),
  boosterPillsGroup: document.getElementById('booster-pills-group'),
  boosterPills: document.querySelectorAll('.booster-pill'),
  btnCopyUrl: document.getElementById('btn-copy-url'),
  btnCopyMarkdown: document.getElementById('btn-copy-markdown'),
  btnCopyQuote: document.getElementById('btn-copy-quote'),
  btnSettings: document.getElementById('btn-settings'),
  footerStatus: document.getElementById('footer-status'),
  btnBatchToggle: document.getElementById('btn-batch-toggle'),
  batchSection: document.getElementById('batch-section'),
  batchSelectAll: document.getElementById('batch-select-all'),
  batchCountBadge: document.getElementById('batch-count-badge'),
  batchTabsList: document.getElementById('batch-tabs-list'),
  popupContainer: document.querySelector('.popup-container')
};

async function init() {
  try {
    initMorphicons();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      if (elements.cleanUrlDisplay) elements.cleanUrlDisplay.textContent = t('urlCard.cannotUse');
      return;
    }
    currentTab = tab;

    // 檢查受限頁面
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      if (elements.cleanUrlDisplay) elements.cleanUrlDisplay.textContent = t('urlCard.restricted');
      if (elements.originalUrlDisplay) elements.originalUrlDisplay.textContent = tab.url;
      return;
    }

    // 取得使用者偏好設定
    const stored = await chrome.storage.sync.get(userSettings);
    userSettings = { ...userSettings, ...stored };
    if (elements.ytTimestampToggle) {
      elements.ytTimestampToggle.checked = userSettings.preserveYtTime;
    }
    if (elements.mediaOrigToggle) {
      elements.mediaOrigToggle.checked = userSettings.enableMediaOriginal !== false;
    }

    // 影音加速助手狀態初始化
    if (elements.boosterToggle) {
      elements.boosterToggle.checked = userSettings.enableStreamBooster !== false;
      updateBoosterCardUI(userSettings.enableStreamBooster !== false, userSettings.boosterQuality || '1080p');
    }

    // YouTube 時間戳偵測
    if (tab.url.includes('youtube.com') || tab.url.includes('youtu.be')) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_YOUTUBE_CURRENT_TIME' });
        if (response && response.currentTime !== null) {
          ytCurrentTime = response.currentTime;
          elements.ytTimeText.textContent = `${ytCurrentTime}s`;
          elements.ytOptions.classList.remove('hidden');
        }
      } catch (e) {
        // 靜默忽略
      }
    }

    updateDisplay();
    setupEventListeners();
  } catch (err) {
    console.error('Popup init failed:', err);
  }
}

function initMorphicons() {
  try {
    const path1 = document.getElementById('path-icon-1');
    const path2 = document.getElementById('path-icon-2');
    const path3 = document.getElementById('path-icon-3');

    if (path1) morph1 = createMorph(path1, ICONS.link);
    if (path2) morph2 = createMorph(path2, ICONS.markdown);
    if (path3) morph3 = createMorph(path3, ICONS.quote);
  } catch (err) {
    console.error('Morphicons init failed:', err);
  }
}

function updateDisplay() {
  if (!currentTab || !currentTab.url) return;

  const preserveTime = elements.ytTimestampToggle ? elements.ytTimestampToggle.checked : false;
  let targetUrl = currentTab.url;

  if (preserveTime && ytCurrentTime !== null) {
    try {
      const u = new URL(targetUrl);
      u.searchParams.set('t', `${ytCurrentTime}s`);
      targetUrl = u.toString();
    } catch (e) {}
  }

  currentCleaned = cleanUrl(targetUrl, {
    ...userSettings,
    preserveTimestamp: preserveTime
  });

  if (elements.cleanUrlDisplay) elements.cleanUrlDisplay.textContent = currentCleaned.cleanUrl;
  if (elements.originalUrlDisplay) elements.originalUrlDisplay.textContent = currentCleaned.originalUrl;

  // 計算省下的字元比例 (若無省下字元則徹底隱藏，不顯示「已是最簡」)
  const origLen = currentCleaned.originalUrl.length;
  const cleanLen = currentCleaned.cleanUrl.length;
  if (elements.charSavings) {
    if (origLen > cleanLen) {
      const pct = Math.round(((origLen - cleanLen) / origLen) * 100);
      elements.charSavings.textContent = t('urlCard.savings', { pct });
      elements.charSavings.style.display = 'inline-block';
    } else {
      elements.charSavings.style.display = 'none';
    }
  }

  // 渲染 PII 警示
  if (currentCleaned.piiWarnings && currentCleaned.piiWarnings.length > 0) {
    if (elements.piiAlert) elements.piiAlert.classList.remove('hidden');
    if (elements.piiDetails) elements.piiDetails.textContent = t('pii.alertDetails', { params: currentCleaned.piiWarnings.join(', ') });
  } else {
    if (elements.piiAlert) elements.piiAlert.classList.add('hidden');
  }

  // 渲染清理標籤
  if (elements.tagsContainer && elements.tagsSection) {
    elements.tagsContainer.innerHTML = '';
    const allCleanedKeys = [
      ...(currentCleaned.removedParams || []),
      ...(currentCleaned.piiWarnings || [])
    ];

    if (allCleanedKeys.length > 0) {
      elements.tagsSection.style.display = 'flex';
      const uniqueKeys = [...new Set(allCleanedKeys)];
      uniqueKeys.slice(0, 6).forEach(k => {
        const tag = document.createElement('span');
        tag.className = 'tag-badge';
        if (currentCleaned.piiWarnings.includes(k)) {
          tag.classList.add('pii');
        }
        tag.textContent = k;
        elements.tagsContainer.appendChild(tag);
      });
      if (uniqueKeys.length > 6) {
        const moreTag = document.createElement('span');
        moreTag.className = 'tag-badge';
        moreTag.textContent = `+${uniqueKeys.length - 6}`;
        elements.tagsContainer.appendChild(moreTag);
      }
    } else {
      elements.tagsSection.style.display = 'none';
    }
  }
}

async function toggleBatchMode() {
  isBatchMode = !isBatchMode;
  if (isBatchMode) {
    elements.popupContainer?.classList.add('batch-mode');
    elements.btnBatchToggle?.classList.add('active');
    elements.batchSection?.classList.remove('hidden');
    await loadWindowTabs();
    if (elements.footerStatus) {
      elements.footerStatus.textContent = t('popup.footerStatusBatch');
    }
  } else {
    elements.popupContainer?.classList.remove('batch-mode');
    elements.btnBatchToggle?.classList.remove('active');
    elements.batchSection?.classList.add('hidden');
    if (elements.footerStatus) {
      elements.footerStatus.textContent = t('popup.footerStatusDefault');
    }
  }
}

async function loadWindowTabs() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    windowTabs = (tabs || []).filter(t => t.url && (t.url.startsWith('http://') || t.url.startsWith('https://')));
    selectedTabIds = new Set(windowTabs.map(t => t.id));
    renderBatchTabs();
  } catch (err) {
    console.error('Failed to query window tabs:', err);
  }
}

function updateBatchSelectionCount() {
  if (elements.batchCountBadge) {
    elements.batchCountBadge.textContent = t('popup.selectedCount', { selected: selectedTabIds.size, total: windowTabs.length });
  }
  if (elements.batchSelectAll) {
    elements.batchSelectAll.checked = selectedTabIds.size === windowTabs.length && windowTabs.length > 0;
  }
}

function renderBatchTabs() {
  if (!elements.batchTabsList) return;
  elements.batchTabsList.innerHTML = '';
  updateBatchSelectionCount();

  windowTabs.forEach(tab => {
    const item = document.createElement('label');
    item.className = 'batch-tab-item';
    if (currentTab && tab.id === currentTab.id) {
      item.classList.add('active-current');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'batch-tab-checkbox';
    checkbox.checked = selectedTabIds.has(tab.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedTabIds.add(tab.id);
      } else {
        selectedTabIds.delete(tab.id);
      }
      updateBatchSelectionCount();
    });

    item.appendChild(checkbox);

    if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')) {
      const img = document.createElement('img');
      img.className = 'batch-tab-favicon';
      img.src = tab.favIconUrl;
      img.onerror = () => { img.style.display = 'none'; };
      item.appendChild(img);
    } else {
      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('viewBox', '0 0 24 24');
      iconSvg.setAttribute('class', 'batch-tab-icon-fallback');
      iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>';
      item.appendChild(iconSvg);
    }

    const info = document.createElement('div');
    info.className = 'batch-tab-info';

    const title = document.createElement('div');
    title.className = 'batch-tab-title';
    title.textContent = tab.title || tab.url;

    let domain = '';
    try { domain = new URL(tab.url).hostname; } catch (e) {}
    const urlText = document.createElement('div');
    urlText.className = 'batch-tab-domain';
    urlText.textContent = domain || tab.url;

    info.appendChild(title);
    info.appendChild(urlText);
    item.appendChild(info);

    elements.batchTabsList.appendChild(item);
  });
}

async function handleCopy(type, buttonEl) {
  // 觸發 Snappy 彈簧變形動畫 (極速俐落)
  if (type === 'url' && morph1) {
    morph1.morphTo(ICONS.arrowRight, 'snappy');
  } else if (type === 'markdown' && morph2) {
    morph2.morphTo(ICONS.tag, 'snappy');
  } else if (type === 'quote' && morph3) {
    morph3.morphTo(ICONS.code, 'snappy');
  }

  let textToCopy = '';
  let htmlToCopy = null;

  // 批次匯出模式處理
  if (isBatchMode) {
    const selectedTabs = windowTabs.filter(t => selectedTabIds.has(t.id));
    if (selectedTabs.length === 0) {
      if (elements.footerStatus) elements.footerStatus.textContent = t('popup.noTabsSelected');
      setTimeout(() => {
        if (type === 'url' && morph1) morph1.morphTo(ICONS.link, 'snappy');
        if (type === 'markdown' && morph2) morph2.morphTo(ICONS.markdown, 'snappy');
        if (type === 'quote' && morph3) morph3.morphTo(ICONS.quote, 'snappy');
        if (elements.footerStatus) elements.footerStatus.textContent = '批次模式 · 點擊下方按鈕整批匯出 · 按 B 切換';
      }, 900);
      return;
    }

    const cleanedTabs = selectedTabs.map(t => {
      const res = cleanUrl(t.url, userSettings);
      return {
        title: t.title,
        url: res.cleanUrl
      };
    });

    switch (type) {
      case 'url':
        textToCopy = formatBatchUrls(cleanedTabs);
        break;
      case 'markdown':
        textToCopy = formatBatchMarkdown(cleanedTabs);
        break;
      case 'quote':
        const quoteData = formatBatchQuotes(cleanedTabs);
        textToCopy = quoteData.plainText;
        htmlToCopy = quoteData.html;
        break;
    }

    const success = await copyToClipboard(textToCopy, htmlToCopy);
    if (success && buttonEl) {
      buttonEl.classList.add('card-success');
      if (elements.footerStatus) {
        elements.footerStatus.textContent = t('popup.footerBatchSuccess', { count: cleanedTabs.length });
      }

      setTimeout(() => {
        buttonEl.classList.remove('card-success');
        if (elements.footerStatus) {
          elements.footerStatus.textContent = '批次模式 · 點擊下方按鈕整批匯出 · 按 B 切換';
        }
        if (type === 'url' && morph1) morph1.morphTo(ICONS.link, 'snappy');
        if (type === 'markdown' && morph2) morph2.morphTo(ICONS.markdown, 'snappy');
        if (type === 'quote' && morph3) morph3.morphTo(ICONS.quote, 'snappy');
      }, 1200);
    }
    return;
  }

  // 單一分頁模式
  if (!currentCleaned) return;

  switch (type) {
    case 'url':
      textToCopy = currentCleaned.cleanUrl;
      break;
    case 'markdown':
      textToCopy = formatMarkdown(currentTab.title, currentCleaned.cleanUrl);
      break;
    case 'quote':
      let selectedText = '';
      let hasSelection = false;
      try {
        const response = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: () => window.getSelection().toString()
        });
        selectedText = (response && response[0] && response[0].result) || '';
        hasSelection = selectedText.trim().length > 0;
      } catch (e) {}

      const quoteData = formatQuote(selectedText || currentTab.title, currentTab.title, currentCleaned.cleanUrl, {
        enableTextFragment: userSettings.enableTextFragment !== false,
        hasSelection
      });
      textToCopy = quoteData.plainText;
      htmlToCopy = quoteData.html;
      break;
  }

  const success = await copyToClipboard(textToCopy, htmlToCopy);
  if (success && buttonEl) {
    buttonEl.classList.add('card-success');
    elements.footerStatus.textContent = t('popup.footerStatusCopied');

    // 保持頁面不關閉，1.2 秒後平滑復原圖示與卡片狀態
    setTimeout(() => {
      buttonEl.classList.remove('card-success');
      elements.footerStatus.textContent = '點擊卡片快速複製 · Esc 關閉';
      if (type === 'url' && morph1) morph1.morphTo(ICONS.link, 'snappy');
      if (type === 'markdown' && morph2) morph2.morphTo(ICONS.markdown, 'snappy');
      if (type === 'quote' && morph3) morph3.morphTo(ICONS.quote, 'snappy');
    }, 1200);
  }
}

function updateBoosterCardUI(enabled, quality) {
  if (!elements.streamBoosterCard) return;
  if (enabled) {
    elements.streamBoosterCard.classList.remove('disabled');
    if (elements.boosterStatusLabel) {
      elements.boosterStatusLabel.textContent = t('booster.statusEnabled');
      elements.boosterStatusLabel.classList.remove('disabled');
    }
  } else {
    elements.streamBoosterCard.classList.add('disabled');
    if (elements.boosterStatusLabel) {
      elements.boosterStatusLabel.textContent = t('booster.statusPaused');
      elements.boosterStatusLabel.classList.add('disabled');
    }
  }

  if (elements.boosterPills) {
    elements.boosterPills.forEach(pill => {
      const isActive = pill.getAttribute('data-quality') === quality;
      if (isActive) {
        pill.classList.add('active');
        pill.setAttribute('aria-checked', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-checked', 'false');
      }
    });
  }
}

function setupBoosterEventListeners() {
  if (elements.boosterToggle) {
    elements.boosterToggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      userSettings.enableStreamBooster = enabled;
      await chrome.storage.sync.set({ enableStreamBooster: enabled });
      updateBoosterCardUI(enabled, userSettings.boosterQuality || '1080p');
      if (elements.footerStatus) {
        elements.footerStatus.textContent = t('popup.footerBoosterToggle', { status: enabled ? t('popup.stateEnabled') : t('popup.statePaused') });
        setTimeout(() => {
          if (elements.footerStatus) elements.footerStatus.textContent = '點擊卡片快速複製 · Esc 關閉';
        }, 1200);
      }
    });
  }

  if (elements.boosterPills) {
    elements.boosterPills.forEach(pill => {
      pill.addEventListener('click', async () => {
        const quality = pill.getAttribute('data-quality');
        if (!quality) return;
        userSettings.boosterQuality = quality;
        await chrome.storage.sync.set({ boosterQuality: quality });
        updateBoosterCardUI(userSettings.enableStreamBooster !== false, quality);
        const label = pill.textContent.trim();
        if (elements.footerStatus) {
          elements.footerStatus.textContent = t('popup.footerResolutionLocked', { label });
          setTimeout(() => {
            if (elements.footerStatus) elements.footerStatus.textContent = '點擊卡片快速複製 · Esc 關閉';
          }, 1200);
        }
      });
    });
  }
}

function setupEventListeners() {
  // 影音加速助手開關與畫質膠囊事件
  setupBoosterEventListeners();

  // 點擊事件
  elements.btnCopyUrl.addEventListener('click', () => handleCopy('url', elements.btnCopyUrl));
  elements.btnCopyMarkdown.addEventListener('click', () => handleCopy('markdown', elements.btnCopyMarkdown));
  elements.btnCopyQuote.addEventListener('click', () => handleCopy('quote', elements.btnCopyQuote));

  // 右上角批次模式切換按鈕
  if (elements.btnBatchToggle) {
    elements.btnBatchToggle.addEventListener('click', toggleBatchMode);
  }

  // 批次全選 / 全不選 Checkbox
  if (elements.batchSelectAll) {
    elements.batchSelectAll.addEventListener('change', () => {
      const shouldCheck = elements.batchSelectAll.checked;
      selectedTabIds.clear();
      if (shouldCheck) {
        windowTabs.forEach(t => selectedTabIds.add(t.id));
      }
      const checkboxes = elements.batchTabsList?.querySelectorAll('.batch-tab-checkbox');
      if (checkboxes) {
        checkboxes.forEach(cb => { cb.checked = shouldCheck; });
      }
      updateBatchSelectionCount();
    });
  }

  // 點擊網址文字框直接複製純淨網址 (若存在)
  if (elements.cleanUrlDisplay) {
    elements.cleanUrlDisplay.addEventListener('click', () => handleCopy('url', elements.btnCopyUrl));
  }

  // 右下角齒輪：點擊開啟我們專屬本地的設定頁面
  if (elements.btnSettings) {
    elements.btnSettings.addEventListener('click', (e) => {
      e.preventDefault();
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      }
    });
  }

  // YouTube 時間戳開關
  if (elements.ytTimestampToggle) {
    elements.ytTimestampToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({ preserveYtTime: elements.ytTimestampToggle.checked });
      updateDisplay();
    });
  }

  // 高清原圖下載開關
  if (elements.mediaOrigToggle) {
    elements.mediaOrigToggle.addEventListener('change', async () => {
      userSettings.enableMediaOriginal = elements.mediaOrigToggle.checked;
      await chrome.storage.sync.set({ enableMediaOriginal: elements.mediaOrigToggle.checked });
    });
  }

  // 鍵盤快捷鍵導航 (數字鍵 1, 2, 3 依舊在背景支援，B 鍵切換批次模式)
  window.addEventListener('keydown', (e) => {
    if (e.key === '1') {
      e.preventDefault();
      handleCopy('url', elements.btnCopyUrl);
    } else if (e.key === '2') {
      e.preventDefault();
      handleCopy('markdown', elements.btnCopyMarkdown);
    } else if (e.key === '3') {
      e.preventDefault();
      handleCopy('quote', elements.btnCopyQuote);
    } else if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      toggleBatchMode();
    } else if (e.key === 't' || e.key === 'T') {
      if (!isBatchMode && elements.ytTimestampToggle && !elements.ytOptions.classList.contains('hidden')) {
        e.preventDefault();
        elements.ytTimestampToggle.checked = !elements.ytTimestampToggle.checked;
        chrome.storage.sync.set({ preserveYtTime: elements.ytTimestampToggle.checked });
        updateDisplay();
      }
    } else if (e.key === 'Escape') {
      if (isBatchMode) {
        toggleBatchMode();
      } else {
        window.close();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
