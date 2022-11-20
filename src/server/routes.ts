import * as express from 'express';
import { ApiResponse } from './apiResponse';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import avatarRoutes from './routes/avatar';
import userRoutes from './routes/user';
import attachmentRoutes from './routes/attachment';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/avatar', avatarRoutes);
router.use('/user', userRoutes);
router.use('/attachment', attachmentRoutes);

router.all('*', (req, res, next) => {
	new ApiResponse(res).notFound();
});

export default router;
