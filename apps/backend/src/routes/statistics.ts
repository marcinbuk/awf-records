import { Router } from 'express';
import * as statsCtrl from '../controllers/statistics.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/dashboard', optionalAuth, statsCtrl.getDashboard);
router.get('/discipline/:disciplineId', optionalAuth, statsCtrl.getDisciplineStats);
router.get('/compare', optionalAuth, statsCtrl.compareAthletes);
router.get('/faculties', optionalAuth, statsCtrl.getFacultyRanking);
router.get('/athlete-ranking', optionalAuth, statsCtrl.getAthleteRanking);
router.get('/audit-logs', authenticate, authorize('ADMIN'), statsCtrl.getAuditLog);

export default router;
