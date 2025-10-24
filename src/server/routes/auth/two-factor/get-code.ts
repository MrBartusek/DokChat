import * as express from 'express';
import * as twoFactor from 'node-2fa';
import sql from 'sql-template-strings';
import * as QRCode from 'qrcode';
import { TwoFactorCodeResponse } from '../../../../types/endpoints';
import { ApiResponse } from '../../../apiResponse';
import db from '../../../db';
import allowedMethods from '../../../middlewares/allowedMethods';
import ensureAuthenticated from '../../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/get-code',
	allowedMethods('GET'),
	ensureAuthenticated(true),
	ensureRatelimit(5),
	async (req, res) => {
		const query = await db.query(sql`
		    SELECT is_two_factor_enabled as "isTwoFactorEnabled" FROM users WHERE id = $1;`,
		[ req.auth.id ]);

		const enabled = query.rows[0].isTwoFactorEnabled;
		if(enabled) {
			return new ApiResponse(res).badRequest('2FA is already enabled');
		}

		const newSecret = twoFactor.generateSecret({
			name: 'DokChat',
			account: req.auth.email
		});

		await db.query(sql`
		    UPDATE users SET two_factor_secret = $1 WHERE id = $2;`,
		[ newSecret.secret, req.auth.id ]);

		const qr =await QRCode.toDataURL(newSecret.uri);

		const response: TwoFactorCodeResponse = { qr, uri: newSecret.uri};
		return new ApiResponse(res).success(response);
	});

export default router;
