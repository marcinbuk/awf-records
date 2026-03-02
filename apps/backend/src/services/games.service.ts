import prisma from '../utils/prisma';
import { CreateGameEditionInput, SubmitGameResultInput } from '@awf/shared';
import { calculatePoints } from './points.service';
import { AppError } from '../middleware/errorHandler';

export async function createGameEdition(data: CreateGameEditionInput) {
    const existing = await prisma.gameEdition.findUnique({ where: { month_year: { month: data.month, year: data.year } } });
    if (existing) throw new AppError(`Edycja igrzysk na ${data.month}/${data.year} już istnieje`, 409);

    return prisma.gameEdition.create({
        data: {
            name: data.name, description: data.description, month: data.month, year: data.year,
            startDate: new Date(data.startDate), endDate: new Date(data.endDate),
            maxParticipants: data.maxParticipants, isOpenForAlumni: data.isOpenForAlumni, status: 'DRAFT',
            disciplines: {
                create: data.disciplines.map((d) => ({
                    disciplineId: d.disciplineId, pointsConfig: d.pointsConfig as any,
                    maxPoints: d.pointsConfig.maxPoints || 100, order: d.order, isRequired: d.isRequired,
                })),
            },
        },
        include: { disciplines: { include: { discipline: true }, orderBy: { order: 'asc' } } },
    });
}

export async function getGameEditions(params: { status?: string; page?: number; limit?: number; }) {
    const { page = 1, limit = 12 } = params;
    const where: any = {};
    if (params.status) where.status = params.status;

    const [data, total] = await Promise.all([
        prisma.gameEdition.findMany({
            where,
            include: { disciplines: { include: { discipline: true }, orderBy: { order: 'asc' } }, _count: { select: { participations: true } } },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            skip: (page - 1) * limit, take: limit,
        }),
        prisma.gameEdition.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getGameEditionById(id: string) {
    const edition = await prisma.gameEdition.findUnique({
        where: { id },
        include: {
            disciplines: {
                include: {
                    discipline: true,
                    results: {
                        include: {
                            participation: { include: { user: { select: { id: true, firstName: true, lastName: true, gender: true, faculty: true } } } },
                            result: { include: { videos: { select: { id: true, status: true, videoUrl: true } } } },
                        },
                        orderBy: { points: 'desc' },
                    },
                },
                orderBy: { order: 'asc' },
            },
            participations: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, gender: true, faculty: true, userStatus: true } },
                    results: { include: { gameDiscipline: { include: { discipline: true } } } },
                },
                orderBy: { totalPoints: 'desc' },
            },
        },
    });
    if (!edition) throw new AppError('Edycja igrzysk nie znaleziona', 404);
    return edition;
}

export async function joinGameEdition(editionId: string, userId: string) {
    const edition = await prisma.gameEdition.findUnique({ where: { id: editionId } });
    if (!edition) throw new AppError('Edycja igrzysk nie znaleziona', 404);
    if (!['UPCOMING', 'ACTIVE'].includes(edition.status)) throw new AppError('Zapisy do tej edycji są zamknięte', 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Użytkownik nie znaleziony', 404);
    if (!edition.isOpenForAlumni && user.userStatus === 'ALUMNI') throw new AppError('Ta edycja jest zamknięta dla absolwentów', 403);

    if (edition.maxParticipants) {
        const currentCount = await prisma.gameParticipation.count({ where: { editionId, isActive: true } });
        if (currentCount >= edition.maxParticipants) throw new AppError('Osiągnięto limit uczestników', 400);
    }

    return prisma.gameParticipation.upsert({
        where: { editionId_userId: { editionId, userId } },
        update: { isActive: true },
        create: { editionId, userId },
        include: { user: { select: { firstName: true, lastName: true } }, edition: { select: { name: true } } },
    });
}

export async function submitGameResult(data: SubmitGameResultInput, userId: string, resultId?: string) {
    const participation = await prisma.gameParticipation.findFirst({ where: { editionId: data.editionId, userId, isActive: true } });
    if (!participation) throw new AppError('Nie jesteś zapisany do tej edycji igrzysk', 403);

    const gameDiscipline = await prisma.gameDiscipline.findUnique({ where: { id: data.gameDisciplineId }, include: { discipline: true, edition: true } });
    if (!gameDiscipline) throw new AppError('Dyscyplina nie znaleziona w tej edycji', 404);
    if (gameDiscipline.edition.status !== 'ACTIVE') throw new AppError('Ta edycja igrzysk nie jest aktywna', 400);

    const isLowerBetter = gameDiscipline.discipline.recordDirection === 'LOWER_IS_BETTER';
    const pointsConfig = gameDiscipline.pointsConfig as any;
    const points = calculatePoints(data.value, pointsConfig, isLowerBetter);

    const gameResult = await prisma.gameResult.upsert({
        where: { participationId_gameDisciplineId: { participationId: participation.id, gameDisciplineId: data.gameDisciplineId } },
        update: { rawValue: data.value, points, resultId: resultId || undefined, isVerified: false },
        create: { participationId: participation.id, gameDisciplineId: data.gameDisciplineId, rawValue: data.value, points, resultId: resultId || undefined, isVerified: false },
        include: { gameDiscipline: { include: { discipline: true } } },
    });

    await recalculateTotalPoints(participation.id);
    return gameResult;
}

export async function recalculateTotalPoints(participationId: string) {
    const results = await prisma.gameResult.findMany({ where: { participationId } });
    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    await prisma.gameParticipation.update({ where: { id: participationId }, data: { totalPoints } });

    const participation = await prisma.gameParticipation.findUnique({ where: { id: participationId } });
    if (participation) {
        const allParticipations = await prisma.gameParticipation.findMany({ where: { editionId: participation.editionId, isActive: true }, orderBy: { totalPoints: 'desc' } });
        for (let i = 0; i < allParticipations.length; i++) {
            await prisma.gameParticipation.update({ where: { id: allParticipations[i].id }, data: { rank: i + 1 } });
        }
    }
}

export async function getGameLeaderboard(editionId: string, gender?: string) {
    const where: any = { editionId, isActive: true };
    if (gender) where.user = { gender };

    return prisma.gameParticipation.findMany({
        where,
        include: {
            user: { select: { id: true, firstName: true, lastName: true, gender: true, faculty: true, userStatus: true, profilePhoto: true } },
            results: { include: { gameDiscipline: { include: { discipline: true } }, result: { include: { videos: { select: { id: true, status: true } } } } } },
        },
        orderBy: { totalPoints: 'desc' },
    });
}

export async function updateGameEditionStatus(id: string, status: string) {
    const edition = await prisma.gameEdition.findUnique({ where: { id } });
    if (!edition) throw new AppError('Edycja nie znaleziona', 404);
    return prisma.gameEdition.update({ where: { id }, data: { status: status as any } });
}

export async function verifyGameResult(gameResultId: string, verified: boolean, note?: string) {
    return prisma.gameResult.update({ where: { id: gameResultId }, data: { isVerified: verified, verificationNote: note } });
}
