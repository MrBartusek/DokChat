import * as express from 'express';
import { MessageListResponse, UserLoginResponse } from '../../../types/endpoints';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import Utils from '../../utils';

const router = express.Router();

router.all('/messages', allowedMethods('GET'), ensureAuthenticated(), async (req, res, next) => {
	// Check request
	const page = req.query.page || 0;
	const conversationId = req.query.chat;
	if(typeof conversationId != 'string') {
		return new ApiResponse(res).badRequest('Missing conversationId');
	}

	// Check chat access
	const permissionsQuery = await db.query(sql`
        SELECT EXISTS(SELECT 1 FROM participants WHERE user_id = $1 AND conversation_id=$2)
    `, [req.auth.id, conversationId]);
	if(permissionsQuery.rows[0].exists !== true) {
		return new ApiResponse(res).forbidden();
	}

	const query = await db.query(sql`
        SELECT
            id
            content,
            author_id,
            created_at
        FROM
            messages
        WHERE
            conversation_id = $1
        ORDER BY 
            created_at DESC
        LIMIT 25 OFFSET $2;
    `, [req.auth.id, page]);
	const messages = query.rows.map((row) => {
		return {
			id: row.id,
			author: row.author_id,
			content: row.content,
			timestamp: row.created_at,
			avatar: Utils.avatarUrl(req, row.author_id)
		};
	});
	const result: MessageListResponse = messages;
	new ApiResponse(res).success(result);
});

export default router;
