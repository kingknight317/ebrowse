/**
 * CleanLink & QuickShare - Options Logic with Full Multi-Language Support
 */
import {
  initI18n,
  t,
  applyTranslations,
  getAppLanguage,
  setAppLanguage,
  SUPPORTED_LANGUAGES
} from '../lib/i18n.js';

const DEFAULT_SETTINGS = {
  // 語言設定 (預設為 auto 自動跟隨瀏覽器)
  appLanguage: 'auto',

  // 購物電商平台
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

  // 社群與數位內容平台
  cleanGoogle: true,
  cleanTwitter: true,
  cleanReddit: true,
  cleanBilibili: true,
  cleanInstagram: true,
  cleanThreads: true,
  cleanSpotify: true,
  cleanNetflix: true,

  // 資安與進階偏好
  filterPII: true,
  globalAdaptive: true,
  preserveYtTime: false,
  enableTextFragment: true,
  enableMediaOriginal: true,
  enableLinkRadar: true,
  radarAlertOnly: false,
  radarPosition: 'cursor-top-right',

  enableStreamBooster: true,
  boosterDisableAV1: true,
  boosterQuality: '1080p',
  boosterExpandHLS: true,
  enablePipHoverBtn: true
};

const settingKeys = Object.keys(DEFAULT_SETTINGS);

const saveToast = document.getElementById('save-toast');
let toastTimer = null;
let currentTabId = 'social';

function showSaveToast() {
  if (!saveToast) return;
  saveToast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    saveToast.classList.remove('visible');
  }, 1200);
}

function getTabMeta(tabId) {
  return {
    title: t(`tab.${tabId}.title`),
    subtitle: t(`tab.${tabId}.subtitle`)
  };
}

function switchTab(tabId) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  currentTabId = tabId;
  const meta = getTabMeta(tabId);

  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    const isActive = btn.getAttribute('data-tab') === tabId;
    if (isActive) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  const contentEl = document.querySelector('.settings-content');
  const panels = document.querySelectorAll('.tab-panel');

  if (tabId === 'all') {
    contentEl?.classList.add('show-all');
    panels.forEach(p => p.classList.remove('active'));
  } else {
    contentEl?.classList.remove('show-all');
    panels.forEach(p => {
      if (p.id === `panel-${tabId}`) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  const headingEl = document.getElementById('content-heading');
  const subheadingEl = document.getElementById('content-subheading');
  if (headingEl) headingEl.textContent = meta.title;
  if (subheadingEl) subheadingEl.textContent = meta.subtitle;

  try {
    localStorage.setItem('cleanlink_active_tab', tabId);
  } catch {
    // ignore storage error
  }

  if (tabId === 'radar' || tabId === 'all') {
    setTimeout(() => {
      positionStaticDemo(currentRadarPos);
    }, 60);
  }
}

function setupSidebarTabs() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        switchTab(tabId);
      }
    });
  });

  let savedTab = 'social';
  try {
    savedTab = localStorage.getItem('cleanlink_active_tab') || 'social';
  } catch {
    savedTab = 'social';
  }
  switchTab(savedTab);
}

function getStatusData() {
  return {
    paywall: {
      icon: '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-danger"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      text: t('radar.paywall'),
      domain: 'wsj.com'
    },
    ai_farm: {
      icon: '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-warning"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      text: t('radar.aiFarm'),
      domain: 'kknews.cc'
    },
    safe: {
      icon: '<svg viewBox="0 0 24 24" class="__cleanlink-radar-svg __radar-safe"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      text: t('radar.safe'),
      domain: 'github.com'
    }
  };
}

let currentRadarPos = 'cursor-top-right';
let currentPreviewStatus = 'paywall';

