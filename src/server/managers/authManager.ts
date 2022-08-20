import { Response } from 'express';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';

const TOKEN_SECRET = '123k1mdio1u2312j1p2oi4k1i2e1io2j';
const REFRESH_TOKEN_SECRET = '123k1mdio1u23qweqweq12j1p2oi4k1i2e1io2j';

export default class AuthManager {
	public static async sendAuthorizationResponse(res: Response, userData: UserJWTData, passwordHash: string) {
		const refreshToken = await this.generateRefreshToken(userData.id, passwordHash);
		const token = await this.generateJWT(userData);
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'strict'
		});
		new ApiResponse(res).success({token: token });
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
}
