import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../../../types/common';
import { ApiResponse } from '../../apiResponse';
import BlockManager from '../../managers/blockManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/get',
	ensureAuthenticated(),
	allowedMethods('GET'),
	body('username').optional(),
	body('tag').optional(),
	body('id').optional(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const username = req.query.username as any;
		const tag = req.query.tag as any;
		const id = req.query.id as any;

		const haveId = id != undefined;
		const haveUsername = username != undefined;
		const haveTag = tag != undefined;

		if(haveId) {
			if(haveUsername || haveTag) return new ApiResponse(res).badRequest();
		}
		else {
			if(!haveUsername || !haveTag) return new ApiResponse(res).badRequest();
		}

		let user: User = null;
		if(haveId) {
			user = await UserManager.getUserById(id);
		}
		else {
			user = await UserManager.getUserByUsername(username, tag);
		}
		if(!user) return new ApiResponse(res).notFound('User not found');
		return new ApiResponse(res).success(user);
	});

export default router;
