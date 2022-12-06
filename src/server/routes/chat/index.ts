import * as express from 'express';
import createRouter from './create';
import listRouter from './list';
import messagesRouter from './messages';
import participantsRouter from './participants';
import hideRouter from './hide';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);
router.use(participantsRouter);
router.use(hideRouter);

export default router;
