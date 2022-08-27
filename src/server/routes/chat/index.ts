import * as express from 'express';
import listRouter from './list';
import messagesRouter from './messages';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);

export default router;
