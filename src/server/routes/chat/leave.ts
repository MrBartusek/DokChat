import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import { systemMessageHandler } from '../../handlers/systemMessageHandler';
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

		ChatManager.removeUserFromChat(chatId, req.auth.id);
		systemMessageHandler.sendChatLeave(chatId, req.auth);
		new ApiResponse(res).success();
	});

export default router;
