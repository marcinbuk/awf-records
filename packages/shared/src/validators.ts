import { z } from 'zod';
import {
    UserRole, UserStatus, Gender, DisciplineCategory,
    MeasurementUnit, RecordDirection, ResultSource,
    RecordType, RecordStatus, VideoStatus,
    GameEditionStatus, PointFormulaType,
} from './types';

// ==================== AUTH ====================

export const loginSchema = z.object({
    email: z.string().email('Nieprawidłowy adres email'),
    password: z.string().min(6, 'Hasło musi mieć min. 6 znaków'),
});

export const registerSchema = z.object({
    email: z.string().email('Nieprawidłowy adres email'),
    password: z.string()
        .min(8, 'Hasło musi mieć min. 8 znaków')
        .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
        .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
        .regex(/[!@#$%^&*]/, 'Hasło musi zawierać znak specjalny'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'Imię musi mieć min. 2 znaki'),
    lastName: z.string().min(2, 'Nazwisko musi mieć min. 2 znaki'),
    gender: z.nativeEnum(Gender),
    dateOfBirth: z.string().optional(),
    studentId: z.string().optional(),
    faculty: z.string().optional(),
    specialization: z.string().optional(),
    yearOfStudy: z.number().int().min(1).max(7).optional(),
    userStatus: z.nativeEnum(UserStatus).default(UserStatus.STUDENT),
    graduationYear: z.number().int().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Hasła muszą się zgadzać',
    path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Aktualne hasło jest wymagane'),
    newPassword: z.string()
        .min(8, 'Hasło musi mieć min. 8 znaków')
        .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
        .regex(/[0-9]/, 'Hasło musi zawierać cyfrę'),
    confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Hasła muszą się zgadzać',
    path: ['confirmNewPassword'],
});

// ==================== DISCIPLINES ====================

export const createDisciplineSchema = z.object({
    name: z.string().min(2, 'Nazwa musi mieć min. 2 znaki'),
    category: z.nativeEnum(DisciplineCategory),
    measurementUnit: z.nativeEnum(MeasurementUnit),
    recordDirection: z.nativeEnum(RecordDirection),
    description: z.string().optional(),
    customUnitLabel: z.string().optional(),
    isActive: z.boolean().default(true),
    defaultPointsFormula: z.object({
        formulaType: z.nativeEnum(PointFormulaType),
        basePoints: z.number().optional(),
        referenceValue: z.number().optional(),
        multiplier: z.number().optional(),
        maxPoints: z.number().optional(),
        table: z.array(z.object({
            min: z.number(),
            max: z.number(),
            points: z.number(),
        })).optional(),
    }).optional(),
});

export const updateDisciplineSchema = createDisciplineSchema.partial();

// ==================== RESULTS ====================

export const createResultSchema = z.object({
    userId: z.string().uuid('Nieprawidłowy ID zawodnika'),
    disciplineId: z.string().uuid('Nieprawidłowy ID dyscypliny'),
    value: z.number().positive('Wartość musi być dodatnia'),
    displayValue: z.string().optional(),
    date: z.string(),
    location: z.string().optional(),
    competition: z.string().optional(),
    isOfficial: z.boolean().default(false),
    notes: z.string().optional(),
    source: z.nativeEnum(ResultSource).default(ResultSource.MANUAL_ENTRY),
});

export const updateResultSchema = createResultSchema.partial();

export const importResultSchema = z.object({
    results: z.array(z.object({
        firstName: z.string(),
        lastName: z.string(),
        disciplineName: z.string(),
        value: z.number(),
        date: z.string(),
        location: z.string().optional(),
        competition: z.string().optional(),
        gender: z.nativeEnum(Gender).optional(),
        notes: z.string().optional(),
    })),
});

// ==================== RECORDS ====================

export const verifyRecordSchema = z.object({
    status: z.enum([RecordStatus.VERIFIED, RecordStatus.REJECTED]),
    comment: z.string().optional(),
});

// ==================== VIDEOS ====================

export const reviewVideoSchema = z.object({
    status: z.enum([VideoStatus.VERIFIED, VideoStatus.REJECTED]),
    comment: z.string().optional(),
});

// ==================== OVERALL GAMES ====================

export const createGameEditionSchema = z.object({
    name: z.string().min(3, 'Nazwa musi mieć min. 3 znaki'),
    description: z.string().optional(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
    startDate: z.string(),
    endDate: z.string(),
    maxParticipants: z.number().int().positive().optional(),
    isOpenForAlumni: z.boolean().default(true),
    disciplines: z.array(z.object({
        disciplineId: z.string().uuid(),
        pointsConfig: z.object({
            formulaType: z.nativeEnum(PointFormulaType),
            basePoints: z.number().optional(),
            referenceValue: z.number().optional(),
            multiplier: z.number().optional(),
            maxPoints: z.number().default(100),
            table: z.array(z.object({
                min: z.number(),
                max: z.number(),
                points: z.number(),
            })).optional(),
        }),
        order: z.number().int(),
        isRequired: z.boolean().default(false),
    })).min(1, 'Wymagana min. 1 dyscyplina'),
});

export const submitGameResultSchema = z.object({
    editionId: z.string().uuid(),
    gameDisciplineId: z.string().uuid(),
    value: z.number().positive(),
    displayValue: z.string().optional(),
    notes: z.string().optional(),
});

// ==================== USERS ====================

export const updateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    faculty: z.string().optional(),
    specialization: z.string().optional(),
    yearOfStudy: z.number().int().min(1).max(7).optional(),
    userStatus: z.nativeEnum(UserStatus).optional(),
    graduationYear: z.number().int().optional(),
    gender: z.nativeEnum(Gender).optional(),
    dateOfBirth: z.string().optional(),
    profilePhoto: z.string().optional(),
});

export const adminUpdateUserSchema = updateUserSchema.extend({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
});

// ==================== QUICK HISTORICAL ENTRY ====================

export const quickHistoricalEntrySchema = z.object({
    firstName: z.string().min(1, 'Imię jest wymagane'),
    lastName: z.string().min(1, 'Nazwisko jest wymagane'),
    gender: z.nativeEnum(Gender),
    disciplineId: z.string().uuid(),
    value: z.number().positive(),
    displayValue: z.string().optional(),
    date: z.string(),
    location: z.string().optional(),
    competition: z.string().optional(),
    notes: z.string().optional(),
    studentId: z.string().optional(),
    faculty: z.string().optional(),
    userStatus: z.nativeEnum(UserStatus).default(UserStatus.ALUMNI),
    graduationYear: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type CreateResultInput = z.infer<typeof createResultSchema>;
export type CreateGameEditionInput = z.infer<typeof createGameEditionSchema>;
export type SubmitGameResultInput = z.infer<typeof submitGameResultSchema>;
export type QuickHistoricalEntryInput = z.infer<typeof quickHistoricalEntrySchema>;
