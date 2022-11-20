import * as express from 'express';
import { query, validationResult } from 'express-validator';
import { ApiResponse } from '../apiResponse';
import allowedMethods from '../middlewares/allowedMethods';
import * as path from 'path';

const router = express.Router();

router.all('/', query('id').isString(), allowedMethods('GET'), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);
	const id = req.query.id as string;

	res.sendFile(defaultAvatar(Number(id) % 5));
});

function defaultAvatar(id: number): string {
	return path.join(__dirname, `../public/img/avatars/${id}.png`);
}

export default router;
