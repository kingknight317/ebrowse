import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = getFiles('.');
let missingRefs = [];
let totalChecked = 0;

allFiles.forEach(file => {
  const ext = path.extname(file);
  const dir = path.dirname(file);
  const content = fs.readFileSync(file, 'utf-8');

  // Check ES imports
  if (ext === '.js' || ext === '.mjs') {
    const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith('.')) {
        totalChecked++;
        const resolved = path.resolve(dir, target);
        if (!fs.existsSync(resolved)) {
          missingRefs.push({ file, target, resolved });
        }
      }
    }
  }

  // Check HTML script/link tags
  if (ext === '.html') {
    const srcRegex = /(?:src|href)=['"]([^'"]+)['"]/g;
    let match;
    while ((match = srcRegex.exec(content)) !== null) {
      const target = match[1];
      if (!target.startsWith('http') && !target.startsWith('data:') && !target.startsWith('#') && !target.startsWith('javascript:')) {
        totalChecked++;
        const resolved = path.resolve(dir, target);
        if (!fs.existsSync(resolved)) {
          missingRefs.push({ file, target, resolved });
        }
      }
    }
  }
});

console.log(`掃描檔案總數: ${allFiles.length}`);
console.log(`檢查之檔案引用總數: ${totalChecked}`);

if (missingRefs.length > 0) {
  console.error('發現遺失的引用:', missingRefs);
  process.exit(1);
} else {
  console.log('專案內所有 JS 模組引用與 HTML 資源連結 100% 完整無遺失！');
}
