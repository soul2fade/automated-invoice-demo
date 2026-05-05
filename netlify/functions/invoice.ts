import type { Config, Context } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, type PromptMode } from '../../src/lib/prompts';
import type { Trade } from '../../src/types';

const VALID_TRADES: Trade[] = ['hvac', 'plumbing', 'electrical', 'roofing'];
const VALID_MODES: PromptMode[] = ['cold', 'delta'];
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 4000;
const MAX_DESCRIPTION_CHARS = 4000;
const MAX_CHANGES_CHARS = 2000;
const MAX_SOURCE_QUOTE_CHARS = 8000;
const GENERIC_ERROR_MESSAGE = 'Failed to generate invoice. Please try again.';

interface ColdBody {
  mode: 'cold';
  trade: string;
  description: string;
}

interface DeltaBody {
  mode: 'delta';
  trade: string;
  sourceQuote: unknown;
  changes: string;
}

type RequestBody = Partial<ColdBody> | Partial<DeltaBody>;

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.mode || !VALID_MODES.includes(body.mode as PromptMode)) {
    return new Response(JSON.stringify({ error: 'Bad request: invalid or missing mode' }), { status: 400 });
  }
  if (!body.trade || !VALID_TRADES.includes(body.trade as Trade)) {
    return new Response(JSON.stringify({ error: 'Bad request: invalid or missing trade' }), { status: 400 });
  }

  let userMessage: string;
  if (body.mode === 'cold') {
    const description = (body as ColdBody).description;
    if (!description) {
      return new Response(JSON.stringify({ error: 'Bad request: description required' }), { status: 400 });
    }
    if (description.length > MAX_DESCRIPTION_CHARS) {
      return new Response(JSON.stringify({ error: `Description too long (max ${MAX_DESCRIPTION_CHARS} chars)` }), { status: 400 });
    }
    userMessage = `Trade: ${body.trade}.\n\n<job_description>${description}</job_description>\n\nGenerate an invoice for the above completed ${body.trade} job.`;
  } else {
    const dBody = body as DeltaBody;
    if (!dBody.sourceQuote || typeof dBody.sourceQuote !== 'object') {
      return new Response(JSON.stringify({ error: 'Bad request: sourceQuote required for delta mode' }), { status: 400 });
    }
    const changes = typeof dBody.changes === 'string' ? dBody.changes : '';
    if (changes.length > MAX_CHANGES_CHARS) {
      return new Response(JSON.stringify({ error: `Changes too long (max ${MAX_CHANGES_CHARS} chars)` }), { status: 400 });
    }
    const sourceQuoteJson = JSON.stringify(dBody.sourceQuote);
    if (sourceQuoteJson.length > MAX_SOURCE_QUOTE_CHARS) {
      return new Response(JSON.stringify({ error: 'Source quote too large' }), { status: 400 });
    }
    userMessage = `Trade: ${body.trade}.\n\n<source_quote>${sourceQuoteJson}</source_quote>\n\n<changes>${changes || 'No changes — convert the quote to an invoice as-is.'}</changes>\n\nGenerate an invoice based on the above source quote, applying any changes the user described.`;
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(body.trade as Trade, body.mode as PromptMode);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let hasStreamed = false;
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }, { signal: req.signal });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
            hasStreamed = true;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Anthropic call failed:', message);
        if (!hasStreamed) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: GENERIC_ERROR_MESSAGE })));
        } else {
          controller.error(err);
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
};

export const config: Config = {
  path: '/api/invoice',
};
