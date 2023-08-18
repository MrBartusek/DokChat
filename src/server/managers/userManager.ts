import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as DateFns from 'date-fns';
import sql from 'sql-template-strings';
import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import db, { user } from '../db';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import Utils from '../utils/utils';
import s3Client from './../aws/s3';
import emailClient from './../aws/ses';
import EmailBlacklistManager from './emailBlacklistManager';
import * as twoFactor from 'node-2fa';

export default class UserManager {
	public static async createUser(username: string, email: string, password?: string, socialLogin = false): Promise<[UserJWTData, string]> {
		if (await UserManager.emailTaken(email)) {
			return Promise.reject('This email is already taken');
		}
		if (await EmailBlacklistManager.isEmailBlacklisted(email)) {
			return Promise.reject('This email is blacklisted');
		}
		if ((await this.usersWithUsernameCount(username)) >= 9999) {
			return Promise.reject('Too many users have this username');
		}

		if (!password && !socialLogin) {
			throw new Error('No password provided');
		}
		else if (!password && socialLogin) {
			// Generate random password for social registers
			password = crypto.randomBytes(32).toString('hex');
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const tag = await this.generateTag(username);
		const userId = snowflakeGenerator.getUniqueID().toString();

		const timestamp = DateFns.getUnixTime(new Date());
		const emailServiceEnabled = process.env.ENABLE_EMAIL_SERVICE == 'true';
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
			// confirm email for social logins or if email system is disabled
			socialLogin || !emailServiceEnabled
		]);

