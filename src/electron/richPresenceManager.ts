import DiscordRPC from 'discord-rpc';
import { ElectronPresenceConfig } from '../types/electron';
import { app } from 'electron';

const CLIENT_ID = '1138095200837836961';

class RichPresenceManager {
	private rpc: DiscordRPC.Client;
	private config: ElectronPresenceConfig;
	private firstUpdate: boolean;

	constructor() {
		this.rpc = new DiscordRPC.Client({ transport: 'ipc'});
		this.config = {};
		this.firstUpdate = true;
	}

	public async start() {
		await this.rpc.login({ clientId: CLIENT_ID }).catch(console.error);
		setInterval(() => {
			this.setActivity();
		}, 15e3);
	}

	public updatePresence(config: ElectronPresenceConfig) {
		console.log('Updated Discord Rich Presence Data', config);
		this.config = config;

		if(this.firstUpdate) {
			this.setActivity();
			this.firstUpdate = false;
		}
	}

	private async setActivity() {
		return this.rpc.setActivity({
			details: this.config.title,
			state: this.config.details,
			largeImageKey: 'dokchat-logo',
			largeImageText: 'DokChat Desktop',
			smallImageKey: this.getAvatar(),
			smallImageText: this.config.discriminator,
			instance: false
		});
	}

	private getAvatar() {
		return app.isPackaged ? this.config.avatarUrl : 'status-online';
	}

}

export default RichPresenceManager;
