import { Router } from 'express';
import * as userCtrl from '../controllers/user.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, userCtrl.getAll);
router.get('/:id', authenticate, userCtrl.getById);
router.put('/profile', authenticate, userCtrl.update);
router.put('/:id', authenticate, authorize('ADMIN'), userCtrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), userCtrl.remove);
router.get('/:id/statistics', optionalAuth, userCtrl.getStatistics);
router.post('/historical-entry', authenticate, authorize('ADMIN', 'MODERATOR'), userCtrl.quickHistoricalEntry);

export default router;
