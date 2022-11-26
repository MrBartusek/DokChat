import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import allowedMethods from '../../middlewares/allowedMethods';

const router = express.Router();

router.all('/logout', allowedMethods('POST'), async (req, res, next) => {
	res.clearCookie('token');
	res.clearCookie('refreshToken');
	new ApiResponse(res).success();
});

export default router;
