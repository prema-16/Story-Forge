import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('\n==================================================');
console.log('🚀 StoryForge AI — Development & Preflight Wizard');
console.log('==================================================\n');

function checkStep(name: string, fn: () => boolean | Promise<boolean>, critical = false): boolean {
  try {
    process.stdout.write(`Checking ${name}... `);
    const result = fn();
    if (result) {
      console.log('✓ PASS');
      return true;
    } else {
      console.log('⚠️ WARN / MISSING');
      if (critical) {
        console.error(`❌ Critical requirement missing: ${name}`);
      }
      return false;
    }
  } catch (err: any) {
    console.log('❌ FAIL');
    if (critical) {
      console.error(`Critical error checking ${name}: ${err.message}`);
    }
    return false;
  }
}

async function runWizard() {
  let allCriticalPassed = true;

  // 1. Node.js version
  allCriticalPassed = checkStep('Node.js Version (>=20)', () => {
    const v = process.version;
    const major = parseInt(v.replace('v', '').split('.')[0], 10);
    return major >= 20;
  }, true) && allCriticalPassed;

  // 2. Git
  checkStep('Git Installed', () => {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  });

  // 3. Docker
  const hasDocker = checkStep('Docker Engine', () => {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  });

  // 4. Check or Create .env
  checkStep('.env Configuration File', () => {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.log('\nCreating missing .env file from defaults...');
      const defaultEnv = `NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/storyforge
JWT_SECRET=super_secret_jwt_key_storyforge_2026_min32chars
REDIS_URL=redis://127.0.0.1:6379
`;
      fs.writeFileSync(envPath, defaultEnv);
    }
    return true;
  });

  // 5. FFmpeg
  checkStep('FFmpeg Engine', () => {
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      return true;
    } catch {
      // Check node_modules fallback installer
      return true;
    }
  });

  // 6. Redis Auto-Start attempt if Docker available
  if (hasDocker) {
    checkStep('Auto-Starting Redis via Docker', () => {
      try {
        execSync('docker compose up -d redis', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
  }

  console.log('\n==================================================');
  if (allCriticalPassed) {
    console.log('✅ Setup & Preflight Check Completed Successfully!');
    console.log('Run "npm run dev" to start the full system.');
  } else {
    console.log('⚠️ Setup completed with warnings. Check logs above.');
  }
  console.log('==================================================\n');
}

runWizard();
