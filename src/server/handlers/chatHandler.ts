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

export default function registerMessageHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('message', async (msg, callback) => {
		// Check chat access
		if(!ChatManager.hasChatAccess(socket.auth, msg.chatId)) {
			return new ApiResponse({} as any, callback).forbidden();
		}

		// Add message to db
		const timestamp = DateFns.getUnixTime(new Date());
		const id = snowflakeGenerator.getUniqueID().toString();
		await saveMessage(socket, msg, id, timestamp);

		let participantsIds = await ChatManager.listParticipantsUserIds(msg.chatId);
		participantsIds = participantsIds.filter(p => p != socket.auth.id);
		const chatInfo = await ChatManager.chatInfo(socket.handshake, msg.chatId);
		const serverMsg: ServerMessage = {
			messageId: id,
			content: msg.content,
			chat: {
				id: chatInfo.id,
				name: chatInfo.name,
				avatar: chatInfo.avatar
			},
			author: {
				id: socket.auth.id,
				username: socket.auth.username,
				avatar: Utils.avatarUrl(socket.handshake, socket.auth.id)
			},
			timestamp: timestamp.toString()
		};

		socket.to(participantsIds).emit('message', serverMsg);

		new ApiResponse({} as any, callback).success({
			id: id,
			timestamp: timestamp
		});
	});
}

async function saveMessage(socket: Socket, message: ClientMessage, id: string, timestamp: number) {
	return await db.query(sql`
		INSERT INTO messages 
			(id, conversation_id, author_id, content, created_at)
		VALUES (
			$1, $2, $3, $4, $5
		);
	`, [ id, message.chatId, socket.auth.id, message.content, timestamp]);
}

