import * as express from 'express';
import createRouter from './create';
import listRouter from './list';
import messagesRouter from './messages';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);

export default router;
