import * as express from 'express';
import * as twoFactor from 'node-2fa';
import sql from 'sql-template-strings';
import { TwoFactorCodeResponse } from '../../../../types/endpoints';
import { ApiResponse } from '../../../apiResponse';
import db from '../../../db';
import allowedMethods from '../../../middlewares/allowedMethods';
import ensureAuthenticated from '../../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../../middlewares/ensureRatelimit';
import { body, validationResult } from 'express-validator';
import UserManager from '../../../managers/userManager';

const router = express.Router();

router.all('/disable',
	allowedMethods('POST'),
	ensureAuthenticated(true),
	ensureRatelimit(5),
	body('code').isNumeric().isLength({min: 6, max: 6}),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		await UserManager.validate2FA(req.auth.id, req.body.code)
			.then(async (success) => {
				if(success) {
					await db.query(sql`
		                UPDATE users SET is_two_factor_enabled = FALSE WHERE id = $1;`,
					[ req.auth.id ])
						.then(() => new ApiResponse(res).success());
				}
				else {
					return new ApiResponse(res).badRequest('Invalid 2FA Code');
				}

			})
			.catch((error: Error) => {
				console.error(error);
				return new ApiResponse(res).badRequest('Failed to disable 2FA on this account');
			});

	});

export default router;