		const jwtData: UserJWTData = {
			id: userId,
			username: username,
			tag: tag,
			email: email,
			avatar: Utils.avatarUrl(userId),
			isBanned: false,
			isAdmin: false,
			isEmailConfirmed: socialLogin || !emailServiceEnabled,
			isDemo: false,
			is2FAEnabled: false,
			hasPassword: !socialLogin
		};
		return [ jwtData, passwordHash ];
	}

	public static async createDemoUser(): Promise<[UserJWTData, string]> {
		const demoIdentifier = `demo-${crypto.randomBytes(4).toString('hex')}`;
		const email = `${demoIdentifier}@dokurno.dev`;

		if (await UserManager.emailTaken(email)) {
			console.log(`Failed to create demo account: ${demoIdentifier} - duplicate email`);
			return UserManager.createDemoUser();
		}
		if ((await this.usersWithUsernameCount(demoIdentifier)) >= 9999) {
			console.log(`Failed to create demo account: ${demoIdentifier} - username taken`);
			return UserManager.createDemoUser();
		}

		const tag = await this.generateTag(demoIdentifier);
		const userId = snowflakeGenerator.getUniqueID().toString();

		const timestamp = DateFns.getUnixTime(new Date());
		await db.query(sql`
		INSERT INTO users 
			(id, username, tag, email, password_hash, created_at, last_seen, is_email_confirmed, is_demo)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		);
		`, [
			userId,
			demoIdentifier,
			tag,
			email,
			'',
			timestamp,
			timestamp,
			true,
			true
		]);

		const jwtData: UserJWTData = {
			id: userId,
			username: demoIdentifier,
			tag: tag,
			email: email,
			avatar: Utils.avatarUrl(userId),
			isBanned: false,
			isAdmin: false,
			isEmailConfirmed: true,
			isDemo: true,
			is2FAEnabled: false,
			hasPassword: false
		};
		return [ jwtData, '' ];
	}

	public static async deleteUser(userData: UserJWTData): Promise<void> {
		console.log(`Removing account: ${userData.username}#${userData.tag} (${userData.email})`);
		await this.purgeUserAttachments(userData.id);

		await db.query('DELETE FROM users WHERE id=$1', [ userData.id ]);
		if (!userData.isDemo) {
			await emailClient.sendAccountDeletedEmail(userData);
		}
	}

	/**
	 * Remove avatar, all sent attachments and attachments in chats created by user,
	 * this is called right before deleting user data from database. Keep bucket from
	 * storing unused files.
	 */
	private static async purgeUserAttachments(userId: string) {
		const filesToDelete = [];

		console.log(`Purning S3 Files of ${userId}`);

		// Delete avatar
		const query = await db.query(sql`SELECT avatar FROM users WHERE id = $1;`, [ userId ]);
		if (query.rowCount > 0) {
			const avatarHash = query.rows[0].avatar;
			if(avatarHash) {
				console.log(`- Avatar (${avatarHash})`);
				filesToDelete.push(avatarHash);
			}
		}

		// Delete Attachments
		const attachmentsQuery = await db.query(sql`
			SELECT attachment FROM messages WHERE author_id=$1 AND attachment IS NOT NULL
		`, [ userId ]);
		attachmentsQuery.rows.forEach((r) => {
			console.log(`- Sent attachment: (${r.attachment})`);
			filesToDelete.push(r.attachment);
		});

		// Delete attachments from chats
		const chatsQuery = await db.query(sql`
			SELECT id FROM chats WHERE creator_id=$1
		`, [ userId ]);
		for await(const chat of chatsQuery.rows) {
			const attachmentsQuery = await db.query(sql`
				SELECT attachment FROM messages WHERE chat_id=$1 AND attachment IS NOT NULL
			`, [ chat.id ]);
			attachmentsQuery.rows.forEach((r) => {
				console.log(`- Attachment from created chat: (${r.attachment})`);
				filesToDelete.push(r.attachment);
			});
		}

		// Delete from bucket
		for await (const file of new Set(filesToDelete)) {
			await s3Client.deleteFile(file);
		}
		console.log(`Deleted ${filesToDelete.length} files from S3!`);
	}

	private static async usersWithUsernameCount(username: string): Promise<number> {
		const query = await db.query(sql`SELECT COUNT(*) FROM users WHERE username=$1`, [ username ]);
		return query.rows[0].count;
	}

	private static async generateTag(username: string): Promise<string> {
		const query = await db.query(sql`SELECT tag FROM users WHERE username=$1`, [ username ]);
		const takenTags = query.rows.map(u => u.tag);
		let tag: string | undefined = undefined;
		while (tag == undefined) {
			const newTag = Math.floor(Math.random() * 9999) + 1;
			if (!takenTags.includes(newTag)) {
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
		if (query.rowCount == 0) return null;
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
		if (query.rowCount == 0) return null;
		const user = query.rows[0];
		return {
			id: user.id,
			username: username,
			tag: tag,
			avatar: Utils.avatarUrl(user.id)
		};
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
				is_email_confirmed as "isEmailConfirmed",
				is_demo as "isDemo",
				is_admin as "isAdmin",
				is_two_factor_enabled as "isTwoFactorEnabled"
			FROM users WHERE id = $1;
		`, [ id ]);

		if (query.rowCount == 0) return null;
		const user = query.rows[0];
		return {
			id: user.id,
			username: user.username,
			tag: user.tag,
			email: user.email,
			avatar: Utils.avatarUrl(user.id),
			isBanned: user.isBanned,
			isAdmin: user.isAdmin,
			isEmailConfirmed: user.isEmailConfirmed,
			isDemo: user.isDemo,
			is2FAEnabled: user.isTwoFactorEnabled,
			hasPassword: user.passwordHash != ''
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
				is_admin as "isAdmin",
				is_email_confirmed as "isEmailConfirmed",
				is_demo as "isDemo",
				is_two_factor_enabled as "isTwoFactorEnabled"
			FROM users WHERE email = $1;
		`, [ email ]);

		if (query.rowCount == 0) return null;
		const user = query.rows[0];
		console.log( user.passwordHas);
		return {
			id: user.id,
			username: user.username,
			tag: user.tag,
			email: user.email,
			avatar: Utils.avatarUrl(user.id),
			isBanned: user.isBanned,
			isAdmin: user.isAdmin,
			isEmailConfirmed: user.isEmailConfirmed,
			isDemo: user.isDemo,
			is2FAEnabled: user.isTwoFactorEnabled,
			hasPassword: user.passwordHash != ''
		};
	}

	public static async getUserHashById(id: string): Promise<string | null> {
		const query = await db.query(sql`SELECT password_hash as "passwordHash" FROM users WHERE id = $1;`, [ id ]);
		if (query.rowCount == 0) return null;
		return query.rows[0].passwordHash;
	}

	public static async getUserHashByEmail(email: string): Promise<string | null> {
		const query = await db.query(sql`SELECT password_hash as "passwordHash" FROM users WHERE email = $1;`, [ email ]);
		if (query.rowCount == 0) return null;
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

	public static async bumpLastSeen(userId: string): Promise<void> {
		const timestamp = DateFns.getUnixTime(new Date());
		await db.query(sql`UPDATE users SET last_seen=$1 WHERE id=$2`, [ timestamp, userId ]);
	}

	public static async validate2FA(userId: string, code: string, skipEnabledCheck = false): Promise<boolean> {
		const query = await db.query(sql`
			SELECT
				two_factor_secret as "twoFactorSecret",
				is_two_factor_enabled as "isTwoFactorEnabled"
			FROM users WHERE id = $1;
		`, [ userId ]);

		if (query.rowCount == 0) throw new Error('User not found');
		const data = query.rows[0];
		if(!data.isTwoFactorEnabled && !skipEnabledCheck) {
			throw new Error('2FA is not enabled for this user');
		}

		const result = twoFactor.verifyToken(data.twoFactorSecret, code);
		return result?.delta == 0;
	}
}
