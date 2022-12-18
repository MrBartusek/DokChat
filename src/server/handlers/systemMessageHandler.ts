import { UserJWTData } from '../../types/jwt';
import { DokChatServer, DokChatSocket, ServerMessage } from '../../types/websocket';
import ChatManager from '../managers/chatManager';
import Utils from '../utils/utils';

class SystemMessageHandler {
	private connected = false;
	private io: DokChatServer;
	private socket: DokChatSocket;

	public connect(io: DokChatServer, socket: DokChatSocket) {
		this.io = io;
		this.socket = socket;
		this.connected = true;
	}

	public async sendSystemMessage(chatId: string, content: string) {
		if(!this.connected) {
			console.log('System message not sent, socket is not connected');
			return;
		}
		const [ id, timestamp ] = await ChatManager.saveMessage('SYSTEM', chatId, content);

		const participants = await ChatManager.listParticipants(chatId);
		for await(const part of participants) {
			const chat = await ChatManager.getChat(chatId, part.userId, participants);
			const systemMessage: ServerMessage = {
				id: id,
				content: content,
				isSystem: true,
				chat: chat,
				timestamp: timestamp.toString(),
				attachment: { hasAttachment: false },
				author: {
					id: 'SYSTEM',
					username: 'SYSTEM',
					avatar: Utils.avatarUrl('1'),
					tag: '0001'
				}
			};
			this.io.to(part.userId).emit('message', systemMessage);
		}
	}

	public sendChatUpdated(chatId: string, user: UserJWTData) {
		const discriminator = Utils.userDiscriminator(user);
		this.sendSystemMessage(chatId, `${discriminator} has updated this chat`);
	}

	public sendChatLeave(chatId: string, user: UserJWTData) {
		const discriminator = Utils.userDiscriminator(user);
		this.sendSystemMessage(chatId, `${discriminator} has left this group`);
	}

	public sendChatJoin(chatId: string, user: UserJWTData) {
		const discriminator = Utils.userDiscriminator(user);
		this.sendSystemMessage(chatId, `${discriminator} was added to this chat`);
	}
}

export const systemMessageHandler = new SystemMessageHandler();
