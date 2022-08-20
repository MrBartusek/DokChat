import { Response } from 'express';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';
import * as DateFns from 'date-fns';
import { UserLoginResponse } from '../../types/endpoints';

const TOKEN_SECRET = '123k1mdio1u2312j1p2oi4k1i2e1io2j';
const REFRESH_TOKEN_SECRET = '123k1mdio1u23qweqweq12j1p2oi4k1i2e1io2j';

export default class AuthManager {
	public static async sendAuthorizationResponse(res: Response, userData: UserJWTData, passwordHash: string, rememberMe?: boolean) {
		const refreshToken = await this.generateRefreshToken(userData.id, passwordHash);
		const token = await this.generateJWT(userData);
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'strict',
			expires: (rememberMe ? DateFns.addDays(new Date(), 30) : undefined)
		});
		const response: UserLoginResponse = {email: userData.email, token: token };
		new ApiResponse(res).success(response);
	}

	private static async generateJWT(userData: UserJWTData) {
		const token = await new jose.SignJWT(userData)
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('5m')
			.sign(Buffer.from(TOKEN_SECRET));
		return token;
	}

	private static async generateRefreshToken(userId: string, passwordHash: string) {
		const token = await new jose.SignJWT({id: userId})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('30d')
			.sign(Buffer.from(REFRESH_TOKEN_SECRET + passwordHash));
		return token;
	}

	public static decodeRefreshToken(jwt: string): string | undefined {
		const data = jose.decodeJwt(jwt);
		return data.id as string;
	}

	public static async verifyRefreshToken(jwt: string, passwordHash: string): Promise<string> {
		return jose.jwtVerify(jwt, Buffer.from(REFRESH_TOKEN_SECRET + passwordHash))
			.then((data) => {
				if(!data.payload.id) return Promise.reject('Invalid JWT');
				return data.payload.id as string;
			});
	}
}
