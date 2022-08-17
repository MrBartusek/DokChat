import * as express from 'express';
import * as jose from 'jose';
import { Snowflake } from 'nodejs-snowflake';
import { UserLoginResponse } from '../../../types/endpoints';
import { UserJWTData } from '../../../types/jwt';
import { ApiResponse } from '../../apiResponse';

const router = express.Router();
const snowflakeGenerator = new Snowflake({
	custom_epoch: 1640991600000,
	instance_id: 0
});

router.get('/login', async (req, res, next) => {
	const userData: UserJWTData = {
		id: snowflakeGenerator.getUniqueID().toString(),
		username: 'MrBartusek',
		tag: '2115',
		email: 'bartusekcraft@gmail.com'
	};

	const key = new Uint8Array([1]);
	const token = await new jose.SignJWT(userData)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('2h')
		.sign(key);

	const response: UserLoginResponse = {
		email: 'test',
		token: token
	};
	new ApiResponse(res).success(response);
});

export default router;
