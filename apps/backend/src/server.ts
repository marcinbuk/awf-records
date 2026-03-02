import 'dotenv/config';
import app from './app';
import { prisma } from './lib/prisma';
import fs from 'fs';
import path from 'path';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📁 Uploads at ${path.resolve(uploadDir)}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
