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

const router = express.Router();

router.all('/messages', allowedMethods('GET'), ensureAuthenticated(), async (req, res, next) => {
	const page = req.query.page as any as number || 0;
	const conversationId = req.query.chat;
	if(typeof conversationId != 'string') return new ApiResponse(res).badRequest();
	if(isNaN(page)) return new ApiResponse(res).badRequest();

	if(!hasChatAccess(req, conversationId)) {
		return new ApiResponse(res).forbidden();
	}

	const messagesQuery = await queryMessages(req, page);
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

async function hasChatAccess(req: express.Request, chatId: string) {
	const permissionsQuery = await db.query(sql`
        SELECT EXISTS(SELECT 1 FROM participants WHERE user_id = $1 AND conversation_id=$2)
    `, [req.auth.id, chatId]);
	return permissionsQuery.rows[0].exists;
}

type MessagesQuery = QueryResult<{
	id: string,
	content: string,
	authorId: string,
	authorUsername: string,
	createdAt: string
}>
async function queryMessages(req: Request, page: number): Promise<MessagesQuery> {
	return db.query(sql`
		SELECT
			id
			content,
			author_id as "authorId",
			username as "authorUsername",
			created_at as "createdAt"
		FROM messages
		LEFT JOIN LATERAL (
            SELECT username FROM users
            WHERE id = author_id
            LIMIT 1
        ) AS author ON true
		WHERE
			conversation_id = $1
		ORDER BY 
			created_at DESC
		LIMIT 25 OFFSET $2;
	`, [req.auth.id, page]);
}

export default router;
