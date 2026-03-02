import prisma from '../utils/prisma';

export async function getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRecords, totalAthletes, totalDisciplines, resultsThisMonth, recentRecords, recentResults] = await Promise.all([
        prisma.record.count({ where: { isCurrentRecord: true, status: 'VERIFIED' } }),
        prisma.user.count({ where: { role: 'ATHLETE', isActive: true } }),
        prisma.sportDiscipline.count({ where: { isActive: true } }),
        prisma.result.count({ where: { createdAt: { gte: startOfMonth }, isDeleted: false } }),
        prisma.record.findMany({
            where: { isCurrentRecord: true },
            include: { result: { include: { user: { select: { firstName: true, lastName: true } }, discipline: true } } },
            orderBy: { createdAt: 'desc' }, take: 5,
        }),
        prisma.result.findMany({
            where: { isDeleted: false },
            include: { user: { select: { firstName: true, lastName: true } }, discipline: true },
            orderBy: { createdAt: 'desc' }, take: 10,
        }),
    ]);

    const months = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        months.push({ month: d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' }), start: d, end });
    }

    const resultsByMonth = await Promise.all(
        months.map(async (m) => ({ month: m.month, count: await prisma.result.count({ where: { date: { gte: m.start, lte: m.end }, isDeleted: false } }) }))
    );

    const resultsByDiscipline = await prisma.result.groupBy({
        by: ['disciplineId'], where: { isDeleted: false }, _count: true, orderBy: { _count: { disciplineId: 'desc' } }, take: 10,
    });

    const disciplineNames = await prisma.sportDiscipline.findMany({
        where: { id: { in: resultsByDiscipline.map(r => r.disciplineId) } }, select: { id: true, name: true },
    });
    const disciplineMap = new Map(disciplineNames.map(d => [d.id, d.name]));

    const pendingRecords = await prisma.record.count({ where: { status: 'PENDING' } });
    const activeGames = await prisma.gameEdition.count({ where: { status: 'ACTIVE' } });

    return {
        totalRecords, totalAthletes, totalDisciplines, resultsThisMonth, pendingRecords, activeGames,
        recentRecords, recentResults, resultsByMonth,
        resultsByDiscipline: resultsByDiscipline.map(r => ({ discipline: disciplineMap.get(r.disciplineId) || 'Unknown', count: r._count })),
    };
}

export async function getDisciplineStatistics(disciplineId: string) {
    const discipline = await prisma.sportDiscipline.findUnique({ where: { id: disciplineId } });
    if (!discipline) throw new Error('Dyscyplina nie znaleziona');

    const results = await prisma.result.findMany({
        where: { disciplineId, isDeleted: false },
        include: { user: { select: { firstName: true, lastName: true, gender: true, faculty: true } } },
        orderBy: { date: 'asc' },
    });

    const maleResults = results.filter(r => r.user.gender === 'MALE');
    const femaleResults = results.filter(r => r.user.gender === 'FEMALE');

    const calcStats = (vals: number[]) => {
        if (vals.length === 0) return { avg: 0, best: 0, worst: 0, count: 0 };
        const sorted = [...vals].sort((a, b) => a - b);
        return {
            avg: vals.reduce((a, b) => a + b, 0) / vals.length,
            best: discipline.recordDirection === 'LOWER_IS_BETTER' ? sorted[0] : sorted[sorted.length - 1],
            worst: discipline.recordDirection === 'LOWER_IS_BETTER' ? sorted[sorted.length - 1] : sorted[0],
            count: vals.length,
        };
    };

    return {
        discipline, totalResults: results.length,
        maleStats: calcStats(maleResults.map(r => r.value)),
        femaleStats: calcStats(femaleResults.map(r => r.value)),
        timeline: results.map(r => ({ date: r.date, value: r.value, athlete: `${r.user.firstName} ${r.user.lastName}`, gender: r.user.gender })),
        byFaculty: Object.entries(
            results.reduce((acc, r) => {
                const fac = r.user.faculty || 'Brak';
                if (!acc[fac]) acc[fac] = [];
                acc[fac].push(r.value);
                return acc;
            }, {} as Record<string, number[]>)
        ).map(([faculty, values]) => ({ faculty, ...calcStats(values) })),
    };
}

export async function getCompareAthletes(athleteIds: string[], disciplineId?: string) {
    const athletes = await prisma.user.findMany({
        where: { id: { in: athleteIds } },
        select: { id: true, firstName: true, lastName: true, gender: true, faculty: true },
    });

    const disciplineWhere: any = { isDeleted: false };
    if (disciplineId) disciplineWhere.disciplineId = disciplineId;

    const results = await Promise.all(
        athleteIds.map(async (id) => ({
            userId: id,
            results: await prisma.result.findMany({ where: { ...disciplineWhere, userId: id }, include: { discipline: true }, orderBy: { date: 'desc' } }),
        }))
    );

    return { athletes, results };
}

export async function getFacultyRanking() {
    const faculties = await prisma.user.groupBy({ by: ['faculty'], where: { faculty: { not: null }, isActive: true } });

    const rankings = await Promise.all(
        faculties.filter(f => f.faculty).map(async (f) => {
            const [recordCount, athleteCount, resultCount] = await Promise.all([
                prisma.record.count({ where: { result: { user: { faculty: f.faculty! } }, isCurrentRecord: true, status: 'VERIFIED' } }),
                prisma.user.count({ where: { faculty: f.faculty!, role: 'ATHLETE', isActive: true } }),
                prisma.result.count({ where: { user: { faculty: f.faculty! }, isDeleted: false } }),
            ]);
            return { faculty: f.faculty!, recordCount, athleteCount, resultCount };
        })
    );

    return rankings.sort((a, b) => b.recordCount - a.recordCount);
}
