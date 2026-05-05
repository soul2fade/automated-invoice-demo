import { parse, Allow } from 'partial-json';
import type { Invoice, Trade } from '../types';

type PartialInvoice = Partial<Invoice> & { error?: string };

export function parsePartialInvoice(text: string): PartialInvoice | null {
  if (!text.trim()) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
  }
  if (!cleaned.trim()) return null;
  try {
    const obj = parse(cleaned, Allow.ALL);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return obj as PartialInvoice;
    }
    return null;
  } catch {
    return null;
  }
}

interface StreamRequestCold {
  mode: 'cold';
  trade: Trade;
  description: string;
}

interface StreamRequestDelta {
  mode: 'delta';
  trade: Trade;
  sourceQuote: unknown;
  changes: string;
}

export type StreamRequest = StreamRequestCold | StreamRequestDelta;

export async function* streamInvoice(
  req: StreamRequest,
  signal: AbortSignal
): AsyncGenerator<PartialInvoice, void, void> {
  const resp = await fetch('/api/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });

  if (!resp.ok || !resp.body) {
    throw new Error(`HTTP ${resp.status}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lastYieldedLength = -1;

  const tryYield = function* () {
    if (buffer.length === lastYieldedLength) return;
    const partial = parsePartialInvoice(buffer);
    if (partial) {
      lastYieldedLength = buffer.length;
      yield partial;
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    yield* tryYield();
  }

  buffer += decoder.decode();
  yield* tryYield();
}
