import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

/**
 * Gemini AI utility for both LLM and embeddings
 * Supports Google's Gemini Pro and embedding models
 */
class GeminiManager {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }

    this.config = {
      // Model configuration
      llmModel: process.env.GEMINI_LLM_MODEL || "gemini-1.5-pro",
      embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
      
      // LLM parameters
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.2,
      maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 4096,
      
      // Safety settings
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    // Initialize Google Generative AI client
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Get Gemini LLM instance for LangChain
   */
  getLLM() {
    return new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      model: this.config.llmModel,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxOutputTokens,
      safetySettings: this.config.safetySettings,
    });
  }

  /**
   * Get Gemini embeddings instance
   */
  getEmbeddings() {
    return new GoogleGenerativeAIEmbeddings({
      apiKey: this.apiKey,
      model: this.config.embeddingModel,
    });
  }

  /**
   * Get direct Gemini model instance for advanced usage
   */
  getModel(modelName = this.config.llmModel) {
    return this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
      },
      safetySettings: this.config.safetySettings,
    });
  }

  /**
   * Test Gemini API availability
   */
  async isAvailable() {
    try {
      const model = this.getModel();
      const result = await model.generateContent("Hello");
      return result && result.response;
    } catch (error) {
      console.error("[Gemini] API test failed:", error.message);
      return false;
    }
  }

  /**
   * Get available models (simplified list)
   */
  getAvailableModels() {
    return [
      {
        name: "gemini-1.5-pro",
        description: "Advanced reasoning, code generation, and multimodal understanding",
        type: "text"
      },
      {
        name: "gemini-1.5-flash", 
        description: "Fast and efficient for routine tasks",
        type: "text"
      },
      {
        name: "text-embedding-004",
        description: "Latest embedding model for semantic search",
        type: "embedding"
      }
    ];
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbeddings(texts) {
    try {
      const embeddings = this.getEmbeddings();
      
      if (Array.isArray(texts)) {
        return await embeddings.embedDocuments(texts);
      } else {
        return await embeddings.embedQuery(texts);
      }
    } catch (error) {
      console.error("[Gemini] Embedding generation failed:", error.message);
      throw error;
    }
  }

  /**
   * Generate text using Gemini
   */
  async generateText(prompt, options = {}) {
    try {
      const model = this.getModel(options.model);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || this.config.temperature,
          maxOutputTokens: options.maxOutputTokens || this.config.maxOutputTokens,
        },
      });

      return result.response.text();
    } catch (error) {
      console.error("[Gemini] Text generation failed:", error.message);
      throw error;
    }
  }

  /**
   * Switch to different model
   */
  switchModel(modelName) {
    this.config.llmModel = modelName;
    console.log(`[Gemini] Switched to model: ${modelName}`);
    return this.getLLM();
  }

  /**
   * Get model status and info
   */
  async getStatus() {
    const isAvailable = await this.isAvailable();
    
    return {
      provider: "gemini",
      isAvailable,
      currentModel: this.config.llmModel,
      embeddingModel: this.config.embeddingModel,
      availableModels: this.getAvailableModels(),
      config: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
      },
    };
  }
}

// Create singleton instance
const geminiInstance = new GeminiManager();

// Export singleton instance
export default geminiInstance;

// Export convenience functions
export function getGeminiLLM() {
  return geminiInstance.getLLM();
}

export function getGeminiEmbeddings() {
  return geminiInstance.getEmbeddings();
}

export async function generateGeminiEmbeddings(texts) {
  return await geminiInstance.generateEmbeddings(texts);
}

export async function generateGeminiText(prompt, options = {}) {
  return await geminiInstance.generateText(prompt, options);
}

export async function isGeminiAvailable() {
  return await geminiInstance.isAvailable();
}

export async function getGeminiStatus() {
  return await geminiInstance.getStatus();
}

export { GeminiManager };