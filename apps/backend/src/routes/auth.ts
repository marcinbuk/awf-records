import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, authCtrl.register);
router.post('/login', authLimiter, authCtrl.login);
router.post('/refresh', authCtrl.refreshToken);
router.get('/me', authenticate, authCtrl.getMe);
router.post('/change-password', authenticate, authCtrl.changePassword);

export default router;
