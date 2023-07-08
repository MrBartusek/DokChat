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

		const result: ClientConfigResponse = {
			googleClientId: process.env.GOOGLE_CLIENT_ID,
			facebookClientId: process.env.GOOGLE_CLIENT_ID,
			recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
			tenorApiKey: process.env.TENOR_API_KEY
		};

		res.header('Cache-Control', `public, max-age=${12 * 60 * 60}, immutable`);
		new ApiResponse(res).success(result);
	});

export default router;
