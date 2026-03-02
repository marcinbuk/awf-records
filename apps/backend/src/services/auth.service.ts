import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput } from '@awf/shared';

export async function registerUser(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Użytkownik z tym adresem email już istnieje', 409);

    if (data.studentId) {
        const existingStudent = await prisma.user.findUnique({ where: { studentId: data.studentId } });
        if (existingStudent) throw new AppError('Numer albumu jest już zajęty', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            email: data.email, password: hashedPassword,
            firstName: data.firstName, lastName: data.lastName,
            gender: data.gender, dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            studentId: data.studentId, faculty: data.faculty,
            specialization: data.specialization, yearOfStudy: data.yearOfStudy,
            userStatus: data.userStatus || 'STUDENT', graduationYear: data.graduationYear,
            role: 'ATHLETE',
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, userStatus: true, gender: true },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    return { user, accessToken: generateAccessToken(tokenPayload), refreshToken: generateRefreshToken(tokenPayload) };
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError('Nieprawidłowy email lub hasło', 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new AppError('Nieprawidłowy email lub hasło', 401);

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken: generateAccessToken(tokenPayload), refreshToken: generateRefreshToken(tokenPayload) };
}

export async function refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, role: true, isActive: true } });
    if (!user || !user.isActive) throw new AppError('Nieprawidłowy token odświeżania', 401);

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    return { accessToken: generateAccessToken(tokenPayload), refreshToken: generateRefreshToken(tokenPayload) };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            role: true, userStatus: true, studentId: true, faculty: true,
            specialization: true, yearOfStudy: true, graduationYear: true,
            gender: true, dateOfBirth: true, profilePhoto: true,
            isActive: true, createdAt: true,
        },
    });
    if (!user) throw new AppError('Użytkownik nie znaleziony', 404);
    return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Użytkownik nie znaleziony', 404);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError('Aktualne hasło jest nieprawidłowe', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
}
