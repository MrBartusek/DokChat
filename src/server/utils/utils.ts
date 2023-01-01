import validator from 'validator';
import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';

export default class Utils {
	public static apiUrl() {
		return '/api/';
	}

	public static avatarUrl(id: string) {
		return Utils.apiUrl() + `avatar/${id}.png`;
	}

	public static attachmentUrl(id: string) {
		return Utils.apiUrl() + `attachment?id=${id}`;
	}

	public static userDiscriminator(user: UserJWTData | User) {
		return `${user.username}#${user.tag}`;
	}

	public static emailToUsername(email: string): string {
		// eslint-disable-next-line
		const invalidCharacters = /[^0-9a-zA-Z_.\-]+/g;

		const normalized = validator.normalizeEmail(email);
		if(normalized == false) throw new Error('Invalid e-mail passed for emailToUsername');
		const inbox = normalized.split('@')[0];
		let username = inbox.replace(invalidCharacters, '');

		// Add random numbers at the end of username
		while(username.length < 5) {
			username += Math.floor(Math.random() * 10);
		}

		return username.substring(0, 32);
	}
}
