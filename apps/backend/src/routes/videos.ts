import { Router } from 'express';
import * as videoCtrl from '../controllers/video.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadVideo } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', authenticate, videoCtrl.getAll);
router.get('/:id', authenticate, videoCtrl.getById);
router.post('/', authenticate, uploadLimiter, uploadVideo.single('video'), videoCtrl.upload);
router.put('/:id/review', authenticate, authorize('ADMIN', 'MODERATOR'), videoCtrl.review);
router.delete('/:id', authenticate, authorize('ADMIN'), videoCtrl.remove);

export default router;
