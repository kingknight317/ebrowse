/**
 * CleanLink & QuickShare - Test Suite for Pre-Flight Link Radar
 */
import { assessLinkUrl, getRadarSvgIcon, PAYWALL_DOMAINS, AI_FARM_DOMAINS } from '../lib/link-radar.js';

console.log('--- 開始測試 Pre-Flight Link Radar ---');

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

// 1. 付費牆測試
const wsj = assessLinkUrl('https://www.wsj.com/articles/markets-today-12345');
assert(wsj.status === 'paywall' && wsj.badgeText.includes('嚴格付費牆'), 'WSJ 標記為嚴格付費牆');

const nyt = assessLinkUrl('https://cn.nytimes.com/business/20260907/market/');
assert(nyt.status === 'paywall' && nyt.domain === 'nytimes.com', 'NYT 子網域標記為付費牆');

const ft = assessLinkUrl('https://www.ft.com/content/123456');
assert(ft.status === 'paywall', 'FT 金融時報標記為付費牆');

const bloomberg = assessLinkUrl('https://www.bloomberg.com/news/articles/2026-09-07/economy');
assert(bloomberg.status === 'paywall', 'Bloomberg 標記為付費牆');

const caixin = assessLinkUrl('https://weekly.caixin.com/2026-09-07/1234.html');
assert(caixin.status === 'paywall', '財新網標記為付費牆');

const bw = assessLinkUrl('https://www.businessweekly.com.tw/business/indepth/12345');
assert(bw.status === 'paywall', '商業周刊標記為付費牆');

const cw = assessLinkUrl('https://www.cw.com.tw/article/5123456');
assert(cw.status === 'paywall', '天下雜誌標記為付費牆');

const udnVip = assessLinkUrl('https://udn.com/vip/story/123/456');
assert(udnVip.status === 'paywall', '聯合報 VIP 專區標記為付費牆');

const quora = assessLinkUrl('https://www.quora.com/Why-is-the-sky-blue');
assert(quora.status === 'paywall', 'Quora 強制登入標記為付費牆/強制登入');

// 2. AI 內容農場 / 採集站測試
const kknews = assessLinkUrl('https://kknews.cc/tech/12345.html');
assert(kknews.status === 'ai_farm' && kknews.badgeText.includes('AI 內容農場'), '每日頭條 kknews 標記為內容農場');

const read01 = assessLinkUrl('https://read01.com/p/12345.html');
assert(read01.status === 'ai_farm', '壹讀 read01 標記為內容農場');

const codenong = assessLinkUrl('https://www.codenong.com/cs123456/');
assert(codenong.status === 'ai_farm', '代碼農場 codenong 標記為內容農場');

const gigacircle = assessLinkUrl('https://tw.gigacircle.com/12345');
assert(gigacircle.status === 'ai_farm', 'gigacircle 標記為內容農場');

const suspiciousFarm = assessLinkUrl('https://contentfarm-dailyarticle.net/story/1');
assert(suspiciousFarm.status === 'ai_farm', '啟發式特徵匹配內容農場');

// 3. 安全與一般網站測試
const wiki = assessLinkUrl('https://zh.wikipedia.org/wiki/Taiwan');
assert(wiki.status === 'safe' && wiki.badgeText === '正常', '維基百科標記為正常');

const github = assessLinkUrl('https://github.com/facebook/react');
assert(github.status === 'safe', 'GitHub 標記為正常');

const randomBlog = assessLinkUrl('https://my-clean-personal-blog.io/post/1');
assert(randomBlog.status === 'safe' && randomBlog.badgeText === '正常', '一般個人網站預設為正常');

// 4. 無效/略過操作測試
const anchor = assessLinkUrl('#comments');
assert(anchor.status === 'ignored' && anchor.shouldShow === false, '頁面錨點 # 略過探測');

const jsVoid = assessLinkUrl('javascript:void(0)');
assert(jsVoid.status === 'ignored' && jsVoid.shouldShow === false, 'javascript 偽協議略過探測');

const empty = assessLinkUrl('');
assert(empty.status === 'invalid' && empty.shouldShow === false, '空字串判定無效');

// 5. SVG 向量圖示產出測試 (嚴格驗證無 Emoji)
const paywallSvg = getRadarSvgIcon('paywall');
const farmSvg = getRadarSvgIcon('ai_farm');
const safeSvg = getRadarSvgIcon('safe');

const containsEmojiRegex = /\p{Extended_Pictographic}/u;
assert(
  paywallSvg.startsWith('<svg') && !containsEmojiRegex.test(paywallSvg),
  'Paywall SVG 有效且零 Emoji'
);
assert(
  farmSvg.startsWith('<svg') && !containsEmojiRegex.test(farmSvg),
  'Farm SVG 有效且零 Emoji'
);
assert(
  safeSvg.startsWith('<svg') && !containsEmojiRegex.test(safeSvg),
  'Safe SVG 有效且零 Emoji'
);

console.log(`\n測試結果: 通過 ${passed} 項，失敗 ${failed} 項`);
if (failed > 0) {
  process.exit(1);
}
