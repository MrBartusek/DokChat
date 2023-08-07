import { BrowserWindow, app } from 'electron';
import path from 'path';
import DeepLinkManager from './deepLinkManager';
import IPCManager from './ipcManger';
import store from './store';

if (require('electron-squirrel-startup')) app.quit();

const DEBUG_ENABLED = store.get('debug', false) == true || !app.isPackaged;

class DokChatDesktop {
	private mainWindow: BrowserWindow;
	private deepLinkHandler: DeepLinkManager;

	constructor() {
		this.deepLinkHandler = new DeepLinkManager();
		this.registerLifecycleEvents();
		new IPCManager().register();
	}

	public start() {
		const gotLock = app.requestSingleInstanceLock();
		if (!gotLock) app.quit();

		app.whenReady().then(() => this.createWindow());
	}

	private createWindow(): BrowserWindow {
		this.mainWindow = new BrowserWindow({
			width: 1280,
			height: 720,
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
			},
			icon: path.join(__dirname, 'favicon.ico'),
			autoHideMenuBar: true
		});

		const indexLocation = path.join(__dirname, '../electron.html');
		this.mainWindow.loadFile(indexLocation);
		this.deepLinkHandler.register(this.mainWindow);

		if(DEBUG_ENABLED) {
			this.mainWindow.webContents.openDevTools();
		}

		return this.mainWindow;
	}

	private registerLifecycleEvents() {
		// macOS Compatibility
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
	}

}

new DokChatDesktop().start();
