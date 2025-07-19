# RAG: Natural Language Querying for Multi-Ecommerce Platforms

This project implements a **Retrieval-Augmented Generation (RAG)** system over multiple e-commerce datasets. It allows users to query complex e-commerce data (orders, products, customers, stores, categories) in **natural language** and get AI-generated answers.

Built with:
- 🧠 LangChain for LLM + RAG orchestration
- 🔥 Pinecone for vector search
- 🪝 Prisma for database ORM (MongoDB support)
- 🤖 LLMs like OpenAI 

---

## ✨ Features

✅ Natural language queries over:
- Orders (`"Which orders were canceled last week?"`)
- Products (`"Show me all Nike shoes under $100."`)
- Customers (`"Find customers from Delhi with pending orders."`)
- Stores & Categories

✅ Embeds and syncs database chunks (orders, products, etc.) into Pinecone

✅ Works with:
- OpenAI (`gpt-4`, `text-embedding


✅ Handles large datasets using chunking and upserting

---

## 🏗 Tech Stack

| Layer           | Tool/Service                     |
|-----------------|-----------------------------------|
| Vector DB       | Pinecone                          |
| Embeddings      | OpenAI    |
| ORM             | Prisma                            |
| Database        | MongoDB                           |
| Framework       | Node.js (ESM) + LangChain         |

