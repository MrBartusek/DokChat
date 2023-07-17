import * as express from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../apiResponse';
import allowedMethods from '../middlewares/allowedMethods';
import { ClientConfigResponse } from '../../types/endpoints';

const router = express.Router();

router.all('/', allowedMethods('GET'),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const enableSocialLogin = process.env.ENABLE_SOCIAL_LOGIN === 'true';
		const enableRecaptcha = process.env.ENABLE_RECAPTCHA === 'true';
		const enableTenor = process.env.ENABLE_TENOR === 'true';

		const result: ClientConfigResponse = {
			googleClientId: enableSocialLogin ? process.env.GOOGLE_CLIENT_ID : undefined,
			facebookClientId: enableSocialLogin ? process.env.GOOGLE_CLIENT_ID : undefined,
			recaptchaSiteKey: enableRecaptcha ? process.env.RECAPTCHA_SITE_KEY : undefined,
			tenorApiKey: enableTenor ? process.env.TENOR_API_KEY : undefined
		};

		res.header('Cache-Control', `public, max-age=${12 * 60 * 60}, immutable`);
		new ApiResponse(res).success(result);
	});

export default router;
