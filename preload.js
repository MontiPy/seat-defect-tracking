const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),

  // Menu events
  onMenuNewProject: (callback) => {
    ipcRenderer.on('menu-new-project', callback);
    // Return a cleanup function
    return () => ipcRenderer.removeListener('menu-new-project', callback);
  },

  // Platform information
  platform: process.platform,
  
  // Environment
  isDev: process.env.NODE_ENV !== 'production',
});