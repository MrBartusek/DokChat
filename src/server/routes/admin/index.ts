import * as express from 'express';
import banRoute from './ban';
const router = express.Router();

router.use(banRoute);

export default router;
