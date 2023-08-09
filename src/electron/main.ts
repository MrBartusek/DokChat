import { BrowserWindow, Menu, Tray, app, nativeImage, shell } from 'electron';
import path from 'path';
import DeepLinkManager from './deepLinkManager';
import IPCManager from './ipcManger';
import store from './store';
import RichPresenceManager from './richPresenceManager';
import updateElectronApp from 'update-electron-app';
import { DEFAULT_SETTINGS } from '../client/hooks/useSettings';

if (require('electron-squirrel-startup')) app.quit();

const DEBUG_ENABLED = store.get('debug', false) == true || !app.isPackaged;

class DokChatDesktop {
	private mainWindow: BrowserWindow;
	private tray: Tray;
	private deepLinkManager: DeepLinkManager;
	private richPresenceManager: RichPresenceManager;
	private quitting: boolean;
	private ipcManager: IPCManager;

	constructor() {
		this.deepLinkManager = new DeepLinkManager();
		this.richPresenceManager = new RichPresenceManager();
		this.quitting = false;
		this.ipcManager = new IPCManager(this.richPresenceManager).register();
		this.registerLifecycleEvents();
	}

	public start() {
		const gotLock = app.requestSingleInstanceLock();
		if (!gotLock) app.quit();

		updateElectronApp();

		app.whenReady()
			.then(async () => {
				const window = await this.createWindow();
				this.deepLinkManager.register(window);
				await this.richPresenceManager.start(this.mainWindow);
				this.ipcManager.registerBasedOnWindow(this.mainWindow);
			});

		const settings = store.get('settings', DEFAULT_SETTINGS);
		app.setLoginItemSettings({
			openAtLogin: settings.openOnStartup,
			openAsHidden: settings.startMinimized,
			path: app.getPath('exe')
		});
	}

	private async createWindow(): Promise<BrowserWindow> {
		if(this.mainWindow) return;

		this.mainWindow = new BrowserWindow({
			width: 1280,
			height: 720,
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
			},
			icon: path.join(__dirname, '../img/icons/64.png')
		});

		const settings = store.get('settings', DEFAULT_SETTINGS);

		if(settings.theme == 'dark') {
			this.mainWindow.setBackgroundColor('#161e27');
		}

		if(!this.tray) this.createTray();
		this.mainWindow.setMenu(null);

		this.mainWindow.on('close', (event: any): void => {
			const minimizeToTray = settings.minimizeToTray;
			if(!this.quitting && minimizeToTray) {
				this.mainWindow.hide();
				event.preventDefault();
			}
		});

		const indexLocation = path.join(__dirname, '../electron.html');

		if(DEBUG_ENABLED) {
			this.mainWindow.webContents.openDevTools();
		}

		this.mainWindow.loadFile(indexLocation);

		return this.mainWindow;
	}

	private createTray () {
		const icon = path.join(__dirname, '../img/icons/64.png');
		const trayIcon = nativeImage.createFromPath(icon).resize({width: 16});

		this.tray = new Tray(trayIcon);
		this.tray.setToolTip('DokChat - Connect with anyone');
		this.tray.setTitle('DokChat');
		this.tray.on('click', () => this.mainWindow.show());

		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'DokChat Desktop',
				enabled: false,
				icon: trayIcon
			},
			{
				type: 'separator'
			},
			{
				label: 'Privacy Policy',
				click: () => shell.openExternal('https://dokchat.dokurno.dev/privacy-policy')
			},
			{
				label: 'Github',
				click: () => shell.openExternal('https://github.com/MrBartusek/DokChat')
			},
			{
				type: 'separator'
			},
			{
				label: 'Quit DokChat Desktop',
				click: () => {
					app.quit();
				}
			}
		]);

		this.tray.setContextMenu(contextMenu);
	}

	private registerLifecycleEvents() {
		// macOS Compatibility
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});

		app.on('second-instance', () => {
			if (this.mainWindow) {
				if (this.mainWindow.isMinimized()) this.mainWindow.restore();
				this.mainWindow.focus();
			}
		});

		app.on('activate', () => { this.mainWindow.show(); });
		app.on('before-quit', () => this.quitting = true);
	}

}

new DokChatDesktop().start();
