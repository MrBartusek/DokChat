import * as express from 'express';
import listRouter from './list';

const router = express.Router();

router.use(listRouter);

export default router;
