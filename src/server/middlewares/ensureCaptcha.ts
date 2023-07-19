import { NextFunction, Request, Response } from 'express';
import { RecaptchaV2 } from 'express-recaptcha';
import { ApiResponse } from '../apiResponse';

const enableRecaptcha = process.env.ENABLE_RECAPTCHA === 'true';

let recaptcha: RecaptchaV2;
if(enableRecaptcha) {
	recaptcha = new RecaptchaV2(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET);
}

const ensureCaptcha = () => async (req: Request, res: Response, next: NextFunction) => {
	if(!enableRecaptcha) return next();

	const reCaptchaResponse: string | undefined = req.body.reCaptchaResponse;
	if (!reCaptchaResponse) {
		return new ApiResponse(res, next).badRequest('Missing ReCAPTCHA response');
	}

	req.body['g-recaptcha-response'] = reCaptchaResponse;
	return recaptcha.verify(req, (error, data) => {
		if (!error) {
			return next();
		}
		return new ApiResponse(res, next).badRequest(`Invalid ReCAPTCHA response (${error})`);
	});
};

export default ensureCaptcha;
