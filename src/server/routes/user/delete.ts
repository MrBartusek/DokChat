import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import emailClient from '../../aws/ses';
import db from '../../db';
import AuthManager from '../../managers/authManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/delete',
	ensureAuthenticated(),
	allowedMethods('DELETE'),
	body('password').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const password = req.body.password;

		AuthManager.authenticateUser(req.auth.email, password)
			.then(async ([ jwtData, passwordHash ]) =>  {
				await db.query('DELETE FROM users WHERE id=$1', [ req.auth.id ]);
				await emailClient.sendAccountDeletedEmail(req.auth);
				return new ApiResponse(res).success();
			})
			.catch((reason) => {
				if(typeof reason !== 'string') throw reason;
				return new ApiResponse(res).badRequest('Provided password is not valid');
			});
	});

export default router;
