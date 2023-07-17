import * as bcrypt from 'bcrypt';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../../apiResponse';
import db from '../../../db';
import jwtManager from '../../../managers/jwtManager';
import UserManager from '../../../managers/userManager';
import allowedMethods from '../../../middlewares/allowedMethods';
import { isValidPassword } from '../../../validators/isValidPassword';
import ensureRatelimit from '../../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/update', allowedMethods('POST'),
	body('password').custom(isValidPassword),
	body('token').isString(),
	ensureRatelimit(10),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const password: string = req.body.password;
		const token: string = req.body.token;

		const unconfirmedUserId = jwtManager.decodePassResetToken(token);
		if (!unconfirmedUserId) {
			return new ApiResponse(res).unauthorized('Invalid token, please try to reset your password once again.');
		}
		const user = await UserManager.getUserJwtDataById(unconfirmedUserId);
		if (!user) return new ApiResponse(res).badRequest('User not found');
		const passwordHash = await UserManager.getUserHashById(unconfirmedUserId);
		await jwtManager.verifyPassResetToken(token, user.email, passwordHash)
			.then(async (userId: string) => {
				if (bcrypt.compareSync(password, passwordHash)) {
					return new ApiResponse(res).badRequest('New password cannot be same as the old one');
				}

				const newPasswordHash = await bcrypt.hash(password, 12);
				await db.query(sql`UPDATE users SET password_hash = $1 WHERE id = $2;`, [newPasswordHash, userId]);
				return new ApiResponse(res).success();
			})
			.catch((error) => {
				return new ApiResponse(res).unauthorized('Invalid token, please try to reset your password once again.');
			});
	});

export default router;
