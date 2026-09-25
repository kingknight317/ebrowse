/**
 * CleanLink & QuickShare - Test Suite for i18n
 */
import {
  DICTIONARY,
  SUPPORTED_LANGUAGES,
  t,
  getBrowserLanguage
} from '../lib/i18n.js';

console.log('--- 開始測試 Multi-Language i18n Module ---');

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

// 1. 語言清單檢驗
assert(SUPPORTED_LANGUAGES.length === 5, '支援 5 組語言選項 (auto, zh-TW, zh-CN, en, ja)');
assert(SUPPORTED_LANGUAGES.some(l => l.code === 'auto'), '包含 auto 自動選項');

// 2. 核心字典鍵值完整性檢驗 (zh-TW 基準)
const baseKeys = Object.keys(DICTIONARY['zh-TW']);
assert(baseKeys.length >= 80, `zh-TW 基礎字典具備 ${baseKeys.length} 個語系鍵`);

['zh-CN', 'en', 'ja'].forEach(lang => {
  const dict = DICTIONARY[lang];
  let missing = [];
  baseKeys.forEach(k => {
    if (dict[k] === undefined) {
      missing.push(k);
    }
  });
  assert(missing.length === 0, `${lang} 字典無缺失鍵 (缺失: ${missing.join(', ') || '無'})`);
});

// 3. 翻譯與變數插值測試
assert(t('urlCard.savings', { pct: 45 }, 'zh-TW') === '省下 45%', 'zh-TW 變數插值正確');
assert(t('urlCard.savings', { pct: 45 }, 'en') === '45% Saved', 'en 變數插值正確');
assert(t('urlCard.savings', { pct: 45 }, 'ja') === '45% 削減', 'ja 變數插值正確');
assert(t('urlCard.savings', { pct: 45 }, 'zh-CN') === '节省 45%', 'zh-CN 變數插值正確');

// 4. 缺少變數容錯與未知鍵 Fallback 測試
assert(t('non.existent.key', {}, 'en') === 'non.existent.key', '未知鍵原樣返回');
assert(t('brand.name', {}, 'en') === 'CleanLink', '英文品牌名稱正確');
assert(t('brand.name', {}, 'ja') === 'CleanLink', '日文品牌名稱正確');

// 5. 瀏覽器語系自動推導測試
assert(typeof getBrowserLanguage() === 'string', '瀏覽器語系偵測能返回字串');

console.log(`\ni18n 測試結果: 通過 ${passed} 項，失敗 ${failed} 項`);
if (failed > 0) process.exit(1);
