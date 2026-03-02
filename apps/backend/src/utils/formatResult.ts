import { MeasurementUnitType } from '@prisma/client';

export function formatResultValue(value: number, unit: MeasurementUnitType, customLabel?: string | null): string {
    switch (unit) {
        case 'SECONDS':
            if (value >= 60) {
                const mins = Math.floor(value / 60);
                const secs = (value % 60).toFixed(2);
                return `${mins}:${secs.padStart(5, '0')}`;
            }
            return `${value.toFixed(2)}s`;

        case 'MINUTES': {
            const wholeMins = Math.floor(value);
            const remainingSecs = Math.round((value - wholeMins) * 60);
            return `${wholeMins}:${remainingSecs.toString().padStart(2, '0')} min`;
        }

        case 'METERS':
            return `${value.toFixed(2)}m`;

        case 'CENTIMETERS':
            return `${value.toFixed(1)}cm`;

        case 'KILOGRAMS':
            return `${value.toFixed(1)}kg`;

        case 'POINTS':
            return `${Math.round(value)} pkt`;

        case 'REPETITIONS':
            return `${Math.round(value)} powt.`;

        case 'CUSTOM':
            return `${value} ${customLabel || ''}`.trim();

        default:
            return `${value}`;
    }
}

export function parseTimeToSeconds(timeStr: string): number | null {
    const fullMatch = timeStr.match(/^(\d+):(\d{1,2})\.(\d{1,3})$/);
    if (fullMatch) {
        const mins = parseInt(fullMatch[1]);
        const secs = parseInt(fullMatch[2]);
        const ms = parseInt(fullMatch[3].padEnd(3, '0'));
        return mins * 60 + secs + ms / 1000;
    }

    const shortMatch = timeStr.match(/^(\d+)\.(\d{1,3})$/);
    if (shortMatch) {
        const secs = parseInt(shortMatch[1]);
        const ms = parseInt(shortMatch[2].padEnd(3, '0'));
        return secs + ms / 1000;
    }

    const numValue = parseFloat(timeStr);
    if (!isNaN(numValue)) return numValue;

    return null;
}
