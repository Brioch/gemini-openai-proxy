# Gemini ↔︎ OpenAI Proxy

[![Mentioned in Awesome Gemini CLI](https://awesome.re/mentioned-badge.svg)](https://github.com/Piebald-AI/awesome-gemini-cli)

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
npm start # launch (runs on port 11434 by default)
```

### With Docker

Alternatively, you can use the provided Dockerfile to build a Docker image.

```sh
docker build --tag "gemini-openai-proxy" .
docker run -p 11434:80 -e GEMINI_API_KEY gemini-openai-proxy
```

### Optional env vars

```sh
PORT=11434

# can be any of 'oauth-personal', 'gemini-api-key', 'vertex-ai'. Use oauth-personal for free access to Gemini 2.5 Pro by logging in to a Google account.
AUTH_TYPE='gemini-api-key' 

# API key is only used with AUTH_TYPE='gemini-api-key'
GEMINI_API_KEY=

# Use 'gemini-2.5-flash' or 'gemini-2.5-pro'. Leave empty to let CLI choose its default model.
MODEL=
```

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
