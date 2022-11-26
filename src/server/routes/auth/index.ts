import * as express from 'express';
import emailConfirmRouter from './email-confirm/index';
import loginRoute from './login';
import logoutRouter from './logout';
import passwordResetRouter from './password-reset/index';
import refreshRouter from './refresh';
import registerRoute from './register';

const router = express.Router();

router.use(loginRoute);
router.use(registerRoute);
router.use(refreshRouter);
router.use(logoutRouter);
router.use('/password-reset', passwordResetRouter);
router.use('/email-confirm', emailConfirmRouter);

export default router;
