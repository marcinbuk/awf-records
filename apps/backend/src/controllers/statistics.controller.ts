import { Request, Response, NextFunction } from 'express';
import * as statisticsService from '../services/statistics.service';
import { getAuditLogs } from '../services/audit.service';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await statisticsService.getDashboardStats();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getDisciplineStats(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await statisticsService.getDisciplineStatistics(req.params.disciplineId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function compareAthletes(req: Request, res: Response, next: NextFunction) {
    try {
        const ids = (req.query.ids as string)?.split(',') || [];
        if (ids.length < 2) { res.status(400).json({ success: false, message: 'Minimum 2 zawodników do porównania' }); return; }
        const data = await statisticsService.getCompareAthletes(ids, req.query.disciplineId as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getFacultyRanking(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await statisticsService.getFacultyRanking();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await getAuditLogs({
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 50,
            userId: req.query.userId as string, entityType: req.query.entityType as string,
            action: req.query.action as string,
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        });
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
}

export async function getAthleteRanking(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await statisticsService.getAthleteRanking();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}
