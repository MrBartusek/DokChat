import { Request } from 'express';
import { Handshake } from 'socket.io/dist/socket';

export default class Utils {
	public static apiUrl(req: Request | Handshake) {
		const protocol = (req as any).protocol || (req.secure ? 'https' : 'http');
		return protocol + '://' + req.headers.host + '/api/';
	}

	public static avatarUrl(req: Request | Handshake, id: string) {
		return Utils.apiUrl(req) + `avatar?id=${id}`;
	}
}
