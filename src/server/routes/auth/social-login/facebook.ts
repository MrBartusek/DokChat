import axios from 'axios';
import * as DateFns from 'date-fns';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../../apiResponse';
import SocialLoginManager from '../../../managers/socialLoginManager';

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const router = express.Router();

router.all('/facebook', body('token').isString(), async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

	const token = req.body.token;

	const token_debug = await axios.get(`https://graph.facebook.com/v15.0/debug_token?input_token=${token}&access_token=${token}`)
		.then((res) => {
			const data = res.data.data;
			if(
				data.type !== 'USER' ||
				data.app_id !== FACEBOOK_CLIENT_ID ||
				DateFns.isPast(DateFns.fromUnixTime(data.expires_at)) ||
				data.is_valid !== true
			) {
				throw new Error('Invalid token');
			}
			return true;
		})
		.catch(() => {
			new ApiResponse(res).unauthorized('Provided Facebook token is not valid');
		});
	if(!token_debug) return;

	const data = await axios.get(`https://graph.facebook.com/v15.0/me?fields=id,email,picture.type(large)&access_token=${token}`)
		.then((res) => {
			return res.data;
		})
		.catch((error) => {
			console.error(error.response.data);
			new ApiResponse(res).unauthorized('Provided Facebook token is not valid');
		});
	if(!data) return;

	if(!data.email) {
		return new ApiResponse(res).unauthorized(
			'Failed to retrieve e-mail address from your Facebook account. ' +
			'Make sure you have granted e-mail read permissions permissions to DokChat.'
		);
	}

	const profilePicture = !data.picture?.data?.is_silhouette && data.picture?.data?.url;
	await SocialLoginManager.socialLogin(res, data.email, profilePicture);
});

export default router;
