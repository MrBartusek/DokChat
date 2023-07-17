import * as express from 'express';
import { body, query, validationResult } from 'express-validator';
import { BlockStatusResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import BlockManager from '../../managers/blockManager';
import ChatManager from '../../managers/chatManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/block',
	ensureAuthenticated(),
	allowedMethods([ 'POST', 'GET' ]),
	body('id').optional().isString(),
	query('id').optional().isString(),
	body('blockStatus').optional().isBoolean(),
	ensureRatelimit(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const targetId = req.body.id || req.query.id;
		const shouldBlock = req.body.blockStatus;

		if (typeof targetId !== 'string') {
			return new ApiResponse(res).badRequest('Invalid id provided');
		}

		if (req.method == 'POST' && typeof shouldBlock !== 'boolean') {
			return new ApiResponse(res).badRequest('blockStatus is required for POST');
		}

		const isBlocked = await BlockManager.isBlocked(targetId, req.auth.id);

		if (req.method == 'POST') {
			if (targetId == req.auth.id) {
				return new ApiResponse(res).badRequest('Cannot block authenticated user');
			}

			if (isBlocked == shouldBlock) {
				return new ApiResponse(res).badRequest(`This user is ${shouldBlock ? 'already blocked' : 'not blocked'}`);
			}

			await BlockManager.setBlockStatus(req.auth.id, targetId, shouldBlock);

			if (shouldBlock) {
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
	if (chatId) {
		await ChatManager.setChatHideForParticipantByUserId(chatId, blockerId, true);
		await ChatManager.setChatHideForParticipantByUserId(chatId, targetId, true);
	}
}

export default router;
