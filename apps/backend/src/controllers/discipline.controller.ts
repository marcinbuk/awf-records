import { Request, Response, NextFunction } from 'express';
import { createDisciplineSchema, updateDisciplineSchema } from '@awf/shared';
import * as disciplineService from '../services/discipline.service';
import { createAuditLog } from '../services/audit.service';

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const { category, isActive, search } = req.query;
        const data = await disciplineService.getAllDisciplines({
            category: category as string, isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined, search: search as string,
        });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await disciplineService.getDisciplineById(req.params.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const input = createDisciplineSchema.parse(req.body);
        const data = await disciplineService.createDiscipline(input);
        await createAuditLog({ userId: req.user!.userId, action: 'CREATE_DISCIPLINE', entityType: 'SportDiscipline', entityId: data.id, newValues: input });
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const input = updateDisciplineSchema.parse(req.body);
        const data = await disciplineService.updateDiscipline(req.params.id, input);
        await createAuditLog({ userId: req.user!.userId, action: 'UPDATE_DISCIPLINE', entityType: 'SportDiscipline', entityId: req.params.id, newValues: input });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await disciplineService.deleteDiscipline(req.params.id);
        await createAuditLog({ userId: req.user!.userId, action: 'DELETE_DISCIPLINE', entityType: 'SportDiscipline', entityId: req.params.id });
        res.json({ success: true, message: 'Dyscyplina usunięta' });
    } catch (error) { next(error); }
}
