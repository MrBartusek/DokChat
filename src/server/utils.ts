import { Request } from 'express';

export default class Utils {
	public static get avatar(): typeof AvatarUtils {
		return AvatarUtils;
	}

	public static apiUrl(req: Request) {
		return req.protocol + '://' + req.get('host') + '/api/';
	}
}

class AvatarUtils {
	public static userUrl(req: Request, id: string) {
		return Utils.apiUrl(req) + `avatar?user=${id}`;
	}

	public static groupUrl(req: Request, id: string) {
		return Utils.apiUrl(req) + `avatar?group=${id}`;
	}
}
