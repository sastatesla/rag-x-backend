import { ConversationSummaryMemory } from "langchain/memory.js";
import { getGroqLlamaLLM } from "./llm.js";

export default new ConversationSummaryMemory({
  llm: getGroqLlamaLLM(),
  memoryKey: "chat_history",
  inputKey: "question",
});

