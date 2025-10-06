#!/usr/bin/env node
// dev.js - Development script for the desktop application

const { spawn } = require('child_process');
const path = require('path');

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute command and return child process
function executeCommand(name, command, args, options = {}) {
  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    ...options,
  });

  // Color-coded output by service
  const serviceColors = {
    'Frontend': colors.cyan,
    'Backend': colors.yellow,
    'Electron': colors.magenta,
  };

  const serviceColor = serviceColors[name] || colors.reset;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(`[${name}] ${line}`, serviceColor);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(`[${name}] ${line}`, colors.red);
    });
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      log(`[${name}] Process exited with code ${code}`, colors.red);
    } else {
      log(`[${name}] Process completed successfully`, colors.green);
    }
  });

  return proc;
}

// Start development environment
async function startDev() {
  log('\n🚀 Starting Seat Defect Tracking Development Environment\n', colors.bright);

  const rootDir = path.join(__dirname, '..');
  const frontendDir = path.join(rootDir, 'frontend');
  const backendDir = path.join(rootDir, 'backend');

  log('Starting services...', colors.blue);

  // Start frontend development server
  const frontendProc = executeCommand(
    'Frontend',
    'npm',
    ['start'],
    { cwd: frontendDir }
  );

  // Start backend development server  
  const backendProc = executeCommand(
    'Backend',
    'npm',
    ['run', 'dev'],
    { cwd: backendDir }
  );

  // Wait for services to start, then launch Electron
  log('\nWaiting for services to start...', colors.yellow);
  
  setTimeout(() => {
    log('\nLaunching Electron...', colors.magenta);
    
    const electronProc = executeCommand(
      'Electron',
      'npm',
      ['run', 'electron'],
      { cwd: rootDir }
    );

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\nShutting down development environment...', colors.yellow);
      
      frontendProc.kill();
      backendProc.kill();
      electronProc.kill();
      
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });

  }, 5000); // Give services 5 seconds to start

  log('\n💡 Development environment started!', colors.green);
  log('📝 Press Ctrl+C to stop all services', colors.blue);
}

// Run if called directly
if (require.main === module) {
  startDev().catch((error) => {
    log(`Failed to start development environment: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { startDev };