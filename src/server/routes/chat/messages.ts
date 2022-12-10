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
	query('lastMessageTimestamp').optional().isInt(),
	query('count').optional().isInt({max: 50, min: 10}),
	query('chat').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const lastMessageTimestamp = Number(req.query.lastMessageTimestamp) || Number.MAX_SAFE_INTEGER;
		const count = Number(req.query.count) || 25;
		const chatId = req.query.chat;

		if(!(await PermissionsManager.hasChatAccess(req.auth, chatId))) {
			return new ApiResponse(res).forbidden();
		}

		const messagesQuery = await queryMessages(chatId, lastMessageTimestamp, count);
		const messages: MessageListResponse = messagesQuery.rows.map((msg) => {
			return {
				id: msg.id,
				content: msg.content,
				timestamp: msg.createdAt,
				avatar: Utils.avatarUrl(msg.authorId),
				attachment:  {
					hasAttachment: msg.attachment != undefined,
					mimeType: msg.attachmentType,
					height: msg.attachmentHeight,
					width: msg.attachmentWidth
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
	attachmentType: string,
	attachmentWidth: number,
	attachmentHeight: number
}>
async function queryMessages(chatId: string, lastMessageTimestamp: number, count = 25): Promise<MessagesQuery> {
	return db.query(sql`
		SELECT
			messages.id,
			messages.content,
			messages.author_id as "authorId",
			users.username as "authorUsername",
			users.tag as "authorTag",
			messages.created_at as "createdAt",
			messages.attachment,
			messages.attachment_type as "attachmentType",
			messages.attachment_width as "attachmentWidth",
			messages.attachment_height as "attachmentHeight"
		FROM messages
		INNER JOIN users ON users.id = messages.author_id
		WHERE
			chat_id = $1 AND messages.created_at < $2
		ORDER BY 
			messages.created_at DESC
		LIMIT $3;
	`, [ chatId, lastMessageTimestamp, count ]);
}

export default router;
