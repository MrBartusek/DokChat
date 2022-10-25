import * as express from 'express';
import allowedMethods from '../middlewares/allowedMethods';
import { ApiResponse } from '../apiResponse';
import * as path from 'path';
import UserManager from '../managers/userManager';
import db from '../db';
import sql from 'sql-template-strings';
import Utils from '../utils';
import ChatManager from '../managers/chatManager';

const router = express.Router();

router.all('/', allowedMethods('GET'), async (req, res, next) => {
	const id = req.query.id as string;
	if(typeof id != 'string') new ApiResponse(res).badRequest();

	let avatar = null;
	const user = await UserManager.getUserById(req, id);

	if(user) {
		avatar = await userAvatar(id);
		if(!avatar) avatar = defaultAvatar(Number(user.tag) % 5);
	}
	else {
		const chat = await ChatManager.getChat(req, id);
		if(!chat) return new ApiResponse(res).notFound('User or chat not found');
		avatar = defaultAvatar(Number(user.tag) % 5);
	}

	res.header('Cache-Control', 'private max-age=3600');
	res.sendFile(avatar);
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
	return query.rows[0].avatar;
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
