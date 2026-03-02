import { Router } from 'express';
import * as resultCtrl from '../controllers/result.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, resultCtrl.getAll);
router.get('/:id', optionalAuth, resultCtrl.getById);
router.post('/', authenticate, authorize('ADMIN', 'MODERATOR', 'ATHLETE'), resultCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MODERATOR'), resultCtrl.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'MODERATOR'), resultCtrl.remove);
router.get('/user/:userId/personal-bests', optionalAuth, resultCtrl.getPersonalBests);

export default router;
