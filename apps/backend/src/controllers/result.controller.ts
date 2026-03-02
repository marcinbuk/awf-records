import { Request, Response, NextFunction } from 'express';
import { createResultSchema, updateResultSchema } from '@awf/shared';
import * as resultService from '../services/result.service';
import { createAuditLog } from '../services/audit.service';

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await resultService.getResults({
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
            userId: req.query.userId as string, disciplineId: req.query.disciplineId as string,
            category: req.query.category as string, gender: req.query.gender as string,
            source: req.query.source as string, isOfficial: req.query.isOfficial === 'true' ? true : req.query.isOfficial === 'false' ? false : undefined,
            startDate: req.query.startDate as string, endDate: req.query.endDate as string,
            search: req.query.search as string, sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        });
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await resultService.getResultById(req.params.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const input = createResultSchema.parse(req.body);
        const data = await resultService.createResult(input, req.user!.userId);
        await createAuditLog({ userId: req.user!.userId, action: 'CREATE_RESULT', entityType: 'Result', entityId: data.result.id, newValues: input });
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const input = updateResultSchema.parse(req.body);
        const data = await resultService.updateResult(req.params.id, input);
        await createAuditLog({ userId: req.user!.userId, action: 'UPDATE_RESULT', entityType: 'Result', entityId: req.params.id, newValues: input });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await resultService.deleteResult(req.params.id);
        await createAuditLog({ userId: req.user!.userId, action: 'DELETE_RESULT', entityType: 'Result', entityId: req.params.id });
        res.json({ success: true, message: 'Wynik usunięty' });
    } catch (error) { next(error); }
}

export async function getPersonalBests(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await resultService.getPersonalBests(req.params.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}
