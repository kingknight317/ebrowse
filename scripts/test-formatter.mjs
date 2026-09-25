import {
  encodeTextFragment,
  generateTextFragmentDirective,
  attachTextFragment,
  formatQuote
} from '../lib/formatter.js';

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

console.log('--- 開始測試 Text Fragment Linking ---');

// 1. 特殊字元百分比編碼
const encodedHyphen = encodeTextFragment('hello-world, nice&clean');
assert(
  encodedHyphen.includes('%2D') && encodedHyphen.includes('%2C') && encodedHyphen.includes('%26'),
  `特殊字元編碼: ${encodedHyphen}`
);

// 2. 短中文詞彙 (完全匹配)
const shortZh = '這是一段精彩測試';
const dShortZh = generateTextFragmentDirective(shortZh);
assert(dShortZh === `text=${encodeURIComponent('這是一段精彩測試')}`, `短中文詞彙完全匹配: ${dShortZh}`);

// 3. 長中文段落 (首尾區間匹配)
const longZh = '在長篇報導或學術論文中，使用者常需要向同事或朋友分享文章中的關鍵段落與論述。';
const dLongZh = generateTextFragmentDirective(longZh);
assert(
  dLongZh.startsWith('text=') && dLongZh.includes(','),
  `長中文段落產生首尾區間: ${dLongZh}`
);

// 4. 短英文詞彙
const shortEn = 'clean link share';
const dShortEn = generateTextFragmentDirective(shortEn);
assert(dShortEn === `text=clean%20link%20share`, `短英文完全匹配: ${dShortEn}`);

// 5. 長英文句子 (首尾 3 詞區間)
const longEn = 'The quick brown fox jumps over the lazy dog and runs away happily';
const dLongEn = generateTextFragmentDirective(longEn);
assert(
  dLongEn === 'text=The%20quick%20brown,runs%20away%20happily',
  `長英文首尾 3 詞區間: ${dLongEn}`
);

// 6. 網址拼接 - 一般無 Hash 網址
const url1 = 'https://example.com/article';
const attached1 = attachTextFragment(url1, '重點段落');
assert(attached1.startsWith('https://example.com/article#:~:text='), `一般網址拼接 #:~:text=: ${attached1}`);

// 7. 網址拼接 - 已有 Hash 網址
const url2 = 'https://example.com/article#section-intro';
const attached2 = attachTextFragment(url2, '重點段落');
assert(
  attached2.startsWith('https://example.com/article#section-intro:~:text='),
  `已有 Hash 網址以 :~:text= 拼接: ${attached2}`
);

// 8. 網址拼接 - 已有舊 text 錨點需更新
const url3 = 'https://example.com/article#:~:text=old%20quote';
const attached3 = attachTextFragment(url3, 'new quote');
assert(
  attached3 === 'https://example.com/article#:~:text=new%20quote',
  `更新已有舊錨點: ${attached3}`
);

// 9. formatQuote 當無反白 (hasSelection: false) 時不附加錨點
const quoteNoSel = formatQuote('標題名稱', '標題名稱', 'https://example.com', {
  enableTextFragment: true,
  hasSelection: false
});
assert(
  quoteNoSel.plainText.includes('— https://example.com') && !quoteNoSel.plainText.includes(':~:text='),
  `無反白 (hasSelection: false) 時保持純淨網址: ${quoteNoSel.plainText}`
);

// 10. formatQuote 當有反白 (hasSelection: true) 時附加錨點
const quoteWithSel = formatQuote('精選引言句子', '標題', 'https://example.com', {
  enableTextFragment: true,
  hasSelection: true
});
assert(
  quoteWithSel.plainText.includes(':~:text=') && quoteWithSel.html.includes('href="https://example.com#:~:text='),
  `有反白時附帶錨點: ${quoteWithSel.plainText}`
);

// 11. formatQuote 當使用者關閉開關 (enableTextFragment: false) 時不附加錨點
const quoteDisabled = formatQuote('精選引言句子', '標題', 'https://example.com', {
  enableTextFragment: false,
  hasSelection: true
});
assert(
  !quoteDisabled.plainText.includes(':~:text='),
  `開關關閉時不附帶錨點: ${quoteDisabled.plainText}`
);

// 12. formatBatchUrls
import { formatBatchUrls, formatBatchMarkdown, formatBatchQuotes } from '../lib/formatter.js';
const sampleTabs = [
  { title: 'Google', url: 'https://www.google.com/search?q=test' },
  { title: 'Shopee [特惠]', url: 'https://shopee.tw/product/1/2' }
];
const batchUrls = formatBatchUrls(sampleTabs);
assert(
  batchUrls === 'https://www.google.com/search?q=test\nhttps://shopee.tw/product/1/2',
  `批次純網址輸出格式正確`
);

// 13. formatBatchMarkdown
const batchMd = formatBatchMarkdown(sampleTabs);
assert(
  batchMd === '- [Google](https://www.google.com/search?q=test)\n- [Shopee \\[特惠\\]](https://shopee.tw/product/1/2)',
  `批次 Markdown 條列格式正確 (含括號轉義)`
);

// 14. formatBatchQuotes
const batchQuotes = formatBatchQuotes(sampleTabs);
assert(
  batchQuotes.plainText.includes('> Google\n— https://www.google.com') && batchQuotes.html.includes('<blockquote'),
  `批次引言輸出格式正確 (純文字與 HTML)`
);

console.log(`\n測試結果: 通過 ${passed} 項，失敗 ${failed} 項`);
if (failed > 0) process.exit(1);
