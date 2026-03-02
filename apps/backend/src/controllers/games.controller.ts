import { Request, Response, NextFunction } from 'express';
import { createGameEditionSchema, submitGameResultSchema } from '@awf/shared';
import * as gamesService from '../services/games.service';
import { createAuditLog } from '../services/audit.service';

export async function createEdition(req: Request, res: Response, next: NextFunction) {
    try {
        const input = createGameEditionSchema.parse(req.body);
        const data = await gamesService.createGameEdition(input);
        await createAuditLog({ userId: req.user!.userId, action: 'CREATE_GAME_EDITION', entityType: 'GameEdition', entityId: data.id, newValues: input });
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getEditions(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await gamesService.getGameEditions({
            status: req.query.status as string,
            page: parseInt(req.query.page as string) || 1, limit: parseInt(req.query.limit as string) || 12,
        });
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
}

export async function getEditionById(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await gamesService.getGameEditionById(req.params.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function joinEdition(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await gamesService.joinGameEdition(req.params.id, req.user!.userId);
        res.json({ success: true, data, message: 'Dołączono do igrzysk' });
    } catch (error) { next(error); }
}

export async function submitResult(req: Request, res: Response, next: NextFunction) {
    try {
        const input = submitGameResultSchema.parse(req.body);
        const data = await gamesService.submitGameResult(input, req.user!.userId);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await gamesService.getGameLeaderboard(req.params.id, req.query.gender as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { status } = req.body;
        const data = await gamesService.updateGameEditionStatus(req.params.id, status);
        await createAuditLog({ userId: req.user!.userId, action: 'UPDATE_GAME_STATUS', entityType: 'GameEdition', entityId: req.params.id, newValues: { status } });
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

export async function verifyResult(req: Request, res: Response, next: NextFunction) {
    try {
        const { verified, note } = req.body;
        const data = await gamesService.verifyGameResult(req.params.resultId, verified, note);
        res.json({ success: true, data });
    } catch (error) { next(error); }
}
