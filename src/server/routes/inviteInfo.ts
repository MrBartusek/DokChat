import * as DateFns from 'date-fns';
import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { InviteResponse } from '../../types/endpoints';
import { ApiResponse } from '../apiResponse';
import ChatManager from '../managers/chatManager';
import InviteManager from '../managers/inviteManager';
import allowedMethods from '../middlewares/allowedMethods';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/',
	allowedMethods('GET'),
	ensureAuthenticated(),
	query('key').isString(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const inviteKey = req.query.key;

		const invite = await InviteManager.getInviteByKey(inviteKey);

		const isExpired = invite && DateFns.isPast(DateFns.fromUnixTime(Number(invite.expireAt)));
		if(!invite || isExpired) {
			return new ApiResponse(res).badRequest('This invite is invalid or has expired');
		}

		const chat = await ChatManager.getChat(invite.chatId, req.auth.id );

		const result: InviteResponse = { invite, chat };
		new ApiResponse(res).success(result);
	});

export default router;
