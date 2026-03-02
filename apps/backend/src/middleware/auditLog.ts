import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth';

export const createAuditLog = (action: string, entityType: string) => {
    return async (req: AuthRequest, _res: Response, next: NextFunction) => {
        const originalJson = _res.json.bind(_res);
        _res.json = (body: unknown) => {
            const result = originalJson(body);
            if (req.user && (body as { success?: boolean })?.success) {
                prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action,
                        entityType,
                        entityId: (req.params.id || req.body?.id || 'unknown') as string,
                        newValues: req.body || undefined,
                        ipAddress: req.ip,
                    },
                }).catch(() => { /* silent - audit log failure should not break request */ });
            }
            return result;
        };
        next();
    };
};
