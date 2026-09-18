const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // We use regex to be more forgiving with quotes
  // We are looking for: ${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}
  // And we want to replace it with: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
  
  const brokenRegex = /\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*['"]\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*['"]http:\/\/localhost:5000['"]\}['"]\}/g;
  const fixedStr = "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}";
  
  if (brokenRegex.test(content)) {
    content = content.replace(brokenRegex, fixedStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
    fixed++;
  }
});
console.log('Fixed ' + fixed + ' files.');
