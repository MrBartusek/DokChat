import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { ApiResponse } from '../apiResponse';
import InviteManager from '../managers/inviteManager';
import allowedMethods from '../middlewares/allowedMethods';
import * as DateFns from 'date-fns';
import { InviteResponse } from '../../types/endpoints';
import ChatManager from '../managers/chatManager';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/',
	allowedMethods('GET'),
	ensureAuthenticated(),
	query('key').isString(),
	async (req, res, next) => {
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
