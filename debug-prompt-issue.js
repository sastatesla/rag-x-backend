import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { getRetriever } from "./src/utils/pc.retriever.js";
import { getGeminiLLM } from "./src/utils/gemini.js";
import dotenv from "dotenv";

dotenv.config();

async function debugPromptIssue() {
  console.log("🔍 Testing RAG with custom prompt...");
  
  try {
    // Get components
    const retriever = await getRetriever();
    const llm = await getGeminiLLM();
    
    // Test with custom prompt template
    const customPrompt = PromptTemplate.fromTemplate(`
Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context:
{context}

Question: {question}

Helpful Answer:`);
    
    // Create chain with custom prompt
    const chain = RetrievalQAChain.fromLLM(
      llm,
      retriever,
      {
        prompt: customPrompt,
        returnSourceDocuments: true
      }
    );
    
    const testQuery = "How many orders are processing?";
    console.log(`\n📝 Testing query: "${testQuery}"`);
    
    const response = await chain.call({ query: testQuery });
    
    console.log("\n💬 RAG Response:");
    console.log(response.text);
    
    if (response.sourceDocuments) {
      console.log(`\n📄 Source documents used: ${response.sourceDocuments.length}`);
      response.sourceDocuments.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.pageContent || doc.metadata.chunk_text}`);
      });
    }
    
    // Test direct LLM with manual context
    console.log("\n🧪 Testing direct LLM with manual context...");
    const docs = await retriever.getRelevantDocuments(testQuery);
    const contextText = docs.map(doc => doc.pageContent || doc.metadata.chunk_text).join('\n\n');
    
    const manualPrompt = `Based on the following order data, answer the question:

Order Data:
${contextText}

Question: How many orders are currently processing?
Answer:`;

    const directResponse = await llm.invoke(manualPrompt);
    console.log("\n🎯 Direct LLM Response:");
    console.log(directResponse.content);
    
  } catch (error) {
    console.error("❌ Error testing prompt issue:", error);
  }
}

debugPromptIssue();