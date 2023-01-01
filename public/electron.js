const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: path.join(__dirname, './index.html'),
		protocol: 'file:',
		slashes: true
	});
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		icon: path.join(__dirname, './img/logo/dokchat-logo-square-blue.png'),
		webPreferences: {
			nodeIntegration: true
		}
	});
	win.loadURL(startUrl);
	win.removeMenu();
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
