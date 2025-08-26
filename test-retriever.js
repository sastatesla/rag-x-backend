import dotenv from 'dotenv';
import { getRetriever } from './src/utils/pc.retriever.js';

dotenv.config();

async function testRetriever() {
  try {
    console.log('Testing retriever...');
    
    const retriever = await getRetriever();
    console.log('Retriever created:', typeof retriever);
    console.log('Retriever methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(retriever)));
    
    if (retriever.getRelevantDocuments) {
      console.log('getRelevantDocuments method exists');
      
      // Test with a simple query
      const docs = await retriever.getRelevantDocuments('order');
      console.log('Retrieved documents:', docs.length);
      
      if (docs.length > 0) {
        console.log('Sample document:', docs[0].pageContent.substring(0, 100));
      }
    } else {
      console.log('getRelevantDocuments method does NOT exist');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRetriever();