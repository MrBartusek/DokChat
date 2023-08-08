import { BrowserWindow, app } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import SessionManager from './sessionManager';

class DeepLinkManager {
	private authProtocol: string;
	private mainWindow: BrowserWindow;

	constructor() {
		this.authProtocol = isDev ? 'dokchat-dev' : 'dokchat';
	}

	public register(mainWindow: BrowserWindow): void {
		this.mainWindow = mainWindow;
		this.registerAsProtocolHandler();
		this.registerUrlHandlers();
	}

	private handleDeepLink(url: string) {
		const firstUrlPart = `${this.authProtocol}://auth/login`;
		if(!url.startsWith(firstUrlPart)) return;

		const queryString = url.replace(firstUrlPart, '');
		const urlParams = new URLSearchParams(queryString);

		SessionManager.login(urlParams.get('token'), urlParams.get('refreshToken'));

		this.mainWindow?.webContents.reload();
		console.log('Successfully handoff');
	}

	private registerAsProtocolHandler(): void {
		if (process.defaultApp) {
			if (process.argv.length >= 2) {
				app.setAsDefaultProtocolClient(this.authProtocol, process.execPath, [ path.resolve(process.argv[1]) ]);
			}
		}
		else {
			app.setAsDefaultProtocolClient(this.authProtocol);
		}
	}

	private registerUrlHandlers() {
		app.on('second-instance', (event: any, commandLine: string[]) => {
			const url = commandLine.pop();
			this.handleDeepLink(url);
		});

		app.on('open-url', (event, url) => {
			this.handleDeepLink(url);
		});
	}
}

export default DeepLinkManager;
