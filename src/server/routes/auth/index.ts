import * as express from 'express';
import { ApiResponse } from '../../apiResponse';
import loginRoute from './login';
import registerRoute from './register';

const router = express.Router();

router.use(loginRoute);
router.use(registerRoute);

export default router;
