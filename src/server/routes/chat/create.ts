import * as DateFns from 'date-fns';
import * as express from 'express';
import { Request } from 'express';
import { body, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { Chat, User } from '../../../types/common';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import BlockManager from '../../managers/blockManager';
import ChatManager from '../../managers/chatManager';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import { snowflakeGenerator } from '../../utils/snowflakeGenerator';
import Utils from '../../utils/utils';
import { isUniqueArray } from '../../validators/isUniqueArray';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/create',
	allowedMethods('POST'),
	ensureAuthenticated(),
	body('participants').isArray({ min: 1, max: 25 }).custom(isUniqueArray),
	ensureRatelimit(10),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const participantIds = req.body.participants as string[];

		if (participantIds.includes(req.auth.id)) {
			return new ApiResponse(res).badRequest('Authenticated user is included in participants');
		}

		// Check if specific DM already exist
		const isDm = participantIds.length == 1;
		if (isDm) {
			const dmId = await ChatManager.dmExist(participantIds[0], req.auth.id);
			if (dmId !== false) {
				const chat = await ChatManager.getChat(dmId);
				return new ApiResponse(res).respond(true, 409, 'This DM already exist', chat);
			}
		}

		// Check if requesting user is blocking any of the participant and vice versa
		for await (const partId of participantIds) {
			const isBlocked = await BlockManager.isBlockedAny(req.auth.id, partId);
			if (isBlocked) {
				const user = await UserManager.getUserById(partId);
				return new ApiResponse(res).forbidden(`${Utils.userDiscriminator(user)} has blocked you or, you are blocking this user`);
			}
		}

		// Add req.auth user to participants
		participantIds.push(req.auth.id);

		// Fetch participants
		const participants = await convertIdsToUsers(participantIds);
		if (participants.includes(null)) {
			return new ApiResponse(res).badRequest('Invalid participants list');
		}

		const chat = await ChatManager.createChat(req.auth.id, participants);
		new ApiResponse(res).success(chat);
	});

async function convertIdsToUsers(ids: string[]): Promise<(User | null)[]> {
	return Promise.all(ids.map((id) => UserManager.getUserById(id)));
}

export default router;
