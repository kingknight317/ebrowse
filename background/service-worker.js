/**
 * CleanLink & QuickShare - Background Service Worker (Manifest V3)
 */
import { cleanUrl } from '../lib/cleaner.js';
import { formatMarkdown, formatQuote } from '../lib/formatter.js';
import { resolveOriginalMediaUrl } from '../lib/media-cleaner.js';
import { getAppLanguage, t } from '../lib/i18n.js';

// 動態初始化與更新右鍵選單 (支援多語系即時切換)
async function setupContextMenus() {
  try {
    const lang = await getAppLanguage();
    chrome.contextMenus.removeAll(() => {
      // 建立主選單項目 (涵蓋頁面、選取文字、連結、圖示、以及圖片)
      chrome.contextMenus.create({
        id: 'cleanlink_root',
        title: t('context.main', {}, lang),
        contexts: ['page', 'selection', 'link', 'action', 'image']
      });

      chrome.contextMenus.create({
        id: 'ctx_copy_clean_url',
        parentId: 'cleanlink_root',
        title: t('context.cleanUrl', {}, lang),
        contexts: ['page', 'selection', 'link', 'action']
      });

      chrome.contextMenus.create({
        id: 'ctx_copy_markdown',
        parentId: 'cleanlink_root',
        title: t('context.markdown', {}, lang),
        contexts: ['page', 'selection', 'link', 'action']
      });

      chrome.contextMenus.create({
        id: 'ctx_copy_quote',
        parentId: 'cleanlink_root',
        title: t('context.quote', {}, lang),
        contexts: ['page', 'selection', 'link', 'action']
      });

      // 圖片專屬功能選項
      chrome.contextMenus.create({
        id: 'ctx_open_orig_media',
        parentId: 'cleanlink_root',
        title: t('context.imageOpen', {}, lang),
        contexts: ['image']
      });

      chrome.contextMenus.create({
        id: 'ctx_download_orig_media',
        parentId: 'cleanlink_root',
        title: t('context.imageDownload', {}, lang),
        contexts: ['image']
      });

      chrome.contextMenus.create({
        id: 'ctx_copy_orig_media',
        parentId: 'cleanlink_root',
        title: t('context.imageCopy', {}, lang),
        contexts: ['image']
      });
    });
  } catch (err) {
    console.error('setupContextMenus failed:', err);
  }
}

chrome.runtime.onInstalled.addListener(setupContextMenus);
chrome.runtime.onStartup.addListener(setupContextMenus);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.appLanguage) {
    setupContextMenus();
  }
});

const DEFAULT_SETTINGS = {
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
  enableLinkRadar: true,
  radarAlertOnly: false,
  radarPosition: 'cursor-top-right',
  enableStreamBooster: true,
  boosterDisableAV1: true,
  boosterQuality: '1080p',
  boosterExpandHLS: true,
  enablePipHoverBtn: true
};

async function getUserSettings() {
  try {
    return await chrome.storage.sync.get(DEFAULT_SETTINGS);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

// 監聽右鍵選單點擊事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (!tab || !tab.id) return;

    const settings = await getUserSettings();

    // 處理圖片專屬右鍵功能
    if (info.menuItemId === 'ctx_open_orig_media') {
      const srcUrl = info.srcUrl || info.linkUrl || '';
      const origUrl = settings.enableMediaOriginal !== false ? resolveOriginalMediaUrl(srcUrl) : srcUrl;
      if (origUrl) {
        await chrome.tabs.create({ url: origUrl });
        await flashBadge('IMG');
      }
      return;
    }

    if (info.menuItemId === 'ctx_download_orig_media') {
      const srcUrl = info.srcUrl || info.linkUrl || '';
      const origUrl = settings.enableMediaOriginal !== false ? resolveOriginalMediaUrl(srcUrl) : srcUrl;
      if (origUrl) {
        try {
          await chrome.downloads.download({
            url: origUrl,
            saveAs: false
          });
          await flashBadge('DL');
        } catch (downloadErr) {
          // 若 downloads API 遭遇阻礙或特殊網域，以開啟新分頁作為安全備援
          await chrome.tabs.create({ url: origUrl });
          await flashBadge('IMG');
        }
      }
      return;
    }

    if (info.menuItemId === 'ctx_copy_orig_media') {
      const srcUrl = info.srcUrl || info.linkUrl || '';
      const origUrl = settings.enableMediaOriginal !== false ? resolveOriginalMediaUrl(srcUrl) : srcUrl;
      if (origUrl) {
        await sendTabAction(tab.id, {
          action: 'EXECUTE_COPY',
          text: origUrl
        });
        await flashBadge('URL');
      }
      return;
    }

    // 決定目標網址：
    // 1. 若右鍵點擊的是超連結 (linkUrl)，優先淨化該連結
    // 2. 若反白選取的文字本身是一段 http/https 網址，優先淨化該選取網址
    // 3. 否則採用當前頁面的 tab.url
    let targetUrl = tab.url;
    let targetTitle = tab.title || '';

    if (info.linkUrl) {
      targetUrl = info.linkUrl;
      targetTitle = info.selectionText || info.linkUrl;
    } else if (info.selectionText && /^https?:\/\//i.test(info.selectionText.trim())) {
      targetUrl = info.selectionText.trim();
      targetTitle = targetUrl;
    }

    const cleaned = cleanUrl(targetUrl, {
      ...settings,
      preserveTimestamp: settings.preserveYtTime
    });

    if (info.menuItemId === 'ctx_copy_clean_url') {
      await sendTabAction(tab.id, {
        action: 'EXECUTE_COPY',
        text: cleaned.cleanUrl
      });
      await flashBadge('URL');
    } else if (info.menuItemId === 'ctx_copy_markdown') {
      const markdown = formatMarkdown(targetTitle, cleaned.cleanUrl);
      await sendTabAction(tab.id, {
        action: 'EXECUTE_COPY',
        text: markdown
      });
      await flashBadge('MD');
    } else if (info.menuItemId === 'ctx_copy_quote') {
      const quoteText = info.selectionText || tab.title || '';
      const hasSelection = !!info.selectionText && info.selectionText.trim().length > 0;
      const quoteData = formatQuote(quoteText, tab.title, cleaned.cleanUrl, {
        enableTextFragment: settings.enableTextFragment !== false,
        hasSelection
      });
      await sendTabAction(tab.id, {
        action: 'EXECUTE_COPY',
        text: quoteData.plainText,
        html: quoteData.html
      });
      await flashBadge('QUOT');
    }
  } catch (err) {
    console.error('contextMenus onClicked failed:', err);
  }
});

