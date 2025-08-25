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

  async ask(params) {
    // Handle both legacy string message and new object format
    let message, userId, sessionId, context, userRole, isAdmin;
    
    if (typeof params === 'string') {
      // Legacy format - just message string
      message = params;
      userRole = 'user';
      isAdmin = false;
    } else {
      // New format - object with multiple parameters
      ({ message, userId, sessionId, context, userRole, isAdmin } = params);
    }

    // Ensure LLM is initialized
    const llm = await this.initializeLLM();
    
    const retriever = await this.getRetriever();
    
    // Create role-specific prompt enhancement
    const enhancedMessage = this.enhancePromptForRole(message, userRole, context);
    
    const chain = RetrievalQAChain.fromLLM(
      llm,
      retriever,
      { memory: this.memory }
    );
    
    const response = await chain.call({ question: enhancedMessage });
    
    // Format response based on role
    return this.formatResponseForRole(response.text, userRole, sessionId);
  }

  enhancePromptForRole(message, userRole, context) {
    if (userRole === 'admin') {
      return `As an admin analytics assistant, provide detailed business insights and data analysis. 
      Focus on metrics, trends, and actionable recommendations.
      Context: ${context || 'General business analytics'}
      
      Admin Query: ${message}
      
      Please provide comprehensive analysis with specific numbers, percentages, and recommendations when possible.`;
    } else {
      return `As a helpful e-commerce shopping assistant, help the customer find products and make informed decisions.
      
      Customer Query: ${message}
      
      Please provide product recommendations, comparisons, and helpful shopping advice.`;
    }
  }

  formatResponseForRole(response, userRole, sessionId) {
    const baseResponse = {
      response: response,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    if (userRole === 'admin') {
      return {
        ...baseResponse,
        type: 'admin_analytics',
        insights: this.extractInsights(response),
        actionItems: this.extractActionItems(response)
      };
    } else {
      return {
        ...baseResponse,
        type: 'customer_support',
        productRecommendations: this.extractProductRecommendations(response)
      };
    }
  }

  extractInsights(response) {
    // Extract key metrics and insights from admin response
    const insights = [];
    
    // Look for percentage patterns
    const percentageMatches = response.match(/\d+\.?\d*%/g);
    if (percentageMatches) {
      percentageMatches.forEach(match => {
        insights.push({ type: 'percentage', value: match });
      });
    }

    // Look for currency patterns
    const currencyMatches = response.match(/\$\d+,?\d*\.?\d*/g);
    if (currencyMatches) {
      currencyMatches.forEach(match => {
        insights.push({ type: 'currency', value: match });
      });
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  extractActionItems(response) {
    // Extract action items from admin response
    const actionItems = [];
    const sentences = response.split('.');
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('should') || 
          sentence.toLowerCase().includes('recommend') ||
          sentence.toLowerCase().includes('consider')) {
        actionItems.push(sentence.trim());
      }
    });

    return actionItems.slice(0, 3); // Limit to top 3 action items
  }

  extractProductRecommendations(response) {
    // For now, return empty array - this would integrate with product matching logic
    return [];
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