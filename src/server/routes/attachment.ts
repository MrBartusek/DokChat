import * as express from 'express';
import { query, validationResult } from 'express-validator';
import sql from 'sql-template-strings';
import { ApiResponse } from '../apiResponse';
import s3Client from '../aws/s3';
import db from '../db';
import allowedMethods from '../middlewares/allowedMethods';

const router = express.Router();

router.all('/', query('id').isString(), allowedMethods('GET'), async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);
	const id = req.query.id as string;

	const query = await db.query(sql`
		SELECT attachment FROM messages WHERE id = $1 LIMIT 1;
	`, [ id ]);
	if (query.rowCount == 0) {
		return new ApiResponse(res).notFound('Message does not exist');
	}

	const attachment = query.rows[0].attachment;
	if (!attachment) {
		return new ApiResponse(res).badRequest('This message doesn\'t have an attachment');
	}

	const avatarBuffer = await s3Client.fetchBuffer(attachment);

	res.header('Cache-Control', 'public, max-age=86400');
	res.set('Content-Type', 'image/png');
	res.send(avatarBuffer);
});

export default router;
