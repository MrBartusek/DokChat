import { Response } from 'express';
import validator from 'validator';
import { ApiResponse } from '../apiResponse';
import Utils from '../utils/utils';
import AuthManager from './authManager';
import UserManager from './userManager';

export default class SocialLoginManager {
	public static async socialLogin(res: Response, email: string) {
		const normalizedEmail = validator.normalizeEmail(email);
		if(normalizedEmail == false) {
			return new ApiResponse(res).unauthorized('E-mail provided by social login provided is not valid');
		}
		const userExist = await UserManager.emailTaken(normalizedEmail);

		if(userExist) {
		// Login to user account
			const userData = await UserManager.getUserJwtDataByEmail(normalizedEmail);
			if(!userData.isEmailConfirmed) {
				return new ApiResponse(res).badRequest(
					'E-mail address associated with this account is not confirmed. ' +
					'In order to use social login please, login to this account using your ' +
					'e-mail address and request verification'
				);
			}
			const passwordHash = await UserManager.getUserHashByEmail(normalizedEmail);
			await AuthManager.sendAuthResponse(res, userData, passwordHash);
		}
		else {
		// Register user that doesn't exist
			const username = Utils.emailToUsername(normalizedEmail);
			await UserManager.createUser(username, normalizedEmail, null, true)
				.then(([ userData, passwordHash ]) => {
					AuthManager.sendAuthResponse(res, userData, passwordHash);
				})
				.catch((reason) => {
					if(typeof reason == 'string') {
						return new ApiResponse(res).badRequest(reason);
					}
					throw reason;
				});
		}
	}
}
