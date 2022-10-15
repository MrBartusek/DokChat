import db from '../db';
import sql from 'sql-template-strings';
import { Chat, ChatParticipant, User } from '../../types/common';
import Utils from '../utils';
import { Request } from 'express';
import { Handshake } from 'socket.io/dist/socket';

export default class UserManager {
	public static async getUserById(req: Request | Handshake, id: string): Promise<User | null> {
		const chatsQuery = await db.query(sql`
			SELECT
				username, tag, avatar
			FROM
				users
			WHERE id = $1
			LIMIT 1;
		`, [ id ]);
		if(chatsQuery.rowCount == 0) return null;
		const user = chatsQuery.rows[0];
		return {
			id: id,
			username: user.username,
			tag: user.tag,
			avatar: user.avatar || Utils.avatarUrl(req, id)
		};
	}

	public static async getUserByUsername(req: Request | Handshake, username: string, tag: string): Promise<User | null> {
		const chatsQuery = await db.query(sql`
			SELECT
				id, avatar
			FROM
				users
			WHERE username = $1 AND tag = $2
			LIMIT 1;
		`, [ username, tag ]);
		if(chatsQuery.rowCount == 0) return null;
		const user = chatsQuery.rows[0];
		return {
			id: user.id,
			username: username,
			tag: tag,
			avatar: user.avatar || Utils.avatarUrl(req, user.id)
		};
	}
}
