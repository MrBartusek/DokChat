import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as DateFns from 'date-fns';
import sql from 'sql-template-strings';
import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import db from '../db';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import Utils from '../utils/utils';
import ChatManager from './chatManager';
import EmailBlacklistManager from './emailBlacklistManager';

export default class UserManager {
	public static async createUser(username: string, email: string, password?: string, socialLogin = false): Promise<[UserJWTData, string]> {
		if(await UserManager.emailTaken(email)) {
			return Promise.reject('This email is already taken');
		}
		if(await EmailBlacklistManager.isEmailBlacklisted(email)) {
			return Promise.reject('This email is blacklisted');
		}
		if((await this.usersWithUsernameCount(username)) >= 9999) {
			return Promise.reject('Too many users have this username');
		}

		if(!password && !socialLogin) {
			throw new Error('No password provided');
		}
		else if(!password && socialLogin) {
			// Generate random password for social registers
			password = crypto.randomBytes(32).toString('hex');
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const tag = await this.generateTag(username);
		const userId = snowflakeGenerator.getUniqueID().toString();

		const timestamp = DateFns.getUnixTime(new Date());
		await db.query(sql`
		INSERT INTO users 
			(id, username, tag, email, password_hash, created_at, last_seen, is_email_confirmed)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		);
		`, [
			userId,
			username,
			tag,
			email,
			passwordHash,
			timestamp,
			timestamp,
			socialLogin /* confirm email for social logins */
		]);

		// Add to public chat
		const publicChatId = await ChatManager.publicChatId();
		await ChatManager.addUserToChat(userId, publicChatId);

		const jwtData: UserJWTData = {
			id: userId,
			username: username,
			tag: tag,
			email: email,
			avatar: Utils.avatarUrl(userId),
			isBanned: false,
			isEmailConfirmed: socialLogin
		};
		return [ jwtData, passwordHash ];
	}

	private static async usersWithUsernameCount(username: string): Promise<number> {
		const query = await db.query(sql`SELECT COUNT(*) FROM users WHERE username=$1`, [ username ]);
		return query.rows[0].count;
	}

	private static async generateTag(username: string): Promise<string> {
		const query = await db.query(sql`SELECT tag FROM users WHERE username=$1`, [ username ]);
		const takenTags = query.rows.map(u => u.tag);
		let tag: string | undefined = undefined;
		while(tag == undefined) {
			const newTag = Math.floor(Math.random() * 9999) + 1;
			if(!takenTags.includes(newTag)) {
				tag = newTag.toString().padStart(4, '0');
			}
		}
		return tag;
	}

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

	public static async confirmEmail(userData: UserJWTData): Promise<void> {
		await db.query(sql`
			UPDATE users SET is_email_confirmed = 'true' WHERE id = $1
		`, [ userData.id ]);
	}
}
