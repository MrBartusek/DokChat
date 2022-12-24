import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import ChatManager from '../../managers/chatManager';
import PermissionsManager from '../../managers/permissionsManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/hide',
	allowedMethods('POST'),
	ensureAuthenticated(),
	body('chat').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const chatId = req.body.chat;

		if(!(await PermissionsManager.hasChatAccess(req.auth, chatId))) {
			return new ApiResponse(res).forbidden();
		}
		await ChatManager.setChatHideForParticipantByUserId(chatId, req.auth.id, true);
		new ApiResponse(res).success();
	});

export default router;
