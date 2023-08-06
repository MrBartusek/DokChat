import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureCaptcha from '../../middlewares/ensureCaptcha';
import { isValidPassword } from '../../validators/isValidPassword';
import { isValidUsername } from '../../validators/isValidUsername';
import jwtManager, { TokenAudience } from '../../managers/jwtManager';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import RateLimitManager from '../../managers/rateLimitManager';
import { DesktopLoginResponse } from '../../../types/endpoints';

const router = express.Router();

router.all('/desktop-login', ensureAuthenticated(), async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

	if (!(await RateLimitManager.consume(req.auth.id, 5))) {
		return new ApiResponse(res).tooManyRequests();
	}

	const passwordHash = await UserManager.getUserHashById(req.auth.id);

	const refreshToken = await jwtManager.generateRefreshToken(
		req.auth.id, TokenAudience.DESKTOP_APP, passwordHash);
	const userData = await UserManager.getUserJwtDataById(req.auth.id);
	const token = await jwtManager.generateUserToken(userData, TokenAudience.DESKTOP_APP);

	const response: DesktopLoginResponse = { email: req.auth.email, refreshToken, token };
	new ApiResponse(res).success(response);

});
export default router;
