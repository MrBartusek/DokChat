import { BrowserWindow, app } from 'electron';
import path from 'path';
import DeepLinkManager from './deepLinkManager';
import IPCManager from './ipcManger';
import store from './store';
import RichPresenceManager from './richPresenceManager';

if (require('electron-squirrel-startup')) app.quit();

const DEBUG_ENABLED = store.get('debug', false) == true || !app.isPackaged;

class DokChatDesktop {
	private mainWindow: BrowserWindow;
	private deepLinkManager: DeepLinkManager;
	private richPresenceManager: RichPresenceManager;

	constructor() {
		this.deepLinkManager = new DeepLinkManager();
		this.richPresenceManager = new RichPresenceManager();
		this.registerLifecycleEvents();
		new IPCManager(this.richPresenceManager).register();
	}

	public start() {
		const gotLock = app.requestSingleInstanceLock();
		if (!gotLock) app.quit();

		app.whenReady().then(async () => await this.createWindow());
	}

	private async createWindow(): Promise<BrowserWindow> {
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
		this.deepLinkManager.register(this.mainWindow);
		await this.richPresenceManager.start();

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
