import * as express from 'express';
import { ChatListResponse, MessageListResponse, UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import Utils from '../../utils';
import { QueryResult } from 'pg';
import ChatManager from '../../managers/chatManager';

const router = express.Router();

router.all('/list', allowedMethods('GET'), ensureAuthenticated(), async (req, res, next) => {
	const page = req.query.page as any as number|| 0;
	if(isNaN(page)) return new ApiResponse(res).badRequest();

	const chatsQuery = await queryChats(req, page);
	const chats = await Promise.all(chatsQuery.rows.map(async (chat) => {
		const participant = await ChatManager.listParticipants(req, chat.chatId);
		const [avatar, chatName] = await ChatManager.generateAvatarAndName(req, chat.chatId, participant, chat.name, chat.avatar);

		return {
			id: chat.chatId,
			name: chatName,
			avatar: avatar,
			lastMessage: chat.message ? {
				content: chat.message,
				author: chat.messageAuthor
			}: null
		};
	}));
	const result: ChatListResponse = chats;
	new ApiResponse(res).success(result);
});

type ChatsQuery = QueryResult<{
	chatId: string,
	name: string,
	avatar: string,
	message: string,
	messageAuthor: string
}>
async function queryChats(req: express.Request, page: number): Promise<ChatsQuery> {
	return db.query(sql`
        SELECT
            participants.chat_id as "chatId",
            chat.name,
			chat.avatar,
            last_message.content as message,
            last_message_author.username as "messageAuthor"
        FROM participants
        -- Join last message
        LEFT JOIN LATERAL (
            SELECT messages.chat_id, messages.author_id, messages.content FROM messages
            WHERE participants.chat_id = messages.chat_id ORDER BY
            messages.created_at DESC LIMIT 1
        ) AS last_message ON true
        -- Join chat
        LEFT JOIN LATERAL (
            SELECT chats.id, chats.name, chats.avatar FROM chats
            WHERE chats.id = participants.chat_id
            LIMIT 1
        ) AS chat ON true
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
}

export default router;
