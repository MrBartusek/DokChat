import * as express from 'express';
import getRoute from './get';
import meRoute from './me';
import updateProfileRouter from './update-profile';
import deleteRouter from './delete';

const router = express.Router();

router.use(getRoute);
router.use(meRoute);
router.use(updateProfileRouter);
router.use(deleteRouter);

export default router;