function positionStaticDemo(pos) {
  const stage = document.getElementById('preview-stage');
  const link = document.getElementById('preview-mock-link');
  const tooltip = document.getElementById('preview-radar-tooltip');
  const cursor = document.getElementById('preview-mock-cursor');
  if (!stage || !link || !tooltip) return;

  const stageRect = stage.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  if (linkRect.width === 0 && linkRect.height === 0) return;

  const cursorLeft = (linkRect.left - stageRect.left) + Math.min(32, linkRect.width / 3);
  const cursorTop = (linkRect.top - stageRect.top) + linkRect.height / 2;

  if (cursor) {
    cursor.style.opacity = '1';
    cursor.style.left = `${Math.round(cursorLeft)}px`;
    cursor.style.top = `${Math.round(cursorTop)}px`;
  }

  tooltip.style.transition = 'left 0.22s cubic-bezier(0.16, 1, 0.3, 1), top 0.22s cubic-bezier(0.16, 1, 0.3, 1)';

  const tooltipWidth = tooltip.offsetWidth || 230;
  const tooltipHeight = tooltip.offsetHeight || 28;

  if (pos === 'cursor-top-right') {
    tooltip.style.left = `${Math.round(cursorLeft + 10)}px`;
    tooltip.style.top = `${Math.round(cursorTop - tooltipHeight - 6)}px`;
  } else if (pos === 'cursor-top') {
    tooltip.style.left = `${Math.round(cursorLeft - tooltipWidth / 2)}px`;
    tooltip.style.top = `${Math.round(cursorTop - tooltipHeight - 6)}px`;
  } else if (pos === 'cursor-bottom-right') {
    tooltip.style.left = `${Math.round(cursorLeft + 10)}px`;
    tooltip.style.top = `${Math.round(cursorTop + 18)}px`;
  } else {
    // anchor-top
    tooltip.style.left = `${Math.round((linkRect.left - stageRect.left) + linkRect.width / 2 - tooltipWidth / 2)}px`;
    tooltip.style.top = `${Math.round((linkRect.top - stageRect.top) - tooltipHeight - 4)}px`;
  }
}

function updatePreviewStatus(status) {
  currentPreviewStatus = status;
  const statusData = getStatusData();
  const data = statusData[status] || statusData.paywall;
  const tooltip = document.getElementById('preview-radar-tooltip');
  const iconEl = document.getElementById('preview-tooltip-icon');
  const textEl = document.getElementById('preview-tooltip-text');
  const domainEl = document.getElementById('preview-tooltip-domain');

  if (tooltip) {
    tooltip.className = `preview-radar-tooltip __status-${status}`;
  }
  if (iconEl) iconEl.innerHTML = data.icon;
  if (textEl) textEl.textContent = data.text;
  if (domainEl) domainEl.textContent = data.domain;

  const statusBtns = document.querySelectorAll('.preview-status-btn');
  statusBtns.forEach(b => {
    if (b.getAttribute('data-status') === status) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}

function setupRadarPositionAndPreview() {
  const cards = document.querySelectorAll('.position-card');
  cards.forEach(card => {
    card.addEventListener('click', async () => {
      const pos = card.getAttribute('data-pos');
      if (!pos) return;

      currentRadarPos = pos;
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      await chrome.storage.sync.set({ radarPosition: pos });
      showSaveToast();
      positionStaticDemo(pos);
    });
  });

  const statusBtns = document.querySelectorAll('.preview-status-btn');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-status');
      if (status) updatePreviewStatus(status);
    });
  });

  const stage = document.getElementById('preview-stage');
  const link = document.getElementById('preview-mock-link');
  const tooltip = document.getElementById('preview-radar-tooltip');
  const cursor = document.getElementById('preview-mock-cursor');

  if (stage && link && tooltip) {
    stage.addEventListener('mousemove', (e) => {
      const stageRect = stage.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();

      const isNearLink = (
        e.clientX >= linkRect.left - 45 &&
        e.clientX <= linkRect.right + 45 &&
        e.clientY >= linkRect.top - 40 &&
        e.clientY <= linkRect.bottom + 40
      );

      if (isNearLink) {
        if (cursor) cursor.style.opacity = '0';
        tooltip.style.transition = 'none';

        const mouseX = e.clientX - stageRect.left;
        const mouseY = e.clientY - stageRect.top;
        const tooltipWidth = tooltip.offsetWidth || 230;
        const tooltipHeight = tooltip.offsetHeight || 28;

        if (currentRadarPos === 'cursor-top-right') {
          let top = mouseY - tooltipHeight - 6;
          let left = mouseX + 10;
          if (top < 6) top = mouseY + 18;
          tooltip.style.left = `${Math.round(left)}px`;
          tooltip.style.top = `${Math.round(top)}px`;
        } else if (currentRadarPos === 'cursor-top') {
          let top = mouseY - tooltipHeight - 6;
          let left = mouseX - tooltipWidth / 2;
          if (top < 6) top = mouseY + 18;
          tooltip.style.left = `${Math.round(left)}px`;
          tooltip.style.top = `${Math.round(top)}px`;
        } else if (currentRadarPos === 'cursor-bottom-right') {
          let top = mouseY + 18;
          let left = mouseX + 10;
          tooltip.style.left = `${Math.round(left)}px`;
          tooltip.style.top = `${Math.round(top)}px`;
        } else {
          let top = (linkRect.top - stageRect.top) - tooltipHeight - 4;
          let left = (linkRect.left - stageRect.left) + linkRect.width / 2 - tooltipWidth / 2;
          tooltip.style.left = `${Math.round(left)}px`;
          tooltip.style.top = `${Math.round(top)}px`;
        }
      } else {
        positionStaticDemo(currentRadarPos);
      }
    });

    stage.addEventListener('mouseleave', () => {
      positionStaticDemo(currentRadarPos);
    });

    window.addEventListener('resize', () => {
      positionStaticDemo(currentRadarPos);
    });
  }

  setTimeout(() => {
    positionStaticDemo(currentRadarPos);
  }, 60);
}

