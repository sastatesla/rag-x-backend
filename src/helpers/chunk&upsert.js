import { PrismaClient } from '@prisma/client'
import { Pinecone } from '@pinecone-database/pinecone'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME)

export async function chunkShorts(shorts) {
  const chunkText = `Short Video: ${shorts.title || 'N/A'}. Video ID: ${shorts.videoId || 'N/A'}. Hindi Script: ${shorts.scriptHindi || 'N/A'}. English Script: ${shorts.scriptEnglish || 'N/A'}. Google Drive: ${shorts.googleDriveLink || 'N/A'}`;
  return {
    id: `shorts_${shorts.id}`,
    pageContent: chunkText, 
    metadata: {
      chunk_text: chunkText,
      type: 'shorts',
      mongo_id: shorts.id,
    }
  };
}

export async function chunkProducts(products) {
  const chunkText = `Product: ${products.productName || 'N/A'}. SKU: ${products.skuId || 'N/A'}. Category: ${products.category || 'N/A'}. MRP: ${products.mrp || 'N/A'}. Price: ${products.price}. GST: ${products.gstPercentage || 'N/A'}%. MOQ: ${products.moq}. Description: ${products.description || 'N/A'}`;
  return {
    id: `products_${products.id}`,
    pageContent: chunkText, 
    metadata: {
      chunk_text: chunkText,
      type: 'products',
      mongo_id: products.id,
    }
  };
}

