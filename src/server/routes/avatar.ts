import * as express from 'express';
import allowedMethods from '../middlewares/allowedMethods';
import { ApiResponse } from '../apiResponse';
import * as path from 'path';
import UserManager from '../managers/userManager';
import db from '../db';
import sql from 'sql-template-strings';
import Utils from '../utils/utils';
import ChatManager from '../managers/chatManager';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { bucketName } from '../aws/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

router.all('/', allowedMethods('GET'), async (req, res, next) => {
	const id = req.query.id as string;
	if(typeof id != 'string') new ApiResponse(res).badRequest();

	let avatar = null;
	const user = await UserManager.getUserById(req, id);

	if(user) {
		console.log('get user avatar', id);
		avatar = await userAvatar(id);
		res.header('Cache-Control', 'private max-age=3600');
		if(avatar) {
			const avatarUrl = await getAvatarSingedUrl(avatar);
			res.redirect(301, avatarUrl);
		}
		else {
			// Default avatar based on user tag
			res.sendFile(defaultAvatar(Number(user.tag) % 5));
		}
	}
	else {
		console.log('get chat avatar', id);
		const chat = await ChatManager.getChat(req, id);
		if(!chat) return new ApiResponse(res).notFound('User or chat not found');
		avatar = chatAvatar(id);
		res.header('Cache-Control', 'private max-age=3600');
		if(avatar) {
			const avatarUrl = await getAvatarSingedUrl(avatar);
			res.redirect(301, avatarUrl);
		}
		else {
			// Default avatar based on chat creator tag
			res.sendFile(defaultAvatar(Number(user.tag) % 5));
		}
	}
});

async function getAvatarSingedUrl(key: string): Promise<string> {
	const getParams = {
		Bucket: bucketName,
		Key: key
	};
	const getCommand = new GetObjectCommand(getParams);
	return await getSignedUrl(
		s3Client, getCommand, { expiresIn: 5 * 60 }
	);
}

async function userAvatar(id: string): Promise<string | null> {
	const query = await db.query(sql`
		SELECT
			avatar
		FROM
			users
		WHERE id = $1
		LIMIT 1;
	`, [ id ]);
	if(query.rowCount == 0) return null;
	return await query.rows[0].avatar;
}

async function chatAvatar(id: string): Promise<string | null> {
	const query = await db.query(sql`
		SELECT
			avatar
		FROM
			chats
		WHERE id = $1
		LIMIT 1;
	`, [ id ]);
	if(query.rowCount == 0) return null;
	return query.rows[0].avatar;
}

function defaultAvatar(id: number): string {
	return path.join(__dirname, `../public/img/avatars/${id}.png`);
}

export default router;
