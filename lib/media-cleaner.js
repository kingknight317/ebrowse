/**
 * CleanLink & QuickShare - Original High-Res Media Extractor
 * 支援各大主流平台逆向推導無壓縮、未裁切之原始最高解析度媒體 URL
 */

/**
 * 將各平台經過壓縮、縮圖或限制尺寸的圖片網址還原為最高解析度原圖
 * @param {string} rawUrl 原始圖片網址
 * @returns {string} 最高畫質純淨原圖網址
 */
export function resolveOriginalMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl || '';

  try {
    const trimmed = rawUrl.trim();
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. Twitter / X (pbs.twimg.com)
    if (host === 'pbs.twimg.com' && pathname.includes('/media/')) {
      // 處理 query 參數形式: ?format=jpg&name=360x360 -> ?format=jpg&name=orig
      if (parsed.searchParams.has('name') || parsed.searchParams.has('format')) {
        parsed.searchParams.set('name', 'orig');
        // 移除可能存在的尺寸限定參數
        parsed.searchParams.delete('w');
        parsed.searchParams.delete('h');
        return parsed.toString();
      }

      // 處理路徑後綴形式: .jpg:large / .jpg:small -> .jpg:orig
      const colonMatch = pathname.match(/\.(jpg|jpeg|png|webp):([a-z0-9_]+)$/i);
      if (colonMatch) {
        const ext = colonMatch[1];
        parsed.pathname = pathname.replace(/\.(jpg|jpeg|png|webp):[a-z0-9_]+$/i, `.${ext}:orig`);
        return parsed.toString();
      }

      // 一般未帶參數之 .jpg/.png 加上 :orig
      if (/\.(jpg|jpeg|png|webp)$/i.test(pathname)) {
        parsed.pathname = `${pathname}:orig`;
        return parsed.toString();
      }
    }

    // 2. Reddit (preview.redd.it / external-preview.redd.it -> i.redd.it)
    if (host === 'preview.redd.it' || host === 'external-preview.redd.it') {
      // preview.redd.it 轉為 i.redd.it 並清除所有 width, crop 查詢參數
      const filename = pathname.split('/').pop();
      if (filename) {
        return `https://i.redd.it/${filename}`;
      }
    } else if (host === 'i.redd.it') {
      // 確保 i.redd.it 自身不帶壓縮參數
      return `${parsed.origin}${pathname}`;
    }

    // 3. Bilibili (*.hdslb.com)
    // 典型範例: .../archive/xyz.jpg@640w_400h_1c.webp
    if (host.endsWith('.hdslb.com')) {
      // 剔除 @ 後面的所有動態縮圖與格式轉換後綴
      const atIndex = pathname.indexOf('@');
      if (atIndex !== -1) {
        parsed.pathname = pathname.slice(0, atIndex);
      }
      parsed.search = '';
      return parsed.toString();
    }

    // 4. YouTube 影片封面 (i.ytimg.com / img.youtube.com)
    if (host === 'i.ytimg.com' || host === 'img.youtube.com') {
      const match = pathname.match(/\/vi\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\.(jpg|webp)/i);
      if (match && match[1]) {
        const videoId = match[1];
        // 升級為官方 1080p 超高解析度 maxresdefault
        return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    // 5. Weibo 新浪圖床 (*.sinaimg.cn)
    // 路徑特徵: /thumb150/, /mw690/, /bmiddle/, /small/ -> /large/
    if (host.endsWith('.sinaimg.cn')) {
      const weiboRe = /\/(thumb150|thumb180|mw690|mw1024|bmiddle|small|square|orj360|orj480)\//i;
      if (weiboRe.test(pathname)) {
        parsed.pathname = pathname.replace(weiboRe, '/large/');
        parsed.search = '';
        return parsed.toString();
      }
    }

    // 6. Wikimedia / Wikipedia (upload.wikimedia.org)
    // 縮圖路徑特徵: .../thumb/a/ab/File.jpg/300px-File.jpg
    if (host === 'upload.wikimedia.org' && pathname.includes('/thumb/')) {
      // 剝離 /thumb/ 與末尾的尺寸重複段落
      const parts = pathname.replace('/wikipedia/commons/thumb/', '/wikipedia/commons/').split('/');
      // 縮圖最後一部分是尺寸檔名 (例如 300px-File.jpg)，去除之
      if (parts.length > 5) {
        parts.pop();
      }
      parsed.pathname = parts.join('/');
      parsed.search = '';
      return parsed.toString();
    }

    // 7. 通用縮圖查詢參數剝離 (適用各類部落格與 CDN 圖床)
    const RESIZE_PARAMS = new Set([
      'w', 'width', 'h', 'height', 'fit', 'crop', 'quality', 'q',
      'resize', 'maxwidth', 'maxheight', 'size', 'auto'
    ]);

    let hasResizer = false;
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (RESIZE_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
        hasResizer = true;
      }
    }

    if (hasResizer) {
      return parsed.toString();
    }

    return trimmed;
  } catch (e) {
    return rawUrl;
  }
}
