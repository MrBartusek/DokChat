import { Request } from 'express';

export default class Utils {
	public static apiUrl(req: Request) {
		return req.protocol + '://' + req.get('host') + '/api/';
	}
}
