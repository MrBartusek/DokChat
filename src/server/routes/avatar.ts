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
import s3Client from '../aws/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { param, validationResult } from 'express-validator';
import * as DateFns from 'date-fns';

const S3_FILE_EXPIRE_TIME = 600;

const router = express.Router();

router.all('/:id.png', param('id').isString(), allowedMethods('GET'), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);
	const id = req.params.id as string;

	let avatar = null;
	const user = await UserManager.getUserById(id);

	if(user) {
		avatar = await userAvatar(id);
		if(avatar) {
			const avatarUrl = await s3Client.getSingedUrl(avatar);
			res.redirect(302, avatarUrl);
		}
		else {
			// Default avatar based on user tag
			res.sendFile(defaultAvatar(Number(user.tag) % 5));
		}
	}
	else {
		const chat = await ChatManager.getChat(req, id);
		if(!chat) return new ApiResponse(res).notFound('User or chat not found');
		avatar = await chatAvatar(id);
		if(avatar) {
			const avatarUrl = await s3Client.getSingedUrl(avatar);
			res.redirect(302, avatarUrl);
		}
		else {
			// Default avatar based on chat creator tag
			const creator = await UserManager.getUserById(chat.creatorId);
			res.sendFile(defaultAvatar(Number(creator.tag) % 5));
		}
	}
});

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
