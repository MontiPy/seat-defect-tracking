#!/usr/bin/env node
// build.js - Main build script for the desktop application

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n🔹 ${step}`, colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Execute command and return promise
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

// Build steps
async function buildFrontend() {
  logStep('Building React frontend');
  await executeCommand('npm', ['run', 'build'], {
    cwd: path.join(__dirname, '..', 'frontend'),
  });
  logSuccess('Frontend build completed');
}

async function prepareBundledBackend() {
  logStep('Preparing backend for bundling');
  
  // Copy backend to build directory (excluding node_modules and dev files)
  const backendSrc = path.join(__dirname, '..', 'backend');
  const buildDir = path.join(__dirname, '..', 'dist-backend');
  
  // Clean build directory if it exists
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  
  // Create build directory
  fs.mkdirSync(buildDir, { recursive: true });
  
  // Copy backend files
  const filesToCopy = [
    'src',
    'migrations', 
    'seeds',
    'package.json',
    'knexfile.js',
  ];
  
  for (const file of filesToCopy) {
    const srcPath = path.join(backendSrc, file);
    const destPath = path.join(buildDir, file);
    
    if (fs.existsSync(srcPath)) {
      if (fs.lstatSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  // Install production dependencies for the backend
  await executeCommand('npm', ['install', '--production'], {
    cwd: buildDir,
  });
  
  logSuccess('Backend prepared for bundling');
}

async function buildElectronApp(platform = 'current') {
  logStep(`Building Electron application for ${platform}`);
  
  const args = ['run'];
  
  switch (platform) {
    case 'win':
      args.push('dist-win');
      break;
    case 'mac':
      args.push('dist-mac');
      break;
    case 'linux':
      args.push('dist-linux');
      break;
    case 'all':
      args.push('dist-all');
      break;
    default:
      args.push('dist');
  }
  
  await executeCommand('npm', args, {
    cwd: path.join(__dirname, '..'),
  });
  
  logSuccess(`Electron build completed for ${platform}`);
}

async function checkPrerequisites() {
  logStep('Checking prerequisites');
  
  // Check if icons exist
  const assetsDir = path.join(__dirname, '..', 'assets');
  const requiredIcons = ['icon.png'];  // At minimum need PNG for Linux
  const missingIcons = [];
  
  for (const icon of requiredIcons) {
    const iconPath = path.join(assetsDir, icon);
    if (!fs.existsSync(iconPath)) {
      missingIcons.push(icon);
    }
  }
  
  if (missingIcons.length > 0) {
    logWarning(`Missing icons: ${missingIcons.join(', ')}`);
    logWarning('Add icon files to the assets/ directory for better distribution');
  }
  
  logSuccess('Prerequisites checked');
}

// Main build function
async function build() {
  try {
    log('\n🚀 Building Seat Defect Tracking Desktop Application\n', colors.bright);
    
    const platform = process.argv[2] || 'current';
    
    await checkPrerequisites();
    await buildFrontend();
    await prepareBundledBackend();
    await buildElectronApp(platform);
    
    log('\n🎉 Build completed successfully!', colors.green);
    log('\nDistribution files can be found in the dist/ directory', colors.blue);
    
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  build();
}

module.exports = { build };