import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';
import RateLimitManager from '../managers/rateLimitManager';

const ensureRatelimit = (credits = 1) => async (req: Request, res: Response, next: NextFunction) => {
	const status = await RateLimitManager.consume(req.auth, credits);
	if (status) {
		return next();
	}
	else {
		return new ApiResponse(res, next).tooManyRequests();
	}
};

export default ensureRatelimit;
