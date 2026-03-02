import { Router } from 'express';
import * as gamesCtrl from '../controllers/games.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, gamesCtrl.getEditions);
router.get('/:id', optionalAuth, gamesCtrl.getEditionById);
router.post('/', authenticate, authorize('ADMIN'), gamesCtrl.createEdition);
router.put('/:id/status', authenticate, authorize('ADMIN'), gamesCtrl.updateStatus);

router.post('/:id/join', authenticate, gamesCtrl.joinEdition);
router.post('/results', authenticate, gamesCtrl.submitResult);
router.get('/:id/leaderboard', optionalAuth, gamesCtrl.getLeaderboard);
router.put('/results/:resultId/verify', authenticate, authorize('ADMIN', 'MODERATOR'), gamesCtrl.verifyResult);

export default router;
