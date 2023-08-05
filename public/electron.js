const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Handle windows uninstall
if (require('electron-squirrel-startup')) app.quit();

const authProtocol = isDev ? 'dokchat-dev' : 'dokchat';
let mainWindow;

function main() {
	const gotLock = app.requestSingleInstanceLock();
	if (!gotLock) {app.quit();}

	registerDefaultProtocolClient(authProtocol);

	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}

		const url = commandLine.pop();
		passAuthToken(url);
	});

	app.on('open-url', (event, url) => {
		passAuthToken(url);
	});

	app.whenReady().then(() => {
		createWindow();
	});
}

ipcMain.on('open-browser', (event, url) => {
	shell.openExternal(url);
});

function passAuthToken(url) {
	const firstUrlPart = `${authProtocol}://auth/login?token=`;
	if(!url.startsWith(firstUrlPart)) {
		dialog.showErrorBox(
			'DokChat Auth Error',
			'Invalid deep url passed to client, please clean your browser cache'
		);
		return;
	}
	const token = url.replace(firstUrlPart, '');
	dialog.showErrorBox('Deep Link Success', `token is ${token}`);

}

function registerDefaultProtocolClient(protocol) {
	if (process.defaultApp) {
		if (process.argv.length >= 2) {
			app.setAsDefaultProtocolClient(protocol, process.execPath, [ path.resolve(process.argv[1]) ]);
		}
	}
	else {
		app.setAsDefaultProtocolClient(protocol);
	}
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true
		}
	});

	const port = process.env.PORT || 3000;
	const devServerURL = `http://localhost:${port}/`;
	const productionIndexUrl = path.join(__dirname, 'index.html');

	process.env.NODE_ENV === 'development'
		? mainWindow.loadURL(devServerURL)
		: mainWindow.loadFile(productionIndexUrl);

	mainWindow.webContents.openDevTools();

	console.log(`DokChat electron started, auth registered to ${authProtocol}://auth`);
}

// macOS Compatibility
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

main();
