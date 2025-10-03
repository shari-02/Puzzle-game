const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),

  // Menu event listeners
  onMenuNewGame: (callback) => ipcRenderer.on('menu-new-game', callback),
  onMenuShuffle: (callback) => ipcRenderer.on('menu-shuffle', callback),
  onMenuExportData: (callback) => ipcRenderer.on('menu-export-data', callback),
  onMenuImportData: (callback) => ipcRenderer.on('menu-import-data', callback),
  onMenuGameMode: (callback) => ipcRenderer.on('menu-game-mode', callback),
  onMenuTutorial: (callback) => ipcRenderer.on('menu-tutorial', callback),
  onMenuDashboard: (callback) => ipcRenderer.on('menu-dashboard', callback),
  onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),
  onMenuKeyboardShortcuts: (callback) => ipcRenderer.on('menu-keyboard-shortcuts', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Platform info
  platform: process.platform,
  isElectron: true
});
