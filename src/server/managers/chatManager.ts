import * as DateFns from 'date-fns';
import sql from 'sql-template-strings';
import { CHAT_COLORS } from '../../types/colors';
import { Chat, MessageAttachment } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import db from '../db';
import { InternalChatParticipant } from '../types/common';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import Utils from '../utils/utils';
import { check } from 'express-validator';
import { Snowflake } from 'nodejs-snowflake';

export default class ChatManager {

	/**
	 * This function fetches Chat object from database
	 *
	 * @param chatId ID of the chat to fetch
	 * @param participants Optionally provide participants list if fetched beforehand
	 * @returns Promise with Chat or null if not found
	 */
	public static async getChat(chatId: string, participants?: InternalChatParticipant[]): Promise<Chat | null> {
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
		if (chats.rowCount == 0) return null;
		const chat = chats.rows[0];
		if (!participants) participants = await ChatManager.listParticipants(chatId);

		return {
			id: chat.id,
			avatar: chat.isGroup ? Utils.avatarUrl(chat.id) : null,
			name: chat.name,
			color: CHAT_COLORS[chat.color] || CHAT_COLORS[0],
			isGroup: chat.isGroup,
			createdAt: chat.createdAt,
			creatorId: chat.creatorId,
			participants: Utils.convertParticipantsToSimple(participants)
		};
	}

	public static async getParticipant(chatId: string, participantId?: string, userId?: string): Promise<InternalChatParticipant | null> {
		const query = await db.query(sql`
			SELECT
				participants.id,
				participants.user_id as "userId",
				participants.is_hidden as "isHidden",
				participants.last_read as "lastRead",
				users.username,
				users.tag
			FROM
				participants
			JOIN users ON users.id = participants.user_id
			WHERE chat_id = $1 AND (participants.id = $2 OR users.id = $3);
		`, [ chatId, participantId, userId ]);

		if (query.rowCount == 0) return null;
		const part = query.rows[0];

		const result: InternalChatParticipant = {
			id: part.id,
			userId: part.userId,
			username: part.username,
			tag: part.tag,
			avatar: Utils.avatarUrl(part.userId),
			lastRead: part.lastRead,
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
				participants.last_read as "lastRead",
				users.username,
				users.tag
			FROM
				participants
			JOIN users ON users.id = participants.user_id
			WHERE chat_id = $1;
		`, [ chatId ]);
		const result: InternalChatParticipant[] = [];
		for (const part of query.rows) {
			result.push({
				id: part.id,
				userId: part.userId,
				username: part.username,
				tag: part.tag,
				avatar: Utils.avatarUrl(part.userId),
				lastRead: part.lastRead,
				isHidden: part.isHidden
			});
		}
		return result;
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
		if (result.rowCount == 0) {
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

	public static async updateLastRead(sender: UserJWTData, chatId: string, messageId: string): Promise<void> {
		const checkQuery = await db.query(sql`
			SELECT last_read FROM participants WHERE chat_id = $1 AND user_id = $2;
		`, [ chatId, sender.id ]);

		if(checkQuery.rowCount == 0) throw new Error('Invalid IDs provided (1)');

		// custom epoch doesn't matter here, it's just difference between two snowflakes
		const previousMessageTimestamp = Snowflake.timestampFromID(BigInt(checkQuery.rows[0].last_read || 0), 0);
		const newMessageTimestamp = Snowflake.timestampFromID(BigInt(messageId), 0);
		if(newMessageTimestamp < previousMessageTimestamp) throw new Error('Newer message is already read');

		const query = await db.query(sql`
			UPDATE participants SET last_read = $1 WHERE chat_id = $2 AND user_id = $3;
		`, [ messageId, chatId, sender.id ]);
		if(query.rowCount == 0) {
			throw new Error('Invalid IDs provided (2)');
		}
	}
}
