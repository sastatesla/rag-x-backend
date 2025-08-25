# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development**: `npm run dev` - Start development server with nodemon
- **Production**: `npm start` - Start production server
- **Linting**: `npm run lint` - Run ESLint (via eslint.config.js)
- **Embedding**: `npm run embed` - Run Pinecone embedding utility
- **Database**: `npx prisma generate` - Generate Prisma client after schema changes
- **Database Migration**: `npx prisma db push` - Push schema changes to MongoDB

## Architecture Overview

This is a Node.js Express API with RAG (Retrieval-Augmented Generation) capabilities built for an e-commerce platform. The application uses:

### Core Stack
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Vector Database**: Pinecone for embeddings and similarity search
- **LLM**: Local LLM support (Ollama, LM Studio) with Groq fallback via LangChain integration

### Key Architecture Patterns

**MVC Structure**: Controllers handle HTTP requests, Services contain business logic, Routes define endpoints
- Controllers in `src/controllers/` (auth, rag, role)
- Services in `src/services/` (auth, rag, role) 
- Routes in `src/routes/` with modular structure

**RAG Implementation**: 
- Vector embeddings stored in Pinecone (`src/configs/pinecone.js`)
- Local LLM integration with smart fallback (`src/utils/localLLM.js`)
- Legacy Groq integration (`src/utils/llm.js`)
- RAG chat functionality for e-commerce data queries with model switching

**Security Middleware Stack**:
- XSS sanitization, Helmet security headers, CORS, compression
- JWT-based authentication with role-based permissions
- Rate limiting for auth endpoints in production

**Data Models**: E-commerce entities (Customer, Store, StoreProduct, Order) with MongoDB as primary database

### Environment Configuration
Required environment variables:
- `PINECONE_API_KEY` - Pinecone vector database
- `GROQ_API_KEY` - Groq LLM API (fallback)
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - JWT token signing
- `PORT` - Server port (defaults to 5000)

Local LLM configuration:
- `LOCAL_LLM_URL` - Local LLM API endpoint (default: http://localhost:11434)
- `LOCAL_LLM_MODEL` - Model name (default: deepseek-r1:latest)
- `USE_GROQ_FALLBACK` - Enable Groq fallback (default: true)
- `LLM_TEMPERATURE` - Model temperature (default: 0.2)
- `LLM_MAX_TOKENS` - Max tokens (default: 4096)
- `LLM_TIMEOUT` - Request timeout (default: 30000ms)

### Key Utilities
- `src/utils/logging.js` - Event-based logging system
- `src/utils/ApiResponse.js` & `src/utils/ApiError.js` - Standardized API responses
- `src/utils/rateLimiter.js` - Request rate limiting
- `src/utils/localLLM.js` - Local LLM manager with automatic fallback
- `src/helpers/chunk&upsert.js` - Data chunking for vector embeddings

### Development Notes
- Uses Joi for request validation (`src/validations/`)
- Comprehensive error handling middleware
- Morgan logging with custom configuration
- Prisma schema defines e-commerce data models with MongoDB

## Local LLM Setup

### Installation
1. **Install Ollama** (requires sudo):
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Download recommended models**:
   ```bash
   ollama pull deepseek-r1:latest
   ollama pull qwen2.5:72b
   ollama pull llama3.3:70b
   ```

3. **Start Ollama server**:
   ```bash
   ollama serve
   ```

### Alternative: LM Studio
1. Download from [lmstudio.ai](https://lmstudio.ai/)
2. Configure API endpoint: `http://localhost:1234`
3. Update `LOCAL_LLM_URL` in environment

### API Endpoints
- `GET /v1/rag/llm/status` - Check LLM status and available models
- `POST /v1/rag/llm/switch` - Switch to different model
- `POST /v1/rag/chat` - RAG chat with automatic LLM selection

### Recommended Models for E-commerce RAG
1. **DeepSeek R1** - Best for reasoning and decision-making
2. **Qwen2.5-72B** - Excellent for structured data and JSON output
3. **Llama 3.3-70B** - Balanced performance for general conversations