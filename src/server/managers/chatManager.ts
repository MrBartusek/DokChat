import db from '../db';
import sql from 'sql-template-strings';
import { UserJWTData } from '../../types/jwt';

type ChatInfoQuery = {
	name: string,
	avatar: string
}

export default class ChatManager {
	public static async hasChatAccess(auth: UserJWTData, chatId: string) {
		const permissionsQuery = await db.query(sql`
            SELECT EXISTS(SELECT 1 FROM participants WHERE user_id = $1 AND conversation_id=$2)
        `, [auth.id, chatId]);
		return permissionsQuery.rows[0].exists;
	}

	/**
	 * List participant user ids in chat without any joins
	 */
	public static async listParticipantsUserIds(conversationId: string): Promise<string[]> {
		const query = await db.query(sql`
			SELECT
				user_id as "userId"
			FROM
				participants
			WHERE conversation_id = $1;
		`, [ conversationId ]);
		return query.rows.map(r => r.userId);
	}

	public static async chatInfo(conversationId: string): Promise<ChatInfoQuery> {
		const chat = await db.query(sql`
			SELECT
				name, avatar
			FROM
				conversations
			WHERE id = $1
			LIMIT 1;
		`, [ conversationId ]);
		if(chat.rowCount == 0) throw new Error('Chat with provided id was not found');
		return chat.rows[0];
	}
}
