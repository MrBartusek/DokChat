import * as sizeOf from 'buffer-image-size';
import { MessageAttachment } from '../../types/common';
import { ALLOWED_ATTACHMENT_FORMAT } from '../../types/const';
import { ClientAttachment, ClientMessage, DokChatServer, DokChatSocket, ServerMessage } from '../../types/websocket';
import { ApiResponse } from '../apiResponse';
import s3Client from '../aws/s3';
import BlockManager from '../managers/blockManager';
import ChatManager from '../managers/chatManager';
import PermissionsManager from '../managers/permissionsManager';
import Utils from '../utils/utils';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const messageLimiter = new RateLimiterMemory({
	points: 15,
	duration: 15
});

export default function registerMessageHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('message', async (msg, callback) => {
		// This checks both for chat access and if chat exist
		if(!(await PermissionsManager.hasChatAccess(socket.auth, msg.chatId))) {
			return new ApiResponse({} as any, callback).forbidden();
		}
		if(!validateMessage(msg, callback)) {
			return new ApiResponse({} as any, callback).badRequest('Invalid message');
		}

		const limiterRes = await messageLimiter.consume(socket.handshake.address, msg.attachment ? 3 : 1)
			.catch(() => {
				return new ApiResponse({} as any, callback).tooManyRequests();
			});
		if(!limiterRes) return;

		// Add message to db
		const [ attachmentKey, attachment ] = await uploadAttachment(msg.attachment);
		const [ id, timestamp ] = await ChatManager.saveMessage(
			socket.auth,
			msg.chatId,
			msg.content,
			attachmentKey,
			attachment
		);

		let participants = await ChatManager.listParticipants(msg.chatId);
		participants = participants.filter(p => p.userId != socket.auth.id);

		const isGroup = await ChatManager.isGroup(msg.chatId);
		if(!isGroup && participants.length == 1) {
			const isBlocked = await BlockManager.isBlockedAny(socket.auth.id, participants[0].userId);
			if(isBlocked) {
				return new ApiResponse({} as any, callback).forbidden('Cannot send message to blocked user');
			}
		}

		for await(const part of participants) {
			// If chat is hidden by specific participant it will show up on message
			if(part.isHidden) await ChatManager.setChatHideForParticipant(part, false);

			// Chat is fetched for each user since for DMs name might be different for each participant
			const chat = await ChatManager.getChat(msg.chatId, part.userId, participants);
			const serverMsg: ServerMessage = {
				id: id,
				content: msg.content?.trim(),
				isSystem: false,
				chat: chat,
				timestamp: timestamp.toString(),
				attachment: attachment,
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

async function uploadAttachment(attachment?: ClientAttachment): Promise<[string, MessageAttachment]> {
	if(!attachment) {
		return [ null, {
			hasAttachment: false
		} ];
	}
	const mimeType = attachment.mimeType;
	const key = await s3Client.uploadAttachment(attachment.buffer, mimeType);
	let dimensions = null;
	if(mimeType.startsWith('image/')) {
		dimensions = sizeOf(attachment.buffer);
	}

	return [ key, {
		hasAttachment: true,
		width: dimensions?.width,
		height: dimensions?.height,
		mimeType: mimeType
	} ];
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
		if(!ALLOWED_ATTACHMENT_FORMAT.includes(msg.attachment.mimeType)) {
			return false;
		}
		if(!Buffer.isBuffer(msg.attachment.buffer)) {
			return false;
		}
	}
	return true;
}
