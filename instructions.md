# Local LLM Setup Instructions

## Overview
This project now supports local LLM integration with automatic fallback to Groq. The system prioritizes local models for better performance, privacy, and cost efficiency.

## Installation Steps

### 1. Install Ollama
```bash
# Install Ollama (requires sudo)
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Download Recommended Models
```bash
# Primary recommendation - DeepSeek R1 (best for reasoning)
ollama pull deepseek-r1:latest

# Alternative models
ollama pull qwen2.5:72b      # Excellent for structured data
ollama pull llama3.3:70b     # Balanced performance
ollama pull gemma2:27b       # Lighter option
```

### 3. Start Ollama Server
```bash
ollama serve
```

### 4. Configure Environment Variables
Update your `.env` file with these local LLM settings:

```env
# Local LLM Configuration
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-r1:latest
USE_GROQ_FALLBACK=true
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=4096
LLM_TIMEOUT=30000

# Keep existing Groq config as fallback
GROQ_MODEL=llama-3-70b-8192
GROQ_API_KEY=your-groq-api-key
```

### 5. Start Your Application
```bash
npm run dev
```

## Alternative: LM Studio Setup

If you prefer LM Studio over Ollama:

1. Download from [lmstudio.ai](https://lmstudio.ai/)
2. Download compatible models (GGUF format)
3. Start local server
4. Update environment:
   ```env
   LOCAL_LLM_URL=http://localhost:1234
   ```

## Testing the Integration

### Check LLM Status
```bash
curl http://localhost:4000/v1/rag/llm/status
```

### Test RAG Chat
```bash
curl -X POST http://localhost:4000/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "message": "What products do you have?"}'
```

### Switch Models
```bash
curl -X POST http://localhost:4000/v1/rag/llm/switch \
  -H "Content-Type: application/json" \
  -d '{"modelName": "qwen2.5:72b"}'
```

## Model Recommendations for E-commerce RAG

### 1. DeepSeek R1 (Primary Choice)
- **Best for**: Reasoning, decision-making, complex queries
- **Context**: 128K tokens
- **Download**: `ollama pull deepseek-r1:latest`

### 2. Qwen2.5-72B (Structured Data)
- **Best for**: JSON output, multilingual support, coding
- **Languages**: 29+ languages
- **Download**: `ollama pull qwen2.5:72b`

### 3. Llama 3.3-70B (Balanced)
- **Best for**: General conversations, balanced performance
- **Efficiency**: Optimized for consumer hardware
- **Download**: `ollama pull llama3.3:70b`

## Troubleshooting

### Ollama Not Starting
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama service
systemctl restart ollama
```

### Model Download Issues
```bash
# Check available models
ollama list

# Re-download if needed
ollama pull deepseek-r1:latest
```

### Fallback to Groq
- System automatically falls back to Groq if local LLM is unavailable
- Ensure `GROQ_API_KEY` is set in environment
- Check logs for fallback messages

### Memory Requirements
- **DeepSeek R1**: ~40GB RAM recommended
- **Qwen2.5-72B**: ~45GB RAM recommended  
- **Llama 3.3-70B**: ~42GB RAM recommended
- **Gemma2-27B**: ~16GB RAM (lighter option)

## Benefits of Local LLM

1. **Cost Savings**: No API usage fees
2. **Privacy**: Data stays local
3. **Performance**: Lower latency
4. **Control**: Full model control and customization
5. **Reliability**: No external API dependencies

## API Endpoints

- `GET /v1/rag/llm/status` - Check LLM status and available models
- `POST /v1/rag/llm/switch` - Switch to different model
- `POST /v1/rag/chat` - RAG chat with automatic LLM selection

## Architecture Notes

The system uses a smart fallback mechanism:
1. **Primary**: Try local LLM (Ollama/LM Studio)
2. **Fallback**: Use Groq API if local unavailable
3. **Monitoring**: Real-time status checking
4. **Switching**: Dynamic model switching without restart