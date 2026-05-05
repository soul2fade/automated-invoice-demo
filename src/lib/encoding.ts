import type { Quote, Trade } from '../types';

const VALID_TRADES: Trade[] = ['hvac', 'plumbing', 'electrical', 'roofing'];

export function encodeQuote(quote: Quote): string {
  const json = JSON.stringify(quote);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeQuoteFromFragment(hash: string): Quote | null {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!fragment) return null;
  const params = new URLSearchParams(fragment);
  const encoded = params.get('q');
  if (!encoded) return null;
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (padded.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded + padding)));
    const parsed = JSON.parse(json);
    if (!isValidQuote(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isValidQuote(value: unknown): value is Quote {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.trade !== 'string' || !VALID_TRADES.includes(v.trade as Trade)) return false;
  if (typeof v.quoteNumber !== 'string') return false;
  if (typeof v.summary !== 'string') return false;
  if (!Array.isArray(v.lineItems)) return false;
  if (typeof v.subtotal !== 'number') return false;
  if (typeof v.tax !== 'number') return false;
  if (typeof v.total !== 'number') return false;
  if (!v.contractor || typeof v.contractor !== 'object') return false;
  if (!v.customer || typeof v.customer !== 'object') return false;
  return true;
}
