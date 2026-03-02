import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@awf.edu.pl' },
        update: {},
        create: {
            email: 'admin@awf.edu.pl', password: adminPassword,
            firstName: 'Admin', lastName: 'System', gender: 'MALE',
            role: 'ADMIN', userStatus: 'STAFF', faculty: 'Wydział Wychowania Fizycznego',
        },
    });
    console.log(`✅ Admin: ${admin.email}`);

    // Athletes
    const athletePassword = await bcrypt.hash('Athlete123!', 12);
    const athletes = [
        { email: 'jan.kowalski@student.awf.edu.pl', firstName: 'Jan', lastName: 'Kowalski', gender: 'MALE' as const, studentId: 'S001', faculty: 'Wydział Wychowania Fizycznego', yearOfStudy: 3, userStatus: 'STUDENT' as const },
        { email: 'anna.nowak@student.awf.edu.pl', firstName: 'Anna', lastName: 'Nowak', gender: 'FEMALE' as const, studentId: 'S002', faculty: 'Wydział Sportu', yearOfStudy: 2, userStatus: 'STUDENT' as const },
        { email: 'piotr.wisniewski@student.awf.edu.pl', firstName: 'Piotr', lastName: 'Wiśniewski', gender: 'MALE' as const, studentId: 'S003', faculty: 'Wydział Rehabilitacji Ruchowej', yearOfStudy: 4, userStatus: 'STUDENT' as const },
        { email: 'maria.wojcik@student.awf.edu.pl', firstName: 'Maria', lastName: 'Wójcik', gender: 'FEMALE' as const, studentId: 'S004', faculty: 'Wydział Wychowania Fizycznego', yearOfStudy: 1, userStatus: 'STUDENT' as const },
        { email: 'tomasz.kaminski@student.awf.edu.pl', firstName: 'Tomasz', lastName: 'Kamiński', gender: 'MALE' as const, studentId: 'S005', faculty: 'Wydział Sportu', yearOfStudy: 5, userStatus: 'STUDENT' as const },
        { email: 'katarzyna.lewandowska@alumni.awf.edu.pl', firstName: 'Katarzyna', lastName: 'Lewandowska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'ALUMNI' as const, graduationYear: 2020 },
        { email: 'michal.zielinski@alumni.awf.edu.pl', firstName: 'Michał', lastName: 'Zieliński', gender: 'MALE' as const, faculty: 'Wydział Sportu', userStatus: 'ALUMNI' as const, graduationYear: 2019 },
        { email: 'agnieszka.szymanska@student.awf.edu.pl', firstName: 'Agnieszka', lastName: 'Szymańska', gender: 'FEMALE' as const, studentId: 'S008', faculty: 'Wydział Turystyki i Rekreacji', yearOfStudy: 3, userStatus: 'STUDENT' as const },
        { email: 'lukasz.dabrowski@student.awf.edu.pl', firstName: 'Łukasz', lastName: 'Dąbrowski', gender: 'MALE' as const, studentId: 'S009', faculty: 'Wydział Nauk o Zdrowiu', yearOfStudy: 2, userStatus: 'STUDENT' as const },
        { email: 'ewa.kozlowska@student.awf.edu.pl', firstName: 'Ewa', lastName: 'Kozłowska', gender: 'FEMALE' as const, studentId: 'S010', faculty: 'Wydział Rehabilitacji Ruchowej', yearOfStudy: 4, userStatus: 'STUDENT' as const },
    ];

    const createdAthletes = [];
    for (const a of athletes) {
        const user = await prisma.user.upsert({
            where: { email: a.email }, update: {},
            create: { ...a, password: athletePassword, role: 'ATHLETE' },
        });
        createdAthletes.push(user);
    }
    console.log(`✅ Created ${createdAthletes.length} athletes`);

    // Disciplines
    const disciplines = [
        { name: 'Bieg 100m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Sprint na dystansie 100 metrów' },
        { name: 'Bieg 400m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Bieg na dystansie 400 metrów' },
        { name: 'Bieg 1500m', category: 'ENDURANCE' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Bieg średniodystansowy' },
        { name: 'Skok w dal', category: 'FIELD' as const, measurementUnit: 'CENTIMETERS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Skok w dal z rozbiegu' },
        { name: 'Pchnięcie kulą', category: 'FIELD' as const, measurementUnit: 'METERS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Pchnięcie kulą sportową' },
        { name: 'Pływanie 50m dowolnym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Pływanie stylem dowolnym na 50m' },
        { name: 'Pływanie 100m klasycznym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Pływanie stylem klasycznym na 100m' },
        { name: 'Wyciskanie leżąc', category: 'STRENGTH' as const, measurementUnit: 'KILOGRAMS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Wyciskanie sztangi leżąc na ławce' },
        { name: 'Podciąganie na drążku', category: 'STRENGTH' as const, measurementUnit: 'REPETITIONS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Podciąganie na drążku nachwytem' },
        { name: 'Przeskok przez kozła', category: 'GYMNASTICS' as const, measurementUnit: 'POINTS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Przeskok gimnastyczny' },
    ];

    const createdDisciplines = [];
    for (const d of disciplines) {
        const disc = await prisma.sportDiscipline.upsert({
            where: { name: d.name }, update: {},
            create: d,
        });
        createdDisciplines.push(disc);
    }
    console.log(`✅ Created ${createdDisciplines.length} disciplines`);

    // Results (historical and current)
    const resultData = [
        // Track
        { athleteIdx: 0, discIdx: 0, value: 11.23, date: '2024-09-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF', isOfficial: true },
        { athleteIdx: 0, discIdx: 0, value: 11.45, date: '2024-06-10', location: 'Stadion AWF', competition: 'Zawody wewnętrzne' },
        { athleteIdx: 2, discIdx: 0, value: 11.67, date: '2024-09-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF', isOfficial: true },
        { athleteIdx: 4, discIdx: 0, value: 10.98, date: '2024-03-20', location: 'Stadion AWF', competition: 'Memoriał Kusocińskiego', isOfficial: true },
        { athleteIdx: 1, discIdx: 0, value: 12.34, date: '2024-09-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF', isOfficial: true },
        { athleteIdx: 3, discIdx: 0, value: 13.01, date: '2024-08-01', location: 'Stadion AWF' },

        { athleteIdx: 0, discIdx: 1, value: 52.15, date: '2024-05-20', location: 'Stadion AWF', competition: 'Zawody międzyuczelniane', isOfficial: true },
        { athleteIdx: 2, discIdx: 1, value: 53.87, date: '2024-05-20', location: 'Stadion AWF', competition: 'Zawody międzyuczelniane', isOfficial: true },
        { athleteIdx: 4, discIdx: 1, value: 50.12, date: '2024-07-10', location: 'Gdańsk', competition: 'Ogólnopolskie Igrzyska', isOfficial: true },

        { athleteIdx: 0, discIdx: 2, value: 245.5, date: '2024-04-15', location: 'Stadion AWF' },
        { athleteIdx: 2, discIdx: 2, value: 258.3, date: '2024-04-15', location: 'Stadion AWF' },
        { athleteIdx: 8, discIdx: 2, value: 262.1, date: '2024-06-20', location: 'Stadion AWF', competition: 'Puchar Rektora', isOfficial: true },

        // Field
        { athleteIdx: 0, discIdx: 3, value: 625, date: '2024-09-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF', isOfficial: true },
        { athleteIdx: 2, discIdx: 3, value: 598, date: '2024-09-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF', isOfficial: true },
        { athleteIdx: 4, discIdx: 3, value: 655, date: '2024-03-20', location: 'Stadion AWF', competition: 'Memoriał Kusocińskiego', isOfficial: true },
        { athleteIdx: 1, discIdx: 3, value: 520, date: '2024-09-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF', isOfficial: true },
        { athleteIdx: 3, discIdx: 3, value: 485, date: '2024-08-01', location: 'Stadion AWF' },

        { athleteIdx: 0, discIdx: 4, value: 13.45, date: '2024-10-01', location: 'Stadion AWF', competition: 'Puchar Rektora', isOfficial: true },
        { athleteIdx: 4, discIdx: 4, value: 15.22, date: '2024-10-01', location: 'Stadion AWF', competition: 'Puchar Rektora', isOfficial: true },
        { athleteIdx: 2, discIdx: 4, value: 12.87, date: '2024-06-15', location: 'Stadion AWF' },

        // Swimming
        { athleteIdx: 1, discIdx: 5, value: 28.45, date: '2024-11-10', location: 'Basen AWF', competition: 'Zawody pływackie', isOfficial: true },
        { athleteIdx: 3, discIdx: 5, value: 30.12, date: '2024-11-10', location: 'Basen AWF', competition: 'Zawody pływackie', isOfficial: true },
        { athleteIdx: 9, discIdx: 5, value: 29.78, date: '2024-11-10', location: 'Basen AWF', competition: 'Zawody pływackie', isOfficial: true },
        { athleteIdx: 7, discIdx: 5, value: 31.56, date: '2024-08-20', location: 'Basen Olimpijski' },

        { athleteIdx: 1, discIdx: 6, value: 72.34, date: '2024-11-10', location: 'Basen AWF', competition: 'Zawody pływackie', isOfficial: true },
        { athleteIdx: 3, discIdx: 6, value: 78.90, date: '2024-11-10', location: 'Basen AWF', competition: 'Zawody pływackie', isOfficial: true },

        // Strength
        { athleteIdx: 0, discIdx: 7, value: 120, date: '2024-12-01', location: 'Siłownia AWF' },
        { athleteIdx: 4, discIdx: 7, value: 140, date: '2024-12-01', location: 'Siłownia AWF', competition: 'Zawody siłowe', isOfficial: true },
        { athleteIdx: 2, discIdx: 7, value: 100, date: '2024-10-15', location: 'Siłownia AWF' },
        { athleteIdx: 6, discIdx: 7, value: 145, date: '2020-06-15', location: 'Siłownia AWF', source: 'HISTORICAL' as const },

        { athleteIdx: 0, discIdx: 8, value: 18, date: '2024-12-05', location: 'Siłownia AWF' },
        { athleteIdx: 4, discIdx: 8, value: 22, date: '2024-12-05', location: 'Siłownia AWF', competition: 'Zawody sprawnościowe', isOfficial: true },
        { athleteIdx: 8, discIdx: 8, value: 15, date: '2024-11-20', location: 'Siłownia AWF' },

        // Gymnastics
        { athleteIdx: 1, discIdx: 9, value: 8.5, date: '2024-10-20', location: 'Hala AWF', competition: 'Zawody gimnastyczne', isOfficial: true },
        { athleteIdx: 3, discIdx: 9, value: 7.8, date: '2024-10-20', location: 'Hala AWF', competition: 'Zawody gimnastyczne', isOfficial: true },
        { athleteIdx: 9, discIdx: 9, value: 9.0, date: '2024-10-20', location: 'Hala AWF', competition: 'Zawody gimnastyczne', isOfficial: true },

        // Historical alumni results
        { athleteIdx: 5, discIdx: 0, value: 12.15, date: '2019-05-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF 2019', isOfficial: true, source: 'HISTORICAL' as const },
        { athleteIdx: 5, discIdx: 3, value: 545, date: '2019-05-15', location: 'Stadion AWF', competition: 'Mistrzostwa AWF 2019', isOfficial: true, source: 'HISTORICAL' as const },
        { athleteIdx: 6, discIdx: 0, value: 10.85, date: '2018-09-20', location: 'Stadion AWF', competition: 'Memoriał Kusocińskiego 2018', isOfficial: true, source: 'HISTORICAL' as const },
        { athleteIdx: 6, discIdx: 1, value: 49.56, date: '2018-09-20', location: 'Warszawa', competition: 'Akademickie Mistrzostwa Polski', isOfficial: true, source: 'HISTORICAL' as const },
    ];

    for (const r of resultData) {
        const discipline = createdDisciplines[r.discIdx];
        await prisma.result.create({
            data: {
                userId: createdAthletes[r.athleteIdx].id,
                disciplineId: discipline.id,
                value: r.value,
                date: new Date(r.date),
                location: r.location,
                competition: r.competition,
                isOfficial: r.isOfficial || false,
                source: r.source || 'MANUAL_ENTRY',
            },
        });
    }
    console.log(`✅ Created ${resultData.length} results`);

    // Game Edition sample
    const currentDate = new Date();
    const gameEdition = await prisma.gameEdition.create({
        data: {
            name: `Igrzyska Ogólne - ${currentDate.toLocaleString('pl-PL', { month: 'long' })} ${currentDate.getFullYear()}`,
            description: 'Miesięczne zawody ogólne dla studentów i absolwentów AWF',
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
            status: 'ACTIVE',
            isOpenForAlumni: true,
            disciplines: {
                create: [
                    { disciplineId: createdDisciplines[0].id, pointsConfig: { formulaType: 'LINEAR', basePoints: 100, referenceValue: 10.0, multiplier: -10, maxPoints: 100 }, maxPoints: 100, order: 1, isRequired: false },
                    { disciplineId: createdDisciplines[3].id, pointsConfig: { formulaType: 'LINEAR', basePoints: 0, referenceValue: 400, multiplier: 0.2, maxPoints: 100 }, maxPoints: 100, order: 2, isRequired: false },
                    { disciplineId: createdDisciplines[7].id, pointsConfig: { formulaType: 'PERCENTAGE', referenceValue: 150, maxPoints: 100 }, maxPoints: 100, order: 3, isRequired: false },
                    { disciplineId: createdDisciplines[8].id, pointsConfig: { formulaType: 'TABLE', table: [{ min: 0, max: 5, points: 20 }, { min: 6, max: 10, points: 40 }, { min: 11, max: 15, points: 60 }, { min: 16, max: 20, points: 80 }, { min: 21, max: 100, points: 100 }], maxPoints: 100 }, maxPoints: 100, order: 4, isRequired: false },
                ],
            },
        },
        include: { disciplines: true },
    });
    console.log(`✅ Created game edition: ${gameEdition.name} with ${gameEdition.disciplines.length} disciplines`);

    // Add some game participations
    const gameDisciplines = await prisma.gameDiscipline.findMany({ where: { editionId: gameEdition.id } });
    for (let i = 0; i < 5; i++) {
        const participation = await prisma.gameParticipation.create({
            data: { editionId: gameEdition.id, userId: createdAthletes[i].id },
        });

        // Submit a result for the first discipline
        const gd = gameDisciplines[0];
        const config = gd.pointsConfig as any;
        const rawValue = 10.5 + Math.random() * 2;
        const isLowerBetter = createdDisciplines[0].recordDirection === 'LOWER_IS_BETTER';
        let points = 0;
        if (config.formulaType === 'LINEAR') {
            points = Math.max(0, Math.min(config.maxPoints || 100, (config.basePoints || 0) - (rawValue - (config.referenceValue || 0)) * Math.abs(config.multiplier || 1)));
        }

        await prisma.gameResult.create({
            data: { participationId: participation.id, gameDisciplineId: gd.id, rawValue: Math.round(rawValue * 100) / 100, points: Math.round(points * 100) / 100 },
        });

        await prisma.gameParticipation.update({ where: { id: participation.id }, data: { totalPoints: Math.round(points * 100) / 100, rank: i + 1 } });
    }
    console.log('✅ Created game participations and results');

    console.log('\n🎉 Seeding complete!');
    console.log('📧 Admin login: admin@awf.edu.pl / Admin123!');
    console.log('📧 Athlete login: jan.kowalski@student.awf.edu.pl / Athlete123!');
}

main()
    .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
