const fs = require('fs');

const files = [
  'src/lib/email.ts',
  'src/app/api/gaia/route.ts',
  'src/lib/matching.ts',
  'src/app/api/match/route.ts'
];

files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  // Replace literal '\`' with '`'
  text = text.replace(/\\\`/g, '\`');
  // Replace literal '\$' with '$'
  text = text.replace(/\\\$/g, '$');
  // There seem to be literal \n as well, but maybe they are fine. Let's make sure.
  fs.writeFileSync(f, text);
});
console.log("Fixed escaping issues!");