// 監聽全局鍵盤快捷鍵
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url) return;

    // 特殊受限頁面 (chrome://, edge:// 等不執行 content script)
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      return;
    }

    const settings = await getUserSettings();
    const cleaned = cleanUrl(tab.url, {
      ...settings,
      preserveTimestamp: settings.preserveYtTime
    });

    if (command === 'copy_clean_url') {
      await sendTabAction(tab.id, {
        action: 'EXECUTE_COPY',
        text: cleaned.cleanUrl,
        format: 'clean_url'
      });
      await flashBadge('URL');
    } else if (command === 'copy_markdown') {
      const markdown = formatMarkdown(tab.title, cleaned.cleanUrl);
      await sendTabAction(tab.id, {
        action: 'EXECUTE_COPY',
        text: markdown,
        format: 'markdown'
      });
      await flashBadge('MD');
    } else if (command === 'copy_quote') {
      await sendTabAction(tab.id, {
        action: 'EXECUTE_QUOTE_COPY',
        cleanUrl: cleaned.cleanUrl,
        title: tab.title,
        enableTextFragment: settings.enableTextFragment !== false
      });
      await flashBadge('QUOT');
    }
  } catch (err) {
    console.error('onCommand execution failed:', err);
  }
});

/**
 * 於擴充套件圖示上短暫閃爍反饋 Badge (避免打擾網頁畫面)
 */
async function flashBadge(text) {
  try {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    setTimeout(async () => {
      await chrome.action.setBadgeText({ text: '' });
    }, 1200);
  } catch (e) {
    // 忽略在無 action 權限時的錯誤
  }
}

/**
 * 安全向 Content Script 發送指令，若尚未注入則動態執行
 */
async function sendTabAction(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    // 若 content script 尚未就緒或被重新載入，嘗試透過 scripting.executeScript 寫入剪貼簿
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (textToCopy, htmlToCopy) => {
          if (htmlToCopy && navigator.clipboard && window.ClipboardItem) {
            const textBlob = new Blob([textToCopy], { type: 'text/plain' });
            const htmlBlob = new Blob([htmlToCopy], { type: 'text/html' });
            navigator.clipboard.write([
              new ClipboardItem({
                'text/plain': textBlob,
                'text/html': htmlBlob
              })
            ]);
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy);
          }
        },
        args: [message.text || message.cleanUrl || '', message.html || null]
      });
    } catch (innerErr) {
      // 靜默處理無法注入腳本之分頁
    }
  }
}

// 監聽來自 Popup 或 Content Script 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === 'GET_CURRENT_TAB_INFO') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        sendResponse({ error: 'No active tab found' });
        return;
      }
      sendResponse({
        id: tab.id,
        url: tab.url,
        title: tab.title
      });
    } else if (message.action === 'CLEAN_URL_REQUEST') {
      const settings = await getUserSettings();
      const result = cleanUrl(message.rawUrl, { ...settings, ...(message.options || {}) });
      sendResponse(result);
    } else if (message.action === 'RESOLVE_MEDIA_REQUEST') {
      const result = resolveOriginalMediaUrl(message.rawUrl);
      sendResponse({ originalUrl: result });
    }
  })();
  return true; // 保持異步通訊通道開啟
});
