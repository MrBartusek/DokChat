import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import { isValidPassword } from '../../validators/password';

const router = express.Router();

router.all('/login',
	allowedMethods('POST'),
	body('email').isEmail().normalizeEmail(),
	body('password').custom(isValidPassword),
	body('rememberMe').isBoolean().optional(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const email: string = req.body.email;
		const password: string = req.body.password;
		const rememberMe: boolean = req.body.rememberMe;

		AuthManager.authenticateUser(email, password)
			.then(async ([ jwtData, passwordHash ]) =>  {
				await UserManager.bumpLastSeen(jwtData.id);
				AuthManager.sendAuthResponse(res, jwtData, passwordHash, rememberMe);
			})
			.catch((reason) => {
				if(typeof reason == 'string') {
					return new ApiResponse(res).unauthorized(reason);
				}
				throw reason;
			});
	});

export default router;
