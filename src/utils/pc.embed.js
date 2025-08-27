import { PrismaClient } from '@prisma/client';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from 'dotenv';
import pinecone from '../configs/pinecone.js';
import { chunkShorts, chunkProducts } from '../helpers/chunk&upsert.js';
import eventEmitter from './logging.js';
import { getGeminiEmbeddings } from './gemini.js';
dotenv.config();

const prisma = new PrismaClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Use Gemini embeddings instead of OpenAI
const embedder = getGeminiEmbeddings();

async function embedAndUpsert(chunk) {
  const existing = await pineconeIndex.fetch([chunk.id]);

  if (existing.vectors && Object.keys(existing.vectors).length > 0) {
    console.log(`Updating vector: ${chunk.id}`);
  } else {
    console.log(`Inserting vector: ${chunk.id}`);
  }

  const embedding = await embedder.embedQuery(chunk.metadata.chunk_text);

  await pineconeIndex.upsert([
    {
      id: chunk.id,
      values: embedding,
      metadata: chunk.metadata,
    },
  ]);
}

async function upsertAllChunks() {
  let totalProcessed = 0;
  
  // Shorts
  const shorts = await prisma.shorts.findMany();
  console.log(`Found ${shorts.length} shorts to process`);
  for (const s of shorts) {
    const chunk = await chunkShorts(s);
    await embedAndUpsert(chunk);
    totalProcessed++;
  }

  // Products
  const products = await prisma.products.findMany();
  console.log(`Found ${products.length} products to process`);
  for (const p of products) {
    const chunk = await chunkProducts(p);
    await embedAndUpsert(chunk);
    totalProcessed++;
  }

  eventEmitter.emit('logging',`All ${totalProcessed} chunks embedded and upserted to Pinecone!`);
}
upsertAllChunks()
  .catch((err) => {
    eventEmitter.emit('logging', `Error during upsertAllChunks: ${err.message || err}`);
  })
  .finally(() => prisma.$disconnect());
