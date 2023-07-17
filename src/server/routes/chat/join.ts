import * as DateFns from 'date-fns';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import { systemMessageHandler } from '../../handlers/systemMessageHandler';
import ChatManager from '../../managers/chatManager';
import InviteManager from '../../managers/inviteManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/join',
	allowedMethods('POST'),
	ensureAuthenticated(),
	body('invite').isString(),
	ensureRatelimit(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const inviteKey = req.body.invite;

		const invite = await InviteManager.getInviteByKey(inviteKey);

		const isExpired = invite && DateFns.isPast(DateFns.fromUnixTime(Number(invite.expireAt)));
		if (!invite || isExpired) {
			return new ApiResponse(res).badRequest('This invite is invalid or has expired');
		}

		const chat = await ChatManager.getChat(invite.chatId, req.auth.id);

		if (chat.participants.find(x => x.userId == req.auth.id)) {
			return new ApiResponse(res).badRequest('You are already a part of this chat');
		}

		systemMessageHandler.sendChatJoin(chat.id, req.auth);
		await ChatManager.addUserToChat(req.auth.id, chat.id);
		new ApiResponse(res).success(chat);
	});

export default router;
