import * as express from 'express';
import loginRoute from './login';
import registerRoute from './register';
import refreshRouter from './refresh';
import logoutRouter from './logout';
import passwordResetRouter from './password-reset/index';

const router = express.Router();

router.use(loginRoute);
router.use(registerRoute);
router.use(refreshRouter);
router.use(logoutRouter);
router.use('/password-reset', passwordResetRouter);

export default router;
