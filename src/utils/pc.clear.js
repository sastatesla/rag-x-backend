import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import pinecone from '../configs/pinecone.js';
import eventEmitter from './logging.js';

dotenv.config();

const prisma = new PrismaClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function clearPineconeData() {
  try {
    eventEmitter.emit('logging', 'Starting to clear all vectors from Pinecone...');
    
    // Delete all vectors in the namespace (or entire index)
    await pineconeIndex.deleteAll();
    
    eventEmitter.emit('logging', 'Successfully cleared all vectors from Pinecone!');
  } catch (error) {
    eventEmitter.emit('logging', `Error clearing Pinecone data: ${error.message}`);
    throw error;
  }
}

clearPineconeData()
  .catch((err) => {
    eventEmitter.emit('logging', `Error during clearPineconeData: ${err.message || err}`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());