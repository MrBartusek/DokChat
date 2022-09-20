import { Request } from 'express';

export default class Utils {
	public static apiUrl(req: Request) {
		return req.protocol + '://' + req.get('host') + '/api/';
	}

	public static avatarUrl(req: Request, id: string) {
		return Utils.apiUrl(req) + `avatar?id=${id}`;
	}
}
