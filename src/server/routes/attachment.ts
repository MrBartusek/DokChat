import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { ApiResponse } from '../apiResponse';
import allowedMethods from '../middlewares/allowedMethods';
import sql from 'sql-template-strings';
import db from '../db';
import s3Client from '../aws/s3';

const router = express.Router();

router.all('/', query('id').isString(), allowedMethods('GET'), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);
	const id = req.query.id as string;

	const query = await db.query(sql`
		SELECT attachment FROM messages WHERE id = $1 LIMIT 1;
	`, [ id ]);
	if(query.rowCount == 0) return new ApiResponse(res).notFound('Message does not exist');
	const attachment = query.rows[0].attachment;
	if(!attachment) return new ApiResponse(res).badRequest('This message doesn\'t have an attachment');
	const url = await s3Client.getSingedUrl(attachment);
	res.redirect(301, url);
});

export default router;