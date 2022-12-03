import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import { isValidPassword } from '../../validators/password';
import { isValidUsername } from '../../validators/username';

const router = express.Router();

router.all('/register',
	allowedMethods('POST'),
	body('username').custom(isValidUsername),
	body('password').custom(isValidPassword),
	body('email').isEmail().normalizeEmail(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const username: string = req.body.username;
		const password: string = req.body.password;
		const email: string = req.body.email;

		await UserManager.createUser(username, email, password)
			.then(([ userData, passwordHash ]) => {
				AuthManager.sendAuthResponse(res, userData, passwordHash);
			})
			.catch((reason) => {
				if(typeof reason == 'string') {
					return new ApiResponse(res).badRequest(reason);
				}
				throw reason;
			});

	});
export default router;
