import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

export async function createVideoVerification(data: {
    resultId: string; videoUrl: string; fileName: string; fileSize: number;
    mimeType?: string; uploadedById: string; thumbnailUrl?: string; duration?: number;
}) {
    return prisma.videoVerification.create({
        data: { ...data, status: 'UPLOADED' },
        include: { result: { include: { user: { select: { firstName: true, lastName: true } }, discipline: true } } },
    });
}

export async function getVideoById(id: string) {
    const video = await prisma.videoVerification.findUnique({
        where: { id },
        include: {
            result: { include: { user: { select: { firstName: true, lastName: true } }, discipline: true } },
            uploadedBy: { select: { firstName: true, lastName: true } },
            reviewedBy: { select: { firstName: true, lastName: true } },
        },
    });
    if (!video) throw new AppError('Wideo nie znalezione', 404);
    return video;
}

export async function getVideos(params: { resultId?: string; status?: string; page?: number; limit?: number; }) {
    const { page = 1, limit = 20 } = params;
    const where: any = {};
    if (params.resultId) where.resultId = params.resultId;
    if (params.status) where.status = params.status;

    const [data, total] = await Promise.all([
        prisma.videoVerification.findMany({
            where,
            include: { result: { include: { user: { select: { firstName: true, lastName: true } }, discipline: true } }, uploadedBy: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
        }),
        prisma.videoVerification.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function reviewVideo(id: string, status: 'VERIFIED' | 'REJECTED', reviewedById: string, comment?: string) {
    const video = await prisma.videoVerification.findUnique({ where: { id } });
    if (!video) throw new AppError('Wideo nie znalezione', 404);
    return prisma.videoVerification.update({ where: { id }, data: { status, reviewerComment: comment, reviewedById, reviewedAt: new Date() } });
}

export async function deleteVideo(id: string) {
    const video = await prisma.videoVerification.findUnique({ where: { id } });
    if (!video) throw new AppError('Wideo nie znalezione', 404);

    const filePath = path.resolve(video.videoUrl.replace('/uploads/', './uploads/'));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return prisma.videoVerification.delete({ where: { id } });
}
