import * as express from 'express';
import startRoute from './start';
import confirmRoute from './confirm';

const router = express.Router();

router.use(startRoute);
router.use(confirmRoute);

export default router;
