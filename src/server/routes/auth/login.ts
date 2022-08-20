import * as express from 'express';
import { UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import * as bcrypt from 'bcrypt';
import allowedMethods from '../../middlewares/allowedMethods';
import { UserJWTData } from '../../../types/jwt';
import AuthManager from '../../managers/authManager';

const router = express.Router();

const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

router.all('/login', allowedMethods('POST'), async (req, res, next) => {
	const email: string = req.body.email;
	const password: string = req.body.password;

	if(!email || !password) {
		return new ApiResponse(res).badRequest('Invalid form body');
	}

	authenticateUser(email, password)
		.then(async ([jwtData, passwordHash]) =>  {
			AuthManager.sendAuthorizationResponse(res, jwtData, passwordHash);
		})
		.catch((reason) => {
			if(reason == INVALID_CREDENTIALS) {
				return new ApiResponse(res).badRequest('Provided email and password are not valid');
			}
			throw reason;
		});
});

async function authenticateUser(email: string, password: string): Promise<[UserJWTData, string]> {
	const query = await db.query(sql`SELECT id, username, tag, email, password_hash FROM users WHERE email=$1`, [email]);
	if(query.rowCount == 0) return Promise.reject(INVALID_CREDENTIALS);
	const user = query.rows[0];
	const passwordValid = await bcrypt.compare(password, user.password_hash);
	if(!passwordValid) return Promise.reject(INVALID_CREDENTIALS);

	const jwtData = {
		id: user.id,
		username: user.username,
		tag: user.tag,
		email: user.email
	};
	return [jwtData, user.password_hash];
}

export default router;
