import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import AuthManager from '../../managers/authManager';

const router = express.Router();

router.all('/refresh', allowedMethods('POST'), async (req, res, next) => {
	const refreshToken: string = req.cookies.refreshToken;
	if(!refreshToken) {
		return new ApiResponse(res).unauthorized();
	}

	// Decode JWT
	const userId = AuthManager.decodeRefreshToken(refreshToken);
	if(!userId) return new ApiResponse(res).badRequest('Invalid JWT');

	// Get user
	const query = await db.query(sql`SELECT id, username, tag, email, password_hash FROM users WHERE id=$1`, [userId]);
	if(query.rowCount == 0) return new ApiResponse(res).badRequest('Invalid user');
	const user = query.rows[0];
	const jwtData = {
		id: user.id,
		username: user.username,
		tag: user.tag,
		email: user.email
	};

	// Verify token and respond
	await AuthManager.verifyRefreshToken(refreshToken, user.password_hash)
		.then(() => {
			AuthManager.sendAuthorizationResponse(res, jwtData, user.password_hash);
		})
		.catch((error) => {
			console.log(error);
			return new ApiResponse(res).unauthorized();
		});
});

export default router;
