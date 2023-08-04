const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	openBrowser: (url) => ipcRenderer.send('open-browser', url)
});
