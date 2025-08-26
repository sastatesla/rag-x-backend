import { PineconeStore } from "@langchain/pinecone";
import pinecone from "../configs/pinecone.js";
import { getGeminiEmbeddings } from "./gemini.js";

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export async function getRetriever() {
  const vectorStore = await PineconeStore.fromExistingIndex(
    getGeminiEmbeddings(),
    { pineconeIndex }
  );
  return vectorStore.asRetriever();
}