import { ChatOpenAI } from "@langchain/openai";
import { getGroqLlamaLLM } from "./llm.js";
import { getGeminiLLM, isGeminiAvailable } from "./gemini.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Local LLM utility supporting multiple local hosting platforms
 * Supports Ollama, LM Studio, and other OpenAI-compatible APIs
 */
class LocalLLMManager {
  constructor() {
    this.config = {
      // Primary LLM preference (gemini > local > groq)
      useGemini: process.env.USE_GEMINI !== "false", // Default to true
      localUrl: process.env.LOCAL_LLM_URL || "http://localhost:11434",
      localModel: process.env.LOCAL_LLM_MODEL || "deepseek-r1:latest",
      
      // Fallback configuration
      useGroqFallback: process.env.USE_GROQ_FALLBACK === "true" || true,
      
      // LLM parameters
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.2,
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 4096,
      
      // Timeout settings
      requestTimeout: parseInt(process.env.LLM_TIMEOUT) || 30000,
    };
  }

  /**
   * Get local LLM instance (Ollama, LM Studio, etc.)
   */
  getLocalLLM() {
    return new ChatOpenAI({
      openAIApiKey: "ollama", // Placeholder - not needed for local
      modelName: this.config.localModel,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      timeout: this.config.requestTimeout,
      configuration: {
        baseURL: `${this.config.localUrl}/v1`,
      },
    });
  }

  /**
   * Get Gemini LLM
   */
  getGeminiLLM() {
    return getGeminiLLM();
  }

  /**
   * Get Groq fallback LLM
   */
  getFallbackLLM() {
    return getGroqLlamaLLM();
  }

  /**
   * Get best available LLM with automatic fallback
   * Priority: Gemini > Local LLM > Groq
   */
  async getBestLLM() {
    // Try Gemini first if enabled
    if (this.config.useGemini) {
      try {
        if (await isGeminiAvailable()) {
          console.log("[LLM] Using Gemini AI");
          return this.getGeminiLLM();
        }
      } catch (error) {
        console.warn(`[LLM] Gemini unavailable: ${error.message}`);
      }
    }

    // Try local LLM second
    try {
      if (await this.isLocalLLMAvailable()) {
        console.log(`[LLM] Using local model: ${this.config.localModel}`);
        return this.getLocalLLM();
      }
    } catch (error) {
      console.warn(`[LLM] Local LLM unavailable: ${error.message}`);
    }

    // Fallback to Groq if configured
    if (this.config.useGroqFallback) {
      console.log("[LLM] Falling back to Groq");
      return this.getFallbackLLM();
    }

    throw new Error("No available LLM found. Check Gemini API key, local LLM setup, or enable Groq fallback.");
  }

  /**
   * Test if local LLM is available
   */
  async isLocalLLMAvailable() {
    try {
      const response = await fetch(`${this.config.localUrl}/api/tags`, {
        method: "GET",
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const modelExists = models.some(model => 
          model.name === this.config.localModel ||
          model.name.startsWith(this.config.localModel.split(':')[0])
        );
        
        if (!modelExists) {
          throw new Error(`Model ${this.config.localModel} not found in local LLM`);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * List available local models
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.config.localUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models || [];
      }
    } catch (error) {
      console.error("[LocalLLM] Failed to fetch models:", error.message);
    }
    return [];
  }

  /**
   * Download a model to local LLM
   */
  async downloadModel(modelName) {
    try {
      console.log(`[LocalLLM] Downloading model: ${modelName}`);
      const response = await fetch(`${this.config.localUrl}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download model: ${response.statusText}`);
      }
      
      console.log(`[LocalLLM] Successfully downloaded: ${modelName}`);
      return true;
    } catch (error) {
      console.error(`[LocalLLM] Failed to download model: ${error.message}`);
      return false;
    }
  }

  /**
   * Get LLM with specific model
   */
  getLLMWithModel(modelName) {
    return new ChatOpenAI({
      openAIApiKey: "ollama",
      modelName: modelName,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      timeout: this.config.requestTimeout,
      configuration: {
        baseURL: `${this.config.localUrl}/v1`,
      },
    });
  }

  /**
   * Switch to a different model
   */
  async switchModel(modelName) {
    // Check if model exists locally
    const models = await this.getAvailableModels();
    const modelExists = models.some(model => 
      model.name === modelName ||
      model.name.startsWith(modelName.split(':')[0])
    );

    if (!modelExists) {
      console.log(`[LocalLLM] Model ${modelName} not found, attempting to download...`);
      const downloaded = await this.downloadModel(modelName);
      if (!downloaded) {
        throw new Error(`Failed to download model: ${modelName}`);
      }
    }

    this.config.localModel = modelName;
    console.log(`[LocalLLM] Switched to model: ${modelName}`);
    return this.getLocalLLM();
  }
}

// Export singleton instance
export default new LocalLLMManager();

// Export convenience functions
export function getLocalLLM() {
  return LocalLLMManager.getLocalLLM();
}

export async function getBestAvailableLLM() {
  return await LocalLLMManager.getBestLLM();
}

export async function switchLLMModel(modelName) {
  return await LocalLLMManager.switchModel(modelName);
}