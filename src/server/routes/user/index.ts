import * as express from 'express';
import deleteRouter from './delete';
import getRoute from './get';
import meRoute from './me';
import updateProfileRouter from './update-profile';
import blockRouter from './block';
import changePasswordRouter from './change-password';

const router = express.Router();

router.use(getRoute);
router.use(meRoute);
router.use(updateProfileRouter);
router.use(deleteRouter);
router.use(blockRouter);
router.use(changePasswordRouter);

export default router;
