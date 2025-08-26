import { RetrievalQAChain } from "langchain/chains";
import { getRetriever } from "./src/utils/pc.retriever.js";
import { getGeminiLLM } from "./src/utils/gemini.js";
import dotenv from "dotenv";

dotenv.config();

async function debugFullRAG() {
  console.log("🔍 Testing complete RAG chain...");
  
  try {
    // Get components
    const retriever = await getRetriever();
    const llm = await getGeminiLLM();
    
    console.log("✅ Components initialized successfully");
    
    // Test retrieval first
    const testQuery = "How many orders are processing?";
    console.log(`\n📝 Testing query: "${testQuery}"`);
    
    const docs = await retriever.getRelevantDocuments(testQuery);
    console.log(`📊 Found ${docs.length} relevant documents`);
    
    if (docs.length > 0) {
      console.log("\n📄 Retrieved documents:");
      docs.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.pageContent || doc.metadata.chunk_text}`);
      });
    }
    
    // Test full RAG chain
    console.log("\n🤖 Testing full RAG chain...");
    const chain = RetrievalQAChain.fromLLM(llm, retriever);
    
    const response = await chain.call({ query: testQuery });
    console.log("\n💬 RAG Response:");
    console.log(response.text);
    
    // Test with more specific admin query
    const adminQuery = "As an admin, show me business analytics on order volume and revenue trends";
    console.log(`\n📝 Testing admin query: "${adminQuery}"`);
    
    const adminResponse = await chain.call({ query: adminQuery });
    console.log("\n💼 Admin RAG Response:");
    console.log(adminResponse.text);
    
  } catch (error) {
    console.error("❌ Error testing RAG chain:", error);
  }
}

debugFullRAG();