import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';

export default class Utils {
	public static userDiscriminator(user: UserJWTData | User) {
		return `${user.username}#${user.tag}`;
	}

	public static getBaseUrl() {
		if(this.isElectron()) {
			return this.isDev() ? 'http://localhost:3000' :'https://dokchat.dokurno.dev';
		}
		else {
			return window.location.origin;
		}
	}

	public static isElectron(): boolean {
		const userAgent = navigator.userAgent.toLowerCase();
		return userAgent.indexOf(' electron/') > -1;
	}

	public static isDev(): boolean {
		if(this.isElectron()) {
			return !window.electron.isPackaged;
		}
		return process.env.NODE_ENV != 'production';
	}
}
