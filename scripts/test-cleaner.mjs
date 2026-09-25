import { cleanUrl } from '../lib/cleaner.js';

const testCases = [
  {
    name: 'Google 搜尋激進瘦身 (只留 q)',
    input: 'https://www.google.com/search?q=apple+iphone&sca_esv=123456&sxsrf=ADFasdf&ei=999&ved=0ahUKEw&uact=5&oq=apple&sourceid=chrome',
    expected: 'https://www.google.com/search?q=apple+iphone',
    check: res => res.cleanUrl === 'https://www.google.com/search?q=apple+iphone' && res.removedParams.includes('sca_esv')
  },
  {
    name: '蝦皮 (Shopee) 砍除中文 SEO 標題',
    input: 'https://shopee.tw/Apple-iPhone-16-Pro-Max-256G-原廠公司貨-i.123456.789012?sp_atk=abcd&xptdk=efgh',
    expected: 'https://shopee.tw/product/123456/789012',
    check: res => res.cleanUrl === 'https://shopee.tw/product/123456/789012'
  },
  {
    name: 'Reddit 砍除長路徑轉 redd.it',
    input: 'https://www.reddit.com/r/webdev/comments/1abcxyz/why_does_this_long_title_exist_in_url_slug/',
    expected: 'https://redd.it/1abcxyz',
    check: res => res.cleanUrl === 'https://redd.it/1abcxyz'
  },
  {
    name: 'Twitter / X 去除分享來源',
    input: 'https://x.com/elonmusk/status/1880000000000000000?s=20&t=abcdef123',
    expected: 'https://x.com/elonmusk/status/1880000000000000000',
    check: res => res.cleanUrl === 'https://x.com/elonmusk/status/1880000000000000000'
  },
  {
    name: 'Bilibili 去除 vd_source',
    input: 'https://www.bilibili.com/video/BV1xx411c7X?spm_id_from=333.999&vd_source=12345678',
    expected: 'https://www.bilibili.com/video/BV1xx411c7X',
    check: res => res.cleanUrl === 'https://www.bilibili.com/video/BV1xx411c7X'
  },
  {
    name: 'Amazon 提煉 ASIN',
    input: 'https://www.amazon.com/Apple-AirPods-Charging-Latest-Model/dp/B07PXGQC1Q/ref=sr_1_1?crid=23JXYZ&keywords=airpods',
    expected: 'https://www.amazon.com/dp/B07PXGQC1Q',
    check: res => res.cleanUrl === 'https://www.amazon.com/dp/B07PXGQC1Q'
  },
  {
    name: 'PII 敏感個資檢測與剝離',
    input: 'https://example.com/login-redirect?email=user@test.com&token=secret_jwt_xyz&utm_source=facebook',
    check: res => !res.cleanUrl.includes('email') && !res.cleanUrl.includes('token')
  },
  {
    name: '跨國語系與幣別脫敏 (Global Adaptive 預設開啟)',
    input: 'https://example.com/item/456?hl=zh-TW&gl=TW&currency=TWD&locale=zh-TW&utm_campaign=winter',
    expected: 'https://example.com/item/456',
    check: res => res.cleanUrl === 'https://example.com/item/456' && res.removedParams.includes('hl') && res.removedParams.includes('currency')
  },
  {
    name: '跨國語系與幣別 (手動關閉 globalAdaptive: false)',
    input: 'https://example.com/item/456?lang=en&currency=USD&utm_source=fb',
    options: { globalAdaptive: false },
    expected: 'https://example.com/item/456?lang=en&currency=USD',
    check: res => res.cleanUrl.includes('lang=en') && res.cleanUrl.includes('currency=USD') && !res.cleanUrl.includes('utm_source')
  },
  {
    name: '自訂開關控制 (關閉 cleanGoogle: false 時不執行激進改寫)',
    input: 'https://www.google.com/search?q=test&custom=123&utm_source=test',
    options: { cleanGoogle: false },
    check: res => res.cleanUrl.includes('custom=123') && !res.cleanUrl.includes('utm_source')
  },
  {
    name: 'Momo 購物網 (提煉 i_code，砍除 mdiv 與分類碼)',
    input: 'https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=12345678&str_category_code=1900400000&mdiv=1900400000-bt_0_999_01&Area=det2',
    expected: 'https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=12345678',
    check: res => res.cleanUrl === 'https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=12345678'
  },
  {
    name: 'PChome 24h 購物 (提煉純淨 prodId)',
    input: 'https://24h.pchome.com.tw/prod/DABC12-A900XYZ12?fq=/store/DABC12&utm_source=fb',
    expected: 'https://24h.pchome.com.tw/prod/DABC12-A900XYZ12',
    check: res => res.cleanUrl === 'https://24h.pchome.com.tw/prod/DABC12-A900XYZ12'
  },
  {
    name: 'eBay 全球站 (提煉 itm 物品 ID，砍除標題與 _trkparms)',
    input: 'https://www.ebay.com/itm/Apple-iPhone-15-Pro-Max-256GB-Unlocked/123456789012?_trkparms=pageci%3A123&amdata=enc%3A123',
    expected: 'https://www.ebay.com/itm/123456789012',
    check: res => res.cleanUrl === 'https://www.ebay.com/itm/123456789012'
  },
  {
    name: 'AliExpress 全球速賣通 (提煉 item ID，砍除 spm 與 algo 參數)',
    input: 'https://www.aliexpress.com/item/1005001234567890.html?spm=a2g0o.productlist.main.1&pdp_npi=4&algo_pvid=abc',
    expected: 'https://www.aliexpress.com/item/1005001234567890.html',
    check: res => res.cleanUrl === 'https://www.aliexpress.com/item/1005001234567890.html'
  },
  {
    name: '淘寶 (Taobao) / 天貓 (提煉 id，砍除 spm 與推薦碼)',
    input: 'https://item.taobao.com/item.htm?id=678901234567&spm=a21bo.jianhua.201867-main&scm=1007.123',
    expected: 'https://item.taobao.com/item.htm?id=678901234567',
    check: res => res.cleanUrl === 'https://item.taobao.com/item.htm?id=678901234567'
  },
  {
    name: 'Coupang 酷澎 (提煉 products ID，砍除 vendorItemId 與來源碼)',
    input: 'https://www.tw.coupang.com/vp/products/12345678?vendorItemId=999999&sourceType=SEARCH',
    expected: 'https://www.tw.coupang.com/vp/products/12345678',
    check: res => res.cleanUrl === 'https://www.tw.coupang.com/vp/products/12345678'
  },
  {
    name: 'JD 京東 (提煉商品頁，砍除推廣追蹤參數)',
    input: 'https://item.jd.com/100012345678.html?utm_source=jd_app&utm_medium=appshare&rid=999',
    expected: 'https://item.jd.com/100012345678.html',
    check: res => res.cleanUrl === 'https://item.jd.com/100012345678.html'
  },
  {
    name: 'Steam 遊戲商城 (提煉 app ID，砍除遊戲標題與 snr 導流標籤)',
    input: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/?snr=1_5_9__205&curator_clanid=123',
    expected: 'https://store.steampowered.com/app/1091500/',
    check: res => res.cleanUrl === 'https://store.steampowered.com/app/1091500/'
  },
  {
    name: 'Spotify 音樂串流 (提煉 track ID，砍除 si= 社交追蹤碼)',
    input: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123xyz456&context=spotify%3Aplaylist%3A37i9dQZF1DXcBWIGoYBM5M',
    expected: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    check: res => res.cleanUrl === 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'
  },
  {
    name: 'Instagram 貼文 (提煉 p/短代碼/，砍除 igsh 與 utm 標記)',
    input: 'https://www.instagram.com/p/C_xyz123/?igsh=MW12345&utm_source=ig_web_copy_link',
    expected: 'https://www.instagram.com/p/C_xyz123/',
    check: res => res.cleanUrl === 'https://www.instagram.com/p/C_xyz123/'
  },
  {
    name: 'Threads 貼文 (提煉帳號與貼文 ID，砍除 xmt 追蹤碼)',
    input: 'https://www.threads.net/@zuck/post/C_xyz123?xmt=AQG123456789',
    expected: 'https://www.threads.net/@zuck/post/C_xyz123',
    check: res => res.cleanUrl === 'https://www.threads.net/@zuck/post/C_xyz123'
  },
  {
    name: 'Netflix 影集 (提煉 title ID，砍除 watch 播放參數與 trackId)',
    input: 'https://www.netflix.com/watch/81234567?trackId=14277&t=120',
    expected: 'https://www.netflix.com/title/81234567',
    check: res => res.cleanUrl === 'https://www.netflix.com/title/81234567'
  }
];

let allPassed = true;
console.log('--- 開始測試 Aggressive Canonical URL Cleaner ---');
for (const tc of testCases) {
  const res = cleanUrl(tc.input, tc.options);
  const passed = tc.check(res);
  console.log(`${passed ? '[PASS]' : '[FAIL]'} [${tc.name}]: ${res.cleanUrl}`);
  if (!passed) {
    allPassed = false;
    console.error('   期望結果不符:', res);
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('所有激進瘦身測試皆順利通過。');
}
