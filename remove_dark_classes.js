const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : 
      callback(path.join(dir, f));
  });
}

function removeDarkClasses(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  const original = fs.readFileSync(filePath, 'utf8');
  // Match `dark:` followed by any characters that are not a space, quote, backtick, or curly brace
  let modified = original.replace(/(^|\s)dark:[^\s"'\`\}]+/g, '');
  // Clean up any double spaces that might have formed in class strings
  modified = modified.replace(/ {2,}/g, ' ');

  if (original !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src'), removeDarkClasses);
walkDir(path.join(__dirname, 'components'), (file) => {
  // if components exist outside src
  if (fs.existsSync(file)) removeDarkClasses(file);
});
console.log('Done stripping dark mode classes!');
