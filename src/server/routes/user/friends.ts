import * as express from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../../types/common';
import { ApiResponse } from '../../apiResponse';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import db from '../../db';
import sql from 'sql-template-strings';

const router = express.Router();

router.all('/friends',
	ensureAuthenticated(),
	allowedMethods('GET'),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const friends = await queryFriends(req.auth.id);

		return new ApiResponse(res).success(friends);
	});

/**
 * Query list of ids of users which are connected
 * with specified user via param
 * @param as User id to display friends for
 */
async function queryFriends(as: string ): Promise<string[]> {
	const query = await db.query(sql`
		SELECT DISTINCT
			p.user_id as "userId"
		FROM
			participants
		-- Join all other chat participants
		LEFT JOIN
			participants AS p
		ON
			p.chat_id = participants.chat_id
		-- Join user info
		INNER JOIN
			users
		ON
			users.id = p.user_id
		WHERE
			participants.user_id = $1
    `, [ as ]);

	return query.rows.map((row) => row.userId);
}

export default router;
