import * as DateFns from 'date-fns';
import * as express from 'express';
import { cookie, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import AuthManager from '../../managers/authManager';
import JWTManager from '../../managers/JWTManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';

const router = express.Router();

router.all('/refresh', allowedMethods('POST'), cookie('refreshToken').isString(), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

	const refreshToken: string = req.cookies.refreshToken;

	const unconfirmedUserId = JWTManager.decodeRefreshToken(refreshToken);
	if(!unconfirmedUserId) {
		return new ApiResponse(res).unauthorized('Invalid JWT');
	}

	const user = await UserManager.getUserJwtDataById(unconfirmedUserId);
	const passwordHash = await UserManager.getUserHashById(unconfirmedUserId);

	await JWTManager.verifyRefreshToken(refreshToken, passwordHash)
		.then(async (userId: string) => {
			await UserManager.bumpLastSeen(userId);
			AuthManager.sendAuthResponse(res, user, passwordHash);
		})
		.catch((error) => {
			return new ApiResponse(res).unauthorized('Invalid JWT');
		});
});

export default router;
