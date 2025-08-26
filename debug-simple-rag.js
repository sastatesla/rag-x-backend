import { getRetriever } from "./src/utils/pc.retriever.js";
import { getGeminiLLM } from "./src/utils/gemini.js";
import dotenv from "dotenv";

dotenv.config();

async function debugSimpleRAG() {
  console.log("🔍 Testing simple RAG implementation...");
  
  try {
    const retriever = await getRetriever();
    const llm = await getGeminiLLM();
    
    const testQuery = "How many orders are processing?";
    console.log(`\n📝 Testing query: "${testQuery}"`);
    
    // Get relevant documents
    const docs = await retriever.getRelevantDocuments(testQuery);
    console.log(`📊 Found ${docs.length} relevant documents`);
    
    // Create context from documents
    const context = docs.map((doc, index) => {
      // Check both pageContent and metadata.chunk_text
      const content = doc.pageContent || doc.metadata?.chunk_text || JSON.stringify(doc);
      console.log(`Document ${index + 1} content: "${content}"`);
      return content;
    }).join('\n\n');
    
    console.log("\n📄 Combined Context:");
    console.log(context);
    
    // Simple prompt with explicit instruction
    const simplePrompt = `You are a helpful assistant. Based ONLY on the following order information, answer the question.

Order Information:
${context}

Question: ${testQuery}

Answer based ONLY on the order information provided above:`;

    console.log("\n🤖 Testing with simple prompt...");
    const response = await llm.invoke(simplePrompt);
    console.log("\n💬 Simple RAG Response:");
    console.log(response.content);
    
  } catch (error) {
    console.error("❌ Error testing simple RAG:", error);
  }
}

debugSimpleRAG();