const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

// Handle windows uninstall
if (require('electron-squirrel-startup')) app.quit();

const authProtocol = isDev ? 'dokchat-dev' : 'dokchat';
const store = new Store();
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

ipcMain.handle('get-config', (event) => {
	return {
		refreshToken: store.get('refreshToken'),
		token: store.get('token'),
		disableAutoLogin: store.get('disableAutoLogin', false)
	};
});

ipcMain.on('set-token', (event, token) => {
	store.set('token', token);
});

ipcMain.on('logout', (event) => {
	store.delete('token');
	store.delete('refreshToken');
	store.set('disableAutoLogin', true);
});

function passAuthToken(url) {
	const firstUrlPart = `${authProtocol}://auth/login`;
	if(!url.startsWith(firstUrlPart)) {
		dialog.showErrorBox(
			'DokChat Auth Error',
			'Invalid deep url passed to client, please clean your browser cache'
		);
		return;
	}
	const queryString = url.replace(firstUrlPart, '');
	const urlParams = new URLSearchParams(queryString);
	store.set('token', urlParams.get('token'));
	store.set('refreshToken', urlParams.get('refreshToken'));
	store.set('disableAutoLogin', false);
	mainWindow.webContents.reload();
	console.log('Successfully handoff');
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
			preload: path.join(__dirname, 'preload.js')
		},
		icon: path.join(__dirname, 'favicon.ico'),
		autoHideMenuBar: true
	});

	const indexLocation = path.join(__dirname, 'electron.html');
	mainWindow.loadFile(indexLocation);

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
