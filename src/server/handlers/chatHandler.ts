import { Request } from 'express';
import { QueryResult } from 'pg';
import { ClientMessage, DokChatServer, DokChatSocket, ServerMessage } from '../../types/websocket';
import { ApiResponse } from '../apiResponse';
import db from '../db';
import ChatManager from '../managers/chatManager';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import sql from 'sql-template-strings';
import * as DateFns from 'date-fns';
import { Socket } from 'socket.io';
import Utils from '../utils';
import PermissionsManager from '../managers/permissionsManager';

export default function registerMessageHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('message', async (msg, callback) => {
		// Check chat access
		if(!PermissionsManager.hasChatAccess(socket.auth, msg.chatId)) {
			return new ApiResponse({} as any, callback).forbidden();
		}

		// Check message format
		if(msg.content.trim().length == 0) {
			return new ApiResponse({} as any, callback).badRequest('Message is empty');
		}
		else if(msg.content.trim().length >= 2048) {
			return new ApiResponse({} as any, callback).badRequest('Message is too long');
		}

		const chat = await ChatManager.getChat(socket.handshake, msg.chatId);
		if(!chat) return new ApiResponse({} as any, callback).badRequest(`Chat ${msg.chatId} was not found`);

		// Add message to db
		const timestamp = DateFns.getUnixTime(new Date());
		const id = snowflakeGenerator.getUniqueID().toString();
		await saveMessage(socket, msg, id, timestamp);

		const serverMsg: ServerMessage = {
			messageId: id,
			content: msg.content.trim(),
			chat: chat,
			author: {
				id: socket.auth.id,
				username: socket.auth.username,
				avatar: Utils.avatarUrl(socket.handshake, socket.auth.id),
				tag: socket.auth.tag
			},
			timestamp: timestamp.toString()
		};

		const participants = await ChatManager.listParticipants(socket.handshake, msg.chatId);
		for await(const part of participants) {
			if(part.isHidden) {
				await ChatManager.setChatHideForParticipant(part, false);
			}
		}
		socket.broadcast.to(participants.map(p => p.userId)).emit('message', serverMsg);

		new ApiResponse({} as any, callback).success({
			id: id,
			timestamp: timestamp
		});
	});
}

async function saveMessage(socket: Socket, message: ClientMessage, id: string, timestamp: number) {
	return await db.query(sql`
		INSERT INTO messages 
			(id, chat_id, author_id, content, created_at)
		VALUES (
			$1, $2, $3, $4, $5
		);
	`, [ id, message.chatId, socket.auth.id, message.content, timestamp ]);
}

