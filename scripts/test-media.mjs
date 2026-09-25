import { resolveOriginalMediaUrl } from '../lib/media-cleaner.js';

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

console.log('--- 開始測試 Original High-Res Media Extractor ---');

// 1. Twitter / X query 參數還原
const twUrl1 = 'https://pbs.twimg.com/media/Gabc123?format=jpg&name=360x360';
const cleanTw1 = resolveOriginalMediaUrl(twUrl1);
assert(cleanTw1 === 'https://pbs.twimg.com/media/Gabc123?format=jpg&name=orig', `Twitter 參數替換為 name=orig: ${cleanTw1}`);

// 2. Twitter / X 路徑後綴還原
const twUrl2 = 'https://pbs.twimg.com/media/Gabc123.jpg:large';
const cleanTw2 = resolveOriginalMediaUrl(twUrl2);
assert(cleanTw2 === 'https://pbs.twimg.com/media/Gabc123.jpg:orig', `Twitter 後綴替換為 :orig: ${cleanTw2}`);

// 3. Reddit preview.redd.it -> i.redd.it
const redditUrl = 'https://preview.redd.it/xyz789.png?width=640&crop=smart&auto=webp&s=abcdef123';
const cleanReddit = resolveOriginalMediaUrl(redditUrl);
assert(cleanReddit === 'https://i.redd.it/xyz789.png', `Reddit preview 還原為 i.redd.it 原圖: ${cleanReddit}`);

// 4. Bilibili 縮圖後綴剝離
const biliUrl = 'https://i0.hdslb.com/bfs/archive/abc123.jpg@640w_400h_1c.webp';
const cleanBili = resolveOriginalMediaUrl(biliUrl);
assert(cleanBili === 'https://i0.hdslb.com/bfs/archive/abc123.jpg', `Bilibili 剝離 @ 尺寸後綴: ${cleanBili}`);

// 5. YouTube 封面升級為 maxresdefault
const ytThumb = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
const cleanYt = resolveOriginalMediaUrl(ytThumb);
assert(cleanYt === 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', `YouTube 封面升級為 1080p maxres: ${cleanYt}`);

// 6. Weibo / 新浪圖床 /bmiddle/ 轉 /large/
const weiboUrl = 'https://wx1.sinaimg.cn/bmiddle/007xyz.jpg';
const cleanWeibo = resolveOriginalMediaUrl(weiboUrl);
assert(cleanWeibo === 'https://wx1.sinaimg.cn/large/007xyz.jpg', `Weibo 縮圖提升為 /large/: ${cleanWeibo}`);

// 7. Wikimedia 縮圖剝離
const wikiThumb = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File.jpg/300px-File.jpg';
const cleanWiki = resolveOriginalMediaUrl(wikiThumb);
assert(cleanWiki === 'https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg', `Wikimedia 縮圖還原原圖: ${cleanWiki}`);

// 8. 通用圖床壓縮參數剝離
const genImg = 'https://example.com/images/hero.jpg?width=800&height=600&quality=80&crop=1';
const cleanGen = resolveOriginalMediaUrl(genImg);
assert(cleanGen === 'https://example.com/images/hero.jpg', `通用圖床剝離縮圖參數: ${cleanGen}`);

console.log(`\n測試結果: 通過 ${passed} 項，失敗 ${failed} 項`);
if (failed > 0) process.exit(1);
