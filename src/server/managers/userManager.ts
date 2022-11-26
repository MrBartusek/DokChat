import sql from 'sql-template-strings';
import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import db from '../db';
import Utils from '../utils/utils';

export default class UserManager {
	public static async getUserById(id: string): Promise<User | null> {
		const query = await db.query(sql`
			SELECT
				username, tag, avatar
			FROM
				users
			WHERE id = $1
			LIMIT 1;
		`, [ id ]);
		if(query.rowCount == 0) return null;
		const user = query.rows[0];
		return {
			id: id,
			username: user.username,
			tag: user.tag,
			avatar: Utils.avatarUrl(id)
		};
	}

	public static async getUserByUsername(username: string, tag: string): Promise<User | null> {
		const query = await db.query(sql`
			SELECT
				id, avatar
			FROM
				users
			WHERE username = $1 AND tag = $2
			LIMIT 1;
		`, [ username, tag ]);
		if(query.rowCount == 0) return null;
		const user = query.rows[0];
		return {
			id: user.id,
			username: username,
			tag: tag,
			avatar: Utils.avatarUrl(user.id)
		};
	}

	public static async systemUserId() {
		const query = await db.query(sql`SELECT id FROM users WHERE is_system = 'true'`);
		return query.rows[0].id;
	}

	public static async getUserJwtDataById(id: string): Promise<UserJWTData | null> {
		const query = await db.query(sql`
			SELECT
				id,
				username,
				tag,
				email,
				password_hash as "passwordHash",
				is_banned as "isBanned",
				is_email_confirmed as "isEmailConfirmed"
			FROM users WHERE id = $1;
		`, [ id ]);

		if(query.rowCount == 0) return null;
		const user = query.rows[0];
		return {
			id: user.id,
			username: user.username,
			tag: user.tag,
			email: user.email,
			avatar: Utils.avatarUrl(user.id),
			isBanned: user.isBanned,
			isEmailConfirmed: user.isEmailConfirmed
		};
	}

	public static async getUserJwtDataByEmail(email: string): Promise<UserJWTData | null> {
		const query = await db.query(sql`
			SELECT
				id,
				username,
				tag,
				email,
				password_hash as "passwordHash",
				is_banned as "isBanned",
				is_email_confirmed as "isEmailConfirmed"
			FROM users WHERE email = $1;
		`, [ email ]);

		if(query.rowCount == 0) return null;
		const user = query.rows[0];
		return {
			id: user.id,
			username: user.username,
			tag: user.tag,
			email: user.email,
			avatar: Utils.avatarUrl(user.id),
			isBanned: user.isBanned,
			isEmailConfirmed: user.isEmailConfirmed
		};
	}

	public static async getUserHashById(id: string): Promise<string | null> {
		const query = await db.query(sql`SELECT password_hash as "passwordHash" FROM users WHERE id = $1;`, [ id ]);
		if(query.rowCount == 0) return null;
		return query.rows[0].passwordHash;
	}

	public static async getUserHashByEmail(email: string): Promise<string | null> {
		const query = await db.query(sql`SELECT password_hash as "passwordHash" FROM users WHERE email = $1;`, [ email ]);
		if(query.rowCount == 0) return null;
		return query.rows[0].passwordHash;
	}

	public static async emailTaken(email: string): Promise<boolean> {
		const query = await db.query(sql`SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, [ email ]);
		return query.rows[0].exists;
	}
}
