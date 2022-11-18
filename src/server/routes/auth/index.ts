import * as express from 'express';
import loginRoute from './login';
import registerRoute from './register';
import refreshRouter from './refresh';
import logoutRouter from './logout';
import passwordResetRouter from './password-reset/index';
import emailConfirmRouter from './email-confirm/index';

const router = express.Router();

router.use(loginRoute);
router.use(registerRoute);
router.use(refreshRouter);
router.use(logoutRouter);
router.use('/password-reset', passwordResetRouter);
router.use('/email-confirm', emailConfirmRouter);

export default router;
