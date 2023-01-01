import * as express from 'express';
import createRouter from './create';
import leaveRouter from './hide';
import hideRouter from './leave';
import listRouter from './list';
import messagesRouter from './messages';
import participantsRouter from './participants';
import updateRouter from './update';
import modifyParticipantsRouter from './modifyParticipants';
import inviteRouter from './invite';
import joinRouter from './join';

const router = express.Router();1;

router.use(listRouter);
router.use(messagesRouter);
router.use(createRouter);
router.use(participantsRouter);
router.use(hideRouter);
router.use(leaveRouter);
router.use(leaveRouter);
router.use(updateRouter);
router.use(modifyParticipantsRouter);
router.use(inviteRouter);
router.use(joinRouter);

export default router;
