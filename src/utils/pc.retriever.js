import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import pinecone from "../configs/pinecone.js";


const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export async function getRetriever() {
  return await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    { pineconeIndex }
  );
}