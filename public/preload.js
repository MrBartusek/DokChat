const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	openBrowser: (url) => ipcRenderer.send('open-browser', url),
	getConfig: () => ipcRenderer.invoke('get-config'),
	setToken: (token) => ipcRenderer.send('set-token', token),
	logout: () => ipcRenderer.send('logout')
});
