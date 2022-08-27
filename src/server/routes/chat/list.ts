import * as express from 'express';
import { ChatListResponse, UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import AvatarManager from '../../managers/avatarManager';
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
		const participantsQuery = await db.query(sql`
            SELECT user_id, tag FROM participants
            JOIN users ON id = user_id
            WHERE conversation_id = $1;
        `, [ row.conversation_id]);
		if(participantsQuery.rowCount == 1) {
			// Only one person in conversation
			const user = participantsQuery.rows[0];
			avatar = Utils.apiUrl(req) + `avatar?user=${user.user_id}`;
		}
		else if(participantsQuery.rowCount == 2) {
			// DM conversation
			const user = participantsQuery.rows.find(u => u.user_id != req.auth.id);
			avatar = Utils.apiUrl(req) + `avatar?user=${user.user_id}`;
		}
		else {
			// Group
			avatar = Utils.apiUrl(req) + `avatar?group=${row.conversation_id}`;
		}
		return {
			id: row.conversation_id,
			title: row.title,
			avatar: avatar,
			last_message: {
				content: row.message,
				author: row.message_author
			}
		};
	}));
	const result: ChatListResponse = { chats: chats };
	new ApiResponse(res).success(result);
});

export default router;