function setupShortcutButton() {
  const btn = document.getElementById('btn-open-chrome-shortcuts');
  if (btn) {
    btn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }
}

async function setupLanguagePicker() {
  const select = document.getElementById('app-language-select');
  if (!select) return;

  try {
    const stored = await chrome.storage.sync.get({ appLanguage: 'auto' });
    select.value = stored.appLanguage || 'auto';
  } catch {
    select.value = 'auto';
  }

  select.addEventListener('change', async () => {
    const newLang = select.value;
    await setAppLanguage(newLang);
    applyTranslations(document);
    switchTab(currentTabId);
    updatePreviewStatus(currentPreviewStatus);
    showSaveToast();
  });
}

async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);

    settingKeys.forEach(key => {
      const el = document.getElementById(key);
      if (el && el.type === 'checkbox') {
        el.checked = stored[key] !== undefined ? stored[key] : DEFAULT_SETTINGS[key];
        el.addEventListener('change', async () => {
          await chrome.storage.sync.set({ [key]: el.checked });
          showSaveToast();
        });
      }
    });

    // 載入影音加速預設鎖定畫質
    const qualitySelect = document.getElementById('boosterQuality');
    if (qualitySelect) {
      qualitySelect.value = stored.boosterQuality || DEFAULT_SETTINGS.boosterQuality;
      qualitySelect.addEventListener('change', async () => {
        await chrome.storage.sync.set({ boosterQuality: qualitySelect.value });
        showSaveToast();
      });
    }

    // 載入探測標籤位置偏好
    const savedPos = stored.radarPosition || DEFAULT_SETTINGS.radarPosition;
    currentRadarPos = savedPos;
    const cards = document.querySelectorAll('.position-card');
    cards.forEach(c => {
      const pos = c.getAttribute('data-pos');
      const radio = c.querySelector('input[type="radio"]');
      if (pos === savedPos) {
        c.classList.add('active');
        if (radio) radio.checked = true;
      } else {
        c.classList.remove('active');
        if (radio) radio.checked = false;
      }
    });
    positionStaticDemo(savedPos);
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  await setupLanguagePicker();
  setupSidebarTabs();
  await loadSettings();
  setupRadarPositionAndPreview();
  setupShortcutButton();
});
