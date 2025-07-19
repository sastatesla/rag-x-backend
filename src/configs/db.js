import { PrismaClient } from '@prisma/client';
import eventEmitter from '../utils/logging.js';

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    eventEmitter.emit('logging','[Prisma] Connected to the database');
  } catch (error) {
eventEmitter.emit('logging', `[Prisma] Connection failed: ${error.message}`);
  }
})();

export default prisma;
