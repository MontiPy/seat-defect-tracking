const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let backendServer;
let serverPort = 3001;

// Configure auto updater for production builds
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}

// Create the main application window
function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'), // We'll create this file
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add app icon
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the React application
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `http://localhost:${serverPort}`;
    
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start the backend Express server
function startBackendServer() {
  return new Promise((resolve, reject) => {
    // In development, the backend runs separately
    if (isDev) {
      resolve(3001);
      return;
    }

    // In production, start the backend server bundled with the app
    const serverPath = path.join(__dirname, 'backend', 'src', 'app.js');
    
    // Set environment variables for the backend
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: serverPort,
      // Configure paths relative to user data directory
      SQLITE_DATABASE_PATH: path.join(app.getPath('userData'), 'database.sqlite'),
      UPLOADS_PATH: path.join(app.getPath('userData'), 'uploads'),
      LOGS_PATH: path.join(app.getPath('userData'), 'logs'),
    };

    backendServer = spawn('node', [serverPath], {
      env,
      cwd: path.join(__dirname, 'backend'),
    });

    backendServer.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendServer.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendServer.on('close', (code) => {
      console.log(`Backend server exited with code ${code}`);
    });

    // Wait for server to start (simplified - in production you'd want better detection)
    setTimeout(() => {
      resolve(serverPort);
    }, 2000);
  });
}

// Find an available port for the backend server
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error(`Unable to find available port starting from ${startPort}`));
    }, 5000);
    
    server.on('error', (err) => {
      clearTimeout(timeout);
      server.close();
      findAvailablePort(startPort + 1)
        .then(resolve)
        .catch(reject);
    });
    
    server.listen(startPort, () => {
      clearTimeout(timeout);
      const port = server.address().port;
      server.close();
      resolve(port);
    });
  });
}

// Create application menu
function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Seat Defect Tracking',
          click: () => {
            // Show about dialog
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Seat Defect Tracking System',
              detail: 'A comprehensive defect tracking system for automotive manufacturing.',
            });
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Initialize the application
async function initialize() {
  try {
    // Find available port for backend
    if (!isDev) {
      serverPort = await findAvailablePort(3001);
    }

    // Start backend server
    await startBackendServer();

    // Create main window
    createMainWindow();

    // Create application menu
    createApplicationMenu();

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
}

// App event handlers
app.whenReady().then(initialize);

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  // Clean up backend server when quitting
  if (backendServer) {
    backendServer.kill();
  }
});

// Handle IPC messages from renderer process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name);
});

// Auto-updater events (for production)
if (!isDev) {
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
  });

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    autoUpdater.quitAndInstall();
  });
}