import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';
import AuthManager from '../managers/authManager';

const ensureAuthenticated = () => async (req: Request, res: Response, next: NextFunction) => {
	let token: string | undefined = req.headers.authorization;
	if(!token) {
		return new ApiResponse(res).unauthorized('No token provided');
	}
	if(!token.startsWith('Bearer ')) {
		return new ApiResponse(res).badRequest();

	}
	token = token.replace('Bearer ', '');

	return AuthManager.verifyJWT(token)
		.then((data) => {
			(req as any).auth = data;
			return next();
		})
		.catch(() => {
			return new ApiResponse(res).unauthorized();
		});
};

export default ensureAuthenticated;
