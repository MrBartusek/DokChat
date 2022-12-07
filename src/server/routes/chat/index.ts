import * as express from 'express';
import createRouter from './create';
import leaveRouter from './hide';
import hideRouter from './leave';
import listRouter from './list';
import messagesRouter from './messages';
import participantsRouter from './participants';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);
router.use(participantsRouter);
router.use(hideRouter);
router.use(leaveRouter);

export default router;
