import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import validator from 'validator';
import { ApiResponse } from '../../../apiResponse';
import { user } from '../../../db';
import AuthManager from '../../../managers/authManager';
import SocialLoginManager from '../../../managers/socialLoginManager';
import UserManager from '../../../managers/userManager';
import Utils from '../../../utils/utils';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const router = express.Router();
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.all('/google', body('token').isString(), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

	const token = req.body.token;

	const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID})
		.catch((error) => {
			new ApiResponse(res).unauthorized('Provided Google token is not valid');
		});
	if(!ticket) return;

	const payload = ticket.getPayload();
	if(!payload.email) {
		return new ApiResponse(res).unauthorized(
			'Failed to retrieve e-mail address from your Google account. ' +
			'Make sure you have granted e-mail read permissions permissions to DokChat.'
		);
	}
	if(!payload.email_verified) {
		return new ApiResponse(res).unauthorized('Provided Google e-mail address is not verified');
	}

	const profilePicture = payload.picture && payload.picture.replace('s96-c', 's256-c');
	await SocialLoginManager.socialLogin(res, payload.email, profilePicture);
});

export default router;
