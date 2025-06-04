const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showFederationDialog: () => ipcRenderer.invoke('show-federation-dialog'),
  
  // Menu event listeners
  onMenuNewRace: (callback) => ipcRenderer.on('menu-new-race', callback),
  onMenuPractice: (callback) => ipcRenderer.on('menu-practice', callback),
  onMenuFederationConnect: (callback) => ipcRenderer.on('menu-federation-connect', callback),
  onMenuStartServer: (callback) => ipcRenderer.on('menu-start-server', callback),
  onMenuFederationSettings: (callback) => ipcRenderer.on('menu-federation-settings', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});