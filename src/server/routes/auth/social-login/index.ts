import * as express from 'express';
import facebookRoute from './facebook';
import googleRoute from './google';

const router = express.Router();

router.use(facebookRoute);
router.use(googleRoute);

export default router;
