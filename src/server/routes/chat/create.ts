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
	const participants = req.body.participants as string[];
	if(!Array.isArray(participants)) return new ApiResponse(res).badRequest();
	if(participants.length <= 1) return new ApiResponse(res).badRequest();
	if(participants.length > 25) return new ApiResponse(res).badRequest();

	// Check if specific DM already exist
	const dmId = await ChatManager.dmExist('0', '103891612622390272');
	if(dmId !== false) {
		const chat = ChatManager.getChat(req, dmId);
		return new ApiResponse(res).respond(true, 409, 'This DM already exist', chat);
	}

	const chat = await createChat(req, req.auth.id, participants);
	new ApiResponse(res).success(chat);
});

async function createChat(req: Request, creatorId: string, participantIds: string[]): Promise<Chat> {
	// Verify that participants are actually real users
	const participants = await convertIdsToUsers(req, participantIds);
	if(participants.find((p) => p == null)) {
		throw new Error('Invalid participants list provided');
	}

	// Create chat
	const chatId = snowflakeGenerator.getUniqueID().toString();
	await db.query(sql`
		INSERT INTO chats
			(id, is_group, creator_id, created_at)
		VALUES
			($1, $2, $3, $4)
	`, [
		chatId,
		participantIds.length > 2,
		creatorId,
		DateFns.getUnixTime(new Date())
	]);

	for await(const part of participants) {
		await ChatManager.addUserToChat(part.id, chatId);
	}

	return ChatManager.getChat(req, chatId);
}

async function convertIdsToUsers(req: Request, ids: string[]): Promise<(User | null)[]> {
	return Promise.all(ids.map((id) => UserManager.getUserById(req, id)));
}

export default router;
