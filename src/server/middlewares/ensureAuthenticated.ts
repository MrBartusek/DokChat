import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';
import jwtManager from '../managers/jwtManager';

const ensureAuthenticated = (allowUnconfirmedEmail = false) => async (req: Request, res: Response, next: NextFunction) => {
	let token: string | undefined = req.headers.authorization;
	if(!token) {
		return new ApiResponse(res, next).unauthorized('Authorization token is required for this route');
	}
	if(!token.startsWith('Bearer ')) {
		return new ApiResponse(res, next).badRequest('Invalid authorization token format');
	}
	token = token.replace('Bearer ', '');

	return jwtManager.verifyUserToken(token)
		.then((data) => {
			if(data.isBanned) return new ApiResponse(res, next).forbidden('Account is suspended');
			if(!data.isEmailConfirmed && !allowUnconfirmedEmail) return new ApiResponse(res, next).forbidden('E-mail not confirmed');
			(req as any).auth = data;
			return next();
		})
		.catch(() => {
			return new ApiResponse(res, next).unauthorized();
		});
};

export default ensureAuthenticated;
