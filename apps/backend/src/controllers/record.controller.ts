import { Request, Response, NextFunction } from 'express';
import { verifyRecordSchema } from '@awf/shared';
import * as recordService from '../services/record.service';
import { createAuditLog } from '../services/audit.service';

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await recordService.getCurrentRecords({
            disciplineId: req.query.disciplineId as string, category: req.query.category as string,
            gender: req.query.gender as string, recordType: req.query.recordType as string,
            status: req.query.status as string,
            page: parseInt(req.query.page as string) || 1, limit: parseInt(req.query.limit as string) || 50,
        });
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
}

export async function getPending(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await recordService.getPendingRecords();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
    try {
        const { status, comment } = verifyRecordSchema.parse(req.body);
        const data = await recordService.verifyRecord(req.params.id, status, req.user!.userId, comment);
        await createAuditLog({ userId: req.user!.userId, action: `RECORD_${status}`, entityType: 'Record', entityId: req.params.id, newValues: { status, comment } });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await recordService.getRecordTimeline(req.params.disciplineId, req.query.gender as string, req.query.recordType as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}
