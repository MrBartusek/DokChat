import { UserJWTData } from '../../types/jwt';
import * as jose from 'jose';
import * as DateFns from 'date-fns';
import { AxiosRequestHeaders } from 'axios';

/**
 * This class initialization is split into two constructors. The default constructor
 * should not be used directly
 * Use User.empty() - for initialized user
 * Use User.fromJWT() - for logging in
 *
 * This should be treated as light object for storting data and
 * some utilities. Heavy lifting of updating this thing is handled in hooks
 */
export class User {
	public isAuthenticated: boolean;
	public token: string;
	public id: string;
	public username: string;
	public tag: string;
	public email: string;
	public expiryDate: Date;

	constructor() {
		this.isAuthenticated = false;
	}

	static empty() {
		return new User();
	}

	static fromJWT(token: string) {
		const user = new User();
		const data = jose.decodeJwt(token) as UserJWTData;

		user.isAuthenticated = true;
		user.token = token;
		user.id = data.id,
		user.username = data.username,
		user.tag = data.tag,
		user.email = data.email;
		user.expiryDate = DateFns.fromUnixTime(data.exp);

		return user;
	}

	public get expired(): boolean {
		if(!this.isAuthenticated) throw new Error('User is not authenticated');
		return DateFns.isPast(this.expiryDate);
	}

	public get expireIn(): number {
		if(!this.isAuthenticated) throw new Error('User is not authenticated');
		return DateFns.differenceInSeconds(this.expiryDate, new Date());
	}

	/**
	 * Is this client ready to make authenticated requests
	*/
	public get ready(): boolean {
		return this.isAuthenticated && this.expired;
	}

	public getAuthHeader(): AxiosRequestHeaders {
		if(this.ready) throw new Error('User is not ready');
		return {
			'Authorization': `Bearer ${this.token}`
		};
	}
}
