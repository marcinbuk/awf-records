import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { config } from '../config';

const uploadDir = path.resolve(config.upload.uploadDir);

['videos', 'thumbnails', 'imports', 'photos'].forEach((dir) => {
    const fullPath = path.join(uploadDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

const videoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadDir, 'videos')),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const importStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadDir, 'imports')),
    filename: (_req, file, cb) => cb(null, `import_${Date.now()}${path.extname(file.originalname)}`),
});

const photoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadDir, 'photos')),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

export const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: config.upload.maxVideoSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (config.upload.allowedVideoTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Niedozwolony format pliku. Dozwolone: MP4, MOV, AVI, WebM'));
        }
    },
});

export const uploadCSV = multer({
    storage: importStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.csv', '.xlsx', '.xls'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Dozwolone formaty: CSV, XLSX, XLS'));
        }
    },
});

export const uploadPhoto = multer({
    storage: photoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Dozwolone tylko pliki graficzne'));
        }
    },
});
