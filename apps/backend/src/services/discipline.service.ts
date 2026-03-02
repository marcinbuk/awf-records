import prisma from '../utils/prisma';
import { CreateDisciplineInput } from '@awf/shared';
import { AppError } from '../middleware/errorHandler';

export async function getAllDisciplines(params: { category?: string; isActive?: boolean; search?: string; }) {
    const where: any = {};
    if (params.category) where.category = params.category;
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.search) where.name = { contains: params.search, mode: 'insensitive' };

    return prisma.sportDiscipline.findMany({
        where, orderBy: [{ category: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { results: true, records: { where: { isCurrentRecord: true } } } } },
    });
}

export async function getDisciplineById(id: string) {
    const discipline = await prisma.sportDiscipline.findUnique({
        where: { id },
        include: {
            records: {
                where: { isCurrentRecord: true, status: 'VERIFIED' },
                include: { result: { include: { user: { select: { id: true, firstName: true, lastName: true, faculty: true } } } } },
            },
            _count: { select: { results: true } },
        },
    });
    if (!discipline) throw new AppError('Dyscyplina nie znaleziona', 404);
    return discipline;
}

export async function createDiscipline(data: CreateDisciplineInput) {
    return prisma.sportDiscipline.create({
        data: {
            name: data.name, category: data.category, measurementUnit: data.measurementUnit,
            recordDirection: data.recordDirection, description: data.description,
            customUnitLabel: data.customUnitLabel, isActive: data.isActive ?? true,
            isCustom: data.category === 'CUSTOM', defaultPointsFormula: data.defaultPointsFormula as any,
        },
    });
}

export async function updateDiscipline(id: string, data: Partial<CreateDisciplineInput>) {
    const existing = await prisma.sportDiscipline.findUnique({ where: { id } });
    if (!existing) throw new AppError('Dyscyplina nie znaleziona', 404);

    return prisma.sportDiscipline.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.category && { category: data.category }),
            ...(data.measurementUnit && { measurementUnit: data.measurementUnit }),
            ...(data.recordDirection && { recordDirection: data.recordDirection }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.customUnitLabel !== undefined && { customUnitLabel: data.customUnitLabel }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.defaultPointsFormula && { defaultPointsFormula: data.defaultPointsFormula as any }),
        },
    });
}

export async function deleteDiscipline(id: string) {
    const existing = await prisma.sportDiscipline.findUnique({ where: { id }, include: { _count: { select: { results: true } } } });
    if (!existing) throw new AppError('Dyscyplina nie znaleziona', 404);

    if (existing._count.results > 0) {
        return prisma.sportDiscipline.update({ where: { id }, data: { isActive: false } });
    }
    return prisma.sportDiscipline.delete({ where: { id } });
}
