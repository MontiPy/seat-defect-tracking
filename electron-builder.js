// electron-builder.js - Build configuration for Electron app
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Pre-build script to prepare the backend for packaging
async function prepareBuild() {
  console.log('Preparing build...');

  // Ensure backend dependencies are installed for production
  console.log('Installing backend dependencies for production...');
  
  const backendPath = path.join(__dirname, 'backend');
  
  return new Promise((resolve, reject) => {
    const npmInstall = spawn('npm', ['install', '--production'], {
      cwd: backendPath,
      stdio: 'inherit',
      shell: true,
    });

    npmInstall.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`npm install failed with code ${code}`));
        return;
      }
      console.log('Backend dependencies installed successfully');
      resolve();
    });
  });
}

// Post-build script to clean up
async function postBuild() {
  console.log('Post-build cleanup...');
  // Any cleanup tasks can go here
}

module.exports = {
  prepareBuild,
  postBuild,
};