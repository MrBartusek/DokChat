import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import ChatManager from '../../managers/chatManager';
import InviteManager from '../../managers/inviteManager';
import PermissionsManager from '../../managers/permissionsManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/invite',
	allowedMethods('GET'),
	ensureAuthenticated(),
	query('chat').isString(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const chatId = req.query.chat;

		if(!(await PermissionsManager.hasChatAccess(req.auth, chatId))) {
			return new ApiResponse(res).forbidden();
		}

		const participant = await ChatManager.getParticipant(chatId, null, req.auth.id);
		const invite = await InviteManager.createOrGetInvite(chatId, participant.id);

		new ApiResponse(res).success(invite);
	});

export default router;
