import * as DateFns from 'date-fns';
import * as express from 'express';
import { validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../../apiResponse';
import emailClient from '../../../aws/ses';
import db from '../../../db';
import ensureAuthenticated from '../../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/start', ensureAuthenticated(), async (req, res, next) => {
	const query = await db.query(sql`
		SELECT
			last_email_confirm_attempt as "lastConfirmAttempt",
			is_email_confirmed as "isEmailConfirmed"
		FROM users WHERE id = $1;`,
	[ req.auth.id ]);

	// Check if confirmed
	if(query.rows[0].isEmailConfirmed) return new ApiResponse(res).badRequest('This e-mail address is already confirmed');

	// Check cooldown
	const lastResetAttempt = DateFns.fromUnixTime(Number(query.rows[0].lastConfirmAttempt || 0));
	const lastResetAttemptInMinutes = DateFns.differenceInMinutes(new Date(), lastResetAttempt);
	if(lastResetAttemptInMinutes < 10) {
		return new ApiResponse(res).tooManyRequests('Confirmation for this email was just send lately, please check your inbox');
	}

	await emailClient.sendEmailConfirmEmail(req.auth, req.auth.email)
		.then(async () => {
			const timestamp = DateFns.getUnixTime(new Date()).toString();
			await db.query(sql`UPDATE users SET last_email_confirm_attempt = $1 WHERE id = $2;`, [ timestamp, req.auth.id ]);
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
