import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Brak tokenu autoryzacji' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const payload = verifyAccessToken(token);
        req.user = { userId: payload.userId, email: payload.email, role: payload.role as UserRole };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Nieprawidłowy lub wygasły token' });
    }
}

export function authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Nie zalogowano' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Brak uprawnień do wykonania tej operacji' });
            return;
        }
        next();
    };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const payload = verifyAccessToken(token);
            req.user = { userId: payload.userId, email: payload.email, role: payload.role as UserRole };
        } catch { /* continue without auth */ }
    }
    next();
}
