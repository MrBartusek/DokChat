import DiscordRPC from 'discord-rpc';

const CLIENT_ID = '1138095200837836961';

class RichPresenceManager {
	private rpc: DiscordRPC.Client;

	constructor() {
		this.rpc = new DiscordRPC.Client({ transport: 'ipc'});
	}

	public async start() {
		await this.rpc.login({ clientId: CLIENT_ID }).catch(console.error);
		setInterval(() => {
			this.updateActivity();
		}, 15e3);
	}

	public async updateActivity() {
		return this.rpc.setActivity({
			details: 'man',
			state: 'this shit works',
			largeImageKey: 'dokchat-logo',
			largeImageText: 'DokChat Desktop',
			instance: false
		});

	}

}

export default RichPresenceManager;
