import * as express from 'express';
import createRouter from './create';
import leaveRouter from './hide';
import hideRouter from './leave';
import listRouter from './list';
import messagesRouter from './messages';
import participantsRouter from './participants';
import updateRouter from './update';
import modifyParticipantsRouter from './modifyParticipants';

const router = express.Router();

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);
router.use(participantsRouter);
router.use(hideRouter);
router.use(leaveRouter);
router.use(leaveRouter);
router.use(updateRouter);
router.use(modifyParticipantsRouter);

export default router;
