import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { BlockStatusResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import BlockManager from '../../managers/blockManager';
import ChatManager from '../../managers/chatManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/block',
	ensureAuthenticated(),
	allowedMethods([ 'POST', 'GET' ]),
	body('id').isString(),
	body('blockStatus').optional().isBoolean(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const targetId = req.body.id;
		const shouldBlock = req.body.blockStatus;

		if(req.method == 'POST' && typeof shouldBlock !== 'boolean') {
			return new ApiResponse(res).badRequest('blockStatus is required for POST');
		}

		const isBlocked = await BlockManager.isBlocked(targetId, req.auth.id);

		if(req.method == 'POST') {
			if(isBlocked == shouldBlock) {
				return new ApiResponse(res).badRequest(`This user is ${shouldBlock ? 'already blocked' : 'not blocked'}`);
			}

			await BlockManager.setBlockStatus(req.auth.id, targetId, shouldBlock);

			if(shouldBlock) {
				await hideDMForTargets(req.auth.id, targetId);
			}

			return new ApiResponse(res).success();
		}
		else {
			const status: BlockStatusResponse = {
				id: targetId,
				blocked: isBlocked
			};
			return new ApiResponse(res).success(status);
		}

	});

async function hideDMForTargets(blockerId: string, targetId: string) {
	const chatId = await ChatManager.dmExist(blockerId, targetId);
	console.log(chatId);
	if(chatId) {
		await ChatManager.setChatHideForParticipantByUserId(chatId, blockerId, true);
		await ChatManager.setChatHideForParticipantByUserId(chatId, targetId, true);
	}
}

export default router;
