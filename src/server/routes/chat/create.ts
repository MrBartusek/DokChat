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
import user from '../user';

const router = express.Router();

router.all('/create',
	allowedMethods('POST'),
	ensureAuthenticated(),
	body('participants').isArray({ min: 1, max: 25 }),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const participantIds = req.body.participants as string[];

		// Add req.auth user to participants
		if(participantIds.includes(req.auth.id)) {
			return new ApiResponse(res).badRequest('Authenticated user is included in participants');
		}
		participantIds.push(req.auth.id);

		// Check if specific DM already exist
		const dmId = await ChatManager.dmExist(participantIds[0], participantIds[1]);
		if(dmId !== false) {
			const chat = await ChatManager.getChat(dmId, req.auth.id);
			return new ApiResponse(res).respond(true, 409, 'This DM already exist', chat);
		}

		// Check if blocked
		for await(const partId of participantIds) {
			const isBlocked = await BlockManager.isBlockedAny(req.auth.id, partId);
			if(isBlocked) {
				const user = await UserManager.getUserById(partId);
				return new ApiResponse(res).forbidden(`${Utils.userDiscriminator(user)} has blocked you or, you are blocking this user`);
			}
		}

		// Fetch participants
		const participants = await convertIdsToUsers(participantIds);
		if(participants.includes(null)) {
			return new ApiResponse(res).badRequest('Invalid participants list');
		}

		const chat = await createChat(req, req.auth.id, participants);
		new ApiResponse(res).success(chat);
	});

async function createChat(req: Request, creatorId: string, participants: User[]): Promise<Chat> {
	// Create chat
	const chatId = snowflakeGenerator.getUniqueID().toString();
	const isGroup = participants.length > 2;
	await db.query(sql`
		INSERT INTO chats
			(id, is_group, creator_id, created_at)
		VALUES
			($1, $2, $3, $4)
	`, [
		chatId,
		isGroup,
		creatorId,
		DateFns.getUnixTime(new Date())
	]);

	for await(const part of participants) {
		// If this is a DM, hide a chat from other user
		// It will be shown again on first message
		const hide = (part.id != creatorId) && !isGroup;
		await ChatManager.addUserToChat(part.id, chatId, hide);
	}

	return ChatManager.getChat(chatId, req.auth.id);
}

async function convertIdsToUsers(ids: string[]): Promise<(User | null)[]> {
	return Promise.all(ids.map((id) => UserManager.getUserById(id)));
}

export default router;
