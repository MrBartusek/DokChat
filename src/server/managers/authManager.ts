import { Response } from 'express';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';
import * as DateFns from 'date-fns';
import { UserLoginResponse } from '../../types/endpoints';
import db from '../db';
import sql from 'sql-template-strings';
import * as bcrypt from 'bcrypt';

const USER_TOKEN_SECRET = process.env.JWT_USER_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const PASS_RESET_TOKEN_SECRET = process.env.JWT_PASS_RESET_TOKEN_SECRET;

export default class AuthManager {
	public static async authenticateUser(email: string, password: string): Promise<[UserJWTData, string]> {
		const query = await db.query(sql`SELECT id, username, tag, email, password_hash FROM users WHERE email=$1`, [ email ]);
		if(query.rowCount == 0) return Promise.reject('Provided email and password are not valid');
		const user = query.rows[0];
		const passwordValid = await bcrypt.compare(password, user.password_hash);
		if(!passwordValid) return Promise.reject('Provided email and password are not valid');

		const jwtData = {
			id: user.id,
			username: user.username,
			tag: user.tag,
			email: user.email
		};
		return [ jwtData, user.password_hash ];
	}

	public static async sendAuthResponse(res: Response, userData: UserJWTData, passwordHash: string, rememberMe?: boolean) {
		const refreshToken = await this.generateRefreshToken(userData.id, passwordHash);
		const token = await this.generateUserToken(userData);
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'strict',
			// Cookies expire after 30 minutes by default, keep the default if remember me is not checked
			expires: (rememberMe ? DateFns.addDays(new Date(), 30) : undefined)
		});
		const response: UserLoginResponse = {email: userData.email, token: token };
		new ApiResponse(res).success(response);
	}

	private static async generateUserToken(userData: UserJWTData) {
		const token = await new jose.SignJWT(userData)
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('5m')
			.sign(Buffer.from(USER_TOKEN_SECRET));
		return token;
	}

	public static async verifyUserToken(token: string): Promise<UserJWTData> {
		return jose.jwtVerify(token, Buffer.from(USER_TOKEN_SECRET))
			.then((data) => {
				return data.payload as UserJWTData;
			});
	}

	private static async generateRefreshToken(userId: string, passwordHash: string) {
		const token = await new jose.SignJWT({id: userId})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('30d')
			.sign(Buffer.from(REFRESH_TOKEN_SECRET + passwordHash));
		return token;
	}

	public static decodeRefreshToken(token: string): string | undefined {
		const data = jose.decodeJwt(token);
		return data.id as string;
	}

	public static async verifyRefreshToken(token: string, passwordHash: string): Promise<string> {
		return jose.jwtVerify(token, Buffer.from(REFRESH_TOKEN_SECRET + passwordHash))
			.then((data) => {
				if(!data.payload.id) return Promise.reject('Invalid JWT');
				return data.payload.id as string;
			});
	}

	private static async generatePasswordResetToken(userId: string, passwordHash: string) {
		const token = await new jose.SignJWT({id: userId})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('1h')
			.sign(Buffer.from(PASS_RESET_TOKEN_SECRET + passwordHash));
		return token;
	}

	public static decodePasswordResetToken(token: string): string | undefined {
		const data = jose.decodeJwt(token);
		return data.id as string;
	}

	public static async verifyPasswordResetToken(token: string, passwordHash: string): Promise<string> {
		return jose.jwtVerify(token, Buffer.from(PASS_RESET_TOKEN_SECRET + passwordHash))
			.then((data) => {
				if(!data.payload.id) return Promise.reject('Invalid JWT');
				return data.payload.id as string;
			});
	}
}
