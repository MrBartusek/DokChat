import * as express from 'express';
import { body, validationResult } from 'express-validator';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAdministrator from '../../middlewares/ensureAdministrator';
import { ApiResponse } from '../../apiResponse';
import db from '../../db';
import sql from 'sql-template-strings';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/ban',
	allowedMethods('POST'),
	ensureAuthenticated(),
	ensureAdministrator(),
	body('targetId').isString(),
	body('status').isBoolean(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const targetId = req.body.targetId;
		const status = req.body.status;

		await db.query(sql`
			UPDATE users SET is_banned = $1 WHERE id = $2
		`, [ status, targetId ]);

		new ApiResponse(res).success({ targetId });
	});

export default router;
