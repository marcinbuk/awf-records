import { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema, changePasswordSchema } from '@awf/shared';
import * as authService from '../services/auth.service';
import { createAuditLog } from '../services/audit.service';

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);
        const result = await authService.registerUser(data);
        await createAuditLog({ userId: result.user.id, action: 'REGISTER', entityType: 'User', entityId: result.user.id, ipAddress: req.ip });
        res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const result = await authService.loginUser(email, password);
        await createAuditLog({ userId: result.user.id, action: 'LOGIN', entityType: 'User', entityId: result.user.id, ipAddress: req.ip });
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) { res.status(400).json({ success: false, message: 'Token odświeżania jest wymagany' }); return; }
        const result = await authService.refreshTokens(refreshToken);
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await authService.getMe(req.user!.userId);
        res.json({ success: true, data: user });
    } catch (error) { next(error); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const data = changePasswordSchema.parse(req.body);
        await authService.changePassword(req.user!.userId, data.currentPassword, data.newPassword);
        res.json({ success: true, message: 'Hasło zostało zmienione' });
    } catch (error) { next(error); }
}
