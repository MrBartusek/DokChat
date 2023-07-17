import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../../apiResponse';
import { systemMessageHandler } from '../../handlers/systemMessageHandler';
import ChatManager from '../../managers/chatManager';
import PermissionsManager from '../../managers/permissionsManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/modify-participants',
	ensureAuthenticated(),
	allowedMethods([ 'DELETE', 'PUT' ]),
	body('chat').isString(),
	body('participant').optional().isString(),
	body('user').optional().isString(),
	ensureRatelimit(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const chatId = req.body.chat;
		const participantId = req.body.participant;
		const userId = req.body.user;

		if (req.method == 'DELETE' && (typeof participantId !== 'string' || typeof userId !== 'undefined')) {
			return new ApiResponse(res).badRequest('participantId is required for DELETE call');
		}
		else if (req.method == 'PUT' && (typeof userId !== 'string' || typeof participantId !== 'undefined')) {
			return new ApiResponse(res).badRequest('userId is required for PUT call');
		}

		if ((participantId || userId) == req.auth.id) {
			return new ApiResponse(res).badRequest('Cannot use modify-participants on authenticated user');
		}

		const hasAccess = await PermissionsManager.hasChatAccess(req.auth, chatId);
		if (!hasAccess) return new ApiResponse(res).forbidden();

		const isGroup = await ChatManager.isGroup(chatId);
		if (!isGroup) return new ApiResponse(res).badRequest('This chat is not a group');

		if (req.method == 'PUT') {
			const user = await UserManager.getUserById(userId);
			if (!user) return new ApiResponse(res).badRequest('This user does not exist');
			const part = await ChatManager.getParticipant(chatId, null, userId);
			if (part) return new ApiResponse(res).badRequest('This user is already part of this group');

			await ChatManager.addUserToChat(userId, chatId);
			systemMessageHandler.sendChatJoin(chatId, user);
		}
		else if (req.method == 'DELETE') {
			const participant = await ChatManager.getParticipant(chatId, participantId);
			if (!participant) return new ApiResponse(res).badRequest('This participant is not part of this group');

			await ChatManager.removeUserFromChat(participant.userId, chatId);
			systemMessageHandler.sendChatRemoved(chatId, participant, req.auth);
		}

		return new ApiResponse(res).success();
	});

export default router;
