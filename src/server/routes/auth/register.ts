import * as bcrypt from 'bcrypt';
import * as DateFns from 'date-fns';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { UserJWTData } from '../../../types/jwt';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import AuthManager from '../../managers/authManager';
import ChatManager from '../../managers/chatManager';
import EmailBlacklistManager from '../../managers/emailBlacklistManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import { snowflakeGenerator } from '../../utils/snowflakeGenerator';
import Utils from '../../utils/utils';
import { isValidPassword } from '../../validators/password';
import { isValidUsername } from '../../validators/username';

const router = express.Router();

router.all('/register',
	allowedMethods('POST'),
	body('username').custom(isValidUsername),
	body('password').custom(isValidPassword),
	body('email').isEmail().normalizeEmail(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const username: string = req.body.username;
		const password: string = req.body.password;
		const email: string = req.body.email;

		if(await UserManager.emailTaken(email)) {
			return new ApiResponse(res).badRequest('This email is already taken');
		}
		if(await EmailBlacklistManager.isEmailBlacklisted(email)) {
			return new ApiResponse(res).badRequest('This email is blacklisted');
		}
		if((await usersWithUsernameCount(username)) >= 9999) {
			return new ApiResponse(res).badRequest('Too many users have this username');
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const tag = await generateTag(username);
		const userId = snowflakeGenerator.getUniqueID().toString();

		const timestamp = DateFns.getUnixTime(new Date());
		await db.query(sql`
		INSERT INTO users 
			(id, username, tag, email, password_hash, created_at, last_seen)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7
		);
		`, [ userId, username, tag, email, passwordHash, timestamp, timestamp ]);
		const jwtData: UserJWTData = {
			id: userId,
			username: username,
			tag: tag,
			email: email,
			avatar: Utils.avatarUrl(userId),
			isBanned: false,
			isEmailConfirmed: false
		};

		// Add to public chat
		const publicChatId = await ChatManager.publicChatId();
		await ChatManager.addUserToChat(userId, publicChatId);
		AuthManager.sendAuthResponse(res, jwtData, passwordHash);
	});

async function usersWithUsernameCount(username: string): Promise<number> {
	const query = await db.query(sql`SELECT COUNT(*) FROM users WHERE username=$1`, [ username ]);
	return query.rows[0].count;
}

async function generateTag(username: string): Promise<string> {
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
export default router;
