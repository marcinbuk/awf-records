import { prisma } from '../lib/prisma';

/**
 * Detects new records after a result is saved.
 * Returns array of created Record objects.
 */
export async function detectRecords(resultId: string) {
    const result = await prisma.result.findUnique({
        where: { id: resultId },
        include: { discipline: true, user: true },
    });

    if (!result) return [];

    const createdRecords = [];
    const { discipline, user, value } = result;
    const direction = discipline.recordDirection;

    // Personal Best
    const personalBest = await prisma.result.findFirst({
        where: {
            userId: user.id,
            disciplineId: discipline.id,
            id: { not: resultId },
        },
        orderBy: { value: direction === 'LOWER_IS_BETTER' ? 'asc' : 'desc' },
    });

    const isPersonalBest = !personalBest
        || (direction === 'LOWER_IS_BETTER' ? value < personalBest.value : value > personalBest.value);

    if (isPersonalBest) {
        // Supersede previous personal best record if exists
        const prevPB = await prisma.record.findFirst({
            where: { result: { userId: user.id }, disciplineId: discipline.id, recordType: 'PERSONAL_BEST', isCurrentRecord: true },
        });
        if (prevPB) {
            await prisma.record.update({ where: { id: prevPB.id }, data: { isCurrentRecord: false, status: 'SUPERSEDED' } });
        }
        const pbRecord = await prisma.record.create({
            data: {
                resultId,
                disciplineId: discipline.id,
                recordType: 'PERSONAL_BEST',
                gender: user.gender,
                previousRecordId: prevPB?.id,
                status: 'VERIFIED', // PB auto verified
                isCurrentRecord: true,
                verifiedAt: new Date(),
            },
        });
        createdRecords.push(pbRecord);
    }

    // University Record (by gender)
    const currentUniversityRecord = await prisma.record.findFirst({
        where: {
            disciplineId: discipline.id,
            recordType: 'UNIVERSITY',
            gender: user.gender,
            isCurrentRecord: true,
            status: 'VERIFIED',
        },
        include: { result: true },
    });

    const isUniversityRecord = !currentUniversityRecord
        || (direction === 'LOWER_IS_BETTER'
            ? value < currentUniversityRecord.result.value
            : value > currentUniversityRecord.result.value);

    if (isUniversityRecord) {
        if (currentUniversityRecord) {
            await prisma.record.update({
                where: { id: currentUniversityRecord.id },
                data: { isCurrentRecord: false, status: 'SUPERSEDED' },
            });
        }
        const universityRecord = await prisma.record.create({
            data: {
                resultId,
                disciplineId: discipline.id,
                recordType: 'UNIVERSITY',
                gender: user.gender,
                previousRecordId: currentUniversityRecord?.id,
                status: 'PENDING',
                isCurrentRecord: true,
            },
        });
        createdRecords.push(universityRecord);
    }

    // Faculty Record
    if (user.faculty) {
        const currentFacultyRecord = await prisma.record.findFirst({
            where: {
                disciplineId: discipline.id,
                recordType: 'FACULTY',
                gender: user.gender,
                isCurrentRecord: true,
                status: 'VERIFIED',
                result: { user: { faculty: user.faculty } },
            },
            include: { result: true },
        });

        const isFacultyRecord = !currentFacultyRecord
            || (direction === 'LOWER_IS_BETTER'
                ? value < currentFacultyRecord.result.value
                : value > currentFacultyRecord.result.value);

        if (isFacultyRecord) {
            if (currentFacultyRecord) {
                await prisma.record.update({ where: { id: currentFacultyRecord.id }, data: { isCurrentRecord: false, status: 'SUPERSEDED' } });
            }
            const facultyRecord = await prisma.record.create({
                data: {
                    resultId,
                    disciplineId: discipline.id,
                    recordType: 'FACULTY',
                    gender: user.gender,
                    previousRecordId: currentFacultyRecord?.id,
                    status: 'PENDING',
                    isCurrentRecord: true,
                },
            });
            createdRecords.push(facultyRecord);
        }
    }

    return createdRecords;
}
