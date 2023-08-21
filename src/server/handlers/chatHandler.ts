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
import RateLimitManager from '../managers/rateLimitManager';
import { UserJWTData } from '../../types/jwt';

export default function registerMessageHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('message', async (msg, callback) => {
		if (!(await RateLimitManager.consume(socket.auth, msg.attachment ? 10 : 1))) {
			return new ApiResponse({} as any, callback).tooManyRequests();
		}

		if (!validateMessage(msg, callback)) {
			return new ApiResponse({} as any, callback).badRequest('Invalid message');
		}

		if (!(await PermissionsManager.hasChatAccess(socket.auth, msg.chatId))) {
			return new ApiResponse({} as any, callback).forbidden();
		}

		const participants = await ChatManager.listParticipants(msg.chatId);
		const otherParticipants = participants.filter(p => p.userId != socket.auth.id);
		const isGroup = await ChatManager.isGroup(msg.chatId);

		if (!isGroup && otherParticipants.length == 1) {
			const isBlocked = await BlockManager.isBlockedAny(socket.auth.id, otherParticipants[0].userId);
			if (isBlocked) {
				return new ApiResponse({} as any, callback).forbidden('Cannot send message to blocked user');
			}
		}

		const [ id, timestamp, attachment ] = await saveMessageToDatabase(socket.auth, msg);

		// If chat is hidden by specific participant it will show up on this message
		for await (const part of otherParticipants) {
			if (part.isHidden) await ChatManager.setChatHideForParticipant(part, false);
		}

		const chat = await ChatManager.getChat(msg.chatId, participants);
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

		socket.to(otherParticipants.map(p => p.userId)).emit('message', serverMsg);
		new ApiResponse({} as any, callback).success({ id, timestamp });

		const sender = `${socket.auth.id} (${socket.auth.username}#${socket.auth.tag})`;
		console.log(`WS message ${sender}=>${msg.chatId}(chat)`);
	});
}

/**
 * save user message to database, use only after message validation
 *
 * @param auth User auth
 * @param msg User message
 * @returns Promise<[id, timestamp, attachment]>
 */
async function saveMessageToDatabase(auth: UserJWTData, msg: ClientMessage): Promise<[string, string, MessageAttachment]> {
	const [ attachmentKey, attachment ] = await uploadAttachment(msg.attachment);
	const [ id, timestamp ] = await ChatManager.saveMessage(
		auth,
		msg.chatId,
		msg.content,
		attachmentKey,
		attachment
	);
	return [ id, timestamp, attachment ];
}

async function uploadAttachment(attachment?: ClientAttachment): Promise<[string, MessageAttachment]> {
	if (!attachment) {
		return [ null, {
			hasAttachment: false
		} ];
	}
	const mimeType = attachment.mimeType;
	const key = await s3Client.uploadAttachment(attachment.buffer, mimeType);
	let dimensions = null;
	if (mimeType.startsWith('image/')) {
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
	if (msg.content && msg.attachment || !msg.content && !msg.attachment) {
		new ApiResponse({} as any, callback).badRequest('Message content invalid');
		return false;
	}
	else if (msg.content) {
		if (msg.content.trim().length == 0) {
			new ApiResponse({} as any, callback).badRequest('Message is empty');
			return false;
		}
		else if (msg.content.trim().length >= 4000) {
			new ApiResponse({} as any, callback).badRequest('Message is too long');
			return false;
		}
	}
	else if (msg.attachment) {
		if (!ALLOWED_ATTACHMENT_FORMAT.includes(msg.attachment.mimeType)) {
			return false;
		}
		if (!Buffer.isBuffer(msg.attachment.buffer)) {
			return false;
		}
	}
	return true;
}
