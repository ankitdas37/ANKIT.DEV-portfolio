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
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    
    // Replace standard single quote string URLs
    // e.g. 'http://localhost:5000/api/projects' -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    
    // Replace standard double quote string URLs
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    
    // Replace occurrences already in template literals
    // e.g. `http://localhost:5000/api/projects/${id}` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/${id}`
    content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}');

    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});
console.log('Fixed API URLs in ' + changedFiles + ' files.');
