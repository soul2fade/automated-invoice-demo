import { describe, it, expect } from 'vitest';
import { encodeQuote, decodeQuoteFromFragment, isValidQuote } from '../lib/encoding';
import type { Quote } from '../types';

const sampleQuote: Quote = {
  trade: 'hvac',
  quoteNumber: 'Q-SAMPLE-HVAC',
  dateIssued: '2026-05-04',
  validUntil: '2026-06-03',
  contractor: {
    name: 'Your HVAC Company',
    license: 'CSLB Lic. #SAMPLE',
    address: '1234 Sample St, Sacramento, CA 95814',
    phone: '(916) 555-0100',
    email: 'hello@yourhvac.example',
    website: 'yourhvac.example',
  },
  customer: {
    name: 'Diana Chen',
    address: '4421 J St, Sacramento, CA 95819',
    email: 'diana.chen@example.com',
    phone: '(916) 555-0142',
  },
  summary: 'Replace furnace and AC.',
  lineItems: [{ category: 'labor', description: 'Install', qty: 4, unit: 'hr', unitPrice: 110, total: 440 }],
  subtotal: 440,
  tax: 0,
  total: 440,
  terms: ['Payment due 30 days'],
};

describe('encodeQuote / decodeQuoteFromFragment', () => {
  it('round-trips a quote through encode then decode', () => {
    const encoded = encodeQuote(sampleQuote);
    const url = `https://invoicedemo.netlify.app/#q=${encoded}`;
    const decoded = decodeQuoteFromFragment(new URL(url).hash);
    expect(decoded).toEqual(sampleQuote);
  });

  it('produces base64url-safe output (no +, /, or = chars)', () => {
    const encoded = encodeQuote(sampleQuote);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('returns null for empty hash', () => {
    expect(decodeQuoteFromFragment('')).toBeNull();
    expect(decodeQuoteFromFragment('#')).toBeNull();
  });

  it('returns null when q param is missing', () => {
    expect(decodeQuoteFromFragment('#other=foo')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(decodeQuoteFromFragment('#q=!!!not-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 of non-JSON content', () => {
    const encoded = btoa('hello world').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeQuoteFromFragment(`#q=${encoded}`)).toBeNull();
  });

  it('returns null for valid JSON of wrong shape', () => {
    const encoded = btoa('{"foo": "bar"}').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeQuoteFromFragment(`#q=${encoded}`)).toBeNull();
  });
});

describe('isValidQuote', () => {
  it('accepts a well-formed quote', () => {
    expect(isValidQuote(sampleQuote)).toBe(true);
  });

  it('rejects null/undefined/non-object', () => {
    expect(isValidQuote(null)).toBe(false);
    expect(isValidQuote(undefined)).toBe(false);
    expect(isValidQuote('string')).toBe(false);
    expect(isValidQuote(42)).toBe(false);
    expect(isValidQuote([])).toBe(false);
  });

  it('rejects when required keys are missing', () => {
    const { trade, ...withoutTrade } = sampleQuote;
    expect(isValidQuote(withoutTrade)).toBe(false);
    const { lineItems, ...withoutLineItems } = sampleQuote;
    expect(isValidQuote(withoutLineItems)).toBe(false);
  });

  it('rejects unknown trade values', () => {
    expect(isValidQuote({ ...sampleQuote, trade: 'spaceship' })).toBe(false);
  });

  it('rejects when lineItems is not an array', () => {
    expect(isValidQuote({ ...sampleQuote, lineItems: 'not-an-array' })).toBe(false);
  });
});
