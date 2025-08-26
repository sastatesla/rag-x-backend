import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME;

async function recreateIndex() {
  try {
    console.log(`Checking if index "${indexName}" exists...`);
    
    // Check if index exists
    const indexes = await pc.listIndexes();
    const indexExists = indexes.indexes?.some(index => index.name === indexName);
    
    if (indexExists) {
      console.log(`Deleting existing index "${indexName}"...`);
      await pc.deleteIndex(indexName);
      
      // Wait for deletion to complete
      console.log('Waiting for deletion to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    console.log(`Creating new index "${indexName}" with 768 dimensions for Gemini embeddings...`);
    
    await pc.createIndex({
      name: indexName,
      dimension: 768, // Gemini text-embedding-004 dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    
    console.log(`Index "${indexName}" created successfully!`);
    console.log('Waiting for index to be ready...');
    
    // Wait for index to be ready
    let isReady = false;
    while (!isReady) {
      try {
        const indexStats = await pc.index(indexName).describeIndexStats();
        isReady = true;
        console.log('Index is ready for use!');
      } catch (error) {
        console.log('Index not ready yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
  } catch (error) {
    console.error('Error recreating index:', error);
    process.exit(1);
  }
}

recreateIndex();