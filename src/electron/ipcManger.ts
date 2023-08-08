import { BrowserWindow, app, ipcMain, shell } from 'electron';
import SessionManager from './sessionManager';
import store from './store';
import RichPresenceManager from './richPresenceManager';
import { ElectronPresenceConfig } from '../types/electron';
import { Settings } from '../client/hooks/useSettings';

class IPCManager {
	private richPresenceManager: RichPresenceManager;
	private mainWindow: BrowserWindow;

	constructor(richPresenceManager: RichPresenceManager) {
		this.richPresenceManager = richPresenceManager;
	}

	public register(): IPCManager {
		ipcMain.handle('get-config', () => {
			return {
				refreshToken: store.get('refreshToken'),
				token: store.get('token'),
				disableAutoLogin: store.get('disableAutoLogin', false)
			};
		});

		ipcMain.on('open-browser', (e: any, url: string) => shell.openExternal(url));

		ipcMain.handle('is-packaged', () => app.isPackaged);

		ipcMain.on('set-token', (e: any, token: string) => SessionManager.updateToken(token));

		ipcMain.on('logout', SessionManager.logout);

		ipcMain.on('update-presence', (e: any, config: ElectronPresenceConfig) => {
			this.richPresenceManager.updatePresence(config);
		});

		ipcMain.on('update-settings', (e: any, settings: Settings) => {
			store.set('settings', settings);
		});

		return this;
	}

	public registerBasedOnWindow(mainWindow: BrowserWindow): IPCManager {
		this.mainWindow = mainWindow;

		ipcMain.handle('is-focused', () => this.mainWindow.isFocused());

		return this;
	}
}

export default IPCManager;
