import { RetrievalQAChain } from "langchain/chains/retrieval_qa";
import ConversationSummaryMemory from "../utils/memory.js";
import {getGroqLlamaLLM} from "../utils/llm.js";
import LocalLLMManager, { getBestAvailableLLM } from "../utils/localLLM.js";
import {getRetriever} from "../utils/pc.retriever.js";

class RagChat {
  constructor() {
    this.llm = null; // Will be initialized dynamically
    this.memory = ConversationSummaryMemory;
    this.localLLMManager = LocalLLMManager;
  }

  async initializeLLM() {
    if (!this.llm) {
      try {
        this.llm = await getBestAvailableLLM();
        console.log("[RagChat] LLM initialized successfully");
      } catch (error) {
        console.error("[RagChat] Failed to initialize LLM:", error.message);
        // Fallback to Groq
        this.llm = getGroqLlamaLLM();
        console.log("[RagChat] Using Groq fallback");
      }
    }
    return this.llm;
  }

  async getRetriever() {
    return await getRetriever();
  }

  async ask(message) {
    // Ensure LLM is initialized
    const llm = await this.initializeLLM();
    
    const retriever = await this.getRetriever();
    const chain = RetrievalQAChain.fromLLM(
      llm,
      retriever,
      { memory: this.memory }
    );
    const response = await chain.call({ question: message });
    return response.text;
  }

  async switchModel(modelName) {
    try {
      this.llm = await this.localLLMManager.switchModel(modelName);
      console.log(`[RagChat] Switched to model: ${modelName}`);
      return true;
    } catch (error) {
      console.error(`[RagChat] Failed to switch model: ${error.message}`);
      return false;
    }
  }

  async getAvailableModels() {
    return await this.localLLMManager.getAvailableModels();
  }

  async getLLMStatus() {
    const isLocalAvailable = await this.localLLMManager.isLocalLLMAvailable();
    const models = await this.getAvailableModels();
    
    return {
      localLLMAvailable: isLocalAvailable,
      currentModel: this.localLLMManager.config.localModel,
      availableModels: models,
      fallbackEnabled: this.localLLMManager.config.useGroqFallback
    };
  }
}

export default new RagChat();