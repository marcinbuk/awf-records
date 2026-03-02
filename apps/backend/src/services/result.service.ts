import prisma from '../utils/prisma';
import { CreateResultInput } from '@awf/shared';
import { formatResultValue } from '../utils/formatResult';
import { detectRecords, createRecords } from './record.service';
import { AppError } from '../middleware/errorHandler';

export async function createResult(data: CreateResultInput, submittedById: string) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new AppError('Zawodnik nie znaleziony', 404);

    const discipline = await prisma.sportDiscipline.findUnique({ where: { id: data.disciplineId } });
    if (!discipline) throw new AppError('Dyscyplina nie znaleziona', 404);

    const displayValue = data.displayValue || formatResultValue(data.value, discipline.measurementUnit, discipline.customUnitLabel);

    const result = await prisma.result.create({
        data: {
            userId: data.userId, disciplineId: data.disciplineId, value: data.value,
            displayValue, date: new Date(data.date), location: data.location,
            competition: data.competition, isOfficial: data.isOfficial, notes: data.notes,
            source: data.source, submittedById,
        },
        include: { user: { select: { id: true, firstName: true, lastName: true, faculty: true, yearOfStudy: true, gender: true } }, discipline: true },
    });

    const detection = await detectRecords(result.id, data.userId, data.disciplineId, data.value, user.gender);
    let createdRecords: any[] = [];
    if (detection.isRecord) {
        createdRecords = await createRecords(result.id, data.disciplineId, user.gender, detection.recordTypes, user.faculty, user.yearOfStudy);
    }

    return { result, recordDetection: detection, createdRecords };
}

export async function getResults(params: {
    page?: number; limit?: number; userId?: string; disciplineId?: string; category?: string;
    gender?: string; source?: string; isOfficial?: boolean; startDate?: string; endDate?: string;
    search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
}) {
    const { page = 1, limit = 20 } = params;
    const where: any = { isDeleted: false };

    if (params.userId) where.userId = params.userId;
    if (params.disciplineId) where.disciplineId = params.disciplineId;
    if (params.source) where.source = params.source;
    if (params.isOfficial !== undefined) where.isOfficial = params.isOfficial;
    if (params.gender) where.user = { gender: params.gender };
    if (params.category) where.discipline = { category: params.category };

    if (params.startDate || params.endDate) {
        where.date = {};
        if (params.startDate) where.date.gte = new Date(params.startDate);
        if (params.endDate) where.date.lte = new Date(params.endDate);
    }

    if (params.search) {
        where.OR = [
            { user: { firstName: { contains: params.search, mode: 'insensitive' } } },
            { user: { lastName: { contains: params.search, mode: 'insensitive' } } },
            { discipline: { name: { contains: params.search, mode: 'insensitive' } } },
            { competition: { contains: params.search, mode: 'insensitive' } },
            { location: { contains: params.search, mode: 'insensitive' } },
        ];
    }

    const orderBy: any = {};
    if (params.sortBy) {
        if (params.sortBy === 'athlete') orderBy.user = { lastName: params.sortOrder || 'asc' };
        else if (params.sortBy === 'discipline') orderBy.discipline = { name: params.sortOrder || 'asc' };
        else orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else { orderBy.date = 'desc'; }

    const [data, total] = await Promise.all([
        prisma.result.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, faculty: true, userStatus: true, gender: true, studentId: true } },
                discipline: true,
                records: { where: { isCurrentRecord: true }, select: { id: true, recordType: true, status: true } },
                videos: { select: { id: true, status: true, thumbnailUrl: true } },
            },
            orderBy, skip: (page - 1) * limit, take: limit,
        }),
        prisma.result.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getResultById(id: string) {
    const result = await prisma.result.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, faculty: true, userStatus: true, gender: true, studentId: true, profilePhoto: true } },
            discipline: true,
            records: { include: { previousRecord: { include: { result: { include: { user: { select: { firstName: true, lastName: true } } } } } } } },
            videos: true,
            submittedBy: { select: { firstName: true, lastName: true } },
        },
    });
    if (!result || result.isDeleted) throw new AppError('Wynik nie znaleziony', 404);
    return result;
}

export async function updateResult(id: string, data: Partial<CreateResultInput>) {
    const existing = await prisma.result.findUnique({ where: { id }, include: { discipline: true } });
    if (!existing || existing.isDeleted) throw new AppError('Wynik nie znaleziony', 404);

    let displayValue = data.displayValue;
    if (data.value && !displayValue) {
        displayValue = formatResultValue(data.value, existing.discipline.measurementUnit, existing.discipline.customUnitLabel);
    }

    return prisma.result.update({
        where: { id },
        data: {
            ...(data.value !== undefined && { value: data.value }),
            ...(displayValue && { displayValue }),
            ...(data.date && { date: new Date(data.date) }),
            ...(data.location !== undefined && { location: data.location }),
            ...(data.competition !== undefined && { competition: data.competition }),
            ...(data.isOfficial !== undefined && { isOfficial: data.isOfficial }),
            ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: { user: { select: { id: true, firstName: true, lastName: true } }, discipline: true },
    });
}

export async function deleteResult(id: string) {
    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing) throw new AppError('Wynik nie znaleziony', 404);
    return prisma.result.update({ where: { id }, data: { isDeleted: true } });
}

export async function getPersonalBests(userId: string) {
    const results = await prisma.result.findMany({
        where: { userId, isDeleted: false }, include: { discipline: true }, orderBy: { date: 'desc' },
    });

    const bestByDiscipline = new Map<string, typeof results[0]>();
    for (const result of results) {
        const existing = bestByDiscipline.get(result.disciplineId);
        if (!existing) { bestByDiscipline.set(result.disciplineId, result); continue; }
        const isHigherBetter = result.discipline.recordDirection === 'HIGHER_IS_BETTER';
        if (isHigherBetter ? result.value > existing.value : result.value < existing.value) {
            bestByDiscipline.set(result.disciplineId, result);
        }
    }
    return Array.from(bestByDiscipline.values());
}
