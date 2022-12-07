import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { QueryResult } from 'pg';
import sql from 'sql-template-strings';
import { MessageListResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import PermissionsManager from '../../managers/permissionsManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import Utils from '../../utils/utils';

const router = express.Router();

router.all('/messages',
	allowedMethods('GET'),
	ensureAuthenticated(true),
	query('page').optional().isNumeric(),
	query('chat').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const page = req.query.page as any as number || 0;
		const chatId = req.query.chat;

		if(!(await PermissionsManager.hasChatAccess(req.auth, chatId))) {
			return new ApiResponse(res).forbidden();
		}

		const messagesQuery = await queryMessages(chatId, page);
		const messages: MessageListResponse = messagesQuery.rows.map((msg) => {
			return {
				id: msg.id,
				content: msg.content,
				timestamp: msg.createdAt,
				avatar: Utils.avatarUrl(msg.authorId),
				attachment:  {
					hasAttachment: msg.attachment != undefined,
					mimeType: msg.attachmentType
				},
				author: {
					id: msg.authorId,
					username: msg.authorUsername,
					avatar: Utils.avatarUrl(msg.authorId),
					tag: msg.authorTag
				}
			};
		});
		const result = messages;
		new ApiResponse(res).success(result);
	});

type MessagesQuery = QueryResult<{
	id: string,
	content: string,
	authorId: string,
	authorUsername: string,
	authorTag: string,
	createdAt: string,
	attachment: string,
	attachmentType: string
}>
async function queryMessages(chatId: string, page: number): Promise<MessagesQuery> {
	return db.query(sql`
		SELECT
			messages.id,
			messages.content,
			messages.author_id as "authorId",
			users.username as "authorUsername",
			users.tag as "authorTag",
			messages.created_at as "createdAt",
			messages.attachment,
			messages.attachment_type as "attachmentType"
		FROM messages
		INNER JOIN users ON users.id = messages.author_id
		WHERE
			chat_id = $1
		ORDER BY 
			messages.created_at DESC
		LIMIT 25 OFFSET $2;
	`, [ chatId, page ]);
}

export default router;
