import * as express from 'express';
import getRoute from './get';
import meRoute from './me';
import updateProfileRouter from './update-profile';

const router = express.Router();

router.use(getRoute);
router.use(meRoute);
router.use(updateProfileRouter);

export default router;
