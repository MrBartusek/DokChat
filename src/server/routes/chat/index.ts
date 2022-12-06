import * as express from 'express';
import createRouter from './create';
import listRouter from './list';
import messagesRouter from './messages';
import participantsRouter from './participants';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);
router.use(participantsRouter);

export default router;
