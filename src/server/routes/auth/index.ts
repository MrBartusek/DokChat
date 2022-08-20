import * as express from 'express';
import loginRoute from './login';
import registerRoute from './register';
import refreshRouter from './refresh';

const router = express.Router();

router.use(loginRoute);
router.use(registerRoute);
router.use(refreshRouter);

export default router;
