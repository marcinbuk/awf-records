import { Router } from 'express';
import * as recordCtrl from '../controllers/record.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, recordCtrl.getCurrent);
router.get('/pending', authenticate, authorize('ADMIN', 'MODERATOR'), recordCtrl.getPending);
router.put('/:id/verify', authenticate, authorize('ADMIN', 'MODERATOR'), recordCtrl.verify);
router.get('/timeline/:disciplineId', optionalAuth, recordCtrl.getTimeline);

export default router;
