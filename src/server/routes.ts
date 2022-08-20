import * as express from 'express';
import { ApiResponse } from './apiResponse';
import authRoutes from './routes/auth';

const router = express.Router();

router.use('/auth', authRoutes);

router.all('*', (req, res, next) => {
	new ApiResponse(res).notFound();
});

export default router;
