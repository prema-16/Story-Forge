const fs = require('fs');
const path = require('path');

// ── Fix nested dist structure if tsc emits backend/src/ nesting ─────────────
const srcDir = path.join(__dirname, '../dist/backend/src');
const targetDir = path.join(__dirname, '../dist');
if (fs.existsSync(srcDir)) {
  console.log('[postbuild] Flattening nested dist structure...');
  fs.cpSync(srcDir, targetDir, { recursive: true });
}

// ── Ensure @storyforge/shared is in node_modules at runtime ─────────────────
// When rootDir=backend, npm copies the file: dep but doesn't build it.
// We need packages/shared/dist to exist. Try multiple relative paths since
// the working dir can differ between local builds and Render's rootDir context.
const possibleSharedRoots = [
  path.join(__dirname, '../../packages/shared'),  // from backend/scripts/ → repo root
  path.join(__dirname, '../packages/shared'),      // from backend/ → repo root
  path.join(process.cwd(), 'packages/shared'),     // from wherever npm was invoked
  path.join(process.cwd(), '../packages/shared'),  // one level up from cwd
];

const sharedRoot = possibleSharedRoots.find(p => fs.existsSync(path.join(p, 'dist')));
const sharedNodeModules = path.join(__dirname, '../node_modules/@storyforge/shared');

if (sharedRoot) {
  const sharedDist = path.join(sharedRoot, 'dist');
  const sharedPkg  = path.join(sharedRoot, 'package.json');

  // Only copy if npm didn't already wire it up correctly
  const alreadyLinked = fs.existsSync(path.join(sharedNodeModules, 'dist', 'index.js'));
  if (!alreadyLinked) {
    console.log(`[postbuild] Copying @storyforge/shared dist from ${sharedRoot} → node_modules...`);
    fs.mkdirSync(sharedNodeModules, { recursive: true });
    fs.cpSync(sharedDist, path.join(sharedNodeModules, 'dist'), { recursive: true });
    if (fs.existsSync(sharedPkg)) {
      fs.copyFileSync(sharedPkg, path.join(sharedNodeModules, 'package.json'));
    }
    console.log('[postbuild] @storyforge/shared copied successfully.');
  } else {
    console.log('[postbuild] @storyforge/shared already present in node_modules, skipping copy.');
  }
} else {
  console.error('[postbuild] ERROR: Could not find packages/shared/dist in any expected location!');
  console.error('[postbuild] Searched:', possibleSharedRoots);
  process.exit(1);
}
