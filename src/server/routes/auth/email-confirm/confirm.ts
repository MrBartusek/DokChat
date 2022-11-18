import * as bcrypt from 'bcrypt';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { QueryResult } from 'pg';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../../apiResponse';
import db from '../../../db';
import JWTManager from '../../../managers/JWTManager';
import UserManager from '../../../managers/userManager';
import allowedMethods from '../../../middlewares/allowedMethods';
import { EmailConfirmJWTData } from '../../../types/jwt';
import { isValidPassword } from '../../../validators/password';

const router = express.Router();

router.all('/confirm', allowedMethods('POST'),
	body('token').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const token: string = req.body.token;

		await JWTManager.verifyEmailConfirmToken(token)
			.then(async (tokenData: EmailConfirmJWTData) => {
				if(!(await isTokenValid(tokenData))) {
					return new ApiResponse(res).unauthorized('Invalid token, please try to reset your password once again.');
				}
				if(await isEmailConfirmed(tokenData)) {
					return new ApiResponse(res).badRequest('This e-mail is already confirmed');
				}
				await confirmEmail(tokenData);
				return new ApiResponse(res).success();
			})
			.catch((error) => {
				return new ApiResponse(res).unauthorized('Invalid token, please try to reset your password once again.');
			});
	}
);

async function isTokenValid(tokenData: EmailConfirmJWTData): Promise<boolean> {
	const query = await db.query(sql`
		SELECT EXISTS(SELECT 1 FROM users WHERE id = $1 AND email = $2)
	`, [ tokenData.id, tokenData.email ]);
	return query.rows[0].exists;
}

async function isEmailConfirmed(tokenData: EmailConfirmJWTData): Promise<boolean> {
	const query = await db.query(sql`
		SELECT is_email_confirmed as "isEmailConfirmed"  FROM users WHERE id = $1 AND email = $2
	`, [ tokenData.id, tokenData.email ]);
	return query.rows[0].isEmailConfirmed;
}

async function confirmEmail(tokenData: EmailConfirmJWTData): Promise<QueryResult<any>> {
	return db.query(sql`
		UPDATE users SET is_email_confirmed = 'true' WHERE id = $1 AND email = $2
	`, [ tokenData.id, tokenData.email ]);
}

export default router;
