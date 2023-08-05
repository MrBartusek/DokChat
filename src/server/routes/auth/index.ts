import * as express from 'express';
import emailConfirmRouter from './email-confirm/index';
import loginRoute from './login';
import logoutRouter from './logout';
import passwordResetRouter from './password-reset/index';
import refreshRouter from './refresh';
import registerRouter from './register';
import socialLoginRouter from './social-login';
import demoRouter from './demo';
import desktopLoginRouter from './dekstop-login';

const router = express.Router();

router.use(loginRoute);
router.use(demoRouter);
router.use(registerRouter);
router.use(refreshRouter);
router.use(logoutRouter);
router.use(desktopLoginRouter);
router.use('/password-reset', passwordResetRouter);
router.use('/email-confirm', emailConfirmRouter);
router.use('/social-login', socialLoginRouter);

export default router;
