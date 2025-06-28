// src/chatwrapper.ts
import {
  AuthType,
  createContentGeneratorConfig,
  createContentGenerator,
} from '@google/gemini-cli-core/dist/src/core/contentGenerator.js';
import 'dotenv/config';

const authType = process.env.AUTH_TYPE ?? 'gemini-api-key';
const authTypeEnum = authType as AuthType;

console.log(`Auth type: ${authType}`);

/* ------------------------------------------------------------------ */
/* 1.  Build the ContentGenerator exactly like the CLI does           */
/* ------------------------------------------------------------------ */
let modelName: string;
const generatorPromise = (async () => {
  // Pass undefined for model so the helper falls back to DEFAULT_GEMINI_MODEL
  const cfg = await createContentGeneratorConfig(
    undefined, // let default model be used
    authTypeEnum
  );
  modelName = cfg.model;           // remember the actual model string
  return await createContentGenerator(cfg);
})();

/* ------------------------------------------------------------------ */
/* 2.  Helpers consumed by server.ts                                   */
/* ------------------------------------------------------------------ */
type GenConfig = Record<string, unknown>;

export async function sendChat({
  contents,
  generationConfig = {},
}: {
  contents: any[];
  generationConfig?: GenConfig;
  tools?: unknown;                // accepted but ignored for now
}) {
  const generator: any = await generatorPromise;
  return await generator.generateContent({
    model: modelName,
    contents,
    config: generationConfig,
  });
}

export async function* sendChatStream({
  contents,
  generationConfig = {},
}: {
  contents: any[];
  generationConfig?: GenConfig;
  tools?: unknown;
}) {
  const generator: any = await generatorPromise;
  const stream = await generator.generateContentStream({
    model: modelName,
    contents,
    config: generationConfig,
  });
  for await (const chunk of stream) yield chunk;
}

/* ------------------------------------------------------------------ */
/* 3.  Minimal stubs so server.ts compiles (extend later)              */
/* ------------------------------------------------------------------ */
export function listModels() {
  return [{ id: modelName }];
}

export async function embed(_input: unknown) {
  throw new Error('Embeddings endpoint not implemented yet.');
}
