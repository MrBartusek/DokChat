import * as express from 'express';
import { UserJWTData } from '../../../types/jwt';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import AuthManager from '../../managers/authManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import sql from 'sql-template-strings';
import Validate from '../../utils/validate';

const router = express.Router();

router.all('/update-profile', ensureAuthenticated(), allowedMethods('PUT'), async (req, res, next) => {
	const username = req.body.username as any;
	const tag = req.body.tag as any;
	const password = req.body.password as any;
	const email = req.body.email as any;
	if(typeof username !== 'string' || typeof tag !== 'string' || typeof password !== 'string' || typeof email !== 'string') {
		return new ApiResponse(res).badRequest('Invalid form body');
	}
	const valid = validParameters(username, tag, email);
	if(valid !== true) {
		return new ApiResponse(res).badRequest(valid);
	}

	const [ user ] = await AuthManager.authenticateUser(req.auth.email, password)
		.catch((reason) => {
			if(typeof reason !== 'string') throw reason;
			return new ApiResponse(res).badRequest('Provided password is not valid');
		}) as [UserJWTData, string];
	if(!user) return;

	const discriminatorChanged = user.username != username || user.tag != tag;
	const emailChanged = user.email != email;

	if(!discriminatorChanged && !emailChanged) {
		return new ApiResponse(res).badRequest('Provided details are identical to current one');
	}

	if(discriminatorChanged && await discriminatorTaken(username, tag)) {
		return new ApiResponse(res).badRequest('This username and tag belongs to another user, please select other discriminator');
	}
	if(emailChanged && await emailTaken(email)) {
		return new ApiResponse(res).badRequest('This email is already in use');
	}

	await db.query(sql`
		UPDATE users SET
			username = $1,
			tag = $2,
			email = $3
		WHERE id=$4`,
	[ username, tag, email, user.id ]);

	return new ApiResponse(res).success();
});

async function discriminatorTaken(username: string, tag: string) {
	const result = await db.query(sql`
		 SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 AND tag = $2)`,
	[ username, tag ]);

	return result.rows[0].exists;
}

async function emailTaken(email: string) {
	const result = await db.query(sql`
		 SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`,
	[ email ]);

	return result.rows[0].exists;
}

function validParameters(username: string, tag: string, email: string): true | string {
	const usernameValid = Validate.username(username);
	if(usernameValid !== true) return usernameValid;

	const tagValid = Validate.tag(tag);
	if(tagValid !== true) return tagValid;

	const emailValid = Validate.email(email);
	if(emailValid !== true) return emailValid;

	return true;
}

export default router;
