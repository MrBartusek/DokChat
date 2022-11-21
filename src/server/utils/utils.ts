import { Request } from 'express';
import { Handshake } from 'socket.io/dist/socket';
import * as crypto from 'crypto';
import { UserJWTData } from '../../types/jwt';
import { User } from '../../types/common';

export default class Utils {
	public static apiUrl() {
		return '/api/';
	}

	public static avatarUrl(id: string) {
		return Utils.apiUrl() + `avatar/${id}.png`;
	}

	public static userDiscriminator(user: UserJWTData | User) {
		return `${user.username}#${user.tag}`;
	}
}
