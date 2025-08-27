import ConversationSummaryMemory from "../utils/memory.js";
import {getGroqLlamaLLM} from "../utils/llm.js";
import LocalLLMManager from "../utils/localLLM.js";
import {getRetriever} from "../utils/pc.retriever.js";
import GeminiManager, { isGeminiAvailable } from "../utils/gemini.js";

class RagChat {
  constructor() {
    this.llm = null;
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
    let message, userId, sessionId, context, userRole, isAdmin;
    
    if (typeof params === 'string') {
      message = params;
      userRole = 'user';
      isAdmin = false;
    } else {
      ({ message, userId, sessionId, context, userRole, isAdmin } = params);
    }

    const llm = await this.initializeLLM();
    
    const retriever = await this.getRetriever();
    
    const relevantDocs = await retriever.getRelevantDocuments(message);
    
    const retrievedContext = relevantDocs.map((doc, index) => {
      const content = doc.pageContent || doc.metadata?.chunk_text || '';
      return content;
    }).join('\n\n');
    
    const enhancedPrompt = this.buildRAGPrompt(message, userRole, context, retrievedContext);
    
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
  : `You are acting as an agricultural machinery and equipment specialist assistant for farmers and technicians in India. Your expertise includes:

- Agricultural machinery (tractors, harvesters, plows, seeders, irrigation systems)
- Spare parts identification and compatibility
- Troubleshooting mechanical and operational issues
- Maintenance schedules and best practices
- Video tutorials and step-by-step repair guides
- Equipment specifications and performance optimization
- Cost-effective solutions using Indian Rupees (₹)

When responding:
- Provide practical, hands-on solutions for farmers and technicians
- Reference specific machinery models, part numbers, and technical specifications when available
- Include video links, tutorials, or visual guides when mentioned in the retrieved information
- Suggest preventive maintenance to avoid future problems
- Recommend cost-effective spare parts and where to source them locally
- Use simple, clear language that farmers and field technicians can understand
- Always mention prices in Indian Rupees (₹) format`}

${context ? `Additional Context: ${context}\n` : ''}

User Question: ${message}

Answer based on the retrieved information above. ${userRole !== 'admin' ? 'Focus on providing practical agricultural machinery solutions. If videos or tutorials are available, mention them prominently. Always use ₹ (Indian Rupees) for all monetary values.' : 'Remember to use ₹ (Indian Rupees) for all monetary values:'}`;

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
      return `As an agricultural machinery and equipment specialist, help farmers and technicians with their machinery needs.
      
      Focus on:
      - Agricultural equipment troubleshooting
      - Spare parts identification and sourcing
      - Maintenance and repair guidance
      - Video tutorials and visual guides
      - Cost-effective solutions in Indian market
      
      Context: ${context || 'Agricultural machinery support'}
      
      Farmer/Technician Query: ${message}
      
      Please provide practical, hands-on solutions with specific part numbers, repair steps, and local sourcing options when possible. Include video references if available.`;
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
        type: 'agricultural_support',
        machineryInfo: this.extractMachineryInfo(response),
        videoTutorials: this.extractVideoReferences(response),
        spareParts: this.extractSparePartsInfo(response),
        troubleshootingSteps: this.extractTroubleshootingSteps(response)
      };
    }
  }

  extractInsights(response) {
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
    
    const revenueMatches = response.match(/(₹\d+[,\d]*\.?\d*|rupee[s]?\s*\d+[,\d]*\.?\d*|\$\d+[,\d]*\.?\d*|revenue.*?[\₹\$]?(\d+[,\d]*\.?\d*))/gi);
    if (revenueMatches && revenueMatches.length > 0) {
      let revenueMatch = revenueMatches[0];
      let amount = revenueMatch.match(/\d+[,\d]*\.?\d*/)[0].replace(/\.$/, '');
      
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
    
    const percentageMatches = response.match(/\d+\.?\d*%/g);
    if (percentageMatches && percentageMatches.length > 0) {
      insights.push({ 
        type: 'percentage', 
        value: percentageMatches[0],
        title: 'Growth Rate',
        icon: 'chart'
      });
    }

    return insights.slice(0, 4);
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

  extractMachineryInfo(response) {
    const machineryInfo = [];
    
    // Extract machinery model numbers and specifications
    const modelMatches = response.match(/[A-Z]+[-\s]?\d+[A-Z]*|Model\s+[A-Z0-9\-]+/gi);
    if (modelMatches) {
      modelMatches.forEach(match => {
        machineryInfo.push({
          type: 'model',
          value: match.trim(),
          icon: 'machinery'
        });
      });
    }
    
    // Extract horsepower or capacity specifications
    const specMatches = response.match(/(\d+)\s*(HP|hp|horsepower|kW|kilowatt)/gi);
    if (specMatches && specMatches.length > 0) {
      machineryInfo.push({
        type: 'specification',
        value: specMatches[0],
        icon: 'power'
      });
    }
    
    return machineryInfo.slice(0, 3);
  }

  extractVideoReferences(response) {
    const videos = [];
    
    // Extract video references, URLs, or tutorial mentions
    const videoMatches = response.match(/(video|tutorial|watch|guide|demonstration)[\s\w]*(?:https?:\/\/[^\s]+|[^\s]*\.(?:mp4|youtube|youtu\.be)[^\s]*)/gi);
    if (videoMatches) {
      videoMatches.forEach(match => {
        videos.push({
          type: 'video',
          description: match.trim(),
          icon: 'play'
        });
      });
    }
    
    // Also look for general tutorial mentions
    const tutorialMatches = response.match(/(?:step-by-step|tutorial|video guide|repair video|maintenance video)/gi);
    if (tutorialMatches) {
      tutorialMatches.slice(0, 2).forEach(match => {
        videos.push({
          type: 'tutorial_reference',
          description: match.trim(),
          icon: 'book'
        });
      });
    }
    
    return videos.slice(0, 3);
  }

  extractSparePartsInfo(response) {
    const spareParts = [];
    
    // Extract part numbers
    const partMatches = response.match(/(?:part|Part)\s+(?:number|#|no\.?)\s*:?\s*([A-Z0-9\-]+)/gi);
    if (partMatches) {
      partMatches.forEach(match => {
        const partNumber = match.match(/([A-Z0-9\-]+)$/i);
        if (partNumber) {
          spareParts.push({
            type: 'part_number',
            value: partNumber[1],
            icon: 'component'
          });
        }
      });
    }
    
    // Extract price mentions for spare parts
    const priceMatches = response.match(/(?:costs?|price[sd]?|₹)\s*(\d+[,\d]*\.?\d*)/gi);
    if (priceMatches && priceMatches.length > 0) {
      spareParts.push({
        type: 'price',
        value: `₹${priceMatches[0].match(/\d+[,\d]*\.?\d*/)[0]}`,
        icon: 'rupee'
      });
    }
    
    return spareParts.slice(0, 3);
  }

  extractTroubleshootingSteps(response) {
    const steps = [];
    
    // Extract numbered steps or bullet points
    const stepMatches = response.match(/(?:^|\n)\s*(?:\d+\.|\*|\-)\s*([^\n]+)/gm);
    if (stepMatches) {
      stepMatches.slice(0, 4).forEach((match, index) => {
        const cleanStep = match.replace(/^\s*(?:\d+\.|\*|\-)\s*/, '').trim();
        if (cleanStep.length > 10) { // Only meaningful steps
          steps.push({
            step: index + 1,
            description: cleanStep,
            icon: 'check'
          });
        }
      });
    }
    
    return steps;
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
      uptime: Date.now(), 
      lastCheck: new Date()
    };
  }
}

export default new RagChat();