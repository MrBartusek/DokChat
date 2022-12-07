import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';
import JWTManager from '../managers/JWTManager';
import { RecaptchaV2 } from 'express-recaptcha';

const recaptcha = new RecaptchaV2(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET);

const ensureCaptcha = () => async (req: Request, res: Response, next: NextFunction) => {
	const recaptchaResponse: string | undefined = req.body.recaptchaResponse;
	if(!recaptchaResponse) {
		return new ApiResponse(res, next).badRequest('Missing ReCAPTCHA response');
	}

	req.body['g-recaptcha-response'] = recaptchaResponse;
	return recaptcha.verify(req, (error, data) => {
		if(!error) {
			console.log(data);
			console.log('recaptha ok');
			return next();
		}
		return new ApiResponse(res, next).badRequest(`Invalid ReCAPTCHA response (${error})`);
	});
};

export default ensureCaptcha;
