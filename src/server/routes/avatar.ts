import * as express from 'express';
import { param, validationResult } from 'express-validator';
import * as path from 'path';
import sql from 'sql-template-strings';
import { ApiResponse } from '../apiResponse';
import s3Client from '../aws/s3';
import db from '../db';
import ChatManager from '../managers/chatManager';
import UserManager from '../managers/userManager';
import allowedMethods from '../middlewares/allowedMethods';

const router = express.Router();

router.all('/:id.png', param('id').isString(), allowedMethods('GET'), async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);
	const id = req.params.id as string;

	let avatar = null;
	const user = await UserManager.getUserById(id);

	res.header('Cache-Control', s3Client.cacheControlHeader);
	if (user) {
		avatar = await userAvatar(id);
		if (avatar) {
			const avatarUrl = await s3Client.getSingedUrl(avatar);
			res.redirect(302, avatarUrl);
		}
		else {
			// Default avatar based on user tag
			res.sendFile(defaultAvatar(Number(user.tag) % 5));
		}
	}
	else {
		const chat = await ChatManager.getChat(id);
		if (!chat) return new ApiResponse(res).notFound('User or chat not found');
		avatar = await chatAvatar(id);
		if (avatar) {
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
	`, [id]);
	if (query.rowCount == 0) return null;
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
	`, [id]);
	if (query.rowCount == 0) return null;
	return query.rows[0].avatar;
}

function defaultAvatar(id: number): string {
	return path.join(__dirname, `../public/img/avatars/${id}.png`);
}

export default router;
