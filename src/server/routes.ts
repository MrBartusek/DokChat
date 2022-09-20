import * as express from 'express';
import { ApiResponse } from './apiResponse';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import avatarRoutes from './routes/avatar';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/avatar', avatarRoutes);

router.all('*', (req, res, next) => {
	new ApiResponse(res).notFound();
});

export default router;
