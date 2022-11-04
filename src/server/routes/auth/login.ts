import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import allowedMethods from '../../middlewares/allowedMethods';
import AuthManager from '../../managers/authManager';
import EmailClient from '../../aws/ses';

const router = express.Router();

router.all('/login', allowedMethods('POST'), async (req, res, next) => {
	const email: string = req.body.email;
	const password: string = req.body.password;
	const rememberMe: string = req.body.rememberMe;

	if(
		typeof email !== 'string' ||
		typeof password !== 'string' ||
		typeof rememberMe !== 'boolean'
	) {
		return new ApiResponse(res).badRequest('Invalid form body');
	}

	AuthManager.authenticateUser(email, password)
		.then(async ([ jwtData, passwordHash ]) =>  {
			AuthManager.sendAuthResponse(res, jwtData, passwordHash);
		})
		.catch((reason) => {
			if(typeof reason == 'string') {
				return new ApiResponse(res).badRequest(reason);
			}
			throw reason;
		});
	const emailClient = new EmailClient();
	await emailClient.sendConfirmEmail('bartusekcraft@gmail.com', 'MrBartusek', '#');
});

export default router;
