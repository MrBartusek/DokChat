import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import { isValidPassword } from '../../validators/isValidPassword';
import jwtManager from '../../managers/jwtManager';

const router = express.Router();

router.all('/login',
	allowedMethods('POST'),
	body('email').isEmail().normalizeEmail(),
	body('password').custom(isValidPassword),
	body('rememberMe').isBoolean().optional(),
	body('twoFactorCode').optional().isNumeric().isLength({ min: 6, max: 6}),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const email: string = req.body.email;
		const password: string = req.body.password;
		const rememberMe: boolean = req.body.rememberMe;

		const audience = jwtManager.getAudienceFromRequest(req);

		return AuthManager.authenticateUser(email, password)
			.then(async ([ jwtData, passwordHash ]) => {
				if(jwtData.is2FAEnabled && !req.body.twoFactorCode) {
					return new ApiResponse(res).badRequest('2FA_CODE_MISSING');
				}
				if(jwtData.is2FAEnabled && req.body.twoFactorCode) {
					const result = await UserManager.validate2FA(jwtData.id, req.body.twoFactorCode);
					if(!result) return new ApiResponse(res).badRequest('Invalid 2FA Code');
				}
				await UserManager.bumpLastSeen(jwtData.id);
				AuthManager.sendAuthResponse(res, jwtData, audience, passwordHash, rememberMe);
			})
			.catch((reason) => {
				if (typeof reason == 'string') {
					return new ApiResponse(res).unauthorized(reason);
				}
				throw reason;
			});
	});

export default router;
