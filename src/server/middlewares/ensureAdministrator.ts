import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';

const ensureAdministrator = () => async (req: Request, res: Response, next: NextFunction) => {
	if(req.auth.isAdmin == true) {
		next();
	}
	else {
		return new ApiResponse(res, next).forbidden();
	}
};

export default ensureAdministrator;
