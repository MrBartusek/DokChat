import * as express from 'express';
import startRoute from './start';
import updateRoute from './update';

const router = express.Router();

router.use(startRoute);
router.use(updateRoute);

export default router;
