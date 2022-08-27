import * as express from 'express';
import * as jose from 'jose';
import { Snowflake } from 'nodejs-snowflake';
import { UserLoginResponse } from '../../../types/endpoints';
import { UserJWTData } from '../../../types/jwt';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import Validate from '../../utils/validate';
import sql from 'sql-template-strings';
import * as bcrypt from 'bcrypt';
import JWT from '../../managers/authManager';
import allowedMethods from '../../middlewares/allowedMethods';
import AuthManager from '../../managers/authManager';
import * as DateFns from 'date-fns';

const router = express.Router();
const snowflakeGenerator = new Snowflake({
	custom_epoch: 1640991600000,
	instance_id: 0
});
const jwtManager = new JWT();

router.all('/register', allowedMethods('POST'), async (req, res, next) => {
	const username: string = req.body.username;
	const password: string = req.body.password;
	const email: string = req.body.email;

	if(!username || !password || !email) {
		return new ApiResponse(res).badRequest('Invalid form body');
	}
	const parametersResult = validParameters(username, password, email);
	if(parametersResult !== true) {
		return new ApiResponse(res).badRequest(parametersResult);
	}
	if(await emailTaken(email)) {
		return new ApiResponse(res).badRequest('This email is already taken');
	}
	if((await usersWithUsernameCount(username)) >= 9999) {
		return new ApiResponse(res).badRequest('Too many users have this username');
	}

	const hash = await bcrypt.hash(password, 12);
	const tag = await generateTag(username);
	const snowflake = snowflakeGenerator.getUniqueID().toString();

	const timestamp = DateFns.getUnixTime(new Date());
	await db.query(sql`
		INSERT INTO users 
			(id, username, tag, email, password_hash, created_at, last_seen)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7
		);
		`, [ snowflake, username, tag, email, hash, timestamp, timestamp]);
	const jwtData = {
		id: snowflake,
		username: username,
		tag: tag,
		email: email
	};
	AuthManager.sendAuthorizationResponse(res, jwtData, hash);
});

function validParameters(username: string, password: string, email: string): true | string {
	const usernameValid = Validate.username(username);
	if(usernameValid !== true) return usernameValid;

	const passwordValid = Validate.password(password);
	if(passwordValid !== true) return passwordValid;

	const emailValid = Validate.email(email);
	if(emailValid !== true) return emailValid;

	return true;
}

async function emailTaken(email: string): Promise<boolean> {
	const query = await db.query(sql`SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, [email]);
	return query.rows[0].exists;
}

async function usersWithUsernameCount(username: string): Promise<number> {
	const query = await db.query(sql`SELECT COUNT(*) FROM users WHERE username=$1`, [username]);
	return query.rows[0].count;
}

async function generateTag(username: string): Promise<string> {
	const query = await db.query(sql`SELECT tag FROM users WHERE username=$1`, [username]);
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
