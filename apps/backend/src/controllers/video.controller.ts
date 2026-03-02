import { Request, Response, NextFunction } from 'express';
import { reviewVideoSchema } from '@awf/shared';
import * as videoService from '../services/video.service';
import { createAuditLog } from '../services/audit.service';
import { config } from '../config';

export async function upload(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.file) { res.status(400).json({ success: false, message: 'Plik video jest wymagany' }); return; }
        const { resultId } = req.body;
        if (!resultId) { res.status(400).json({ success: false, message: 'ID wyniku jest wymagane' }); return; }

        const data = await videoService.createVideoVerification({
            resultId, videoUrl: `/uploads/videos/${req.file.filename}`,
            fileName: req.file.originalname, fileSize: req.file.size,
            mimeType: req.file.mimetype, uploadedById: req.user!.userId,
        });
        await createAuditLog({ userId: req.user!.userId, action: 'UPLOAD_VIDEO', entityType: 'VideoVerification', entityId: data.id });
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await videoService.getVideos({
            resultId: req.query.resultId as string, status: req.query.status as string,
            page: parseInt(req.query.page as string) || 1, limit: parseInt(req.query.limit as string) || 20,
        });
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await videoService.getVideoById(req.params.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function review(req: Request, res: Response, next: NextFunction) {
    try {
        const { status, comment } = reviewVideoSchema.parse(req.body);
        const data = await videoService.reviewVideo(req.params.id, status, req.user!.userId, comment);
        await createAuditLog({ userId: req.user!.userId, action: `VIDEO_${status}`, entityType: 'VideoVerification', entityId: req.params.id });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await videoService.deleteVideo(req.params.id);
        await createAuditLog({ userId: req.user!.userId, action: 'DELETE_VIDEO', entityType: 'VideoVerification', entityId: req.params.id });
        res.json({ success: true, message: 'Wideo usunięte' });
    } catch (error) { next(error); }
}
