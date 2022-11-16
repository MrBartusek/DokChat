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
import s3Client, { bucketName } from '../../aws/s3';
import Utils from '../../utils/utils';
import { DeleteObjectCommand, DeleteObjectCommandOutput, PutObjectCommand } from '@aws-sdk/client-s3';
import { body, validationResult } from 'express-validator';
import { isValidUsername } from '../../validators/username';
import { isValidPassword } from '../../validators/password';
import { isValidTag } from '../../validators/TAG';

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
		console.log(req.body);
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
		if(emailChanged && await emailTaken(email)) {
			return new ApiResponse(res).badRequest('This email is already in use');
		}

		// Upload avatar to S3
		if(avatar) {
			const oldAvatar = await getUserAvatar(user.id);
			if(oldAvatar) {
				await deleteAvatar(oldAvatar);
			}
			const fileName = await uploadAvatar(user.id, avatar);
			await db.query(sql`UPDATE users SET avatar = $1 WHERE id=$2`, [ fileName, user.id ]);
		}

		await db.query(sql`
		UPDATE users SET
			username = $1,
			tag = $2,
			email = $3
		WHERE id=$4`,
		[ username, tag, email, user.id ]);

		return new ApiResponse(res).success();
	});

async function discriminatorTaken(username: string, tag: string) {
	const result = await db.query(sql`
		 SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 AND tag = $2)`,
	[ username, tag ]);

	return result.rows[0].exists;
}

async function emailTaken(email: string) {
	const result = await db.query(sql`
		 SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`,
	[ email ]);

	return result.rows[0].exists;
}

async function uploadAvatar(userId: string, avatar: Express.Multer.File): Promise<string> {
	const fileBuffer = await sharp(avatar.buffer)
		.resize({ height: 256, width: 256, fit: 'cover' })
		.toBuffer();
	const fileName = Utils.generateAWSFileName();
	const uploadParams = {
		Bucket: bucketName,
		Body: fileBuffer,
		Key: fileName,
		ContentType: avatar.mimetype
	};
	await s3Client.send(new PutObjectCommand(uploadParams));
	return fileName;
}

async function getUserAvatar(userId: string): Promise<string | null> {
	const avatarQuery = await db.query(sql`SELECT avatar FROM users WHERE id=$1`, [ userId ]);
	if(avatarQuery.rowCount != 1) throw new Error('Invalid user id provided to getUserAvatar');
	return avatarQuery.rows[0].avatar;
}

async function deleteAvatar(key: string): Promise<DeleteObjectCommandOutput> {
	const deleteParams = {
		Bucket: bucketName,
		Key: key
	};
	return s3Client.send(new DeleteObjectCommand(deleteParams));
}

export default router;
