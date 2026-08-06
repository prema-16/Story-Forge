const fs = require('fs');
const path = require('path');

// ── Fix nested dist structure if tsc output nesting happens ──────────────────
const srcDir = path.join(__dirname, '../dist/backend/src');
const targetDir = path.join(__dirname, '../dist');

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, targetDir, { recursive: true });
}

// ── Copy @storyforge/shared into node_modules for runtime resolution ─────────
// When deployed on Render (or any non-monorepo environment), npm workspace
// symlinks don't exist. We copy the built shared package dist directly into
// node_modules so `require('@storyforge/shared')` resolves at runtime.
const sharedDist = path.join(__dirname, '../../packages/shared/dist');
const sharedNodeModules = path.join(__dirname, '../node_modules/@storyforge/shared');
const sharedPkg = path.join(__dirname, '../../packages/shared/package.json');

if (fs.existsSync(sharedDist)) {
  console.log('[postbuild] Copying @storyforge/shared dist → node_modules...');
  fs.mkdirSync(sharedNodeModules, { recursive: true });
  fs.cpSync(sharedDist, path.join(sharedNodeModules, 'dist'), { recursive: true });
  if (fs.existsSync(sharedPkg)) {
    fs.copyFileSync(sharedPkg, path.join(sharedNodeModules, 'package.json'));
  }
  console.log('[postbuild] @storyforge/shared copied successfully.');
} else {
  console.warn('[postbuild] WARNING: packages/shared/dist not found. Build shared first!');
}
