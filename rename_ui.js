const fs = require('fs');
const path = require('path');

const targetExts = ['.ts', '.tsx', '.css'];

const replacements = [
  { from: /GRAVITAS/g, to: 'Clauhire' },
  { from: /Gravitas/g, to: 'Clauhire' },
  { from: /GAIA/g, to: 'Claura' },
  { from: /Gaia/g, to: 'Claura' },
  { from: /gaia/g, to: 'claura' },
  { from: /gravitas/g, to: 'clauhire' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (targetExts.includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;

      for (const { from, to } of replacements) {
        newContent = newContent.replace(from, to);
      }

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

// Ensure the root src folder is parsed
processDirectory(path.join(process.cwd(), 'src'));
console.log('Renaming complete.');
