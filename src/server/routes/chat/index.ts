import * as express from 'express';
import listRouter from './list';
import messagesRouter from './messages';
import createRouter from './create';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);

export default router;
