// Custom RAG implementation - removed RetrievalQAChain due to context passing issues
import ConversationSummaryMemory from "../utils/memory.js";
import {getGroqLlamaLLM} from "../utils/llm.js";
import LocalLLMManager from "../utils/localLLM.js";
import {getRetriever} from "../utils/pc.retriever.js";
import GeminiManager, { isGeminiAvailable } from "../utils/gemini.js";

class RagChat {
  constructor() {
    this.llm = null; // Will be initialized dynamically
    this.memory = ConversationSummaryMemory;
    this.localLLMManager = LocalLLMManager;
  }

  async initializeLLM() {
    if (!this.llm) {
      try {
        this.llm = await this.localLLMManager.getBestLLM();
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
    
    // Get relevant documents from vector store
    const relevantDocs = await retriever.getRelevantDocuments(message);
    
    // Build context from retrieved documents
    const retrievedContext = relevantDocs.map((doc, index) => {
      const content = doc.pageContent || doc.metadata?.chunk_text || '';
      return content;
    }).join('\n\n');
    
    // Create role-specific prompt with retrieved context
    const enhancedPrompt = this.buildRAGPrompt(message, userRole, context, retrievedContext);
    
    // Get response from LLM
    const llmResponse = await llm.invoke(enhancedPrompt);
    const responseText = llmResponse.content || llmResponse;
    
    // Format response based on role
    return this.formatResponseForRole(responseText, userRole, sessionId);
  }

  buildRAGPrompt(message, userRole, context, retrievedContext) {
    const basePrompt = `You are a helpful AI assistant. Use the following retrieved information to answer the user's question accurately.

Retrieved Information:
${retrievedContext}

${userRole === 'admin' 
  ? `You are acting as an admin analytics assistant for an Indian e-commerce business. Provide detailed business insights and data analysis based on the retrieved information. Focus on metrics, trends, and actionable recommendations. 

IMPORTANT: Always use Indian Rupees (₹) for all currency amounts, never use dollars ($). Convert any amounts to Indian currency format with ₹ symbol. For example: ₹1,250 instead of $15.` 
  : `You are acting as a customer support assistant for an Indian e-commerce platform. Help the customer with their query using the retrieved information. Use Indian Rupees (₹) for all price mentions.`}

${context ? `Additional Context: ${context}\n` : ''}

User Question: ${message}

Answer based on the retrieved information above. Remember to use ₹ (Indian Rupees) for all monetary values:`;

    return basePrompt;
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
    
    // Look for order counts
    const orderCountMatches = response.match(/(\d+)\s*(orders?|Orders?)/g);
    if (orderCountMatches && orderCountMatches.length > 0) {
      const count = orderCountMatches[0].match(/\d+/)[0];
      insights.push({ 
        type: 'count', 
        value: count, 
        title: 'Total Orders',
        icon: 'chart'
      });
    }
    
    // Look for revenue patterns (₹, rupee, or dollar amounts - convert $ to ₹)
    const revenueMatches = response.match(/(₹\d+[,\d]*\.?\d*|rupee[s]?\s*\d+[,\d]*\.?\d*|\$\d+[,\d]*\.?\d*|revenue.*?[\₹\$]?(\d+[,\d]*\.?\d*))/gi);
    if (revenueMatches && revenueMatches.length > 0) {
      let revenueMatch = revenueMatches[0];
      let amount = revenueMatch.match(/\d+[,\d]*\.?\d*/)[0].replace(/\.$/, '');
      
      // Convert dollar amounts to rupees (approximate 1 USD = 83 INR)
      if (revenueMatch.includes('$')) {
        amount = Math.round(parseFloat(amount.replace(/,/g, '')) * 83).toLocaleString('en-IN');
      }
      
      insights.push({ 
        type: 'currency', 
        value: `₹${amount}`, 
        title: 'Total Revenue',
        icon: 'rupee'
      });
    }
    
    // Look for average patterns
    const averageMatches = response.match(/average.*?[\₹\$]?(\d+[,\d]*\.?\d*)/gi);
    if (averageMatches && averageMatches.length > 0) {
      let avgMatch = averageMatches[0];
      let amount = avgMatch.match(/\d+[,\d]*\.?\d*/)[0].replace(/\.$/, '');
      
      // Convert dollar amounts to rupees if needed
      if (avgMatch.includes('$')) {
        amount = Math.round(parseFloat(amount.replace(/,/g, '')) * 83).toLocaleString('en-IN');
      }
      
      insights.push({ 
        type: 'currency', 
        value: `₹${amount}`, 
        title: 'Average Order Value',
        icon: 'rupee'
      });
    }
    
    // Look for percentage patterns
    const percentageMatches = response.match(/\d+\.?\d*%/g);
    if (percentageMatches && percentageMatches.length > 0) {
      insights.push({ 
        type: 'percentage', 
        value: percentageMatches[0],
        title: 'Growth Rate',
        icon: 'chart'
      });
    }

    return insights.slice(0, 4); // Limit to top 4 insights for better layout
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
    const isGeminiReady = await isGeminiAvailable();
    const models = await this.getAvailableModels();
    
    // Determine current provider based on priority
    let currentProvider = "unknown";
    let currentModel = "unknown";
    
    if (this.localLLMManager.config.useGemini && isGeminiReady) {
      currentProvider = "gemini";
      currentModel = "gemini-1.5-pro"; // Use env variable or default
    } else if (isLocalAvailable) {
      currentProvider = "local";
      currentModel = this.localLLMManager.config.localModel;
    } else if (this.localLLMManager.config.useGroqFallback) {
      currentProvider = "groq";
      currentModel = "llama-3-70b-8192";
    }
    
    return {
      isAvailable: isGeminiReady || isLocalAvailable || this.localLLMManager.config.useGroqFallback,
      currentProvider,
      currentModel,
      model: currentModel, // For backward compatibility
      provider: currentProvider, // For backward compatibility
      
      // Individual provider status
      geminiAvailable: isGeminiReady,
      localLLMAvailable: isLocalAvailable,
      groqAvailable: this.localLLMManager.config.useGroqFallback,
      
      // Configuration
      providers: {
        gemini: {
          enabled: this.localLLMManager.config.useGemini,
          available: isGeminiReady,
          model: "gemini-1.5-pro"
        },
        local: {
          enabled: true,
          available: isLocalAvailable,
          model: this.localLLMManager.config.localModel
        },
        groq: {
          enabled: this.localLLMManager.config.useGroqFallback,
          available: this.localLLMManager.config.useGroqFallback,
          model: "llama-3-70b-8192"
        }
      },
      
      availableModels: models,
      uptime: Date.now(), // Simple uptime indicator
      lastCheck: new Date()
    };
  }
}

export default new RagChat();