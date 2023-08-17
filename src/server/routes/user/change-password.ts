import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';
import * as bcrypt from 'bcrypt';
import sql from 'sql-template-strings';
import db from '../../db';
import { isValidPassword } from '../../validators/isValidPassword';

const router = express.Router();

router.all('/change-password',
	ensureAuthenticated(),
	allowedMethods('POST'),
	body('oldPassword').isString().optional(),
	body('newPassword').isString().custom(isValidPassword),
	ensureRatelimit(5),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const oldPassword = req.body.oldPassword;
		const newPassword = req.body.newPassword;

		if(oldPassword == newPassword) {
			return new ApiResponse(res).badRequest('New password cannot be identical to old one');
		}

		const passwordHash = await bcrypt.hash(newPassword, 12);

		if(req.auth.hasPassword) {
			AuthManager.authenticateUser(req.auth.email, oldPassword)
				.then(async ([ jwtData ]) => {
					const passwordHash = await bcrypt.hash(newPassword, 12);
					await db.query(sql`
			        	UPDATE users SET password_hash = $1 WHERE id = $2
		        `, [ passwordHash, jwtData.id ]);
					return new ApiResponse(res).success();
				})
				.catch((reason) => {
					if (typeof reason !== 'string') throw reason;
					return new ApiResponse(res).badRequest('Provided password is not valid');
				});
		}
		else {
			await db.query(sql`
				UPDATE users SET password_hash = $1 WHERE id = $2
			`, [ passwordHash, req.auth.id ]);
			return new ApiResponse(res).success();
		}
	});

export default router;
