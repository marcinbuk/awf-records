import { PointConversionConfig, PointFormulaType } from '@awf/shared';

export function calculatePoints(
    value: number,
    config: PointConversionConfig,
    isLowerBetter: boolean
): number {
    let points = 0;

    switch (config.formulaType) {
        case PointFormulaType.LINEAR: {
            const base = config.basePoints || 0;
            const ref = config.referenceValue || 0;
            const mult = config.multiplier || 1;
            const max = config.maxPoints || 100;

            if (isLowerBetter) {
                points = base - (value - ref) * mult;
            } else {
                points = base + (value - ref) * mult;
            }
            points = Math.max(0, Math.min(max, points));
            break;
        }

        case PointFormulaType.PERCENTAGE: {
            const ref = config.referenceValue || 1;
            const max = config.maxPoints || 100;
            points = isLowerBetter ? (ref / value) * max : (value / ref) * max;
            points = Math.max(0, Math.min(max, points));
            break;
        }

        case PointFormulaType.TABLE: {
            if (config.table && config.table.length > 0) {
                for (const entry of config.table) {
                    if (value >= entry.min && value <= entry.max) {
                        points = entry.points;
                        break;
                    }
                }
            }
            break;
        }

        case PointFormulaType.CUSTOM: {
            points = value * (config.multiplier || 1);
            points = Math.max(0, Math.min(config.maxPoints || 100, points));
            break;
        }
    }

    return Math.round(points * 100) / 100;
}
