import * as DateFns from 'date-fns';
import * as express from 'express';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../../apiResponse';
import emailClient from '../../../aws/ses';
import db from '../../../db';
import JWTManager from '../../../managers/JWTManager';
import allowedMethods from '../../../middlewares/allowedMethods';
import * as bcrypt from 'bcrypt';

const router = express.Router();

router.all('/update', allowedMethods('POST'), async (req, res, next) => {
	const password: string = req.body.password;
	const token: string = req.body.token;
	if(typeof password !== 'string' || typeof token !== 'string') return new ApiResponse(res).badRequest('Invalid form body');

	const unconfirmedUserId = JWTManager.decodePassResetToken(token);

	const query = await db.query(sql`
		SELECT id, email, password_hash as "passwordHash" FROM users WHERE id = $1;`,
	[ unconfirmedUserId ]);
	if(query.rowCount == 0)  {
		return new ApiResponse(res).badRequest('User not found');
	}
	const user = query.rows[0];
	await JWTManager.verifyPassResetToken(token, user.email, user.passwordHash)
		.then(async (userId: string) => {
			if(userId != unconfirmedUserId) {
				return new ApiResponse(res).unauthorized('Invalid JWT');
			}
			if(bcrypt.compareSync(password, user.passwordHash)) {
				return new ApiResponse(res).badRequest('New password cannot be same as the old one');
			}

			const newPasswordHash = await bcrypt.hash(password, 12);
			await db.query(sql`UPDATE users SET password_hash = $1 WHERE id = $2;`, [ newPasswordHash, userId ]);
			return new ApiResponse(res).success();
		})
		.catch((error) => {
			console.log(error);
			return new ApiResponse(res).unauthorized('Invalid JWT');
		});
});

export default router;
