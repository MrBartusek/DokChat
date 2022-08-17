import * as express from 'express';
import authRoutes from './routes/auth';

const router = express.Router();

router.use('/auth', authRoutes);

export default router;
