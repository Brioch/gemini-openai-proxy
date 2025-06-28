# Gemini ↔︎ OpenAI Proxy

This program is a [Gemini CLI](https://github.com/google-gemini/gemini-cli) wrapper that can serve **Google Gemini 2.5 Pro** (or Flash) through an **OpenAI-compatible API**.
Plug-and-play with clients that already speak OpenAI like SillyTavern, llama.cpp, LangChain, the VS Code *Cline* extension, etc.

---

## Features

| ✔ | Feature | Notes |
|---|---------|-------|
| `/v1/chat/completions` | Non-stream & stream (SSE) | Works with curl, ST, LangChain… |
| Vision support | `image_url` → Gemini `inlineData` | |
| Function / Tool calling | OpenAI “functions” → Gemini Tool Registry | |
| Reasoning / chain-of-thought | Sends `enable_thoughts:true`, streams `<think>` chunks | ST shows grey bubbles |
| 1 M-token context | Proxy auto-lifts Gemini CLI’s default 200 k cap | |
| CORS | Enabled (`*`) by default | Ready for browser apps |

---

## Quick start

### With npm

```bash
git clone https://github.com/Brioch/gemini-openai-proxy
cd gemini-openai-proxy
npm i

# Configure environment variables
cp .env.example .env
# Edit .env file with your configuration

npm start # launch (runs on port 11434 by default)
```

### With Docker

Alternatively, you can use the provided Dockerfile to build a Docker image.

```sh
docker build --tag "gemini-openai-proxy" .

# Run with environment variables
docker run -p 11434:80 \
  -e AUTH_TYPE=gemini-api-key \
  -e GEMINI_API_KEY=your_api_key_here \
  gemini-openai-proxy

# Or use an .env file
docker run -p 11434:80 --env-file .env gemini-openai-proxy
```

## Configuration

### Environment Variables

The proxy supports configuration through environment variables. You can set these in your shell or create a `.env` file in the project root for easier management.

#### Available Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `11434` | Port number for the proxy server |
| `AUTH_TYPE` | `gemini-api-key` | Authentication method: `oauth-personal`, `gemini-api-key`, or `vertex-ai` |
| `GEMINI_API_KEY` | - | Your Gemini API key (required when `AUTH_TYPE=gemini-api-key`) |
| `GOOGLE_CLOUD_PROJECT` | - | Google Cloud Project ID (required for `oauth-personal` and `vertex-ai`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | - | Path to Google credentials JSON file (required for `oauth-personal`) |
| `GOOGLE_CLOUD_LOCATION` | - | Google Cloud Location (required for `vertex-ai`, e.g., `us-central1`) |
| `GOOGLE_GENAI_USE_VERTEXAI` | - | Enable Vertex AI usage (required for `vertex-ai`, set to `true`) |

#### Using .env File

Create a `.env` file in the project root directory. Here are examples for different authentication methods:

**For API Key authentication (recommended for most users):**
```bash
# .env
PORT=11434
AUTH_TYPE=gemini-api-key
GEMINI_API_KEY=your_api_key_here
```

**For OAuth Personal (free access):**
```bash
# .env
PORT=11434
AUTH_TYPE=oauth-personal
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/Users/username/.gemini/oauth_creds.json
```

**For Vertex AI:**
```bash
# .env
PORT=11434
AUTH_TYPE=vertex-ai
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
```

**Note:** The `.env` file is automatically loaded when the application starts. Make sure to add `.env` to your `.gitignore` file to avoid committing sensitive information.

#### Authentication Types

- **`gemini-api-key`** (Recommended):
  - Use a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
  - Requires: `GEMINI_API_KEY`
  - Simplest setup for most users

- **`oauth-personal`** (Free access):
  - Free access to Gemini 2.5 Pro by logging in to a Google account
  - Requires: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS`
  - Need to set up OAuth credentials through Google Cloud Console

- **`vertex-ai`** (Enterprise):
  - Use Google Cloud Vertex AI authentication
  - Requires: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_GENAI_USE_VERTEXAI=true`
  - Uses Application Default Credentials (ADC) for authentication

### Minimal curl test

```bash
curl -X POST http://localhost:11434/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "gemini-2.5-pro-latest",
       "messages":[{"role":"user","content":"Hello Gemini!"}]
     }'
```

### SillyTavern settings

Chat completion
API Base URL http://127.0.0.1:11434/v1

## License

MIT – free for personal & commercial use. Forked from https://huggingface.co/engineofperplexity/gemini-openai-proxy