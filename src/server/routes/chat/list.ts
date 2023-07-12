import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { QueryResult } from 'pg';
import sql from 'sql-template-strings';
import { CHAT_COLORS } from '../../../types/colors';
import { ChatListResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import ChatManager from '../../managers/chatManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/list',
	allowedMethods('GET'),
	ensureAuthenticated(true),
	query('page').optional().isNumeric(),
	ensureRatelimit(5),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);
		const page = req.query.page as any as number|| 0;

		const chatsQuery = await queryChats(req, page);
		const chats = await Promise.all(chatsQuery.rows.map(async (chat) => {
			const participant = await ChatManager.listParticipants(chat.chatId);
			const [ name, avatar ] = await ChatManager.generateChatNameAndAvatar(chat.chatId, chat.name, participant, chat.isGroup, req.auth.id);

			return {
				id: chat.chatId,
				name,
				avatar,
				color: CHAT_COLORS[chat.color] || CHAT_COLORS[0],
				isGroup: chat.isGroup,
				createdAt: chat.createdAt,
				creatorId: chat.creatorId,
				lastMessage: chat.messageCreatedAt ? {
					content: chat.messageContent || '',
					author: chat.messageAuthor,
					timestamp: chat.messageCreatedAt
				}: null,
				participants: participant.map(p => ({
					id: p.id,
					userId: p.userId
				}))
			};
		}));
		const result: ChatListResponse = chats;
		new ApiResponse(res).success(result);
	});

type ChatsQuery = QueryResult<{
	chatId: string,
	name: string,
	messageContent: string,
	messageAuthor: string,
	messageCreatedAt: string,
    isGroup: boolean,
	creatorId: string,
	createdAt: string,
	color: number
}>
async function queryChats(req: express.Request, page: number): Promise<ChatsQuery> {
	return db.query(sql`
        SELECT
            chat.name,
			chat.color,
            chat.is_group as "isGroup",
			chat.creator_id as "creatorId",
			chat.created_at as "createdAt",
            participants.chat_id as "chatId",
			last_message.content as "messageContent",
            last_message_author.username as "messageAuthor",
			last_message.created_at as "messageCreatedAt"
        FROM participants
        -- Join last message
        LEFT JOIN LATERAL (
            SELECT
				messages.chat_id,
				messages.author_id,
				messages.content,
				messages.created_at
			FROM messages
            WHERE
				participants.chat_id = messages.chat_id
			ORDER BY
            	messages.created_at
			DESC LIMIT 1
        ) AS last_message ON true
        -- Join chat
        LEFT JOIN LATERAL (
            SELECT
				chats.id,
				chats.name,
				chats.avatar,
				chats.color,
				chats.is_group,
				chats.creator_id,
				chats.created_at
			FROM chats
            WHERE
				chats.id = participants.chat_id
            LIMIT 1
        ) AS chat ON true
        -- Join last message author
        LEFT JOIN LATERAL (
            SELECT users.id, users.username FROM users
            WHERE users.id = last_message.author_id
            LIMIT 1
        ) AS last_message_author ON true
        WHERE
            participants.user_id = $1 AND participants.is_hidden = false
		ORDER BY
			COALESCE(last_message.created_at, chat.created_at) DESC
        LIMIT 25 OFFSET $2;
    `, [ req.auth.id, page ]);
}

export default router;
