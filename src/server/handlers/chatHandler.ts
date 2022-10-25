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
		// This checks both for chat access and if chat exist
		if(!PermissionsManager.hasChatAccess(socket.auth, msg.chatId)) {

			return new ApiResponse({} as any, callback).forbidden();
		}
		if(!validateMessage(msg, callback)) return;

		// Add message to db
		const timestamp = DateFns.getUnixTime(new Date());
		const id = snowflakeGenerator.getUniqueID().toString();
		await saveMessage(socket, msg, id, timestamp);

		// Send message to every participant expect sender
		const participants = await ChatManager.listParticipants(socket.handshake, msg.chatId);
		participants.filter(p => p.userId != socket.auth.id);
		for await(const part of participants) {
			// If chat is hidden by specific participant it will show up on message
			if(part.isHidden) await ChatManager.setChatHideForParticipant(part, false);

			// Chat is fetched for each user since for DMs name might be different for each
			// participant
			const chat = await ChatManager.getChat(socket, msg.chatId, part.userId, participants);
			const serverMsg: ServerMessage = {
				messageId: id,
				content: msg.content.trim(),
				chat: chat,
				timestamp: timestamp.toString(),
				author: {
					id: socket.auth.id,
					username: socket.auth.username,
					avatar: Utils.avatarUrl(socket.handshake, socket.auth.id),
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
	});
}

function validateMessage(msg: ClientMessage, callback: (response: any) => void): boolean {
	if(msg.content.trim().length == 0) {
		new ApiResponse({} as any, callback).badRequest('Message is empty');
		return false;
	}
	else if(msg.content.trim().length >= 2048) {
		new ApiResponse({} as any, callback).badRequest('Message is too long');
		return false;
	}
	return true;
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

