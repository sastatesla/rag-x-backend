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
  return {
    id: `order_${order.id}`,
    metadata: {
      chunk_text: `Order ${order.orderId} by User ${order.userId}. Status: ${order.status}. Products: ${productsSummary}. Final Bill: ${order.finalBillToPay}`,
      type: 'order',
      mongo_id: order.id,
    }
  };
}

export async function chunkProduct(product) {
  return {
    id: `product_${product.id}`,
    metadata: {
      chunk_text: `Product: ${product.product_name}. Brand: ${product.brand_name}. Category: ${product.product_category}. Price: ${product.selling_price}. Description: ${product.description}`,
      type: 'product',
      mongo_id: product.id,
    }
  };
}

export async function chunkCustomer(customer) {
  return {
    id: `customer_${customer.id}`,
    metadata: {
      chunk_text: `Customer: ${customer.name}, Phone: ${customer.phone}, Email: ${customer.email}`,
      type: 'customer',
      mongo_id: customer.id,
    }
  };
}

export async function chunkStore(store) {
  return {
    id: `store_${store.id}`,
    metadata: {
      chunk_text: `Store: ${store.storeName}. Category: ${store.storeCategory}. Location: ${JSON.stringify(store.location)}. GST: ${store.gstNumber}`,
      type: 'store',
      mongo_id: store.id,
    }
  };
}

export async function chunkCategory(category) {
  return {
    id: `category_${category.id}`,
    metadata: {
      chunk_text: `Category: ${category.name}. Store: ${category.storeId}`,
      type: 'category',
      mongo_id: category.id,
    }
  };
}
