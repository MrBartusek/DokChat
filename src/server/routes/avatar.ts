import * as express from 'express';
import allowedMethods from '../middlewares/allowedMethods';
import { ApiResponse } from '../apiResponse';
import * as path from 'path';

const router = express.Router();

router.all('/', allowedMethods('GET'), async (req, res, next) => {
	const id = req.query.id;
	if(typeof id != 'string') {
		new ApiResponse(res).badRequest();
	}
	res.header('Cache-Control', 'private max-age=3600');
	res.sendFile(path.join(__dirname, `../public/img/avatars/${randomRange(0,4)}.png`));
});

function randomRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export default router;
