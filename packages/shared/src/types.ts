// ==================== ENUMS ====================

export enum UserRole {
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
    ATHLETE = 'ATHLETE',
    VIEWER = 'VIEWER',
}

export enum UserStatus {
    STUDENT = 'STUDENT',
    ALUMNI = 'ALUMNI',
    STAFF = 'STAFF',
    EXTERNAL = 'EXTERNAL',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export enum DisciplineCategory {
    TRACK = 'TRACK',
    FIELD = 'FIELD',
    SWIMMING = 'SWIMMING',
    GYMNASTICS = 'GYMNASTICS',
    TEAM_SPORT = 'TEAM_SPORT',
    STRENGTH = 'STRENGTH',
    ENDURANCE = 'ENDURANCE',
    CUSTOM = 'CUSTOM',
    OTHER = 'OTHER',
}

export enum MeasurementUnit {
    SECONDS = 'SECONDS',
    MINUTES = 'MINUTES',
    METERS = 'METERS',
    CENTIMETERS = 'CENTIMETERS',
    KILOGRAMS = 'KILOGRAMS',
    POINTS = 'POINTS',
    REPETITIONS = 'REPETITIONS',
    CUSTOM = 'CUSTOM',
}

export enum RecordDirection {
    HIGHER_IS_BETTER = 'HIGHER_IS_BETTER',
    LOWER_IS_BETTER = 'LOWER_IS_BETTER',
}

export enum ResultSource {
    MANUAL_ENTRY = 'MANUAL_ENTRY',
    COMPETITION_IMPORT = 'COMPETITION_IMPORT',
    HISTORICAL = 'HISTORICAL',
    GAME_SUBMISSION = 'GAME_SUBMISSION',
}

export enum RecordType {
    UNIVERSITY = 'UNIVERSITY',
    FACULTY = 'FACULTY',
    YEAR_GROUP = 'YEAR_GROUP',
    PERSONAL_BEST = 'PERSONAL_BEST',
}

export enum RecordStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
    SUPERSEDED = 'SUPERSEDED',
}

export enum VideoStatus {
    UPLOADED = 'UPLOADED',
    PROCESSING = 'PROCESSING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export enum GameEditionStatus {
    DRAFT = 'DRAFT',
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    SCORING = 'SCORING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum PointFormulaType {
    LINEAR = 'LINEAR',
    TABLE = 'TABLE',
    PERCENTAGE = 'PERCENTAGE',
    CUSTOM = 'CUSTOM',
}

// ==================== INTERFACES ====================

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface RecordDetectionResult {
    isRecord: boolean;
    recordTypes: RecordType[];
    previousRecords: {
        type: RecordType;
        previousValue: number;
        newValue: number;
        improvement: number;
        improvementPercent: number;
    }[];
}

export interface DashboardStats {
    totalRecords: number;
    totalAthletes: number;
    totalDisciplines: number;
    resultsThisMonth: number;
    recentRecords: any[];
    recentResults: any[];
    resultsByMonth: { month: string; count: number }[];
    resultsByDiscipline: { discipline: string; count: number }[];
}

export interface PointConversionConfig {
    formulaType: PointFormulaType;
    basePoints?: number;
    referenceValue?: number;
    multiplier?: number;
    table?: { min: number; max: number; points: number }[];
    maxPoints?: number;
}
