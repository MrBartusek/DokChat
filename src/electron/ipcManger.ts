import { app, ipcMain, shell } from 'electron';
import SessionManager from './sessionManager';
import store from './store';

class IPCManager {
	public register(): void {
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
	}

}

export default IPCManager;
