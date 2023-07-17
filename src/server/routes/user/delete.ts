import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import AuthManager from '../../managers/authManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/delete',
	ensureAuthenticated(),
	allowedMethods('DELETE'),
	body('password').isString(),
	ensureRatelimit(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const password = req.body.password;

		AuthManager.authenticateUser(req.auth.email, password)
			.then(async ([jwtData]) => {
				await UserManager.deleteUser(jwtData);
				return new ApiResponse(res).success();
			})
			.catch((reason) => {
				if (typeof reason !== 'string') throw reason;
				return new ApiResponse(res).badRequest('Provided password is not valid');
			});
	});

export default router;
