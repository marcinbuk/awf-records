import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<string, string> = {
    TRACK: 'Biegi', FIELD: 'Rzuty/Skoki', SWIMMING: 'Pływanie',
    GYMNASTICS: 'Gimnastyka', TEAM_SPORT: 'Sporty drużynowe',
    STRENGTH: 'Siłowe', OTHER: 'Inne',
};

export const UNIT_LABELS: Record<string, string> = {
    SECONDS: 'sekundy', MINUTES: 'minuty', METERS: 'metry',
    CENTIMETERS: 'centymetry', KILOGRAMS: 'kilogramy', POINTS: 'punkty', REPETITIONS: 'powtórzenia',
};

export const GENDER_LABELS: Record<string, string> = {
    MALE: 'Mężczyźni', FEMALE: 'Kobiety', MIXED: 'Mieszane',
};

export const RECORD_TYPE_LABELS: Record<string, string> = {
    UNIVERSITY: 'Uczelni', FACULTY: 'Wydziału', YEAR_GROUP: 'Rocznika', PERSONAL_BEST: 'Rekord osobisty',
};

export const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Oczekujący', VERIFIED: 'Zweryfikowany', REJECTED: 'Odrzucony', SUPERSEDED: 'Pobity',
};

export const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator', MODERATOR: 'Moderator', ATHLETE: 'Zawodnik', VIEWER: 'Widz',
};

export function formatDate(dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateShort(dateStr: string | Date): string {
    return new Date(dateStr).toLocaleDateString('pl-PL');
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        VERIFIED: 'text-green-400 bg-green-400/10 border-green-400/20',
        REJECTED: 'text-red-400 bg-red-400/10 border-red-400/20',
        SUPERSEDED: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        UPLOADED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        PROCESSING: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    };
    return colors[status] || 'text-muted-foreground bg-muted';
}

export function getStatusEmoji(status: string): string {
    return { PENDING: '🟡', VERIFIED: '🟢', REJECTED: '🔴', SUPERSEDED: '⚫', UPLOADED: '🔵', PROCESSING: '🟠' }[status] || '⚪';
}
