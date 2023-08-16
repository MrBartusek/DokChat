import * as DateFns from 'date-fns';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import Utils from '../helpers/utils';

/**
 * This class initialization is split into two constructors. The default constructor
 * should not be used directly
 * Use User.empty() - for initialized user
 * Use User.fromJWT() - for logging in
 *
 * This should be treated as light object for storting data and
 * some utilities. Heavy lifting of updating this thing is handled in hooks
 */
export class LocalUser {
	public isAuthenticated: boolean;
	public isBanned: boolean;
	public isDemo: boolean;
	public isEmailConfirmed: boolean;
	public token: string;
	public id: string;
	public username: string;
	public tag: string;
	public email: string;
	public is2FAEnabled: boolean;
	private _avatar: string;
	public expiryDate: Date;
	public hasPassword: boolean;

	/**
	 * This is used for refreshing user avatar
	 */
	private avatarRefreshTimestamp: string;

	constructor() {
		this.isAuthenticated = false;
	}

	static empty() {
		return new LocalUser();
	}

	static fromJWT(token: string) {
		const user = new LocalUser();
		const data = jose.decodeJwt(token) as UserJWTData;

		user.isAuthenticated = true;
		user.token = token;
		user.id = data.id,
		user.username = data.username,
		user.tag = data.tag,
		user.email = data.email;
		user.isBanned = data.isBanned;
		user.isDemo = data.isDemo;
		user._avatar = data.avatar;
		user.isEmailConfirmed = data.isEmailConfirmed;
		user.is2FAEnabled = data.is2FAEnabled;
		user.expiryDate = DateFns.fromUnixTime(data.exp);
		user.hasPassword = data.hasPassword;

		return user;
	}

	public get expired(): boolean {
		if (!this.isAuthenticated) throw new Error('User is not authenticated');
		return DateFns.isPast(this.expiryDate);
	}

	public get expireIn(): number {
		if (!this.isAuthenticated) throw new Error('User is not authenticated');
		return DateFns.differenceInSeconds(this.expiryDate, new Date());
	}

	public getAuthHeader(): { [header: string]: string; } {
		if (!this.isAuthenticated) throw new Error('User is not authenticated');
		return {
			'Authorization': `Bearer ${this.token}`
		};
	}

	public get discriminator(): string {
		if (!this.isAuthenticated) throw new Error('User is not authenticated');
		return `${this.username}#${this.tag}`;
	}

	public get emailMasked(): string {
		const emailSplit = this.email.split('@');
		const domainSplit = emailSplit[1].split('.');
		const sender = emailSplit[0];
		const senderMask = sender[0] + '*'.repeat(sender.length - 1);
		const domainMask = domainSplit.map((item, i, arr) => {
			if (arr.length - 1 == i) return item;
			return item[0] + '*'.repeat(item.length - 1);
		}).join('.');
		return `${senderMask}@${domainMask}`;
	}

	public refreshAvatar(): void {
		this.avatarRefreshTimestamp = DateFns.getUnixTime(new Date()).toString();
	}

	public get avatar(): string {
		if (this.avatarRefreshTimestamp) {
			return this._avatar + `?timestamp=${this.avatarRefreshTimestamp}`;
		}
		return this._avatar;
	}

	public get avatarCached(): string {
		return this._avatar;
	}
}
