import { Response } from 'express';
import validator from 'validator';
import { ApiResponse } from '../apiResponse';
import Utils from '../utils/utils';
import AuthManager from './authManager';
import UserManager from './userManager';
import sql from 'sql-template-strings';
import db from '../db';
import axios from 'axios';
import s3Client from '../aws/s3';

export default class SocialLoginManager {
	public static async socialLogin(res: Response, email: string, profilePictureUrl?: string) {
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
				.then(async ([ userData, passwordHash ]) => {
					if(profilePictureUrl) {
						const avatar = await this.uploadProfilePicture(profilePictureUrl);
						if(avatar) {
							await db.query(sql`UPDATE users SET avatar = $1 WHERE id=$2`, [ avatar, userData.id ]);
						}
					}
					await AuthManager.sendAuthResponse(res, userData, passwordHash);
				})
				.catch((reason) => {
					if(typeof reason == 'string') {
						return new ApiResponse(res).badRequest(reason);
					}
					throw reason;
				});
		}
	}

	private static async uploadProfilePicture(url: string): Promise<string | null> {
		return axios.get(url, {responseType: 'arraybuffer'})
			.then(async (res) => {
				const buffer = Buffer.from(res.data, 'binary');
				const fileName = await s3Client.uploadAvatar(buffer);
				return fileName;
			})
			.catch((error) => {
				console.error('Failed to upload profile picture from social login', error);
				return null;
			});
	}
}
