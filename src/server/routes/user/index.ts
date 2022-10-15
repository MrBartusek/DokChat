import * as express from 'express';
import getRoute from './get';
import meRoute from './me';

const router = express.Router();

router.use(getRoute);
router.use(meRoute);

export default router;
