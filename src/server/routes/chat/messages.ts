import * as express from 'express';
import { MessageListResponse, UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import Utils from '../../utils';
import { QueryResult } from 'pg';
import { Request } from 'express-serve-static-core';
import ChatManager from '../../managers/chatManager';

const router = express.Router();

router.all('/messages', allowedMethods('GET'), ensureAuthenticated(), async (req, res, next) => {
	const page = req.query.page as any as number || 0;
	const conversationId = req.query.chat;
	if(typeof conversationId != 'string') return new ApiResponse(res).badRequest();
	if(isNaN(page)) return new ApiResponse(res).badRequest();

	if(!ChatManager.hasChatAccess(req.auth, conversationId)) {
		return new ApiResponse(res).forbidden();
	}

	const messagesQuery = await queryMessages(req, conversationId, page);
	const messages = messagesQuery.rows.map((msg) => {
		return {
			id: msg.id,
			author: {
				id: msg.authorId,
				username: msg.authorUsername,
				avatar: Utils.avatarUrl(req, msg.authorId)
			},
			content: msg.content,
			timestamp: msg.createdAt,
			avatar: Utils.avatarUrl(req, msg.authorId)
		};
	});
	const result: MessageListResponse = messages;
	new ApiResponse(res).success(result);
});

type MessagesQuery = QueryResult<{
	id: string,
	content: string,
	authorId: string,
	authorUsername: string,
	createdAt: string
}>
async function queryMessages(req: Request, conversationId: string, page: number): Promise<MessagesQuery> {
	return db.query(sql`
		SELECT
			messages.id,
			messages.content,
			messages.author_id as "authorId",
			users.username as "authorUsername",
			messages.created_at as "createdAt"
		FROM messages
		INNER JOIN users ON users.id = messages.author_id
		WHERE
			conversation_id = $1
		ORDER BY 
			messages.created_at DESC
		LIMIT 25 OFFSET $2;
	`, [conversationId, page]);
}

export default router;
