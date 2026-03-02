import { Request, Response, NextFunction } from 'express';
import { updateUserSchema, adminUpdateUserSchema, quickHistoricalEntrySchema } from '@awf/shared';
import * as userService from '../services/user.service';
import * as resultService from '../services/result.service';
import { createAuditLog } from '../services/audit.service';
import { formatResultValue } from '../utils/formatResult';
import prisma from '../utils/prisma';

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await userService.getUsers({
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
            search: req.query.search as string, role: req.query.role as string,
            userStatus: req.query.userStatus as string, faculty: req.query.faculty as string,
            gender: req.query.gender as string, isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
            sortBy: req.query.sortBy as string, sortOrder: req.query.sortOrder as 'asc' | 'desc',
        });
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await userService.getUserById(req.params.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const isAdmin = req.user!.role === 'ADMIN';
        const schema = isAdmin ? adminUpdateUserSchema : updateUserSchema;
        const input = schema.parse(req.body);
        const targetId = isAdmin ? req.params.id : req.user!.userId;
        const data = await userService.updateUser(targetId, input);
        await createAuditLog({ userId: req.user!.userId, action: 'UPDATE_USER', entityType: 'User', entityId: targetId, newValues: input });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.deleteUser(req.params.id);
        await createAuditLog({ userId: req.user!.userId, action: 'DEACTIVATE_USER', entityType: 'User', entityId: req.params.id });
        res.json({ success: true, message: 'Użytkownik dezaktywowany' });
    } catch (error) { next(error); }
}

export async function getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await userService.getUserStatistics(req.params.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function quickHistoricalEntry(req: Request, res: Response, next: NextFunction) {
    try {
        const input = quickHistoricalEntrySchema.parse(req.body);
        const athlete = await userService.findOrCreateAthleteForHistorical({
            firstName: input.firstName, lastName: input.lastName, gender: input.gender,
            studentId: input.studentId, faculty: input.faculty,
            userStatus: input.userStatus, graduationYear: input.graduationYear,
        });

        const discipline = await prisma.sportDiscipline.findUnique({ where: { id: input.disciplineId } });
        if (!discipline) { res.status(404).json({ success: false, message: 'Dyscyplina nie znaleziona' }); return; }

        const displayValue = input.displayValue || formatResultValue(input.value, discipline.measurementUnit, discipline.customUnitLabel);

        const resultData = {
            userId: athlete.id, disciplineId: input.disciplineId, value: input.value,
            displayValue, date: input.date, location: input.location,
            competition: input.competition, notes: input.notes, source: 'HISTORICAL' as const,
        };

        const result = await resultService.createResult(resultData, req.user!.userId);
        await createAuditLog({ userId: req.user!.userId, action: 'HISTORICAL_ENTRY', entityType: 'Result', entityId: result.result.id, newValues: input });
        res.status(201).json({ success: true, data: { athlete, ...result } });
    } catch (error) { next(error); }
}
