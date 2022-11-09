import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import AuthManager from '../../managers/authManager';
import * as DateFns from 'date-fns';
import { UserJWTData } from '../../../types/jwt';
import JWTManager from '../../managers/JWTManager';

const router = express.Router();

router.all('/refresh', allowedMethods('POST'), async (req, res, next) => {
	const refreshToken: string = req.cookies.refreshToken;
	if(!refreshToken) {
		return new ApiResponse(res).unauthorized();
	}

	// Decode JWT
	const unconfirmedUserId = JWTManager.decodeRefreshToken(refreshToken);
	if(!unconfirmedUserId) return new ApiResponse(res).badRequest('Invalid JWT');

	// Get user
	const query = await db.query(sql`SELECT id, username, tag, email, password_hash, is_banned as "isBanned" FROM users WHERE id=$1`, [ unconfirmedUserId ]);
	if(query.rowCount == 0) return new ApiResponse(res).badRequest('Invalid user');
	const user = query.rows[0];
	const jwtData: UserJWTData = {
		id: user.id,
		username: user.username,
		tag: user.tag,
		email: user.email,
		isBanned: user.isBanned
	};

	// Verify token and respond
	await JWTManager.verifyRefreshToken(refreshToken, user.password_hash)
		.then(async (userId: string) => {
			if(userId != unconfirmedUserId) return new ApiResponse(res).unauthorized();

			// Update last seen
			const timestamp = DateFns.getUnixTime(new Date());
			await db.query(sql`UPDATE users SET last_seen=$1 WHERE id=$2`, [ timestamp, userId ]);

			AuthManager.sendAuthResponse(res, jwtData, user.password_hash);
		})
		.catch((error) => {
			return new ApiResponse(res).unauthorized();
		});
});

export default router;
