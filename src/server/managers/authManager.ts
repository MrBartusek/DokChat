import { Response } from 'express';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';
import * as DateFns from 'date-fns';
import { UserLoginResponse } from '../../types/endpoints';
import db from '../db';
import sql from 'sql-template-strings';
import * as bcrypt from 'bcrypt';
import JWTManager from './JWTManager';

export default class AuthManager {
	public static async authenticateUser(email: string, password: string): Promise<[UserJWTData, string]> {
		const query = await db.query(sql`SELECT id, username, tag, email, password_hash, is_banned as "isBanned" FROM users WHERE email=$1`, [ email ]);
		if(query.rowCount == 0) return Promise.reject('Provided email and password are not valid');
		const user = query.rows[0];
		const passwordValid = await bcrypt.compare(password, user.password_hash);
		if(!passwordValid) return Promise.reject('Provided email and password are not valid');

		const jwtData = {
			id: user.id,
			username: user.username,
			tag: user.tag,
			email: user.email,
			isBanned: user.isBanned
		};
		return [ jwtData, user.password_hash ];
	}

	public static async sendAuthResponse(res: Response, userData: UserJWTData, passwordHash: string, rememberMe?: boolean) {
		const refreshToken = await JWTManager.generateRefreshToken(userData.id, passwordHash);
		const token = await JWTManager.generateUserToken(userData);
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'strict',
			// Cookies expire after 30 minutes by default, keep the default if remember me is not checked
			expires: (rememberMe ? DateFns.addDays(new Date(), 30) : undefined)
		});
		const response: UserLoginResponse = {email: userData.email, token: token };
		new ApiResponse(res).success(response);
	}
}
