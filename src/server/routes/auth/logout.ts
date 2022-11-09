import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import allowedMethods from '../../middlewares/allowedMethods';
import AuthManager from '../../managers/authManager';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';

const router = express.Router();

router.all('/logout', ensureAuthenticated(true), allowedMethods('POST'), async (req, res, next) => {
	res.clearCookie('token');
	res.clearCookie('refreshToken');
	new ApiResponse(res).success();
});

export default router;
