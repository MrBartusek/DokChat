import { User } from '../../types/common';
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
		if (!this.connected) {
			console.log('System message not sent, socket is not connected');
			return;
		}
		const [ id, timestamp ] = await ChatManager.saveMessage('SYSTEM', chatId, content);

		const chat = await ChatManager.getChat(chatId);

		const systemMessage: ServerMessage = {
			id: id,
			content: content,
			isSystem: true,
			chat: chat,
			timestamp: timestamp.toString(),
			attachment: { hasAttachment: false },
			author: {
				id: '0',
				username: 'SYSTEM',
				avatar: '',
				tag: '0000'
			}
		};
		this.io.to(chat.participants.map(p => p.userId)).emit('message', systemMessage);

	}

	public sendChatUpdated(chatId: string, user: UserJWTData, name: boolean, avatar: boolean, color: boolean) {
		const discriminator = Utils.userDiscriminator(user);
		const updatedThings = [];

		if (name) updatedThings.push('name');
		if (avatar) updatedThings.push('avatar');
		if (color) updatedThings.push('color');

		let updatedString = '';

		if (updatedThings.length == 1) {
			updatedString = updatedThings[0];
		}
		else {
			const lastEl = updatedThings.pop();
			updatedString = `${updatedThings.join(', ')} and ${lastEl}`;
		}

		this.sendSystemMessage(chatId, `${discriminator} has updated this chat ${updatedString}`);
	}

	public sendChatLeave(chatId: string, user: User) {
		const discriminator = Utils.userDiscriminator(user);
		this.sendSystemMessage(chatId, `${discriminator} has left this group`);
	}

	public sendChatRemoved(chatId: string, user: User, removedBy: UserJWTData) {
		const discriminator = Utils.userDiscriminator(user);
		const discriminatorRemovedBy = Utils.userDiscriminator(removedBy);
		this.sendSystemMessage(chatId, `${discriminator} was removed from this group by ${discriminatorRemovedBy}`);
	}

	public sendChatJoin(chatId: string, user: User) {
		const discriminator = Utils.userDiscriminator(user);
		this.sendSystemMessage(chatId, `${discriminator} has joined this group`);
	}
}

export const systemMessageHandler = new SystemMessageHandler();
