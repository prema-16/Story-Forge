const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../dist/backend/src');
const targetDir = path.join(__dirname, '../dist');

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, targetDir, { recursive: true });
}
