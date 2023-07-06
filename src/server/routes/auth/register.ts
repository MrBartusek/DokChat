import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureCaptcha from '../../middlewares/ensureCaptcha';
import { isValidPassword } from '../../validators/isValidPassword';
import { isValidUsername } from '../../validators/isValidUsername';

const router = express.Router();

const registerLimiter = new RateLimiterMemory({
	points: 3,
	duration: 10 * 1000
});

router.all('/register',
	allowedMethods('POST'),
	ensureCaptcha(),
	body('username').custom(isValidUsername),
	body('password').custom(isValidPassword),
	body('email').isEmail().normalizeEmail(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '0.0.0.0';
		const limiterRes = await registerLimiter.consume(ip, 1)
			.catch(() => {
				return new ApiResponse(res).tooManyRequests();
			});
		if(!limiterRes) return;

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
