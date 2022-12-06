import * as express from 'express';
import { body, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import ChatManager from '../../managers/chatManager';
import PermissionsManager from '../../managers/permissionsManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/leave',
	allowedMethods('POST'),
	ensureAuthenticated(true),
	body('chat').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const chatId = req.body.chat;

		if(!(await PermissionsManager.hasChatAccess(req.auth, chatId))) {
			return new ApiResponse(res).forbidden();
		}

		const chat = await ChatManager.getChat(chatId);
		if(!chat.isGroup) {
			return new ApiResponse(res).badRequest('Cannot leave chat that is not a group');
		}

		await db.query(sql`
            DELETE FROM participants WHERE user_id = $1 AND chat_id=$2
        `, [ req.auth.id, chatId ]);

		new ApiResponse(res).success();
	});

export default router;
