import { PrismaClient } from '@prisma/client'
import { Pinecone } from '@pinecone-database/pinecone'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME)

export async function chunkOrder(order) {
  const productsSummary = order.products
    .map((p) => `Product ID: ${p.productId}, Qty: ${p.quantity}, Price: ${p.totalPrice}`)
    .join(' | ');
  const chunkText = `Order ${order.orderId} by User ${order.userId}. Status: ${order.status}. Products: ${productsSummary}. Final Bill: ${order.finalBillToPay}`;
  return {
    id: `order_${order.id}`,
    pageContent: chunkText, // Add pageContent for LangChain compatibility
    metadata: {
      chunk_text: chunkText,
      type: 'order',
      mongo_id: order.id,
    }
  };
}

export async function chunkProduct(product) {
  const chunkText = `Product: ${product.product_name}. Brand: ${product.brand_name}. Category: ${product.product_category}. Price: ${product.selling_price}. Description: ${product.description}`;
  return {
    id: `product_${product.id}`,
    pageContent: chunkText, // Add pageContent for LangChain compatibility
    metadata: {
      chunk_text: chunkText,
      type: 'product',
      mongo_id: product.id,
    }
  };
}

export async function chunkCustomer(customer) {
  const chunkText = `Customer: ${customer.name}, Phone: ${customer.phone}, Email: ${customer.email}`;
  return {
    id: `customer_${customer.id}`,
    pageContent: chunkText, // Add pageContent for LangChain compatibility
    metadata: {
      chunk_text: chunkText,
      type: 'customer',
      mongo_id: customer.id,
    }
  };
}

export async function chunkStore(store) {
  const chunkText = `Store: ${store.storeName}. Category: ${store.storeCategory}. Location: ${JSON.stringify(store.location)}. GST: ${store.gstNumber}`;
  return {
    id: `store_${store.id}`,
    pageContent: chunkText, // Add pageContent for LangChain compatibility
    metadata: {
      chunk_text: chunkText,
      type: 'store',
      mongo_id: store.id,
    }
  };
}

export async function chunkCategory(category) {
  const chunkText = `Category: ${category.name}. Store: ${category.storeId}`;
  return {
    id: `category_${category.id}`,
    pageContent: chunkText, // Add pageContent for LangChain compatibility
    metadata: {
      chunk_text: chunkText,
      type: 'category',
      mongo_id: category.id,
    }
  };
}
