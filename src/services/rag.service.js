import { RetrievalQAChain } from "langchain/chains";
import ConversationSummaryMemory from "../utils/memory.js";
import {getGroqLlamaLLM} from "../utils/llm.js";
import {getRetriever} from "../utils/pc.retriever.js";

class RagChat {
  constructor() {
    this.llm = getGroqLlamaLLM();
    this.memory = ConversationSummaryMemory
  }

  async getRetriever() {
    return await getRetriever();
  }

  async ask(message) {
    const retriever = await this.getRetriever();
    const chain = RetrievalQAChain.fromLLM(
      this.llm,
      retriever,
      { memory: this.memory }
    );
    const response = await chain.call({ question: message });
    return response.text;
  }
}

export default new RagChat();