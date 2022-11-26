import * as bcrypt from 'bcrypt';
import * as DateFns from 'date-fns';
import { Response } from 'express';
import { UserLoginResponse } from '../../types/endpoints';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';
import JWTManager from './JWTManager';
import UserManager from './userManager';

export default class AuthManager {
	public static async authenticateUser(email: string, password: string): Promise<[UserJWTData, string]> {
		const user = await UserManager.getUserJwtDataByEmail(email);
		const passwordHash = await UserManager.getUserHashByEmail(email);
		if(!user) {
			// Prevent timing-based attacks
			const dummyHash = '$2a$12$ofYWWnSx93s.whi3Zth6qOxUHTBPeDsowsI7Wq.CqpU9SCmLgrrNO';
			await bcrypt.compare(password, dummyHash);
			return Promise.reject('Provided email and password are not valid');
		}
		const passwordValid = await bcrypt.compare(password, passwordHash);
		if(!passwordValid) return Promise.reject('Provided email and password are not valid');

		return [ user, passwordHash ];
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
