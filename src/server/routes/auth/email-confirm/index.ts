import * as express from 'express';
import confirmRoute from './confirm';
import startRoute from './start';

const router = express.Router();

router.use(startRoute);
router.use(confirmRoute);

export default router;
