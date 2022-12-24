import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { ApiResponse } from '../apiResponse';
import InviteManager from '../managers/inviteManager';
import allowedMethods from '../middlewares/allowedMethods';

const router = express.Router();

router.all('/invite-info',
	allowedMethods('GET'),
	query('invite').isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const inviteKey = req.query.invite;

		const invite = await InviteManager.getInviteByKey(inviteKey);

		new ApiResponse(res).success(invite);
	});

export default router;
