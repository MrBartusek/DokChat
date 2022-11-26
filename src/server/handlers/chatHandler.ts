import { ClientMessage, DokChatServer, DokChatSocket, ServerMessage } from '../../types/websocket';
import { ApiResponse } from '../apiResponse';
import s3Client from '../aws/s3';
import ChatManager from '../managers/chatManager';
import PermissionsManager from '../managers/permissionsManager';
import Utils from '../utils/utils';

export default function registerMessageHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('message', async (msg, callback) => {
		// This checks both for chat access and if chat exist
		if(!PermissionsManager.hasChatAccess(socket.auth, msg.chatId)) {
			return new ApiResponse({} as any, callback).forbidden();
		}
		if(!validateMessage(msg, callback)) {
			return new ApiResponse({} as any, callback).badRequest('Invalid message');
		}

		// Add message to db
		const attachment = msg.attachment ? await s3Client.uploadAttachment(msg.attachment.buffer, msg.attachment.type) : null;
		const [ id, timestamp ] = await ChatManager.saveMessage(socket.auth, msg.chatId, msg.content, attachment);

		// Send message to every participant expect sender
		const participants = await ChatManager.listParticipants(msg.chatId);
		participants.filter(p => p.userId != socket.auth.id);
		for await(const part of participants) {
			// If chat is hidden by specific participant it will show up on message
			if(part.isHidden) await ChatManager.setChatHideForParticipant(part, false);

			// Chat is fetched for each user since for DMs name might be different for each participant
			const chat = await ChatManager.getChat(socket, msg.chatId, part.userId, participants);
			const serverMsg: ServerMessage = {
				id: id,
				content: msg.content?.trim(),
				chat: chat,
				timestamp: timestamp.toString(),
				attachment: msg.attachment != undefined,
				author: {
					id: socket.auth.id,
					username: socket.auth.username,
					avatar: Utils.avatarUrl(socket.auth.id),
					tag: socket.auth.tag
				}
			};
			socket.to(part.userId).emit('message', serverMsg);
		}

		// Callback to sender
		new ApiResponse({} as any, callback).success({
			id: id,
			timestamp: timestamp
		});

		const sender = `${socket.auth.id}(${socket.auth.username}#${socket.auth.tag})`;
		console.log(`WS message ${sender}=>${msg.chatId}(chat)`);
	});
}

function validateMessage(msg: ClientMessage, callback: (response: any) => void): boolean {
	if(msg.content && msg.attachment || !msg.content && !msg.attachment) {
		new ApiResponse({} as any, callback).badRequest('Message content invalid');
		return false;
	}
	else if(msg.content) {
		if(msg.content.trim().length == 0) {
			new ApiResponse({} as any, callback).badRequest('Message is empty');
			return false;
		}
		else if(msg.content.trim().length >= 4000) {
			new ApiResponse({} as any, callback).badRequest('Message is too long');
			return false;
		}
	}
	else if(msg.attachment) {
		const allowedFormats = [
			'image/bmp', 'image/gif', 'image/jpeg', 'image/svg+xml', 'image/png'
		];
		if(!allowedFormats.includes(msg.attachment.type)) {
			return false;
		}
		if(!Buffer.isBuffer(msg.attachment.buffer)) {
			return false;
		}
	}
	return true;
}
