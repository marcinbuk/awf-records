import { Router } from 'express';
import * as recordCtrl from '../controllers/record.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, recordCtrl.getCurrent);
router.get('/top', optionalAuth, recordCtrl.getTop);
router.get('/pending', authenticate, authorize('ADMIN', 'MODERATOR'), recordCtrl.getPending);
router.put('/:id/verify', authenticate, authorize('ADMIN', 'MODERATOR'), recordCtrl.verify);
router.get('/timeline/:disciplineId', optionalAuth, recordCtrl.getTimeline);
router.get('/:id', optionalAuth, recordCtrl.getById);

export default router;

