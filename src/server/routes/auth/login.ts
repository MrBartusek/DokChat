import * as express from 'express';
import { UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import JWT from '../../utils/jwt';
import sql from 'sql-template-strings';
import * as bcrypt from 'bcrypt';
import allowedMethods from '../../middlewares/allowedMethods';

const router = express.Router();
const jwtManager = new JWT();

router.all('/login', allowedMethods('POST'), async (req, res, next) => {
	const email: string = req.body.email;
	const password: string = req.body.password;

	if(!email || !password) {
		return new ApiResponse(res).userError('Invalid form body');
	}

	const query = await db.query(sql`SELECT id, username, tag, email, password_hash FROM users WHERE email=$1`, [email]);
	if(query.rowCount == 0) return new ApiResponse(res).userError('Provided email and password are not valid');
	const user = query.rows[0];
	const passwordValid = await bcrypt.compare(password, user.password_hash);
	if(!passwordValid) return new ApiResponse(res).userError('Provided email and password are not valid');

	const token = await jwtManager.generateJWT({
		id: user.id,
		username: user.username,
		tag: user.tag,
		email: user.email
	});
	const result: UserLoginResponse = {
		email: user.email,
		token: token
	};
	new ApiResponse(res).success(result);

	return;
});

export default router;
