import * as express from 'express';
import emailConfirmRouter from './email-confirm/index';
import loginRoute from './login';
import logoutRouter from './logout';
import passwordResetRouter from './password-reset/index';
import refreshRouter from './refresh';
import registerRouter from './register';
import socialLoginRouter from './social-login';

const router = express.Router();

router.use(loginRoute);
router.use(registerRouter);
router.use(refreshRouter);
router.use(logoutRouter);
router.use('/password-reset', passwordResetRouter);
router.use('/email-confirm', emailConfirmRouter);
router.use('/social-login', socialLoginRouter);

export default router;
