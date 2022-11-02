import * as express from 'express';
import loginRoute from './login';
import registerRoute from './register';
import refreshRouter from './refresh';
import logoutRouter from './logout';

const router = express.Router();

router.use(loginRoute);
router.use(registerRoute);
router.use(refreshRouter);
router.use(logoutRouter);

export default router;
