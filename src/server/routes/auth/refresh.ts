import * as express from 'express';
import { cookie, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import jwtManager from '../../managers/jwtManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import RateLimitManager from '../../managers/rateLimitManager';

const router = express.Router();

router.all('/refresh',
	allowedMethods('POST'),
	cookie('refreshToken').isString().optional(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const refreshTokenCookie: string = req.cookies.refreshToken;
		const refreshTokenHeaderRaw: string = req.headers.authorization;
		if(refreshTokenCookie && refreshTokenHeaderRaw) {
			return new ApiResponse(res).badRequest();
		}
		if (refreshTokenHeaderRaw && !refreshTokenHeaderRaw.startsWith('Bearer ')) {
			return new ApiResponse(res).badRequest();
		}
		const refreshTokenHeader = refreshTokenHeaderRaw?.replace('Bearer ', '');

		const refreshToken = refreshTokenCookie ?? refreshTokenHeader;

		const unconfirmedUserId = jwtManager.decodeRefreshToken(refreshToken);
		if (!unconfirmedUserId) {
			return new ApiResponse(res).unauthorized('Invalid JWT');
		}

		const creditsLeft = await RateLimitManager.getCreditsLeft(unconfirmedUserId);
		if (creditsLeft < 5) {
			return new ApiResponse(res).tooManyRequests();
		}

		const user = await UserManager.getUserJwtDataById(unconfirmedUserId);
		const passwordHash = await UserManager.getUserHashById(unconfirmedUserId);

		const audience = jwtManager.getAudienceFromRequest(req);

		await jwtManager.verifyRefreshToken(refreshToken, audience, passwordHash)
			.then(async (userId: string) => {
				if (!(await RateLimitManager.consume(userId, 5))) {
					return new ApiResponse(res).tooManyRequests();
				}

				await UserManager.bumpLastSeen(userId);
				AuthManager.sendAuthResponse(res, user, audience, passwordHash);
			})
			.catch(() => {
				return new ApiResponse(res).unauthorized('Invalid JWT');
			});
	});

export default router;
