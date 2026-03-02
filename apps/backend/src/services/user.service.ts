import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler';

export async function getUsers(params: {
    page?: number; limit?: number; search?: string; role?: string; userStatus?: string;
    faculty?: string; gender?: string; isActive?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc';
}) {
    const { page = 1, limit = 20 } = params;
    const where: any = {};

    if (params.role) where.role = params.role;
    if (params.userStatus) where.userStatus = params.userStatus;
    if (params.faculty) where.faculty = params.faculty;
    if (params.gender) where.gender = params.gender;
    if (params.isActive !== undefined) where.isActive = params.isActive;

    if (params.search) {
        where.OR = [
            { firstName: { contains: params.search, mode: 'insensitive' } },
            { lastName: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { studentId: { contains: params.search, mode: 'insensitive' } },
        ];
    }

    const orderBy: any = {};
    orderBy[params.sortBy || 'lastName'] = params.sortOrder || 'asc';

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true, email: true, firstName: true, lastName: true,
                role: true, userStatus: true, studentId: true, faculty: true,
                specialization: true, yearOfStudy: true, graduationYear: true,
                gender: true, dateOfBirth: true, profilePhoto: true,
                isActive: true, createdAt: true,
                _count: { select: { results: { where: { isDeleted: false } } } },
            },
            orderBy, skip: (page - 1) * limit, take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            role: true, userStatus: true, studentId: true, faculty: true,
            specialization: true, yearOfStudy: true, graduationYear: true,
            gender: true, dateOfBirth: true, profilePhoto: true,
            isActive: true, createdAt: true,
            _count: { select: { results: { where: { isDeleted: false } } } },
        },
    });
    if (!user) throw new AppError('Użytkownik nie znaleziony', 404);
    return user;
}

export async function updateUser(id: string, data: any) {
    return prisma.user.update({
        where: { id }, data,
        select: {
            id: true, email: true, firstName: true, lastName: true,
            role: true, userStatus: true, studentId: true, faculty: true,
            specialization: true, yearOfStudy: true, graduationYear: true,
            gender: true, dateOfBirth: true, profilePhoto: true,
            isActive: true, createdAt: true,
        },
    });
}

export async function deleteUser(id: string) {
    return prisma.user.update({ where: { id }, data: { isActive: false } });
}

export async function getUserStatistics(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Użytkownik nie znaleziony', 404);

    const [totalResults, officialResults, currentRecords, resultsByDiscipline, resultsByMonth] = await Promise.all([
        prisma.result.count({ where: { userId, isDeleted: false } }),
        prisma.result.count({ where: { userId, isDeleted: false, isOfficial: true } }),
        prisma.record.count({ where: { result: { userId }, isCurrentRecord: true, status: 'VERIFIED' } }),
        prisma.result.groupBy({ by: ['disciplineId'], where: { userId, isDeleted: false }, _count: true }),
        prisma.result.findMany({ where: { userId, isDeleted: false }, select: { date: true }, orderBy: { date: 'asc' } }),
    ]);

    return {
        totalResults, officialResults, currentRecords,
        disciplinesCount: resultsByDiscipline.length, resultsByDiscipline,
        activityTimeline: resultsByMonth.map(r => r.date),
    };
}

export async function findOrCreateAthleteForHistorical(data: {
    firstName: string; lastName: string; gender: string; studentId?: string;
    faculty?: string; userStatus?: string; graduationYear?: number;
}) {
    let user = null;

    if (data.studentId) {
        user = await prisma.user.findUnique({ where: { studentId: data.studentId } });
    }
    if (!user) {
        user = await prisma.user.findFirst({
            where: { firstName: { equals: data.firstName, mode: 'insensitive' }, lastName: { equals: data.lastName, mode: 'insensitive' }, gender: data.gender as any },
        });
    }
    if (!user) {
        const email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@historical.awf.edu.pl`;
        const password = await bcrypt.hash('Historical123!', 12);
        user = await prisma.user.create({
            data: {
                email, password, firstName: data.firstName, lastName: data.lastName,
                gender: data.gender as any, role: 'ATHLETE',
                userStatus: (data.userStatus as any) || 'ALUMNI',
                studentId: data.studentId, faculty: data.faculty, graduationYear: data.graduationYear,
            },
        });
    }
    return user;
}
