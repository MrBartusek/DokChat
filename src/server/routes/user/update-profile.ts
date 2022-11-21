import * as express from 'express';
import { UserJWTData } from '../../../types/jwt';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import AuthManager from '../../managers/authManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import sql from 'sql-template-strings';
import Validate from '../../utils/validate';
import * as multer from 'multer';
import * as sharp from 'sharp';
import s3Client from '../../aws/s3';
import Utils from '../../utils/utils';
import { DeleteObjectCommand, DeleteObjectCommandInput, DeleteObjectCommandOutput, PutObjectCommand } from '@aws-sdk/client-s3';
import { body, validationResult } from 'express-validator';
import { isValidUsername } from '../../validators/username';
import { isValidPassword } from '../../validators/password';
import { isValidTag } from '../../validators/tag';
import emailClient from '../../aws/ses';
import UserManager from '../../managers/userManager';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.all('/update-profile',
	ensureAuthenticated(),
	allowedMethods('PUT'),
	upload.single('avatar'),
	body('username').custom(isValidUsername),
	body('password').custom(isValidPassword),
	body('email').isEmail().normalizeEmail(),
	body('tag').custom(isValidTag),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const username: string = req.body.username;
		const tag: string = req.body.tag;
		const password: string = req.body.password;
		const email: string = req.body.email;
		const avatar = req.file;

		// Authenticate user with password
		const [ user ] = await AuthManager.authenticateUser(req.auth.email, password)
			.catch((reason) => {
				if(typeof reason !== 'string') throw reason;
				return new ApiResponse(res).badRequest('Provided password is not valid');
			}) as [UserJWTData, string];
		if(!user) return;

		const discriminatorChanged = user.username != username || user.tag != tag;
		const emailChanged = user.email != email;

		if(!discriminatorChanged && !emailChanged && !avatar) {
			return new ApiResponse(res).badRequest('Provided details are identical to current ones');
		}

		if(discriminatorChanged && await discriminatorTaken(username, tag)) {
			return new ApiResponse(res).badRequest('This username and tag belongs to another user, please select other discriminator');
		}
		if(emailChanged && await UserManager.emailTaken(email)) {
			return new ApiResponse(res).badRequest('This email is already in use');
		}

		// Upload avatar to S3
		if(avatar) {
			const oldAvatar = await getUserAvatar(user.id);
			if(oldAvatar) await s3Client.deleteFile(oldAvatar);
			const fileName = await s3Client.uploadAvatar(avatar);
			await db.query(sql`UPDATE users SET avatar = $1 WHERE id=$2`, [ fileName, user.id ]);
		}

		await db.query(sql`
		UPDATE users SET
			username = $1,
			tag = $2,
			email = $3
		WHERE id=$4`,
		[ username, tag, email, user.id ]);

		if(emailChanged) {
			await db.query(sql`UPDATE users SET is_email_confirmed = FALSE WHERE id = $1`, [ user.id ]);
			if(user.isEmailConfirmed) {
				await emailClient.sendEmailChangedEmail(req.auth);
			}
		}

		return new ApiResponse(res).success();
	});

async function discriminatorTaken(username: string, tag: string) {
	const result = await db.query(sql`
		 SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 AND tag = $2)`,
	[ username, tag ]);

	return result.rows[0].exists;
}

async function getUserAvatar(userId: string): Promise<string | null> {
	const avatarQuery = await db.query(sql`SELECT avatar FROM users WHERE id=$1`, [ userId ]);
	if(avatarQuery.rowCount != 1) throw new Error('Invalid user id provided to getUserAvatar');
	return avatarQuery.rows[0].avatar;
}

export default router;
