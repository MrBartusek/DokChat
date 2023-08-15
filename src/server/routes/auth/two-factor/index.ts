import * as express from 'express';
import getCodeRoute from './get-code';
import enableRoute from './enable';
import disableRoute from './disable';

const router = express.Router();

router.use(getCodeRoute);
router.use(enableRoute);
router.use(disableRoute);

export default router;
