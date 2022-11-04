import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ChatManager from '../../managers/chatManager';
import { snowflakeGenerator } from '../../utils/snowflakeGenerator';
import * as DateFns from 'date-fns';
import UserManager from '../../managers/userManager';
import { Request } from 'express-serve-static-core';
import { Chat, User } from '../../../types/common';

const router = express.Router();

router.all('/create', allowedMethods('POST'), ensureAuthenticated(), async (req, res, next) => {
	const participantIds = req.body.participants as string[];
	if(!Array.isArray(participantIds)) return new ApiResponse(res).badRequest();
	if(participantIds.length <= 0) return new ApiResponse(res).badRequest();
	if(participantIds.length > 25) return new ApiResponse(res).badRequest();

	// Add req.auth user to participants
	if(participantIds.includes(req.auth.id)) {
		return new ApiResponse(res).badRequest('Authenticated user is included in participants');
	}
	participantIds.push(req.auth.id);

	// Check if specific DM already exist
	const dmId = await ChatManager.dmExist(participantIds[0], participantIds[1]);
	if(dmId !== false) {
		const chat = await ChatManager.getChat(req, dmId, req.auth.id);
		return new ApiResponse(res).respond(true, 409, 'This DM already exist', chat);
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

	return ChatManager.getChat(req, chatId, req.auth.id);
}

async function convertIdsToUsers(ids: string[]): Promise<(User | null)[]> {
	return Promise.all(ids.map((id) => UserManager.getUserById(id)));
}

export default router;
