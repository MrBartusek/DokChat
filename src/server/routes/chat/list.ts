import * as express from 'express';
import { ChatListResponse, MessageListResponse, UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import Utils from '../../utils';

const router = express.Router();

router.all('/list', allowedMethods('GET'), ensureAuthenticated(), async (req, res, next) => {
	const page = req.query.page || 0;
	const query = await db.query(sql`
        SELECT
            participants.conversation_id,
            conversation.title,
            last_message.content as message,
            last_message_author.username as message_author
        FROM participants
        -- Join last message
        LEFT JOIN LATERAL (
            SELECT messages.conversation_id, messages.author_id, messages.content FROM messages
            WHERE participants.conversation_id = messages.conversation_id ORDER BY
            messages.created_at DESC LIMIT 1
        ) AS last_message ON true
        -- Join conversation
        LEFT JOIN LATERAL (
            SELECT conversations.id, conversations.title FROM conversations
            WHERE conversations.id = participants.conversation_id
            LIMIT 1
        ) AS conversation ON true
        -- Join last message author
        LEFT JOIN LATERAL (
            SELECT users.id, users.username FROM users
            WHERE users.id = last_message.author_id
            LIMIT 1
        ) AS last_message_author ON true
        WHERE
            participants.user_id = $1
        LIMIT 25 OFFSET $2;
    `, [req.auth.id, page]);

	const chats = await Promise.all(query.rows.map(async (row) => {
		let avatar: string | null = '';
		let title = row.title;
		const participantsQuery = await db.query(sql`
            SELECT user_id, username, tag FROM participants
            JOIN users ON users.id = user_id
            WHERE conversation_id = $1;
        `, [ row.conversation_id]);

		// Format avatar and conversation title
		if(participantsQuery.rowCount < 3) {
			// DM
			let user: any;
			if(participantsQuery.rowCount == 1) {
				user = participantsQuery.rows[0];
			}
			else {
				user = participantsQuery.rows.find(u => u.user_id != req.auth.id);
			}

			avatar = Utils.avatarUrl(req, user.user_id);
			title = `${user.username}#${user.tag}`;
		}
		else {
			// Group
			avatar = Utils.avatarUrl(req, row.conversation_id);
			title = title || participantsQuery.rows.map(u => u.username).join(', ').substring(0, 32);
		}

		return {
			id: row.conversation_id,
			title: title,
			avatar: avatar,
			lastMessage: row.message ? {
				content: row.message,
				author: row.message_author
			}: null
		};
	}));
	const result: ChatListResponse = chats;
	new ApiResponse(res).success(result);
});

export default router;
