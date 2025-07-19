import { PrismaClient } from '@prisma/client';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from 'dotenv';
import pinecone from '../configs/pinecone.js';
import { chunkCategory, chunkCustomer, chunkOrder, chunkProduct, chunkStore } from '../helpers/chunk&upsert.js';
import eventEmitter from './logging.js';
dotenv.config();

const prisma = new PrismaClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
const embedder = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY,maxConcurrency: 2 });

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
  // Orders
  const orders = await prisma.order.findMany();
  for (const o of orders) {
    const chunk = await chunkOrder(o);
    await embedAndUpsert(chunk);
  }

  // Products
  const products = await prisma.storeProduct.findMany();
  for (const p of products) {
    const chunk = await chunkProduct(p);
    await embedAndUpsert(chunk);
  }

  // Customers
  const customers = await prisma.customer.findMany();
  for (const c of customers) {
    const chunk = await chunkCustomer(c);
    await embedAndUpsert(chunk);
  }

  // Stores
  const stores = await prisma.store.findMany();
  for (const s of stores) {
    const chunk = await chunkStore(s);
    await embedAndUpsert(chunk);
  }

  // Categories
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    const chunk = await chunkCategory(c);
    await embedAndUpsert(chunk);
  }

  eventEmitter.emit('logging',`All chunks embedded and upserted to Pinecone!`);
}
upsertAllChunks()
  .catch((err) => {
    eventEmitter.emit('logging', `Error during upsertAllChunks: ${err.message || err}`);
  })
  .finally(() => prisma.$disconnect());
