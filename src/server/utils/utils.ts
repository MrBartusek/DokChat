import { Request } from 'express';
import { Handshake } from 'socket.io/dist/socket';
import * as crypto from 'crypto';
import { UserJWTData } from '../../types/jwt';

export default class Utils {
	public static apiUrl() {
		return '/api/';
	}

	public static avatarUrl(id: string) {
		return Utils.apiUrl() + `avatar?id=${id}`;
	}

	public static generateAWSFileName(bytes = 32) {
		return crypto.randomBytes(bytes).toString('hex');
	}

	public static userDiscriminator(user: UserJWTData) {
		return `${user.username}#${user.tag}`;
	}
}
