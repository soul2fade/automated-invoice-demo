import { describe, it, expect } from 'vitest';
import { parsePartialInvoice } from '../lib/streaming';

describe('parsePartialInvoice', () => {
  it('returns null for empty or non-JSON input', () => {
    expect(parsePartialInvoice('')).toBeNull();
    expect(parsePartialInvoice('not json')).toBeNull();
  });

  it('parses a complete JSON object', () => {
    const json = '{"summary": "hello", "lineItems": [], "subtotal": 0, "tax": 0, "total": 0, "terms": [], "status": "unpaid"}';
    const result = parsePartialInvoice(json);
    expect(result?.summary).toBe('hello');
    expect(result?.status).toBe('unpaid');
  });

  it('parses a partial JSON object (missing closing brace)', () => {
    const partial = '{"summary": "hello", "lineItems": [{"description": "labor", "total": 100}';
    const result = parsePartialInvoice(partial);
    expect(result?.summary).toBe('hello');
    expect(result?.lineItems?.[0]?.description).toBe('labor');
  });

  it('returns null on unrecoverable garbage', () => {
    expect(parsePartialInvoice('}}}}}}')).toBeNull();
  });

  it('strips ```json code fences before parsing', () => {
    const fenced = '```json\n{"summary": "hello", "lineItems": []}\n```';
    const result = parsePartialInvoice(fenced);
    expect(result?.summary).toBe('hello');
  });

  it('strips bare ``` code fences before parsing', () => {
    const fenced = '```\n{"summary": "hello"}\n```';
    const result = parsePartialInvoice(fenced);
    expect(result?.summary).toBe('hello');
  });

  it('handles partial input that starts with an open fence and incomplete JSON', () => {
    const partial = '```json\n{"summary": "hel';
    const result = parsePartialInvoice(partial);
    expect(result?.summary).toBe('hel');
  });
});
