import { Router } from 'express';
import * as disciplineCtrl from '../controllers/discipline.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, disciplineCtrl.getAll);
router.get('/:id', optionalAuth, disciplineCtrl.getById);
router.post('/', authenticate, authorize('ADMIN', 'MODERATOR'), disciplineCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MODERATOR'), disciplineCtrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), disciplineCtrl.remove);

export default router;
