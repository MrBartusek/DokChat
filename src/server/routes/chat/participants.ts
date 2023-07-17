import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { QueryResult } from 'pg';
import sql from 'sql-template-strings';
import { ChatParticipantsRepose } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import PermissionsManager from '../../managers/permissionsManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import Utils from '../../utils/utils';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/participants',
	allowedMethods('GET'),
	ensureAuthenticated(),
	query('chat').isNumeric(),
	ensureRatelimit(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const chatId = req.query.chat;

		if (!(await PermissionsManager.hasChatAccess(req.auth, chatId))) {
			return new ApiResponse(res).forbidden();
		}

		const participantsQuery = await queryParticipants(chatId);
		const participants: ChatParticipantsRepose = participantsQuery.rows.map((part) => {
			return {
				...part,
				avatar: Utils.avatarUrl(part.userId)
			};
		});
		new ApiResponse(res).success(participants);
	});

type ParticipantsQuery = QueryResult<{
	id: string,
	userId: string,
	username: string,
	tag: string
}>
async function queryParticipants(chatId: string): Promise<ParticipantsQuery> {
	return db.query(sql`
		SELECT
			participants.id,
			participants.user_id as "userId",
			users.username,
			users.tag
		FROM participants
		INNER JOIN users ON participants.user_id = users.id
		WHERE participants.chat_id = $1
		ORDER BY participants.created_at ASC
	`, [chatId]);
}

export default router;
