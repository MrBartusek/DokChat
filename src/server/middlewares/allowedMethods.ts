import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../apiResponse';

const allowedMethods = (methods: string | string[] = ['GET']) => (req: Request, res: Response, next: NextFunction) => {
	if(!Array.isArray(methods)) methods = [ methods ];
	if (methods.includes(req.method)) return next();
	new ApiResponse(res).methodNotAllowed(req);
};

export default allowedMethods;
