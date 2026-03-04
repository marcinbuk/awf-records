import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Clearing all existing test data...');

    // Delete in correct order (respect FK constraints)
    await prisma.gameResult.deleteMany();
    await prisma.gameParticipation.deleteMany();
    await prisma.gameDiscipline.deleteMany();
    await prisma.gameEdition.deleteMany();
    await prisma.videoVerification.deleteMany();
    await prisma.record.deleteMany();
    await prisma.result.deleteMany();
    await prisma.auditLog.deleteMany();
    // Delete non-admin users
    await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
    // Delete all disciplines (will recreate)
    await prisma.sportDiscipline.deleteMany();
    console.log('✅ All test data cleared');

    // ==================== ADMIN ====================
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

    // ==================== DISCIPLINES ====================
    const discData = [
        // TRACK - Lekkoatletyka biegowa
        { name: 'Bieg na 60 m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Sprint halowy na 60 metrów' },
        { name: 'Bieg na 100 m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Sprint na 100 metrów' },
        { name: 'Bieg na 200 m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Sprint na 200 metrów' },
        { name: 'Bieg na 400 m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Bieg na 400 metrów' },
        { name: 'Bieg na 100 m ppł', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Bieg na 100 m przez płotki' },
        { name: 'Bieg na 3000 m', category: 'ENDURANCE' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Bieg na 3000 metrów' },
        { name: 'Bieg sztafetowy 4x100 m', category: 'TRACK' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: 'Sztafeta 4x100 metrów' },

        // FIELD - Lekkoatletyka techniczna
        { name: 'Skok w dal', category: 'FIELD' as const, measurementUnit: 'METERS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Skok w dal z rozbiegu' },
        { name: 'Skok wzwyż', category: 'FIELD' as const, measurementUnit: 'METERS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Skok wzwyż' },
        { name: 'Trójskok', category: 'FIELD' as const, measurementUnit: 'METERS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Trójskok z rozbiegu' },
        { name: 'Rzut dyskiem', category: 'FIELD' as const, measurementUnit: 'METERS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Rzut dyskiem' },

        // STRENGTH - Podnoszenie ciężarów
        { name: 'Dwubój (podnoszenie ciężarów)', category: 'STRENGTH' as const, measurementUnit: 'KILOGRAMS' as const, recordDirection: 'HIGHER_IS_BETTER' as const, description: 'Dwubój: rwanie + podrzut' },

        // SWIMMING
        { name: 'Pływanie 50 m st. dowolnym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '50 metrów stylem dowolnym' },
        { name: 'Pływanie 100 m st. dowolnym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '100 metrów stylem dowolnym' },
        { name: 'Pływanie 200 m st. dowolnym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '200 metrów stylem dowolnym' },
        { name: 'Pływanie 50 m st. klasycznym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '50 metrów stylem klasycznym' },
        { name: 'Pływanie 100 m st. klasycznym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '100 metrów stylem klasycznym' },
        { name: 'Pływanie 200 m st. klasycznym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '200 metrów stylem klasycznym' },
        { name: 'Pływanie 50 m st. grzbietowym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '50 metrów stylem grzbietowym' },
        { name: 'Pływanie 100 m st. grzbietowym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '100 metrów stylem grzbietowym' },
        { name: 'Pływanie 50 m st. motylkowym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '50 metrów stylem motylkowym' },
        { name: 'Pływanie 100 m st. motylkowym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '100 metrów stylem motylkowym' },
        { name: 'Pływanie 100 m st. zmiennym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '100 metrów stylem zmiennym' },
        { name: 'Pływanie 200 m st. zmiennym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '200 metrów stylem zmiennym' },
        { name: 'Pływanie 400 m st. zmiennym', category: 'SWIMMING' as const, measurementUnit: 'SECONDS' as const, recordDirection: 'LOWER_IS_BETTER' as const, description: '400 metrów stylem zmiennym' },
    ];

    const disc: Record<string, any> = {};
    for (const d of discData) {
        const created = await prisma.sportDiscipline.create({ data: d });
        disc[d.name] = created;
    }
    console.log(`✅ Created ${discData.length} disciplines`);

    // ==================== ATHLETES ====================
    const pw = await bcrypt.hash('Athlete123!', 12);
    const mkEmail = (fn: string, ln: string) => `${fn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')}.${ln.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')}@student.awf.edu.pl`;

    const athleteData = [
        // Lekkoatletyka
        { firstName: 'Piotr', lastName: 'Tarkowski', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Klaudia', lastName: 'Osipiuk', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Paulina', lastName: 'Korolczuk', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Aleksandra', lastName: 'Kupińska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Gabriela', lastName: 'Niczyporuk', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Wiktor', lastName: 'Sikora', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Karol', lastName: 'Kondraciuk', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'ALUMNI' as const, graduationYear: 2008 },
        { firstName: 'Bartłomiej', lastName: 'Bedeniczuk', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Karol', lastName: 'Musiej', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Bartosz', lastName: 'Litwinek', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Aleksandra', lastName: 'Denkiewicz', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Aleksandra', lastName: 'Kapuśniak', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Jacek', lastName: 'Gryta', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Jakub', lastName: 'Żukowski', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Monika', lastName: 'Stypułkowska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Agata', lastName: 'Stypułkowska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Katarzyna', lastName: 'Bargielska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Barbara', lastName: 'Roczeń', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'ALUMNI' as const, graduationYear: 1995 },
        { firstName: 'Małgorzata', lastName: 'Biela', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'ALUMNI' as const, graduationYear: 2001 },
        { firstName: 'Renata', lastName: 'Olszewska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'ALUMNI' as const, graduationYear: 1987 },
        { firstName: 'Jadwiga', lastName: 'Macioszek', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'ALUMNI' as const, graduationYear: 1987 },
        { firstName: 'Beata', lastName: 'Klimek', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        // Podnoszenie ciężarów
        { firstName: 'Weronika', lastName: 'Zielińska-Stubińska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Mirosław', lastName: 'Dobosz', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Maria', lastName: 'Połka', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Zuzanna', lastName: 'Połka', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Wiktoria', lastName: 'Gierczuk', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Julia', lastName: 'Machniewska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Dominika', lastName: 'Lewkowicz', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Michał', lastName: 'Kościuk', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Damian', lastName: 'Niedźwiecki', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Patryk', lastName: 'Burda', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Maciej', lastName: 'Juchimiuk', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Sebastian', lastName: 'Orzeł', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        // Pływanie
        { firstName: 'Nikodem', lastName: 'Naróg', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Michał', lastName: 'Terlecki', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Gabriela', lastName: 'Iżewska', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Maksymilian', lastName: 'Mich', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Oliwia', lastName: 'Silipicka', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Michalina', lastName: 'Kieruczenko', gender: 'FEMALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Mikołaj', lastName: 'Cuch', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Tymon', lastName: 'Witkowski', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
        { firstName: 'Maciej', lastName: 'Zieliński', gender: 'MALE' as const, faculty: 'Wydział Wychowania Fizycznego', userStatus: 'STUDENT' as const },
    ];

    const athletes: Record<string, any> = {};
    let sid = 1;
    for (const a of athleteData) {
        const email = mkEmail(a.firstName, a.lastName);
        const user = await prisma.user.create({
            data: {
                email, password: pw, role: 'ATHLETE',
                firstName: a.firstName, lastName: a.lastName, gender: a.gender,
                faculty: a.faculty, userStatus: a.userStatus,
                studentId: a.userStatus === 'STUDENT' ? `S${String(sid++).padStart(3, '0')}` : undefined,
                graduationYear: (a as any).graduationYear,
            },
        });
        athletes[`${a.firstName} ${a.lastName}`] = user;
    }
    console.log(`✅ Created ${athleteData.length} athletes`);

    // ==================== HELPER ====================
    const formatValue = (value: number, unit: string, customLabel?: string | null): string => {
        switch (unit) {
            case 'SECONDS':
                if (value >= 60) { const m = Math.floor(value / 60); const s = (value % 60).toFixed(2); return `${m}:${s.padStart(5, '0')}`; }
                return `${value.toFixed(2)}s`;
            case 'METERS': return `${value.toFixed(2)} m`;
            case 'CENTIMETERS': return `${value.toFixed(1)} cm`;
            case 'KILOGRAMS': return `${value.toFixed(0)} kg`;
            case 'POINTS': return `${Math.round(value)} pkt`;
            case 'REPETITIONS': return `${Math.round(value)} powt.`;
            default: return `${value}`;
        }
    };

    const addResult = async (name: string, discName: string, value: number, date: string, opts: any = {}) => {
        const user = athletes[name];
        const discipline = disc[discName];
        if (!user) { console.warn(`⚠️ Athlete not found: ${name}`); return; }
        if (!discipline) { console.warn(`⚠️ Discipline not found: ${discName}`); return; }
        const displayValue = opts.displayValue || formatValue(value, discipline.measurementUnit, discipline.customUnitLabel);
        await prisma.result.create({
            data: {
                userId: user.id, disciplineId: discipline.id,
                value, date: new Date(date),
                location: opts.location || 'AWF Biała Podlaska',
                competition: opts.competition,
                isOfficial: opts.isOfficial ?? true,
                source: opts.source || 'HISTORICAL',
                displayValue,
            },
        });
    };

    // Helper for time strings like "9:27.42" → seconds
    const minSec = (m: number, s: number) => m * 60 + s;

    console.log('📊 Inserting real results...');

    // ==================== LEKKOATLETYKA ====================

    // Piotr Tarkowski - Skok w dal
    await addResult('Piotr Tarkowski', 'Skok w dal', 7.80, '2018-06-15', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 7.73, '2019-06-10', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 7.68, '2020-06-15', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 8.01, '2022-06-10', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 8.03, '2022-07-15', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 7.75, '2024-06-15', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 7.87, '2025-03-15', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Skok w dal', 8.04, '2025-06-14', { competition: 'Zawody AZS', displayValue: '8,04 m' });
    // Piotr Tarkowski - Biegi
    await addResult('Piotr Tarkowski', 'Bieg na 100 m', 10.75, '2019-05-29', { competition: 'Zawody AZS' });
    await addResult('Piotr Tarkowski', 'Bieg na 60 m', 6.78, '2020-02-02', { competition: 'Halowe Mistrzostwa' });

    // Klaudia Osipiuk
    await addResult('Klaudia Osipiuk', 'Bieg na 100 m', 12.16, '2025-06-14', { competition: 'Zawody AZS' });
    await addResult('Klaudia Osipiuk', 'Bieg na 200 m', 24.06, '2025-06-14', { competition: 'Zawody AZS' });

    // Paulina Korolczuk
    await addResult('Paulina Korolczuk', 'Skok wzwyż', 1.54, '2025-06-14', { competition: 'Zawody AZS' });

    // Aleksandra Kupińska
    await addResult('Aleksandra Kupińska', 'Skok w dal', 5.25, '2025-06-14', { competition: 'Zawody AZS' });
    await addResult('Aleksandra Kupińska', 'Trójskok', 10.64, '2025-06-14', { competition: 'Zawody AZS' });

    // Gabriela Niczyporuk
    await addResult('Gabriela Niczyporuk', 'Rzut dyskiem', 38.16, '2025-06-14', { competition: 'Zawody AZS' });

    // Wiktor Sikora
    await addResult('Wiktor Sikora', 'Rzut dyskiem', 44.05, '2025-06-14', { competition: 'Zawody AZS' });

    // Karol Kondraciuk
    await addResult('Karol Kondraciuk', 'Trójskok', 15.60, '2004-05-29', { competition: 'Akademickie MP' });

    // Bartłomiej Bedeniczuk
    await addResult('Bartłomiej Bedeniczuk', 'Skok wzwyż', 2.08, '2019-05-29', { competition: 'Akademickie MP' });

    // Sztafeta 4x100 m kobiet (zapisana pod Aleksandrą Denkiewicz jako reprezentantką)
    await addResult('Aleksandra Denkiewicz', 'Bieg sztafetowy 4x100 m', 49.79, '2019-05-29', { competition: 'Akademickie MP', displayValue: '49,79 s (Denkiewicz, M. Stypułkowska, A. Stypułkowska, Bargielska)' });

    // Karol Musiej
    await addResult('Karol Musiej', 'Bieg na 100 m', 10.86, '2019-05-29', { competition: 'Akademickie MP' });

    // Bartosz Litwinek
    await addResult('Bartosz Litwinek', 'Bieg na 100 m', 11.19, '2019-05-29', { competition: 'Akademickie MP' });
    await addResult('Bartosz Litwinek', 'Bieg na 200 m', 22.39, '2019-05-29', { competition: 'Akademickie MP' });

    // Aleksandra Denkiewicz
    await addResult('Aleksandra Denkiewicz', 'Bieg na 200 m', 12.96, '2019-05-29', { competition: 'Akademickie MP' });

    // Aleksandra Kapuśniak
    await addResult('Aleksandra Kapuśniak', 'Bieg na 400 m', 62.36, '2019-05-29', { competition: 'Akademickie MP' });

    // Jacek Gryta
    await addResult('Jacek Gryta', 'Bieg na 100 m', 11.51, '2019-05-29', { competition: 'Akademickie MP' });

    // Jakub Żukowski
    await addResult('Jakub Żukowski', 'Bieg na 100 m', 11.79, '2019-05-29', { competition: 'Akademickie MP' });

    // Monika Stypułkowska
    await addResult('Monika Stypułkowska', 'Bieg na 100 m ppł', 15.13, '2019-05-29', { competition: 'Akademickie MP' });
    await addResult('Monika Stypułkowska', 'Skok w dal', 5.42, '2019-05-29', { competition: 'Akademickie MP' });

    // Agata Stypułkowska
    await addResult('Agata Stypułkowska', 'Skok w dal', 5.49, '2019-05-29', { competition: 'Akademickie MP' });

    // Katarzyna Bargielska
    await addResult('Katarzyna Bargielska', 'Skok w dal', 5.78, '2019-05-29', { competition: 'Akademickie MP' });
    await addResult('Katarzyna Bargielska', 'Trójskok', 11.85, '2019-05-29', { competition: 'Akademickie MP' });

    // Bieg na 3000 m - kobiety historyczne
    await addResult('Barbara Roczeń', 'Bieg na 3000 m', minSec(9, 27.42), '1991-08-11', { competition: 'Zawody' });
    await addResult('Małgorzata Biela', 'Bieg na 3000 m', minSec(9, 35.30), '1997-05-23', { competition: 'Zawody' });
    await addResult('Renata Olszewska', 'Bieg na 3000 m', minSec(10, 27.0), '1983-06-05', { competition: 'Zawody' });
    await addResult('Jadwiga Macioszek', 'Bieg na 3000 m', minSec(10, 38.2), '1983-06-05', { competition: 'Zawody' });
    await addResult('Beata Klimek', 'Bieg na 3000 m', minSec(10, 26.42), '2021-05-08', { competition: 'Zawody' });

    console.log('✅ Lekkoatletyka done');

    // ==================== PODNOSZENIE CIĘŻARÓW ====================

    // Weronika Zielińska-Stubińska
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 216, '2021-06-15', { competition: 'Mistrzostwa Polski', displayValue: '216 kg (kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 225, '2022-03-15', { competition: 'Mistrzostwa Polski', displayValue: '225 kg (kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 229, '2022-06-18', { competition: 'Akademickie MP', displayValue: '229 kg (101+128, kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 219, '2023-03-15', { competition: 'Mistrzostwa Polski', displayValue: '219 kg (kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 237, '2023-10-15', { competition: 'Mistrzostwa Świata', displayValue: '237 kg (107+130, kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 235, '2024-02-18', { competition: 'Mistrzostwa Polski', displayValue: '235 kg (103+132, kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 232, '2024-06-15', { competition: 'Zawody', displayValue: '232 kg (102+130, kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 237, '2025-03-15', { competition: 'Zawody', displayValue: '237 kg (105+132, kat. 81 kg)' });
    await addResult('Weronika Zielińska-Stubińska', 'Dwubój (podnoszenie ciężarów)', 244, '2025-12-15', { competition: 'Sezon 2025/2026', displayValue: '244 kg (110+134, kat. 81 kg)' });

    // Mirosław Dobosz
    await addResult('Mirosław Dobosz', 'Dwubój (podnoszenie ciężarów)', 277, '2022-06-18', { competition: 'Akademickie MP', displayValue: '277 kg (kat. 89 kg)' });
    await addResult('Mirosław Dobosz', 'Dwubój (podnoszenie ciężarów)', 298, '2025-12-15', { competition: 'Sezon 2025/2026', displayValue: '298 kg' });

    // Kadra sekcji 2025/2026
    await addResult('Maria Połka', 'Dwubój (podnoszenie ciężarów)', 194, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Zuzanna Połka', 'Dwubój (podnoszenie ciężarów)', 183, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Wiktoria Gierczuk', 'Dwubój (podnoszenie ciężarów)', 198, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Julia Machniewska', 'Dwubój (podnoszenie ciężarów)', 202, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Dominika Lewkowicz', 'Dwubój (podnoszenie ciężarów)', 180, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Michał Kościuk', 'Dwubój (podnoszenie ciężarów)', 314, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Damian Niedźwiecki', 'Dwubój (podnoszenie ciężarów)', 325, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Patryk Burda', 'Dwubój (podnoszenie ciężarów)', 281, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Maciej Juchimiuk', 'Dwubój (podnoszenie ciężarów)', 329, '2025-12-15', { competition: 'Sezon 2025/2026' });
    await addResult('Sebastian Orzeł', 'Dwubój (podnoszenie ciężarów)', 315, '2025-12-15', { competition: 'Sezon 2025/2026' });

    console.log('✅ Podnoszenie ciężarów done');

    // ==================== PŁYWANIE ====================

    // Nikodem Naróg
    await addResult('Nikodem Naróg', 'Pływanie 50 m st. motylkowym', 23.51, '2025-04-15', { competition: 'Zawody pływackie' });
    await addResult('Nikodem Naróg', 'Pływanie 50 m st. motylkowym', 24.32, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Nikodem Naróg', 'Pływanie 50 m st. motylkowym', 24.55, '2025-05-16', { competition: 'Zawody pływackie' });
    await addResult('Nikodem Naróg', 'Pływanie 100 m st. motylkowym', 53.82, '2025-04-15', { competition: 'Zawody pływackie' });
    await addResult('Nikodem Naróg', 'Pływanie 100 m st. motylkowym', 55.82, '2025-05-15', { competition: 'Zawody pływackie' });

    // Michał Terlecki
    await addResult('Michał Terlecki', 'Pływanie 100 m st. zmiennym', 58.54, '2025-04-15', { competition: 'Zawody pływackie' });
    await addResult('Michał Terlecki', 'Pływanie 50 m st. dowolnym', 25.06, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Michał Terlecki', 'Pływanie 100 m st. motylkowym', 59.87, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Michał Terlecki', 'Pływanie 50 m st. klasycznym', 30.36, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Michał Terlecki', 'Pływanie 50 m st. motylkowym', 26.68, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Michał Terlecki', 'Pływanie 100 m st. klasycznym', 69.62, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:09,62' });

    // Gabriela Iżewska
    await addResult('Gabriela Iżewska', 'Pływanie 100 m st. dowolnym', 60.73, '2025-04-15', { competition: 'Zawody pływackie', displayValue: '1:00,73' });
    await addResult('Gabriela Iżewska', 'Pływanie 100 m st. dowolnym', 62.62, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:02,62' });
    await addResult('Gabriela Iżewska', 'Pływanie 100 m st. zmiennym', 69.42, '2025-04-15', { competition: 'Zawody pływackie', displayValue: '1:09,42' });
    await addResult('Gabriela Iżewska', 'Pływanie 50 m st. dowolnym', 28.67, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Gabriela Iżewska', 'Pływanie 50 m st. motylkowym', 30.54, '2025-05-15', { competition: 'Zawody pływackie' });

    // Maksymilian Mich
    await addResult('Maksymilian Mich', 'Pływanie 50 m st. dowolnym', 23.07, '2025-05-15', { competition: 'Zawody pływackie' });

    // Oliwia Silipicka
    await addResult('Oliwia Silipicka', 'Pływanie 50 m st. dowolnym', 27.82, '2025-04-15', { competition: 'Zawody pływackie' });
    await addResult('Oliwia Silipicka', 'Pływanie 50 m st. motylkowym', 30.20, '2025-04-15', { competition: 'Zawody pływackie' });

    // Michalina Kieruczenko (maj 2025)
    await addResult('Michalina Kieruczenko', 'Pływanie 50 m st. dowolnym', 29.12, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Michalina Kieruczenko', 'Pływanie 100 m st. dowolnym', 63.95, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:03,95' });
    await addResult('Michalina Kieruczenko', 'Pływanie 200 m st. dowolnym', 146.74, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '2:26,74' });
    await addResult('Michalina Kieruczenko', 'Pływanie 50 m st. grzbietowym', 35.43, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Michalina Kieruczenko', 'Pływanie 100 m st. grzbietowym', 76.76, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:16,76' });
    await addResult('Michalina Kieruczenko', 'Pływanie 50 m st. motylkowym', 31.48, '2025-05-15', { competition: 'Zawody pływackie' });

    // Mikołaj Cuch
    await addResult('Mikołaj Cuch', 'Pływanie 100 m st. klasycznym', 92.73, '2022-11-20', { competition: 'Zawody pływackie', displayValue: '1:32,73' });
    await addResult('Mikołaj Cuch', 'Pływanie 100 m st. klasycznym', 80.08, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:20,08' });
    await addResult('Mikołaj Cuch', 'Pływanie 50 m st. klasycznym', 36.24, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Mikołaj Cuch', 'Pływanie 200 m st. klasycznym', 176.74, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '2:56,74' });
    await addResult('Mikołaj Cuch', 'Pływanie 50 m st. dowolnym', 27.86, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Mikołaj Cuch', 'Pływanie 200 m st. dowolnym', 143.58, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '2:23,58' });
    await addResult('Mikołaj Cuch', 'Pływanie 50 m st. motylkowym', 31.48, '2025-05-15', { competition: 'Zawody pływackie' });

    // Tymon Witkowski (maj 2025)
    await addResult('Tymon Witkowski', 'Pływanie 50 m st. klasycznym', 33.51, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Tymon Witkowski', 'Pływanie 100 m st. klasycznym', 74.02, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:14,02' });
    await addResult('Tymon Witkowski', 'Pływanie 200 m st. klasycznym', 164.22, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '2:44,22' });
    await addResult('Tymon Witkowski', 'Pływanie 200 m st. zmiennym', 155.10, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '2:35,10' });
    await addResult('Tymon Witkowski', 'Pływanie 400 m st. zmiennym', 335.05, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '5:35,05' });
    await addResult('Tymon Witkowski', 'Pływanie 100 m st. motylkowym', 69.36, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:09,36' });

    // Maciej Zieliński (maj 2025) - pływanie
    await addResult('Maciej Zieliński', 'Pływanie 50 m st. klasycznym', 34.19, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Maciej Zieliński', 'Pływanie 100 m st. klasycznym', 76.00, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:16,00' });
    await addResult('Maciej Zieliński', 'Pływanie 200 m st. klasycznym', 167.54, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '2:47,54' });
    await addResult('Maciej Zieliński', 'Pływanie 50 m st. grzbietowym', 32.20, '2025-05-15', { competition: 'Zawody pływackie' });
    await addResult('Maciej Zieliński', 'Pływanie 100 m st. motylkowym', 72.34, '2025-05-15', { competition: 'Zawody pływackie', displayValue: '1:12,34' });
    await addResult('Maciej Zieliński', 'Pływanie 50 m st. motylkowym', 29.22, '2025-05-15', { competition: 'Zawody pływackie' });

    console.log('✅ Pływanie done');

    // ==================== AUTO-CREATE RECORDS ====================
    console.log('🏆 Auto-detecting records...');

    // Get all disciplines
    const allDiscs = await prisma.sportDiscipline.findMany();

    let recordCount = 0;
    for (const discipline of allDiscs) {
        // For each gender, find the best result
        for (const gender of ['MALE', 'FEMALE'] as const) {
            const results = await prisma.result.findMany({
                where: {
                    disciplineId: discipline.id,
                    isDeleted: false,
                    user: { gender },
                },
                include: { user: true },
                orderBy: { value: discipline.recordDirection === 'HIGHER_IS_BETTER' ? 'desc' : 'asc' },
                take: 1,
            });

            if (results.length === 0) continue;

            const best = results[0];

            // Create a VERIFIED university record
            await prisma.record.create({
                data: {
                    resultId: best.id,
                    disciplineId: discipline.id,
                    recordType: 'UNIVERSITY',
                    gender,
                    status: 'VERIFIED',
                    isCurrentRecord: true,
                    verifiedById: admin.id,
                    verifiedAt: new Date(),
                    verificationComment: 'Rekord zweryfikowany automatycznie z danych historycznych',
                },
            });
            recordCount++;
        }
    }

    console.log(`✅ Created ${recordCount} university records`);

    // Count total results
    const totalResults = await prisma.result.count();
    console.log(`\n🎉 Seeding complete! Total results: ${totalResults}, Records: ${recordCount}`);
    console.log('📧 Admin login: admin@awf.edu.pl / Admin123!');
    console.log('📧 Athletes login: [imie].[nazwisko]@student.awf.edu.pl / Athlete123!');
}

main()
    .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
