import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
dotenv.config();

export function getGroqLlamaLLM() {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3-70b-8192",
    temperature: 0.2,
    maxTokens: 1024,
  });
}
