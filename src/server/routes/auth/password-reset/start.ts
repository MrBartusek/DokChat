import * as DateFns from 'date-fns';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../../apiResponse';
import emailClient from '../../../aws/ses';
import db from '../../../db';
import allowedMethods from '../../../middlewares/allowedMethods';

const router = express.Router();

router.all('/start', body('email').isEmail().normalizeEmail(), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

	const email: string = req.body.email;

	const query = await db.query(sql`SELECT last_pass_reset_attempt as "lastResetAttempt" FROM users WHERE email = $1;`, [ email ]);
	if(query.rowCount == 0)  {
		return new ApiResponse(res).badRequest('No account associated with this e-mail address was found');
	}

	const lastResetAttempt = DateFns.fromUnixTime(Number(query.rows[0].lastResetAttempt || 0));
	const lastResetAttemptInMinutes = DateFns.differenceInMinutes(new Date(), lastResetAttempt);

	if(lastResetAttemptInMinutes < 1) {
		return new ApiResponse(res).tooManyRequests('Password reset request for this email was just send lately, please check your inbox');
	}
	await emailClient.sendPasswordResetEmail(email)
		.then(async () => {
			const timestamp = DateFns.getUnixTime(new Date()).toString();
			await db.query(sql`UPDATE users SET last_pass_reset_attempt = $1 WHERE email = $2;`, [ timestamp, email ]);
			return new ApiResponse(res).success();
		})
		.catch((error) => {
			if(typeof error == 'string') {
				return new ApiResponse(res).badRequest(error);
			}
			throw error;
		});
});

export default router;
