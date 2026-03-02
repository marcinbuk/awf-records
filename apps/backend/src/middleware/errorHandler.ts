import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path, method: req.method });

    if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
            const path = e.path.join('.');
            if (!errors[path]) errors[path] = [];
            errors[path].push(e.message);
        });
        res.status(400).json({ success: false, message: 'Błąd walidacji danych', errors });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                res.status(409).json({ success: false, message: 'Rekord z takimi danymi już istnieje' });
                return;
            case 'P2025':
                res.status(404).json({ success: false, message: 'Nie znaleziono rekordu' });
                return;
            default:
                res.status(400).json({ success: false, message: 'Błąd bazy danych' });
                return;
        }
    }

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Wewnętrzny błąd serwera',
    });
}
