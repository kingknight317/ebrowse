/**
 * CleanLink & QuickShare - Text Formatters
 */

/**
 * 轉義 HTML 特殊字元
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 格式化為 Markdown 連結
 * @param {string} title 
 * @param {string} url 
 * @returns {string}
 */
export function formatMarkdown(title, url) {
  const safeTitle = (title || url).replace(/[[\]]/g, '\\$&').trim();
  return `[${safeTitle}](${url})`;
}

/**
 * 依據 W3C Text Fragments 標準對文字進行編碼
 * 規範中 '-' (%2D)、',' (%2C)、'&' (%26) 需進行百分比編碼
 * @param {string} str 
 * @returns {string}
 */
export function encodeTextFragment(str) {
  if (!str) return '';
  return encodeURIComponent(str.trim())
    .replace(/-/g, '%2D')
    .replace(/,/g, '%2C')
    .replace(/&/g, '%26');
}

/**
 * 產生符合 W3C 原生標準的 Text Fragment 指令 (text=[start][,end])
 * 支援 CJK（中日韓）無空格字元與歐美分詞最適化擷取
 * @param {string} selectedText 
 * @returns {string}
 */
export function generateTextFragmentDirective(selectedText) {
  if (!selectedText || typeof selectedText !== 'string') return '';
  const clean = selectedText.trim().replace(/\s+/g, ' ');
  if (!clean) return '';

  const words = clean.split(' ').filter(Boolean);

  // 1. 若為西文且字詞數多於 6 個，以首尾 3 個詞構成定位區間
  if (words.length > 6) {
    const start = words.slice(0, 3).join(' ');
    const end = words.slice(-3).join(' ');
    return `text=${encodeTextFragment(start)},${encodeTextFragment(end)}`;
  }

  // 2. 若為中日韓等密集字元（無空格或少於 3 個詞）且總字元數大於 24
  if (words.length <= 2 && clean.length > 24) {
    const start = clean.slice(0, 8);
    const end = clean.slice(-8);
    return `text=${encodeTextFragment(start)},${encodeTextFragment(end)}`;
  }

  // 3. 短字句採用完全匹配
  return `text=${encodeTextFragment(clean)}`;
}

/**
 * 將文字錨點附加至目標網址 (遵循 W3C Fragment Directive :~:text= 規範)
 * @param {string} url 原始純淨網址
 * @param {string} selectedText 使用者反白選取的文字
 * @returns {string} 附加錨點後的網址
 */
export function attachTextFragment(url, selectedText) {
  if (!url || typeof url !== 'string') return url || '';
  if (!selectedText || typeof selectedText !== 'string' || !selectedText.trim()) {
    return url;
  }

  const directive = generateTextFragmentDirective(selectedText);
  if (!directive) return url;

  // 先剝離可能存在的舊版 :~:text= 錨點指示
  const cleanBase = url.replace(/:~:text=[^&]*/g, '').replace(/#:~:$/, '');

  if (cleanBase.includes('#')) {
    return `${cleanBase}:~:${directive}`;
  }
  return `${cleanBase}#:~:${directive}`;
}

/**
 * 格式化為引言模式（提供富文本超連結與 Markdown 雙重格式）
 * @param {string} quoteText 
 * @param {string} title 
 * @param {string} url 
 * @param {{ enableTextFragment?: boolean, hasSelection?: boolean }} [options]
 * @returns {{ plainText: string, html: string, targetUrl: string }}
 */
export function formatQuote(quoteText, title, url, options = {}) {
  const { enableTextFragment = true, hasSelection = false } = options;

  // 僅在使用者有實際反白選取文字且開關啟用時附加文字錨點
  const targetUrl = (hasSelection && enableTextFragment && quoteText)
    ? attachTextFragment(url, quoteText)
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

  // 富文本 HTML 結構：左側引言邊框 + 純淨網址超連結（href 指向跳轉錨點，外顯文字為乾淨網址）
  const htmlQuote = (quoteText || '')
    .trim()
    .split('\n')
    .map(line => escapeHtml(line))
    .join('<br>');
  const html = `<blockquote style="border-left: 3px solid #38bdf8; padding-left: 10px; margin: 8px 0; color: #334155; font-style: italic;">${htmlQuote}</blockquote><p>— <a href="${targetUrl}" style="color: #0284c7; text-decoration: underline;">${url}</a></p>`;

  return { plainText, html, targetUrl };
}

/**
 * 批次格式化為純淨網址清單 (一行一個)
 * @param {Array<{ url: string }>} tabs
 * @returns {string}
 */
export function formatBatchUrls(tabs) {
  if (!Array.isArray(tabs) || tabs.length === 0) return '';
  return tabs.map(t => t.url).filter(Boolean).join('\n');
}

/**
 * 批次格式化為 Markdown 條列式清單 (- [標題](網址))
 * @param {Array<{ title?: string, url: string }>} tabs
 * @returns {string}
 */
export function formatBatchMarkdown(tabs) {
  if (!Array.isArray(tabs) || tabs.length === 0) return '';
  return tabs
    .map(t => {
      const safeTitle = (t.title || t.url || '').replace(/[[\]]/g, '\\$&').trim();
      return `- [${safeTitle}](${t.url})`;
    })
    .join('\n');
}

/**
 * 批次格式化為引言與來源清單 (提供純文字與 HTML 富文本雙重格式)
 * @param {Array<{ title?: string, url: string }>} tabs
 * @returns {{ plainText: string, html: string }}
 */
export function formatBatchQuotes(tabs) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return { plainText: '', html: '' };
  }

  const plainText = tabs
    .map(t => {
      const title = (t.title || t.url || '').trim();
      return `> ${title}\n— ${t.url}`;
    })
    .join('\n\n');

  const htmlItems = tabs
    .map(t => {
      const title = escapeHtml((t.title || t.url || '').trim());
      return `<blockquote style="border-left: 3px solid #38bdf8; padding-left: 10px; margin: 8px 0; color: #334155; font-style: italic;">${title}</blockquote><p>— <a href="${t.url}" style="color: #0284c7; text-decoration: underline;">${t.url}</a></p>`;
    })
    .join('<br>');

  return { plainText, html: htmlItems };
}

/**
 * 寫入剪貼簿（純文字或富文本）
 * @param {string} text 純文字內容
 * @param {string} [html] 可選的 HTML 富文本內容
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text, html = null) {
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
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error('Clipboard write error:', err);
  }

  // Fallback 方案 (適用於部分受限環境)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.error('Fallback copy failed:', e);
    return false;
  }
}
