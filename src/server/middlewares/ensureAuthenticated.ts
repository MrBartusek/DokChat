import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';
import JWTManager from '../managers/JWTManager';

const ensureAuthenticated = (allowBanned = false) => async (req: Request, res: Response, next: NextFunction) => {
	let token: string | undefined = req.headers.authorization;
	if(!token) {
		return new ApiResponse(res, next).unauthorized('User is not authenticated');
	}
	if(!token.startsWith('Bearer ')) {
		return new ApiResponse(res, next).badRequest();
	}
	token = token.replace('Bearer ', '');

	return JWTManager.verifyUserToken(token)
		.then((data) => {
			if(data.isBanned && !allowBanned) return new ApiResponse(res, next).forbidden('Account is suspended');
			(req as any).auth = data;
			return next();
		})
		.catch(() => {
			return new ApiResponse(res, next).unauthorized();
		});
};

export default ensureAuthenticated;
