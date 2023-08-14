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
				autoLogin: store.get('autoLogin', false)
			};
		});

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

		ipcMain.on('focus', () => {
			console.log('call');
			this.mainWindow.show();
			this.mainWindow.focus();
		});

		return this;
	}
}

export default IPCManager;
