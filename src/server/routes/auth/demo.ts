import * as express from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import jwtManager from '../../managers/jwtManager';
import ensureCaptcha from '../../middlewares/ensureCaptcha';

const router = express.Router();

router.all('/demo',
	allowedMethods('POST'),
	ensureCaptcha(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const audience = jwtManager.getAudienceFromRequest(req);

		await UserManager.createDemoUser()
			.then(([ userData, passwordHash ]) => {
				AuthManager.sendAuthResponse(res, userData, audience, passwordHash);
			})
			.catch((reason) => {
				if (typeof reason == 'string') {
					return new ApiResponse(res).badRequest(reason);
				}
				throw reason;
			});

	});
export default router;
