import http from 'http';
import { sendChat, sendChatStream } from './chatwrapper';
import { mapRequest, mapResponse, mapStreamChunk } from './mapper';

/* ── basic config ─────────────────────────────────────────────────── */
const PORT = Number(process.env.PORT ?? 11434);

/* ── CORS helper ──────────────────────────────────────────────────── */
function allowCors(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

/* ── JSON body helper ─────────────────────────────────────────────── */
function readJSON(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<any | null> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        res.writeHead(400).end(); // malformed JSON
        resolve(null);
      }
    });
  });
}

/* ── server ───────────────────────────────────────────────────────── */
http
  .createServer(async (req, res) => {
    allowCors(res);

    /* -------- pre-flight ---------- */
    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }

    /* -------- /v1/models ---------- */
    if (req.url === '/v1/models') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          data: [
            {
              id: 'gemini-2.5-pro-latest',
              object: 'model',
              owned_by: 'google',
            },
          ],
        }),
      );
      return;
    }

    /* ---- /v1/chat/completions ---- */
    if (req.url === '/v1/chat/completions' && req.method === 'POST') {
      const body = await readJSON(req, res);
      if (!body) return;

      try {
        const { geminiReq, tools } = await mapRequest(body);

        if (body.stream) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });

          for await (const chunk of sendChatStream({ ...geminiReq, tools })) {
            res.write(`data: ${JSON.stringify(mapStreamChunk(chunk))}\n\n`);
          }
          res.end('data: [DONE]\n\n');
        } else {
          const gResp = await sendChat({ ...geminiReq, tools });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mapResponse(gResp)));
        }
      } catch (err: any) {
        console.error('Proxy error ➜', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: err.message } }));
        } else if (!res.writableEnded) {
          res.end();
        }
      }
      return;
    }

    /* ---- anything else ---------- */
    res.writeHead(404).end();
  })
  .listen(PORT, () => console.log(`OpenAI proxy on :${PORT}`));
