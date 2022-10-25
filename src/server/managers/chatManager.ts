import db from '../db';
import sql from 'sql-template-strings';
import { Chat } from '../../types/common';
import Utils from '../utils';
import { Request } from 'express';
import { Handshake, Socket } from 'socket.io/dist/socket';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import * as DateFns from 'date-fns';
import { InternalChatParticipant } from '../types/common';

export default class ChatManager {

	/**
	 * This function fetches Chat object
	 * WARNING: This object will have chat name that may be specific to requesting user
	 *
	 * @param requestOrSocket Express request or socket
	 * @param chatId ID of the chat to fetch
	 * @param participants Optionally provide participants list if fetched beforehand
	 * @returns Promise with Chat or null if not found
	 */
	public static async getChat(
		requestOrSocket: Request | Socket,
		chatId: string,
		participants?: InternalChatParticipant[],
		displayAs?: string
	): Promise<Chat | null> {
		const req = (requestOrSocket as Socket).handshake || requestOrSocket as Request;
		if(!displayAs) displayAs = requestOrSocket.auth.id;
		const chats = await db.query(sql`
			SELECT
				name,
				avatar,
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
		if(!participants) participants = await ChatManager.listParticipants(req, chatId);

		const [ avatar, name ] = await ChatManager.generateAvatarAndName(
			req, chat.id, chat.name, chat.avatar, participants, displayAs);
		return {
			id: chatId,
			avatar: avatar,
			name: name,
			isGroup: chat.isGroup,
			createdAt: chat.createdAt,
			creatorId: chat.creatorId
		};
	}

	public static async listParticipants(req: Request | Handshake, chatId: string): Promise<InternalChatParticipant[]> {
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
				avatar: Utils.avatarUrl(req, part.userId),
				isHidden: part.isHidden
			});
		}
		return result;
	}

	/**
	 * Get avatar and name of chat and generate default ones
	 * if they are missing
	 */
	public static async generateAvatarAndName(
		req: Request | Handshake,
		chatId: string,
		rawName: string,
		rawAvatar: string,
		participants: InternalChatParticipant[],
		displayAs: string
	): Promise<[string, string]> {
		if(participants.length > 2) {
			const autoGeneratedName = participants.map(u => u.username).join(', ').substring(0, 50);
			return [
				rawAvatar || Utils.avatarUrl(req, chatId),
				rawName || autoGeneratedName
			];

		}
		else {
			const user = participants.find(u => u.userId != displayAs);
			return [
				rawAvatar || Utils.avatarUrl(req, user.userId),
				rawName|| `${user.username}#${user.tag}`
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

	public static async addUserToChat(userId: string, chatId: string, isHidden?: boolean): Promise<string> {
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

	public static async setChatHideForParticipant(participant: InternalChatParticipant, hide: boolean) {
		await db.query(sql`
			UPDATE participants
				SET is_hidden = $1
			WHERE
				id = $2
		`, [ hide, participant.id ]);
	}
}
