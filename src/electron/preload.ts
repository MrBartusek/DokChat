import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI } from '../types/electron';
import { Settings } from '../client/hooks/useSettings';

(async () => {
	const isPackaged = await ipcRenderer.invoke('is-packaged');

	contextBridge.exposeInMainWorld('electron', {
		openBrowser: (url: string) => ipcRenderer.send('open-browser', url),
		getConfig: () => ipcRenderer.invoke('get-config'),
		setToken: (token: string) => ipcRenderer.send('set-token', token),
		logout: () => ipcRenderer.send('logout'),
		updatePresence: ((title: string, details: string) => ipcRenderer.send('update-presence', title, details)),
		updateSettings: ((settings: Settings) => ipcRenderer.send('update-settings', settings)),
		isPackaged: isPackaged
	} as ElectronAPI);
})();
