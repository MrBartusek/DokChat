import DiscordRPC from 'discord-rpc';
import { ElectronPresenceConfig } from '../types/electron';
import { BrowserWindow, app } from 'electron';
import store from './store';
import { DEFAULT_SETTINGS, PresenceMode } from '../client/hooks/useSettings';
import { version } from '../../package.json';
import log from 'electron-log';

const CLIENT_ID = '1138095200837836961';

class RichPresenceManager {
	private rpc: DiscordRPC.Client;
	private config: ElectronPresenceConfig;
	private firstUpdate: boolean;
	private mainWindow: BrowserWindow;

	constructor() {
		this.rpc = new DiscordRPC.Client({ transport: 'ipc'});
		this.config = {};
		this.firstUpdate = true;
	}

	public async start(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
		await this.rpc.login({ clientId: CLIENT_ID }).catch(log.error);

		setInterval(() => {
			this.setActivity();
		}, 15e3);
	}

	public updatePresence(config: ElectronPresenceConfig) {
		this.config = config;

		if(this.firstUpdate) {
			this.setActivity();
			this.firstUpdate = false;
		}
	}

	private async setActivity() {
		const settings = store.get('settings', DEFAULT_SETTINGS);
		if(
			settings.presenceMode == PresenceMode.ENABLED ||
			(settings.presenceMode == PresenceMode.ONLY_MAXIMIZED && this.mainWindow.isVisible())
		) {
			return this.rpc.setActivity({
				details: this.config.title,
				state: this.config.details,
				largeImageKey: app.isPackaged ? 'dokchat-logo' : 'dokchat-logo-dev',
				largeImageText: app.isPackaged ? `DokChat Desktop • ${version}` : 'DokChat Desktop • DEV',
				smallImageKey: this.getAvatar(),
				smallImageText: this.config.discriminator,
				instance: false
			}).catch(log.error);
		}
		else {
			this.rpc.clearActivity().catch(log.error);
		}

	}

	private getAvatar() {
		return app.isPackaged ? this.config.avatarUrl : 'status-online';
	}
}

export default RichPresenceManager;
