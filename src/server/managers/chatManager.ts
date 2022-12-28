import * as DateFns from 'date-fns';
import sql from 'sql-template-strings';
import { CHAT_COLORS } from '../../types/colors';
import { Chat, MessageAttachment } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import db from '../db';
import { InternalChatParticipant } from '../types/common';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import Utils from '../utils/utils';
import UserManager from './userManager';

export default class ChatManager {

	/**
	 * This function fetches Chat object
	 *
	 * @param requestOrSocket Express request or socket
	 * @param chatId ID of the chat to fetch
	 * @param displayAs ID of the user to which chat name will be generated
	 * @param participants Optionally provide participants list if fetched beforehand
	 * @returns Promise with Chat or null if not found
	 */
	public static async getChat(
		chatId: string,
		displayAs?: string,
		participants?: InternalChatParticipant[]
	): Promise<Chat | null> {
		const chats = await db.query(sql`
			SELECT
				id,
				name,
				color,
				is_group as "isGroup",
				creator_id as "creatorId",
				created_at as "createdAt"
			FROM
				chats
			WHERE id = $1
			LIMIT 1;
		`, [ chatId ]);
		if(chats.rowCount == 0) return null;
		const chat = chats.rows[0];
		if(!participants) participants = await ChatManager.listParticipants(chatId);

		const [ name, avatar ] = await ChatManager.generateChatNameAndAvatar(chat.id, chat.name, participants, displayAs);
		return {
			id: chatId,
			avatar,
			name,
			color: CHAT_COLORS[chat.color] || CHAT_COLORS[0],
			isGroup: chat.isGroup,
			createdAt: chat.createdAt,
			creatorId: chat.creatorId,
			participants: participants.map(p => ({
				id: p.id,
				userId: p.userId
			}))
		};
	}

	public static async getParticipant(chatId: string, participantId?: string, userId?: string) : Promise<InternalChatParticipant | null> {
		const query = await db.query(sql`
			SELECT
				participants.id,
				participants.user_id as "userId",
				participants.is_hidden as "isHidden",
				users.username,
				users.tag
			FROM
				participants
			JOIN users ON users.id = participants.user_id
			WHERE chat_id = $1 AND (participants.id = $2 OR users.id = $3);
		`, [ chatId, participantId, userId ]);

		if(query.rowCount == 0) return null;
		const part = query.rows[0];

		const result: InternalChatParticipant = {
			id: part.id,
			userId: part.userId,
			username: part.username,
			tag: part.tag,
			avatar: Utils.avatarUrl(part.userId),
			isHidden: part.isHidden
		};
		return result;
	}

	public static async listParticipants(chatId: string): Promise<InternalChatParticipant[]> {
		const query = await db.query(sql`
			SELECT
				participants.id,
				participants.user_id as "userId",
				participants.is_hidden as "isHidden",
				users.username,
				users.tag
			FROM
				participants
			JOIN users ON users.id = participants.user_id
			WHERE chat_id = $1;
		`, [ chatId ]);
		const result: InternalChatParticipant[] = [];
		for(const part of query.rows) {
			result.push({
				id: part.id,
				userId: part.userId,
				username: part.username,
				tag: part.tag,
				avatar: Utils.avatarUrl(part.userId),
				isHidden: part.isHidden
			});
		}
		return result;
	}

	/**
	 * Get avatar and name of chat and generate default ones
	 * if they are missing
	 */
	public static async generateChatNameAndAvatar(
		chatId: string,
		rawName: string,
		participants: InternalChatParticipant[],
		displayAs: string
	): Promise<[string, string]> {
		if(participants.length > 2) {
			let autoGeneratedName = participants.map(u => u.username).join(', ');
			if(autoGeneratedName.length > 32) autoGeneratedName = autoGeneratedName.slice(0, 32) + '...';
			return [
				rawName || autoGeneratedName,
				Utils.avatarUrl(chatId)
			];
		}
		else {
			const user = participants.find(u => u.userId != displayAs);
			if(!user) {
				return [
					rawName ?? participants[0].username,
					Utils.avatarUrl(displayAs)
				];
			}
			return [
				rawName ?? user.username,
				Utils.avatarUrl(user.userId)
			];

		}
	}

	public static async dmExist(userIdA: string, userIdb: string): Promise<string | false> {
		const result = await db.query(sql`
			SELECT
				participants.chat_id
			FROM (
				SELECT chat_id
				FROM participants
				INNER JOIN chats ON participants.chat_id = chats.id
				WHERE (participants.user_id = $1 OR participants.user_id = $2)
				AND chats.is_group = FALSE
			) AS participants
			GROUP BY participants.chat_id
			HAVING count(*) > 1
		`, [ userIdA, userIdb ]);
		if(result.rowCount == 0) {
			return false;
		}
		else {
			return result.rows[0].chat_id;
		}
	}

	public static async addUserToChat(userId: string, chatId: string, isHidden = false): Promise<string> {
		const participantId = snowflakeGenerator.getUniqueID();
		await db.query(sql`
			INSERT INTO participants
				(id, user_id, chat_id, created_at, is_hidden)
			VALUES
				($1, $2, $3, $4, $5)
		`, [
			participantId,
			userId,
			chatId,
			DateFns.getUnixTime(new Date()).toString(),
			isHidden
		]);
		return participantId.toString();
	}

	public static async removeUserFromChat(userId: string, chatId: string): Promise<void> {
		await db.query(sql`
            DELETE FROM participants WHERE user_id = $1 AND chat_id=$2
        `, [ userId, chatId ]);
	}

	public static async setChatHideForParticipant(participant: InternalChatParticipant | string, hide: boolean) {
		const id = typeof participant == 'string' ? participant : participant.id;
		await db.query(sql`
			UPDATE participants
				SET is_hidden = $1
			WHERE
				id = $2
		`, [ hide, id ]);
	}

	public static async setChatHideForParticipantByUserId(chatId: string, userId: string, hide: boolean) {
		await db.query(sql`
			UPDATE participants
				SET is_hidden = $1
			WHERE
				chat_id = $2 AND user_id = $3
		`, [ hide, chatId, userId ]);
	}

	public static async isGroup(chatId: string): Promise<boolean> {
		const chatQuery = await db.query(sql`SELECT is_group as "isGroup" FROM chats WHERE id = $1;`, [ chatId ]);
		return chatQuery.rows[0].isGroup;
	}

	/**
	 * Save message to database
	 * @returns [ id, timestamp]
	 */
	public static async saveMessage(
		sender: UserJWTData | 'SYSTEM',
		chatId: string, content?: string,
		attachmentKey?: string,
		attachment?: MessageAttachment
	): Promise<[string, string]> {
		const senderId = sender == 'SYSTEM' ? null : sender.id;
		const id = snowflakeGenerator.getUniqueID().toString();
		const timestamp = DateFns.getUnixTime(new Date()).toString();

		await db.query(sql`
			INSERT INTO messages 
				(id, chat_id, author_id, content, created_at, is_system, attachment,
				attachment_type, attachment_height, attachment_width)
			VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
			);
		`, [ id, chatId, senderId, content, timestamp, sender == 'SYSTEM', attachmentKey,
			attachment?.mimeType, attachment?.height, attachment?.width ]);
		return [ id, timestamp ];
	}
}
