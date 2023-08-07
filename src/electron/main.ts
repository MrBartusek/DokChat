import { BrowserWindow, Menu, Tray, app, nativeImage, shell } from 'electron';
import path from 'path';
import DeepLinkManager from './deepLinkManager';
import IPCManager from './ipcManger';
import store from './store';
import RichPresenceManager from './richPresenceManager';

if (require('electron-squirrel-startup')) app.quit();

const DEBUG_ENABLED = store.get('debug', false) == true || !app.isPackaged;

class DokChatDesktop {
	private mainWindow: BrowserWindow;
	private tray: Tray;
	private deepLinkManager: DeepLinkManager;
	private richPresenceManager: RichPresenceManager;
	private quitting: boolean;

	constructor() {
		this.deepLinkManager = new DeepLinkManager();
		this.richPresenceManager = new RichPresenceManager();
		this.quitting = false;
		this.registerLifecycleEvents();
		new IPCManager(this.richPresenceManager).register();
	}

	public start() {
		const gotLock = app.requestSingleInstanceLock();
		if (!gotLock) app.quit();

		app.whenReady()
			.then(async () => {
				const window = await this.createWindow();
				this.deepLinkManager.register(window);
				await this.richPresenceManager.start();
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
			icon: path.join(__dirname, '../favicon.ico')
		});

		this.mainWindow.setMenu(null);
		if(store.get('settings').theme == 'dark') {
			this.mainWindow.setBackgroundColor('#161e27');
		}

		if(!this.tray) this.createTray();

		this.mainWindow.on('close', (event: any): void => {
			if(!this.quitting) {
				this.mainWindow.hide();
				event.preventDefault();
			}
		});

		const indexLocation = path.join(__dirname, '../electron.html');

		if(DEBUG_ENABLED) {
			this.mainWindow.webContents.openDevTools();
		}

		this.mainWindow.loadFile(indexLocation);
		this.deepLinkManager.updateMainWindow(this.mainWindow);

		return this.mainWindow;
	}

	private createTray () {
		const icon = path.join(__dirname, '../favicon.ico');
		const trayIcon = nativeImage.createFromPath(icon);

		this.tray = new Tray(trayIcon.resize({ width: 16 }));
		this.tray.setToolTip('DokChat - Connect with anyone');
		this.tray.setTitle('DokChat');
		this.tray.on('click', () => this.mainWindow.show());

		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'DokChat Desktop',
				enabled: false,
				icon: trayIcon.resize({ width: 16 })
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

		app.on('second-instance', (event: any, commandLine: string[]) => {
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
