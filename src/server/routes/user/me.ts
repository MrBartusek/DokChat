import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import UserManager from '../../managers/userManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import ensureRatelimit from '../../middlewares/ensureRatelimit';

const router = express.Router();

router.all('/me', ensureAuthenticated(), allowedMethods('GET'), ensureRatelimit(), async (req, res) => {
	const user = await UserManager.getUserById(req.auth.id);
	if (!user) new ApiResponse(res).notFound('User not found');
	return new ApiResponse(res).success(user);
});

export default router;
