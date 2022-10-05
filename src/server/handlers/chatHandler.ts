import { Request } from 'express';
import { QueryResult } from 'pg';
import { DokChatServer, DokChatSocket } from '../../types/websocket';
import { ApiResponse } from '../apiResponse';
import db from '../db';
import PermissionManager from '../managers/permissionManager';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import sql from 'sql-template-strings';
import * as DateFns from 'date-fns';

export default function registerMessageHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('message', async (message, callback) => {
		const req = socket.request as Request;
		// Check chat access
		if(!PermissionManager.hasChatAccess(req, message.chatId)) {
			return new ApiResponse({} as any, callback).forbidden();
		}

		// Add message to db
		const timestamp = DateFns.getUnixTime(new Date());
		const id = snowflakeGenerator.getUniqueID().toString();
		await db.query(sql`
			INSERT INTO messages 
				(id, conversation_id, author_id, content, created_at)
			VALUES (
				$1, $2, $3, $4, $5
			);
			`, [ id, message.chatId, req.auth.id, message.content, timestamp]);

		new ApiResponse({} as any, callback).success({
			id: id,
			timestamp: timestamp
		});
	});
}
