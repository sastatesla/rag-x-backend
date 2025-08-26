import { getRetriever } from "./src/utils/pc.retriever.js";
import dotenv from "dotenv";

dotenv.config();

async function debugRetriever() {
  console.log("🔍 Testing RAG retriever...");
  
  try {
    const retriever = await getRetriever();
    console.log("✅ Retriever initialized successfully");
    
    // Test with simple query
    const testQueries = [
      "What orders do we have?",
      "Show me order information",
      "How many orders are there?",
      "business analytics",
      "order status"
    ];
    
    for (const query of testQueries) {
      console.log(`\n📝 Testing query: "${query}"`);
      
      const docs = await retriever.getRelevantDocuments(query);
      console.log(`📊 Found ${docs.length} relevant documents`);
      
      if (docs.length > 0) {
        docs.forEach((doc, index) => {
          console.log(`\n📄 Document ${index + 1}:`);
          console.log(`Score: ${doc.metadata?.score || 'N/A'}`);
          console.log(`Content preview: ${doc.pageContent.substring(0, 200)}...`);
          console.log(`Metadata:`, JSON.stringify(doc.metadata, null, 2));
        });
      } else {
        console.log("❌ No documents found for this query");
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing retriever:", error);
  }
}

debugRetriever();