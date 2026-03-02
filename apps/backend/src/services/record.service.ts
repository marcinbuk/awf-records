import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface RecordDetection {
    isRecord: boolean;
    recordTypes: { type: string; previousValue: number | null; previousRecordId: string | null; }[];
}

export async function detectRecords(resultId: string, userId: string, disciplineId: string, value: number, gender: string): Promise<RecordDetection> {
    const discipline = await prisma.sportDiscipline.findUnique({ where: { id: disciplineId } });
    if (!discipline) return { isRecord: false, recordTypes: [] };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { isRecord: false, recordTypes: [] };

    const isHigherBetter = discipline.recordDirection === 'HIGHER_IS_BETTER';
    const recordTypes: RecordDetection['recordTypes'] = [];

    // 1. University record
    const currentUniRecord = await prisma.record.findFirst({
        where: { disciplineId, recordType: 'UNIVERSITY', gender: gender as any, isCurrentRecord: true, status: { in: ['VERIFIED', 'PENDING'] } },
        include: { result: true },
    });
    if (!currentUniRecord || (isHigherBetter ? value > currentUniRecord.result.value : value < currentUniRecord.result.value)) {
        recordTypes.push({ type: 'UNIVERSITY', previousValue: currentUniRecord?.result.value || null, previousRecordId: currentUniRecord?.id || null });
    }

    // 2. Faculty record
    if (user.faculty) {
        const currentFacultyRecord = await prisma.record.findFirst({
            where: { disciplineId, recordType: 'FACULTY', gender: gender as any, facultyFilter: user.faculty, isCurrentRecord: true, status: { in: ['VERIFIED', 'PENDING'] } },
            include: { result: true },
        });
        if (!currentFacultyRecord || (isHigherBetter ? value > currentFacultyRecord.result.value : value < currentFacultyRecord.result.value)) {
            recordTypes.push({ type: 'FACULTY', previousValue: currentFacultyRecord?.result.value || null, previousRecordId: currentFacultyRecord?.id || null });
        }
    }

    // 3. Year group record
    if (user.yearOfStudy) {
        const currentYearRecord = await prisma.record.findFirst({
            where: { disciplineId, recordType: 'YEAR_GROUP', gender: gender as any, yearGroupFilter: user.yearOfStudy, isCurrentRecord: true, status: { in: ['VERIFIED', 'PENDING'] } },
            include: { result: true },
        });
        if (!currentYearRecord || (isHigherBetter ? value > currentYearRecord.result.value : value < currentYearRecord.result.value)) {
            recordTypes.push({ type: 'YEAR_GROUP', previousValue: currentYearRecord?.result.value || null, previousRecordId: currentYearRecord?.id || null });
        }
    }

    // 4. Personal best
    const currentPB = await prisma.record.findFirst({
        where: { disciplineId, recordType: 'PERSONAL_BEST', result: { userId }, isCurrentRecord: true },
        include: { result: true },
    });
    if (!currentPB || (isHigherBetter ? value > currentPB.result.value : value < currentPB.result.value)) {
        recordTypes.push({ type: 'PERSONAL_BEST', previousValue: currentPB?.result.value || null, previousRecordId: currentPB?.id || null });
    }

    return { isRecord: recordTypes.length > 0, recordTypes };
}

export async function createRecords(resultId: string, disciplineId: string, gender: string, detectedRecords: RecordDetection['recordTypes'], faculty?: string | null, yearOfStudy?: number | null) {
    const createdRecords = [];
    for (const detected of detectedRecords) {
        if (detected.previousRecordId) {
            await prisma.record.update({ where: { id: detected.previousRecordId }, data: { isCurrentRecord: false, status: 'SUPERSEDED' } });
        }
        const record = await prisma.record.create({
            data: {
                resultId, disciplineId, recordType: detected.type as any, gender: gender as any,
                status: 'PENDING', isCurrentRecord: true, previousRecordId: detected.previousRecordId,
                facultyFilter: detected.type === 'FACULTY' ? faculty : undefined,
                yearGroupFilter: detected.type === 'YEAR_GROUP' ? yearOfStudy : undefined,
            },
            include: { result: { include: { user: { select: { firstName: true, lastName: true } }, discipline: true } } },
        });
        createdRecords.push(record);
    }
    return createdRecords;
}

export async function getCurrentRecords(params: { disciplineId?: string; category?: string; gender?: string; recordType?: string; status?: string; page?: number; limit?: number; }) {
    const { page = 1, limit = 50 } = params;
    const where: any = { isCurrentRecord: true };
    if (params.disciplineId) where.disciplineId = params.disciplineId;
    if (params.gender) where.gender = params.gender;
    if (params.recordType) where.recordType = params.recordType;
    if (params.status) where.status = params.status;
    if (params.category) where.discipline = { category: params.category };

    const [data, total] = await Promise.all([
        prisma.record.findMany({
            where,
            include: {
                result: { include: { user: { select: { id: true, firstName: true, lastName: true, faculty: true, userStatus: true, gender: true } }, discipline: true, videos: { select: { id: true, status: true, videoUrl: true } } } },
                discipline: true,
                previousRecord: { include: { result: { include: { user: { select: { firstName: true, lastName: true } } } } } },
            },
            orderBy: [{ discipline: { name: 'asc' } }, { createdAt: 'desc' }],
            skip: (page - 1) * limit, take: limit,
        }),
        prisma.record.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getPendingRecords() {
    return prisma.record.findMany({
        where: { status: 'PENDING', isCurrentRecord: true },
        include: {
            result: { include: { user: { select: { id: true, firstName: true, lastName: true, faculty: true, gender: true } }, discipline: true, videos: true } },
            discipline: true,
            previousRecord: { include: { result: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        },
        orderBy: { createdAt: 'asc' },
    });
}

export async function verifyRecord(recordId: string, status: 'VERIFIED' | 'REJECTED', verifiedById: string, comment?: string) {
    const record = await prisma.record.findUnique({ where: { id: recordId } });
    if (!record) throw new AppError('Rekord nie znaleziony', 404);
    if (record.status !== 'PENDING') throw new AppError('Rekord już został zweryfikowany', 400);

    const updated = await prisma.record.update({
        where: { id: recordId },
        data: { status, verifiedById, verifiedAt: new Date(), verificationComment: comment, isCurrentRecord: status === 'VERIFIED' },
        include: { result: { include: { user: { select: { firstName: true, lastName: true } }, discipline: true } } },
    });

    if (status === 'REJECTED' && record.previousRecordId) {
        await prisma.record.update({ where: { id: record.previousRecordId }, data: { isCurrentRecord: true, status: 'VERIFIED' } });
    }
    return updated;
}

export async function getRecordTimeline(disciplineId: string, gender?: string, recordType?: string) {
    const where: any = { disciplineId, status: { in: ['VERIFIED', 'SUPERSEDED'] } };
    if (gender) where.gender = gender;
    if (recordType) where.recordType = recordType || 'UNIVERSITY';

    return prisma.record.findMany({
        where,
        include: { result: { include: { user: { select: { id: true, firstName: true, lastName: true, faculty: true } }, discipline: true } } },
        orderBy: { result: { date: 'asc' } },
    });
}
