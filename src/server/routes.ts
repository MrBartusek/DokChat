import * as express from 'express';
import { ApiResponse } from './apiResponse';
import attachmentRoutes from './routes/attachment';
import authRoutes from './routes/auth';
import avatarRoutes from './routes/avatar';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import inviteInfoRoutes from './routes/inviteInfo';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/avatar', avatarRoutes);
router.use('/user', userRoutes);
router.use('/attachment', attachmentRoutes);
router.use('/invite-info', inviteInfoRoutes);

router.all('*', (req, res, next) => {
	new ApiResponse(res).notFound();
});

export default router;
