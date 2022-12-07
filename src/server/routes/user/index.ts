import * as express from 'express';
import deleteRouter from './delete';
import getRoute from './get';
import meRoute from './me';
import updateProfileRouter from './update-profile';

const router = express.Router();

router.use(getRoute);
router.use(meRoute);
router.use(updateProfileRouter);
router.use(deleteRouter);

export default router;
